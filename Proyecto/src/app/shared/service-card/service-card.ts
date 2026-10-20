import { Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { BarberService } from '../../interfaces/service.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-service-card',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './service-card.html',
  styleUrl: './service-card.css'
})
export class ServiceCard {
  @Input({ required: true }) service!: BarberService;
}
