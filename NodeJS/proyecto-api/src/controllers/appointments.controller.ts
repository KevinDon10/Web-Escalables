import { withBookingLocks } from '../services/booking-lock.service.ts';
import mongoose from 'mongoose';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { AppConfig } from '../config/env.ts';
import { AppError } from '../helpers/errors.ts';
import { parseBody } from '../helpers/validation.ts';
import { AppointmentModel } from '../models/appointment.model.ts';
import { BarberModel } from '../models/barber.model.ts';
import { ServiceModel } from '../models/service.model.ts';
import { getAppointmentStart, getAvailableSlots, isWithinChangeWindow } from '../services/schedule.service.ts';

const bookingSchema = z.object({
  servicioId: z.string().min(1),
  barberoId: z.string().min(1),
  fecha: z.iso.date(),
  hora: z.string().regex(/^\d{2}:\d{2}$/),
  notas: z.string().trim().max(500).default('')
});

const rescheduleSchema = bookingSchema.partial().refine(value => Object.keys(value).length > 0, 'Debes enviar los cambios de la cita.');
const statusSchema = z.object({ estado: z.enum(['pendiente', 'confirmada', 'completada', 'cancelada']) });
const activeStatuses = ['pendiente', 'confirmada'];

export function createAppointmentsController(config: AppConfig) {
  const getMine: RequestHandler = async (req, res) => {
    const appointments = await AppointmentModel.find({ clienteId: req.user!.id })
      .sort({ inicio: -1 })
      .populate('servicioId', 'nombre descripcion precio duracion imagen categoria')
      .populate('barberoId', 'nombre especialidad imagen disponible');
    res.json({ ok: true, data: appointments });
  };

  const getAll: RequestHandler = async (req, res) => {
    const filter: Record<string, unknown> = {};
    if (typeof req.query['fecha'] === 'string') filter['fecha'] = req.query['fecha'];
    if (typeof req.query['estado'] === 'string') filter['estado'] = req.query['estado'];
    const appointments = await AppointmentModel.find(filter)
      .sort({ inicio: -1 })
      .populate('clienteId', 'nombre apellidos correo telefono')
      .populate('servicioId', 'nombre descripcion precio duracion imagen categoria')
      .populate('barberoId', 'nombre especialidad imagen disponible');
    res.json({ ok: true, data: appointments });
  };

  const create: RequestHandler = async (req, res) => {
    const input = parseBody(bookingSchema, req.body);
    if (!mongoose.isValidObjectId(input.servicioId) || !mongoose.isValidObjectId(input.barberoId)) {
      throw new AppError(400, 'Selecciona un servicio y barbero válidos.');
    }
    const slots = await getAvailableSlots(config, input);
    if (!slots.includes(input.hora)) {
      throw new AppError(409, 'Ese horario ya no está disponible. Selecciona otro.', 'SLOT_UNAVAILABLE');
    }
    const service = await ServiceModel.findOne({ _id: input.servicioId, activo: true });
    const barber = await BarberModel.findOne({ _id: input.barberoId, disponible: true });
    if (!service || !barber) throw new AppError(404, 'El servicio o barbero ya no está disponible.');

    const start = getAppointmentStart(config, input.fecha, input.hora);
    const appointment = await AppointmentModel.create({
      clienteId: req.user!.id,
      servicioId: service._id,
      barberoId: barber._id,
      fecha: input.fecha,
      hora: input.hora,
      inicio: start.toJSDate(),
      fin: start.plus({ minutes: service.duracion }).toJSDate(),
      precio: service.precio,
      duracion: service.duracion,
      notas: input.notas,
      estado: 'pendiente'
    });
    await appointment.populate([
      { path: 'servicioId', select: 'nombre descripcion precio duracion imagen categoria' },
      { path: 'barberoId', select: 'nombre especialidad imagen disponible' }
    ]);
    res.status(201).json({ ok: true, data: appointment });
  };

  const reschedule: RequestHandler = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params['id'])) throw new AppError(400, 'El identificador de la cita no es válido.');
    const input = parseBody(rescheduleSchema, req.body);
    const appointment = await AppointmentModel.findOne({ _id: req.params['id'], clienteId: req.user!.id });
    if (!appointment) throw new AppError(404, 'No se encontró la cita.', 'APPOINTMENT_NOT_FOUND');
    if (!activeStatuses.includes(appointment.estado)) throw new AppError(400, 'Solo puedes modificar citas pendientes o confirmadas.');
    if (isWithinChangeWindow(getAppointmentStart(config, appointment.fecha, appointment.hora))) {
      throw new AppError(400, 'Los cambios deben realizarse al menos 24 horas antes de la cita.', 'CHANGE_WINDOW_CLOSED');
    }

    const serviceId = input.servicioId ?? appointment.servicioId.toString();
    const barberId = input.barberoId ?? appointment.barberoId.toString();
    const date = input.fecha ?? appointment.fecha;
    const time = input.hora ?? appointment.hora;
    if (!mongoose.isValidObjectId(serviceId) || !mongoose.isValidObjectId(barberId)) {
      throw new AppError(400, 'Selecciona un servicio y barbero válidos.');
    }
    const slots = await getAvailableSlots(config, {
      fecha: date,
      barberoId: barberId,
      servicioId: serviceId,
      excludeAppointmentId: appointment.id
    });
    if (!slots.includes(time)) throw new AppError(409, 'Ese horario ya no está disponible.', 'SLOT_UNAVAILABLE');

    const service = await ServiceModel.findOne({ _id: serviceId, activo: true });
    const barber = await BarberModel.findOne({ _id: barberId, disponible: true });
    if (!service || !barber) throw new AppError(404, 'El servicio o barbero ya no está disponible.');
    const start = getAppointmentStart(config, date, time);
    if (isWithinChangeWindow(start)) {
      throw new AppError(400, 'La nueva cita también debe quedar al menos 24 horas en el futuro.', 'CHANGE_WINDOW_CLOSED');
    }

    appointment.servicioId = service._id;
    appointment.barberoId = barber._id;
    appointment.fecha = date;
    appointment.hora = time;
    appointment.inicio = start.toJSDate();
    appointment.fin = start.plus({ minutes: service.duracion }).toJSDate();
    appointment.precio = service.precio;
    appointment.duracion = service.duracion;
    if (input.notas !== undefined) appointment.notas = input.notas;
    await appointment.save();
    await appointment.populate([
      { path: 'servicioId', select: 'nombre descripcion precio duracion imagen categoria' },
      { path: 'barberoId', select: 'nombre especialidad imagen disponible' }
    ]);
    res.json({ ok: true, data: appointment });
  };

  const cancelMine: RequestHandler = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params['id'])) throw new AppError(400, 'El identificador de la cita no es válido.');
    const appointment = await AppointmentModel.findOne({ _id: req.params['id'], clienteId: req.user!.id });
    if (!appointment) throw new AppError(404, 'No se encontró la cita.', 'APPOINTMENT_NOT_FOUND');
    if (!activeStatuses.includes(appointment.estado)) throw new AppError(400, 'La cita ya no se puede cancelar.');
    if (isWithinChangeWindow(getAppointmentStart(config, appointment.fecha, appointment.hora))) {
      throw new AppError(400, 'La cancelación debe realizarse al menos 24 horas antes de la cita.', 'CHANGE_WINDOW_CLOSED');
    }
    appointment.estado = 'cancelada';
    await appointment.save();
    res.json({ ok: true, data: appointment });
  };

  const updateStatus: RequestHandler = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params['id'])) throw new AppError(400, 'El identificador de la cita no es válido.');
    const { estado } = parseBody(statusSchema, req.body);
    const appointment = await AppointmentModel.findById(req.params['id']);
    if (!appointment) throw new AppError(404, 'No se encontró la cita.', 'APPOINTMENT_NOT_FOUND');
    if (appointment.estado === 'cancelada' && estado !== 'cancelada') {
      throw new AppError(400, 'Una cita cancelada no puede reactivarse.', 'CANCELLED_APPOINTMENT');
    }
    if (appointment.estado === 'completada' && estado !== 'completada') {
      throw new AppError(400, 'Una cita completada no puede cambiar de estado.', 'COMPLETED_APPOINTMENT');
    }
    const previousStatus = appointment.estado;
    appointment.estado = estado;
    if (estado !== previousStatus && (estado === 'cancelada' || estado === 'confirmada')) {
      appointment.notificacionCliente = estado === 'cancelada'
        ? `El administrador canceló tu cita del ${appointment.fecha} a las ${appointment.hora}.`
        : `El administrador confirmó tu cita del ${appointment.fecha} a las ${appointment.hora}.`;
      appointment.notificacionLeida = false;
    }
    await appointment.save();
    res.json({ ok: true, data: appointment });
  };

  const adminReschedule: RequestHandler = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params['id'])) throw new AppError(400, 'El identificador de la cita no es válido.');
    const input = parseBody(rescheduleSchema, req.body);
    const appointment = await AppointmentModel.findById(req.params['id']);
    if (!appointment) throw new AppError(404, 'No se encontró la cita.', 'APPOINTMENT_NOT_FOUND');
    if (!activeStatuses.includes(appointment.estado)) throw new AppError(400, 'Solo puedes modificar citas pendientes o confirmadas.');

    const serviceId = input.servicioId ?? appointment.servicioId.toString();
    const barberId = input.barberoId ?? appointment.barberoId.toString();
    const date = input.fecha ?? appointment.fecha;
    const time = input.hora ?? appointment.hora;
    if (!mongoose.isValidObjectId(serviceId) || !mongoose.isValidObjectId(barberId)) {
      throw new AppError(400, 'Selecciona un servicio y barbero válidos.');
    }
    const slots = await getAvailableSlots(config, {
      fecha: date,
      barberoId: barberId,
      servicioId: serviceId,
      excludeAppointmentId: appointment.id
    });
    if (!slots.includes(time)) throw new AppError(409, 'Ese horario ya no está disponible.', 'SLOT_UNAVAILABLE');

    const service = await ServiceModel.findOne({ _id: serviceId, activo: true });
    const barber = await BarberModel.findOne({ _id: barberId, disponible: true });
    if (!service || !barber) throw new AppError(404, 'El servicio o barbero ya no está disponible.');
    const start = getAppointmentStart(config, date, time);
    appointment.servicioId = service._id;
    appointment.barberoId = barber._id;
    appointment.fecha = date;
    appointment.hora = time;
    appointment.inicio = start.toJSDate();
    appointment.fin = start.plus({ minutes: service.duracion }).toJSDate();
    appointment.precio = service.precio;
    appointment.duracion = service.duracion;
    if (input.notas !== undefined) appointment.notas = input.notas;
    appointment.notificacionCliente = `El administrador modificó tu cita. Nueva fecha: ${appointment.fecha} a las ${appointment.hora}.`;
    appointment.notificacionLeida = false;
    await appointment.save();
    await appointment.populate([
      { path: 'clienteId', select: 'nombre apellidos correo telefono' },
      { path: 'servicioId', select: 'nombre descripcion precio duracion imagen categoria' },
      { path: 'barberoId', select: 'nombre especialidad imagen disponible' }
    ]);
    res.json({ ok: true, data: appointment });
  };

  const adminCancel: RequestHandler = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params['id'])) throw new AppError(400, 'El identificador de la cita no es válido.');
    const appointment = await AppointmentModel.findById(req.params['id']);
    if (!appointment) throw new AppError(404, 'No se encontró la cita.', 'APPOINTMENT_NOT_FOUND');
    if (appointment.estado === 'completada') throw new AppError(400, 'Una cita completada no puede cancelarse.');
    if (appointment.estado === 'cancelada') throw new AppError(400, 'La cita ya está cancelada.');
    appointment.estado = 'cancelada';
    appointment.notificacionCliente = `El administrador canceló tu cita del ${appointment.fecha} a las ${appointment.hora}.`;
    appointment.notificacionLeida = false;
    await appointment.save();
    res.json({ ok: true, data: appointment });
  };

  const locked = (handler: RequestHandler): RequestHandler => async (req, res, next) => {
    let body: unknown;
    let status = 200;
    const buffered = { status(value: number) { status = value; return this; }, json(value: unknown) { body = value; return this; } };
    const run = async () => {
      const input = handler === create ? parseBody(bookingSchema, req.body)
        : handler === reschedule || handler === adminReschedule ? parseBody(rescheduleSchema, req.body) : {};
      const appointment = req.params['id'] ? await AppointmentModel.findById(req.params['id']) : null;
      const target = 'barberoId' in input ? input.barberoId : undefined;
      const keys = [appointment?.barberoId.toString(), target].filter((id): id is string => typeof id === 'string');
      if (keys.some(id => !mongoose.isValidObjectId(id))) throw new AppError(400, 'Selecciona un barbero válido.');
      await withBookingLocks(keys.map(id => `barber:${id}`), async () => {
        await handler(req, buffered as unknown as typeof res, next);
      });
    };
    if (req.params['id']) {
      if (!mongoose.isValidObjectId(req.params['id'])) throw new AppError(400, 'El identificador de la cita no es válido.');
      await withBookingLocks([`appointment:${req.params['id']}`], run);
    } else {
      await run();
    }
    res.status(status).json(body);
  };
  return { getMine, getAll, create: locked(create), reschedule: locked(reschedule), cancelMine: locked(cancelMine), updateStatus: locked(updateStatus), adminReschedule: locked(adminReschedule), adminCancel: locked(adminCancel) };
}
