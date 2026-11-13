import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css'
})
export class SiteHeader {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  menuOpen = false;
  logoutError = '';

  async logout(): Promise<void> {
    try {
      await this.auth.logout();
      this.menuOpen = false;
      void this.router.navigate(['/']);
    } catch {
      this.logoutError = 'No se pudo cerrar la sesión. Inténtalo nuevamente.';
    }
  }
}
