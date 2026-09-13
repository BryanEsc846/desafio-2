import type { Reserva } from '@/types/reserva';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ReservasState {
  historial: Reserva[];
}

const initialState: ReservasState = {
  historial: [],
};

export const reservasSlice = createSlice({
  name: 'reservas',
  initialState,
  reducers: {
    agregarReserva: (state, action: PayloadAction<Reserva>) => {
      state.historial.push(action.payload);
    },
    cargarHistorial: (state, action: PayloadAction<Reserva[]>) => {
      state.historial = action.payload;
    },
  },
});

export const { agregarReserva, cargarHistorial } = reservasSlice.actions;

export default reservasSlice.reducer;
