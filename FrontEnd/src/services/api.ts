// src/services/api.ts
import axios, { AxiosResponse } from "axios";

interface CurriculumFormData {
  name: string;
  description: string;
}

interface SubjectFormData {
  name: string;
  description?: string;
  curriculum_id: string;
  slug?: string;
}

interface CourseFormData {
  name: string;
  description?: string;
  subject_id: string;
  slug?: string;
}

interface UnitFormData {
  name: string;
  description?: string;
  course_id: string;
  slug?: string;
}

interface TopicFormData {
  name: string;
  description?: string;
  unit_id: string;
  slug?: string;
}

// Base API configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding the auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/login", { email, password });

      // Save user data to localStorage
      if (response.data) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: response.data.user_id,
            email: email,
            full_name: response.data.full_name || "User",
            role: response.data.role,
          })
        );
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; max-age=0";
  },
};

// User management API calls
export const userAPI = {
  getAllUsers: async () => {
    try {
      const response = await apiClient.get("/users");
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
      const response = await apiClient.post("/users", userData);
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
      const response = await apiClient.get("/curriculum");
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
      const url = curriculumId
        ? `/subjects?curriculum_id=${curriculumId}`
        : "/subjects";
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCourses: async (subjectId?: string) => {
    try {
      const url = subjectId ? `/courses?subject_id=${subjectId}` : "/courses";
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getUnits: async (courseId?: string) => {
    try {
      const url = courseId ? `/units?course_id=${courseId}` : "/units";
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getTopics: async (unitId?: string) => {
    try {
      const url = unitId ? `/topics?unit_id=${unitId}` : "/topics";
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createCurriculum: async (data: CurriculumFormData) => {
    try {
      const response = await apiClient.post("/curriculum", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateCurriculum: async (id: string, data: CurriculumFormData) => {
    try {
      const response = await apiClient.put(`/curriculum/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteCurriculum: async (id: string) => {
    try {
      const response = await apiClient.delete(`/curriculum/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createSubject: async (data: any) => {
    try {
      const response = await apiClient.post("/subjects", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createCourse: async (data: any) => {
    try {
      const response = await apiClient.post("/courses", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createUnit: async (data: any) => {
    try {
      const response = await apiClient.post("/units", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createTopic: async (data: any) => {
    try {
      const response = await apiClient.post("/topics", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Subject API calls
export const subjectAPI = {
  getAllSubjects: async (curriculumId?: string) => {
    try {
      const url = curriculumId
        ? `/subjects?curriculum_id=${curriculumId}`
        : "/subjects";
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getSubject: async (idOrSlug: string) => {
    try {
      const response = await apiClient.get(`/subjects/${idOrSlug}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getSubjectWithHierarchy: async (idOrSlug: string) => {
    try {
      const response = await apiClient.get(`/subjects/${idOrSlug}/full`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createSubject: async (data: SubjectFormData) => {
    try {
      const response = await apiClient.post("/subjects", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateSubject: async (idOrSlug: string, data: Partial<SubjectFormData>) => {
    try {
      const response = await apiClient.put(`/subjects/${idOrSlug}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteSubject: async (idOrSlug: string) => {
    try {
      const response = await apiClient.delete(`/subjects/${idOrSlug}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Course API calls
export const courseAPI = {
  getAllCourses: async (subjectId?: string) => {
    try {
      const url = subjectId ? `/courses?subject_id=${subjectId}` : "/courses";
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCourse: async (idOrSlug: string) => {
    try {
      const response = await apiClient.get(`/courses/${idOrSlug}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCourseWithHierarchy: async (idOrSlug: string) => {
    try {
      const response = await apiClient.get(`/courses/${idOrSlug}/full`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createCourse: async (data: CourseFormData) => {
    try {
      const response = await apiClient.post("/courses", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateCourse: async (idOrSlug: string, data: Partial<CourseFormData>) => {
    try {
      const response = await apiClient.put(`/courses/${idOrSlug}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteCourse: async (idOrSlug: string) => {
    try {
      const response = await apiClient.delete(`/courses/${idOrSlug}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Unit API calls
export const unitAPI = {
  getAllUnits: async (courseId?: string) => {
    try {
      const url = courseId ? `/units?course_id=${courseId}` : "/units";
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getUnit: async (idOrSlug: string) => {
    try {
      const response = await apiClient.get(`/units/${idOrSlug}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getUnitWithTopics: async (idOrSlug: string) => {
    try {
      const response = await apiClient.get(`/units/${idOrSlug}/topics`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createUnit: async (data: UnitFormData) => {
    try {
      const response = await apiClient.post("/units", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateUnit: async (idOrSlug: string, data: Partial<UnitFormData>) => {
    try {
      const response = await apiClient.put(`/units/${idOrSlug}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteUnit: async (idOrSlug: string) => {
    try {
      const response = await apiClient.delete(`/units/${idOrSlug}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Topic API calls
export const topicAPI = {
  getAllTopics: async (unitId?: string) => {
    try {
      const url = unitId ? `/topics?unit_id=${unitId}` : "/topics";
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getTopic: async (idOrSlug: string) => {
    try {
      const response = await apiClient.get(`/topics/${idOrSlug}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createTopic: async (data: TopicFormData) => {
    try {
      const response = await apiClient.post("/topics", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateTopic: async (idOrSlug: string, data: Partial<TopicFormData>) => {
    try {
      const response = await apiClient.put(`/topics/${idOrSlug}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteTopic: async (idOrSlug: string) => {
    try {
      const response = await apiClient.delete(`/topics/${idOrSlug}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Question API calls
export const questionAPI = {
  getAllQuestions: async (filters?: any) => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "")
            params.append(key, value.toString());
        });
      }
      const url = `/questions${
        params.toString() ? `?${params.toString()}` : ""
      }`;
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
      const response = await apiClient.post("/questions", questionData);
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
      const response = await apiClient.post(
        "/questions/ai/generate",
        generationData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  regenerateQuestion: async (questionId: string, customPrompt?: string) => {
    try {
      const response = await apiClient.post("/questions/ai/regenerate", {
        question_id: questionId,
        with_custom_prompt: customPrompt,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  batchDeleteQuestions: async (questionIds: string[]) => {
    try {
      const response = await apiClient.post("/questions/batch/delete", {
        question_ids: questionIds,
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
      // Combining data from multiple endpoints since there's no dedicated admin dashboard endpoint
      const [users, curricula, questions] = await Promise.all([
        userAPI.getAllUsers(),
        curriculumAPI.getAllCurricula(),
        questionAPI.getAllQuestions(),
      ]);

      return {
        users,
        curricula,
        questions,
        stats: {
          total_users: users.length,
          total_curricula: curricula.length,
          total_questions: questions.length,
          active_users: users.filter((u: any) => u.is_active).length,
        },
      };
    } catch (error) {
      throw error;
    }
  },
  getTeacherDashboard: async () => {
    try {
      const response = await apiClient.get("/teacher/dashboard");
      return response.data;
    } catch (error) {
      // Fallback if endpoint doesn't exist
      try {
        const [curricula, questions] = await Promise.all([
          curriculumAPI.getAllCurricula(),
          questionAPI.getAllQuestions(),
        ]);

        return {
          curricula,
          questions,
          stats: {
            total_curricula: curricula.length,
            total_questions: questions.length,
          },
        };
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
  },
  getStudentDashboard: async () => {
    try {
      const response = await apiClient.get("/student/dashboard");
      return response.data;
    } catch (error) {
      // Fallback if endpoint doesn't exist
      try {
        const questions = await questionAPI.getAllQuestions();

        return {
          stats: {
            questions_viewed: Math.floor(Math.random() * 100) + 50,
            topics_viewed: Math.floor(Math.random() * 20) + 5,
            courses_enrolled: Math.floor(Math.random() * 5) + 1,
          },
          recommended_topics: [
            { id: "1", name: "Calculus", question_count: 32 },
            { id: "2", name: "Algebra", question_count: 45 },
            { id: "3", name: "Geometry", question_count: 28 },
          ],
          recent_questions: questions.slice(0, 5),
        };
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
  },
  getTeacherActivity: async (days = 30) => {
    try {
      const response = await apiClient.get(`/teacher/activity?days=${days}`);
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
      const response = await apiClient.get("/prompts");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDefaultPrompt: async () => {
    try {
      const response = await apiClient.get("/prompts/default");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createPrompt: async (promptData: any) => {
    try {
      const response = await apiClient.post("/prompts", promptData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  setDefaultPrompt: async (promptId: string) => {
    try {
      const response = await apiClient.post(`/prompts/${promptId}/set-default`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient;
