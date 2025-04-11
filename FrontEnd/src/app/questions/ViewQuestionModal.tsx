"use client";

// ViewQuestionModal.tsx
import React from "react";
import { MathJax } from "better-react-mathjax";
import {
  X,
  CircleCheck,
  CheckSquare,
  ToggleLeft,
  TextCursor,
  PenLine,
  FileText,
  ThumbsUp,
  Activity,
  Zap,
  Sparkles,
  Calendar,
  Layers,
  BookmarkIcon,
  GraduationCap,
  BookText,
  ListChecks,
  ChevronRight,
  Lightbulb,
  AlertCircle,
  BookOpen,
} from "lucide-react";

interface QuestionHierarchy {
  topic: string;
  unit: string;
  course: string;
  subject: string;
  curriculum: string;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  difficulty: string;
  ai_generated: boolean;
  options?: string[];
  correct_answer?: string | string[];
  explanation?: string;
  topic_id: string;
  created_at: string;
  updated_at?: string;
}

interface ViewQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  hierarchy: QuestionHierarchy | null;
  formatDate: (dateString: string) => string;
  isStudent?: boolean;
}

const ViewQuestionModal: React.FC<ViewQuestionModalProps> = ({
  isOpen,
  onClose,
  question,
  hierarchy,
  formatDate,
  isStudent = true,
}) => {
  if (!isOpen) return null;

  // Check if it's a written answer type
  const isWrittenAnswerType =
    question.question_type === "ShortAnswer" ||
    question.question_type === "LongAnswer";

  // Get question type display name
  const getQuestionTypeDisplay = (type: string) => {
    switch (type) {
      case "MCQ":
        return "Multiple Choice";
      case "MultipleAnswer":
        return "Multiple Answer";
      case "True/False":
        return "True/False";
      case "Fill-in-the-blank":
        return "Fill in the Blank";
      case "ShortAnswer":
        return "Short Answer";
      case "LongAnswer":
        return "Long Answer";
      default:
        return type;
    }
  };

  // Get question type icon
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "MCQ":
        return <CircleCheck size={18} className="text-blue-600" />;
      case "MultipleAnswer":
        return <CheckSquare size={18} className="text-green-600" />;
      case "True/False":
        return <ToggleLeft size={18} className="text-purple-600" />;
      case "Fill-in-the-blank":
        return <TextCursor size={18} className="text-yellow-600" />;
      case "ShortAnswer":
        return <PenLine size={18} className="text-orange-600" />;
      case "LongAnswer":
        return <FileText size={18} className="text-pink-600" />;
      default:
        return <BookOpen size={18} className="text-gray-600" />;
    }
  };

  // Get difficulty icon
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return <ThumbsUp size={18} className="text-green-600" />;
      case "Medium":
        return <Activity size={18} className="text-yellow-600" />;
      case "Hard":
        return <Zap size={18} className="text-red-600" />;
      default:
        return null;
    }
  };

  // Get difficulty color class
  const getDifficultyColorClass = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "border-green-200 bg-green-50 text-green-700";
      case "Medium":
        return "border-yellow-200 bg-yellow-50 text-yellow-700";
      case "Hard":
        return "border-red-200 bg-red-50 text-red-700";
      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="flex items-center">
            {getQuestionTypeIcon(question.question_type)}
            <h2 className="text-xl font-bold ml-2 text-gray-800">
              {getQuestionTypeDisplay(question.question_type)} Question
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tags row */}
          <div className="flex flex-wrap gap-2 mb-6">
            {/* Question Type */}
            <div className="inline-flex items-center px-3 py-2 rounded-md border shadow-sm bg-blue-50 text-blue-700 border-blue-200">
              {getQuestionTypeIcon(question.question_type)}
              <span className="ml-2 font-medium">
                {getQuestionTypeDisplay(question.question_type)}
              </span>
            </div>

            {/* Difficulty */}
            <div
              className={`inline-flex items-center px-3 py-2 rounded-md border shadow-sm ${getDifficultyColorClass(
                question.difficulty
              )}`}
            >
              {getDifficultyIcon(question.difficulty)}
              <span className="ml-2 font-medium">{question.difficulty}</span>
            </div>

            {/* AI Generated */}
            {question.ai_generated && (
              <div className="inline-flex items-center px-3 py-2 rounded-md bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">
                <Sparkles size={18} className="text-purple-600" />
                <span className="ml-2 font-medium">AI Generated</span>
              </div>
            )}

            {/* Created Date */}
            <div className="inline-flex items-center px-3 py-2 rounded-md bg-gray-50 text-gray-700 border border-gray-200 shadow-sm">
              <Calendar size={18} className="text-gray-600" />
              <span className="ml-2 font-medium">
                {formatDate(question.created_at)}
              </span>
            </div>
          </div>

          {/* Question Content */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Question</h3>
            <div className="text-lg text-gray-700 mb-4">
              <MathJax>{question.question_text}</MathJax>
            </div>

            {/* Options for multiple choice type questions */}
            {!isWrittenAnswerType &&
              question.options &&
              question.options.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Options:</h4>
                  <ul className="space-y-3">
                    {question.options.map((option, index) => {
                      const isCorrect =
                        option === question.correct_answer ||
                        (Array.isArray(question.correct_answer) &&
                          question.correct_answer.includes(option));

                      return (
                        <li
                          key={index}
                          className={`p-3 rounded-md border ${
                            isCorrect
                              ? "border-green-200 bg-green-50"
                              : "border-gray-200 bg-white"
                          } flex items-start`}
                        >
                          {isCorrect ? (
                            <CircleCheck
                              size={20}
                              className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 mr-2 mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <span
                              className={`${
                                isCorrect ? "font-medium" : ""
                              } text-gray-800`}
                            >
                              <MathJax>{option}</MathJax>
                            </span>
                            {isCorrect && isStudent && (
                              <span className="ml-2 text-green-600 text-sm">
                                (Correct Answer)
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

            {/* Written answer notice */}
            {isWrittenAnswerType && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start">
                  <AlertCircle size={20} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-1">
                      {question.question_type === "ShortAnswer"
                        ? "Short Answer Question"
                        : "Long Answer Question"}
                    </h4>
                    <p className="text-blue-600">
                      {question.question_type === "ShortAnswer"
                        ? "This question requires a concise written answer, typically a few words or a short sentence."
                        : "This question requires a detailed written response with explanation and analysis."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="bg-yellow-50 rounded-lg p-6 mb-6 border border-yellow-200">
              <div className="flex items-center mb-4">
                <Lightbulb size={20} className="text-yellow-600 mr-2" />
                <h3 className="text-lg font-bold text-yellow-800">
                  Explanation
                </h3>
              </div>
              <div className="text-gray-800">
                <MathJax>{question.explanation}</MathJax>
              </div>
            </div>
          )}

          {/* Curriculum Hierarchy */}
          {hierarchy && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Curriculum Path
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="inline-flex items-center px-3 py-2 rounded-md bg-blue-50 border border-blue-100 shadow-sm">
                    <Layers size={16} className="text-blue-600 mr-2" />
                    <span className="font-medium text-blue-700 whitespace-nowrap">
                      {hierarchy.curriculum}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />

                  <div className="inline-flex items-center px-3 py-2 rounded-md bg-purple-50 border border-purple-100 shadow-sm">
                    <BookmarkIcon size={16} className="text-purple-600 mr-2" />
                    <span className="font-medium text-purple-700 whitespace-nowrap">
                      {hierarchy.subject}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />

                  <div className="inline-flex items-center px-3 py-2 rounded-md bg-green-50 border border-green-100 shadow-sm">
                    <GraduationCap
                      size={16}
                      className="text-green-600 mr-2"
                    />
                    <span className="font-medium text-green-700 whitespace-nowrap">
                      {hierarchy.course}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />

                  <div className="inline-flex items-center px-3 py-2 rounded-md bg-yellow-50 border border-yellow-100 shadow-sm">
                    <BookText size={16} className="text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-700 whitespace-nowrap">
                      {hierarchy.unit}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />

                  <div className="inline-flex items-center px-3 py-2 rounded-md bg-red-50 border border-red-100 shadow-sm">
                    <ListChecks size={16} className="text-red-600 mr-2" />
                    <span className="font-medium text-red-700 whitespace-nowrap">
                      {hierarchy.topic}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewQuestionModal;