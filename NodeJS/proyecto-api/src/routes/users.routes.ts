import { Router } from 'express';
import type { AppConfig } from '../config/env.ts';
import { createClient, updateClient, deleteClient, getClients, getProfile, getUserById, updateProfile } from '../controllers/users.controller.ts';
import { requireAuth, requireRole } from '../middleware/auth.middleware.ts';

export function createUsersRoutes(config: AppConfig) {
  const router = Router();
  router.use(requireAuth(config));
  router.get('/me', getProfile);
  router.patch('/me', updateProfile);
  router.get('/', requireRole('admin'), getClients);
  router.post('/', requireRole('admin'), createClient);
  router.patch('/:id', requireRole('admin'), updateClient);
  router.delete('/:id', requireRole('admin'), deleteClient);
  router.get('/:id', requireRole('admin'), getUserById);
  return router;
}
