// src/app/curricula/CurriculaGrid.tsx
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
  onRefreshNeeded?: () => void;
}

const CurriculaGrid = ({ limit, onRefreshNeeded }: CurriculaGridProps) => {
  const [curricula, setCurricula] = useState<CurriculumDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurricula();
  }, []);

  const fetchCurricula = async () => {
    try {
      setIsLoading(true);
      const data = await curriculumAPI.getAllCurricula();

      // Transform API data to match component's expected format
      const formattedData = await Promise.all(
        data.map(async (curriculum: Curriculum) => {
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
    } catch (err) {
      console.error("Error fetching curricula:", err);
      setError("Failed to load curricula. Please try again later.");
      toast.error("Failed to load curricula. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle curriculum deletion
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this curriculum?")) {
      try {
        await curriculumAPI.deleteCurriculum(id);
        toast.success("Curriculum deleted successfully");
        setCurricula(curricula.filter((c) => c.id !== id));
        if (onRefreshNeeded) onRefreshNeeded();
      } catch (err) {
        console.error("Error deleting curriculum:", err);
        toast.error("Failed to delete curriculum");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 h-64 animate-pulse">
            <div className="h-40 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {curricula.map((curriculum) => (
        <CurriculumCard
          key={curriculum.id}
          {...curriculum}
          onDelete={() => handleDelete(curriculum.id)}
        />
      ))}
    </div>
  );
};

export default CurriculaGrid;
