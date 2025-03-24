// src/redux/features/app/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state
interface AppState {
  isLoading: boolean;
  theme: 'light' | 'dark';
}

const initialState: AppState = {
  isLoading: false,
  theme: 'light',
};

// Create a slice
export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
  },
});

// Export actions
export const { setLoading, setTheme } = appSlice.actions;

// Export reducer
export default appSlice.reducer;