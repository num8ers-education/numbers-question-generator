"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import LoginPage from "@/app/auth/login/LoginPage";
import Dashboard from "@/dashboard/page";

// Dynamically import Dashboard with no SSR to avoid hydration issues
// const Dashboard = dynamic(() => import("@/app/dashboard/Dashboard"), {
//   ssr: false,
// });

// Simple Protected Route component
const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    // Check for authentication - replace with your actual auth logic
    const checkAuth = () => {
      // Example: check if token exists in localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      setIsAuthenticated(true);
    };

    checkAuth();
  }, [router]);

  return isAuthenticated ? children : null;
};

export default function HomePage() {
  const [currentPath, setCurrentPath] = React.useState("/");

  React.useEffect(() => {
    // Check current path on client side
    setCurrentPath(window.location.pathname);
  }, []);

  return (
    <>
      {currentPath === "/" && <LoginPage />}
      {currentPath === "/dashboard" && (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      )}
    </>
  );
}
