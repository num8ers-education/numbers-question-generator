// src/types/question.ts
export type QuestionType = 'MCQ' | 'TrueFalse' | 'Matching' | 'FillInTheBlank';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface BaseQuestion {
  id: string;
  topicId: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  text: string;
  explanation: string;
  createdAt: string;
  updatedAt: string;
  aiGenerated: boolean;
}

export interface MCQQuestion extends BaseQuestion {
  type: 'MCQ';
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'TrueFalse';
  correctAnswer: boolean;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'Matching';
  pairs: {
    id: string;
    left: string;
    right: string;
  }[];
}

export interface FillInTheBlankQuestion extends BaseQuestion {
  type: 'FillInTheBlank';
  blanks: {
    id: string;
    position: number;
    correctAnswer: string;
    alternatives?: string[];
  }[];
}

export type Question = 
  | MCQQuestion 
  | TrueFalseQuestion 
  | MatchingQuestion 
  | FillInTheBlankQuestion;

export interface StudentAnswer {
  questionId: string;
  isCorrect: boolean;
  answer: any; // Type depends on question type
  timestamp: string;
}