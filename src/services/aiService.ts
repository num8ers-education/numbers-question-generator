import api from './api';
import { AIPrompt, AIQuestion, AIFeedback, ChatMessage } from '@/types/ai';
import { Question } from '@/types/question';

export const aiService = {
  // Question generation
  generateQuestions: async (prompt: AIPrompt): Promise<AIQuestion[]> => {
    return api.post<AIQuestion[]>('/api/ai/generate-questions', prompt);
  },
  
  // AI feedback on answers
  getAnswerFeedback: async (
    questionId: string,
    studentAnswer: any,
    correctAnswer: any
  ): Promise<AIFeedback> => {
    return api.post<AIFeedback>('/api/ai/feedback', {
      questionId,
      studentAnswer,
      correctAnswer,
    });
  },
  
  // Chatbot functionality
  sendChatMessage: async (
    studentId: string,
    content: string,
    context?: {
      questionId?: string;
      topicId?: string;
    }
  ): Promise<ChatMessage> => {
    return api.post<ChatMessage>('/api/ai/chat', {
      studentId,
      content,
      context,
    });
  },
  
  getChatHistory: async (studentId: string, limit = 50): Promise<ChatMessage[]> => {
    return api.get<ChatMessage[]>(`/api/ai/chat/${studentId}?limit=${limit}`);
  },
  
  // Get similar questions for practice
  getSimilarQuestions: async (questionId: string, count = 3): Promise<Question[]> => {
    return api.get<Question[]>(`/api/ai/similar-questions/${questionId}?count=${count}`);
  },
  
  // Get custom learning suggestions
  getLearningRecommendations: async (studentId: string): Promise<{
    weakTopics: Array<{
      topicId: string;
      topicTitle: string;
      accuracy: number;
    }>;
    recommendedQuestions: Question[];
  }> => {
    return api.get<{
      weakTopics: Array<{
        topicId: string;
        topicTitle: string;
        accuracy: number;
      }>;
      recommendedQuestions: Question[];
    }>(`/api/ai/recommendations/${studentId}`);
  },
  
  // Get step-by-step explanations
  getDetailedExplanation: async (questionId: string): Promise<{
    steps: string[];
    additionalInfo?: string;
    relatedConcepts?: string[];
  }> => {
    return api.get<{
      steps: string[];
      additionalInfo?: string;
      relatedConcepts?: string[];
    }>(`/api/ai/explanation/${questionId}`);
  },
  
  // Generate hints for a question
  getHints: async (questionId: string, previousHintsCount = 0): Promise<string> => {
    return api.get<{ hint: string }>(`/api/ai/hints/${questionId}?previous=${previousHintsCount}`)
      .then(response => response.hint);
  },
};

export default aiService;