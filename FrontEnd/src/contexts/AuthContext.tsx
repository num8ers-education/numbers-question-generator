// src/contexts/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/services/api";
import toast from "react-hot-toast";
import { showToast } from "@/components/toast";

type User = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "teacher" | "student";
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);

        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));

          // Set the token in cookie for middleware
          if (!document.cookie.includes("token=")) {
            document.cookie = `token=${token}; path=/; max-age=86400`;
          }
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(email, password);

      const userData = {
        id: response.user_id,
        email: email,
        full_name: response.full_name || "User",
        role: response.role,
      };

      setUser(userData);
      document.cookie = `token=${response.access_token}; path=/; max-age=86400`;

      showToast.success("Login successful!");

      // Redirect based on role
      if (userData.role === "admin" || userData.role === "teacher") {
        router.push("/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
      showToast.error(
        err.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authAPI.logout();
    setUser(null);
    showToast.success("Logged out successfully");
    router.push("/");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
