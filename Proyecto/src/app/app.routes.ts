import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home';
import { AuthPage } from './pages/auth/auth';
import { BookingPage } from './pages/booking/booking';
import { AppointmentsPage } from './pages/appointments/appointments';
import { ProfilePage } from './pages/profile/profile';
import { AdminPage } from './pages/admin/admin';
import { adminGuard, authGuard, clientGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomePage, title: "Barber Kev's | Inicio" },
  { path: 'login', component: AuthPage, data: { mode: 'login' }, title: "Barber Kev's | Iniciar sesión" },
  { path: 'registro', component: AuthPage, data: { mode: 'register' }, title: "Barber Kev's | Crear cuenta" },
  { path: 'agendar', component: BookingPage, canActivate: [authGuard, clientGuard], title: "Barber Kev's | Agendar cita" },
  { path: 'agendar/:id', component: BookingPage, canActivate: [authGuard, clientGuard], title: "Barber Kev's | Modificar cita" },
  { path: 'mis-citas', component: AppointmentsPage, canActivate: [authGuard, clientGuard], title: "Barber Kev's | Mis citas" },
  { path: 'perfil', component: ProfilePage, canActivate: [authGuard], title: "Barber Kev's | Mi perfil" },
  { path: 'admin', component: AdminPage, canActivate: [authGuard, adminGuard], title: "Barber Kev's | Administración" },
  { path: 'admin/:section', component: AdminPage, canActivate: [authGuard, adminGuard], title: "Barber Kev's | Administración" },
  { path: '**', redirectTo: '' }
];
