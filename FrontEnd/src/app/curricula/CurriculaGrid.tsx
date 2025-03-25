// src/app/curricula/CurriculaGrid.tsx
'use client';

import { useEffect, useState } from 'react';
import CurriculumCard from './CurriculumCard';
import { curriculumAPI } from '@/services/api';

// Define types for curriculum data
interface Curriculum {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at?: string;
  created_by: string;
}

interface CurriculumDisplayData {
  id: string;
  title: string;
  level: string;
  subjectArea: string;
  questionCount: number;
  description?: string;
}

const CurriculaGrid = () => {
  const [curricula, setCurricula] = useState<CurriculumDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurricula = async () => {
      try {
        setIsLoading(true);
        const data = await curriculumAPI.getAllCurricula();
        
        // Transform API data to match component's expected format
        const formattedData = await Promise.all(data.map(async (curriculum: Curriculum) => {
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
            console.error(`Error fetching subjects for curriculum ${curriculum.id}:`, err);
          }
          
          return {
            id: curriculum.id,
            title: curriculum.name,
            level: 'All Levels', // This info isn't in the API response, so using a default
            subjectArea,
            questionCount,
            description: curriculum.description
          };
        }));
        
        setCurricula(formattedData);
      } catch (err) {
        console.error("Error fetching curricula:", err);
        setError("Failed to load curricula. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCurricula();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 h-64 animate-pulse">
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
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {curricula.map((curriculum) => (
        <CurriculumCard
          key={curriculum.id}
          {...curriculum}
        />
      ))}
    </div>
  );
};

export default CurriculaGrid;