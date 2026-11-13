import { Router } from 'express';
import type { AppConfig } from '../config/env.ts';
import { createAuthController } from '../controllers/auth.controller.ts';
import type { createCsrfProtection } from '../middleware/csrf.middleware.ts';
import { authRateLimit } from '../middleware/rate-limit.middleware.ts';

export function createAuthRoutes(config: AppConfig, csrf: ReturnType<typeof createCsrfProtection>) {
  const router = Router();
  const controller = createAuthController(config);

  router.get('/csrf', (req, res) => {
    res.json({ ok: true, data: { token: csrf.generateCsrfToken(req, res) } });
  });
  router.post('/register', authRateLimit, controller.register);
  router.post('/login', authRateLimit, controller.login);
  router.get('/session', controller.session);
  router.post('/logout', controller.logout);
  return router;
}
