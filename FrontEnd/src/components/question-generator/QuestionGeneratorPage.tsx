// src/components/question-generator/QuestionGeneratorPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Sparkles,
  Brain,
  Bot,
  BookText,
  Edit,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  CheckSquare,
  ToggleLeft,
  TextCursor,
  PenLine,
  Eye,
  CornerDownRight,
  ThumbsUp,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
} from "lucide-react";
import Link from "next/link";
import { curriculumAPI, questionAPI, promptAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

// Static data for the dropdowns and options
const questionTypes = [
  { id: "MCQ", name: "Multiple Choice (Single Answer)", icon: "📝" },
  { id: "MultipleAnswer", name: "Multiple Answers", icon: "✅" },
  { id: "True/False", name: "True/False", icon: "⚖️" },
  { id: "Fill-in-the-blank", name: "Fill-in-the-blank", icon: "📝" },
  { id: "ShortAnswer", name: "Short Written Answer", icon: "✏️" },
  { id: "LongAnswer", name: "Long Written Answer", icon: "📄" },
];

const difficultyLevels = [
  {
    id: "Easy",
    name: "Easy",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    id: "Medium",
    name: "Medium",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  { id: "Hard", name: "Hard", color: "bg-red-100 text-red-800 border-red-200" },
];

const aiModels = [
  {
    id: "gpt4",
    name: "GPT-4",
    icon: <Brain className="h-5 w-5 text-purple-500" />,
  },
  {
    id: "claude",
    name: "Claude",
    icon: <Bot className="h-5 w-5 text-orange-500" />,
  },
  {
    id: "gemini",
    name: "Gemini",
    icon: <Sparkles className="h-5 w-5 text-blue-500" />,
  },
  {
    id: "llama",
    name: "Llama 3",
    icon: <BookText className="h-5 w-5 text-green-500" />,
  },
];

export default function QuestionGeneratorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  // Extract curriculum, course, and unit IDs directly from URL params
  const curriculumId = params.curriculumId as string;
  const courseId = params.courseId as string;
  const unitId = params.unitId as string;

  // State for curriculum data
  const [curriculumData, setCurriculumData] = useState({
    curriculum: "",
    course: "",
    unit: "",
    topicId: "", // We'll need to select a topic
  });
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    numberOfQuestions: 3,
    questionType: "",
    difficultyLevel: "",
    questionSetName: "",
    aiModel: "gpt4", // Default to GPT-4
  });

  // Custom prompt state
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [savedPrompts, setSavedPrompts] = useState<any[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState("");
  const [isPromptSectionExpanded, setIsPromptSectionExpanded] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  
  // New state for expanded questions
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  // Fetch curriculum data on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Get curriculum details
        const curriculum = await curriculumAPI.getCurriculum(curriculumId);

        // Get course details
        const allCourses = await curriculumAPI.getCourses(); // No subject parameter
        const course = allCourses.find((c: any) => c.id === courseId);

        // Get unit details
        const unit = await curriculumAPI
          .getUnits(courseId)
          .then((units) => units.find((u: any) => u.id === unitId));

        // Get topics for this unit
        const topicsData = await curriculumAPI.getTopics(unitId);
        setTopics(topicsData);

        // Set the curriculum data
        setCurriculumData({
          curriculum: curriculum.name,
          course: course ? course.name : "Unknown Course",
          unit: unit ? unit.name : "Unknown Unit",
          topicId: topicsData.length > 0 ? topicsData[0].id : "",
        });

        // Set the first topic as selected
        if (topicsData.length > 0) {
          setSelectedTopic(topicsData[0].id);
        }
      } catch (err) {
        console.error("Error fetching curriculum data:", err);
        setError("Failed to load curriculum data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [curriculumId, courseId, unitId]);

  // Fetch saved prompts
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setIsPromptLoading(true);
        const promptsData = await promptAPI.getAllPrompts();
        setSavedPrompts(promptsData);
        
        // Find and set the default prompt
        const defaultPrompt = promptsData.find((p: any) => p.is_default);
        if (defaultPrompt) {
          setSelectedPromptId(defaultPrompt.id);
        }
      } catch (err) {
        console.error("Error fetching prompts:", err);
      } finally {
        setIsPromptLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  // Handle form changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle topic selection
  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTopic(e.target.value);
  };

  // Handle custom prompt change
  const handleCustomPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomPrompt(e.target.value);
  };

  // Handle prompt selection
  const handlePromptSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const promptId = e.target.value;
    setSelectedPromptId(promptId);
    
    // Find the selected prompt and set its content to the custom prompt field
    const selectedPrompt = savedPrompts.find(p => p.id === promptId);
    if (selectedPrompt) {
      setCustomPrompt(selectedPrompt.template);
    }
  };

  // Toggle custom prompt section
  const toggleCustomPrompt = () => {
    setUseCustomPrompt(!useCustomPrompt);
    if (!useCustomPrompt && !isPromptSectionExpanded) {
      setIsPromptSectionExpanded(true);
    }
  };

  // Toggle prompt section expansion
  const togglePromptSection = () => {
    setIsPromptSectionExpanded(!isPromptSectionExpanded);
  };

  // Toggle question expansion
  const toggleQuestionExpansion = (questionId: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Handle selection of cards (for question type, difficulty, AI model)
  const handleCardSelection = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Initialize expanded state after questions are generated
  useEffect(() => {
    if (generatedQuestions.length > 0) {
      const initialExpandedState: Record<string, boolean> = {};
      // Expand the first question by default
      if (generatedQuestions[0]) {
        initialExpandedState[generatedQuestions[0].id] = true;
      }
      setExpandedQuestions(initialExpandedState);
    }
  }, [generatedQuestions]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      // Get the topic name for placeholder substitution in prompt
      const topic = topics.find(t => t.id === selectedTopic);
      const topicName = topic ? topic.name : "";

      // Prepare data for the API call
      const generationData = {
        topic_id: selectedTopic,
        num_questions: formData.numberOfQuestions,
        question_types: [formData.questionType], // Ensuring this is an array
        difficulty: formData.difficultyLevel,
        custom_prompt: useCustomPrompt ? customPrompt
          .replace("{topic}", topicName)
          .replace("{difficulty}", formData.difficultyLevel)
          .replace("{question_type}", formData.questionType) : null,
      };

      // Log the request data for debugging
      console.log("Sending generation request:", generationData);

      // Make the API call
      const generatedData = await questionAPI.generateQuestions(generationData);

      // Store the generated questions
      setGeneratedQuestions(generatedData);

      // Set success state
      setIsGenerated(true);
    } catch (err: any) {
      console.error("Error generating questions:", err);

      // Enhanced error handling to show more details
      if (err.response?.data) {
        console.error("Server response:", err.response.data);
        setError(err.response.data.detail || JSON.stringify(err.response.data));
      } else {
        setError("Failed to generate questions. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Check if the form is valid
  const isFormValid = () => {
    const basicRequirements = 
      formData.numberOfQuestions > 0 &&
      formData.questionType !== "" &&
      formData.difficultyLevel !== "" &&
      formData.questionSetName.trim() !== "" &&
      formData.aiModel !== "" &&
      selectedTopic !== "";
      
    if (!useCustomPrompt) return basicRequirements;
    
    // If using custom prompt, also require the prompt to be non-empty
    return basicRequirements && customPrompt.trim() !== "";
  };

  // Handle viewing the generated questions
  const handleViewQuestions = () => {
    // In a real app, you'd navigate to a page to view the questions
    router.push("/questions");
  };

  // Render a question card
  const renderQuestionCard = (question: any, index: number) => {
    const isExpanded = expandedQuestions[question.id] || false;
    const isWrittenAnswerType = 
      question.question_type === "ShortAnswer" || 
      question.question_type === "LongAnswer";

    return (
      <div 
        key={question.id} 
        className="border border-gray-200 rounded-lg mb-4 shadow-sm overflow-hidden bg-white"
      >
        {/* Question header */}
        <div 
          className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-start cursor-pointer"
          onClick={() => toggleQuestionExpansion(question.id)}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold mr-3">
              {index + 1}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 pr-8">{question.question_text}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {/* Question Type Badge */}
                <div className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-medium
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
                    <CircleCheck size={12} className="mr-1" />
                  )}
                  {question.question_type === "MultipleAnswer" && (
                    <CheckSquare size={12} className="mr-1" />
                  )}
                  {question.question_type === "True/False" && (
                    <ToggleLeft size={12} className="mr-1" />
                  )}
                  {question.question_type === "Fill-in-the-blank" && (
                    <TextCursor size={12} className="mr-1" />
                  )}
                  {question.question_type === "ShortAnswer" && (
                    <PenLine size={12} className="mr-1" />
                  )}
                  {question.question_type === "LongAnswer" && (
                    <FileText size={12} className="mr-1" />
                  )}

                  {/* Format question type text */}
                  <span>
                    {question.question_type === "MCQ"
                      ? "Multiple Choice"
                      : question.question_type === "MultipleAnswer"
                      ? "Multiple Answers"
                      : question.question_type === "True/False"
                      ? "True/False"
                      : question.question_type === "Fill-in-the-blank"
                      ? "Fill-in-blank"
                      : question.question_type === "ShortAnswer"
                      ? "Short Answer"
                      : "Long Answer"}
                  </span>
                </div>

                {/* Difficulty Badge */}
                <div
                  className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-medium
                    ${
                      question.difficulty === "Easy"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : question.difficulty === "Medium"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                >
                  <ThumbsUp size={12} className="mr-1" />
                  <span>{question.difficulty}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-gray-500">
            {isExpanded ? 
              <ChevronUpIcon size={20} /> : 
              <ChevronDownIcon size={20} />
            }
          </div>
        </div>

        {/* Question details - only shown when expanded */}
        {isExpanded && (
          <div className="p-4 border-t border-gray-200">
            {!isWrittenAnswerType && question.options && question.options.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Answer Options:</h4>
                <ul className="space-y-2">
                  {question.options.map((option: string, optionIndex: number) => {
                    const isCorrect = option === question.correct_answer || 
                      (Array.isArray(question.correct_answer) && 
                       question.correct_answer.includes(option));
                    
                    return (
                      <li 
                        key={optionIndex}
                        className={`flex items-start p-2 rounded-md ${
                          isCorrect ? 'bg-green-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="mr-2 mt-0.5">
                          <CornerDownRight size={14} className={`${isCorrect ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${isCorrect ? 'font-medium text-green-800' : 'text-gray-800'}`}>
                            {option}
                            {isCorrect && (
                              <span className="ml-2 text-xs inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                                <Check size={10} className="mr-1" />
                                Correct
                              </span>
                            )}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            
            {isWrittenAnswerType && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-sm text-gray-600">
                  This is a {question.question_type === "ShortAnswer" ? "short" : "long"} written response question. 
                  Students will need to write their answers.
                </p>
              </div>
            )}
            
            {question.explanation && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Explanation:</h4>
                <p className="text-sm text-gray-600">{question.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="bg-blue-600 text-white px-6 py-4">
            <div className="flex items-center">
              <Link
                href="/generate"
                className="mr-4 p-2 rounded-full hover:bg-blue-700 transition-all">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold">Question Generator</h1>
            </div>
          </div>

          {/* Selected content summary */}
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Selected Content
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-1">
                  CURRICULUM
                </p>
                <p className="font-medium">{curriculumData.curriculum}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-1">COURSE</p>
                <p className="font-medium">{curriculumData.course}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-1">UNIT</p>
                <p className="font-medium">{curriculumData.unit}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Question Generator Form */}
        {!isGenerated ? (
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                Configure Your Questions
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Topic Selection */}
                <div className="mb-8">
                  <label
                    htmlFor="topic"
                    className="block text-sm font-medium text-gray-700 mb-1">
                    Topic
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    value={selectedTopic}
                    onChange={handleTopicChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Number of Questions */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Number of Questions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((number) => (
                      <button
                        key={number}
                        type="button"
                        className={`px-4 py-2 rounded-md transition-colors cursor-pointer ${
                          formData.numberOfQuestions === number
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            numberOfQuestions: number,
                          })
                        }>
                        {number}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Type */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {questionTypes.map((type) => (
                      <div
                        key={type.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          formData.questionType === type.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() =>
                          handleCardSelection("questionType", type.id)
                        }>
                        <div className="flex items-center">
                          <span className="mr-2 text-xl">{type.icon}</span>
                          <span className="text-sm font-medium">
                            {type.name}
                          </span>
                          {formData.questionType === type.id && (
                            <Check className="h-4 w-4 text-blue-500 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulty Level */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Difficulty Level
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {difficultyLevels.map((level) => (
                      <button
                        key={level.id}
                        type="button"
                        className={`px-6 py-2 rounded-md flex items-center transition-all cursor-pointer border-2 ${
                          formData.difficultyLevel === level.id
                            ? level.id === "Easy"
                              ? "bg-green-100 text-green-800 border-green-500"
                              : level.id === "Medium"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-500"
                              : "bg-red-100 text-red-800 border-red-500"
                            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          handleCardSelection("difficultyLevel", level.id)
                        }>
                        <span className="font-medium">{level.name}</span>
                        {formData.difficultyLevel === level.id && (
                          <Check className="h-4 w-4 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Prompt Section */}
                <div className="mb-8 border rounded-lg p-4 bg-gray-50">
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={togglePromptSection}>
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-medium">AI Prompt Settings</h3>
                    </div>
                    <button type="button" className="text-gray-500">
                      {isPromptSectionExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  {isPromptSectionExpanded && (
                    <div className="mt-4">
                      <div className="flex items-center mb-4">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={useCustomPrompt}
                            onChange={toggleCustomPrompt}
                            className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-gray-700">Use custom prompt</span>
                        </label>
                      </div>
                      
                      {useCustomPrompt && (
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="promptTemplate" className="block text-sm font-medium text-gray-700 mb-1">
                              Select a prompt template
                            </label>
                            <select
                              id="promptTemplate"
                              value={selectedPromptId}
                              onChange={handlePromptSelect}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              disabled={isPromptLoading}
                            >
                              <option value="">-- Select a prompt template --</option>
                              {savedPrompts.map((prompt) => (
                                <option key={prompt.id} value={prompt.id}>
                                  {prompt.name} {prompt.is_default ? "(Default)" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700 mb-1">
                              Edit or create your custom prompt
                            </label>
                            <textarea
                              id="customPrompt"
                              value={customPrompt}
                              onChange={handleCustomPromptChange}
                              rows={6}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter your custom prompt here. You can use {topic}, {difficulty}, and {question_type} as placeholders."
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1">
                              Use {"{topic}"}, {"{difficulty}"}, and {"{question_type}"} as placeholders for dynamic content.
                            </p>
                          </div>
                          
                          <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 flex">
                            <AlertTriangle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                            <p>
                              Custom prompts allow you to control exactly how questions are generated. 
                              For best results, provide clear instructions about the format, style, and content of questions you want.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Question Set Name */}
                <div className="mb-8">
                  <label
                    htmlFor="questionSetName"
                    className="block text-sm font-medium text-gray-700 mb-1">
                    Question Set Name
                  </label>
                  <input
                    type="text"
                    id="questionSetName"
                    name="questionSetName"
                    placeholder="e.g., Algebra Quiz 1"
                    value={formData.questionSetName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* AI Model Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    AI Model
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {aiModels.map((model) => (
                      <div
                        key={model.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          formData.aiModel === model.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() =>
                          handleCardSelection("aiModel", model.id)
                        }>
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-2">{model.icon}</div>
                          <span className="text-sm font-medium">
                            {model.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={!isFormValid() || isGenerating}
                    className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white ${
                      isFormValid() && !isGenerating
                        ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        : "bg-gray-400 cursor-not-allowed"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}>
                    {isGenerating ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Generate Questions
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Success state after questions are generated - now shows the questions */
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="bg-green-100 p-3 rounded-full inline-flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Questions Generated!
                </h2>
                <p className="text-gray-600 mb-4">
                  Your {formData.numberOfQuestions} {formData.difficultyLevel}{" "}
                  questions for <span className="font-semibold">{formData.questionSetName}</span> have been created successfully.
                </p>
              </div>
              
              {/* Generated Questions Preview */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-blue-600" />
                  Question Preview
                </h3>
                <div className="space-y-4">
                  {generatedQuestions.map((question, index) => 
                    renderQuestionCard(question, index)
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3 border-t border-gray-200 pt-6">
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  onClick={handleViewQuestions}>
                  View in Question Bank
                </button>
                <button
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      questionType: "",
                      difficultyLevel: "",
                      questionSetName: "",
                    });
                    setIsGenerated(false);
                    setGeneratedQuestions([]);
                  }}>
                  Generate More Questions
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}