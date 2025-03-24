import api from './api';
import { Question, QuestionType, DifficultyLevel, StudentAnswer } from '@/types/question';
import { AIPrompt, AIQuestion } from '@/types/ai';

export const questionService = {
  // Standard question CRUD operations
  getQuestions: async (topicId?: string): Promise<Question[]> => {
    const url = topicId ? `/api/topics/${topicId}/questions` : '/api/questions';
    return api.get<Question[]>(url);
  },
  
  getQuestionById: async (questionId: string): Promise<Question> => {
    return api.get<Question>(`/api/questions/${questionId}`);
  },
  
  createQuestion: async (questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<Question> => {
    return api.post<Question>('/api/questions', questionData);
  },
  
  updateQuestion: async (questionId: string, questionData: Partial<Question>): Promise<Question> => {
    return api.patch<Question>(`/api/questions/${questionId}`, questionData);
  },
  
  deleteQuestion: async (questionId: string): Promise<void> => {
    return api.delete<void>(`/api/questions/${questionId}`);
  },
  
  // AI question generation
  generateQuestions: async (prompt: AIPrompt): Promise<AIQuestion[]> => {
    return api.post<AIQuestion[]>('/api/ai/generate-questions', prompt);
  },
  
  saveGeneratedQuestions: async (questions: AIQuestion[]): Promise<Question[]> => {
    return api.post<Question[]>('/api/ai/save-questions', { questions });
  },
  
  // Student answers
  submitAnswer: async (questionId: string, answer: any): Promise<{
    isCorrect: boolean;
    explanation: string;
    correctAnswer?: any;
  }> => {
    return api.post<{
      isCorrect: boolean;
      explanation: string;
      correctAnswer?: any;
    }>(`/api/questions/${questionId}/answer`, { answer });
  },
  
  getStudentAnswers: async (studentId: string, topicId?: string): Promise<StudentAnswer[]> => {
    const url = topicId 
      ? `/api/students/${studentId}/answers?topicId=${topicId}`
      : `/api/students/${studentId}/answers`;
    return api.get<StudentAnswer[]>(url);
  },
  
  // Practice mode
  getNextQuestion: async (studentId: string, topicId?: string): Promise<Question> => {
    const url = topicId
      ? `/api/students/${studentId}/next-question?topicId=${topicId}`
      : `/api/students/${studentId}/next-question`;
    return api.get<Question>(url);
  },
  
  // Filtering and search
  searchQuestions: async (query: string): Promise<Question[]> => {
    return api.get<Question[]>(`/api/questions/search?q=${encodeURIComponent(query)}`);
  },
  
  filterQuestions: async (filters: {
    type?: QuestionType;
    difficulty?: DifficultyLevel;
    topicId?: string;
    aiGenerated?: boolean;
  }): Promise<Question[]> => {
    const queryParams = new URLSearchParams();
    
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
    if (filters.topicId) queryParams.append('topicId', filters.topicId);
    if (filters.aiGenerated !== undefined) {
      queryParams.append('aiGenerated', filters.aiGenerated.toString());
    }
    
    return api.get<Question[]>(`/api/questions/filter?${queryParams.toString()}`);
  },
};

export default questionService;