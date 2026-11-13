import { doubleCsrf } from 'csrf-csrf';
import type { AppConfig } from '../config/env.ts';

export function createCsrfProtection(config: AppConfig) {
  const csrf = doubleCsrf({
    getSecret: () => config.CSRF_SECRET,
    getSessionIdentifier: () => 'barber-kevs-spa',
    cookieName: 'barber_csrf',
    cookieOptions: {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60 * 1000
    },
    getCsrfTokenFromRequest: request => request.headers['x-csrf-token']
  });
  return csrf;
}
