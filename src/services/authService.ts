import api from './api';
import { User, LoginCredentials, RegisterCredentials } from '@/types/auth';

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    
    // Store the token and user data in localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  },
  
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', credentials);
    
    // Store the token and user data in localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  },
  
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  },
  
  getCurrentUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },
  
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  },
  
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },
  
  updateProfile: async (userId: string, userData: Partial<User>): Promise<User> => {
    const response = await api.patch<User>(`/api/users/${userId}`, userData);
    
    // Update the user data in localStorage
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        ...response,
      }));
    }
    
    return response;
  },
  
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/api/auth/forgot-password', { email });
  },
  
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/api/auth/reset-password', {
      token,
      newPassword,
    });
  },
  
  changePassword: async (
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    return api.post<{ message: string }>(`/api/users/${userId}/change-password`, {
      currentPassword,
      newPassword,
    });
  },
};

export default authService;