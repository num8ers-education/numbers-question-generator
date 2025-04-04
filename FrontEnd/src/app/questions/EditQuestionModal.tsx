// src/components/question/EditQuestionModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, FileEdit, AlertCircle, Save, Trash2 } from "lucide-react";
import { questionAPI } from "@/services/api";
import { showToast } from "@/components/toast";

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  question: any;
}

export default function EditQuestionModal({
  isOpen,
  onClose,
  onSuccess,
  question,
}: EditQuestionModalProps) {
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string | string[]>("");
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Is it a written answer type?
  const isWrittenAnswerType =
    questionType === "ShortAnswer" || questionType === "LongAnswer";

  // Initialize form with question data
  useEffect(() => {
    if (question) {
      setQuestionText(question.question_text || "");
      setOptions(question.options || []);
      setCorrectAnswer(
        question.correct_answer ||
          (question.question_type === "MultipleAnswer" ? [] : "")
      );
      setExplanation(question.explanation || "");
      setDifficulty(question.difficulty || "Medium");
      setQuestionType(question.question_type || "MCQ");
    }
  }, [question]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!questionText.trim()) {
      setError("Question text is required");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Prepare data for API
      const questionData: any = {
        question_text: questionText,
        explanation: explanation,
        difficulty: difficulty,
        question_type: questionType,
        topic_id: question.topic_id, // Make sure to include topic_id
      };

      // Only include options and correct_answer for non-written answer types
      if (!isWrittenAnswerType) {
        questionData.options = options;
        questionData.correct_answer = correctAnswer;
      } else {
        // For written answer types, send empty arrays/null
        questionData.options = [];
        questionData.correct_answer = null;
      }

      // Update the question
      await questionAPI.updateQuestion(question.id, questionData);

      // Show success message
      showToast.success("Question updated successfully");

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Close the modal
        onClose();
      }
    } catch (err: any) {
      console.error("Error updating question:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to update question. Please try again."
      );
      showToast.error("Failed to update question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  // Handle multiple answers selection
  const handleMultipleAnswerSelection = (option: string) => {
    if (questionType === "MultipleAnswer") {
      // Ensure correctAnswer is always an array for MultipleAnswer
      const currentAnswers = Array.isArray(correctAnswer) ? correctAnswer : [];

      if (currentAnswers.includes(option)) {
        // Remove option if already selected
        setCorrectAnswer(currentAnswers.filter((ans) => ans !== option));
      } else {
        // Add option if not already selected
        setCorrectAnswer([...currentAnswers, option]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="bg-blue-50 p-3 rounded-xl mr-4">
              <FileEdit size={22} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Edit Question</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all duration-200">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start">
              <AlertCircle
                size={20}
                className="text-red-500 mr-3 mt-0.5 flex-shrink-0"
              />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Question Text */}
            <div className="mb-4">
              <label
                htmlFor="question-text"
                className="block text-sm font-medium text-gray-700 mb-2">
                Question Text
              </label>
              <textarea
                id="question-text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 min-h-[100px]"
                required
              />
            </div>

            {/* Question Type */}
            <div className="mb-4">
              <label
                htmlFor="question-type"
                className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <select
                id="question-type"
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required>
                <option value="MCQ">Multiple Choice</option>
                <option value="MultipleAnswer">Multiple Answer</option>
                <option value="True/False">True/False</option>
                <option value="Fill-in-the-blank">Fill in the Blank</option>
                <option value="ShortAnswer">Short Written Answer</option>
                <option value="LongAnswer">Long Written Answer</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="mb-4">
              <label
                htmlFor="difficulty"
                className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Options - Only show for MCQ, MultipleAnswer, True/False and Fill-in-the-blank */}
            {!isWrittenAnswerType && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Answer Options
                  </label>
                  {(questionType === "MCQ" ||
                    questionType === "MultipleAnswer") && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200">
                      + Add Option
                    </button>
                  )}
                </div>

                {options.map((option, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Option ${index + 1}`}
                    />
                    <div className="ml-2 flex items-center">
                      {questionType === "MCQ" ||
                      questionType === "True/False" ||
                      questionType === "Fill-in-the-blank" ? (
                        // Single selection for MCQ, True/False, Fill-in-the-blank
                        <>
                          <input
                            type="radio"
                            checked={option === correctAnswer}
                            onChange={() => setCorrectAnswer(option)}
                            className="mr-1 h-4 w-4"
                          />
                          <label className="text-sm text-gray-600 mr-2">
                            Correct
                          </label>
                        </>
                      ) : questionType === "MultipleAnswer" ? (
                        // Multiple selection for MultipleAnswer
                        <>
                          <input
                            type="checkbox"
                            checked={
                              Array.isArray(correctAnswer) &&
                              correctAnswer.includes(option)
                            }
                            onChange={() =>
                              handleMultipleAnswerSelection(option)
                            }
                            className="mr-1 h-4 w-4"
                          />
                          <label className="text-sm text-gray-600 mr-2">
                            Correct
                          </label>
                        </>
                      ) : null}

                      {(questionType === "MCQ" ||
                        questionType === "MultipleAnswer") && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Initialize options for specific question types if empty */}
                {options.length === 0 && questionType === "True/False" && (
                  <button
                    type="button"
                    onClick={() => {
                      setOptions(["True", "False"]);
                      setCorrectAnswer("True"); // Default to True
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200">
                    Initialize True/False Options
                  </button>
                )}
              </div>
            )}

            {/* Explanation */}
            <div className="mb-4">
              <label
                htmlFor="explanation"
                className="block text-sm font-medium text-gray-700 mb-2">
                Explanation
              </label>
              <textarea
                id="explanation"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 min-h-[100px]"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
                disabled={isLoading}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2">
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
