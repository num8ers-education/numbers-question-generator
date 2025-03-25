"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Layers, GraduationCap } from "lucide-react";
import Link from "next/link";
import Layout from '@/app/layout/Layout';
import { curriculumAPI } from '@/services/api';

interface Curriculum {
  id: string;
  name: string;
  description: string;
  subjects: Array<{
    id: string,
    name: string
  }>;
  icon?: React.ReactNode;
}

interface Course {
  id: string;
  name: string;
  description: string;
  units: Array<{
    id: string,
    name: string
  }>;
}

interface Unit {
  id: string;
  name: string;
  description: string;
}

export default function GeneratePage() {
  const router = useRouter();
  const [view, setView] = useState<"curricula" | "courses" | "units">("curricula");
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch curricula data
  useEffect(() => {
    const fetchCurricula = async () => {
      try {
        setIsLoading(true);
        const data = await curriculumAPI.getAllCurricula();
        
        // Add icons to the curricula
        const mappedData = data.map((curriculum: Curriculum, index: number) => {
          let icon;
          if (index % 3 === 0) {
            icon = <GraduationCap className="h-8 w-8 text-blue-600" />;
          } else if (index % 3 === 1) {
            icon = <BookOpen className="h-8 w-8 text-blue-600" />;
          } else {
            icon = <Layers className="h-8 w-8 text-blue-600" />;
          }
          
          return {
            ...curriculum,
            icon,
            subjects: [] // Initialize with empty array, we'll fetch this when needed
          };
        });
        
        setCurricula(mappedData);
      } catch (err) {
        console.error("Error fetching curricula:", err);
        setError("Failed to load curricula. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCurricula();
  }, []);

  const handleCurriculumClick = async (curriculum: Curriculum) => {
    try {
      setIsLoading(true);
      // Fetch subjects and courses for this curriculum
      const curriculumWithHierarchy = await curriculumAPI.getCurriculumWithHierarchy(curriculum.id);
      
      // Format courses data
      const coursesData = [];
      for (const subject of curriculumWithHierarchy.subjects) {
        for (const course of subject.courses) {
          coursesData.push({
            id: course.id,
            name: course.name,
            description: course.description || "",
            units: course.units || []
          });
        }
      }
      
      setCourses(coursesData);
      setSelectedCurriculum(curriculum);
      setView("courses");
    } catch (err) {
      console.error("Error fetching curriculum details:", err);
      setError("Failed to load curriculum details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    // Map the units to include the required description property
    const unitsWithDescription = course.units.map(unit => ({
      ...unit,
      description: '' // Add a default empty description
    }));
    setUnits(unitsWithDescription);
    setView("units");
  };

  const handleBackClick = () => {
    if (view === "units") {
      setView("courses");
      setSelectedCourse(null);
    } else if (view === "courses") {
      setView("curricula");
      setSelectedCurriculum(null);
    }
  };

  // Title based on current view
  const getTitle = () => {
    if (view === "curricula") return "Select Curriculum";
    if (view === "courses") return `${selectedCurriculum?.name} Courses`;
    if (view === "units") return `${selectedCourse?.name} Units`;
    return "Curricula";
  };

  return (
    <Layout allowedRoles={['admin', 'teacher']}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex items-center">
              {view === "curricula" ? (
                <Link
                  href="/dashboard"
                  className="mr-4 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-500" />
                </Link>
              ) : (
                <button
                  onClick={handleBackClick}
                  className="mr-4 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-500" />
                </button>
              )}
              <h1 className="text-lg font-medium text-gray-900">
                {getTitle()}
              </h1>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white p-6">
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 text-red-700">
                {error}
                <button 
                  className="ml-3 underline"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !error && view === "curricula" && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {curricula.map((curriculum) => (
                  <div
                    key={curriculum.id}
                    className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer flex flex-col h-full"
                    onClick={() => handleCurriculumClick(curriculum)}
                  >
                    <div className="p-6 flex-grow">
                      <div className="flex items-center mb-4">
                        {curriculum.icon}
                        <h2 className="ml-3 text-xl font-semibold text-gray-900">
                          {curriculum.name}
                        </h2>
                      </div>
                      <p className="text-gray-600">
                        {curriculum.description}
                      </p>
                    </div>
                    <div className="px-6 py-3 bg-blue-50 border-t border-gray-200 mt-auto">
                      <span className="text-sm font-medium text-blue-600">
                        Click to view courses
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !error && view === "courses" && selectedCurriculum && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {courses.length === 0 ? (
                  <div className="col-span-2 text-center py-12 bg-gray-50 rounded-lg">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No courses found</h3>
                    <p className="mt-1 text-sm text-gray-500">This curriculum doesn't have any courses yet.</p>
                  </div>
                ) : (
                  courses.map((course) => (
                    <div
                      key={course.id}
                      className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer flex flex-col h-full"
                      onClick={() => handleCourseClick(course)}
                    >
                      <div className="p-6 flex-grow">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                          {course.name}
                        </h2>
                        <p className="text-gray-600">{course.description}</p>
                      </div>
                      <div className="px-6 py-3 bg-blue-50 border-t border-gray-200 mt-auto">
                        <span className="text-sm font-medium text-blue-600">
                          {course.units?.length || 0} units available
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {!isLoading && !error && view === "units" && selectedCourse && (
              <div className="space-y-4">
                {units.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Layers className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No units found</h3>
                    <p className="mt-1 text-sm text-gray-500">This course doesn't have any units yet.</p>
                  </div>
                ) : (
                  units.map((unit, index) => (
                    <Link
                      href={`/generate/questions/${selectedCurriculum?.id}/${selectedCourse.id}/${unit.id}`}
                      key={unit.id}
                      className="block border border-gray-200 rounded-lg p-4 hover:bg-blue-50 transition-colors duration-200"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {unit.name}
                          </h3>
                          {unit.description && (
                            <p className="text-sm text-gray-600 mt-1">{unit.description}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}