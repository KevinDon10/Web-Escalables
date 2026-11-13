import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BarberDataService } from '../../services/barber-data.service';
import { getApiError } from '../../services/api-error';
import { DateDayPipe, DateMonthPipe } from './date-format.pipe';

@Component({
  selector: 'app-appointments-page',
  imports: [CurrencyPipe, DateDayPipe, DateMonthPipe, RouterLink],
  templateUrl: './appointments.html',
  styleUrl: './appointments.css'
})
export class AppointmentsPage implements OnInit {
  readonly data = inject(BarberDataService);
  activeTab: 'upcoming' | 'history' = 'upcoming';
  readonly notice = signal('');
  readonly error = signal('');
  readonly loading = signal(true);
  readonly cancellingId = signal('');

  async ngOnInit(): Promise<void> {
    try {
      await Promise.all([this.data.loadAppointments(), this.data.loadNotifications()]);
    } catch (error) {
      this.error.set(getApiError(error));
    } finally {
      this.loading.set(false);
    }
  }

  get upcomingAppointments() {
    const now = Date.now();
    return this.data.appointments().filter(item =>
      new Date(item.inicio).getTime() >= now && item.estado !== 'cancelada'
    );
  }

  get pastAppointments() {
    const now = Date.now();
    return this.data.appointments().filter(item =>
      new Date(item.inicio).getTime() < now || item.estado === 'cancelada'
    );
  }

  canChange(start: string): boolean {
    return new Date(start).getTime() - Date.now() >= 24 * 60 * 60 * 1000;
  }

  async cancel(id: string): Promise<void> {
    if (!window.confirm('¿Quieres cancelar esta cita?')) return;
    this.cancellingId.set(id);
    this.error.set('');
    try {
      await this.data.cancelAppointment(id);
      this.notice.set('La cita se canceló correctamente.');
    } catch (error) {
      this.error.set(getApiError(error));
    } finally {
      this.cancellingId.set('');
    }
  }

  async dismissNotification(id: string): Promise<void> {
    try {
      await this.data.markNotificationRead(id);
    } catch (error) {
      this.error.set(getApiError(error));
    }
  }
}
