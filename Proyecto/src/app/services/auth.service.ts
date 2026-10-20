import { Injectable, signal } from '@angular/core';
import { User } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<User | null>(null);

  login(correo: string): void {
    this.currentUser.set({
      id: 1,
      nombre: 'Carlos',
      apellidos: 'Mendoza',
      correo,
      telefono: '55 1234 5678',
      role: 'cliente'
    });
  }

  register(nombre: string, apellidos: string, correo: string): void {
    this.currentUser.set({
      id: Date.now(),
      nombre,
      apellidos,
      correo,
      telefono: '',
      role: 'cliente'
    });
  }

  updateProfile(user: User): void {
    this.currentUser.set(user);
  }

  logout(): void {
    this.currentUser.set(null);
  }
}
