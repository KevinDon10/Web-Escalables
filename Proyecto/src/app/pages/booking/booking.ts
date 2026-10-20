import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BarberDataService } from '../../services/barber-data.service';

@Component({
  selector: 'app-booking-page',
  imports: [FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class BookingPage {
  readonly data = inject(BarberDataService);
  selectedServiceId = 1;
  selectedBarberId = 1;
  fecha = '';
  hora = '';
  notas = '';
  submitted = false;
  readonly minDate = new Date().toLocaleDateString('en-CA');
  readonly timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  get selectedService() {
    return this.data.services.find(item => item.id === Number(this.selectedServiceId));
  }

  get selectedBarber() {
    return this.data.barbers.find(item => item.id === Number(this.selectedBarberId));
  }

  submit(): void {
    const service = this.selectedService;
    const barber = this.selectedBarber;
    if (!service || !barber) return;
    this.data.addAppointment(service, barber, this.fecha, this.hora);
    this.submitted = true;
  }
}
