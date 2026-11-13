import { Router } from 'express';
import type { AppConfig } from '../config/env.ts';
import { createAppointmentsController } from '../controllers/appointments.controller.ts';
import { requireAuth, requireRole } from '../middleware/auth.middleware.ts';

export function createAppointmentsRoutes(config: AppConfig) {
  const router = Router();
  const controller = createAppointmentsController(config);
  router.use(requireAuth(config));
  router.get('/mine', requireRole('cliente'), controller.getMine);
  router.get('/', requireRole('admin'), controller.getAll);
  router.post('/', requireRole('cliente'), controller.create);
  router.patch('/:id', requireRole('cliente'), controller.reschedule);
  router.delete('/:id', requireRole('cliente'), controller.cancelMine);
  router.patch('/:id/status', requireRole('admin'), controller.updateStatus);
  router.patch('/:id/admin', requireRole('admin'), controller.adminReschedule);
  router.delete('/:id/admin', requireRole('admin'), controller.adminCancel);
  return router;
}
