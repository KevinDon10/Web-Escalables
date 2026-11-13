import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { AppConfig } from '../config/env.ts';
import { AppError } from '../helpers/errors.ts';
import { parseBody } from '../helpers/validation.ts';
import { getAvailableSlots, getBusinessSettings } from '../services/schedule.service.ts';
import { BarberModel } from '../models/barber.model.ts';
import { ServiceModel } from '../models/service.model.ts';
import { BusinessSettingsModel } from '../models/business-settings.model.ts';

const weeklyHourSchema = z.object({
  dia: z.number().int().min(1).max(7),
  abierto: z.boolean(),
  apertura: z.string().regex(/^\d{2}:\d{2}$/),
  cierre: z.string().regex(/^\d{2}:\d{2}$/)
}).refine(value => !value.abierto || value.apertura < value.cierre, 'La apertura debe ser anterior al cierre.');

const scheduleSchema = z.object({
  intervaloMinutos: z.number().int().min(15).max(180),
  horarioSemanal: z.array(weeklyHourSchema).length(7),
  fechasBloqueadas: z.array(z.object({
    fecha: z.iso.date(),
    motivo: z.string().trim().max(160).default('')
  })).max(365)
}).refine(value => new Set(value.horarioSemanal.map(item => item.dia)).size === 7, 'Debe haber exactamente un horario por día.');

export function createScheduleController(config: AppConfig) {
  const getSchedule: RequestHandler = async (_req, res) => {
    const settings = await getBusinessSettings(config);
    res.json({ ok: true, data: settings });
  };

  const getAvailability: RequestHandler = async (req, res) => {
    const query = z.object({
      fecha: z.iso.date(),
      barberoId: z.string().min(1),
      servicioId: z.string().min(1),
      excludeAppointmentId: z.string().optional()
    }).parse(req.query);
    if (query.excludeAppointmentId && !/^[a-f\d]{24}$/i.test(query.excludeAppointmentId)) {
      throw new AppError(400, 'El identificador de la cita no es válido.');
    }
    const slots = await getAvailableSlots(config, {
      fecha: query.fecha,
      barberoId: query.barberoId,
      servicioId: query.servicioId,
      ...(query.excludeAppointmentId ? { excludeAppointmentId: query.excludeAppointmentId } : {})
    });
    res.json({ ok: true, data: { fecha: query.fecha, slots } });
  };

  const updateSchedule: RequestHandler = async (req, res) => {
    const input = parseBody(scheduleSchema, req.body);
    if (input.fechasBloqueadas.length) throw new AppError(400, 'Gestiona las fechas mediante el módulo de bloqueos.');
    const dates = input.fechasBloqueadas.map(item => item.fecha);
    if (new Set(dates).size !== dates.length) {
      throw new AppError(400, 'No repitas fechas bloqueadas.', 'DUPLICATE_BLOCKED_DATE');
    }

    const [existingServices, existingBarbers] = await Promise.all([
      ServiceModel.countDocuments({ activo: true }),
      BarberModel.countDocuments({ disponible: true })
    ]);
    if (existingServices === 0 || existingBarbers === 0) {
      throw new AppError(400, 'Agrega al menos un servicio y un barbero antes de habilitar horarios.', 'MISSING_BOOKING_RESOURCES');
    }

    const settings = await BusinessSettingsModel.findOneAndUpdate(
      { clave: 'principal' },
      {
        $set: {
          zonaHoraria: config.BUSINESS_TIMEZONE,
          intervaloMinutos: input.intervaloMinutos,
          horarioSemanal: input.horarioSemanal,
          fechasBloqueadas: input.fechasBloqueadas
        }
      },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ ok: true, data: settings });
  };

  return { getSchedule, getAvailability, updateSchedule };
}
