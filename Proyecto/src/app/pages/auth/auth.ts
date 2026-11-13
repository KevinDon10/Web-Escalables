import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { getApiError } from '../../services/api-error';

@Component({
  selector: 'app-auth-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  readonly mode = toSignal(
    this.route.data.pipe(map(data => data['mode'] as 'login' | 'register')),
    { initialValue: 'login' }
  );
  nombre = '';
  apellidos = '';
  correo = '';
  telefono = '';
  password = '';
  confirmPassword = '';
  readonly error = signal('');
  readonly busy = signal(false);

  async submit(): Promise<void> {
    if (this.busy()) return;
    this.error.set('');
    if (this.mode() === 'register' && this.password !== this.confirmPassword) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }
    this.busy.set(true);
    try {
      const user = this.mode() === 'register'
        ? await this.register()
        : await this.auth.login(this.correo, this.password);
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      const safeReturnUrl = returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : null;
      const destination = user.role === 'admin' ? (safeReturnUrl ?? '/admin') : (safeReturnUrl ?? '/mis-citas');
      await this.router.navigateByUrl(destination);
    } catch (error) {
      this.error.set(getApiError(error));
    } finally {
      this.busy.set(false);
    }
  }

  private register() {
    return this.auth.register({
      nombre: this.nombre,
      apellidos: this.apellidos,
      correo: this.correo,
      telefono: this.telefono,
      password: this.password
    });
  }
}
