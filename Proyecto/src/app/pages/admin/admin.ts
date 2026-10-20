import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { map } from 'rxjs';
import { BarberDataService } from '../../services/barber-data.service';

@Component({
  selector: 'app-admin-page',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminPage {
  readonly data = inject(BarberDataService);
  readonly section = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map(params => params.get('section') ?? 'dashboard')),
    { initialValue: 'dashboard' }
  );
  readonly notice = signal('');
  readonly title = computed(() => ({
    dashboard: 'Resumen general',
    servicios: 'Servicios',
    barberos: 'Barberos',
    citas: 'Citas',
    clientes: 'Clientes'
  }[this.section()] ?? 'Administración'));

  announce(action: string): void {
    this.notice.set(`${action}: esta acción será conectada al backend en la siguiente etapa.`);
  }
}
