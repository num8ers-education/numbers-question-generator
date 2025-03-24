import React, { useState } from 'react';
import { Question, MCQQuestion, TrueFalseQuestion, MatchingQuestion, FillInTheBlankQuestion } from '@/types/question';
import { Button } from '@/components/atoms/Button/Button';
import { Badge } from '@/components/atoms/Badge/Badge';
import { useAI } from '@/context/AIContext';

interface QuestionCardProps {
  question: Question;
  onAnswer?: (questionId: string, answer: any, isCorrect: boolean) => void;
  showExplanation?: boolean;
  showFeedback?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  showExplanation = false,
  showFeedback = true,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    hints?: string[];
  } | null>(null);
  const [showingExplanation, setShowingExplanation] = useState<boolean>(showExplanation);
  const [hintCount, setHintCount] = useState<number>(0);
  
  const { getAnswerFeedback, getHint } = useAI();
  
  const handleSubmit = async () => {
    if (!selectedAnswer) return;
    
    let isCorrect = false;
    let correctAnswer = null;
    
    // Determine correctness based on question type
    switch (question.type) {
      case 'MCQ':
        const mcqQuestion = question as MCQQuestion;
        correctAnswer = mcqQuestion.options.find(opt => opt.isCorrect)?.id;
        isCorrect = selectedAnswer === correctAnswer;
        break;
      
      case 'TrueFalse':
        const tfQuestion = question as TrueFalseQuestion;
        correctAnswer = tfQuestion.correctAnswer;
        isCorrect = selectedAnswer === correctAnswer;
        break;
      
      case 'Matching':
        // For matching, selectedAnswer would be an object of leftId -> rightId mappings
        const matchQuestion = question as MatchingQuestion;
        correctAnswer = Object.fromEntries(matchQuestion.pairs.map(pair => [pair.left, pair.right]));
        isCorrect = Object.entries(selectedAnswer).every(
          ([left, right]) => correctAnswer[left] === right
        );
        break;
      
      case 'FillInTheBlank':
        const fibQuestion = question as FillInTheBlankQuestion;
        correctAnswer = fibQuestion.blanks.map(blank => ({
          id: blank.id,
          answer: blank.correctAnswer
        }));
        isCorrect = selectedAnswer.every((answer, index) => 
          answer.toLowerCase() === correctAnswer[index].answer.toLowerCase() ||
          (fibQuestion.blanks[index].alternatives?.some(alt => 
            alt.toLowerCase() === answer.toLowerCase()) ?? false)
        );
        break;
    }
    
    // Get AI feedback
    if (showFeedback) {
      try {
        const aiFeedback = await getAnswerFeedback(
          question.id,
          selectedAnswer,
          correctAnswer
        );
        setFeedback(aiFeedback);
      } catch (error) {
        console.error('Failed to get feedback:', error);
        // Default feedback if AI service fails
        setFeedback({
          isCorrect,
          explanation: isCorrect ? 
            'Correct! Well done.' : 
            'Incorrect. Please try again.',
        });
      }
    }
    
    // Call onAnswer callback if provided
    if (onAnswer) {
      onAnswer(question.id, selectedAnswer, isCorrect);
    }
  };
  
  const handleRequestHint = async () => {
    try {
      const hint = await getHint(question.id, hintCount);
      setFeedback(prev => ({
        ...prev!,
        hints: [...(prev?.hints || []), hint]
      }));
      setHintCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to get hint:', error);
    }
  };
  
  // Render different question types
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'MCQ':
        return renderMCQ(question as MCQQuestion);
      case 'TrueFalse':
        return renderTrueFalse(question as TrueFalseQuestion);
      case 'Matching':
        return renderMatching(question as MatchingQuestion);
      case 'FillInTheBlank':
        return renderFillInTheBlank(question as FillInTheBlankQuestion);
      default:
        return <p>Unsupported question type</p>;
    }
  };
  
  const renderMCQ = (mcqQuestion: MCQQuestion) => (
    <div className="space-y-3">
      <p className="text-lg font-medium">{mcqQuestion.text}</p>
      <div className="space-y-2">
        {mcqQuestion.options.map((option) => (
          <div
            key={option.id}
            className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
              selectedAnswer === option.id
                ? 'bg-primary-100 border-primary-500'
                : 'hover:bg-neutral-50'
            } ${
              feedback && feedback.isCorrect === false && selectedAnswer === option.id
                ? 'bg-danger-100 border-danger-500'
                : ''
            } ${
              feedback && option.isCorrect
                ? 'bg-success-100 border-success-500'
                : ''
            }`}
            onClick={() => !feedback && setSelectedAnswer(option.id)}
          >
            <input
              type="radio"
              className="h-4 w-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
              checked={selectedAnswer === option.id}
              onChange={() => !feedback && setSelectedAnswer(option.id)}
              disabled={!!feedback}
            />
            <label className="ml-3 block w-full cursor-pointer">
              {option.text}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
  
  const renderTrueFalse = (tfQuestion: TrueFalseQuestion) => (
    <div className="space-y-3">
      <p className="text-lg font-medium">{tfQuestion.text}</p>
      <div className="space-y-2">
        {[true, false].map((value) => (
          <div
            key={String(value)}
            className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
              selectedAnswer === value
                ? 'bg-primary-100 border-primary-500'
                : 'hover:bg-neutral-50'
            } ${
              feedback && feedback.isCorrect === false && selectedAnswer === value
                ? 'bg-danger-100 border-danger-500'
                : ''
            } ${
              feedback && tfQuestion.correctAnswer === value
                ? 'bg-success-100 border-success-500'
                : ''
            }`}
            onClick={() => !feedback && setSelectedAnswer(value)}
          >
            <input
              type="radio"
              className="h-4 w-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
              checked={selectedAnswer === value}
              onChange={() => !feedback && setSelectedAnswer(value)}
              disabled={!!feedback}
            />
            <label className="ml-3 block w-full cursor-pointer">
              {value ? 'True' : 'False'}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Simple implementations for Matching and Fill-in-the-blank
  // These would need more complex UI in a real application
  const renderMatching = (matchQuestion: MatchingQuestion) => (
    <div className="space-y-3">
      <p className="text-lg font-medium">{matchQuestion.text}</p>
      <p className="text-neutral-500">
        Matching question UI would be implemented here
      </p>
    </div>
  );
  
  const renderFillInTheBlank = (fibQuestion: FillInTheBlankQuestion) => (
    <div className="space-y-3">
      <p className="text-lg font-medium">{fibQuestion.text}</p>
      <p className="text-neutral-500">
        Fill in the blank question UI would be implemented here
      </p>
    </div>
  );
  
  return (
    <div className="bg-white shadow-card rounded-card p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Badge 
            variant={
              question.difficulty === 'Easy' ? 'success' :
              question.difficulty === 'Medium' ? 'warning' : 'danger'
            }
          >
            {question.difficulty}
          </Badge>
          <Badge variant="secondary">{question.type}</Badge>
          {question.aiGenerated && <Badge variant="primary">AI Generated</Badge>}
        </div>
      </div>
      
      <div className="divide-y">
        <div className="pb-4">
          {renderQuestionContent()}
        </div>
        
        {feedback && (
          <div className="py-4 space-y-3">
            <div className={`p-3 rounded-md ${
              feedback.isCorrect ? 'bg-success-50 text-success-800' : 'bg-danger-50 text-danger-800'
            }`}>
              <p className="font-medium">
                {feedback.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              <p>{feedback.explanation}</p>
            </div>
            
            {feedback.hints && feedback.hints.length > 0 && (
              <div className="bg-neutral-50 p-3 rounded-md">
                <p className="font-medium mb-2">Hints:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {feedback.hints.map((hint, index) => (
                    <li key={index}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {showingExplanation && (
          <div className="py-4">
            <p className="font-medium mb-2">Explanation:</p>
            <p>{question.explanation}</p>
          </div>
        )}
        
        <div className="pt-4 flex justify-between">
          {!feedback ? (
            <Button variant="primary" onClick={handleSubmit}>
              Submit Answer
            </Button>
          ) : (
            <div className="space-x-3">
              {!showingExplanation && (
                <Button variant="outline" onClick={() => setShowingExplanation(true)}>
                  Show Explanation
                </Button>
              )}
              {!feedback.isCorrect && (
                <Button variant="secondary" onClick={handleRequestHint}>
                  Get Hint
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
