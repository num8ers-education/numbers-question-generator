import React, { useState, useEffect } from 'react';
import { Question, StudentAnswer } from '@/types/question';
import { Button } from '@/components/atoms/Button/Button';
import QuestionCard from '@/components/molecules/QuestionCard/QuestionCard';
import AIChat from '@/components/organisms/AIChat/AIChat';
import { useAI } from '@/context/AIContext';
import questionService from '@/services/questionService';
import { useAuth } from '@/context/AuthContext';

interface PracticeAreaProps {
  topicId?: string;
  initialQuestions?: Question[];
}

export const PracticeArea: React.FC<PracticeAreaProps> = ({
  topicId,
  initialQuestions,
}) => {
  const { user } = useAuth();
  const { getLearningRecommendations, getSimilarQuestions } = useAI();
  
  const [questions, setQuestions] = useState<Question[]>(initialQuestions || []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [loading, setLoading] = useState<boolean>(!initialQuestions);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [similarQuestions, setSimilarQuestions] = useState<Question[]>([]);
  
  // Load questions if not provided
  useEffect(() => {
    const fetchQuestions = async () => {
      if (initialQuestions) return;
      
      setLoading(true);
      try {
        let fetchedQuestions: Question[];
        
        if (topicId) {
          fetchedQuestions = await questionService.getQuestions(topicId);
        } else if (user) {
          // Get personalized questions based on student's performance
          const recommendations = await getLearningRecommendations();
          fetchedQuestions = recommendations.recommendedQuestions;
        } else {
          fetchedQuestions = await questionService.getQuestions();
        }
        
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [topicId, initialQuestions, user, getLearningRecommendations]);
  
  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  
  // Handle answer submission
  const handleAnswer = async (questionId: string, answer: any, isCorrect: boolean) => {
    if (!user) return;
    
    // Record the answer
    const newAnswer: StudentAnswer = {
      questionId,
      isCorrect,
      answer,
      timestamp: new Date().toISOString(),
    };
    
    setAnswers([...answers, newAnswer]);
    
    // Submit to backend for tracking
    try {
      await questionService.submitAnswer(questionId, answer);
      
      // If wrong answer, load similar questions for practice
      if (!isCorrect) {
        const similar = await getSimilarQuestions(questionId, 3);
        setSimilarQuestions(similar);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };
  
  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSimilarQuestions([]);
    }
  };
  
  // Move to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSimilarQuestions([]);
    }
  };
  
  // Practice a similar question
  const handlePracticeSimilar = (question: Question) => {
    setQuestions([...questions, question]);
    setCurrentQuestionIndex(questions.length);
    setSimilarQuestions([]);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 space-y-6">
        {loading ? (
          <div className="bg-white shadow-card rounded-card p-6 flex items-center justify-center h-64">
            <div className="animate-pulse text-neutral-500">Loading questions...</div>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white shadow-card rounded-card p-6 flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-neutral-500 mb-3">No questions available</p>
              <Button onClick={() => window.location.reload()}>Refresh</Button>
            </div>
          </div>
        ) : (
          <>
            <QuestionCard
              question={currentQuestion}
              onAnswer={handleAnswer}
              showFeedback={true}
            />
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-neutral-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              
              <Button
                variant="outline"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next
              </Button>
            </div>
            
            {similarQuestions.length > 0 && (
              <div className="bg-white shadow-card rounded-card p-6">
                <h3 className="text-lg font-medium mb-4">Similar Questions for Practice</h3>
                <div className="space-y-3">
                  {similarQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="border border-neutral-200 rounded-md p-4 hover:border-primary-500 cursor-pointer transition-colors"
                      onClick={() => handlePracticeSimilar(question)}
                    >
                      <p className="font-medium">{question.text}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs bg-neutral-100 text-neutral-800 px-2 py-1 rounded">
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
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <div className="bg-white shadow-card rounded-card overflow-hidden h-[600px] flex flex-col">
            {showChat ? (
              <AIChat
                context={{
                  questionId: currentQuestion?.id,
                  topicId,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full p-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Need Help?</h3>
                  <p className="text-neutral-500 mb-4">
                    Get assistance from our AI tutor with explanations, hints, and more.
                  </p>
                  <Button onClick={() => setShowChat(true)}>Open AI Assistant</Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 bg-white shadow-card rounded-card p-6">
            <h3 className="text-lg font-medium mb-3">Your Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Questions Attempted</span>
                <span className="font-medium">{answers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Correct Answers</span>
                <span className="font-medium text-success-600">
                  {answers.filter(a => a.isCorrect).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Accuracy Rate</span>
                <span className="font-medium">
                  {answers.length > 0
                    ? `${Math.round((answers.filter(a => a.isCorrect).length / answers.length) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeArea;