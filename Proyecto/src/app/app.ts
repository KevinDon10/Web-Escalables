import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeader } from './shared/site-header/site-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader],
  template: `
    <app-site-header />
    <router-outlet />
  `,
  styles: [':host { display: block; min-height: 100vh; }']
})
export class App {}
