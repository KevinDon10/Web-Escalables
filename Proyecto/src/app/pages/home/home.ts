import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BarberDataService } from '../../services/barber-data.service';
import { ServiceCard } from '../../shared/service-card/service-card';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, ServiceCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomePage {
  readonly data = inject(BarberDataService);
}
