import type { Pelicula } from '@/types/pelicula';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PeliculasState {
  lista: Pelicula[];
}

const initialState: PeliculasState = {
  lista: [
    {
      codigo: 'PEL-01',
      nombre: 'Dune: Parte Dos',
      genero: 'Ciencia Ficción',
      duracion: 166,
      clasificacion: 'B',
      salaAsignada: '1',
      hora: '19:00',
      precioEntrada: 9.5,
      estado: 'Disponible',
    },
    {
      codigo: 'PEL-02',
      nombre: 'Kung Fu Panda 4',
      genero: 'Animación',
      duracion: 94,
      clasificacion: 'A',
      salaAsignada: '2',
      hora: '21:30',
      precioEntrada: 7.0,
      estado: 'Disponible',
    },
    {
      codigo: 'PEL-03',
      nombre: 'The Batman',
      genero: 'Acción',
      duracion: 176,
      clasificacion: 'C',
      salaAsignada: '3',
      hora: '16:30',
      precioEntrada: 10.0,
      estado: 'Disponible',
    },
  ],
};

export const peliculasSlice = createSlice({
  name: 'peliculas',
  initialState,
  reducers: {
    agregarPelicula: (state, action: PayloadAction<Pelicula>) => {
      state.lista.push(action.payload);
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
    editarPelicula: (state, action: PayloadAction<Pelicula>) => {
      state.lista = state.lista.map((p) => (p.codigo === action.payload.codigo ? action.payload : p));
    },
  },
});

export const { agregarPelicula, eliminarPelicula, cambiarEstadoPelicula, editarPelicula } =
  peliculasSlice.actions;

export default peliculasSlice.reducer;
