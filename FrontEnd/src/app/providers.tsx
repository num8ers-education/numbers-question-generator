// src/app/providers.tsx
'use client';

import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Provider>
  );
}