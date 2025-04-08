"use client";

import { useState, useEffect } from "react";
import { promptAPI } from "@/services/api";
import { FileText, Star, Plus, Pencil, Trash, Info, AlertTriangle } from "lucide-react";
import { showToast } from "@/components/toast";
import Link from "next/link";

interface Prompt {
  id: string;
  name: string;
  content: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export default function PromptManager() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    content: "",
  });

  // Fetch all prompts
  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await promptAPI.getAllPrompts();
      setPrompts(data);
    } catch (err) {
      console.error("Error fetching prompts:", err);
      setError("Failed to load prompts. Please try again.");
      showToast.error("Failed to load prompts");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Create a new prompt
  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.content.trim()) {
      showToast.error("Name and content are required");
      return;
    }
  
    try {
      setIsLoading(true);
      
      // Log what we're sending to help debug
      console.log("Sending prompt data:", {
        name: formData.name,
        content: formData.content,
      });
      
      // Make sure we're sending the exact structure the API expects
      const promptData = {
        name: formData.name,
        content: formData.content,
        // You might need additional fields based on the API requirements
        // For example, if the API expects a template_type field:
        // template_type: "question_generation"
      };
      
      await promptAPI.createPrompt(promptData);
      
      showToast.success("Prompt created successfully");
      setFormData({ name: "", content: "" });
      setShowCreateForm(false);
      fetchPrompts();
    } catch (err) {
      console.error("Error creating prompt:", err);
      
      // Enhanced error logging to see exactly what the server is returning
      if (err.response) {
        console.error("Server response data:", err.response.data);
        console.error("Server response status:", err.response.status);
        
        // Show a more descriptive error message if available
        if (err.response.data && err.response.data.detail) {
          showToast.error(`Error: ${err.response.data.detail}`);
        } else {
          showToast.error("Failed to create prompt: Invalid data");
        }
      } else {
        showToast.error("Failed to create prompt");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Set a prompt as default
  const handleSetDefault = async (promptId: string) => {
    try {
      setIsLoading(true);
      await promptAPI.setDefaultPrompt(promptId);
      
      // Update local state to reflect the change
      setPrompts(prompts.map(prompt => ({
        ...prompt,
        is_default: prompt.id === promptId
      })));
      
      showToast.success("Default prompt updated");
      fetchPrompts(); // Refresh data
    } catch (err) {
      console.error("Error setting default prompt:", err);
      showToast.error("Failed to set default prompt");
    } finally {
      setIsLoading(false);
    }
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Toggle create form visibility
  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    setFormData({ name: "", content: "" });
  };

  if (isLoading && prompts.length === 0) {
    return (
      <div className="animate-pulse">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-white rounded-lg p-6 h-48 shadow-sm border border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-24 bg-gray-100 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">AI Prompt Templates</h1>
          <p className="text-gray-600">
            Manage the AI prompts used for question generation
          </p>
        </div>
        <button
          onClick={toggleCreateForm}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showCreateForm ? "Cancel" : "New Prompt"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
          <button
            className="mt-2 text-red-700 font-medium underline"
            onClick={fetchPrompts}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Create form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Prompt</h2>
          <form onSubmit={handleCreatePrompt}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Prompt Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Standard Question Generation"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Prompt Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the prompt template text..."
                required
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                <Info className="h-3 w-3 inline mr-1" />
                Use {"{topic}"}, {"{difficulty}"}, and {"{question_type}"} as placeholders for dynamic content.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={toggleCreateForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Prompt"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Prompts grid */}
      {prompts.length === 0 && !isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="mb-4">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No prompts yet</h3>
          <p className="mt-1 text-sm text-gray-500 mb-4">
            Get started by creating your first AI prompt template.
          </p>
          <button
            onClick={toggleCreateForm}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Prompt
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex-1">
                    {prompt.name}
                    {prompt.is_default && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </span>
                    )}
                  </h3>
                </div>
                <div className="bg-gray-50 p-3 rounded-md mb-4 h-24 overflow-y-auto">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {truncateText(prompt.content, 300)}
                  </pre>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Updated: {formatDate(prompt.updated_at || new Date().toISOString())}
                  </span>
                  <div className="flex space-x-2">
                    {!prompt.is_default && (
                      <button
                        onClick={() => handleSetDefault(prompt.id)}
                        className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-md"
                        title="Set as default"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Edit prompt"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete prompt"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}