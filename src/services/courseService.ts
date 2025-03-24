import api from './api';
import { Course, Unit, Topic } from '@/types/course';

export const courseService = {
  // Course CRUD operations
  getCourses: async (): Promise<Course[]> => {
    return api.get<Course[]>('/api/courses');
  },
  
  getCourseById: async (courseId: string): Promise<Course> => {
    return api.get<Course>(`/api/courses/${courseId}`);
  },
  
  createCourse: async (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course> => {
    return api.post<Course>('/api/courses', courseData);
  },
  
  updateCourse: async (courseId: string, courseData: Partial<Course>): Promise<Course> => {
    return api.patch<Course>(`/api/courses/${courseId}`, courseData);
  },
  
  deleteCourse: async (courseId: string): Promise<void> => {
    return api.delete<void>(`/api/courses/${courseId}`);
  },
  
  // Unit CRUD operations
  getCourseUnits: async (courseId: string): Promise<Unit[]> => {
    return api.get<Unit[]>(`/api/courses/${courseId}/units`);
  },
  
  getUnitById: async (unitId: string): Promise<Unit> => {
    return api.get<Unit>(`/api/units/${unitId}`);
  },
  
  createUnit: async (unitData: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Unit> => {
    return api.post<Unit>('/api/units', unitData);
  },
  
  updateUnit: async (unitId: string, unitData: Partial<Unit>): Promise<Unit> => {
    return api.patch<Unit>(`/api/units/${unitId}`, unitData);
  },
  
  deleteUnit: async (unitId: string): Promise<void> => {
    return api.delete<void>(`/api/units/${unitId}`);
  },
  
  // Topic CRUD operations
  getUnitTopics: async (unitId: string): Promise<Topic[]> => {
    return api.get<Topic[]>(`/api/units/${unitId}/topics`);
  },
  
  getTopicById: async (topicId: string): Promise<Topic> => {
    return api.get<Topic>(`/api/topics/${topicId}`);
  },
  
  createTopic: async (topicData: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>): Promise<Topic> => {
    return api.post<Topic>('/api/topics', topicData);
  },
  
  updateTopic: async (topicId: string, topicData: Partial<Topic>): Promise<Topic> => {
    return api.patch<Topic>(`/api/topics/${topicId}`, topicData);
  },
  
  deleteTopic: async (topicId: string): Promise<void> => {
    return api.delete<void>(`/api/topics/${topicId}`);
  },
  
  // Student enrollment
  enrollStudent: async (courseId: string, studentId: string): Promise<void> => {
    return api.post<void>(`/api/courses/${courseId}/enroll`, { studentId });
  },
  
  unenrollStudent: async (courseId: string, studentId: string): Promise<void> => {
    return api.delete<void>(`/api/courses/${courseId}/enroll/${studentId}`);
  },
  
  getEnrolledStudents: async (courseId: string): Promise<any[]> => {
    return api.get<any[]>(`/api/courses/${courseId}/students`);
  },
  
  getStudentCourses: async (studentId: string): Promise<Course[]> => {
    return api.get<Course[]>(`/api/students/${studentId}/courses`);
  },
};

export default courseService;