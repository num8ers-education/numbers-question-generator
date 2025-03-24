// src/redux/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import appReducer from '../features/app/appSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    // Add more reducers here as you create them
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;