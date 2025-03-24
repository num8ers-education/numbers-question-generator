import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/templates/AdminLayout/AdminLayout';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { Select } from '@/components/atoms/Select/Select';
import { Alert } from '@/components/atoms/Alert/Alert';
import courseService from '@/services/courseService';
import { Course, Unit, Topic } from '@/types/course';

const TopicsManagementPage: NextPage = () => {
  const router = useRouter();
  const { unitId } = router.query;
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>(unitId as string || '');
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
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  
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
  
  // Fetch initial unit data if unitId is provided
  useEffect(() => {
    const fetchUnitData = async () => {
      if (!unitId) return;
      
      try {
        // Get unit to determine course
        const unit = await courseService.getUnitById(unitId as string);
        if (unit) {
          setSelectedUnit(unit.id);
          setSelectedCourse(unit.courseId);
          
          // Fetch all units for this course
          const unitsData = await courseService.getCourseUnits(unit.courseId);
          setUnits(unitsData);
        }
      } catch (error) {
        console.error('Failed to fetch unit data:', error);
      }
    };
    
    fetchUnitData();
  }, [unitId]);
  
  // Fetch units when selected course changes
  useEffect(() => {
    const fetchUnits = async () => {
      if (!selectedCourse) {
        setUnits([]);
        return;
      }
      
      try {
        const unitsData = await courseService.getCourseUnits(selectedCourse);
        setUnits(unitsData);
        
        // If no unit is selected, select the first one
        if (!selectedUnit && unitsData.length > 0) {
          setSelectedUnit(unitsData[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch units:', error);
      }
    };
    
    fetchUnits();
  }, [selectedCourse]);
  
  // Fetch topics when selected unit changes
  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedUnit) {
        setTopics([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const topicsData = await courseService.getUnitTopics(selectedUnit);
        setTopics(topicsData);
      } catch (error) {
        console.error('Failed to fetch topics:', error);
        setAlert({
          type: 'danger',
          message: 'Failed to load topics. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopics();
  }, [selectedUnit]);
  
  // Filter topics based on search query
  const filteredTopics = searchQuery
    ? topics.filter(topic => 
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : topics;
  
  // Sort topics by order
  const sortedTopics = [...filteredTopics].sort((a, b) => a.order - b.order);
  
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
      newErrors.title = 'Topic title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Topic description is required';
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
    
    if (!validate() || !selectedUnit) return;
    
    setIsSubmitting(true);
    setAlert(null);
    
    try {
      if (editingTopicId) {
        // Update existing topic
        const updatedTopic = await courseService.updateTopic(editingTopicId, {
          ...formData,
          unitId: selectedUnit,
        });
        
        setTopics(prev => prev.map(topic => topic.id === editingTopicId ? updatedTopic : topic));
        setAlert({
          type: 'success',
          message: 'Topic updated successfully!',
        });
      } else {
        // Create new topic
        const newTopic = await courseService.createTopic({
          ...formData,
          unitId: selectedUnit,
        });
        
        setTopics(prev => [...prev, newTopic]);
        setAlert({
          type: 'success',
          message: 'Topic created successfully!',
        });
      }
      
      // Reset form
      setFormData({ title: '', description: '', order: topics.length + 1 });
      setEditingTopicId(null);
      setIsFormVisible(false);
    } catch (error) {
      console.error(`Failed to ${editingTopicId ? 'update' : 'create'} topic:`, error);
      setAlert({
        type: 'danger',
        message: `Failed to ${editingTopicId ? 'update' : 'create'} topic. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle edit topic
  const handleEditTopic = (topic: Topic) => {
    setFormData({
      title: topic.title,
      description: topic.description,
      order: topic.order,
    });
    setEditingTopicId(topic.id);
    setIsFormVisible(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle delete topic
  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic? This will also delete all questions associated with this topic.')) {
      return;
    }
    
    try {
      await courseService.deleteTopic(topicId);
      setTopics(prev => prev.filter(topic => topic.id !== topicId));
      setAlert({
        type: 'success',
        message: 'Topic deleted successfully!',
      });
    } catch (error) {
      console.error('Failed to delete topic:', error);
      setAlert({
        type: 'danger',
        message: 'Failed to delete topic. Please try again.',
      });
    }
  };
  
  // Handle course change
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    setSelectedUnit('');
  };
  
  // Handle unit change
  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unitId = e.target.value;
    setSelectedUnit(unitId);
    
    // Update URL query params
    router.push({
      pathname: router.pathname,
      query: unitId ? { unitId } : {},
    }, undefined, { shallow: true });
  };
  
  // Navigate to generate questions page for a topic
  const handleGenerateQuestions = (topicId: string) => {
    router.push({
      pathname: '/admin/questions/generate',
      query: { topicId },
    });
  };
  
  // Get selected unit name
  const getUnitName = () => {
    if (!selectedUnit) return '';
    const unit = units.find(u => u.id === selectedUnit);
    return unit ? unit.title : '';
  };
  
  // Get course name for selected unit
  const getCourseName = () => {
    if (!selectedCourse) return '';
    const course = courses.find(c => c.id === selectedCourse);
    return course ? course.title : '';
  };
  
  return (
    <AdminLayout title="Topic Management">
      <div className="space-y-6">
        {alert && (
          <Alert
            variant={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
        
        {/* Course and Unit selection */}
        <div className="bg-white shadow-card rounded-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            
            <div>
              <Select
                label="Select Unit"
                value={selectedUnit}
                onChange={handleUnitChange}
                disabled={!selectedCourse || units.length === 0}
              >
                <option value="">Select a unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.title}
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="flex items-end">
              {selectedUnit && (
                <Button
                  onClick={() => {
                    setIsFormVisible(!isFormVisible);
                    setEditingTopicId(null);
                    setFormData({ 
                      title: '', 
                      description: '', 
                      order: topics.length + 1 
                    });
                  }}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                >
                  {isFormVisible ? 'Cancel' : 'Add Topic'}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Topic form */}
        {isFormVisible && selectedUnit && (
          <div className="bg-white shadow-card rounded-card p-6">
            <h2 className="text-lg font-medium mb-4">
              {editingTopicId ? 'Edit Topic' : 'Add New Topic'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Topic Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Variables and Data Types"
                error={errors.title}
                required
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-neutral-700">
                  Topic Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide a description of what students will learn in this topic..."
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
                  {editingTopicId ? 'Update Topic' : 'Create Topic'}
                </Button>
              </div>
            </form>
          </div>
        )}
        
        {/* Topics list */}
        <div className="bg-white shadow-card rounded-card p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-medium">
                {selectedUnit 
                  ? `Topics for ${getUnitName()}${getCourseName() ? ` (${getCourseName()})` : ''}`
                  : 'Topics'}
              </h2>
              {selectedUnit && (
                <p className="text-sm text-neutral-500 mt-1">
                  Manage topics or generate questions for each topic
                </p>
              )}
            </div>
            
            <div className="w-64">
              <Input 
                placeholder="Search topics..." 
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
          
          {!selectedUnit ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-neutral-900">No unit selected</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Please select a course and unit to view its topics.
              </p>
            </div>
          ) : isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-neutral-200 rounded"></div>
              ))}
            </div>
          ) : sortedTopics.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-neutral-900">No topics found</h3>
              <p className="mt-1 text-sm text-neutral-500">
                {searchQuery 
                  ? `No topics matching "${searchQuery}"`
                  : 'Get started by creating a new topic.'}
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <Button 
                    onClick={() => {
                      setIsFormVisible(true);
                      setEditingTopicId(null);
                      setFormData({ title: '', description: '', order: 1 });
                    }}
                  >
                    Add Topic
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTopics.map((topic) => (
                <div 
                  key={topic.id} 
                  className="border border-neutral-200 rounded-md p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-800 rounded-full mr-2 text-sm font-medium">
                          {topic.order}
                        </span>
                        <h3 className="text-lg font-medium">{topic.title}</h3>
                      </div>
                      <p className="text-neutral-500 mt-1">{topic.description}</p>
                    </div>
                    <div className="flex mt-4 md:mt-0 space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleGenerateQuestions(topic.id)}
                        leftIcon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        }
                      >
                        Generate Questions
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTopic(topic)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteTopic(topic.id)}
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

export default TopicsManagementPage;