"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginPage from "@/app/auth/login/LoginPage";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated, redirect to appropriate dashboard
    if (!isLoading && isAuthenticated && user) {
      const redirectPath =
        user.role === "student" ? "/student/dashboard" : "/dashboard";
      router.push(redirectPath);
    }
  }, [isAuthenticated, user, isLoading, router]);

  // If still loading or user is authenticated (will be redirected), show a loading state
  if (isLoading || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Otherwise, show the login page
  return <LoginPage />;
}
