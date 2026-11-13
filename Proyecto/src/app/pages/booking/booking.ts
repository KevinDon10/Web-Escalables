import { businessDate } from '../../services/business-date';
import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Appointment } from '../../interfaces/appointment.interface';
import { BarberDataService } from '../../services/barber-data.service';
import { getApiError } from '../../services/api-error';

@Component({
  selector: 'app-booking-page',
  imports: [FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class BookingPage implements OnInit {
  readonly data = inject(BarberDataService);
  private readonly route = inject(ActivatedRoute);
  readonly appointmentId = this.route.snapshot.paramMap.get('id');
  selectedServiceId = '';
  selectedBarberId = '';
  fecha = '';
  hora = '';
  notas = '';
  readonly submitted = signal(false);
  readonly saving = signal(false);
  readonly loading = signal(true);
  readonly slotsLoading = signal(false);
  slots: string[] = [];
  readonly error = signal('');
  savedAppointment: Appointment | null = null;
  get minDate() { return businessDate(this.data.schedule()?.zonaHoraria ?? 'America/Mexico_City'); }

  get selectedService() {
    return this.data.services().find(item => item._id === this.selectedServiceId);
  }

  get selectedBarber() {
    return this.data.barbers().find(item => item._id === this.selectedBarberId);
  }

  imageUrl(path: string): string {
    return path.startsWith('http') || path.startsWith('/') ? path : `/img/${path}`;
  }

  async ngOnInit(): Promise<void> {
    try {
      await Promise.all([
        this.data.loadServices(),
        this.data.loadBarbers(),
        this.data.loadSchedule(),
        ...(this.appointmentId ? [this.data.loadAppointments()] : [])
      ]);
      if (this.appointmentId) {
        const appointment = this.data.appointments().find(item => item._id === this.appointmentId);
        if (!appointment) {
          this.error.set('No se encontró la cita que quieres modificar.');
          return;
        }
        this.selectedServiceId = appointment.servicioId._id;
        this.selectedBarberId = appointment.barberoId._id;
        this.fecha = appointment.fecha;
        this.hora = appointment.hora;
        this.notas = appointment.notas;
      } else {
        this.selectedServiceId = this.data.services()[0]?._id ?? '';
        this.selectedBarberId = this.data.barbers()[0]?._id ?? '';
      }
      await this.refreshAvailability(false);
    } catch (error) {
      this.error.set(getApiError(error));
    } finally {
      this.loading.set(false);
    }
  }

  async refreshAvailability(clearTime = true): Promise<void> {
    if (clearTime) this.hora = '';
    if (!this.fecha || !this.selectedServiceId || !this.selectedBarberId) {
      this.slots = [];
      return;
    }
    this.slotsLoading.set(true);
    try {
      this.slots = await this.data.getAvailability(
        this.fecha,
        this.selectedBarberId,
        this.selectedServiceId,
        this.appointmentId ?? undefined
      );
      if (this.hora && !this.slots.includes(this.hora)) this.hora = '';
      this.error.set('');
    } catch (error) {
      this.error.set(getApiError(error));
      this.slots = [];
    } finally {
      this.slotsLoading.set(false);
    }
  }

  async submit(): Promise<void> {
    if (!this.selectedServiceId || !this.selectedBarberId || !this.fecha || !this.hora) return;
    this.saving.set(true);
    this.error.set('');
    try {
      this.savedAppointment = await this.data.saveBooking({
        servicioId: this.selectedServiceId,
        barberoId: this.selectedBarberId,
        fecha: this.fecha,
        hora: this.hora,
        notas: this.notas
      }, this.appointmentId ?? undefined);
      this.submitted.set(true);
    } catch (error) {
      await this.refreshAvailability(false);
      this.error.set(getApiError(error));
    } finally {
      this.saving.set(false);
    }
  }
}
