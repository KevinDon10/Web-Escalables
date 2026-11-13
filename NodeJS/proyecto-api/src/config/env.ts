import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI es obligatorio'),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:4200'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET debe tener al menos 10 caracteres'),
  CSRF_SECRET: z.string().min(10, 'CSRF_SECRET debe tener al menos 10 caracteres'),
  BUSINESS_TIMEZONE: z.string().default('America/Mexico_City'),
  ADMIN_NAME: z.string().min(1).optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(5).optional()
});

export type AppConfig = z.infer<typeof envSchema>;

export function getConfig(): AppConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const details = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Configuración de entorno inválida: ${details}`);
  }
  return result.data;
}
