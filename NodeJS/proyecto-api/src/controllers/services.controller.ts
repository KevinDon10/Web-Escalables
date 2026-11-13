import mongoose from 'mongoose';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { AppError } from '../helpers/errors.ts';
import { parseBody } from '../helpers/validation.ts';
import { ServiceModel } from '../models/service.model.ts';

const serviceSchema = z.object({
  nombre: z.string().trim().min(1).max(100),
  descripcion: z.string().trim().min(1).max(500),
  precio: z.number().finite().min(0),
  duracion: z.number().int().min(15).max(240),
  imagen: z.string().trim().min(1).max(500),
  categoria: z.string().trim().min(1).max(60),
  activo: z.boolean().default(true)
});

export const getServices: RequestHandler = async (req, res) => {
  const includeInactive = req.user?.role === 'admin' && req.query['all'] === 'true';
  const services = await ServiceModel.find(includeInactive ? {} : { activo: true }).sort({ nombre: 1 });
  res.json({ ok: true, data: services });
};

export const createService: RequestHandler = async (req, res) => {
  const input = parseBody(serviceSchema, req.body);
  const service = await ServiceModel.create(input);
  res.status(201).json({ ok: true, data: service });
};

export const updateService: RequestHandler = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params['id'])) throw new AppError(400, 'El identificador del servicio no es válido.');
  const input = parseBody(serviceSchema.partial(), req.body);
  const service = await ServiceModel.findByIdAndUpdate(req.params['id'], input, { returnDocument: 'after', runValidators: true });
  if (!service) throw new AppError(404, 'No se encontró el servicio.', 'SERVICE_NOT_FOUND');
  res.json({ ok: true, data: service });
};

export const deleteService: RequestHandler = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params['id'])) throw new AppError(400, 'El identificador del servicio no es válido.');
  const service = await ServiceModel.findByIdAndUpdate(req.params['id'], { activo: false }, { returnDocument: 'after' });
  if (!service) throw new AppError(404, 'No se encontró el servicio.', 'SERVICE_NOT_FOUND');
  res.json({ ok: true, data: service });
};
