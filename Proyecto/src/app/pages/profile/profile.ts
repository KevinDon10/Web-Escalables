import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user.interface';
import { getApiError } from '../../services/api-error';

@Component({
  selector: 'app-profile-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfilePage {
  private readonly auth = inject(AuthService);
  profile: User = { id: '', nombre: '', apellidos: '', correo: '', telefono: '', role: 'cliente' };
  currentPassword = '';
  newPassword = '';
  readonly notice = signal('');
  readonly error = signal('');
  readonly saving = signal(false);

  constructor() {
    const user = this.auth.currentUser();
    if (user) this.profile = { ...user };
  }

  async save(): Promise<void> {
    this.notice.set('');
    this.error.set('');
    if ((this.currentPassword && !this.newPassword) || (!this.currentPassword && this.newPassword)) {
      this.error.set('Para cambiar la contraseña, ingresa la contraseña actual y la nueva.');
      return;
    }

    this.saving.set(true);
    try {
      const input = {
        nombre: this.profile.nombre,
        apellidos: this.profile.apellidos,
        correo: this.profile.correo,
        telefono: this.profile.telefono,
        ...(this.currentPassword ? { currentPassword: this.currentPassword, newPassword: this.newPassword } : {})
      };
      this.profile = await this.auth.updateProfile(input);
      this.currentPassword = '';
      this.newPassword = '';
      this.notice.set('Tus datos se actualizaron correctamente.');
    } catch (error) {
      this.error.set(getApiError(error));
    } finally {
      this.saving.set(false);
    }
  }
}
