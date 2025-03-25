"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Check, 
  ChevronRight, 
  Sparkles, 
  Brain, 
  Bot, 
  BookText
} from "lucide-react";
import Link from "next/link";

// Static data for the dropdowns and options
const questionTypes = [
  { id: "multipleChoice", name: "Multiple Choice (Single Answer)", icon: "📝" },
  { id: "multipleAnswers", name: "Multiple Answers", icon: "✅" },
  { id: "trueFalse", name: "True/False", icon: "⚖️" },
  { id: "fillBlank", name: "Fill-in-the-blank", icon: "📝" },
  { id: "matching", name: "Matching", icon: "🔄" },
  { id: "longAnswer", name: "Long Answer", icon: "📄" }
];

const difficultyLevels = [
  { id: "easy", name: "Easy", color: "bg-green-100 text-green-800 border-green-200" },
  { id: "medium", name: "Medium", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { id: "hard", name: "Hard", color: "bg-red-100 text-red-800 border-red-200" }
];

const aiModels = [
  { id: "gpt4o", name: "GPT-4o", icon: <Brain className="h-5 w-5 text-purple-500" /> },
  { id: "claude", name: "Claude", icon: <Bot className="h-5 w-5 text-orange-500" /> },
  { id: "gemini", name: "Gemini", icon: <Sparkles className="h-5 w-5 text-blue-500" /> },
  { id: "llama", name: "Llama 3", icon: <BookText className="h-5 w-5 text-green-500" /> }
];

// Mock data for display purposes
const mockSelection = {
  curriculum: "Advanced Placement (AP)",
  course: "AP Calculus AB",
  unit: "Limits and Continuity"
};

export default function QuestionGeneratorPage() {
  const params = useParams();
  
  // Extract curriculum, course, and unit IDs directly from URL params
  const curriculumId = params.curriculumId;
  const courseId = params.courseId;
  const unitId = params.unitId;
  
  // Form state
  const [formData, setFormData] = useState({
    numberOfQuestions: 3,
    questionType: "",
    difficultyLevel: "",
    questionSetName: "",
    aiModel: ""
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  
  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle selection of cards (for question type, difficulty, AI model)
  const handleCardSelection = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 2000);
  };
  
  // Check if the form is valid
  const isFormValid = () => {
    return (
      formData.numberOfQuestions > 0 &&
      formData.questionType !== "" &&
      formData.difficultyLevel !== "" &&
      formData.questionSetName.trim() !== "" &&
      formData.aiModel !== ""
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="bg-blue-600 text-white px-6 py-4">
            <div className="flex items-center">
              <Link
                href="/generate"
                className="mr-4 p-2 rounded-full hover:bg-blue-700 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold">Question Generator</h1>
            </div>
          </div>
          
          {/* Selected content summary */}
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Selected Content</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-1">CURRICULUM</p>
                <p className="font-medium">{mockSelection.curriculum}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-1">COURSE</p>
                <p className="font-medium">{mockSelection.course}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-1">UNIT</p>
                <p className="font-medium">{mockSelection.unit}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Question Generator Form */}
        {!isGenerated ? (
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Configure Your Questions</h2>
              
              <form onSubmit={handleSubmit}>
                {/* Number of Questions */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Questions
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      name="numberOfQuestions"
                      value={formData.numberOfQuestions}
                      onChange={handleChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-md font-medium">
                      {formData.numberOfQuestions}
                    </span>
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
                        onClick={() => handleCardSelection("questionType", type.id)}
                      >
                        <div className="flex items-center">
                          <span className="mr-2 text-xl">{type.icon}</span>
                          <span className="text-sm font-medium">{type.name}</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {difficultyLevels.map((level) => (
                      <div
                        key={level.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          formData.difficultyLevel === level.id
                            ? `border-2 ${level.color}`
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleCardSelection("difficultyLevel", level.id)}
                      >
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{level.name}</span>
                          {formData.difficultyLevel === level.id && (
                            <Check className="h-4 w-4 ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Question Set Name */}
                <div className="mb-8">
                  <label htmlFor="questionSetName" className="block text-sm font-medium text-gray-700 mb-1">
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
                        onClick={() => handleCardSelection("aiModel", model.id)}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-2">
                            {model.icon}
                          </div>
                          <span className="text-sm font-medium">{model.name}</span>
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
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
          /* Success state after questions are generated */
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="p-6">
              <div className="text-center py-8">
                <div className="bg-green-100 p-3 rounded-full inline-flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Questions Generated!</h2>
                <p className="text-gray-600 mb-6">
                  Your {formData.numberOfQuestions} {formData.difficultyLevel} questions have been created successfully.
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      // In a real app, this would navigate to the questions page
                      window.location.href = "/questions";
                    }}
                  >
                    View Questions
                  </button>
                  <button
                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setFormData({
                        numberOfQuestions: 3,
                        questionType: "",
                        difficultyLevel: "",
                        questionSetName: "",
                        aiModel: ""
                      });
                      setIsGenerated(false);
                    }}
                  >
                    Generate More
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}