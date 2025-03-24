import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import StudentLayout from '@/components/templates/StudentLayout/StudentLayout';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { Badge } from '@/components/atoms/Badge/Badge';
import { useAuth } from '@/context/AuthContext';
import courseService from '@/services/courseService';
import { Course } from '@/types/course';

const CoursesPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      
      try {
        // Fetch all available courses
        const allCourses = await courseService.getCourses();
        setCourses(allCourses);
        
        // Fetch enrolled courses for the current user
        if (user) {
          const userCourses = await courseService.getStudentCourses(user.id);
          setEnrolledCourses(userCourses);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, [user]);
  
  // Filter courses based on search query
  const filteredCourses = searchQuery
    ? courses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : courses;
  
  // Check if a course is enrolled
  const isEnrolled = (courseId: string) => {
    return enrolledCourses.some(course => course.id === courseId);
  };
  
  // Handle course enrollment
  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    
    try {
      await courseService.enrollStudent(courseId, user.id);
      
      // Refresh enrolled courses
      const userCourses = await courseService.getStudentCourses(user.id);
      setEnrolledCourses(userCourses);
    } catch (error) {
      console.error('Failed to enroll in course:', error);
    }
  };
  
  return (
    <StudentLayout title="Courses">
      <div className="space-y-6">
        {/* Search and filters */}
        <div className="bg-white shadow-card rounded-card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <h2 className="text-lg font-medium">Available Courses</h2>
            <div className="w-full md:w-1/3">
              <Input 
                placeholder="Search courses..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
        
        {/* Enrolled courses */}
        {enrolledCourses.length > 0 && (
          <div className="bg-white shadow-card rounded-card p-6">
            <h2 className="text-lg font-medium mb-4">My Enrolled Courses</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // Loading skeletons
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="border border-neutral-200 rounded-md p-4">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                      <div className="h-3 bg-neutral-200 rounded w-full"></div>
                      <div className="h-8 bg-neutral-200 rounded w-1/3 mt-4"></div>
                    </div>
                  </div>
                ))
              ) : (
                enrolledCourses.map(course => (
                  <div 
                    key={course.id} 
                    className="border border-neutral-200 rounded-md overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/student/courses/${course.id}`)}
                  >
                    <div 
                      className="h-32 bg-primary-100 flex items-center justify-center"
                    >
                      {course.imageUrl ? (
                        <img 
                          src={course.imageUrl} 
                          alt={course.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-12 h-12 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="mt-4 flex justify-between items-center">
                        <Badge variant="success">Enrolled</Badge>
                        <Button size="sm" variant="outline">Continue</Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {/* Available courses */}
        <div className="bg-white shadow-card rounded-card p-6">
          <h2 className="text-lg font-medium mb-4">
            {searchQuery ? 'Search Results' : 'All Available Courses'}
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="border border-neutral-200 rounded-md p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                    <div className="h-3 bg-neutral-200 rounded w-full"></div>
                    <div className="h-8 bg-neutral-200 rounded w-1/3 mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-neutral-900">No courses found</h3>
              <p className="mt-1 text-sm text-neutral-500">
                {searchQuery 
                  ? `No courses matching "${searchQuery}"` 
                  : 'There are no courses available at the moment.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => {
                const enrolled = isEnrolled(course.id);
                
                return (
                  <div 
                    key={course.id} 
                    className={`border rounded-md overflow-hidden hover:shadow-md transition-shadow ${
                      enrolled ? 'border-primary-200 bg-primary-50' : 'border-neutral-200'
                    }`}
                  >
                    <div 
                      className="h-32 bg-primary-100 flex items-center justify-center cursor-pointer"
                      onClick={() => router.push(`/student/courses/${course.id}`)}
                    >
                      {course.imageUrl ? (
                        <img 
                          src={course.imageUrl} 
                          alt={course.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-12 h-12 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                    </div>
                    <div className="p-4">
                      <div 
                        className="cursor-pointer"
                        onClick={() => router.push(`/student/courses/${course.id}`)}
                      >
                        <h3 className="font-medium">{course.title}</h3>
                        <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                          {course.description}
                        </p>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        {enrolled ? (
                          <>
                            <Badge variant="success">Enrolled</Badge>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => router.push(`/student/courses/${course.id}`)}
                            >
                              View Course
                            </Button>
                          </>
                        ) : (
                          <>
                            <Badge variant="outline">Not Enrolled</Badge>
                            <Button 
                              size="sm" 
                              onClick={() => handleEnroll(course.id)}
                            >
                              Enroll Now
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default CoursesPage;