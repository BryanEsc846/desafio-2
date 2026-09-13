import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';

import peliculasReducer, { cargarPeliculas, eliminarPelicula } from './slices/peliculasSlice';
import reservasReducer, { cargarHistorial } from './slices/reservasSlice';
import salasReducer, { cargarSalas } from './slices/salasSlice';

const STORAGE_KEYS = {
  peliculas: 'cineapp:peliculas',
  salas: 'cineapp:salas',
  reservas: 'cineapp:reservas',
} as const;

export const store = configureStore({
  reducer: {
    peliculas: peliculasReducer,
    salas: salasReducer,
    reservas: reservasReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

const readStorage = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const persistPeliculas = async (peliculas: RootState['peliculas']['lista']) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.peliculas, JSON.stringify(peliculas));
  } catch {
    // silencioso: no se interrumpe la app si el almacenamiento falla
  }
};

export const eliminarPeliculaPersistida = (codigo: string) => {
  const peliculasActuales = store.getState().peliculas.lista;
  const siguienteLista = peliculasActuales.filter((pelicula) => pelicula.codigo !== codigo);

  store.dispatch(eliminarPelicula(codigo));
  void persistPeliculas(siguienteLista);
};

const writeStorage = async (state: RootState) => {
  try {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.peliculas, JSON.stringify(state.peliculas.lista)),
      AsyncStorage.setItem(STORAGE_KEYS.salas, JSON.stringify(state.salas.lista)),
      AsyncStorage.setItem(STORAGE_KEYS.reservas, JSON.stringify(state.reservas.historial)),
    ]);
  } catch {
    // silencioso: no se interrumpe la app si el almacenamiento falla
  }
};

export const hydrateStore = async () => {
  const [peliculas, salas, reservas] = await Promise.all([
    readStorage(STORAGE_KEYS.peliculas, []),
    readStorage(STORAGE_KEYS.salas, [
      { id: '1', nombre: 'Sala 1', asientos: Array.from({ length: 25 }, (_, index) => ({ id: `${String.fromCharCode(65 + Math.floor(index / 5))}${(index % 5) + 1}`, estado: 'Disponible' as const })) },
      { id: '2', nombre: 'Sala 2', asientos: Array.from({ length: 25 }, (_, index) => ({ id: `${String.fromCharCode(65 + Math.floor(index / 5))}${(index % 5) + 1}`, estado: 'Disponible' as const })) },
      { id: '3', nombre: 'Sala VIP', asientos: Array.from({ length: 25 }, (_, index) => ({ id: `${String.fromCharCode(65 + Math.floor(index / 5))}${(index % 5) + 1}`, estado: 'Disponible' as const })) },
    ]),
    readStorage(STORAGE_KEYS.reservas, []),
  ]);

  store.dispatch(cargarPeliculas(peliculas));
  store.dispatch(cargarSalas(salas));
  store.dispatch(cargarHistorial(reservas));
};

store.subscribe(() => {
  void writeStorage(store.getState());
});
