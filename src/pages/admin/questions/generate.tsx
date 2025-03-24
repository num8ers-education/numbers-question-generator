import React, { useState } from 'react';
import { NextPage } from 'next';
import AdminLayout from '@/components/templates/AdminLayout/AdminLayout';
import QuestionGenerator from '@/components/organisms/QuestionGenerator/QuestionGenerator';
import { AIQuestion } from '@/types/ai';
import Alert from '@/components/atoms/Alert/Alert';

const GenerateQuestionsPage: NextPage = () => {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleQuestionsGenerated = (questions: AIQuestion[]) => {
    setSuccess(`Successfully generated ${questions.length} questions!`);
    setError(null);
  };
  
  const handleQuestionsSaved = () => {
    setSuccess('Questions have been saved to the database.');
    setError(null);
  };
  
  return (
    <AdminLayout title="Generate AI Questions">
      <div className="max-w-7xl mx-auto">
        {success && (
          <Alert
            variant="success"
            title="Success"
            message={success}
            className="mb-6"
            onClose={() => setSuccess(null)}
          />
        )}
        
        {error && (
          <Alert
            variant="danger"
            title="Error"
            message={error}
            className="mb-6"
            onClose={() => setError(null)}
          />
        )}
        
        <div className="bg-white rounded-card shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">AI Question Generation</h2>
          <p className="text-neutral-600 mb-6">
            Use AI to automatically generate educational questions based on curriculum topics.
            The generated questions will be reviewed by you before being added to the question bank.
          </p>
          
          <div className="border-t border-neutral-200 pt-6">
            <QuestionGenerator
              onQuestionsGenerated={handleQuestionsGenerated}
              onQuestionsSaved={handleQuestionsSaved}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-card shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">About AI Question Generation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-neutral-200 rounded-md p-4">
              <div className="flex items-center mb-3">
                <div className="bg-primary-100 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">Automatic Generation</h3>
              </div>
              <p className="text-sm text-neutral-600">
                AI can generate various question types including multiple choice,
                true/false, matching, and fill-in-the-blank questions aligned with your curriculum.
              </p>
            </div>
            
            <div className="border border-neutral-200 rounded-md p-4">
              <div className="flex items-center mb-3">
                <div className="bg-primary-100 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">Quality Control</h3>
              </div>
              <p className="text-sm text-neutral-600">
                You maintain full control over which questions get added to your
                question bank. Review and edit before finalizing.
              </p>
            </div>
            
            <div className="border border-neutral-200 rounded-md p-4">
              <div className="flex items-center mb-3">
                <div className="bg-primary-100 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">Save Time</h3>
              </div>
              <p className="text-sm text-neutral-600">
                Drastically reduce time spent creating assessments while maintaining
                high quality educational content for your students.
              </p>
            </div>
          </div>
          
          <div className="mt-6 bg-neutral-50 p-4 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-neutral-900">Important Note</h4>
                <p className="text-xs text-neutral-600 mt-1">
                  The AI uses your selected curriculum, course, unit, and topic information to generate relevant questions.
                  For best results, ensure your curriculum structure is complete and well-organized.
                  Generated questions that are not selected will be stored to prevent duplication in future generations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default GenerateQuestionsPage;
