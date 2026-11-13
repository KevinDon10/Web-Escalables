import { Router } from 'express';
import type { AppConfig } from '../config/env.ts';
import { getMyNotifications, markNotificationRead } from '../controllers/notifications.controller.ts';
import { requireAuth, requireRole } from '../middleware/auth.middleware.ts';

export function createNotificationsRoutes(config: AppConfig) {
  const router = Router();
  router.use(requireAuth(config), requireRole('cliente'));
  router.get('/mine', getMyNotifications);
  router.patch('/:id/read', markNotificationRead);
  return router;
}
