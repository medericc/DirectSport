import { configureStore } from '@reduxjs/toolkit';
import matchReducer from './matchSlice';

const store = configureStore({
  reducer: {
    match: matchReducer,
  },
});

// Type pour le state global (RootState)
export type RootState = ReturnType<typeof store.getState>;
// Type pour le dispatch
export type AppDispatch = typeof store.dispatch;

export default store;
