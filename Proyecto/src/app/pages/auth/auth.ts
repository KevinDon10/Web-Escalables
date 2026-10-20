import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AuthService } from '../../services/auth.service';

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
  password = '';

  submit(): void {
    if (this.mode() === 'register') {
      this.auth.register(this.nombre, this.apellidos, this.correo);
    } else {
      this.auth.login(this.correo);
    }
    void this.router.navigate(['/mis-citas']);
  }
}
