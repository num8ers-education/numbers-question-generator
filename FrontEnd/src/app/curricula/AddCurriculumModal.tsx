"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  BookText,
  FileText,
  AlertCircle,
  Save,
  ChevronDown,
  ChevronRight,
  BookmarkIcon,
  GraduationCap,
  ListChecks,
} from "lucide-react";
import { curriculumAPI } from "@/services/api";
import toast from "react-hot-toast";
import { showToast } from "@/components/toast";

interface AddCurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: any) => void;
}

interface Unit {
  name: string;
}

interface Topic {
  name: string;
  units: Unit[];
  isExpanded?: boolean;
}

interface Course {
  name: string;
  topics: Topic[];
  isExpanded?: boolean;
}

interface Subject {
  name: string;
  courses: Course[];
  isExpanded?: boolean;
}

export default function AddCurriculumModal({
  isOpen,
  onClose,
  onSuccess,
}: AddCurriculumModalProps) {
  const [curriculumName, setCurriculumName] = useState("");
  const [curriculumDescription, setCurriculumDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      name: "",
      isExpanded: true,
      courses: [
        {
          name: "",
          isExpanded: true,
          topics: [
            {
              name: "",
              isExpanded: true,
              units: [{ name: "" }],
            },
          ],
        },
      ],
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!curriculumName.trim()) {
      setError("Curriculum name is required");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Prepare data for API
      const description =
        curriculumDescription.trim() ||
        `${curriculumName} curriculum for generating exam questions.`;

      const data = {
        name: curriculumName,
        description: description,
      };

      // Create the curriculum first
      const curriculumResponse = await curriculumAPI.createCurriculum(data);
      const curriculumId = curriculumResponse.id;
      console.log("Curriculum created:", curriculumResponse);

      // Now create the hierarchy (subjects -> courses -> units -> topics)
      for (const subject of subjects) {
        if (!subject.name.trim()) continue; // Skip empty subjects

        // Create subject
        const subjectData = {
          name: subject.name,
          curriculum_id: curriculumId,
        };
        const subjectResponse = await curriculumAPI.createSubject(subjectData);
        const subjectId = subjectResponse.id;
        console.log(`Subject "${subject.name}" created:`, subjectResponse);

        // Create courses for this subject
        for (const course of subject.courses) {
          if (!course.name.trim()) continue; // Skip empty courses

          // Create course
          const courseData = {
            name: course.name,
            subject_id: subjectId,
          };
          const courseResponse = await curriculumAPI.createCourse(courseData);
          const courseId = courseResponse.id;
          console.log(`Course "${course.name}" created:`, courseResponse);

          // Create units and topics for this course
          // Note: The UI has topics containing units, but the API expects units containing topics
          // We need to adapt the data structure here

          for (const topic of course.topics) {
            if (!topic.name.trim()) continue; // Skip empty topics

            // First, create a unit for this "topic" from the UI
            const unitData = {
              name: topic.name, // Use the topic name from UI as unit name for API
              course_id: courseId,
            };
            const unitResponse = await curriculumAPI.createUnit(unitData);
            const unitId = unitResponse.id;
            console.log(`Unit "${topic.name}" created:`, unitResponse);

            // Then create topics (which are "units" in the UI) for this unit
            for (const unit of topic.units) {
              if (!unit.name.trim()) continue; // Skip empty units

              // Create topic
              const topicData = {
                name: unit.name, // Use the unit name from UI as topic name for API
                unit_id: unitId,
              };
              const topicResponse = await curriculumAPI.createTopic(topicData);
              console.log(`Topic "${unit.name}" created:`, topicResponse);
            }
          }
        }
      }

      console.log("Curriculum hierarchy created successfully!");
      showToast.success("Curriculum created successfully!");

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(curriculumResponse);
      }

      // Reset form and close modal
      setCurriculumName("");
      setCurriculumDescription("");
      setSubjects([
        {
          name: "",
          isExpanded: true,
          courses: [
            {
              name: "",
              isExpanded: true,
              topics: [
                {
                  name: "",
                  isExpanded: true,
                  units: [{ name: "" }],
                },
              ],
            },
          ],
        },
      ]);
      onClose();
    } catch (err: any) {
      console.error("Error creating curriculum hierarchy:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to create curriculum. Please try again."
      );
      showToast.error("Failed to create curriculum. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addSubject = () => {
    setSubjects([
      ...subjects,
      {
        name: "",
        isExpanded: true,
        courses: [
          {
            name: "",
            isExpanded: true,
            topics: [
              {
                name: "",
                isExpanded: true,
                units: [{ name: "" }],
              },
            ],
          },
        ],
      },
    ]);
  };

  const addCourse = (subjectIndex: number) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses.push({
      name: "",
      isExpanded: true,
      topics: [
        {
          name: "",
          isExpanded: true,
          units: [{ name: "" }],
        },
      ],
    });
    setSubjects(newSubjects);
  };

  const addTopic = (subjectIndex: number, courseIndex: number) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].topics.push({
      name: "",
      isExpanded: true,
      units: [{ name: "" }],
    });
    setSubjects(newSubjects);
  };

  const addUnit = (
    subjectIndex: number,
    courseIndex: number,
    topicIndex: number
  ) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].topics[
      topicIndex
    ].units.push({
      name: "",
    });
    setSubjects(newSubjects);
  };

  const removeSubject = (subjectIndex: number) => {
    const newSubjects = [...subjects];
    newSubjects.splice(subjectIndex, 1);
    setSubjects(newSubjects);
  };

  const removeCourse = (subjectIndex: number, courseIndex: number) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses.splice(courseIndex, 1);
    setSubjects(newSubjects);
  };

  const removeTopic = (
    subjectIndex: number,
    courseIndex: number,
    topicIndex: number
  ) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].topics.splice(topicIndex, 1);
    setSubjects(newSubjects);
  };

  const removeUnit = (
    subjectIndex: number,
    courseIndex: number,
    topicIndex: number,
    unitIndex: number
  ) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].topics[
      topicIndex
    ].units.splice(unitIndex, 1);
    setSubjects(newSubjects);
  };

  const updateSubjectName = (subjectIndex: number, name: string) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].name = name;
    setSubjects(newSubjects);
  };

  const updateCourseName = (
    subjectIndex: number,
    courseIndex: number,
    name: string
  ) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].name = name;
    setSubjects(newSubjects);
  };

  const updateTopicName = (
    subjectIndex: number,
    courseIndex: number,
    topicIndex: number,
    name: string
  ) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].topics[topicIndex].name =
      name;
    setSubjects(newSubjects);
  };

  const updateUnitName = (
    subjectIndex: number,
    courseIndex: number,
    topicIndex: number,
    unitIndex: number,
    name: string
  ) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].topics[topicIndex].units[
      unitIndex
    ].name = name;
    setSubjects(newSubjects);
  };

  const toggleSubjectExpanded = (subjectIndex: number) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].isExpanded = !newSubjects[subjectIndex].isExpanded;
    setSubjects(newSubjects);
  };

  const toggleCourseExpanded = (subjectIndex: number, courseIndex: number) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].isExpanded = 
      !newSubjects[subjectIndex].courses[courseIndex].isExpanded;
    setSubjects(newSubjects);
  };

  const toggleTopicExpanded = (
    subjectIndex: number,
    courseIndex: number,
    topicIndex: number
  ) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].topics[topicIndex].isExpanded = 
      !newSubjects[subjectIndex].courses[courseIndex].topics[topicIndex].isExpanded;
    setSubjects(newSubjects);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="bg-blue-50 p-3 rounded-xl mr-4">
              <BookOpen size={22} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Add New Curriculum
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all duration-200">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start">
              <AlertCircle size={20} className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Basic Info Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              
              <div className="mb-4">
                <label
                  htmlFor="curriculum-name"
                  className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Layers size={16} className="mr-2 text-gray-500" />
                  Curriculum Name
                </label>
                <input
                  type="text"
                  id="curriculum-name"
                  value={curriculumName}
                  onChange={(e) => setCurriculumName(e.target.value)}
                  placeholder="e.g., Advanced Placement (AP)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="curriculum-description"
                  className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="mr-2 text-gray-500" />
                  Curriculum Description
                </label>
                <textarea
                  id="curriculum-description"
                  value={curriculumDescription}
                  onChange={(e) => setCurriculumDescription(e.target.value)}
                  placeholder="Describe this curriculum..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 min-h-[120px] resize-none"
                />
              </div>
            </div>

            {/* Content Structure Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Content Structure</h3>
                <button
                  type="button"
                  onClick={addSubject}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium transition-colors duration-200">
                  <Plus size={16} />
                  <span>Add Subject</span>
                </button>
              </div>

              {/* Collapsible Structure for Subjects, Courses, Topics, Units */}
              <div className="space-y-6">
                {subjects.map((subject, subjectIndex) => (
                  <div
                    key={subjectIndex}
                    className="border border-blue-200 rounded-lg overflow-hidden shadow-sm">
                    {/* Subject Header */}
                    <div 
                      className="bg-blue-50 p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSubjectExpanded(subjectIndex)}
                    >
                      <div className="flex items-center">
                        <BookmarkIcon size={18} className="text-blue-600 mr-3" />
                        <h4 className="font-medium text-blue-800">
                          Subject {subjectIndex + 1}
                          {subject.name && `: ${subject.name}`}
                        </h4>
                      </div>
                      <div className="flex items-center">
                        {subjects.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSubject(subjectIndex);
                            }}
                            className="mr-2 text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        )}
                        {subject.isExpanded ? (
                          <ChevronDown size={20} className="text-blue-600" />
                        ) : (
                          <ChevronRight size={20} className="text-blue-600" />
                        )}
                      </div>
                    </div>

                    {/* Subject Content */}
                    {subject.isExpanded && (
                      <div className="p-4 bg-white">
                        <div className="mb-4">
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Subject Name
                          </label>
                          <input
                            type="text"
                            value={subject.name}
                            onChange={(e) => updateSubjectName(subjectIndex, e.target.value)}
                            placeholder="Subject Name (e.g., Mathematics)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Courses */}
                        <div className="ml-2 mt-6 space-y-4">
                          {subject.courses.map((course, courseIndex) => (
                            <div 
                              key={courseIndex}
                              className="border border-purple-200 rounded-lg overflow-hidden"
                            >
                              {/* Course Header */}
                              <div 
                                className="bg-purple-50 p-3 flex items-center justify-between cursor-pointer"
                                onClick={() => toggleCourseExpanded(subjectIndex, courseIndex)}
                              >
                                <div className="flex items-center">
                                  <GraduationCap size={16} className="text-purple-600 mr-2" />
                                  <h5 className="font-medium text-purple-800">
                                    Course {courseIndex + 1}
                                    {course.name && `: ${course.name}`}
                                  </h5>
                                </div>
                                <div className="flex items-center">
                                  {courseIndex === subject.courses.length - 1 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addCourse(subjectIndex);
                                      }}
                                      className="mr-2 flex items-center gap-1 px-3 py-1 text-sm rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 transition-colors">
                                      <Plus size={14} />
                                      <span>Add Course</span>
                                    </button>
                                  )}
                                  {subject.courses.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeCourse(subjectIndex, courseIndex);
                                      }}
                                      className="mr-2 text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors">
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                  {course.isExpanded ? (
                                    <ChevronDown size={18} className="text-purple-600" />
                                  ) : (
                                    <ChevronRight size={18} className="text-purple-600" />
                                  )}
                                </div>
                              </div>

                              {/* Course Content */}
                              {course.isExpanded && (
                                <div className="p-3 bg-white">
                                  <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                      Course Name
                                    </label>
                                    <input
                                      type="text"
                                      value={course.name}
                                      onChange={(e) => updateCourseName(subjectIndex, courseIndex, e.target.value)}
                                      placeholder="Course Name (e.g., Calculus AB)"
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>

                                  {/* Topics */}
                                  <div className="ml-2 mt-4 space-y-3">
                                    {course.topics.map((topic, topicIndex) => (
                                      <div 
                                        key={topicIndex}
                                        className="border border-teal-200 rounded-lg overflow-hidden"
                                      >
                                        {/* Topic Header */}
                                        <div 
                                          className="bg-teal-50 p-3 flex items-center justify-between cursor-pointer"
                                          onClick={() => toggleTopicExpanded(subjectIndex, courseIndex, topicIndex)}
                                        >
                                          <div className="flex items-center">
                                            <BookText size={16} className="text-teal-600 mr-2" />
                                            <h6 className="font-medium text-teal-800">
                                              Topic {topicIndex + 1}
                                              {topic.name && `: ${topic.name}`}
                                            </h6>
                                          </div>
                                          <div className="flex items-center">
                                            {topicIndex === course.topics.length - 1 && (
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  addTopic(subjectIndex, courseIndex);
                                                }}
                                                className="mr-2 flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-700 transition-colors">
                                                <Plus size={12} />
                                                <span>Add Topic</span>
                                              </button>
                                            )}
                                            {course.topics.length > 1 && (
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  removeTopic(subjectIndex, courseIndex, topicIndex);
                                                }}
                                                className="mr-2 text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={14} />
                                              </button>
                                            )}
                                            {topic.isExpanded ? (
                                              <ChevronDown size={16} className="text-teal-600" />
                                            ) : (
                                              <ChevronRight size={16} className="text-teal-600" />
                                            )}
                                          </div>
                                        </div>

                                        {/* Topic Content */}
                                        {topic.isExpanded && (
                                          <div className="p-3 bg-white">
                                            <div className="mb-3">
                                              <label className="text-sm font-medium text-gray-700 mb-1 block">
                                                Topic Name
                                              </label>
                                              <input
                                                type="text"
                                                value={topic.name}
                                                onChange={(e) => updateTopicName(subjectIndex, courseIndex, topicIndex, e.target.value)}
                                                placeholder="Topic Name (e.g., Limits and Continuity)"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                              />
                                            </div>

                                            {/* Units */}
                                            <div className="ml-2 mt-3 space-y-2">
                                              <div className="flex justify-between items-center mb-2">
                                                <h6 className="text-sm font-medium text-amber-800 flex items-center">
                                                  <ListChecks size={14} className="text-amber-600 mr-2" />
                                                  Units
                                                </h6>
                                                <button
                                                  type="button"
                                                  onClick={() => addUnit(subjectIndex, courseIndex, topicIndex)}
                                                  className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors">
                                                  <Plus size={10} />
                                                  <span>Add Unit</span>
                                                </button>
                                              </div>
                                              
                                              {topic.units.map((unit, unitIndex) => (
                                                <div 
                                                  key={unitIndex}
                                                  className="border border-amber-200 rounded-lg overflow-hidden mb-2"
                                                >
                                                  <div className="bg-amber-50 p-2 flex justify-between items-center">
                                                    <span className="text-sm font-medium text-amber-800">
                                                      Unit {unitIndex + 1}
                                                    </span>
                                                    {topic.units.length > 1 && (
                                                      <button
                                                        type="button"
                                                        onClick={() => removeUnit(subjectIndex, courseIndex, topicIndex, unitIndex)}
                                                        className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={12} />
                                                      </button>
                                                    )}
                                                  </div>
                                                  <div className="p-2 bg-white">
                                                    <input
                                                      type="text"
                                                      value={unit.name}
                                                      onChange={(e) => updateUnitName(subjectIndex, courseIndex, topicIndex, unitIndex, e.target.value)}
                                                      placeholder="Unit Name (e.g., Introduction to Limits)"
                                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-gray-600 text-sm bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
              <p className="mb-2 font-medium text-blue-700">Note:</p>
              <p>
                All items with empty names will be ignored when saving. Make sure to fill in 
                the names for all the content you want to include in your curriculum.
              </p>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
            disabled={isLoading}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2">
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Curriculum
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}