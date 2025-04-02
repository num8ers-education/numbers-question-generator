// src/components/hoc/ProtectedRoute.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "../toast";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({
  children,
  allowedRoles = [],
}: ProtectedRouteProps) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If authentication check is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      showToast.error("Please log in to access this page");
      router.push("/");
    }

    // If authentication check is complete, user is authenticated, but doesn't have the required role
    if (
      !isLoading &&
      isAuthenticated &&
      user &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user.role)
    ) {
      showToast.error(
        `Access denied. You don't have permission to view this page.`
      );
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  // While authentication is being checked, show a loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated or doesn't have the required role, don't render children
  if (
    !isAuthenticated ||
    (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role))
  ) {
    return null;
  }

  // Otherwise, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
