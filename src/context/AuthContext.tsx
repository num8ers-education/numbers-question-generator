import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { User, LoginCredentials, RegisterCredentials } from '@/types/auth';
import authService from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Initialize auth state from local storage on first load
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const user = authService.getCurrentUser();
        const isAuthenticated = authService.isAuthenticated();
        
        setUser(user);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
        setUser(null);
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  // Login function
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      
      // Redirect based on user role
      if (response.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/courses');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register function
  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(credentials);
      setUser(response.user);
      
      // Redirect based on user role
      if (response.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/courses');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/auth/login');
  };
  
  // Update profile
  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (user) {
        const updatedUser = await authService.updateProfile(user.id, userData);
        setUser(updatedUser);
      }
    } catch (error: any) {
      console.error('Profile update failed:', error);
      setError(error.response?.data?.message || 'Profile update failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;