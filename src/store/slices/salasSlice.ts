import type { Asiento, EstadoAsiento } from '@/types/asiento';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Sala {
  id: string;
  nombre: string;
  asientos: Asiento[];
}

interface SalasState {
  lista: Sala[];
}

const generarAsientosDefault = (): Asiento[] => {
  const filas = ['A', 'B', 'C', 'D', 'E'];
  const asientos: Asiento[] = [];

  filas.forEach((fila) => {
    for (let i = 1; i <= 5; i += 1) {
      asientos.push({ id: `${fila}${i}`, estado: 'Disponible' });
    }
  });

  return asientos;
};

const initialState: SalasState = {
  lista: [
    { id: '1', nombre: 'Sala 1', asientos: generarAsientosDefault() },
    { id: '2', nombre: 'Sala 2', asientos: generarAsientosDefault() },
    { id: '3', nombre: 'Sala VIP', asientos: generarAsientosDefault() },
  ],
};

export const salasSlice = createSlice({
  name: 'salas',
  initialState,
  reducers: {
    actualizarEstadoAsiento: (
      state,
      action: PayloadAction<{ salaId: string; asientoId: string; nuevoEstado: EstadoAsiento }>,
    ) => {
      const sala = state.lista.find((s) => s.id === action.payload.salaId);
      if (!sala) return;

      const asiento = sala.asientos.find((a) => a.id === action.payload.asientoId);
      if (asiento) {
        asiento.estado = action.payload.nuevoEstado;
      }
    },
    limpiarAsientosReservados: (state, action: PayloadAction<string>) => {
      const sala = state.lista.find((s) => s.id === action.payload);
      if (!sala) return;

      sala.asientos.forEach((asiento) => {
        if (asiento.estado === 'Reservado') {
          asiento.estado = 'Disponible';
        }
      });
    },
  },
});

export const { actualizarEstadoAsiento, limpiarAsientosReservados } = salasSlice.actions;

export default salasSlice.reducer;
