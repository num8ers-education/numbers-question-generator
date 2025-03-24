import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/templates/AdminLayout/AdminLayout';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { Badge } from '@/components/atoms/Badge/Badge';
import { Alert } from '@/components/atoms/Alert/Alert';
import courseService from '@/services/courseService';
import { Course } from '@/types/course';

const CoursesManagementPage: NextPage = () => {
  const router = useRouter();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'warning'; message: string } | null>(null);
  
  useEffect(() => {
    fetchCourses();
  }, []);
  
  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const coursesData = await courseService.getCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setAlert({
        type: 'danger',
        message: 'Failed to load courses. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter courses based on search query
  const filteredCourses = searchQuery
    ? courses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : courses;
  
  // Toggle course selection
  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };
  
  // Select/deselect all courses
  const toggleAllCourses = () => {
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(filteredCourses.map(course => course.id));
    }
  };
  
  // Delete selected courses
  const deleteSelectedCourses = async () => {
    if (selectedCourses.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedCourses.length} course(s)?`)) {
      return;
    }
    
    try {
      await Promise.all(selectedCourses.map(id => courseService.deleteCourse(id)));
      
      setAlert({
        type: 'success',
        message: `Successfully deleted ${selectedCourses.length} course(s).`
      });
      
      setSelectedCourses([]);
      fetchCourses();
    } catch (error) {
      console.error('Failed to delete courses:', error);
      setAlert({
        type: 'danger',
        message: 'Failed to delete the selected courses. Please try again.'
      });
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <AdminLayout title="Course Management">
      <div className="space-y-6">
        {alert && (
          <Alert
            variant={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
        
        {/* Actions Bar */}
        <div className="bg-white shadow-card rounded-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Button 
                variant="primary"
                onClick={() => router.push('/admin/curriculum/courses/new')}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Add Course
              </Button>
              
              {selectedCourses.length > 0 && (
                <Button 
                  variant="danger"
                  onClick={deleteSelectedCourses}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  }
                >
                  Delete Selected
                </Button>
              )}
            </div>
            
            <div className="w-full sm:w-1/3">
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
        
        {/* Courses Table */}
        <div className="bg-white shadow-card rounded-card overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-neutral-200 rounded"></div>
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-16 bg-neutral-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-neutral-900">No courses found</h3>
              <p className="mt-1 text-sm text-neutral-500">
                {searchQuery 
                  ? `No courses matching "${searchQuery}"` 
                  : 'Get started by creating a new course.'}
              </p>
              <div className="mt-6">
                <Button 
                  onClick={() => router.push('/admin/curriculum/courses/new')}
                >
                  Add Course
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                          checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
                          onChange={toggleAllCourses}
                        />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Units
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filteredCourses.map((course) => (
                    <tr 
                      key={course.id}
                      className={`${
                        selectedCourses.includes(course.id) ? 'bg-primary-50' : ''
                      } hover:bg-neutral-50`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                            checked={selectedCourses.includes(course.id)}
                            onChange={() => toggleCourseSelection(course.id)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900">
                              {course.title}
                            </div>
                            <div className="text-sm text-neutral-500 line-clamp-1 max-w-md">
                              {course.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-500">
                          {formatDate(course.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">
                          {/* We'd fetch the actual unit count from the backend */}
                          {Math.floor(Math.random() * 10) + 1} units
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="success">Active</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/admin/curriculum/courses/${course.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => router.push(`/admin/curriculum/courses/${course.id}/units`)}
                            className="text-secondary-600 hover:text-secondary-900"
                          >
                            Units
                          </button>
                          <button
                            onClick={() => {
                              toggleCourseSelection(course.id);
                              deleteSelectedCourses();
                            }}
                            className="text-danger-600 hover:text-danger-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default CoursesManagementPage;