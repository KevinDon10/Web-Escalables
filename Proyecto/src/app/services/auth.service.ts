import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../interfaces/user.interface';
import { getApiError } from './api-error';

interface ApiResponse<T> {
  ok: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly currentUser = signal<User | null>(null);
  readonly csrfToken = signal('');
  readonly initializationError = signal('');

  async initialize(): Promise<void> {
    try {
      const csrf = await firstValueFrom(this.http.get<ApiResponse<{ token: string }>>(`${environment.apiUrl}/auth/csrf`));
      this.csrfToken.set(csrf.data.token);
      const session = await firstValueFrom(this.http.get<ApiResponse<User | null>>(`${environment.apiUrl}/auth/session`));
      this.currentUser.set(session.data);
    } catch (error) {
      this.initializationError.set(getApiError(error));
    }
  }

  async login(correo: string, password: string): Promise<User> {
    const response = await firstValueFrom(this.http.post<ApiResponse<User>>(`${environment.apiUrl}/auth/login`, { correo, password }));
    this.currentUser.set(response.data);
    return response.data;
  }

  async register(input: {
    nombre: string;
    apellidos: string;
    correo: string;
    telefono: string;
    password: string;
  }): Promise<User> {
    const response = await firstValueFrom(this.http.post<ApiResponse<User>>(`${environment.apiUrl}/auth/register`, input));
    this.currentUser.set(response.data);
    return response.data;
  }

  async updateProfile(input: {
    nombre: string;
    apellidos: string;
    correo: string;
    telefono: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<User> {
    const response = await firstValueFrom(this.http.patch<ApiResponse<User>>(`${environment.apiUrl}/users/me`, input));
    this.currentUser.set(response.data);
    return response.data;
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post<ApiResponse<null>>(`${environment.apiUrl}/auth/logout`, {}));
    this.currentUser.set(null);
  }
}
