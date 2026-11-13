import type { ZodType } from 'zod';
import { AppError } from './errors.ts';

export function parseBody<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new AppError(400, result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; '), 'VALIDATION_ERROR');
  }
  return result.data;
}
