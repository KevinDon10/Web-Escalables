import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Appointment, BusinessSettings } from '../interfaces/appointment.interface';
import { Barber } from '../interfaces/barber.interface';
import { BarberService } from '../interfaces/service.interface';
import { User } from '../interfaces/user.interface';
import { Notification } from '../interfaces/notification.interface';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  ok: boolean;
  data: T;
}

export type ServiceInput = Omit<BarberService, '_id'>;
export type BarberInput = Omit<Barber, '_id'>;

@Injectable({ providedIn: 'root' })
export class BarberDataService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  readonly services = signal<BarberService[]>([]);
  readonly barbers = signal<Barber[]>([]);
  readonly appointments = signal<Appointment[]>([]);
  readonly clients = signal<User[]>([]);
  readonly notifications = signal<Notification[]>([]);
  readonly blockedDates = signal<{ _id: string; fecha: string; motivo: string }[]>([]);
  readonly schedule = signal<BusinessSettings | null>(null);

  async loadServices(includeInactive = false): Promise<void> {
    const params = includeInactive ? new HttpParams().set('all', 'true') : undefined;
    const response = await firstValueFrom(this.http.get<ApiResponse<BarberService[]>>(`${this.apiUrl}/services`, { params }));
    this.services.set(response.data);
  }

  async loadBarbers(includeUnavailable = false): Promise<void> {
    const params = includeUnavailable ? new HttpParams().set('all', 'true') : undefined;
    const response = await firstValueFrom(this.http.get<ApiResponse<Barber[]>>(`${this.apiUrl}/barbers`, { params }));
    this.barbers.set(response.data);
  }

  async loadAppointments(admin = false): Promise<void> {
    const path = admin ? '/appointments' : '/appointments/mine';
    const response = await firstValueFrom(this.http.get<ApiResponse<Appointment[]>>(`${this.apiUrl}${path}`));
    this.appointments.set(response.data);
  }

  async loadClients(): Promise<void> {
    const response = await firstValueFrom(this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/users`));
    this.clients.set(response.data);
  }

  async loadNotifications(): Promise<void> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<Notification[]>>(`${this.apiUrl}/notifications/mine`)
    );
    this.notifications.set(response.data);
  }

  async markNotificationRead(id: string): Promise<void> {
    await firstValueFrom(
      this.http.patch<ApiResponse<Notification>>(`${this.apiUrl}/notifications/${id}/read`, {})
    );
    this.notifications.update(items => items.map(item => item._id === id ? { ...item, leida: true } : item));
  }

  async saveClient(input: { nombre: string; apellidos: string; correo: string; telefono: string; password?: string }, id?: string): Promise<void> {
    await firstValueFrom(id ? this.http.patch(`${this.apiUrl}/users/${id}`, input) : this.http.post(`${this.apiUrl}/users`, input));
    await this.loadClients();
  }
  async deleteClient(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/users/${id}`));
    await this.loadClients();
  }
  async loadBlockedDates(): Promise<void> {
    const response = await firstValueFrom(this.http.get<ApiResponse<{ _id: string; fecha: string; motivo: string }[]>>(`${this.apiUrl}/schedule/blocked-dates`));
    this.blockedDates.set(response.data);
  }
  async saveBlockedDate(input: { fecha: string; motivo: string }, id?: string): Promise<void> {
    await firstValueFrom(id ? this.http.patch(`${this.apiUrl}/schedule/blocked-dates/${id}`, input) : this.http.post(`${this.apiUrl}/schedule/blocked-dates`, input));
    await this.loadBlockedDates();
  }
  async deleteBlockedDate(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/schedule/blocked-dates/${id}`));
    await this.loadBlockedDates();
  }
  async loadSchedule(): Promise<void> {
    const response = await firstValueFrom(this.http.get<ApiResponse<BusinessSettings>>(`${this.apiUrl}/schedule`));
    this.schedule.set(response.data);
  }

  async getAvailability(fecha: string, barberoId: string, servicioId: string, excludeAppointmentId?: string): Promise<string[]> {
    let params = new HttpParams().set('fecha', fecha).set('barberoId', barberoId).set('servicioId', servicioId);
    if (excludeAppointmentId) params = params.set('excludeAppointmentId', excludeAppointmentId);
    const response = await firstValueFrom(
      this.http.get<ApiResponse<{ fecha: string; slots: string[] }>>(`${this.apiUrl}/schedule/availability`, { params })
    );
    return response.data.slots;
  }

  async saveBooking(input: {
    servicioId: string;
    barberoId: string;
    fecha: string;
    hora: string;
    notas: string;
  }, appointmentId?: string): Promise<Appointment> {
    const request = appointmentId
      ? this.http.patch<ApiResponse<Appointment>>(`${this.apiUrl}/appointments/${appointmentId}`, input)
      : this.http.post<ApiResponse<Appointment>>(`${this.apiUrl}/appointments`, input);
    const response = await firstValueFrom(request);
    return response.data;
  }

  async cancelAppointment(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<ApiResponse<Appointment>>(`${this.apiUrl}/appointments/${id}`));
    this.appointments.update(items => items.map(item => item._id === id ? { ...item, estado: 'cancelada' } : item));
  }

  async updateAppointmentStatus(id: string, estado: Appointment['estado']): Promise<void> {
    await firstValueFrom(
      this.http.patch<ApiResponse<Appointment>>(`${this.apiUrl}/appointments/${id}/status`, { estado })
    );
    this.appointments.update(items => items.map(item => item._id === id ? { ...item, estado } : item));
  }

  async rescheduleAdminAppointment(id: string, input: {
    servicioId: string;
    barberoId: string;
    fecha: string;
    hora: string;
    notas: string;
  }): Promise<void> {
    const response = await firstValueFrom(
      this.http.patch<ApiResponse<Appointment>>(`${this.apiUrl}/appointments/${id}/admin`, input)
    );
    this.appointments.update(items => items.map(item => item._id === id ? response.data : item));
  }

  async adminCancelAppointment(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<ApiResponse<Appointment>>(`${this.apiUrl}/appointments/${id}/admin`));
    this.appointments.update(items => items.map(item => item._id === id ? { ...item, estado: 'cancelada' } : item));
  }

  async createService(input: ServiceInput): Promise<void> {
    await firstValueFrom(this.http.post<ApiResponse<BarberService>>(`${this.apiUrl}/services`, input));
    await this.loadServices(true);
  }

  async updateService(id: string, input: Partial<ServiceInput>): Promise<void> {
    await firstValueFrom(this.http.patch<ApiResponse<BarberService>>(`${this.apiUrl}/services/${id}`, input));
    await this.loadServices(true);
  }

  async deleteService(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<ApiResponse<BarberService>>(`${this.apiUrl}/services/${id}`));
    await this.loadServices(true);
  }

  async createBarber(input: BarberInput): Promise<void> {
    await firstValueFrom(this.http.post<ApiResponse<Barber>>(`${this.apiUrl}/barbers`, input));
    await this.loadBarbers(true);
  }

  async updateBarber(id: string, input: Partial<BarberInput>): Promise<void> {
    await firstValueFrom(this.http.patch<ApiResponse<Barber>>(`${this.apiUrl}/barbers/${id}`, input));
    await this.loadBarbers(true);
  }

  async deleteBarber(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<ApiResponse<Barber>>(`${this.apiUrl}/barbers/${id}`));
    await this.loadBarbers(true);
  }

  async saveSchedule(input: Omit<BusinessSettings, 'zonaHoraria'>): Promise<void> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<BusinessSettings>>(`${this.apiUrl}/schedule`, input)
    );
    this.schedule.set(response.data);
  }
}
