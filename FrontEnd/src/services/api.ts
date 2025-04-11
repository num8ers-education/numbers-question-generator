// src/services/api.ts

import axios, { AxiosResponse } from "axios";

// ---------------------
// Type definitions
// ---------------------
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

// ---------------------
// Base API configuration
// ---------------------
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

// ---------------------
// AUTHENTICATION
// ---------------------
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

  // Student-specific registration endpoint
  registerStudent: async (userData: any) => {
    try {
      // Make sure the payload exactly matches what the API expects
      const payload = {
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name,
        role: "student"
      };
      
      console.log("Sending student registration data:", payload);
      
      const response = await apiClient.post("/student/register", payload);
      console.log("Registration response:", response.data);

      // Save user data if token is returned
      if (response.data && response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: response.data.user_id,
            email: userData.email,
            full_name: userData.full_name,
            role: "student",
          })
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Student registration error details:", error.response?.data);
      throw error;
    }
  },

  // Student-specific login endpoint
  studentLogin: async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/student/login", { email, password });

      if (response.data) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: response.data.user_id,
            email: email,
            full_name: response.data.full_name || "User",
            role: "student",
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

// ---------------------
// USER MANAGEMENT
// ---------------------
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

// ---------------------
// CURRICULUM API
// (with added update/delete methods for Subjects, Courses, etc.)
// ---------------------
export const curriculumAPI = {
  // --- Curricula ---
  getAllCurricula: async () => {
    const response = await apiClient.get("/curriculum");
    return response.data;
  },
  getCurriculum: async (id: string) => {
    const response = await apiClient.get(`/curriculum/${id}`);
    return response.data;
  },
  getCurriculumWithHierarchy: async (id: string) => {
    const response = await apiClient.get(`/curriculum/${id}/full`);
    return response.data;
  },
  createCurriculum: async (data: CurriculumFormData) => {
    const response = await apiClient.post("/curriculum", data);
    return response.data;
  },
  updateCurriculum: async (id: string, data: CurriculumFormData) => {
    const response = await apiClient.put(`/curriculum/${id}`, data);
    return response.data;
  },
  deleteCurriculum: async (id: string) => {
    const response = await apiClient.delete(`/curriculum/${id}`);
    return response.data;
  },

  // --- Subjects ---
  getSubjects: async (curriculumId?: string) => {
    const url = curriculumId
      ? `/subjects?curriculum_id=${curriculumId}`
      : "/subjects";
    const response = await apiClient.get(url);
    return response.data;
  },
  createSubject: async (data: any) => {
    const response = await apiClient.post("/subjects", data);
    return response.data;
  },
  updateSubject: async (subjectId: string, data: any) => {
    const response = await apiClient.put(`/subjects/${subjectId}`, data);
    return response.data;
  },
  deleteSubject: async (subjectId: string) => {
    const response = await apiClient.delete(`/subjects/${subjectId}`);
    return response.data;
  },

  // --- Courses ---
  getCourses: async (subjectId?: string) => {
    const url = subjectId ? `/courses?subject_id=${subjectId}` : "/courses";
    const response = await apiClient.get(url);
    return response.data;
  },
  createCourse: async (data: any) => {
    const response = await apiClient.post("/courses", data);
    return response.data;
  },
  updateCourse: async (courseId: string, data: any) => {
    const response = await apiClient.put(`/courses/${courseId}`, data);
    return response.data;
  },
  deleteCourse: async (courseId: string) => {
    const response = await apiClient.delete(`/courses/${courseId}`);
    return response.data;
  },

  // --- Units (called "topics" in your UI) ---
  getUnits: async (courseId?: string) => {
    const url = courseId ? `/units?course_id=${courseId}` : "/units";
    const response = await apiClient.get(url);
    return response.data;
  },
  createUnit: async (data: any) => {
    const response = await apiClient.post("/units", data);
    return response.data;
  },
  updateUnit: async (unitId: string, data: any) => {
    const response = await apiClient.put(`/units/${unitId}`, data);
    return response.data;
  },
  deleteUnit: async (unitId: string) => {
    const response = await apiClient.delete(`/units/${unitId}`);
    return response.data;
  },

  // --- Topics (called "units" in your UI) ---
  getTopics: async (unitId?: string) => {
    const url = unitId ? `/topics?unit_id=${unitId}` : "/topics";
    const response = await apiClient.get(url);
    return response.data;
  },
  createTopic: async (data: any) => {
    const response = await apiClient.post("/topics", data);
    return response.data;
  },
  updateTopic: async (topicId: string, data: any) => {
    const response = await apiClient.put(`/topics/${topicId}`, data);
    return response.data;
  },
  deleteTopic: async (topicId: string) => {
    const response = await apiClient.delete(`/topics/${topicId}`);
    return response.data;
  },
};

