import mongoose from 'mongoose';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { AppError } from '../helpers/errors.ts';
import { hashPassword, verifyPassword } from '../helpers/password.ts';
import { parseBody } from '../helpers/validation.ts';
import { toUserDto } from '../helpers/user.dto.ts';
import { UserModel } from '../models/user.model.ts';

const profileSchema = z.object({
  nombre: z.string().trim().min(1).max(80).optional(),
  apellidos: z.string().trim().min(1).max(100).optional(),
  correo: z.email().max(254).optional(),
  telefono: z.string().trim().min(7).max(30).optional(),
  currentPassword: z.string().min(1).max(128).optional(),
  newPassword: z.string().min(8).max(128).optional()
}).refine(value => Object.keys(value).length > 0, 'Debes enviar al menos un campo.');

export const getProfile: RequestHandler = async (req, res) => {
  const user = await UserModel.findById(req.user!.id);
  if (!user) throw new AppError(404, 'No se encontró la cuenta.');
  res.json({ ok: true, data: toUserDto(user) });
};

export const updateProfile: RequestHandler = async (req, res) => {
  const input = parseBody(profileSchema, req.body);
  const user = await UserModel.findById(req.user!.id).select('+password');
  if (!user) throw new AppError(404, 'No se encontró la cuenta.');

  const updates: Record<string, unknown> = {};
  for (const field of ['nombre', 'apellidos', 'telefono'] as const) {
    if (input[field] !== undefined) updates[field] = input[field];
  }
  if (input.correo !== undefined) updates['correo'] = input.correo.toLowerCase();
  if (input.newPassword !== undefined) {
    if (!input.currentPassword || !(await verifyPassword(input.currentPassword, user.password))) {
      throw new AppError(400, 'La contraseña actual no es correcta.', 'CURRENT_PASSWORD_INVALID');
    }
    updates['password'] = await hashPassword(input.newPassword);
  } else if (input.currentPassword !== undefined) {
    throw new AppError(400, 'Indica también la nueva contraseña.', 'NEW_PASSWORD_REQUIRED');
  }

  Object.assign(user, updates);
  await user.save();
  res.json({ ok: true, data: toUserDto(user) });
};

export const getClients: RequestHandler = async (_req, res) => {
  const users = await UserModel.find({ role: 'cliente', activo: { $ne: false } }).sort({ createdAt: -1 });
  res.json({ ok: true, data: users.map(user => toUserDto(user)) });
};

export const getUserById: RequestHandler = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params['id'])) throw new AppError(400, 'El identificador no es válido.');
  const user = await UserModel.findById(req.params['id']);
  if (!user) throw new AppError(404, 'No se encontró el usuario.');
  res.json({ ok: true, data: toUserDto(user) });
};

const clientSchema = z.object({
  nombre: z.string().trim().min(1).max(80), apellidos: z.string().trim().min(1).max(100),
  correo: z.email().max(254), telefono: z.string().trim().min(7).max(30),
  password: z.string().min(8).max(128).optional()
});
export const createClient: RequestHandler = async (req, res) => {
  const input = parseBody(clientSchema, req.body);
  if (!input.password) throw new AppError(400, 'La contraseña es obligatoria.');
  const user = await UserModel.create({ ...input, correo: input.correo.toLowerCase(), password: await hashPassword(input.password), role: 'cliente' });
  res.status(201).json({ ok: true, data: toUserDto(user) });
};
export const updateClient: RequestHandler = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params['id'])) throw new AppError(400, 'Identificador inválido.');
  const input = parseBody(clientSchema, req.body);
  const user = await UserModel.findOne({ _id: req.params['id'], role: 'cliente', activo: { $ne: false } });
  if (!user) throw new AppError(404, 'Cliente no encontrado.');
  const { password, ...fields } = input;
  Object.assign(user, fields, { correo: fields.correo.toLowerCase() });
  if (password) user.password = await hashPassword(password);
  await user.save();
  res.json({ ok: true, data: toUserDto(user) });
};
export const deleteClient: RequestHandler = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params['id'])) throw new AppError(400, 'Identificador inválido.');
  const user = await UserModel.findOneAndUpdate({ _id: req.params['id'], role: 'cliente', activo: { $ne: false } }, { activo: false });
  if (!user) throw new AppError(404, 'Cliente no encontrado.');
  res.json({ ok: true, data: null });
};
