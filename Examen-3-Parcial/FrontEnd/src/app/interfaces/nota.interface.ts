export interface Nota {
  _id: string;
  titulo: string;
  contenido: string;
}

export type NuevaNota = Pick<Nota, 'titulo' | 'contenido'>;
