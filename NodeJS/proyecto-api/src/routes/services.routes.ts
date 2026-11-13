import { Router } from 'express';
import type { AppConfig } from '../config/env.ts';
import { createService, deleteService, getServices, updateService } from '../controllers/services.controller.ts';
import { optionalAuth, requireAuth, requireRole } from '../middleware/auth.middleware.ts';

export function createServicesRoutes(config: AppConfig) {
  const router = Router();
  router.get('/', optionalAuth(config), getServices);
  router.get('/manage', requireAuth(config), requireRole('admin'), getServices);
  router.post('/', requireAuth(config), requireRole('admin'), createService);
  router.patch('/:id', requireAuth(config), requireRole('admin'), updateService);
  router.delete('/:id', requireAuth(config), requireRole('admin'), deleteService);
  return router;
}
