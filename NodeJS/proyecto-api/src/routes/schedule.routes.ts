import { listBlockedDates, createBlockedDate, updateBlockedDate, deleteBlockedDate } from '../controllers/blocked-dates.controller.ts';
import { Router } from 'express';
import type { AppConfig } from '../config/env.ts';
import { createScheduleController } from '../controllers/schedule.controller.ts';
import { requireAuth, requireRole } from '../middleware/auth.middleware.ts';

export function createScheduleRoutes(config: AppConfig) {
  const router = Router();
  const controller = createScheduleController(config);
  router.get('/blocked-dates', requireAuth(config), requireRole('admin'), listBlockedDates);
  router.post('/blocked-dates', requireAuth(config), requireRole('admin'), createBlockedDate);
  router.patch('/blocked-dates/:id', requireAuth(config), requireRole('admin'), updateBlockedDate);
  router.delete('/blocked-dates/:id', requireAuth(config), requireRole('admin'), deleteBlockedDate);
  router.get('/', controller.getSchedule);
  router.get('/availability', controller.getAvailability);
  router.put('/', requireAuth(config), requireRole('admin'), controller.updateSchedule);
  return router;
}
