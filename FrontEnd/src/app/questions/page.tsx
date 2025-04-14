// First, let's extract the QuestionCard into a separate memoized component

'use client';
import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
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
  SortDesc,
  ArrowUpDown,
  Calendar,
  Eye,
  CheckCircle2,
  Circle,
} from "lucide-react";
import Link from "next/link";
import EditQuestionModal from "./EditQuestionModal";
import ViewQuestionModal from "./ViewQuestionModal";
import { showToast } from "@/components/toast";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { MathJax } from "better-react-mathjax";
import { useAuth } from "@/contexts/AuthContext";

// Interfaces remain the same
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
  sort_by: string;
  sort_order: "asc" | "desc";
}

// A separate QuestionCardProps interface for our extracted component
interface QuestionCardProps {
  question: Question;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onEdit?: (question: Question) => void;
  onDelete?: (id: string) => void;
  onView?: (question: Question) => void;
  isTeacherOrAdmin: boolean;
  hierarchyData: any;
  formatDate: (dateString: string) => string;
}

// Create a memoized QuestionCard component
const QuestionCard = memo(({
  question,
  isSelected,
  onToggleSelection,
  onEdit,
  onDelete,
  onView,
  isTeacherOrAdmin,
  hierarchyData,
  formatDate
}: QuestionCardProps) => {
  
  // Moved the hierarchy calculation to the component
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

  // Check if it's a written answer type
  const isWrittenAnswerType =
    question.question_type === "ShortAnswer" ||
    question.question_type === "LongAnswer";

  // Get hierarchy data for this question
  const hierarchy = getQuestionHierarchy(question);
  const topicName = hierarchyData.topics[question.topic_id]?.name;

  return (
    <div
      className={`bg-white border ${isSelected ? 'border-blue-400' : 'border-gray-200'} rounded-lg p-4 mb-4 shadow-sm ${isSelected ? 'ring-2 ring-blue-100' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        {/* Checkbox for multi-select (only for teachers/admins) */}
        {isTeacherOrAdmin && (
          <div className="mr-3 mt-1">
            <button 
              onClick={() => onToggleSelection(question.id)}
              className="text-gray-500 hover:text-blue-500 focus:outline-none"
            >
              {isSelected ? (
                <CheckCircle2 size={20} className="text-blue-500" />
              ) : (
                <Circle size={20} />
              )}
            </button>
          </div>
        )}
      
        <div className="flex flex-wrap items-center gap-2 mb-3 flex-grow">
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
          
          {/* Date label */}
          <div className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-50 text-gray-700 border border-gray-200 shadow-sm">
            <Calendar size={14} className="mr-1.5" />
            <span className="text-xs font-medium">
              {formatDate(question.created_at)}
            </span>
          </div>
        </div>

        {/* Admin/Teacher Controls - Only show for appropriate roles */}
        {isTeacherOrAdmin && (
          <div className="flex gap-2">
            <button
              className="p-1 text-gray-500 hover:text-blue-500"
              onClick={() => onEdit && onEdit(question)}
              title="Edit Question"
            >
              <Edit size={16} />
            </button>
            <button
              className="p-1 text-gray-500 hover:text-red-500"
              onClick={() => onDelete && onDelete(question.id)}
              title="Delete Question"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {/* Student View button - Show for students */}
        {!isTeacherOrAdmin && (
          <div>
            <button
              className="p-1 text-gray-500 hover:text-blue-500"
              onClick={() => onView && onView(question)}
              title="View Question Details"
            >
              <Eye size={16} />
            </button>
          </div>
        )}
      </div>

      <h3 className="font-medium text-gray-900 mb-2">
      <MathJax inline>{question.question_text}</MathJax>
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
          <MathJax inline>{question.explanation}</MathJax>
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
});

// Set display name for debugging
QuestionCard.displayName = 'QuestionCard';

// Main QuestionsPage component with optimizations
const QuestionsPage = () => {
  const { user } = useAuth();
  const isTeacherOrAdmin = user?.role === "admin" || user?.role === "teacher";
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  // Use useRef for selectedQuestions to avoid unnecessary re-renders
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const selectedQuestionsSet = useMemo(() => 
    new Set(selectedQuestions), [selectedQuestions]);
  
  const [filters, setFilters] = useState<FilterState>({
    topic_id: "",
    question_type: "",
    difficulty: "",
    ai_generated: undefined,
    sort_by: "created_at",
    sort_order: "desc"
  });
  
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isMultiDeleteDialogOpen, setIsMultiDeleteDialogOpen] = useState(false);

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

  // Sort options
  const sortOptions = [
    { value: "created_at", label: "Date Created" },
    { value: "updated_at", label: "Date Updated" },
    { value: "question_text", label: "Question Text" },
    { value: "difficulty", label: "Difficulty Level" },
  ];

  // Format date for display - memoize this function
  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Fetch questions and their hierarchical data
  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const apiFilters = {
        ...filters,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order
      };
      
      const data = await questionAPI.getAllQuestions(apiFilters);
      
      // If API doesn't support sorting, we can sort locally
      let sortedData = [...data];
      if (filters.sort_by === "created_at") {
        sortedData.sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return filters.sort_order === "desc" ? dateB - dateA : dateA - dateB;
        });
      }
      
      setQuestions(sortedData);
      // Clear selected questions when fetching new questions
      setSelectedQuestions([]);

      const allTopics = await curriculumAPI.getTopics();
      setTopics(allTopics);

      // Fetch hierarchy data for all questions
      await fetchHierarchyData(sortedData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load questions";
      console.error("Error fetching questions:", error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch all hierarchical data needed for displaying question paths
  const fetchHierarchyData = async (questions: Question[]) => {
    try {
      // Extract unique topic IDs from questions
      const topicIds = new Set<string>();
      questions.forEach((q) => {
        if (q.topic_id) topicIds.add(q.topic_id);
      });

      if (topicIds.size === 0) {
        return;
      }

      // Fetch all topics first - using topicAPI instead of curriculumAPI
      const topicsMap: Record<string, any> = {};
      const topicsData = await Promise.all(
        Array.from(topicIds).map((id) => topicAPI.getTopic(id))
      );

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
    } catch (error) {
      console.error("Error fetching hierarchy data:", error);
    }
  };

  // Load questions when filters change
  useEffect(() => {
    fetchQuestions();
  }, [filters, fetchQuestions]);

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value === "" ? "" : value,
    }));
  };

  // Handle sort order toggle
  const toggleSortOrder = () => {
    setFilters(prev => ({
      ...prev,
      sort_order: prev.sort_order === "asc" ? "desc" : "asc"
    }));
  };

  // Handle edit button click - with useCallback to prevent unnecessary re-renders
  const handleEdit = useCallback((question: Question) => {
    setEditingQuestion(question);
    setIsEditModalOpen(true);
  }, []);

  // Handle view button click (for students) - with useCallback
  const handleView = useCallback((question: Question) => {
    setViewingQuestion(question);
    setIsViewModalOpen(true);
  }, []);

  // Handle delete request - with useCallback
  const handleDeleteRequest = useCallback((id: string) => {
    setQuestionToDelete(id);
    setConfirmDialogOpen(true);
  }, []);

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
      setConfirmDialogOpen(false);
    }
  };

  // Optimized toggle function for selection
  const toggleQuestionSelection = useCallback((id: string) => {
    setSelectedQuestions(prevSelected => {
      // Using a Set for performance with large lists
      const newSet = new Set(prevSelected);
      
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      
      return Array.from(newSet);
    });
  }, []);

  // Toggle select all
  const toggleSelectAll = useCallback(() => {
    setSelectedQuestions(prev => 
      prev.length === questions.length 
        ? [] 
        : questions.map(q => q.id)
    );
  }, [questions]);

  // Handle multiple delete request
  const handleMultipleDeleteRequest = useCallback(() => {
    if (selectedQuestions.length === 0) return;
    setIsMultiDeleteDialogOpen(true);
  }, [selectedQuestions.length]);

  // Handle multiple delete confirmation
  const handleMultipleDelete = async () => {
    if (selectedQuestions.length === 0) return;

    try {
      await Promise.all(
        selectedQuestions.map(id => questionAPI.deleteQuestion(id))
      );

      setQuestions(questions.filter(q => !selectedQuestionsSet.has(q.id)));
      showToast.success(`${selectedQuestions.length} questions deleted successfully`);
      
      setSelectedQuestions([]);
    } catch (error) {
      console.error("Error deleting questions:", error);
      showToast.error("Failed to delete some questions");
    } finally {
      setIsMultiDeleteDialogOpen(false);
    }
  };

  // Memoize the question list rendering for better performance
  const renderQuestionsList = useMemo(() => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
          <button
            className="mt-2 text-red-700 font-medium underline"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      );
    }
    
    if (questions.length === 0) {
      return (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm">
          <FileText size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No questions found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or check back later.
          </p>
          
          {isTeacherOrAdmin && (
            <Link
              href="/generate"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Generate Questions
            </Link>
          )}
        </div>
      );
    }
    
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Showing {questions.length} questions, sorted by {
              sortOptions.find(opt => opt.value === filters.sort_by)?.label || "Date Created"
            } ({filters.sort_order === "asc" ? "oldest first" : "newest first"})
          </p>
          
          {isTeacherOrAdmin && questions.length > 0 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleSelectAll}
                className="text-gray-600 hover:text-blue-600 flex items-center gap-1.5"
              >
                {selectedQuestions.length === questions.length ? (
                  <CheckCircle2 size={18} className="text-blue-500" />
                ) : (
                  <Circle size={18} />
                )}
                <span className="text-sm font-medium">
                  {selectedQuestions.length === questions.length ? "Deselect All" : "Select All"}
                </span>
              </button>
              
              {selectedQuestions.length > 0 && (
                <span className="text-xs text-gray-500 ml-2">
                  {selectedQuestions.length} selected
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Render questions with memoized QuestionCard component */}
        {questions.map(question => (
          <QuestionCard
            key={question.id}
            question={question}
            isSelected={selectedQuestionsSet.has(question.id)}
            onToggleSelection={toggleQuestionSelection}
            onEdit={isTeacherOrAdmin ? handleEdit : undefined}
            onDelete={isTeacherOrAdmin ? handleDeleteRequest : undefined}
            onView={!isTeacherOrAdmin ? handleView : undefined}
            isTeacherOrAdmin={isTeacherOrAdmin}
            hierarchyData={hierarchyData}
            formatDate={formatDate}
          />
        ))}
      </>
    );
  }, [
    isLoading, 
    error, 
    questions, 
    isTeacherOrAdmin,
    selectedQuestionsSet,
    selectedQuestions.length,
    filters.sort_by,
    filters.sort_order,
    toggleSelectAll,
    toggleQuestionSelection,
    handleEdit,
    handleDeleteRequest,
    handleView,
    hierarchyData,
    formatDate,
    sortOptions
  ]);

  return (
    <Layout allowedRoles={["admin", "teacher", "student"]}>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Questions</h1>
          
          {isTeacherOrAdmin && (
            <div className="flex gap-3">
              {selectedQuestions.length > 0 && (
                <button
                  onClick={handleMultipleDeleteRequest}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Selected ({selectedQuestions.length})
                </button>
              )}
              
              <Link
                href="/generate"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Generate Questions
              </Link>
            </div>
          )}
        </div>

        {/* Filters with Sort options */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-gray-500" />
            <h2 className="font-medium">Filters & Sorting</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

            {/* Sort Options */}
            <div className="md:col-span-1">
              <label className="block text-sm text-gray-600 mb-1">Sort By</label>
              <div className="flex gap-2">
                <select
                  name="sort_by"
                  value={filters.sort_by}
                  onChange={handleFilterChange}
                  className="flex-grow p-2 border border-gray-300 rounded-md text-sm"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={toggleSortOrder}
                  className="p-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                  title={filters.sort_order === "asc" ? "Ascending order" : "Descending order"}
                >
                  {filters.sort_order === "asc" ? (
                    <ArrowUpDown size={18} className="text-gray-700" />
                  ) : (
                    <SortDesc size={18} className="text-gray-700" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div>
          {renderQuestionsList}
        </div>

        {/* Single question delete confirmation */}
        {isTeacherOrAdmin && (
          <ConfirmationDialog
            isOpen={confirmDialogOpen}
            onClose={() => setConfirmDialogOpen(false)}
            onConfirm={handleDelete}
            title="Delete Question"
            message="Are you sure you want to delete this question? This action cannot be undone."
            confirmText="Delete"
          />
        )}

        {/* Multiple questions delete confirmation */}
        {isTeacherOrAdmin && (
          <ConfirmationDialog
            isOpen={isMultiDeleteDialogOpen}
            onClose={() => setIsMultiDeleteDialogOpen(false)}
            onConfirm={handleMultipleDelete}
            title="Delete Selected Questions"
            message={`Are you sure you want to delete ${selectedQuestions.length} selected questions? This action cannot be undone.`}
            confirmText="Delete All"
          />
        )}

        {/* Edit Modal for admin/teacher */}
        {isTeacherOrAdmin && isEditModalOpen && editingQuestion && (
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

        {/* View Modal for students */}
        {!isTeacherOrAdmin && isViewModalOpen && viewingQuestion && (
          <ViewQuestionModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            question={viewingQuestion}
            hierarchy={hierarchyData && viewingQuestion ? 
              // Get hierarchy for the viewing question
              (() => {
                if (!viewingQuestion.topic_id) return null;
                
                try {
                  const { topics, units, courses, subjects, curricula } = hierarchyData;
                  
                  const topic = topics[viewingQuestion.topic_id];
                  if (!topic) return null;
                  
                  const unit = units[topic.unit_id];
                  if (!unit) return null;
                  
                  const course = courses[unit.course_id];
                  if (!course) return null;
                  
                  const subject = subjects[course.subject_id];
                  if (!subject) return null;
                  
                  const curriculum = curricula[subject.curriculum_id];
                  if (!curriculum) return null;
                  
                  return {
                    topic: topic.name,
                    unit: unit.name,
                    course: course.name,
                    subject: subject.name,
                    curriculum: curriculum.name,
                  };
                } catch (error) {
                  return null;
                }
              })() : null
            }
            formatDate={formatDate}
          />
        )}
      </div>
    </Layout>
  );
};

export default QuestionsPage;