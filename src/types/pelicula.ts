export type EstadoPelicula = 'Disponible' | 'No disponible';

export interface Pelicula {
  codigo: string;
  nombre: string;
  genero: string;
  duracion: number;
  clasificacion: string;
  salaAsignada: string;
  hora: string;
  precioEntrada: number;
  estado: EstadoPelicula;
}
