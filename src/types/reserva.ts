import type { Asiento } from './asiento';

export interface Reserva {
  id: string;
  nombreCliente?: string;
  peliculaId: string;
  salaId: string;
  funcion: string;
  asientosSeleccionados: Asiento[];
  totalPago: number;
}
