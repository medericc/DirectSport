import { configureStore } from '@reduxjs/toolkit';
import matchReducer from './matchSlice';

// Création du store Redux
const store = configureStore({
  reducer: {
    match: matchReducer,
  },
});

// Définition des types pour le state global (RootState) et le dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
