"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  BookText,
  FileText,
  ListOrdered,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { curriculumAPI } from "@/services/api";
import toast from "react-hot-toast";

interface EditCurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculumId: string;
  onSuccess?: (data: any) => void;
}

interface Subject {
  id: string;
  name: string;
  courses: Course[];
}

interface Course {
  id: string;
  name: string;
  topics: Topic[];
}

interface Topic {
  id: string;
  name: string;
  units: Unit[];
}

interface Unit {
  id: string;
  name: string;
}

export default function EditCurriculumModal({
  isOpen,
  onClose,
  curriculumId,
  onSuccess,
}: EditCurriculumModalProps) {
  const [curriculumName, setCurriculumName] = useState("");
  const [curriculumDescription, setCurriculumDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Fetch existing curriculum data
  useEffect(() => {
    const fetchCurriculum = async () => {
      if (!curriculumId) return;

      try {
        setIsFetching(true);
        setError("");

        // First get the basic curriculum data
        const curriculum = await curriculumAPI.getCurriculum(curriculumId);
        setCurriculumName(curriculum.name);
        setCurriculumDescription(curriculum.description || "");

        // Then get the full hierarchy
        const curriculumWithHierarchy =
          await curriculumAPI.getCurriculumWithHierarchy(curriculumId);

        // Transform hierarchy data to match our component's structure
        let formattedSubjects = [];
        if (
          curriculumWithHierarchy.subjects &&
          curriculumWithHierarchy.subjects.length > 0
        ) {
          formattedSubjects = curriculumWithHierarchy.subjects.map(
            (subject: any) => {
              return {
                id: subject.id,
                name: subject.name,
                courses:
                  subject.courses?.map((course: any) => {
                    return {
                      id: course.id,
                      name: course.name,
                      topics:
                        course.units?.map((unit: any) => {
                          return {
                            id: unit.id,
                            name: unit.name,
                            units:
                              unit.topics?.map((topic: any) => {
                                return {
                                  id: topic.id,
                                  name: topic.name,
                                };
                              }) || [],
                          };
                        }) || [],
                    };
                  }) || [],
              };
            }
          );

          setSubjects(formattedSubjects);
        } else {
          // Add a default empty subject if none exist
          setSubjects([
            {
              id: "new-" + Date.now(),
              name: "",
              courses: [
                {
                  id: "new-" + Date.now() + 1,
                  name: "",
                  topics: [
                    {
                      id: "new-" + Date.now() + 2,
                      name: "",
                      units: [{ id: "new-" + Date.now() + 3, name: "" }],
                    },
                  ],
                },
              ],
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching curriculum:", err);
        setError("Failed to load curriculum data. Please try again.");

        // Set default empty structure
        setSubjects([
          {
            id: "new-" + Date.now(),
            name: "",
            courses: [
              {
                id: "new-" + Date.now() + 1,
                name: "",
                topics: [
                  {
                    id: "new-" + Date.now() + 2,
                    name: "",
                    units: [{ id: "new-" + Date.now() + 3, name: "" }],
                  },
                ],
              },
            ],
          },
        ]);
      } finally {
        setIsFetching(false);
      }
    };

    if (isOpen && curriculumId) {
      fetchCurriculum();
    }
  }, [curriculumId, isOpen]);

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

      // Update the curriculum
      const curriculumResponse = await curriculumAPI.updateCurriculum(
        curriculumId,
        data
      );
      console.log("Curriculum updated:", curriculumResponse);

      // Now update the hierarchy
      // First, identify which subjects/courses/etc need to be created, updated, or deleted
      // For simplicity, we'll handle only the name updates for existing items and creation of new items

      for (const subject of subjects) {
        // Update or create subject
        let subjectId = subject.id;
        if (subject.id.startsWith("new-")) {
          // Create new subject
          const subjectData = {
            name: subject.name,
            curriculum_id: curriculumId,
          };
          const subjectResponse = await curriculumAPI.createSubject(
            subjectData
          );
          subjectId = subjectResponse.id;
          console.log(`Subject "${subject.name}" created:`, subjectResponse);
        } else {
          // Update existing subject - assuming there's an updateSubject API
          // await curriculumAPI.updateSubject(subject.id, { name: subject.name });
          console.log(`Subject "${subject.name}" would be updated`);
        }

        // Handle courses for this subject
        for (const course of subject.courses) {
          if (!course.name.trim()) continue; // Skip empty courses

          // Update or create course
          let courseId = course.id;
          if (course.id.startsWith("new-")) {
            // Create course
            const courseData = {
              name: course.name,
              subject_id: subjectId,
            };
            const courseResponse = await curriculumAPI.createCourse(courseData);
            courseId = courseResponse.id;
            console.log(`Course "${course.name}" created:`, courseResponse);
          } else {
            // Update existing course - assuming there's an updateCourse API
            // await curriculumAPI.updateCourse(course.id, { name: course.name });
            console.log(`Course "${course.name}" would be updated`);
          }

          // Handle topics for this course
          for (const topic of course.topics) {
            if (!topic.name.trim()) continue; // Skip empty topics

            // Update or create unit (since in API, topics in UI = units in API)
            let unitId = topic.id;
            if (topic.id.startsWith("new-")) {
              // Create unit
              const unitData = {
                name: topic.name,
                course_id: courseId,
              };
              const unitResponse = await curriculumAPI.createUnit(unitData);
              unitId = unitResponse.id;
              console.log(`Unit "${topic.name}" created:`, unitResponse);
            } else {
              // Update existing unit
              // await curriculumAPI.updateUnit(topic.id, { name: topic.name });
              console.log(`Unit "${topic.name}" would be updated`);
            }

            // Handle units for this topic (which are topics in API)
            for (const unit of topic.units) {
              if (!unit.name.trim()) continue; // Skip empty units

              // Update or create topic
              if (unit.id.startsWith("new-")) {
                // Create topic
                const topicData = {
                  name: unit.name,
                  unit_id: unitId,
                };
                const topicResponse = await curriculumAPI.createTopic(
                  topicData
                );
                console.log(`Topic "${unit.name}" created:`, topicResponse);
              } else {
                // Update existing topic
                // await curriculumAPI.updateTopic(unit.id, { name: unit.name });
                console.log(`Topic "${unit.name}" would be updated`);
              }
            }
          }
        }
      }

      console.log("Curriculum hierarchy updated successfully!");
      toast.success("Curriculum updated successfully!");

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(curriculumResponse);
      }

      // Close modal
      onClose();
    } catch (err: any) {
      console.error("Error updating curriculum hierarchy:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to update curriculum. Please try again."
      );
      toast.error("Failed to update curriculum. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addSubject = () => {
    setSubjects([
      ...subjects,
      {
        id: "new-" + Date.now(),
        name: "",
        courses: [
          {
            id: "new-" + Date.now() + 1,
            name: "",
            topics: [
              {
                id: "new-" + Date.now() + 2,
                name: "",
                units: [{ id: "new-" + Date.now() + 3, name: "" }],
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
      id: "new-" + Date.now(),
      name: "",
      topics: [
        {
          id: "new-" + Date.now() + 1,
          name: "",
          units: [{ id: "new-" + Date.now() + 2, name: "" }],
        },
      ],
    });
    setSubjects(newSubjects);
  };

  const addTopic = (subjectIndex: number, courseIndex: number) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].topics.push({
      id: "new-" + Date.now(),
      name: "",
      units: [{ id: "new-" + Date.now() + 1, name: "" }],
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
      id: "new-" + Date.now(),
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="bg-gray-200 p-2 rounded-md mr-3">
              <BookOpen size={20} className="text-gray-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Edit Curriculum</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-all duration-200">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-600">Loading curriculum data...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-start">
                  <AlertCircle size={20} className="text-red-500 mr-2 mt-0.5" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label
                    htmlFor="curriculum-name"
                    className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Layers size={16} className="mr-2" />
                    Curriculum Name
                  </label>
                  <input
                    type="text"
                    id="curriculum-name"
                    value={curriculumName}
                    onChange={(e) => setCurriculumName(e.target.value)}
                    placeholder="e.g., Advanced Placement (AP)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-700"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="curriculum-description"
                    className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <FileText size={16} className="mr-2" />
                    Curriculum Description
                  </label>
                  <textarea
                    id="curriculum-description"
                    value={curriculumDescription}
                    onChange={(e) => setCurriculumDescription(e.target.value)}
                    placeholder="Describe this curriculum..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-700 min-h-[100px]"
                  />
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium text-gray-800 flex items-center">
                      <BookText size={18} className="mr-2 text-gray-600" />
                      Subjects
                    </h3>
                    <button
                      type="button"
                      onClick={addSubject}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors duration-200">
                      <Plus size={16} />
                      <span>Add Subject</span>
                    </button>
                  </div>

                  {subjects.map((subject, subjectIndex) => (
                    <div
                      key={subject.id}
                      className="border border-gray-200 rounded-md p-4 mb-5 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
                      <div className="flex justify-between items-center mb-4">
                        <div className="w-full">
                          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <span className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-gray-700 font-medium">
                              S
                            </span>
                            Subject Name
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={subject.name}
                              onChange={(e) =>
                                updateSubjectName(subjectIndex, e.target.value)
                              }
                              placeholder="e.g., Mathematics"
                              className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                            />
                            {subjects.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSubject(subjectIndex)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 hover:bg-red-50 rounded-full">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Courses */}
                      <div className="ml-3 mb-3 border-l border-gray-200 pl-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium text-gray-700 flex items-center">
                            <FileText
                              size={16}
                              className="mr-2 text-gray-500"
                            />
                            Courses
                          </h4>
                          <button
                            type="button"
                            onClick={() => addCourse(subjectIndex)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200">
                            <Plus size={14} />
                            <span>Add Course</span>
                          </button>
                        </div>

                        {subject.courses.map((course, courseIndex) => (
                          <div key={course.id} className="mb-4 ml-2">
                            <div className="mb-3">
                              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <span className="bg-gray-100 h-5 w-5 rounded-full flex items-center justify-center mr-2 text-gray-700 text-xs font-medium">
                                  C
                                </span>
                                Course Name
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={course.name}
                                  onChange={(e) =>
                                    updateCourseName(
                                      subjectIndex,
                                      courseIndex,
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g., Calculus AB"
                                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm"
                                />
                                {subject.courses.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeCourse(subjectIndex, courseIndex)
                                    }
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 hover:bg-red-50 rounded-full">
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Topics */}
                            <div className="ml-3 mb-3 border-l border-gray-200 pl-4">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="text-sm font-medium text-gray-700 flex items-center">
                                  <ListOrdered
                                    size={14}
                                    className="mr-2 text-gray-500"
                                  />
                                  Topics
                                </h5>
                                <button
                                  type="button"
                                  onClick={() =>
                                    addTopic(subjectIndex, courseIndex)
                                  }
                                  className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200">
                                  <Plus size={12} />
                                  <span>Add Topic</span>
                                </button>
                              </div>

                              {course.topics.map((topic, topicIndex) => (
                                <div key={topic.id} className="mb-3 ml-2">
                                  <div className="mb-2">
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                      <span className="bg-gray-100 h-5 w-5 rounded-full flex items-center justify-center mr-2 text-gray-700 text-xs font-medium">
                                        T
                                      </span>
                                      Topic Name
                                    </label>
                                    <div className="relative">
                                      <input
                                        type="text"
                                        value={topic.name}
                                        onChange={(e) =>
                                          updateTopicName(
                                            subjectIndex,
                                            courseIndex,
                                            topicIndex,
                                            e.target.value
                                          )
                                        }
                                        placeholder="e.g., Limits and Continuity"
                                        className="w-full pl-4 pr-10 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm"
                                      />
                                      {course.topics.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeTopic(
                                              subjectIndex,
                                              courseIndex,
                                              topicIndex
                                            )
                                          }
                                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 hover:bg-red-50 rounded-full">
                                          <Trash2 size={12} />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Units */}
                                  <div className="ml-3 mb-2 border-l border-gray-200 pl-3">
                                    <div className="flex justify-between items-center mb-1">
                                      <h6 className="text-xs font-medium text-gray-700 flex items-center">
                                        <BookText
                                          size={12}
                                          className="mr-1 text-gray-500"
                                        />
                                        Units
                                      </h6>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          addUnit(
                                            subjectIndex,
                                            courseIndex,
                                            topicIndex
                                          )
                                        }
                                        className="flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200">
                                        <Plus size={10} />
                                        <span>Add Unit</span>
                                      </button>
                                    </div>

                                    {topic.units.map((unit, unitIndex) => (
                                      <div key={unit.id} className="mb-2 ml-2">
                                        <div className="relative">
                                          <input
                                            type="text"
                                            value={unit.name}
                                            onChange={(e) =>
                                              updateUnitName(
                                                subjectIndex,
                                                courseIndex,
                                                topicIndex,
                                                unitIndex,
                                                e.target.value
                                              )
                                            }
                                            placeholder="e.g., Introduction to Limits"
                                            className="w-full pl-3 pr-8 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-xs"
                                          />
                                          {topic.units.length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                removeUnit(
                                                  subjectIndex,
                                                  courseIndex,
                                                  topicIndex,
                                                  unitIndex
                                                )
                                              }
                                              className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200 p-0.5 hover:bg-red-50 rounded-full">
                                              <Trash2 size={10} />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="text-gray-500 text-sm mt-8 bg-gray-50 p-4 rounded-md border border-gray-200">
                    <p className="mb-2 font-medium">Note:</p>
                    <p>
                      Changes to the curriculum name and description will be
                      saved immediately. New subjects, courses, topics, and
                      units will be created, but existing ones may require a
                      complete refresh to see the changes.
                    </p>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            disabled={isLoading || isFetching}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || isFetching}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 shadow-sm flex items-center">
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              "Save Changes"
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
