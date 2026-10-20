export interface User {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  role: 'cliente' | 'admin';
}
