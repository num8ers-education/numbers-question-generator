// src/app/questions/page.tsx
"use client";

import { useState, useEffect } from "react";
import Layout from "@/app/layout/Layout";
import {
  questionAPI,
  curriculumAPI,
  topicAPI,
  unitAPI,
  courseAPI,
  subjectAPI,
} from "@/services/api";
import {
  FileText,
  Filter,
  Search,
  Trash2,
  Edit,
  Plus,
  ChevronRight,
  BookOpen,
  Layers,
  BookmarkIcon,
  GraduationCap,
  BookText,
  ListChecks,
  CircleCheck,
  CheckSquare,
  ToggleLeft,
  TextCursor,
  PenLine,
  ThumbsUp,
  Activity,
  Zap,
  Sparkles,
} from "lucide-react";
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
  topic_id: string; // Note: Using topic_id, not a topic object with unit_id
}

interface Topic {
  id: string;
  name: string;
  unit_id?: string;
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

  // Update hierarchyData state to include topics
  const [hierarchyData, setHierarchyData] = useState<{
    topics: Record<string, any>;
    units: Record<string, any>;
    courses: Record<string, any>;
    subjects: Record<string, any>;
    curricula: Record<string, any>;
  }>({
    topics: {},
    units: {},
    courses: {},
    subjects: {},
    curricula: {},
  });

  // Fetch questions and their hierarchical data
  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const data = await questionAPI.getAllQuestions(filters);
      console.log("Questions received:", data);
      setQuestions(data);

      const allTopics = await curriculumAPI.getTopics();
      setTopics(allTopics);

