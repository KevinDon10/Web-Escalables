import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeader } from './shared/site-header/site-header';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader],
  template: `
    <app-site-header />
    @if (auth.initializationError()) {
      <p class="api-error" role="alert">{{ auth.initializationError() }}</p>
    }
    <router-outlet />
  `,
  styles: [':host { display: block; min-height: 100vh; } .api-error { position: fixed; z-index: 30; top: 82px; left: 50%; transform: translateX(-50%); width: min(90%, 700px); padding: 12px 16px; border: 1px solid #a34a3c; border-radius: 5px; background: #281714; color: #f0b3a9; font-size: .8rem; }']
})
export class App {
  readonly auth = inject(AuthService);
}
