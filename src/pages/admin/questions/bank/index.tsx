import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/templates/AdminLayout/AdminLayout';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { Select } from '@/components/atoms/Select/Select';
import { Checkbox } from '@/components/atoms/Checkbox/Checkbox';
import { Badge } from '@/components/atoms/Badge/Badge';
import { Alert } from '@/components/atoms/Alert/Alert';
import courseService from '@/services/courseService';
import questionService from '@/services/questionService';
import { Course, Unit, Topic } from '@/types/course';
import { Question, QuestionType, DifficultyLevel } from '@/types/question';

const QuestionBankPage: NextPage = () => {
  const router = useRouter();
  const { topicId } = router.query;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>(topicId as string || '');
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<DifficultyLevel[]>([]);
  const [aiGeneratedFilter, setAiGeneratedFilter] = useState<boolean | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  
  // Question types and difficulties for filters
  const questionTypes: QuestionType[] = ['MCQ', 'TrueFalse', 'Matching', 'FillInTheBlank'];
  const difficultyLevels: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];
  
  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await courseService.getCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };
    
    fetchCourses();
  }, []);
  
  // Fetch initial topic data if topicId is provided
  useEffect(() => {
    const fetchTopicData = async () => {
      if (!topicId) return;
      
      try {
        // Get topic to determine unit and course
        const topic = await courseService.getTopicById(topicId as string);
        if (topic) {
          setSelectedTopic(topic.id);
          
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
      } catch (error) {
        console.error('Failed to fetch topic data:', error);
      }
    };
    
    fetchTopicData();
  }, [topicId]);
  
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
        setSelectedTopic('');
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
  
  // Fetch questions when filters change
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      setSelectedQuestions([]);
      
      try {
        let fetchedQuestions: Question[];
        
        if (selectedTopic) {
          fetchedQuestions = await questionService.getQuestions(selectedTopic);
        } else {
          fetchedQuestions = await questionService.getQuestions();
        }
        
        // Apply client-side filters
        if (selectedTypes.length > 0 || selectedDifficulties.length > 0 || aiGeneratedFilter !== null) {
          fetchedQuestions = fetchedQuestions.filter(question => {
            const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(question.type);
            const difficultyMatch = selectedDifficulties.length === 0 || selectedDifficulties.includes(question.difficulty);
            const aiGeneratedMatch = aiGeneratedFilter === null || question.aiGenerated === aiGeneratedFilter;
            
            return typeMatch && difficultyMatch && aiGeneratedMatch;
          });
        }
        
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
        setAlert({
          type: 'danger',
          message: 'Failed to load questions. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestions();
  }, [selectedTopic, selectedTypes, selectedDifficulties, aiGeneratedFilter]);
  
  // Filter questions based on search query
  const filteredQuestions = searchQuery
    ? questions.filter(question => 
        question.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.explanation.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : questions;
  
  // Toggle question selection
  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };
  
  // Select/deselect all questions
  const toggleAllQuestions = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map(q => q.id));
    }
  };
  
  // Delete selected questions
  const deleteSelectedQuestions = async () => {
    if (selectedQuestions.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedQuestions.length} question(s)?`)) {
      return;
    }
    
    try {
      await Promise.all(selectedQuestions.map(id => questionService.deleteQuestion(id)));
      
      setAlert({
        type: 'success',
        message: `Successfully deleted ${selectedQuestions.length} question(s).`
      });
      
      // Remove deleted questions from state
      setQuestions(prev => prev.filter(q => !selectedQuestions.includes(q.id)));
      setSelectedQuestions([]);
    } catch (error) {
      console.error('Failed to delete questions:', error);
      setAlert({
        type: 'danger',
        message: 'Failed to delete the selected questions. Please try again.'
      });
    }
  };
  
  // Toggle question type filter
  const toggleQuestionType = (type: QuestionType) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  // Toggle difficulty filter
  const toggleDifficulty = (difficulty: DifficultyLevel) => {
    setSelectedDifficulties(prev => 
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedDifficulties([]);
    setAiGeneratedFilter(null);
    setSearchQuery('');
  };
  
  // Render question content preview
  const renderQuestionPreview = (question: Question) => {
    switch (question.type) {
      case 'MCQ':
        return (
          <div className="text-sm text-neutral-600">
            <p className="font-medium">{question.text}</p>
            <div className="mt-2 space-y-1">
              {(question as any).options.map((option: any, index: number) => (
                <div key={index} className={option.isCorrect ? 'text-success-600 font-medium' : ''}>
                  {option.isCorrect ? '✓ ' : ''}
                  {option.text}
                </div>
              ))}
            </div>
          </div>
        );
      case 'TrueFalse':
        return (
          <div className="text-sm text-neutral-600">
            <p className="font-medium">{question.text}</p>
            <p className="mt-2 text-success-600 font-medium">
              Answer: {(question as any).correctAnswer ? 'True' : 'False'}
            </p>
          </div>
        );
      case 'Matching':
        return (
          <div className="text-sm text-neutral-600">
            <p className="font-medium">{question.text}</p>
            <div className="mt-2">
              <p>Matching pairs question</p>
            </div>
          </div>
        );
      case 'FillInTheBlank':
        return (
          <div className="text-sm text-neutral-600">
            <p className="font-medium">{question.text}</p>
            <div className="mt-2">
              <p>Fill in the blank question</p>
            </div>
          </div>
        );
      default:
        return <p className="text-sm text-neutral-600">{question.text}</p>;
    }
  };
  
  return (
    <AdminLayout title="Question Bank">
      <div className="space-y-6">
        {alert && (
          <Alert
            variant={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
        
        {/* Filters */}
        <div className="bg-white shadow-card rounded-card p-6">
          <h2 className="text-lg font-medium mb-4">Filter Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Select
                label="Course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">All Courses</option>
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
                <option value="">All Units</option>
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
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={!selectedUnit}
              >
                <option value="">All Topics</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium mb-2">Question Type</p>
              <div className="space-y-2">
                {questionTypes.map((type) => (
                  <Checkbox
                    key={type}
                    label={type}
                    checked={selectedTypes.includes(type)}
                    onChange={() => toggleQuestionType(type)}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Difficulty</p>
              <div className="space-y-2">
                {difficultyLevels.map((difficulty) => (
                  <Checkbox
                    key={difficulty}
                    label={difficulty}
                    checked={selectedDifficulties.includes(difficulty)}
                    onChange={() => toggleDifficulty(difficulty)}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Source</p>
              <div className="space-y-2">
                <Checkbox
                  label="AI Generated"
                  checked={aiGeneratedFilter === true}
                  onChange={() => setAiGeneratedFilter(aiGeneratedFilter === true ? null : true)}
                />
                <Checkbox
                  label="Manually Created"
                  checked={aiGeneratedFilter === false}
                  onChange={() => setAiGeneratedFilter(aiGeneratedFilter === false ? null : false)}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={selectedTypes.length === 0 && selectedDifficulties.length === 0 && aiGeneratedFilter === null && !searchQuery}
            >
              Clear Filters
            </Button>
            
            <Button
              variant="primary"
              onClick={() => router.push('/admin/questions/generate')}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              Generate Questions
            </Button>
          </div>
        </div>
        
        {/* Question list */}
        <div className="bg-white shadow-card rounded-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
            <div>
              <h2 className="text-lg font-medium">Questions</h2>
              <p className="text-sm text-neutral-500">
                {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="flex space-x-3">
              <div className="w-64">
                <Input 
                  placeholder="Search questions..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
              
              {selectedQuestions.length > 0 && (
                <Button
                  variant="danger"
                  onClick={deleteSelectedQuestions}
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
          </div>
          
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-neutral-200 rounded"></div>
              ))}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-neutral-900">No questions found</h3>
              <p className="mt-1 text-sm text-neutral-500">
                {
                  (selectedTypes.length > 0 || selectedDifficulties.length > 0 || aiGeneratedFilter !== null || searchQuery)
                    ? 'Try adjusting your filters to see more results.'
                    : 'Get started by generating questions or selecting a topic.'
                }
              </p>
              {!(selectedTypes.length > 0 || selectedDifficulties.length > 0 || aiGeneratedFilter !== null || searchQuery) && (
                <div className="mt-6">
                  <Button
                    onClick={() => router.push('/admin/questions/generate')}
                  >
                    Generate Questions
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <Checkbox
                  label={`Select All (${filteredQuestions.length})`}
                  checked={selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0}
                  onChange={toggleAllQuestions}
                />
              </div>
              
              <div className="space-y-4">
                {filteredQuestions.map((question) => (
                  <div
                    key={question.id}
                    className={`border rounded-md overflow-hidden transition-colors ${
                      selectedQuestions.includes(question.id) 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-neutral-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start">
                        <div className="pt-1">
                          <Checkbox
                            checked={selectedQuestions.includes(question.id)}
                            onChange={() => toggleQuestionSelection(question.id)}
                          />
                        </div>
                        
                        <div className="ml-3 flex-1">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant={
                              question.type === 'MCQ' ? 'primary' :
                              question.type === 'TrueFalse' ? 'secondary' :
                              question.type === 'Matching' ? 'warning' : 'success'
                            }>
                              {question.type}
                            </Badge>
                            
                            <Badge variant={
                              question.difficulty === 'Easy' ? 'success' :
                              question.difficulty === 'Medium' ? 'warning' : 'danger'
                            }>
                              {question.difficulty}
                            </Badge>
                            
                            {question.aiGenerated && (
                              <Badge variant="outline">AI Generated</Badge>
                            )}
                          </div>
                          
                          <div>{renderQuestionPreview(question)}</div>
                          
                          <div className="mt-4 flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/questions/bank/${question.id}`)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                toggleQuestionSelection(question.id);
                                deleteSelectedQuestions();
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default QuestionBankPage;