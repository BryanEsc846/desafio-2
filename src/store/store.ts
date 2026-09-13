import { configureStore } from '@reduxjs/toolkit';
import peliculasReducer from './slices/peliculasSlice';
import reservasReducer from './slices/reservasSlice';
import salasReducer from './slices/salasSlice';

export const store = configureStore({
  reducer: {
    peliculas: peliculasReducer,
    salas: salasReducer,
    reservas: reservasReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
