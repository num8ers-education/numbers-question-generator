import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { Select } from '@/components/atoms/Select/Select';
import { Checkbox } from '@/components/atoms/Checkbox/Checkbox';
import { useAI } from '@/context/AIContext';
import { AIPrompt, AIQuestion } from '@/types/ai';
import { DifficultyLevel, QuestionType } from '@/types/question';
import { courseService } from '@/services/courseService';
import questionService from '@/services/questionService';
import { Course, Unit, Topic } from '@/types/course';

interface QuestionGeneratorProps {
  onQuestionsGenerated?: (questions: AIQuestion[]) => void;
  onQuestionsSaved?: () => void;
}

export const QuestionGenerator: React.FC<QuestionGeneratorProps> = ({
  onQuestionsGenerated,
  onQuestionsSaved,
}) => {
  // AI context
  const { generateQuestions, isGenerating, generatedQuestions } = useAI();
  
  // Form state
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(5);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<QuestionType[]>([
    'MCQ', 'TrueFalse', 'Matching', 'FillInTheBlank'
  ]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('Medium');
  
  // Selected generated questions to save
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Load courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courseData = await courseService.getCourses();
        setCourses(courseData);
      } catch (error) {
        console.error('Failed to load courses:', error);
      }
    };
    
    loadCourses();
  }, []);
  
  // Load units when course changes
  useEffect(() => {
    const loadUnits = async () => {
      if (!selectedCourse) {
        setUnits([]);
        setSelectedUnit('');
        return;
      }
      
      try {
        const unitData = await courseService.getCourseUnits(selectedCourse);
        setUnits(unitData);
      } catch (error) {
        console.error('Failed to load units:', error);
      }
    };
    
    loadUnits();
  }, [selectedCourse]);
  
  // Load topics when unit changes
  useEffect(() => {
    const loadTopics = async () => {
      if (!selectedUnit) {
        setTopics([]);
        setSelectedTopic('');
        return;
      }
      
      try {
        const topicData = await courseService.getUnitTopics(selectedUnit);
        setTopics(topicData);
      } catch (error) {
        console.error('Failed to load topics:', error);
      }
    };
    
    loadTopics();
  }, [selectedUnit]);
  
  // Handle form submission
  const handleGenerateQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTopic) {
      alert('Please select a topic');
      return;
    }
    
    const prompt: AIPrompt = {
      course: courses.find(c => c.id === selectedCourse)?.title,
      unit: units.find(u => u.id === selectedUnit)?.title,
      topic: topics.find(t => t.id === selectedTopic)?.title,
      numberOfQuestions,
      questionTypes: selectedQuestionTypes,
      difficulty: selectedDifficulty,
    };
    
    try {
      const questions = await generateQuestions(prompt);
      
      if (onQuestionsGenerated) {
        onQuestionsGenerated(questions);
      }
      
      // Auto-select all questions
      setSelectedQuestions(questions.map(q => q.id));
    } catch (error) {
      console.error('Failed to generate questions:', error);
    }
  };
  
  // Handle saving selected questions
  const handleSaveQuestions = async () => {
    if (selectedQuestions.length === 0) return;
    
    setIsSaving(true);
    
    try {
      // Filter only selected questions
      const questionsToSave = generatedQuestions.filter(q => 
        selectedQuestions.includes(q.id)
      );
      
      // Save questions to database
      await questionService.saveGeneratedQuestions(questionsToSave);
      
      // Reset selected questions
      setSelectedQuestions([]);
      
      if (onQuestionsSaved) {
        onQuestionsSaved();
      }
    } catch (error) {
      console.error('Failed to save questions:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Toggle question selection
  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };
  
  // Toggle all questions
  const toggleAllQuestions = () => {
    if (selectedQuestions.length === generatedQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(generatedQuestions.map(q => q.id));
    }
  };
  
  // Toggle question type
  const toggleQuestionType = (type: QuestionType) => {
    setSelectedQuestionTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-card rounded-card p-6">
        <h2 className="text-xl font-semibold mb-4">Generate AI Questions</h2>
        <form onSubmit={handleGenerateQuestions} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              required
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </Select>
            
            <Select
              label="Unit"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              disabled={!selectedCourse}
              required
            >
              <option value="">Select a unit</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.title}
                </option>
              ))}
            </Select>
            
            <Select
              label="Topic"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={!selectedUnit}
              required
            >
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="number"
              label="Number of Questions"
              min={1}
              max={20}
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
              required
            />
            
            <Select
              label="Difficulty"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel)}
              required
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium leading-none text-neutral-700 mb-2 block">
              Question Types
            </label>
            <div className="flex flex-wrap gap-4">
              <Checkbox
                label="Multiple Choice"
                checked={selectedQuestionTypes.includes('MCQ')}
                onChange={() => toggleQuestionType('MCQ')}
              />
              <Checkbox
                label="True/False"
                checked={selectedQuestionTypes.includes('TrueFalse')}
                onChange={() => toggleQuestionType('TrueFalse')}
              />
              <Checkbox
                label="Matching"
                checked={selectedQuestionTypes.includes('Matching')}
                onChange={() => toggleQuestionType('Matching')}
              />
              <Checkbox
                label="Fill in the Blank"
                checked={selectedQuestionTypes.includes('FillInTheBlank')}
                onChange={() => toggleQuestionType('FillInTheBlank')}
              />
            </div>
          </div>
          
          <div className="pt-2">
            <Button
              type="submit"
              loading={isGenerating}
              disabled={!selectedTopic || selectedQuestionTypes.length === 0}
              fullWidth
            >
              Generate Questions
            </Button>
          </div>
        </form>
      </div>
      
      {generatedQuestions.length > 0 && (
        <div className="bg-white shadow-card rounded-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Generated Questions</h2>
            <div className="flex items-center space-x-3">
              <Checkbox
                label="Select All"
                checked={selectedQuestions.length === generatedQuestions.length}
                onChange={toggleAllQuestions}
              />
              <Button
                variant="primary"
                onClick={handleSaveQuestions}
                disabled={selectedQuestions.length === 0 || isSaving}
                loading={isSaving}
              >
                Save Selected Questions
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {generatedQuestions.map((question) => (
              <div
                key={question.id}
                className={`border p-4 rounded-md ${
                  selectedQuestions.includes(question.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200'
                }`}
              >
                <div className="flex items-start">
                  <Checkbox
                    checked={selectedQuestions.includes(question.id)}
                    onChange={() => toggleQuestionSelection(question.id)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="bg-neutral-100 text-neutral-800 text-xs px-2 py-1 rounded">
                          {question.type}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          question.difficulty === 'Easy'
                            ? 'bg-success-100 text-success-800'
                            : question.difficulty === 'Medium'
                              ? 'bg-warning-100 text-warning-800'
                              : 'bg-danger-100 text-danger-800'
                        }`}>
                          {question.difficulty}
                        </span>
                      </div>
                    </div>
                    <p className="font-medium mb-2">{question.text}</p>
                    
                    {/* Display question details based on type */}
                    {question.type === 'MCQ' && question.options && (
                      <ul className="list-disc pl-5 mb-2">
                        {question.options.map((option, index) => (
                          <li key={index} className={option.isCorrect ? 'font-medium text-success-700' : ''}>
                            {option.text} {option.isCorrect && '✓'}
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {question.type === 'TrueFalse' && (
                      <p className="mb-2">
                        Correct answer: <span className="font-medium">{question.correctAnswer ? 'True' : 'False'}</span>
                      </p>
                    )}
                    
                    <div className="mt-2 text-sm text-neutral-600">
                      <p className="font-medium">Explanation:</p>
                      <p>{question.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionGenerator;