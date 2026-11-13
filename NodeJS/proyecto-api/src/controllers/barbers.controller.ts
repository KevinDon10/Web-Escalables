import mongoose from 'mongoose';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { AppError } from '../helpers/errors.ts';
import { parseBody } from '../helpers/validation.ts';
import { BarberModel } from '../models/barber.model.ts';

const barberSchema = z.object({
  nombre: z.string().trim().min(1).max(100),
  especialidad: z.string().trim().min(1).max(120),
  imagen: z.string().trim().min(1).max(500),
  disponible: z.boolean().default(true)
});

export const getBarbers: RequestHandler = async (req, res) => {
  const includeUnavailable = req.user?.role === 'admin' && req.query['all'] === 'true';
  const barbers = await BarberModel.find(includeUnavailable ? {} : { disponible: true }).sort({ nombre: 1 });
  res.json({ ok: true, data: barbers });
};

export const createBarber: RequestHandler = async (req, res) => {
  const barber = await BarberModel.create(parseBody(barberSchema, req.body));
  res.status(201).json({ ok: true, data: barber });
};

export const updateBarber: RequestHandler = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params['id'])) throw new AppError(400, 'El identificador del barbero no es válido.');
  const input = parseBody(barberSchema.partial(), req.body);
  const barber = await BarberModel.findByIdAndUpdate(req.params['id'], input, { returnDocument: 'after', runValidators: true });
  if (!barber) throw new AppError(404, 'No se encontró el barbero.', 'BARBER_NOT_FOUND');
  res.json({ ok: true, data: barber });
};

export const deleteBarber: RequestHandler = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params['id'])) throw new AppError(400, 'El identificador del barbero no es válido.');
  const barber = await BarberModel.findByIdAndUpdate(req.params['id'], { disponible: false }, { returnDocument: 'after' });
  if (!barber) throw new AppError(404, 'No se encontró el barbero.', 'BARBER_NOT_FOUND');
  res.json({ ok: true, data: barber });
};
