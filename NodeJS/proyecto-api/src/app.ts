import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import type { AppConfig } from './config/env.ts';
import { getConfig } from './config/env.ts';
import { createAppointmentsRoutes } from './routes/appointments.routes.ts';
import { createAuthRoutes } from './routes/auth.routes.ts';
import { createBarbersRoutes } from './routes/barbers.routes.ts';
import { createScheduleRoutes } from './routes/schedule.routes.ts';
import { createServicesRoutes } from './routes/services.routes.ts';
import { createUsersRoutes } from './routes/users.routes.ts';
import { createNotificationsRoutes } from './routes/notifications.routes.ts';
import { createCsrfProtection } from './middleware/csrf.middleware.ts';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.ts';
import { AppError } from './helpers/errors.ts';

export function createApp(config: AppConfig = getConfig()) {
  const app = express();
  const csrf = createCsrfProtection(config);

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || origin === config.FRONTEND_ORIGIN) {
        callback(null, true);
        return;
      }
      callback(new AppError(403, 'Origen no permitido.', 'CORS_ORIGIN_DENIED'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
    maxAge: 86400
  }));
  app.use(express.json({ limit: '32kb' }));
  app.use(cookieParser());
  app.use(csrf.doubleCsrfProtection);

  app.get('/api/health', (_req, res) => res.json({ ok: true, data: { status: 'ok' } }));
  app.use('/api/auth', createAuthRoutes(config, csrf));
  app.use('/api/services', createServicesRoutes(config));
  app.use('/api/barbers', createBarbersRoutes(config));
  app.use('/api/schedule', createScheduleRoutes(config));
  app.use('/api/appointments', createAppointmentsRoutes(config));
  app.use('/api/users', createUsersRoutes(config));
  app.use('/api/notifications', createNotificationsRoutes(config));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
