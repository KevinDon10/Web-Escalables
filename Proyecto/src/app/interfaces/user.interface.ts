export interface User {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  role: 'cliente' | 'admin';
}
