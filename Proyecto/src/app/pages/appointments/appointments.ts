import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BarberDataService } from '../../services/barber-data.service';
import { DateDayPipe, DateMonthPipe } from './date-format.pipe';

@Component({
  selector: 'app-appointments-page',
  imports: [CurrencyPipe, DateDayPipe, DateMonthPipe, RouterLink],
  templateUrl: './appointments.html',
  styleUrl: './appointments.css'
})
export class AppointmentsPage {
  readonly data = inject(BarberDataService);
  activeTab: 'upcoming' | 'history' = 'upcoming';
  notice = '';

  get upcomingAppointments() {
    const today = new Date().toLocaleDateString('en-CA');
    return this.data.appointments().filter(item => item.fecha >= today && item.estado !== 'Cancelada');
  }

  get pastAppointments() {
    const today = new Date().toLocaleDateString('en-CA');
    return this.data.appointments().filter(item => item.fecha < today || item.estado === 'Cancelada');
  }

  cancel(id: number): void {
    this.data.cancelAppointment(id);
    this.notice = 'La cita se canceló correctamente.';
  }
}
