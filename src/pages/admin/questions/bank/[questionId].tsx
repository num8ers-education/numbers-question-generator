import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/templates/AdminLayout/AdminLayout';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { Select } from '@/components/atoms/Select/Select';
import { Alert } from '@/components/atoms/Alert/Alert';
import courseService from '@/services/courseService';
import questionService from '@/services/questionService';
import { Course, Unit, Topic } from '@/types/course';
import { Question, QuestionType, DifficultyLevel, MCQQuestion, TrueFalseQuestion } from '@/types/question';

const QuestionEditPage: NextPage = () => {
  const router = useRouter();
  const { questionId } = router.query;
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  
  // Form state for the question
  const [formData, setFormData] = useState<{
    topicId: string;
    type: QuestionType;
    difficulty: DifficultyLevel;
    text: string;
    explanation: string;
    options?: { id: string; text: string; isCorrect: boolean }[];
    correctAnswer?: boolean;
  }>({
    topicId: '',
    type: 'MCQ',
    difficulty: 'Medium',
    text: '',
    explanation: '',
    options: [
      { id: '1', text: '', isCorrect: false },
      { id: '2', text: '', isCorrect: false },
      { id: '3', text: '', isCorrect: false },
      { id: '4', text: '', isCorrect: false },
    ],
  });
  
  const [errors, setErrors] = useState<{
    topicId?: string;
    text?: string;
    explanation?: string;
    options?: string;
    correctAnswer?: string;
    general?: string;
  }>({});
  
  // Fetch the question and related data
  useEffect(() => {
    const fetchQuestionData = async () => {
      if (!questionId) return;
      
      setIsLoading(true);
      
      try {
        // Fetch the question
        const questionData = await questionService.getQuestionById(questionId as string);
        setQuestion(questionData);
        
        // Fetch topic to get unit and course
        const topic = await courseService.getTopicById(questionData.topicId);
        if (topic) {
          // Set the topic ID
          setFormData(prev => ({ ...prev, topicId: topic.id }));
          
          // Get unit
          const unit = await courseService.getUnitById(topic.unitId);
          if (unit) {
            setSelectedUnit(unit.id);
            setSelectedCourse(unit.courseId);
            
            // Fetch all units for this course
            const unitsData = await courseService.getCourseUnits(unit.courseId);
            setUnits(unitsData);
            
            // Fetch all topics for this unit
            const topicsData = await courseService.getUnitTopics(unit.id);
            setTopics(topicsData);
          }
        }
        
        // Fetch all courses
        const coursesData = await courseService.getCourses();
        setCourses(coursesData);
        
        // Set form data based on question type
        if (questionData.type === 'MCQ') {
          const mcqQuestion = questionData as MCQQuestion;
          setFormData({
            topicId: questionData.topicId,
            type: questionData.type,
            difficulty: questionData.difficulty,
            text: questionData.text,
            explanation: questionData.explanation,
            options: mcqQuestion.options,
          });
        } else if (questionData.type === 'TrueFalse') {
          const tfQuestion = questionData as TrueFalseQuestion;
          setFormData({
            topicId: questionData.topicId,
            type: questionData.type,
            difficulty: questionData.difficulty,
            text: questionData.text,
            explanation: questionData.explanation,
            correctAnswer: tfQuestion.correctAnswer,
          });
        } else {
          // For other question types, just set the basic fields
          setFormData({
            topicId: questionData.topicId,
            type: questionData.type,
            difficulty: questionData.difficulty,
            text: questionData.text,
            explanation: questionData.explanation,
          });
        }
      } catch (error) {
        console.error('Failed to fetch question data:', error);
        setAlert({
          type: 'danger',
          message: 'Failed to load question. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestionData();
  }, [questionId]);
  
  // Fetch units when selected course changes
  useEffect(() => {
    const fetchUnits = async () => {
      if (!selectedCourse) {
        setUnits([]);
        setSelectedUnit('');
        return;
      }
      
      try {
        const unitsData = await courseService.getCourseUnits(selectedCourse);
        setUnits(unitsData);
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
        // Don't clear topicId here as it might be coming from the question
        return;
      }
      
      try {
        const topicsData = await courseService.getUnitTopics(selectedUnit);
        setTopics(topicsData);
      } catch (error) {
        console.error('Failed to fetch topics:', error);
      }
    };
    
    fetchTopics();
  }, [selectedUnit]);
  
  // Handle text/select input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      // If changing question type, reset some fields
      if (value === 'MCQ') {
        setFormData(prev => ({
          ...prev,
          type: value as QuestionType,
          options: [
            { id: '1', text: '', isCorrect: false },
            { id: '2', text: '', isCorrect: false },
            { id: '3', text: '', isCorrect: false },
            { id: '4', text: '', isCorrect: false },
          ],
          correctAnswer: undefined,
        }));
      } else if (value === 'TrueFalse') {
        setFormData(prev => ({
          ...prev,
          type: value as QuestionType,
          options: undefined,
          correctAnswer: false,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          type: value as QuestionType,
          // For other types, we'd need more specific handling
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear any related errors
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };
  
  // Handle MCQ option changes
  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    if (!formData.options) return;
    
    const newOptions = [...formData.options];
    if (field === 'isCorrect') {
      // If this option is being set to correct, set all others to incorrect
      newOptions.forEach((option, i) => {
        option.isCorrect = i === index ? Boolean(value) : false;
      });
    } else {
      newOptions[index][field] = value as string;
    }
    
    setFormData(prev => ({
      ...prev,
      options: newOptions,
    }));
    
    // Clear options error if it exists
    if (errors.options) {
      setErrors(prev => ({
        ...prev,
        options: undefined,
      }));
    }
  };
  
  // Handle true/false answer change
  const handleTrueFalseChange = (value: boolean) => {
    setFormData(prev => ({
      ...prev,
      correctAnswer: value,
    }));
    
    // Clear correctAnswer error if it exists
    if (errors.correctAnswer) {
      setErrors(prev => ({
        ...prev,
        correctAnswer: undefined,
      }));
    }
  };
  
  // Add a new option for MCQ
  const addOption = () => {
    if (!formData.options) return;
    
    const newId = (formData.options.length + 1).toString();
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), { id: newId, text: '', isCorrect: false }],
    }));
  };
  
  // Remove an option for MCQ
  const removeOption = (index: number) => {
    if (!formData.options || formData.options.length <= 2) return;
    
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      options: newOptions,
    }));
  };
  
  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!formData.topicId) {
      newErrors.topicId = 'Topic is required';
    }
    
    if (!formData.text.trim()) {
      newErrors.text = 'Question text is required';
    }
    
    if (!formData.explanation.trim()) {
      newErrors.explanation = 'Explanation is required';
    }
    
    if (formData.type === 'MCQ' && formData.options) {
      // Validate MCQ options
      if (formData.options.length < 2) {
        newErrors.options = 'At least 2 options are required';
      } else if (formData.options.some(option => !option.text.trim())) {
        newErrors.options = 'All options must have text';
      } else if (!formData.options.some(option => option.isCorrect)) {
        newErrors.options = 'At least one option must be correct';
      }
    } else if (formData.type === 'TrueFalse') {
      // Validate true/false
      if (formData.correctAnswer === undefined) {
        newErrors.correctAnswer = 'Correct answer must be selected';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !questionId) return;
    
    setIsSubmitting(true);
    setAlert(null);
    
    try {
      let updatedQuestion;
      
      if (formData.type === 'MCQ') {
        updatedQuestion = await questionService.updateQuestion(questionId as string, {
          ...formData,
          options: formData.options,
        } as MCQQuestion);
      } else if (formData.type === 'TrueFalse') {
        updatedQuestion = await questionService.updateQuestion(questionId as string, {
          ...formData,
          correctAnswer: formData.correctAnswer,
        } as TrueFalseQuestion);
      } else {
        updatedQuestion = await questionService.updateQuestion(questionId as string, formData);
      }
      
      setQuestion(updatedQuestion);
      setAlert({
        type: 'success',
        message: 'Question updated successfully!',
      });
      
      // Scroll to top to show alert
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Failed to update question:', error);
      setAlert({
        type: 'danger',
        message: 'Failed to update question. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete the question
  const handleDelete = async () => {
    if (!questionId) return;
    
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await questionService.deleteQuestion(questionId as string);
      router.push('/admin/questions/bank');
    } catch (error) {
      console.error('Failed to delete question:', error);
      setAlert({
        type: 'danger',
        message: 'Failed to delete question. Please try again.',
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <AdminLayout title="Edit Question">
      <div className="max-w-5xl mx-auto">
        {alert && (
          <Alert
            variant={alert.type}
            message={alert.message}
            className="mb-6"
            onClose={() => setAlert(null)}
          />
        )}
        
        <div className="bg-white shadow-card rounded-card p-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
              <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-32 bg-neutral-200 rounded"></div>
              <div className="h-20 bg-neutral-200 rounded"></div>
              <div className="h-10 bg-neutral-200 rounded w-1/3"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Edit Question {question?.aiGenerated && <span className="text-sm text-primary-600">(AI Generated)</span>}
                </h2>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  Delete Question
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Select
                    label="Course"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <Select
                    label="Unit"
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    disabled={!selectedCourse}
                  >
                    <option value="">Select Unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.title}
                      </option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <Select
                    label="Topic"
                    name="topicId"
                    value={formData.topicId}
                    onChange={handleInputChange}
                    disabled={!selectedUnit}
                    error={errors.topicId}
                    required
                  >
                    <option value="">Select Topic</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.title}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Select
                    label="Question Type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="MCQ">Multiple Choice</option>
                    <option value="TrueFalse">True/False</option>
                    <option value="Matching">Matching</option>
                    <option value="FillInTheBlank">Fill in the Blank</option>
                  </Select>
                </div>
                
                <div>
                  <Select
                    label="Difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-neutral-700">
                  Question Text
                </label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  placeholder="Enter the question text..."
                  className={`flex min-h-24 w-full rounded-md border ${
                    errors.text ? 'border-danger-500' : 'border-neutral-300'
                  } bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
                    errors.text ? 'focus:ring-danger-500' : 'focus:ring-primary-600'
                  } focus:border-transparent`}
                  required
                />
                {errors.text && (
                  <p className="text-sm text-danger-500">{errors.text}</p>
                )}
              </div>
              
              {/* Question-type specific fields */}
              {formData.type === 'MCQ' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium leading-none text-neutral-700">
                      Options (select the correct answer)
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                    >
                      Add Option
                    </Button>
                  </div>
                  
                  {errors.options && (
                    <p className="text-sm text-danger-500">{errors.options}</p>
                  )}
                  
                  <div className="space-y-3">
                    {formData.options?.map((option, index) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={option.isCorrect}
                          onChange={() => handleOptionChange(index, 'isCorrect', true)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <Input
                          value={option.text}
                          onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1"
                          required
                        />
                        {formData.options && formData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="text-neutral-400 hover:text-danger-500"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {formData.type === 'TrueFalse' && (
                <div className="space-y-4">
                  <label className="text-sm font-medium leading-none text-neutral-700">
                    Correct Answer
                  </label>
                  
                  {errors.correctAnswer && (
                    <p className="text-sm text-danger-500">{errors.correctAnswer}</p>
                  )}
                  
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="true-option"
                        checked={formData.correctAnswer === true}
                        onChange={() => handleTrueFalseChange(true)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="true-option" className="ml-2 block text-sm text-neutral-700">
                        True
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="false-option"
                        checked={formData.correctAnswer === false}
                        onChange={() => handleTrueFalseChange(false)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="false-option" className="ml-2 block text-sm text-neutral-700">
                        False
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              {(formData.type === 'Matching' || formData.type === 'FillInTheBlank') && (
                <div className="p-4 bg-neutral-50 rounded-md">
                  <p className="text-sm text-neutral-500">
                    {formData.type === 'Matching' 
                      ? 'Matching questions must be edited directly in the database or via the API.' 
                      : 'Fill in the blank questions must be edited directly in the database or via the API.'}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-neutral-700">
                  Explanation
                </label>
                <textarea
                  name="explanation"
                  value={formData.explanation}
                  onChange={handleInputChange}
                  placeholder="Provide an explanation for the correct answer..."
                  className={`flex min-h-32 w-full rounded-md border ${
                    errors.explanation ? 'border-danger-500' : 'border-neutral-300'
                  } bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
                    errors.explanation ? 'focus:ring-danger-500' : 'focus:ring-primary-600'
                  } focus:border-transparent`}
                  required
                />
                {errors.explanation && (
                  <p className="text-sm text-danger-500">{errors.explanation}</p>
                )}
              </div>
              
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default QuestionEditPage;