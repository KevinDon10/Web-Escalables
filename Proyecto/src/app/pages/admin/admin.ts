import { businessDate } from '../../services/business-date';
import { User } from '../../interfaces/user.interface';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { map } from 'rxjs';
import { Appointment, BusinessSettings } from '../../interfaces/appointment.interface';
import { Barber } from '../../interfaces/barber.interface';
import { BarberDataService, BarberInput, ServiceInput } from '../../services/barber-data.service';
import { BarberService } from '../../interfaces/service.interface';
import { AuthService } from '../../services/auth.service';
import { getApiError } from '../../services/api-error';

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const EMPTY_SERVICE: ServiceInput = {
  nombre: '', descripcion: '', precio: 0, duracion: 30, imagen: '/img/main.png', categoria: 'Corte', activo: true
};
const EMPTY_BARBER: BarberInput = {
  nombre: '', especialidad: '', imagen: 'https://i.pravatar.cc/120?img=12', disponible: true
};

@Component({
  selector: 'app-admin-page',
  imports: [RouterLink, RouterLinkActive, FormsModule, CurrencyPipe],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminPage {
  readonly data = inject(BarberDataService);
  readonly auth = inject(AuthService);
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
    clientes: 'Clientes',
    horarios: 'Horarios'
  }[this.section()] ?? 'Administración'));
  readonly todayAppointments = computed(() => {
    const today = businessDate(this.data.schedule()?.zonaHoraria ?? 'America/Mexico_City');
    return this.data.appointments().filter(item => item.fecha === today);
  });
  readonly dayNames = WEEKDAYS;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');

  serviceForm: ServiceInput = { ...EMPTY_SERVICE };
  editingServiceId = '';
  showServiceForm = false;
  barberForm: BarberInput = { ...EMPTY_BARBER };
  editingBarberId = '';
  showBarberForm = false;
  editingAppointment: Appointment | null = null;
  appointmentForm = { servicioId: '', barberoId: '', fecha: '', hora: '', notas: '' };
  appointmentSlots: string[] = [];
  scheduleForm: Omit<BusinessSettings, 'zonaHoraria'> = {
    intervaloMinutos: 60,
    horarioSemanal: Array.from({ length: 7 }, (_, index) => ({
      dia: index + 1, abierto: index < 6, apertura: '10:00', cierre: '20:00'
    })),
    fechasBloqueadas: []
  };
  editingClientId = '';
  showClientForm = false;
  clientForm = { nombre: '', apellidos: '', correo: '', telefono: '', password: '' };
  editingBlockId = '';
  blockedDate = '';
  blockedReason = '';

  constructor() {
    effect(() => {
      void this.loadSection(this.section());
    });
  }

  private async loadSection(section: string): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      switch (section) {
        case 'dashboard':
          await Promise.all([
            this.data.loadSchedule(), this.data.loadAppointments(true), this.data.loadClients(),
            this.data.loadServices(true), this.data.loadBarbers(true)
          ]);
          break;
        case 'servicios': await this.data.loadServices(true); break;
        case 'barberos': await this.data.loadBarbers(true); break;
        case 'citas': await Promise.all([this.data.loadAppointments(true), this.data.loadServices(), this.data.loadBarbers()]); break;
        case 'clientes': await this.data.loadClients(); break;
        case 'horarios':
          await Promise.all([this.data.loadSchedule(), this.data.loadBlockedDates()]);
          this.applySchedule(this.data.schedule());
          break;
      }
    } catch (error) {
      this.error.set(getApiError(error));
    } finally {
      this.loading.set(false);
    }
  }

  private applySchedule(schedule: BusinessSettings | null): void {
    if (!schedule) return;
    this.scheduleForm = {
      intervaloMinutos: schedule.intervaloMinutos,
      horarioSemanal: schedule.horarioSemanal.map(item => ({ ...item })),
      fechasBloqueadas: schedule.fechasBloqueadas.map(item => ({ ...item }))
    };
  }

  async saveService(): Promise<void> {
    this.error.set('');
    this.saving.set(true);
    try {
      if (this.editingServiceId) await this.data.updateService(this.editingServiceId, this.serviceForm);
      else await this.data.createService(this.serviceForm);
      this.showServiceForm = false;
      this.serviceForm = { ...EMPTY_SERVICE };
      this.editingServiceId = '';
      this.notice.set('El servicio se guardó correctamente.');
    } catch (error) {
      this.error.set(getApiError(error));
    } finally {
      this.saving.set(false);
    }
  }

  editService(service: ServiceInput & { _id: string }): void {
    this.serviceForm = { ...service };
    this.editingServiceId = service._id;
    this.showServiceForm = true;
  }

  newService(): void {
    this.serviceForm = { ...EMPTY_SERVICE };
    this.editingServiceId = '';
    this.showServiceForm = true;
  }

  async removeService(id: string): Promise<void> {
    if (!window.confirm('¿Desactivar este servicio? Las citas existentes conservarán su información.')) return;
    await this.runAction(() => this.data.deleteService(id), 'El servicio se desactivó.');
  }

  async saveBarber(): Promise<void> {
    this.error.set('');
    this.saving.set(true);
    try {
      if (this.editingBarberId) await this.data.updateBarber(this.editingBarberId, this.barberForm);
      else await this.data.createBarber(this.barberForm);
      this.showBarberForm = false;
      this.barberForm = { ...EMPTY_BARBER };
      this.editingBarberId = '';
      this.notice.set('El barbero se guardó correctamente.');
    } catch (error) {
      this.error.set(getApiError(error));
    } finally {
      this.saving.set(false);
    }
  }

  editBarber(barber: BarberInput & { _id: string }): void {
    this.barberForm = { ...barber };
    this.editingBarberId = barber._id;
    this.showBarberForm = true;
  }

  newBarber(): void {
    this.barberForm = { ...EMPTY_BARBER };
    this.editingBarberId = '';
    this.showBarberForm = true;
  }

  async removeBarber(id: string): Promise<void> {
    if (!window.confirm('¿Desactivar este barbero? Las citas existentes conservarán su información.')) return;
    await this.runAction(() => this.data.deleteBarber(id), 'El barbero se desactivó.');
  }

  async saveAppointmentStatus(id: string, estado: Appointment['estado']): Promise<void> {
    await this.runAction(() => this.data.updateAppointmentStatus(id, estado), 'El estado de la cita se actualizó.');
  }

  editAppointment(appointment: Appointment): void {
    this.editingAppointment = appointment;
    this.appointmentForm = {
      servicioId: appointment.servicioId._id,
      barberoId: appointment.barberoId._id,
      fecha: appointment.fecha,
      hora: appointment.hora,
      notas: appointment.notas
    };
    void this.refreshAppointmentSlots();
  }

  async refreshAppointmentSlots(): Promise<void> {
    if (!this.editingAppointment || !this.appointmentForm.fecha || !this.appointmentForm.servicioId || !this.appointmentForm.barberoId) {
      this.appointmentSlots = [];
      return;
    }
    try {
      this.appointmentSlots = await this.data.getAvailability(
        this.appointmentForm.fecha,
        this.appointmentForm.barberoId,
        this.appointmentForm.servicioId,
        this.editingAppointment._id
      );
    } catch (error) {
      this.error.set(getApiError(error));
    }
  }

  async saveAppointment(): Promise<void> {
    if (!this.editingAppointment) return;
    await this.runAction(async () => {
      await this.data.rescheduleAdminAppointment(this.editingAppointment!._id, this.appointmentForm);
      this.editingAppointment = null;
    }, 'La cita se modificó correctamente.');
  }

  async cancelAppointment(id: string): Promise<void> {
    if (!window.confirm('¿Cancelar esta cita?')) return;
    await this.runAction(() => this.data.adminCancelAppointment(id), 'La cita se canceló.');
  }

  newClient(): void {
    this.editingClientId = ''; this.clientForm = { nombre: '', apellidos: '', correo: '', telefono: '', password: '' }; this.showClientForm = true;
  }
  editClient(user: User): void {
    this.editingClientId = user.id;
    this.clientForm = { nombre: user.nombre, apellidos: user.apellidos, correo: user.correo, telefono: user.telefono, password: '' };
    this.showClientForm = true;
  }
  async saveClient(): Promise<void> {
    await this.runAction(async () => {
      const { password, ...fields } = this.clientForm;
      await this.data.saveClient({ ...fields, ...(password ? { password } : {}) }, this.editingClientId || undefined);
      this.showClientForm = false;
    }, 'Cliente guardado.');
  }
  async removeClient(id: string): Promise<void> {
    if (window.confirm('¿Dar de baja esta cuenta? Se conservará su historial y perderá el acceso.'))
      await this.runAction(() => this.data.deleteClient(id), 'Cliente dado de baja.');
  }
  editBlockedDate(item: { _id: string; fecha: string; motivo: string }): void {
    this.editingBlockId = item._id; this.blockedDate = item.fecha; this.blockedReason = item.motivo;
  }
  async addBlockedDate(): Promise<void> {
    if (!this.blockedDate) return;
    await this.runAction(async () => {
      await this.data.saveBlockedDate({ fecha: this.blockedDate, motivo: this.blockedReason.trim() }, this.editingBlockId || undefined);
      this.editingBlockId = ''; this.blockedDate = ''; this.blockedReason = '';
    }, 'Fecha bloqueada guardada.');
  }
  async removeBlockedDate(id: string): Promise<void> {
    if (window.confirm('¿Eliminar este bloqueo y permitir reservas en esa fecha?'))
      await this.runAction(() => this.data.deleteBlockedDate(id), 'Bloqueo eliminado.');
  }

  async saveSchedule(): Promise<void> {
    await this.runAction(() => this.data.saveSchedule(this.scheduleForm), 'El horario se guardó correctamente.');
  }

  isActiveService(service: BarberService): boolean {
    return service.activo;
  }

  isAvailableBarber(barber: Barber): boolean {
    return barber.disponible;
  }

  private async runAction(action: () => Promise<void>, successMessage: string): Promise<void> {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    this.notice.set('');
    try {
      await action();
      this.notice.set(successMessage);
    } catch (error) {
      this.error.set(getApiError(error));
    } finally { this.saving.set(false); }
  }
}
