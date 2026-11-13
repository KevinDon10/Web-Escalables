import type { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { BlockedDateModel } from '../models/blocked-date.model.ts';
import { parseBody } from '../helpers/validation.ts';
import { AppError } from '../helpers/errors.ts';
const schema = z.object({ fecha: z.iso.date(), motivo: z.string().trim().max(160).default('') });
export const listBlockedDates: RequestHandler = async (_req, res) => {
  res.json({ ok: true, data: await BlockedDateModel.find().sort({ fecha: 1 }) });
};
export const createBlockedDate: RequestHandler = async (req, res) => {
  const item = await BlockedDateModel.create(parseBody(schema, req.body));
  res.status(201).json({ ok: true, data: item });
};
export const updateBlockedDate: RequestHandler = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params['id'])) throw new AppError(400, 'Identificador inválido.');
  const item = await BlockedDateModel.findByIdAndUpdate(req.params['id'], parseBody(schema, req.body), { returnDocument: 'after', runValidators: true });
  if (!item) throw new AppError(404, 'Fecha bloqueada no encontrada.');
  res.json({ ok: true, data: item });
};
export const deleteBlockedDate: RequestHandler = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params['id'])) throw new AppError(400, 'Identificador inválido.');
  const item = await BlockedDateModel.findByIdAndDelete(req.params['id']);
  if (!item) throw new AppError(404, 'Fecha bloqueada no encontrada.');
  res.json({ ok: true, data: null });
};