      // Fetch hierarchy data for all questions
      await fetchHierarchyData(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load questions";
      console.error("Error fetching questions:", error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all hierarchical data needed for displaying question paths
  const fetchHierarchyData = async (questions: Question[]) => {
    try {
      console.log("Starting to fetch hierarchy data");

      // Extract unique topic IDs from questions
      const topicIds = new Set<string>();
      questions.forEach((q) => {
        if (q.topic_id) topicIds.add(q.topic_id);
      });

      console.log("Topic IDs found:", Array.from(topicIds));

      if (topicIds.size === 0) {
        console.log("No topics to fetch");
        return;
      }

      // Fetch all topics first - using topicAPI instead of curriculumAPI
      const topicsMap: Record<string, any> = {};
      const topicsData = await Promise.all(
        Array.from(topicIds).map((id) => topicAPI.getTopic(id))
      );

      console.log("Topics fetched:", topicsData);

      topicsData.forEach((topic) => {
        if (topic) {
          topicsMap[topic.id] = topic;
        }
      });

      // Extract unit IDs from topics
      const unitIds = new Set<string>();
      Object.values(topicsMap).forEach((topic) => {
        if (topic.unit_id) unitIds.add(topic.unit_id);
      });

      if (unitIds.size === 0) {
        console.log("No units to fetch");
        setHierarchyData({
          topics: topicsMap,
          units: {},
          courses: {},
          subjects: {},
          curricula: {},
        });
        return;
      }

      // Fetch all units at once - using unitAPI
      const units: Record<string, any> = {};
      const unitData = await Promise.all(
        Array.from(unitIds).map((id) => unitAPI.getUnit(id))
      );

      unitData.forEach((unit) => {
        if (unit) {
          units[unit.id] = unit;
        }
      });

      // The rest of the code should use the appropriate API:
      // courseAPI instead of curriculumAPI.getCourse
      // subjectAPI instead of curriculumAPI.getSubject
      // curriculumAPI.getCurriculum stays the same

      // Extract course IDs from units
      const courseIds = new Set<string>();
      Object.values(units).forEach((unit) => {
        if (unit.course_id) courseIds.add(unit.course_id);
      });

      if (courseIds.size === 0) {
        setHierarchyData({
          topics: topicsMap,
          units,
          courses: {},
          subjects: {},
          curricula: {},
        });
        return;
      }

      // Fetch all courses at once
      const courses: Record<string, any> = {};
      const courseData = await Promise.all(
        Array.from(courseIds).map((id) => courseAPI.getCourse(id))
      );

      courseData.forEach((course) => {
        if (course) {
          courses[course.id] = course;
        }
      });

      // Extract subject IDs from courses
      const subjectIds = new Set<string>();
      Object.values(courses).forEach((course) => {
        if (course.subject_id) subjectIds.add(course.subject_id);
      });

      if (subjectIds.size === 0) {
        setHierarchyData({
          topics: topicsMap,
          units,
          courses,
          subjects: {},
          curricula: {},
        });
        return;
      }

      // Fetch all subjects at once
      const subjects: Record<string, any> = {};
      const subjectData = await Promise.all(
        Array.from(subjectIds).map((id) => subjectAPI.getSubject(id))
      );

      subjectData.forEach((subject) => {
        if (subject) {
          subjects[subject.id] = subject;
        }
      });

      // Extract curriculum IDs from subjects
      const curriculumIds = new Set<string>();
      Object.values(subjects).forEach((subject) => {
        if (subject.curriculum_id) curriculumIds.add(subject.curriculum_id);
      });

      if (curriculumIds.size === 0) {
        setHierarchyData({
          topics: topicsMap,
          units,
          courses,
          subjects,
          curricula: {},
        });
        return;
      }

      // Fetch all curricula at once
      const curricula: Record<string, any> = {};
      const curriculumData = await Promise.all(
        Array.from(curriculumIds).map((id) => curriculumAPI.getCurriculum(id))
      );

      curriculumData.forEach((curriculum) => {
        if (curriculum) {
          curricula[curriculum.id] = curriculum;
        }
      });

      // Store all hierarchy data
      setHierarchyData({
        topics: topicsMap,
        units,
        courses,
        subjects,
        curricula,
      });

      console.log("Hierarchy data set successfully:", {
        topics: Object.keys(topicsMap).length,
        units: Object.keys(units).length,
        courses: Object.keys(courses).length,
        subjects: Object.keys(subjects).length,
        curricula: Object.keys(curricula).length,
      });
    } catch (error) {
      console.error("Error fetching hierarchy data:", error);
    }
  };

  // Build hierarchy path for a single question
  const getQuestionHierarchy = (question: Question) => {
    if (!question.topic_id) {
      return null;
    }

    try {
      const { topics, units, courses, subjects, curricula } = hierarchyData;

      // First get the topic
      const topic = topics[question.topic_id];
      if (!topic) {
        return null;
      }

      // Then get the unit
      const unit = units[topic.unit_id];
      if (!unit) {
        return null;
      }

      // Get the course
      const course = courses[unit.course_id];
      if (!course) {
        return null;
      }

      // Get the subject
      const subject = subjects[course.subject_id];
      if (!subject) {
        return null;
      }

      // Get the curriculum
      const curriculum = curricula[subject.curriculum_id];
      if (!curriculum) {
        return null;
      }

      return {
        topic: topic.name,
        unit: unit.name,
        course: course.name,
        subject: subject.name,
        curriculum: curriculum.name,
      };
    } catch (error) {
      console.error("Error getting question hierarchy:", error);
      return null;
    }
  };

  // Load questions when filters change
  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value === "" ? "" : value,
    }));
  };

  // Handle edit button click
  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setIsEditModalOpen(true);
  };

  // Handle delete request
  const handleDeleteRequest = (id: string) => {
    setQuestionToDelete(id);
    setConfirmDialogOpen(true);
  };

  // Handle delete confirmation
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

  // Render a single question with its hierarchy
  const renderQuestion = (question: Question) => {
    // Check if it's a written answer type
    const isWrittenAnswerType =
      question.question_type === "ShortAnswer" ||
      question.question_type === "LongAnswer";

    // Get hierarchy data for this question
    const hierarchy = getQuestionHierarchy(question);
    const topicName = hierarchyData.topics[question.topic_id]?.name;

    return (
      <div
        key={question.id}
        className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Question Type with formatting fix and icons */}
            <div
              className={`inline-flex items-center px-3 py-1.5 rounded-md border shadow-sm
    ${
      question.question_type === "MCQ"
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : question.question_type === "MultipleAnswer"
        ? "bg-green-50 text-green-700 border-green-200"
        : question.question_type === "True/False"
        ? "bg-purple-50 text-purple-700 border-purple-200"
        : question.question_type === "Fill-in-the-blank"
        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
        : question.question_type === "ShortAnswer"
        ? "bg-orange-50 text-orange-700 border-orange-200"
        : "bg-pink-50 text-pink-700 border-pink-200" // LongAnswer
    }`}
            >
              {/* Type-specific icon */}
              {question.question_type === "MCQ" && (
                <CircleCheck size={14} className="mr-1.5" />
              )}
              {question.question_type === "MultipleAnswer" && (
                <CheckSquare size={14} className="mr-1.5" />
              )}
              {question.question_type === "True/False" && (
                <ToggleLeft size={14} className="mr-1.5" />
              )}
              {question.question_type === "Fill-in-the-blank" && (
                <TextCursor size={14} className="mr-1.5" />
              )}
              {question.question_type === "ShortAnswer" && (
                <PenLine size={14} className="mr-1.5" />
              )}
              {question.question_type === "LongAnswer" && (
                <FileText size={14} className="mr-1.5" />
              )}

              {/* Format question type text */}
              <span className="text-xs font-medium">
                {question.question_type === "MCQ"
                  ? "Multiple Choice"
                  : question.question_type === "MultipleAnswer"
                  ? "Multiple Answer"
                  : question.question_type === "True/False"
                  ? "True/False"
                  : question.question_type === "Fill-in-the-blank"
                  ? "Fill in the Blank"
                  : question.question_type === "ShortAnswer"
                  ? "Short Answer"
                  : question.question_type === "LongAnswer"
                  ? "Long Answer"
                  : question.question_type}
              </span>
            </div>

            {/* Difficulty label with icon */}
            <div
              className={`inline-flex items-center px-3 py-1.5 rounded-md border shadow-sm
    ${
      question.difficulty === "Easy"
        ? "bg-green-50 text-green-700 border-green-200"
        : question.difficulty === "Medium"
        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
        : "bg-red-50 text-red-700 border-red-200"
    }`}
            >
              {question.difficulty === "Easy" && (
                <ThumbsUp size={14} className="mr-1.5" />
              )}
              {question.difficulty === "Medium" && (
                <Activity size={14} className="mr-1.5" />
              )}
              {question.difficulty === "Hard" && (
                <Zap size={14} className="mr-1.5" />
              )}
              <span className="text-xs font-medium">{question.difficulty}</span>
            </div>

            {/* AI Generated label with icon */}
            {question.ai_generated && (
              <div className="inline-flex items-center px-3 py-1.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">
                <Sparkles size={14} className="mr-1.5" />
                <span className="text-xs font-medium">AI Generated</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="p-1 text-gray-500 hover:text-blue-500"
              onClick={() => handleEdit(question)}
            >
              <Edit size={16} />
            </button>
            <button
              className="p-1 text-gray-500 hover:text-red-500"
              onClick={() => handleDeleteRequest(question.id)}
            >
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
                    }
                  >
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

        {/* Topic name (fallback display) */}
        {topicName && !hierarchy && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
            Topic: {topicName}
          </div>
        )}

        {/* Full hierarchy path */}
        {hierarchy && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-col">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-blue-50 border border-blue-100 shadow-sm">
                  <Layers size={12} className="mr-1.5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700 whitespace-nowrap">
                    Curriculum: {hierarchy.curriculum}
                  </span>
                </div>
                <ChevronRight size={14} className="text-gray-400" />

                <div className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-purple-50 border border-purple-100 shadow-sm">
                  <BookmarkIcon size={12} className="mr-1.5 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700 whitespace-nowrap">
                    Subject: {hierarchy.subject}
                  </span>
                </div>
                <ChevronRight size={14} className="text-gray-400" />

                <div className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-green-50 border border-green-100 shadow-sm">
                  <GraduationCap size={12} className="mr-1.5 text-green-600" />
                  <span className="text-xs font-medium text-green-700 whitespace-nowrap">
                    Course: {hierarchy.course}
                  </span>
                </div>
                <ChevronRight size={14} className="text-gray-400" />

                <div className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-yellow-50 border border-yellow-100 shadow-sm">
                  <BookText size={12} className="mr-1.5 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-700 whitespace-nowrap">
                    Unit: {hierarchy.unit}
                  </span>
                </div>
                <ChevronRight size={14} className="text-gray-400" />

                <div className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-red-50 border border-red-100 shadow-sm">
                  <ListChecks size={12} className="mr-1.5 text-red-600" />
                  <span className="text-xs font-medium text-red-700 whitespace-nowrap">
                    Topic: {hierarchy.topic}
                  </span>
                </div>
              </div>
            </div>
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
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
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
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
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
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
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
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
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
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
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
                onClick={() => window.location.reload()}
              >
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
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
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
