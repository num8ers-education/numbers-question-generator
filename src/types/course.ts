// src/types/course.ts
export interface Course {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Unit {
    id: string;
    courseId: string;
    title: string;
    description: string;
    order: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Topic {
    id: string;
    unitId: string;
    title: string;
    description: string;
    order: number;
    createdAt: string;
    updatedAt: string;
  }