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

let isHydrating = false;
let persistenceQueue: Promise<void> = Promise.resolve();
let hydrationPromise: Promise<void> | null = null;

const readStorage = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch (error) {
    console.error(`No se pudo leer ${key} desde AsyncStorage.`, error);
    return fallback;
  }
};

export const persistPeliculas = async (peliculas: RootState['peliculas']['lista']) => {
  await persistState({ ...store.getState(), peliculas: { lista: peliculas } });
};

export const persistCurrentState = async () => {
  await persistState(store.getState());
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
  } catch (error) {
    console.error('No se pudo guardar el estado de CineApp.', error);
  }
};

const persistState = (state: RootState) => {
  persistenceQueue = persistenceQueue.then(() => writeStorage(state));
  return persistenceQueue;
};

export const hydrateStore = () => {
  if (hydrationPromise) {
    return hydrationPromise;
  }

  hydrationPromise = (async () => {
    isHydrating = true;

    try {
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
    } finally {
      isHydrating = false;
      await persistState(store.getState());
    }
  })();

  return hydrationPromise;
};

store.subscribe(() => {
  if (!isHydrating) {
    void persistState(store.getState());
  }
});
