export interface Appointment {
  id: number;
  servicio: string;
  barbero: string;
  fecha: string;
  hora: string;
  precio: number;
  estado: 'Confirmada' | 'Pendiente' | 'Completada' | 'Cancelada';
}
