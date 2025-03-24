import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/templates/AdminLayout/AdminLayout';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { Alert } from '@/components/atoms/Alert/Alert';
import courseService from '@/services/courseService';
import { Course } from '@/types/course';

const EditCoursePage: NextPage = () => {
  const router = useRouter();
  const { courseId } = router.query;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
  });
  
  const [originalData, setOriginalData] = useState<Course | null>(null);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    imageUrl?: string;
    general?: string;
  }>({});
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  
  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      setIsLoading(true);
      try {
        const course = await courseService.getCourseById(courseId as string);
        setOriginalData(course);
        setFormData({
          title: course.title,
          description: course.description,
          imageUrl: course.imageUrl || '',
        });
      } catch (error) {
        console.error('Failed to fetch course:', error);
        setAlert({
          type: 'danger',
          message: 'Failed to load course data. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourse();
  }, [courseId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };
  
  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    // Optional validation for image URL
    if (formData.imageUrl && !formData.imageUrl.match(/^https?:\/\/.+\.(jpeg|jpg|png|gif|webp)$/i)) {
      newErrors.imageUrl = 'Please enter a valid image URL (http/https with image extension)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !courseId) return;
    
    setIsSubmitting(true);
    setAlert(null);
    
    try {
      const updatedCourse = await courseService.updateCourse(courseId as string, {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl || undefined,
      });
      
      setOriginalData(updatedCourse);
      setAlert({
        type: 'success',
        message: 'Course updated successfully!',
      });
    } catch (error) {
      console.error('Failed to update course:', error);
      setAlert({
        type: 'danger',
        message: 'Failed to update course. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!courseId) return;
    
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await courseService.deleteCourse(courseId as string);
      router.push('/admin/curriculum/courses');
    } catch (error) {
      console.error('Failed to delete course:', error);
      setAlert({
        type: 'danger',
        message: 'Failed to delete course. Please try again.',
      });
      setIsSubmitting(false);
    }
  };
  
  const hasChanges = (): boolean => {
    if (!originalData) return false;
    
    return (
      formData.title !== originalData.title ||
      formData.description !== originalData.description ||
      formData.imageUrl !== (originalData.imageUrl || '')
    );
  };
  
  return (
    <AdminLayout title="Edit Course">
      <div className="max-w-3xl mx-auto">
        {alert && (
          <Alert
            variant={alert.type}
            message={alert.message}
            className="mb-6"
            onClose={() => setAlert(null)}
          />
        )}
        
        {isLoading ? (
          <div className="bg-white shadow-card rounded-card p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
              <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-32 bg-neutral-200 rounded"></div>
              <div className="h-10 bg-neutral-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">{originalData?.title}</h1>
                <p className="text-neutral-500">Edit course details</p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/admin/curriculum/courses/${courseId}/units`)}
                >
                  Manage Units
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  Delete Course
                </Button>
              </div>
            </div>
            
            <div className="bg-white shadow-card rounded-card p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Input
                    label="Course Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Introduction to Programming"
                    error={errors.title}
                    required
                  />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-neutral-700">
                      Course Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Provide a detailed description of the course..."
                      className={`flex min-h-32 w-full rounded-md border ${
                        errors.description ? 'border-danger-500' : 'border-neutral-300'
                      } bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
                        errors.description ? 'focus:ring-danger-500' : 'focus:ring-primary-600'
                      } focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50`}
                      required
                    />
                    {errors.description && (
                      <p className="text-sm text-danger-500">{errors.description}</p>
                    )}
                  </div>
                  
                  <Input
                    label="Course Image URL (Optional)"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    error={errors.imageUrl}
                  />
                  
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-2">Image Preview</p>
                      <div className="border border-neutral-200 rounded-md overflow-hidden h-40 w-full">
                        <img
                          src={formData.imageUrl}
                          alt="Course preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/640x360?text=Invalid+Image+URL';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t border-neutral-200 flex items-center justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/admin/curriculum/courses')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={isSubmitting || !hasChanges()}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default EditCoursePage;