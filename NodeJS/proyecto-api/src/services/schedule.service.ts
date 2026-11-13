import { BlockedDateModel } from '../models/blocked-date.model.ts';
import { DateTime } from 'luxon';
import { AppointmentModel } from '../models/appointment.model.ts';
import { BarberModel } from '../models/barber.model.ts';
import { BusinessSettingsModel, type BusinessSettingsShape } from '../models/business-settings.model.ts';
import { ServiceModel } from '../models/service.model.ts';
import { AppError } from '../helpers/errors.ts';
import type { AppConfig } from '../config/env.ts';

const DEFAULT_WEEKLY_HOURS = Array.from({ length: 7 }, (_, index) => ({
  dia: index + 1,
  abierto: index < 6,
  apertura: '10:00',
  cierre: '20:00'
}));

export async function getBusinessSettings(config: AppConfig): Promise<BusinessSettingsShape> {
  const settings = await BusinessSettingsModel.findOneAndUpdate(
    { clave: 'principal' },
    {
      $setOnInsert: {
        clave: 'principal',
        zonaHoraria: config.BUSINESS_TIMEZONE,
        intervaloMinutos: 60,
        horarioSemanal: DEFAULT_WEEKLY_HOURS,
        fechasBloqueadas: []
      }
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
  return settings;
}

export interface AvailabilityQuery {
  fecha: string;
  barberoId: string;
  servicioId: string;
  excludeAppointmentId?: string;
}

export async function getAvailableSlots(config: AppConfig, input: AvailabilityQuery): Promise<string[]> {
  const settings = await getBusinessSettings(config);
  const date = DateTime.fromISO(input.fecha, { zone: settings.zonaHoraria });
  if (!date.isValid || date.toISODate() !== input.fecha) {
    throw new AppError(400, 'La fecha no es válida.', 'INVALID_DATE');
  }
  if (date.startOf('day') < DateTime.now().setZone(settings.zonaHoraria).startOf('day')) {
    return [];
  }
  if (settings.fechasBloqueadas.some(item => item.fecha === input.fecha) || await BlockedDateModel.exists({ fecha: input.fecha })) {
    return [];
  }

  const hours = settings.horarioSemanal.find(item => item.dia === date.weekday);
  if (!hours?.abierto) return [];

  const service = await ServiceModel.findOne({ _id: input.servicioId, activo: true });
    const barber = await BarberModel.findOne({ _id: input.barberoId, disponible: true });
  if (!service) throw new AppError(404, 'El servicio no está disponible.', 'SERVICE_NOT_FOUND');
  if (!barber) throw new AppError(404, 'El barbero no está disponible.', 'BARBER_NOT_FOUND');

  const opening = DateTime.fromISO(`${input.fecha}T${hours.apertura}`, { zone: settings.zonaHoraria });
  const closing = DateTime.fromISO(`${input.fecha}T${hours.cierre}`, { zone: settings.zonaHoraria });
  if (!opening.isValid || !closing.isValid || closing <= opening) {
    throw new AppError(500, 'El horario de atención configurado no es válido.', 'INVALID_BUSINESS_HOURS');
  }

  const appointments = await AppointmentModel.find({
    barberoId: barber._id,
    fecha: input.fecha,
    estado: { $in: ['pendiente', 'confirmada'] },
    ...(input.excludeAppointmentId ? { _id: { $ne: input.excludeAppointmentId } } : {})
  }).select('inicio fin');

  const now = DateTime.now().setZone(settings.zonaHoraria);
  const slots: string[] = [];
  for (let cursor = opening; cursor.plus({ minutes: service.duracion }) <= closing; cursor = cursor.plus({ minutes: settings.intervaloMinutos })) {
    if (cursor <= now) continue;
    const end = cursor.plus({ minutes: service.duracion });
    const overlaps = appointments.some(appointment =>
      appointment.inicio < end.toJSDate() && appointment.fin > cursor.toJSDate()
    );
    if (!overlaps) slots.push(cursor.toFormat('HH:mm'));
  }
  return slots;
}

export function getAppointmentStart(config: AppConfig, date: string, time: string): DateTime {
  const result = DateTime.fromISO(`${date}T${time}`, { zone: config.BUSINESS_TIMEZONE });
  if (!result.isValid || result.toISODate() !== date || result.toFormat('HH:mm') !== time) {
    throw new AppError(400, 'La fecha o la hora no son válidas.', 'INVALID_DATETIME');
  }
  return result;
}

export function isWithinChangeWindow(start: DateTime): boolean {
  return start.toMillis() - DateTime.now().toMillis() < 24 * 60 * 60 * 1000;
}
