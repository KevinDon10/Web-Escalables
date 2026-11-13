import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import type { AppConfig } from '../config/env.ts';
import { AppError } from '../helpers/errors.ts';
import { hashPassword, verifyPassword } from '../helpers/password.ts';
import { parseBody } from '../helpers/validation.ts';
import { toUserDto } from '../helpers/user.dto.ts';
import { AUTH_COOKIE, clearAuthCookie, setAuthCookie } from '../middleware/auth.middleware.ts';
import { UserModel } from '../models/user.model.ts';

const registerSchema = z.object({
  nombre: z.string().trim().min(1).max(80),
  apellidos: z.string().trim().min(1).max(100),
  correo: z.email().max(254),
  telefono: z.string().trim().min(7).max(30),
  password: z.string().min(8).max(128)
});

const loginSchema = z.object({
  correo: z.email().max(254),
  password: z.string().min(1).max(128)
});

function createToken(userId: string, config: AppConfig): string {
  return jwt.sign({ sub: userId }, config.JWT_SECRET, { expiresIn: '4h', issuer: 'barber-kevs-api' });
}

export function createAuthController(config: AppConfig) {
  const register: RequestHandler = async (req, res) => {
    const input = parseBody(registerSchema, req.body);
    const user = await UserModel.create({
      ...input,
      correo: input.correo.toLowerCase(),
      password: await hashPassword(input.password),
      role: 'cliente'
    });
    setAuthCookie(res, createToken(user.id, config), config);
    res.status(201).json({ ok: true, data: toUserDto(user) });
  };

  const login: RequestHandler = async (req, res) => {
    const input = parseBody(loginSchema, req.body);
    const user = await UserModel.findOne({ correo: input.correo.toLowerCase() }).select('+password');
    if (!user || user.activo === false || !(await verifyPassword(input.password, user.password))) {
      throw new AppError(401, 'El correo o la contraseña no son correctos.', 'INVALID_CREDENTIALS');
    }
    setAuthCookie(res, createToken(user.id, config), config);
    res.json({ ok: true, data: toUserDto(user) });
  };

  const session: RequestHandler = async (req, res) => {
    const token: unknown = req.cookies?.[AUTH_COOKIE];
    if (typeof token !== 'string') {
      res.json({ ok: true, data: null });
      return;
    }
    let userId: string;
    try {
      const payload = jwt.verify(token, config.JWT_SECRET, { issuer: 'barber-kevs-api' });
      if (typeof payload === 'string' || typeof payload.sub !== 'string') throw new Error('Invalid payload');
      userId = payload.sub;
    } catch {
      clearAuthCookie(res, config);
      res.json({ ok: true, data: null });
      return;
    }
    const user = await UserModel.findById(userId);
    if (!user || user.activo === false) {
      clearAuthCookie(res, config);
      res.json({ ok: true, data: null });
      return;
    }
    res.json({ ok: true, data: toUserDto(user) });
  };

  const logout: RequestHandler = (_req, res) => {
    clearAuthCookie(res, config);
    res.json({ ok: true });
  };

  return { register, login, session, logout };
}
