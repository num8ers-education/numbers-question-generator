import { DifficultyLevel, QuestionType } from "./question";

// src/types/ai.ts
export interface AIPrompt {
    curriculum?: string;
    course?: string;
    unit?: string;
    topic?: string;
    numberOfQuestions?: number;
    questionTypes?: QuestionType[];
    difficulty?: DifficultyLevel;
  }
  
  export interface AIQuestion {
    id: string;
    text: string;
    type: QuestionType;
    difficulty: DifficultyLevel;
    options?: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
      explanation?: string;
    }>;
    correctAnswer?: boolean | string;
    pairs?: Array<{
      id: string;
      left: string;
      right: string;
    }>;
    blanks?: Array<{
      id: string;
      position: number;
      correctAnswer: string;
      alternatives?: string[];
    }>;
    explanation: string;
  }
  
  export interface AIFeedback {
    isCorrect: boolean;
    explanation: string;
    hints?: string[];
    suggestedQuestions?: AIQuestion[];
  }
  
  export interface ChatMessage {
    id: string;
    role: 'student' | 'assistant';
    content: string;
    timestamp: string;
  }