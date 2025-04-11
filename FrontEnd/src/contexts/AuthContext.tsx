// src/contexts/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "@/services/api";
import { showToast } from "@/components/toast";
import cookieService from "@/services/cookieService";

// Define types
interface User {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "teacher" | "student";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    fullName: string,
    email: string,
    password: string,
    role: string
  ) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  clearError: () => {},
});

// Create provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);

          // Make sure cookie is in sync with localStorage
          cookieService.syncTokenBetweenStorages(token);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        // Clear potentially corrupted data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        cookieService.syncTokenBetweenStorages(null);
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

      // Set user data in state
      setUser({
        id: response.user_id,
        email: email,
        full_name: response.full_name || "User",
        role: response.role,
      });

      // Sync token to cookie for middleware
      cookieService.syncTokenBetweenStorages(response.access_token);

      setIsAuthenticated(true);
      showToast.success("Login successful");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function - only for student registration
  const signup = async (
    fullName: string,
    email: string,
    password: string,
    role: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Only student registration is supported through the public signup
      if (role !== "student") {
        throw new Error(
          "Only student registration is supported. Teachers must be added by an administrator."
        );
      }

      // Prepare user data with the expected field names
      const userData = {
        email: email,
        password: password,
        full_name: fullName,
        role: "student",
      };

      console.log("Sending registration data:", userData);

      // Use student register endpoint
      const response = await authAPI.registerStudent(userData);

      // After successful registration, set user data from the response
      if (response && response.access_token) {
        // Save token and user data to localStorage
        localStorage.setItem("token", response.access_token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: response.user_id || "temp-id",
            email: email,
            full_name: fullName,
            role: "student",
          })
        );

        // Sync token to cookie for middleware
        cookieService.syncTokenBetweenStorages(response.access_token);

        setIsAuthenticated(true);
        setUser({
          id: response.user_id || "temp-id",
          email: email,
          full_name: fullName,
          role: "student",
        });
      } else {
        // If no token is returned, try to log in manually
        await login(email, password);
      }

      showToast.success("Registration successful");
    } catch (err: any) {
      console.error("Registration error:", err);
      // Try to extract the most helpful error message
      const errorMessage =
        err.response?.data?.detail || // Try to get detail from response data
        err.response?.data?.message || // Or message field
        err.message || // Or the error object's message
        "Registration failed. Please try again."; // Fallback

      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear cookie
    cookieService.syncTokenBetweenStorages(null);

    // Update state
    setUser(null);
    setIsAuthenticated(false);
    showToast.success("Logged out successfully");
  };

  // Clear error state
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for easy access to auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