// ---------------------
// SUBJECT API
// (Optional if you prefer using subjectAPI for other pages)
// ---------------------
export const subjectAPI = {
  getAllSubjects: async (curriculumId?: string) => {
    const url = curriculumId
      ? `/subjects?curriculum_id=${curriculumId}`
      : "/subjects";
    const response = await apiClient.get(url);
    return response.data;
  },
  getSubject: async (idOrSlug: string) => {
    const response = await apiClient.get(`/subjects/${idOrSlug}`);
    return response.data;
  },
  getSubjectWithHierarchy: async (idOrSlug: string) => {
    const response = await apiClient.get(`/subjects/${idOrSlug}/full`);
    return response.data;
  },
  createSubject: async (data: SubjectFormData) => {
    const response = await apiClient.post("/subjects", data);
    return response.data;
  },
  updateSubject: async (idOrSlug: string, data: Partial<SubjectFormData>) => {
    const response = await apiClient.put(`/subjects/${idOrSlug}`, data);
    return response.data;
  },
  deleteSubject: async (idOrSlug: string) => {
    const response = await apiClient.delete(`/subjects/${idOrSlug}`);
    return response.data;
  },
};

// ---------------------
// COURSE API
// (Optional if you prefer using courseAPI for other pages)
// ---------------------
export const courseAPI = {
  getAllCourses: async (subjectId?: string) => {
    const url = subjectId ? `/courses?subject_id=${subjectId}` : "/courses";
    const response = await apiClient.get(url);
    return response.data;
  },
  getCourse: async (idOrSlug: string) => {
    const response = await apiClient.get(`/courses/${idOrSlug}`);
    return response.data;
  },
  getCourseWithHierarchy: async (idOrSlug: string) => {
    const response = await apiClient.get(`/courses/${idOrSlug}/full`);
    return response.data;
  },
  createCourse: async (data: CourseFormData) => {
    const response = await apiClient.post("/courses", data);
    return response.data;
  },
  updateCourse: async (idOrSlug: string, data: Partial<CourseFormData>) => {
    const response = await apiClient.put(`/courses/${idOrSlug}`, data);
    return response.data;
  },
  deleteCourse: async (idOrSlug: string) => {
    const response = await apiClient.delete(`/courses/${idOrSlug}`);
    return response.data;
  },
};

// ---------------------
// UNIT API
// (Optional if you prefer using unitAPI for other pages)
// ---------------------
export const unitAPI = {
  getAllUnits: async (courseId?: string) => {
    const url = courseId ? `/units?course_id=${courseId}` : "/units";
    const response = await apiClient.get(url);
    return response.data;
  },
  getUnit: async (idOrSlug: string) => {
    const response = await apiClient.get(`/units/${idOrSlug}`);
    return response.data;
  },
  getUnitWithTopics: async (idOrSlug: string) => {
    const response = await apiClient.get(`/units/${idOrSlug}/topics`);
    return response.data;
  },
  createUnit: async (data: UnitFormData) => {
    const response = await apiClient.post("/units", data);
    return response.data;
  },
  updateUnit: async (idOrSlug: string, data: Partial<UnitFormData>) => {
    const response = await apiClient.put(`/units/${idOrSlug}`, data);
    return response.data;
  },
  deleteUnit: async (idOrSlug: string) => {
    const response = await apiClient.delete(`/units/${idOrSlug}`);
    return response.data;
  },
};

// ---------------------
// TOPIC API
// (Optional if you prefer using topicAPI for other pages)
// ---------------------
export const topicAPI = {
  getAllTopics: async (unitId?: string) => {
    const url = unitId ? `/topics?unit_id=${unitId}` : "/topics";
    const response = await apiClient.get(url);
    return response.data;
  },
  getTopic: async (idOrSlug: string) => {
    const response = await apiClient.get(`/topics/${idOrSlug}`);
    return response.data;
  },
  createTopic: async (data: TopicFormData) => {
    const response = await apiClient.post("/topics", data);
    return response.data;
  },
  updateTopic: async (idOrSlug: string, data: Partial<TopicFormData>) => {
    const response = await apiClient.put(`/topics/${idOrSlug}`, data);
    return response.data;
  },
  deleteTopic: async (idOrSlug: string) => {
    const response = await apiClient.delete(`/topics/${idOrSlug}`);
    return response.data;
  },
};

// ---------------------
// QUESTION API
// ---------------------
export const questionAPI = {
  getAllQuestions: async (filters?: any) => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            params.append(key, value.toString());
          }
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

// ---------------------
// DASHBOARD API
// ---------------------
export const dashboardAPI = {
  getAdminDashboard: async () => {
    try {
      // Combining data from multiple endpoints
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

// ---------------------
// PROMPT TEMPLATE API
// ---------------------
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
  updatePrompt: async (promptId: string, promptData: any) => {
    try {
      const response = await apiClient.put(`/prompts/${promptId}`, promptData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deletePrompt: async (promptId: string) => {
    try {
      const response = await apiClient.delete(`/prompts/${promptId}`);
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

// Export default
export default apiClient;
