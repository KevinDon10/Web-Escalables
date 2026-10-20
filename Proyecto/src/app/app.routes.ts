import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home';
import { AuthPage } from './pages/auth/auth';
import { BookingPage } from './pages/booking/booking';
import { AppointmentsPage } from './pages/appointments/appointments';
import { ProfilePage } from './pages/profile/profile';
import { AdminPage } from './pages/admin/admin';

export const routes: Routes = [
  { path: '', component: HomePage, title: "Barber Kev's | Inicio" },
  { path: 'login', component: AuthPage, data: { mode: 'login' }, title: "Barber Kev's | Iniciar sesión" },
  { path: 'registro', component: AuthPage, data: { mode: 'register' }, title: "Barber Kev's | Crear cuenta" },
  { path: 'agendar', component: BookingPage, title: "Barber Kev's | Agendar cita" },
  { path: 'mis-citas', component: AppointmentsPage, title: "Barber Kev's | Mis citas" },
  { path: 'perfil', component: ProfilePage, title: "Barber Kev's | Mi perfil" },
  { path: 'admin', component: AdminPage, title: "Barber Kev's | Administración" },
  { path: 'admin/:section', component: AdminPage, title: "Barber Kev's | Administración" },
  { path: '**', redirectTo: '' }
];
