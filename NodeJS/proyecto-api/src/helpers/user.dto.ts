export interface UserDto {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  role: 'cliente' | 'admin';
}

interface UserRecord {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  role: 'cliente' | 'admin';
}

export function toUserDto(user: UserRecord): UserDto {
  return {
    id: user.id,
    nombre: user.nombre,
    apellidos: user.apellidos,
    correo: user.correo,
    telefono: user.telefono,
    role: user.role as UserDto['role']
  };
}
