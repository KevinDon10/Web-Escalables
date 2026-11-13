import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BarberDataService } from '../../services/barber-data.service';
import { getApiError } from '../../services/api-error';
import { ServiceCard } from '../../shared/service-card/service-card';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, ServiceCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomePage {
  readonly data = inject(BarberDataService);
  readonly error = signal('');

  constructor() {
    void this.data.loadServices().catch(error => this.error.set(getApiError(error)));
  }
}
