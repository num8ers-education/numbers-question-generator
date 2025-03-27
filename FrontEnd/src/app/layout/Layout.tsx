// src/app/layout/Layout.tsx
"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ProtectedRoute from "@/components/hoc/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const Layout = ({ children, allowedRoles }: LayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // If still loading, show a simple loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, don't render the layout yet (ProtectedRoute will handle redirect)
  if (!isAuthenticated) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <div>Authentication required...</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Layout;
