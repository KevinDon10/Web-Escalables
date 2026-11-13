import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { AppError } from '../helpers/errors.ts';

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, 'La ruta solicitada no existe.', 'NOT_FOUND'));
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.status).json({ ok: false, message: error.message, code: error.code });
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({
      ok: false,
      message: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; '),
      code: 'VALIDATION_ERROR'
    });
    return;
  }
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    res.status(400).json({ ok: false, message: 'Los datos enviados no son válidos.', code: 'INVALID_DATA' });
    return;
  }
  if (error && typeof error === 'object' && 'status' in error && error.status === 400 && 'type' in error && error.type === 'entity.parse.failed') {
    res.status(400).json({ ok: false, message: 'El cuerpo de la solicitud no contiene JSON válido.', code: 'INVALID_JSON' });
    return;
  }
  if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
    res.status(409).json({ ok: false, message: 'Ya existe un registro con esos datos.', code: 'DUPLICATE' });
    return;
  }
  if (error && typeof error === 'object' && 'code' in error && error.code === 'EBADCSRFTOKEN') {
    res.status(403).json({ ok: false, message: 'La verificación de seguridad expiró. Recarga la página e inténtalo nuevamente.', code: 'CSRF_INVALID' });
    return;
  }

  console.error(error);
  res.status(500).json({ ok: false, message: 'Ocurrió un error interno.', code: 'INTERNAL_ERROR' });
};
