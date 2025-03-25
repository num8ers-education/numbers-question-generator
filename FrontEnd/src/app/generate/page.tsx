"use client";

import { useState } from "react";
import { ArrowLeft, BookOpen, Layers, GraduationCap } from "lucide-react";
import Link from "next/link";

// Sample data - replace with your actual data or API calls
const curricula = [
  {
    id: "ap",
    name: "Advanced Placement (AP)",
    description:
      "College Board's college-level courses for high school students",
    icon: <GraduationCap className="h-8 w-8 text-blue-600" />,
    courses: [
      {
        id: "ap-calc-ab",
        name: "AP Calculus AB",
        description: "Equivalent to first-semester college calculus",
        units: [
          { id: "limits", name: "Limits and Continuity" },
          { id: "derivatives", name: "Differentiation" },
          { id: "applications", name: "Applications of Derivatives" },
          { id: "integrals", name: "Integration and Accumulation of Change" },
          { id: "differential-equations", name: "Differential Equations" },
        ],
      },
      {
        id: "ap-calc-bc",
        name: "AP Calculus BC",
        description: "Equivalent to first and second-semester college calculus",
        units: [
          { id: "limits", name: "Limits and Continuity" },
          { id: "derivatives", name: "Differentiation" },
          { id: "applications", name: "Applications of Derivatives" },
          { id: "integrals", name: "Integration and Accumulation of Change" },
          { id: "differential-equations", name: "Differential Equations" },
          { id: "series", name: "Infinite Sequences and Series" },
        ],
      },
      {
        id: "ap-physics",
        name: "AP Physics",
        description: "College-level physics course",
        units: [
          { id: "kinematics", name: "Kinematics" },
          { id: "dynamics", name: "Dynamics" },
          { id: "energy", name: "Work, Energy, and Power" },
          { id: "momentum", name: "Linear Momentum" },
          { id: "rotation", name: "Rotation" },
        ],
      },
    ],
  },
  {
    id: "ib",
    name: "International Baccalaureate (IB)",
    description: "International education foundation's diploma programme",
    icon: <BookOpen className="h-8 w-8 text-blue-600" />,
    courses: [
      {
        id: "ib-math-ai-sl",
        name: "IB Mathematics: Applications and Interpretation SL",
        description:
          "For students interested in developing mathematics for describing our world",
        units: [
          { id: "number-algebra", name: "Number and Algebra" },
          { id: "functions", name: "Functions" },
          { id: "geometry-trig", name: "Geometry and Trigonometry" },
          { id: "statistics-probability", name: "Statistics and Probability" },
          { id: "calculus", name: "Calculus" },
        ],
      },
      {
        id: "ib-math-aa-hl",
        name: "IB Mathematics: Analysis and Approaches HL",
        description:
          "For students interested in mathematics, engineering, physical sciences, and some economics",
        units: [
          { id: "number-algebra", name: "Number and Algebra" },
          { id: "functions", name: "Functions" },
          { id: "geometry-trig", name: "Geometry and Trigonometry" },
          { id: "statistics-probability", name: "Statistics and Probability" },
          { id: "calculus", name: "Calculus" },
        ],
      },
    ],
  },
  {
    id: "igcse",
    name: "IGCSE",
    description: "International General Certificate of Secondary Education",
    icon: <Layers className="h-8 w-8 text-blue-600" />,
    courses: [
      {
        id: "igcse-math",
        name: "IGCSE Mathematics",
        description: "Cambridge IGCSE Mathematics course",
        units: [
          { id: "number", name: "Number" },
          { id: "algebra", name: "Algebra" },
          { id: "geometry", name: "Geometry" },
          { id: "statistics", name: "Statistics and Probability" },
        ],
      },
      {
        id: "igcse-physics",
        name: "IGCSE Physics",
        description: "Cambridge IGCSE Physics course",
        units: [
          { id: "mechanics", name: "Mechanics" },
          { id: "thermal-physics", name: "Thermal Physics" },
          { id: "waves", name: "Waves" },
          { id: "electricity-magnetism", name: "Electricity and Magnetism" },
          { id: "nuclear-physics", name: "Nuclear Physics" },
        ],
      },
    ],
  },
  {
    id: "alevel",
    name: "A Level",
    description: "UK advanced level qualification",
    icon: <GraduationCap className="h-8 w-8 text-blue-600" />,
    courses: [
      {
        id: "alevel-math",
        name: "A Level Mathematics",
        description: "A Level Mathematics course",
        units: [
          { id: "pure-math", name: "Pure Mathematics" },
          { id: "mechanics", name: "Mechanics" },
          { id: "statistics", name: "Statistics" },
        ],
      },
      {
        id: "alevel-further-math",
        name: "A Level Further Mathematics",
        description: "A Level Further Mathematics course",
        units: [
          { id: "further-pure", name: "Further Pure Mathematics" },
          { id: "further-mechanics", name: "Further Mechanics" },
          { id: "further-statistics", name: "Further Statistics" },
          { id: "decision-math", name: "Decision Mathematics" },
        ],
      },
    ],
  },
];

export default function GeneratePage() {
  const [view, setView] = useState<"curricula" | "courses" | "units">(
    "curricula"
  );
  const [selectedCurriculum, setSelectedCurriculum] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const handleCurriculumClick = (curriculum: any) => {
    setSelectedCurriculum(curriculum);
    setView("courses");
  };

  const handleCourseClick = (course: any) => {
    setSelectedCourse(course);
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
    if (view === "curricula") return "Select Curricula";
    if (view === "courses") return `${selectedCurriculum.name} Courses`;
    if (view === "units") return `${selectedCourse.name} Units`;
    return "Curricula";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center">
                {view === "curricula" ? (
                  <Link
                    href="/"
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
              {view === "curricula" && (
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
                          {curriculum.courses.length} courses available
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {view === "courses" && selectedCurriculum && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {selectedCurriculum.courses.map((course: any) => (
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
                          {course.units.length} units available
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {view === "units" && selectedCourse && (
                <div className="space-y-4">
                  {selectedCourse.units.map((unit: any, index: number) => (
                    <Link
                      href={`/generate/questions/${selectedCurriculum.id}/${selectedCourse.id}/${unit.id}`}
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
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
