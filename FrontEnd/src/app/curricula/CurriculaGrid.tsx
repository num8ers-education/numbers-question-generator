"use client";

import { useEffect, useState } from "react";
import CurriculumCard from "./CurriculumCard";
import { curriculumAPI } from "@/services/api";
import toast from "react-hot-toast";

// Define types for curriculum data
interface Curriculum {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

interface CurriculumDisplayData {
  id: string;
  title: string;
  level: string;
  subjectArea: string;
  questionCount: number;
  description?: string;
  lastGenerated?: string;
}

interface CurriculaGridProps {
  limit?: number;
  refreshTrigger?: number;
  onRefreshNeeded?: () => void;
}

// Add confirmation dialog component
const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const CurriculaGrid = ({ limit, refreshTrigger, onRefreshNeeded }: CurriculaGridProps) => {
  const [curricula, setCurricula] = useState<CurriculumDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Add states for deletion handling
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [curriculumToDelete, setCurriculumToDelete] = useState<string | null>(null);

  // Fetch curricula whenever the component mounts or refreshTrigger changes
  useEffect(() => {
    fetchCurricula();
  }, [refreshTrigger]); // Add refreshTrigger as a dependency

  const fetchCurricula = async () => {
    try {
      setIsLoading(true);
      setLoadProgress(10); // Initial progress
      
      const data = await curriculumAPI.getAllCurricula();
      setLoadProgress(40); // Update progress after initial fetch
      
      // Show progress advancing during the subject loading step
      let completedItems = 0;
      const totalItems = data.length;
      
      // Transform API data to match component's expected format
      const formattedData = await Promise.all(
        data.map(async (curriculum: Curriculum, index: number) => {
          // For each curriculum, get its subjects to determine subject area
          let subjectArea = "Various";
          let questionCount = 0;

          try {
            const subjects = await curriculumAPI.getSubjects(curriculum.id);
            if (subjects && subjects.length > 0) {
              // Use the first subject as the main subject area
              subjectArea = subjects[0].name;

              // To get question count, we'd need to traverse the full hierarchy
              // This would be expensive, so for now we'll use a placeholder
              questionCount = Math.floor(Math.random() * 300) + 50; // Placeholder
            }
          } catch (err) {
            console.error(
              `Error fetching subjects for curriculum ${curriculum.id}:`,
              err
            );
          }
          
          // Update progress as each item completes
          completedItems++;
          setLoadProgress(40 + Math.floor((completedItems / totalItems) * 50));

          return {
            id: curriculum.id,
            title: curriculum.name,
            level: "All Levels", // This info isn't in the API response, so using a default
            subjectArea,
            questionCount,
            description: curriculum.description,
            lastGenerated: new Date(
              curriculum.updated_at || curriculum.created_at
            ).toLocaleDateString(),
          };
        })
      );

      // Apply limit if specified
      const limitedData = limit ? formattedData.slice(0, limit) : formattedData;
      setCurricula(limitedData);
      setLoadProgress(100);
    } catch (err) {
      console.error("Error fetching curricula:", err);
      setError("Failed to load curricula. Please try again later.");
      toast.error("Failed to load curricula. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare for deletion
  const handleDeleteRequest = (id: string) => {
    setCurriculumToDelete(id);
    setConfirmDialogOpen(true);
  };

  // Function to handle curriculum deletion
  const handleDelete = async () => {
    if (!curriculumToDelete) return;
    
    try {
      // Set deleting state to show visual feedback
      setDeletingId(curriculumToDelete);
      
      // Close the confirmation dialog
      setConfirmDialogOpen(false);
      
      // Delete the curriculum
      await curriculumAPI.deleteCurriculum(curriculumToDelete);
      
      // Show success message
      toast.success("Curriculum deleted successfully");
      
      // Update the UI by removing the deleted curriculum
      setCurricula(curricula.filter((c) => c.id !== curriculumToDelete));
      
      // Notify parent component if needed
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err) {
      console.error("Error deleting curriculum:", err);
      toast.error("Failed to delete curriculum");
    } finally {
      // Clear the deleting state
      setDeletingId(null);
      setCurriculumToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="relative">
        {/* Subtle progress bar at the very top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 z-10">
          <div 
            className="bg-blue-500 h-1 transition-all duration-300 ease-out"
            style={{ width: `${loadProgress}%` }}
          ></div>
        </div>
        
        {/* Skeleton card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-3">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 h-64 relative overflow-hidden">
              
              {/* Loading overlay with shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-75 skeleton-shimmer"></div>
              
              <div className="h-40 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              
              {/* Loading status indicator (subtle) */}
              {index === 0 && (
                <div className="absolute bottom-3 right-3 flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
                  <span className="text-xs text-gray-500">
                    {loadProgress < 40 ? "Loading..." : 
                     loadProgress < 90 ? `${Math.min(Math.floor(((loadProgress - 40) / 50) * 100), 99)}%` : 
                     "Almost ready"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Add the shimmer animation style */}
        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .skeleton-shimmer {
            animation: shimmer 1.5s infinite;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">{error}</p>
        <button
          className="mt-2 text-red-700 font-medium underline"
          onClick={() => fetchCurricula()}>
          Retry
        </button>
      </div>
    );
  }

  if (curricula.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          No curricula found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new curriculum.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {curricula.map((curriculum) => (
          <div key={curriculum.id} className="relative">
            {/* Deletion loading overlay */}
            {deletingId === curriculum.id && (
              <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mb-2"></div>
                <span className="text-sm text-gray-600">Deleting...</span>
              </div>
            )}
            
            <CurriculumCard
              {...curriculum}
              onDelete={() => handleDeleteRequest(curriculum.id)}
            />
          </div>
        ))}
      </div>
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Curriculum"
        message="Are you sure you want to delete this curriculum? This action cannot be undone."
      />
    </>
  );
};

export default CurriculaGrid;