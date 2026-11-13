import { rateLimit } from 'express-rate-limit';

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { ok: false, message: 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.', code: 'RATE_LIMITED' }
});
