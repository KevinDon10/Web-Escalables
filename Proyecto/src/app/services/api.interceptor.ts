import { timeout } from 'rxjs';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const apiInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.apiUrl)) return next(request);

  const auth = inject(AuthService);
  let apiRequest = request.clone({ withCredentials: true });
  const csrfToken = auth.csrfToken();
  if (csrfToken && !SAFE_METHODS.has(request.method)) {
    apiRequest = apiRequest.clone({ setHeaders: { 'X-CSRF-Token': csrfToken } });
  }
  return next(apiRequest).pipe(timeout(15_000));
};
