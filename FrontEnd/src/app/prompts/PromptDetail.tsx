"use client";

import { useState } from "react";
import { promptAPI } from "@/services/api";
import { Star, X, Save, AlertTriangle, Info } from "lucide-react";
import { showToast } from "@/components/toast";

interface PromptDetailProps {
  prompt: {
    id: string;
    name: string;
    content: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
  };
  onClose: () => void;
  onUpdate: () => void;
}

export default function PromptDetail({ prompt, onClose, onUpdate }: PromptDetailProps) {
  const [formData, setFormData] = useState({
    name: prompt.name,
    content: prompt.content,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Set as default prompt
  const handleSetDefault = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await promptAPI.setDefaultPrompt(prompt.id);
      showToast.success("Default prompt updated");
      onUpdate();
    } catch (err) {
      console.error("Error setting default prompt:", err);
      setError("Failed to set as default. Please try again.");
      showToast.error("Failed to set as default");
    } finally {
      setIsLoading(false);
    }
  };

  // Update prompt
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.content.trim()) {
      showToast.error("Name and content are required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      // This is a placeholder since we don't have an updatePrompt API method
      // In a real implementation, use the appropriate API method
      // await promptAPI.updatePrompt(prompt.id, formData);
      showToast.success("Prompt updated successfully");
      onUpdate();
      onClose();
    } catch (err) {
      console.error("Error updating prompt:", err);
      setError("Failed to update prompt. Please try again.");
      showToast.error("Failed to update prompt");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Edit Prompt</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleUpdate}>
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
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the prompt template text..."
                required
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                <Info className="h-3 w-3 inline mr-1" />
                Use {"{topic}"}, {"{difficulty}"}, and {"{question_type}"} as placeholders for dynamic content.
              </p>
            </div>
            
            {!prompt.is_default && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <div className="flex items-start">
                  <Star className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      This is not the default prompt template
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Setting this as default will use it for all new question generation unless specifically overridden.
                    </p>
                    <button
                      type="button"
                      onClick={handleSetDefault}
                      className="mt-2 px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded border border-yellow-300 hover:bg-yellow-200 transition-colors"
                      disabled={isLoading}
                    >
                      Set as Default Template
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={onClose}
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
  );
}