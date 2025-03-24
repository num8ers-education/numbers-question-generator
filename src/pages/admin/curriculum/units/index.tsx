import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/templates/AdminLayout/AdminLayout';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { Select } from '@/components/atoms/Select/Select';
import { Alert } from '@/components/atoms/Alert/Alert';
import courseService from '@/services/courseService';
import { Course, Unit } from '@/types/course';

const UnitsManagementPage: NextPage = () => {
  const router = useRouter();
  const { courseId } = router.query;
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>(courseId as string || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    order: number;
  }>({
    title: '',
    description: '',
    order: 1,
  });
  
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    order?: string;
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  
  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await courseService.getCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setAlert({
          type: 'danger',
          message: 'Failed to load courses. Please try again.',
        });
      }
    };
    
    fetchCourses();
  }, []);
  
  // Update selected course when courseId changes
  useEffect(() => {
    if (courseId) {
      setSelectedCourse(courseId as string);
    }
  }, [courseId]);
  
  // Fetch units when selected course changes
  useEffect(() => {
    const fetchUnits = async () => {
      if (!selectedCourse) {
        setUnits([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const unitsData = await courseService.getCourseUnits(selectedCourse);
        setUnits(unitsData);
      } catch (error) {
        console.error('Failed to fetch units:', error);
        setAlert({
          type: 'danger',
          message: 'Failed to load units. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUnits();
  }, [selectedCourse]);
  
  // Filter units based on search query
  const filteredUnits = searchQuery
    ? units.filter(unit => 
        unit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : units;
  
  // Sort units by order
  const sortedUnits = [...filteredUnits].sort((a, b) => a.order - b.order);
  
  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === 'order' ? parseInt(value) : value 
    });
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };
  
  // Validate form
  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Unit title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Unit description is required';
    }
    
    if (formData.order < 1) {
      newErrors.order = 'Order must be at least 1';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !selectedCourse) return;
    
    setIsSubmitting(true);
    setAlert(null);
    
    try {
      if (editingUnitId) {
        // Update existing unit
        const updatedUnit = await courseService.updateUnit(editingUnitId, {
          ...formData,
          courseId: selectedCourse,
        });
        
        setUnits(prev => prev.map(unit => unit.id === editingUnitId ? updatedUnit : unit));
        setAlert({
          type: 'success',
          message: 'Unit updated successfully!',
        });
      } else {
        // Create new unit
        const newUnit = await courseService.createUnit({
          ...formData,
          courseId: selectedCourse,
        });
        
        setUnits(prev => [...prev, newUnit]);
        setAlert({
          type: 'success',
          message: 'Unit created successfully!',
        });
      }
      
      // Reset form
      setFormData({ title: '', description: '', order: units.length + 1 });
      setEditingUnitId(null);
      setIsFormVisible(false);
    } catch (error) {
      console.error(`Failed to ${editingUnitId ? 'update' : 'create'} unit:`, error);
      setAlert({
        type: 'danger',
        message: `Failed to ${editingUnitId ? 'update' : 'create'} unit. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle edit unit
  const handleEditUnit = (unit: Unit) => {
    setFormData({
      title: unit.title,
      description: unit.description,
      order: unit.order,
    });
    setEditingUnitId(unit.id);
    setIsFormVisible(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle delete unit
  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Are you sure you want to delete this unit? This will also delete all topics associated with this unit.')) {
      return;
    }
    
    try {
      await courseService.deleteUnit(unitId);
      setUnits(prev => prev.filter(unit => unit.id !== unitId));
      setAlert({
        type: 'success',
        message: 'Unit deleted successfully!',
      });
    } catch (error) {
      console.error('Failed to delete unit:', error);
      setAlert({
        type: 'danger',
        message: 'Failed to delete unit. Please try again.',
      });
    }
  };
  
  // Handle course change
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    
    // Update URL query params
    router.push({
      pathname: router.pathname,
      query: courseId ? { courseId } : {},
    }, undefined, { shallow: true });
  };
  
  return (
    <AdminLayout title="Unit Management">
      <div className="space-y-6">
        {alert && (
          <Alert
            variant={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
        
        {/* Course selection */}
        <div className="bg-white shadow-card rounded-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Select
                label="Select Course"
                value={selectedCourse}
                onChange={handleCourseChange}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="flex items-end">
              {selectedCourse && (
                <Button
                  onClick={() => {
                    setIsFormVisible(!isFormVisible);
                    setEditingUnitId(null);
                    setFormData({ 
                      title: '', 
                      description: '', 
                      order: units.length + 1 
                    });
                  }}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                >
                  {isFormVisible ? 'Cancel' : 'Add Unit'}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Unit form */}
        {isFormVisible && selectedCourse && (
          <div className="bg-white shadow-card rounded-card p-6">
            <h2 className="text-lg font-medium mb-4">
              {editingUnitId ? 'Edit Unit' : 'Add New Unit'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Unit Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Introduction to Variables"
                error={errors.title}
                required
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-neutral-700">
                  Unit Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide a description of what students will learn in this unit..."
                  className={`flex min-h-24 w-full rounded-md border ${
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
              
              <div className="w-32">
                <Input
                  label="Order"
                  name="order"
                  type="number"
                  min={1}
                  value={formData.order.toString()}
                  onChange={handleChange}
                  error={errors.order}
                  required
                />
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {editingUnitId ? 'Update Unit' : 'Create Unit'}
                </Button>
              </div>
            </form>
          </div>
        )}
        
        {/* Units list */}
        <div className="bg-white shadow-card rounded-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">
              {selectedCourse 
                ? `Units${courses.find(c => c.id === selectedCourse)?.title ? ` for ${courses.find(c => c.id === selectedCourse)?.title}` : ''}`
                : 'Units'}
            </h2>
            
            <div className="w-64">
              <Input 
                placeholder="Search units..." 
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
          
          {!selectedCourse ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-neutral-900">No course selected</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Please select a course to view its units.
              </p>
            </div>
          ) : isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-neutral-200 rounded"></div>
              ))}
            </div>
          ) : sortedUnits.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-neutral-900">No units found</h3>
              <p className="mt-1 text-sm text-neutral-500">
                {searchQuery 
                  ? `No units matching "${searchQuery}"`
                  : 'Get started by creating a new unit.'}
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <Button 
                    onClick={() => {
                      setIsFormVisible(true);
                      setEditingUnitId(null);
                      setFormData({ title: '', description: '', order: 1 });
                    }}
                  >
                    Add Unit
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedUnits.map((unit) => (
                <div 
                  key={unit.id} 
                  className="border border-neutral-200 rounded-md p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-800 rounded-full mr-2 text-sm font-medium">
                          {unit.order}
                        </span>
                        <h3 className="text-lg font-medium">{unit.title}</h3>
                      </div>
                      <p className="text-neutral-500 mt-1">{unit.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/curriculum/units/${unit.id}/topics`)}
                      >
                        Topics
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUnit(unit)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteUnit(unit.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default UnitsManagementPage;