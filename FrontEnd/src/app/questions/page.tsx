// src/app/questions/page.tsx
"use client";

import { useState, useEffect } from "react";
import Layout from "@/app/layout/Layout";
import { questionAPI, curriculumAPI } from "@/services/api";
import { FileText, Filter, Search, Trash2, Edit, Plus } from "lucide-react";
import Link from "next/link";
import EditQuestionModal from "./EditQuestionModal";
import { showToast } from "@/components/toast";
import ConfirmationDialog from "@/components/ConfirmationDialog";

// First, let's define interfaces for our data structures
interface Question {
  id: string;
  question_text: string;
  question_type: string;
  difficulty: string;
  ai_generated: boolean;
  options?: string[];
  correct_answer?: string | string[];
  explanation?: string;
  topic?: {
    name: string;
  };
}

interface Topic {
  id: string;
  name: string;
}

interface FilterState {
  topic_id: string;
  question_type: string;
  difficulty: string;
  ai_generated: boolean | undefined;
}

const QuestionsPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    topic_id: "",
    question_type: "",
    difficulty: "",
    ai_generated: undefined,
  });
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  // Add this function to handle the edit button click

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const data = await questionAPI.getAllQuestions(filters);
      setQuestions(data);

      const allTopics = await curriculumAPI.getTopics();
      setTopics(allTopics);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load questions";
      console.error("Error fetching questions:", error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value === "" ? "" : value,
    }));
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setIsEditModalOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    setQuestionToDelete(id);
    setConfirmDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;

    try {
      await questionAPI.deleteQuestion(questionToDelete);
      setQuestions(questions.filter((q) => q.id !== questionToDelete));
      showToast.success("Question deleted successfully");
    } catch (error) {
      console.error("Error deleting question:", error);
      showToast.error("Failed to delete question");
    } finally {
      setQuestionToDelete(null);
      setConfirmDialogOpen(false); // Close the dialog after operation
    }
  };

  const renderQuestion = (question: Question) => {
    // Check if it's a written answer type
    const isWrittenAnswerType =
      question.question_type === "ShortAnswer" ||
      question.question_type === "LongAnswer";

    return (
      <div
        key={question.id}
        className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full
              ${
                question.question_type === "MCQ"
                  ? "bg-blue-100 text-blue-800"
                  : question.question_type === "MultipleAnswer"
                  ? "bg-green-100 text-green-800"
                  : question.question_type === "True/False"
                  ? "bg-purple-100 text-purple-800"
                  : question.question_type === "Fill-in-the-blank"
                  ? "bg-yellow-100 text-yellow-800"
                  : question.question_type === "ShortAnswer"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-pink-100 text-pink-800" // LongAnswer
              }`}>
              {question.question_type}
            </span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full
              ${
                question.difficulty === "Easy"
                  ? "bg-green-100 text-green-800"
                  : question.difficulty === "Medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}>
              {question.difficulty}
            </span>
            {question.ai_generated && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                AI Generated
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="p-1 text-gray-500 hover:text-blue-500"
              onClick={() => handleEdit(question)}>
              <Edit size={16} />
            </button>
            <button
              className="p-1 text-gray-500 hover:text-red-500"
              onClick={() => handleDeleteRequest(question.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <h3 className="font-medium text-gray-900 mb-2">
          {question.question_text}
        </h3>

        {!isWrittenAnswerType &&
          question.options &&
          question.options.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">Options:</p>
              <ul className="list-disc pl-5 text-sm text-gray-800">
                {question.options.map((option, index) => (
                  <li
                    key={index}
                    className={
                      option === question.correct_answer ||
                      (Array.isArray(question.correct_answer) &&
                        question.correct_answer.includes(option))
                        ? "font-medium"
                        : ""
                    }>
                    {option}{" "}
                    {(option === question.correct_answer ||
                      (Array.isArray(question.correct_answer) &&
                        question.correct_answer.includes(option))) && (
                      <span className="text-green-600 text-xs">(Correct)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

        {isWrittenAnswerType && (
          <div className="mb-3 bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-1">
              {question.question_type === "ShortAnswer"
                ? "This question requires a short written answer."
                : "This question requires a detailed written response."}
            </p>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>
            <span className="font-medium">Explanation:</span>{" "}
            {question.explanation}
          </p>
        </div>

        {question.topic && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
            Topic: {question.topic.name}
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout allowedRoles={["admin", "teacher"]}>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Questions</h1>
          <Link
            href="/generate"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus size={16} />
            Generate Questions
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-gray-500" />
            <h2 className="font-medium">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Topic</label>
              <select
                name="topic_id"
                value={filters.topic_id}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm">
                <option value="">All Topics</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Question Type
              </label>
              <select
                name="question_type"
                value={filters.question_type}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm">
                <option value="">All Types</option>
                <option value="MCQ">Multiple Choice</option>
                <option value="MultipleAnswer">Multiple Answer</option>
                <option value="True/False">True/False</option>
                <option value="Fill-in-the-blank">Fill in the Blank</option>
                <option value="ShortAnswer">Short Written Answer</option>
                <option value="LongAnswer">Long Written Answer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={filters.difficulty}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm">
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Source</label>
              <select
                name="ai_generated"
                value={
                  filters.ai_generated === undefined
                    ? ""
                    : filters.ai_generated.toString()
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters((prev) => ({
                    ...prev,
                    ai_generated: value === "" ? undefined : value === "true",
                  }));
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm">
                <option value="">All Sources</option>
                <option value="true">AI Generated</option>
                <option value="false">Manually Created</option>
              </select>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading questions...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error}</p>
              <button
                className="mt-2 text-red-700 font-medium underline"
                onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <FileText size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No questions found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or generate some new questions.
              </p>
              <Link
                href="/generate"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                <Plus size={16} />
                Generate Questions
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Showing {questions.length} questions
              </p>
              {questions.map(renderQuestion)}
            </>
          )}
        </div>

        <ConfirmationDialog
          isOpen={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          onConfirm={handleDelete}
          title="Delete Question"
          message="Are you sure you want to delete this question? This action cannot be undone."
          confirmText="Delete"
        />

        {isEditModalOpen && editingQuestion && (
          <EditQuestionModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={() => {
              setIsEditModalOpen(false);
              // Refresh questions after edit
              fetchQuestions();
            }}
            question={editingQuestion}
          />
        )}
      </div>
    </Layout>
  );
};

export default QuestionsPage;
