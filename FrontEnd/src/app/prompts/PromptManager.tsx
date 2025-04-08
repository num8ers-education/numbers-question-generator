"use client";

import { useState, useEffect } from "react";
import { promptAPI } from "@/services/api";
import { FileText, Star, Plus, Pencil, Trash, Info, AlertTriangle, X, Save } from "lucide-react";
import { showToast } from "@/components/toast";
import Link from "next/link";

interface Prompt {
  id: string;
  name: string;
  template: string;
  description: string;
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
    template: "",
    description: "",
  });
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    template: "",
    description: "",
    is_default: false
  });
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Handle edit form input changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Open edit form for a prompt
  const handleEditClick = (prompt: Prompt) => {
    setEditFormData({
      id: prompt.id,
      name: prompt.name,
      template: prompt.template,
      description: prompt.description || "",
      is_default: prompt.is_default
    });
    setShowEditForm(true);
  };

  // Close edit form
  const closeEditForm = () => {
    setShowEditForm(false);
    setEditFormData({
      id: "",
      name: "",
      template: "",
      description: "",
      is_default: false
    });
  };

  // Create a new prompt
  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.template.trim()) {
      showToast.error("Name and template are required");
      return;
    }

    try {
      setIsLoading(true);
      
      // Create the request payload based on the API requirements
      const promptPayload = {
        name: formData.name,
        description: formData.description || `Template for generating ${formData.name}`,
        template: formData.template,
        is_default: false
      };
      
      console.log("Sending prompt data:", promptPayload);
      
      await promptAPI.createPrompt(promptPayload);
      
      showToast.success("Prompt created successfully");
      setFormData({ name: "", template: "", description: "" });
      setShowCreateForm(false);
      fetchPrompts();
    } catch (err) {
      console.error("Error creating prompt:", err);
      
      // Enhanced error handling
      if (err.response) {
        const errorData = err.response.data;
        console.error("API Error Response:", errorData);
        
        // Try to extract a meaningful error message
        let errorMessage = "Failed to create prompt";
        if (errorData?.detail) {
          errorMessage = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
        
        setError(errorMessage);
        showToast.error(errorMessage);
      } else {
        setError("Network error. Please check your connection and try again.");
        showToast.error("Network error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing prompt
  const handleUpdatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editFormData.name.trim() || !editFormData.template.trim()) {
      showToast.error("Name and template are required");
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare the update payload
      const updatePayload = {
        name: editFormData.name,
        description: editFormData.description,
        template: editFormData.template
        // We don't include is_default here as that's handled separately
      };
      
      // Make the API call to update the prompt
      await promptAPI.updatePrompt(editFormData.id, updatePayload);
      
      showToast.success("Prompt updated successfully");
      closeEditForm();
      fetchPrompts();
    } catch (err) {
      console.error("Error updating prompt:", err);
      
      // Enhanced error handling
      if (err.response) {
        const errorData = err.response.data;
        console.error("API Error Response:", errorData);
        
        let errorMessage = "Failed to update prompt";
        if (errorData?.detail) {
          errorMessage = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
        
        setError(errorMessage);
        showToast.error(errorMessage);
      } else {
        setError("Network error. Please check your connection and try again.");
        showToast.error("Network error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle default status
  const handleToggleDefault = async (promptId: string, isCurrentlyDefault: boolean) => {
    try {
      setIsLoading(true);
      
      if (isCurrentlyDefault) {
        // Find another prompt to set as default
        const anotherPrompt = prompts.find(p => p.id !== promptId);
        
        if (anotherPrompt) {
          await promptAPI.setDefaultPrompt(anotherPrompt.id);
          showToast.success(`Default changed to "${anotherPrompt.name}"`);
        } else {
          // If this is the only prompt, we can't unset default
          showToast.error("Cannot unset default when there's only one prompt");
          return;
        }
      } else {
        // Set this prompt as default
        await promptAPI.setDefaultPrompt(promptId);
        showToast.success("Default prompt updated");
      }
      
      fetchPrompts(); // Refresh data to get updated default status
    } catch (err) {
      console.error("Error updating default prompt:", err);
      showToast.error("Failed to update default prompt");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a prompt
  const handleDeletePrompt = async (promptId: string, isDefault: boolean) => {
    if (isDefault) {
      showToast.error("Cannot delete the default prompt. Set another prompt as default first.");
      return;
    }
    
    if (confirm("Are you sure you want to delete this prompt template?")) {
      try {
        setIsDeleting(true); // Use separate loading state for delete operation
        setError(null);
        
        console.log("Deleting prompt with ID:", promptId);
        
        // Make the delete API call
        await promptAPI.deletePrompt(promptId);
        
        // Show success message first, then update UI
        showToast.success("Prompt deleted successfully");
        
        // Update the UI by fetching fresh data
        fetchPrompts();
      } catch (err) {
        console.error("Error deleting prompt:", err);
        
        // Enhanced error handling
        if (err.response) {
          const errorData = err.response.data;
          console.error("API Error Response:", errorData);
          
          let errorMessage = "Failed to delete prompt";
          if (errorData?.detail) {
            errorMessage = typeof errorData.detail === 'string' 
              ? errorData.detail 
              : JSON.stringify(errorData.detail);
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          }
          
          setError(errorMessage);
          showToast.error(errorMessage);
        } else {
          setError("Network error. Please check your connection and try again.");
          showToast.error("Network error when deleting prompt");
        }
      } finally {
        setIsDeleting(false);
      }
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
    setFormData({ name: "", template: "", description: "" });
    setError(null);
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Template optimized for generating math questions"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
                Prompt Template
              </label>
              <textarea
                id="template"
                name="template"
                value={formData.template}
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

      {/* Edit Modal/Dialog */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Edit Prompt</h2>
              <button 
                onClick={closeEditForm}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <form onSubmit={handleUpdatePrompt}>
                <div className="mb-4">
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Prompt Name
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Standard Question Generation"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    id="edit-description"
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Template optimized for generating math questions"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="edit-template" className="block text-sm font-medium text-gray-700 mb-1">
                    Prompt Template
                  </label>
                  <textarea
                    id="edit-template"
                    name="template"
                    value={editFormData.template}
                    onChange={handleEditChange}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter the prompt template text..."
                    required
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">
                    <Info className="h-3 w-3 inline mr-1" />
                    Use {"{topic}"}, {"{difficulty}"}, and {"{question_type}"} as placeholders for dynamic content.
                  </p>
                </div>
                
                {editFormData.is_default && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-md border border-yellow-200 flex items-start">
                    <Star className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 fill-yellow-500" />
                    <p className="text-sm text-yellow-800">
                      This is the default prompt template that will be used for question generation.
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={closeEditForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
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
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
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
                {prompt.description && (
                  <p className="text-sm text-gray-600 mb-2">{prompt.description}</p>
                )}
                <div className="bg-gray-50 p-3 rounded-md mb-4 h-24 overflow-y-auto">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {truncateText(prompt.template, 300)}
                  </pre>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Updated: {formatDate(prompt.updated_at || new Date().toISOString())}
                  </span>
                  <div className="flex space-x-2">
                    {/* Default toggle button */}
                    <button
                      onClick={() => handleToggleDefault(prompt.id, prompt.is_default)}
                      className={`p-1.5 rounded-md ${
                        prompt.is_default 
                          ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
                          : 'text-gray-500 hover:text-yellow-600 hover:bg-yellow-50'
                      }`}
                      title={prompt.is_default ? "Remove default status" : "Set as default"}
                      disabled={isDeleting}
                    >
                      <Star className={`h-4 w-4 ${prompt.is_default ? 'fill-yellow-500' : ''}`} />
                    </button>
                    
                    {/* Edit button */}
                    <button
                      onClick={() => handleEditClick(prompt)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Edit prompt"
                      disabled={isDeleting}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    
                    {/* Delete button */}
                    <button
                      onClick={() => handleDeletePrompt(prompt.id, prompt.is_default)}
                      className={`p-1.5 rounded-md ${
                        prompt.is_default 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title={prompt.is_default ? "Cannot delete default prompt" : "Delete prompt"}
                      disabled={prompt.is_default || isDeleting}
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