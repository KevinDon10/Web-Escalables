import { Injectable, signal } from '@angular/core';
import { Appointment } from '../interfaces/appointment.interface';
import { Barber } from '../interfaces/barber.interface';
import { BarberService } from '../interfaces/service.interface';
import { User } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class BarberDataService {
  readonly services: BarberService[] = [
    { id: 1, nombre: 'Corte clásico', descripcion: 'Un corte preciso y personalizado para un estilo impecable.', precio: 250, duracion: 45, imagen: 'servicio-corte.png', categoria: 'Corte' },
    { id: 2, nombre: 'Arreglo de barba', descripcion: 'Perfilado con navaja, toalla caliente y aceites nutritivos.', precio: 180, duracion: 30, imagen: 'servicio-barba.png', categoria: 'Barba' },
    { id: 3, nombre: 'Corte + barba', descripcion: 'La combinación perfecta para renovar tu look completo.', precio: 380, duracion: 75, imagen: 'servicio-combo.png', categoria: 'Paquete' },
    { id: 4, nombre: 'Tratamiento facial', descripcion: 'Limpieza profunda y cuidado revitalizante para tu piel.', precio: 320, duracion: 50, imagen: 'servicio-Tratamiento-Facial.png', categoria: 'Cuidado' },
    { id: 5, nombre: 'Tinte y estilo', descripcion: 'Color aplicado con precisión para un resultado natural.', precio: 450, duracion: 60, imagen: 'servicio-tinte.png', categoria: 'Color' },
    { id: 6, nombre: 'Experiencia spa', descripcion: 'Un momento de cuidado y relajación de principio a fin.', precio: 520, duracion: 80, imagen: 'servici-spa.png', categoria: 'Cuidado' }
  ];

  readonly barbers: Barber[] = [
    { id: 1, nombre: 'Kevin Ramírez', especialidad: 'Cortes clásicos', disponible: true, imagen: 'https://i.pravatar.cc/120?img=12' },
    { id: 2, nombre: 'Diego Herrera', especialidad: 'Barba y navaja', disponible: true, imagen: 'https://i.pravatar.cc/120?img=13' },
    { id: 3, nombre: 'Andrés Cruz', especialidad: 'Estilo contemporáneo', disponible: true, imagen: 'https://i.pravatar.cc/120?img=14' }
  ];

  readonly appointments = signal<Appointment[]>([
    { id: 1, servicio: 'Corte clásico', barbero: 'Kevin Ramírez', fecha: '2026-10-22', hora: '10:30', precio: 250, estado: 'Confirmada' },
    { id: 2, servicio: 'Arreglo de barba', barbero: 'Diego Herrera', fecha: '2026-10-28', hora: '13:00', precio: 180, estado: 'Pendiente' },
    { id: 3, servicio: 'Corte + barba', barbero: 'Andrés Cruz', fecha: '2026-09-18', hora: '11:00', precio: 380, estado: 'Completada' }
  ]);

  readonly clients: User[] = [
    { id: 1, nombre: 'Carlos', apellidos: 'Mendoza', correo: 'carlos.mendoza@email.com', telefono: '55 1234 5678', role: 'cliente' },
    { id: 2, nombre: 'Sofía', apellidos: 'Reyes', correo: 'sofia.reyes@email.com', telefono: '55 8765 4321', role: 'cliente' },
    { id: 3, nombre: 'Mateo', apellidos: 'López', correo: 'mateo.lopez@email.com', telefono: '55 5678 1234', role: 'cliente' }
  ];

  addAppointment(service: BarberService, barber: Barber, fecha: string, hora: string): void {
    this.appointments.update(items => [
      { id: Date.now(), servicio: service.nombre, barbero: barber.nombre, fecha, hora, precio: service.precio, estado: 'Confirmada' },
      ...items
    ]);
  }

  cancelAppointment(id: number): void {
    this.appointments.update(items =>
      items.map(item => item.id === id ? { ...item, estado: 'Cancelada' } : item)
    );
  }
}
