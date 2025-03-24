// src/types/analytics.ts
export interface StudentProgress {
    userId: string;
    courseId: string;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    weakTopics: Array<{
      topicId: string;
      topicTitle: string;
      accuracy: number;
    }>;
    strongTopics: Array<{
      topicId: string;
      topicTitle: string;
      accuracy: number;
    }>;
    recentActivities: Array<{
      timestamp: string;
      questionId: string;
      isCorrect: boolean;
    }>;
  }