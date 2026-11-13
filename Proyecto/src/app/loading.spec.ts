import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { NEVER, of, TimeoutError } from 'rxjs';
import { AdminPage } from './pages/admin/admin';
import { BookingPage } from './pages/booking/booking';
import { AuthPage } from './pages/auth/auth';
import { HomePage } from './pages/home/home';
import { AuthService } from './services/auth.service';
import { BarberDataService } from './services/barber-data.service';
import { apiInterceptor } from './services/api.interceptor';
import { getApiError } from './services/api-error';
import { HttpRequest } from '@angular/common/http';
import { environment } from '../environments/environment';

function deferred() {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const unavailable = () => new HttpErrorResponse({ status: 0 });

describe('Async page rendering without extra clicks', () => {
  let data: ReturnType<typeof makeData>;
  let auth: { currentUser: ReturnType<typeof signal<null>>; csrfToken: ReturnType<typeof signal<string>>; register: ReturnType<typeof vi.fn>; login: ReturnType<typeof vi.fn> };
  function makeData() {
    return {
      services: signal([]), barbers: signal([]), appointments: signal([]), clients: signal([]), notifications: signal([]), schedule: signal(null),
      loadServices: vi.fn().mockResolvedValue(undefined), loadBarbers: vi.fn().mockResolvedValue(undefined),
      loadAppointments: vi.fn().mockResolvedValue(undefined), loadClients: vi.fn().mockResolvedValue(undefined), loadSchedule: vi.fn().mockResolvedValue(undefined)
    };
  }
  beforeEach(() => {
    data = makeData();
    auth = { currentUser: signal(null), csrfToken: signal(''), register: vi.fn(), login: vi.fn() };
    TestBed.configureTestingModule({ providers: [provideRouter([]),
      { provide: BarberDataService, useValue: data }, { provide: AuthService, useValue: auth },
      { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({})), data: of({ mode: 'register' }), snapshot: { paramMap: convertToParamMap({}), queryParamMap: convertToParamMap({}) } } }
    ] });
  });
  it('removes the admin loading message after the final request resolves', async () => {
    const request = deferred(); data.loadClients.mockReturnValue(request.promise);
    const fixture = TestBed.createComponent(AdminPage);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Cargando información');
    request.resolve();
    await request.promise; await fixture.whenStable();
    await vi.waitFor(() => expect(fixture.nativeElement.textContent).not.toContain('Cargando información'));
    expect(fixture.nativeElement.textContent).toContain('Citas recientes');
  });
  it('shows an admin request failure and exits loading', async () => {
    const request = deferred(); data.loadClients.mockReturnValue(request.promise);
    const fixture = TestBed.createComponent(AdminPage); await fixture.whenStable();
    request.reject(unavailable()); await request.promise.catch(() => {}); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('No se pudo conectar');
    expect(fixture.nativeElement.textContent).not.toContain('Cargando información');
  });
  it('shows booking errors even when services fail to load', async () => {
    const request = deferred(); data.loadServices.mockReturnValue(request.promise);
    const fixture = TestBed.createComponent(BookingPage); await fixture.whenStable();
    request.reject(unavailable()); await request.promise.catch(() => {}); await fixture.whenStable();
    expect(fixture.nativeElement.textContent).not.toContain('Cargando servicios');
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('No se pudo conectar');
  });
  it('renders home loading failures without another event', async () => {
    const request = deferred(); data.loadServices.mockReturnValue(request.promise);
    const fixture = TestBed.createComponent(HomePage); await fixture.whenStable();
    request.reject(unavailable()); await request.promise.catch(() => {}); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('No se pudo conectar');
  });
  it('shows registration errors, restores the button and prevents duplicate submits', async () => {
    const request = deferred(); auth.register.mockReturnValue(request.promise);
    const fixture = TestBed.createComponent(AuthPage); await fixture.whenStable();
    fixture.componentInstance.password = fixture.componentInstance.confirmPassword = 'Password123!';
    const first = fixture.componentInstance.submit(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[type="submit"]').disabled).toBe(true);
    await fixture.componentInstance.submit(); expect(auth.register).toHaveBeenCalledTimes(1);
    request.reject(unavailable()); await first; await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[type="submit"]').disabled).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('No se pudo conectar');
  });
  it('limits a stalled API request to 15 seconds and provides a readable error', async () => {
    vi.useFakeTimers();
    try {
      let failure: unknown;
      const subscription = TestBed.runInInjectionContext(() => apiInterceptor(new HttpRequest('GET', `${environment.apiUrl}/services`), () => NEVER)).subscribe({ error: error => failure = error });
      await vi.advanceTimersByTimeAsync(15_000);
      expect(failure).toBeInstanceOf(TimeoutError);
      expect(getApiError(failure)).toContain('tardó demasiado');
      subscription.unsubscribe();
    } finally { vi.useRealTimers(); }
  });
});
