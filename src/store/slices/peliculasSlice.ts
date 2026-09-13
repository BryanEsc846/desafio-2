import type { Pelicula } from '@/types/pelicula';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PeliculasState {
  lista: Pelicula[];
}

interface EditarPeliculaPayload {
  codigoAnterior: string;
  pelicula: Pelicula;
}

const initialState: PeliculasState = {
  lista: [],
};

export const peliculasSlice = createSlice({
  name: 'peliculas',
  initialState,
  reducers: {
    agregarPelicula: (state, action: PayloadAction<Pelicula>) => {
      state.lista.push(action.payload);
    },
    cargarPeliculas: (state, action: PayloadAction<Pelicula[]>) => {
      state.lista = action.payload;
    },
    eliminarPelicula: (state, action: PayloadAction<string>) => {
      state.lista = state.lista.filter((p) => p.codigo !== action.payload);
    },
    cambiarEstadoPelicula: (state, action: PayloadAction<string>) => {
      const pelicula = state.lista.find((p) => p.codigo === action.payload);
      if (pelicula) {
        pelicula.estado = pelicula.estado === 'Disponible' ? 'No disponible' : 'Disponible';
      }
    },
    editarPelicula: (state, action: PayloadAction<EditarPeliculaPayload>) => {
      const { codigoAnterior, pelicula } = action.payload;
      state.lista = state.lista.map((p) => (p.codigo === codigoAnterior ? pelicula : p));
    },
  },
});

export const { agregarPelicula, cargarPeliculas, eliminarPelicula, cambiarEstadoPelicula, editarPelicula } =
  peliculasSlice.actions;

export default peliculasSlice.reducer;
