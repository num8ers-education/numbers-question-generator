import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AIPrompt, AIQuestion, AIFeedback, ChatMessage } from '@/types/ai';
import { Question } from '@/types/question';
import aiService from '@/services/aiService';
import { useAuth } from './AuthContext';

interface AIContextType {
  isGenerating: boolean;
  generatedQuestions: AIQuestion[];
  chatHistory: ChatMessage[];
  isSendingMessage: boolean;
  feedback: AIFeedback | null;
  
  // Question generation
  generateQuestions: (prompt: AIPrompt) => Promise<AIQuestion[]>;
  clearGeneratedQuestions: () => void;
  
  // Chat functionality
  sendChatMessage: (content: string, context?: { questionId?: string; topicId?: string }) => Promise<void>;
  clearChatHistory: () => void;
  
  // Feedback
  getAnswerFeedback: (questionId: string, studentAnswer: any, correctAnswer: any) => Promise<AIFeedback>;
  clearFeedback: () => void;
  
  // Similar questions and recommendations
  getSimilarQuestions: (questionId: string, count?: number) => Promise<Question[]>;
  getLearningRecommendations: () => Promise<{
    weakTopics: Array<{ topicId: string; topicTitle: string; accuracy: number }>;
    recommendedQuestions: Question[];
  }>;
  
  // Explanations and hints
  getDetailedExplanation: (questionId: string) => Promise<{ 
    steps: string[]; 
    additionalInfo?: string; 
    relatedConcepts?: string[] 
  }>;
  getHint: (questionId: string, previousHintsCount?: number) => Promise<string>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<AIQuestion[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  
  // Question generation
  const generateQuestions = async (prompt: AIPrompt): Promise<AIQuestion[]> => {
    setIsGenerating(true);
    
    try {
      const questions = await aiService.generateQuestions(prompt);
      setGeneratedQuestions(questions);
      return questions;
    } catch (error) {
      console.error('Failed to generate questions:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };
  
  const clearGeneratedQuestions = () => {
    setGeneratedQuestions([]);
  };
  
  // Chat functionality
  const sendChatMessage = async (
    content: string,
    context?: { questionId?: string; topicId?: string }
  ): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to use chat');
    }
    
    setIsSendingMessage(true);
    
    try {
      // Add user message to chat
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'student',
        content,
        timestamp: new Date().toISOString(),
      };
      
      setChatHistory(prev => [...prev, userMessage]);
      
      // Send to API and get response
      const response = await aiService.sendChatMessage(
        user.id,
        content,
        context
      );
      
      // Update chat with AI response
      setChatHistory(prev => [...prev.filter(msg => msg.id !== userMessage.id), 
        {
          id: userMessage.id,
          role: 'student',
          content,
          timestamp: userMessage.timestamp
        },
        response
      ]);
    } catch (error) {
      console.error('Failed to send chat message:', error);
      throw error;
    } finally {
      setIsSendingMessage(false);
    }
  };
  
  const clearChatHistory = () => {
    setChatHistory([]);
  };
  
  // Feedback
  const getAnswerFeedback = async (
    questionId: string,
    studentAnswer: any,
    correctAnswer: any
  ): Promise<AIFeedback> => {
    try {
      const feedback = await aiService.getAnswerFeedback(
        questionId,
        studentAnswer,
        correctAnswer
      );
      
      setFeedback(feedback);
      return feedback;
    } catch (error) {
      console.error('Failed to get answer feedback:', error);
      throw error;
    }
  };
  
  const clearFeedback = () => {
    setFeedback(null);
  };
  
  // Similar questions and recommendations
  const getSimilarQuestions = async (questionId: string, count = 3): Promise<Question[]> => {
    try {
      return await aiService.getSimilarQuestions(questionId, count);
    } catch (error) {
      console.error('Failed to get similar questions:', error);
      throw error;
    }
  };
  
  const getLearningRecommendations = async (): Promise<{
    weakTopics: Array<{ topicId: string; topicTitle: string; accuracy: number }>;
    recommendedQuestions: Question[];
  }> => {
    if (!user) {
      throw new Error('User must be authenticated to get recommendations');
    }
    
    try {
      return await aiService.getLearningRecommendations(user.id);
    } catch (error) {
      console.error('Failed to get learning recommendations:', error);
      throw error;
    }
  };
  
  // Explanations and hints
  const getDetailedExplanation = async (questionId: string): Promise<{
    steps: string[];
    additionalInfo?: string;
    relatedConcepts?: string[];
  }> => {
    try {
      return await aiService.getDetailedExplanation(questionId);
    } catch (error) {
      console.error('Failed to get detailed explanation:', error);
      throw error;
    }
  };
  
  const getHint = async (questionId: string, previousHintsCount = 0): Promise<string> => {
    try {
      return await aiService.getHints(questionId, previousHintsCount);
    } catch (error) {
      console.error('Failed to get hint:', error);
      throw error;
    }
  };
  
  return (
    <AIContext.Provider
      value={{
        isGenerating,
        generatedQuestions,
        chatHistory,
        isSendingMessage,
        feedback,
        generateQuestions,
        clearGeneratedQuestions,
        sendChatMessage,
        clearChatHistory,
        getAnswerFeedback,
        clearFeedback,
        getSimilarQuestions,
        getLearningRecommendations,
        getDetailedExplanation,
        getHint,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  
  return context;
};

export default AIContext;