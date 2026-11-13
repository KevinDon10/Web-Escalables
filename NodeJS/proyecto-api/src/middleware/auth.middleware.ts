import type { RequestHandler } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { AppConfig } from '../config/env.ts';
import { AppError } from '../helpers/errors.ts';
import { UserModel, type UserRole } from '../models/user.model.ts';

export const AUTH_COOKIE = 'barber_session';

export function authCookieOptions(config: AppConfig) {
  return {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 4 * 60 * 60 * 1000
  };
}

export function setAuthCookie(res: Parameters<RequestHandler>[1], token: string, config: AppConfig): void {
  res.cookie(AUTH_COOKIE, token, authCookieOptions(config));
}

export function clearAuthCookie(res: Parameters<RequestHandler>[1], config: AppConfig): void {
  res.clearCookie(AUTH_COOKIE, authCookieOptions(config));
}

export function requireAuth(config: AppConfig): RequestHandler {
  return async (req, res, next) => {
    const token: unknown = req.cookies?.[AUTH_COOKIE];
    if (typeof token !== 'string') {
      next(new AppError(401, 'Inicia sesión para continuar.', 'AUTH_REQUIRED'));
      return;
    }

    let payload: JwtPayload;
    try {
      const verified = jwt.verify(token, config.JWT_SECRET, { issuer: 'barber-kevs-api' });
      if (typeof verified === 'string' || typeof verified.sub !== 'string') {
        throw new Error('Token payload inválido');
      }
      payload = verified;
    } catch {
      clearAuthCookie(res, config);
      next(new AppError(401, 'La sesión expiró. Inicia sesión nuevamente.', 'INVALID_SESSION'));
      return;
    }

    const user = await UserModel.findById(payload.sub).select('_id role');
    if (!user || user.activo === false) {
      clearAuthCookie(res, config);
      next(new AppError(401, 'La sesión ya no es válida.', 'INVALID_SESSION'));
      return;
    }

    req.user = { id: user.id, role: user.role as UserRole };
    next();
  };
}

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError(403, 'No tienes permisos para realizar esta acción.', 'FORBIDDEN'));
      return;
    }
    next();
  };
}

export function optionalAuth(config: AppConfig): RequestHandler {
  const required = requireAuth(config);
  return (req, res, next) => {
    if (!req.cookies?.[AUTH_COOKIE]) {
      next();
      return;
    }
    required(req, res, next);
  };
}
