import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/templates/AdminLayout/AdminLayout';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { Alert } from '@/components/atoms/Alert/Alert';
import courseService from '@/services/courseService';

const NewCoursePage: NextPage = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
  });
  
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    imageUrl?: string;
    general?: string;
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  
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
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    setAlert(null);
    
    try {
      const newCourse = await courseService.createCourse({
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl || undefined,
      });
      
      setAlert({
        type: 'success',
        message: 'Course created successfully!',
      });
      
      // Redirect to the course edit page after a short delay
      setTimeout(() => {
        router.push(`/admin/curriculum/courses/${newCourse.id}`);
      }, 1500);
    } catch (error) {
      console.error('Failed to create course:', error);
      setAlert({
        type: 'danger',
        message: 'Failed to create course. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AdminLayout title="Create New Course">
      <div className="max-w-3xl mx-auto">
        {alert && (
          <Alert
            variant={alert.type}
            message={alert.message}
            className="mb-6"
            onClose={() => setAlert(null)}
          />
        )}
        
        <div className="bg-white shadow-card rounded-card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Course Information</h2>
              <p className="text-neutral-500 mb-6">
                Create a new course for your curriculum. You'll be able to add units and topics after creating the course.
              </p>
            </div>
            
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
            </div>
            
            <div className="pt-4 border-t border-neutral-200 flex items-center justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Create Course
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewCoursePage;