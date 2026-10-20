import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-profile-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfilePage {
  private readonly auth = inject(AuthService);
  profile: User = {
    id: 1, nombre: 'Carlos', apellidos: 'Mendoza',
    correo: 'carlos.mendoza@email.com', telefono: '55 1234 5678', role: 'cliente'
  };
  notice = '';

  constructor() {
    const user = this.auth.currentUser();
    if (user) this.profile = { ...user };
  }

  save(): void {
    this.auth.updateProfile({ ...this.profile });
    this.notice = 'Tus datos se actualizaron correctamente.';
  }
}
