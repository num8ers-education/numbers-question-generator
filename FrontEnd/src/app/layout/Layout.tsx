// src/app/layout/Layout.tsx
'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ProtectedRoute from '@/components/hoc/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const Layout = ({ children, allowedRoles }: LayoutProps) => {
  const { isAuthenticated } = useAuth();

  // If not authenticated, don't render the layout yet
  if (!isAuthenticated) {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Layout;