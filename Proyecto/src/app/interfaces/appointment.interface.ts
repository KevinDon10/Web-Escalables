import { Barber } from './barber.interface';
import { BarberService } from './service.interface';
import { User } from './user.interface';

export interface Appointment {
  _id: string;
  clienteId?: User;
  servicioId: BarberService;
  barberoId: Barber;
  fecha: string;
  hora: string;
  inicio: string;
  fin: string;
  precio: number;
  duracion: number;
  notas: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
}

export interface WeeklyHour {
  dia: number;
  abierto: boolean;
  apertura: string;
  cierre: string;
}

export interface BlockedDate {
  fecha: string;
  motivo: string;
}

export interface BusinessSettings {
  zonaHoraria: string;
  intervaloMinutos: number;
  horarioSemanal: WeeklyHour[];
  fechasBloqueadas: BlockedDate[];
}
