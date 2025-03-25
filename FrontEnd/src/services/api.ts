// src/services/api.ts
import axios, { AxiosResponse } from 'axios';

interface CurriculumFormData {
  name: string;
  description: string;
}

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// User management API calls
export const userAPI = {
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getUser: async (id: string) => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createUser: async (userData: any) => {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateUser: async (id: string, userData: any) => {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteUser: async (id: string) => {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Curriculum API calls
export const curriculumAPI = {
  getAllCurricula: async () => {
    try {
      const response = await apiClient.get('/curriculum');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCurriculum: async (id: string) => {
    try {
      const response = await apiClient.get(`/curriculum/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCurriculumWithHierarchy: async (id: string) => {
    try {
      const response = await apiClient.get(`/curriculum/${id}/full`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getSubjects: async (curriculumId?: string) => {
    try {
      const url = curriculumId ? `/subjects?curriculum_id=${curriculumId}` : '/subjects';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCourses: async (subjectId?: string) => {
    try {
      const url = subjectId ? `/courses?subject_id=${subjectId}` : '/courses';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getUnits: async (courseId?: string) => {
    try {
      const url = courseId ? `/units?course_id=${courseId}` : '/units';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getTopics: async (unitId?: string) => {
    try {
      const url = unitId ? `/topics?unit_id=${unitId}` : '/topics';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createCurriculum: async (data: CurriculumFormData): Promise<AxiosResponse> => {
    const response = await apiClient.post('/api/curricula', data);
    return response.data;
  },
};

// Question API calls
export const questionAPI = {
  getAllQuestions: async (filters?: any) => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value as string);
        });
      }
      const url = `/questions${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getQuestion: async (id: string) => {
    try {
      const response = await apiClient.get(`/questions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createQuestion: async (questionData: any) => {
    try {
      const response = await apiClient.post('/questions', questionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateQuestion: async (id: string, questionData: any) => {
    try {
      const response = await apiClient.put(`/questions/${id}`, questionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteQuestion: async (id: string) => {
    try {
      const response = await apiClient.delete(`/questions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  generateQuestions: async (generationData: any) => {
    try {
      const response = await apiClient.post('/questions/ai/generate', generationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  regenerateQuestion: async (questionId: string, customPrompt?: string) => {
    try {
      const response = await apiClient.post('/questions/ai/regenerate', {
        question_id: questionId,
        with_custom_prompt: customPrompt
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Dashboard API calls
export const dashboardAPI = {
  getAdminDashboard: async () => {
    try {
      // This endpoint doesn't exist in your backend yet, but would be useful
      // For now, we'll simulate it by combining data from various endpoints
      const users = await userAPI.getAllUsers();
      const curricula = await curriculumAPI.getAllCurricula();
      
      return {
        users,
        curricula,
        stats: {
          total_users: users.length,
          total_curricula: curricula.length,
          // Add any other stats you need
        }
      };
    } catch (error) {
      throw error;
    }
  },
  getTeacherDashboard: async () => {
    try {
      const response = await apiClient.get('/teacher/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getStudentDashboard: async () => {
    try {
      const response = await apiClient.get('/student/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Prompt template API calls
export const promptAPI = {
  getAllPrompts: async () => {
    try {
      const response = await apiClient.get('/prompts');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDefaultPrompt: async () => {
    try {
      const response = await apiClient.get('/prompts/default');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createPrompt: async (promptData: any) => {
    try {
      const response = await apiClient.post('/prompts', promptData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient;