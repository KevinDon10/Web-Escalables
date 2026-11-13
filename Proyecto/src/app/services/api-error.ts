import { TimeoutError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export function getApiError(error: unknown): string {
  if (error instanceof TimeoutError) return 'El servidor tardó demasiado en responder. Inténtalo nuevamente.';
  if (error instanceof HttpErrorResponse) {
    if (typeof error.error?.message === 'string') return error.error.message;
    if (error.status === 0) return 'No se pudo conectar con el servidor. Verifica que el API esté en ejecución.';
  }
  return 'Ocurrió un error inesperado. Inténtalo nuevamente.';
}
