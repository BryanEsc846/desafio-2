import type { Asiento } from './asiento';

export interface Reserva {
  id: string;
  peliculaId: string;
  salaId: string;
  funcion: string;
  asientosSeleccionados: Asiento[];
  totalPago: number;
}
