import { Router } from 'express';
import type { AppConfig } from '../config/env.ts';
import { createBarber, deleteBarber, getBarbers, updateBarber } from '../controllers/barbers.controller.ts';
import { optionalAuth, requireAuth, requireRole } from '../middleware/auth.middleware.ts';

export function createBarbersRoutes(config: AppConfig) {
  const router = Router();
  router.get('/', optionalAuth(config), getBarbers);
  router.get('/manage', requireAuth(config), requireRole('admin'), getBarbers);
  router.post('/', requireAuth(config), requireRole('admin'), createBarber);
  router.patch('/:id', requireAuth(config), requireRole('admin'), updateBarber);
  router.delete('/:id', requireAuth(config), requireRole('admin'), deleteBarber);
  return router;
}
