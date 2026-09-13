export type EstadoAsiento = 'Disponible' | 'Reservado' | 'Ocupado';

export interface Asiento {
  id: string;
  estado: EstadoAsiento;
}
