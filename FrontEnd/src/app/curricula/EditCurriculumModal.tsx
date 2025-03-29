"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  FileText,
  AlertCircle,
  Loader2,
  Save,
  ChevronDown,
  ChevronRight,
  BookmarkIcon,
  GraduationCap,
  BookText,
  ListChecks,
} from "lucide-react";
import { curriculumAPI } from "@/services/api";
import toast from "react-hot-toast";

interface EditCurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculumId: string;
  onSuccess?: (data: any) => void;
}

// Note: The data structure in the UI will be modified to match the requested hierarchy
// curriculum > subject > course > unit > topic
// However, the API calls still need to maintain the original structure
interface Subject {
  id: string;
  name: string;
  courses: Course[];
  isExpanded?: boolean;
}

interface Course {
  id: string;
  name: string;
  units: Unit[]; // This was "topics" before
  isExpanded?: boolean;
}

interface Unit {
  id: string;
  name: string;
  topics: Topic[]; // This was "units" before
  isExpanded?: boolean;
}

interface Topic {
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
  const [originalSubjects, setOriginalSubjects] = useState<Subject[]>([]);
  const [itemsToDelete, setItemsToDelete] = useState<{
    subjects: string[];
    courses: string[];
    units: string[];
    topics: string[];
  }>({
    subjects: [],
    courses: [],
    units: [],
    topics: [],
  });

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
        // Note: Adapting the API data structure to our new UI structure (curriculum > subject > course > unit > topic)
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
                isExpanded: true,
                courses:
                  subject.courses?.map((course: any) => {
                    return {
                      id: course.id,
                      name: course.name,
                      isExpanded: true,
                      units:
                        course.units?.map((unit: any) => {
                          return {
                            id: unit.id,
                            name: unit.name,
                            isExpanded: true,
                            topics:
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
          // Keep a copy of the original data for comparison
          setOriginalSubjects(JSON.parse(JSON.stringify(formattedSubjects)));
        } else {
          // Add a default empty subject if none exist
          setSubjects([
            {
              id: "new-" + Date.now(),
              name: "",
              isExpanded: true,
              courses: [
                {
                  id: "new-" + Date.now() + 1,
                  name: "",
                  isExpanded: true,
                  units: [
                    {
                      id: "new-" + Date.now() + 2,
                      name: "",
                      isExpanded: true,
                      topics: [{ id: "new-" + Date.now() + 3, name: "" }],
                    },
                  ],
                },
              ],
            },
          ]);
          setOriginalSubjects([]);
        }
      } catch (err) {
        console.error("Error fetching curriculum:", err);
        setError("Failed to load curriculum data. Please try again.");

        // Set default empty structure
        setSubjects([
          {
            id: "new-" + Date.now(),
            name: "",
            isExpanded: true,
            courses: [
              {
                id: "new-" + Date.now() + 1,
                name: "",
                isExpanded: true,
                units: [
                  {
                    id: "new-" + Date.now() + 2,
                    name: "",
                    isExpanded: true,
                    topics: [{ id: "new-" + Date.now() + 3, name: "" }],
                  },
                ],
              },
            ],
          },
        ]);
        setOriginalSubjects([]);
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

      // Process deletions first
      await handleDeletions();

      // Now handle updates for existing items and creation of new items
      await processHierarchyChanges();

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

  const handleDeletions = async () => {
    // Handle deletions in reverse hierarchical order: topics -> units -> courses -> subjects
    for (const topicId of itemsToDelete.topics) {
      if (!topicId.startsWith("new-")) {
        try {
          await curriculumAPI.deleteTopic(topicId);
          console.log(`Topic ${topicId} deleted`);
        } catch (err) {
          console.error(`Error deleting topic ${topicId}:`, err);
        }
      }
    }

    for (const unitId of itemsToDelete.units) {
      if (!unitId.startsWith("new-")) {
        try {
          await curriculumAPI.deleteUnit(unitId);
          console.log(`Unit ${unitId} deleted`);
        } catch (err) {
          console.error(`Error deleting unit ${unitId}:`, err);
        }
      }
    }

    for (const courseId of itemsToDelete.courses) {
      if (!courseId.startsWith("new-")) {
        try {
          await curriculumAPI.deleteCourse(courseId);
          console.log(`Course ${courseId} deleted`);
        } catch (err) {
          console.error(`Error deleting course ${courseId}:`, err);
        }
      }
    }

    for (const subjectId of itemsToDelete.subjects) {
      if (!subjectId.startsWith("new-")) {
        try {
          await curriculumAPI.deleteSubject(subjectId);
          console.log(`Subject ${subjectId} deleted`);
        } catch (err) {
          console.error(`Error deleting subject ${subjectId}:`, err);
        }
      }
    }
  };

  const processHierarchyChanges = async () => {
    for (const subject of subjects) {
      // Check if this is a new or existing subject
      let subjectId = subject.id;

      if (subject.id.startsWith("new-")) {
        // Create new subject
        if (subject.name.trim()) {
          const subjectData = {
            name: subject.name,
            curriculum_id: curriculumId,
          };

          try {
            const subjectResponse = await curriculumAPI.createSubject(
              subjectData
            );
            subjectId = subjectResponse.id;
            console.log(`Subject "${subject.name}" created:`, subjectResponse);
          } catch (err) {
            console.error(`Error creating subject "${subject.name}":`, err);
            continue; // Skip to next subject
          }
        } else {
          continue; // Skip empty subjects
        }
      } else {
        // Update existing subject
        const originalSubject = originalSubjects.find(
          (s) => s.id === subject.id
        );

        if (originalSubject && originalSubject.name !== subject.name) {
          try {
            await curriculumAPI.updateSubject(subject.id, {
              name: subject.name,
              curriculum_id: curriculumId, // if your API needs it
            });
            console.log(`Subject "${subject.name}" updated`);
          } catch (err) {
            console.error(`Error updating subject "${subject.name}":`, err);
          }
        }
      }

      // Process courses for this subject
      if (subject.courses && subject.courses.length > 0) {
        for (const course of subject.courses) {
          // Check if this is a new or existing course
          let courseId = course.id;

          if (course.id.startsWith("new-")) {
            // Create new course
            if (course.name.trim()) {
              const courseData = {
                name: course.name,
                subject_id: subjectId,
              };

              try {
                const courseResponse = await curriculumAPI.createCourse(
                  courseData
                );
                courseId = courseResponse.id;
                console.log(`Course "${course.name}" created:`, courseResponse);
              } catch (err) {
                console.error(`Error creating course "${course.name}":`, err);
                continue; // Skip to next course
              }
            } else {
              continue; // Skip empty courses
            }
          } else {
            // Update existing course
            const originalSubject = originalSubjects.find(
              (s) => s.id === subject.id
            );
            const originalCourse = originalSubject?.courses.find(
              (c) => c.id === course.id
            );

            if (originalCourse && originalCourse.name !== course.name) {
              try {
                await curriculumAPI.updateCourse(course.id, {
                  name: course.name,
                });
                console.log(`Course "${course.name}" updated`);
              } catch (err) {
                console.error(`Error updating course "${course.name}":`, err);
              }
            }
          }

          // Process units for this course
          if (course.units && course.units.length > 0) {
            for (const unit of course.units) {
              // Check if this is a new or existing unit
              let unitId = unit.id;

              if (unit.id.startsWith("new-")) {
                // Create new unit
                if (unit.name.trim()) {
                  const unitData = {
                    name: unit.name,
                    course_id: courseId,
                  };

                  try {
                    const unitResponse = await curriculumAPI.createUnit(
                      unitData
                    );
                    unitId = unitResponse.id;
                    console.log(`Unit "${unit.name}" created:`, unitResponse);
                  } catch (err) {
                    console.error(`Error creating unit "${unit.name}":`, err);
                    continue; // Skip to next unit
                  }
                } else {
                  continue; // Skip empty units
                }
              } else {
                // Update existing unit
                const originalSubject = originalSubjects.find(
                  (s) => s.id === subject.id
                );
                const originalCourse = originalSubject?.courses.find(
                  (c) => c.id === course.id
                );
                const originalUnit = originalCourse?.units.find(
                  (u) => u.id === unit.id
                );

                if (originalUnit && originalUnit.name !== unit.name) {
                  try {
                    await curriculumAPI.updateUnit(unit.id, {
                      name: unit.name,
                    });
                    console.log(`Unit "${unit.name}" updated`);
                  } catch (err) {
                    console.error(`Error updating unit "${unit.name}":`, err);
                  }
                }
              }

              // Process topics for this unit
              if (unit.topics && unit.topics.length > 0) {
                for (const topic of unit.topics) {
                  if (topic.id.startsWith("new-")) {
                    // Create new topic
                    if (topic.name.trim()) {
                      const topicData = {
                        name: topic.name,
                        unit_id: unitId,
                      };

                      try {
                        const topicResponse = await curriculumAPI.createTopic(
                          topicData
                        );
                        console.log(
                          `Topic "${topic.name}" created:`,
                          topicResponse
                        );
                      } catch (err) {
                        console.error(
                          `Error creating topic "${topic.name}":`,
                          err
                        );
                      }
                    }
                  } else {
                    // Update existing topic
                    const originalSubject = originalSubjects.find(
                      (s) => s.id === subject.id
                    );
                    const originalCourse = originalSubject?.courses.find(
                      (c) => c.id === course.id
                    );
                    const originalUnit = originalCourse?.units.find(
                      (u) => u.id === unit.id
                    );
                    const originalTopic = originalUnit?.topics.find(
                      (t) => t.id === topic.id
                    );

                    if (originalTopic && originalTopic.name !== topic.name) {
                      try {
                        await curriculumAPI.updateTopic(topic.id, {
                          name: topic.name,
                        });
                        console.log(`Topic "${topic.name}" updated`);
                      } catch (err) {
                        console.error(
                          `Error updating topic "${topic.name}":`,
                          err
                        );
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  const addSubject = () => {
    setSubjects([
      ...subjects,
      {
        id: "new-" + Date.now(),
        name: "",
        isExpanded: true,
        courses: [
          {
            id: "new-" + Date.now() + 1,
            name: "",
            isExpanded: true,
            units: [
              {
                id: "new-" + Date.now() + 2,
                name: "",
                isExpanded: true,
                topics: [{ id: "new-" + Date.now() + 3, name: "" }],
              },
            ],
          },
        ],
      },
    ]);
  };

  const removeSubject = (subjectIndex: number) => {
    const subjectToRemove = subjects[subjectIndex];
    const newSubjects = [...subjects];
    newSubjects.splice(subjectIndex, 1);
    setSubjects(newSubjects);

    if (!subjectToRemove.id.startsWith("new-")) {
      setItemsToDelete((prev) => ({
        ...prev,
        subjects: [...prev.subjects, subjectToRemove.id],
      }));

      // Also add all child items to deletion lists
      const coursesToDelete = subjectToRemove.courses
        .filter((course) => !course.id.startsWith("new-"))
        .map((course) => course.id);

      const unitsToDelete = subjectToRemove.courses.flatMap((course) =>
        course.units
          .filter((unit) => !unit.id.startsWith("new-"))
          .map((unit) => unit.id)
      );

      const topicsToDelete = subjectToRemove.courses.flatMap((course) =>
        course.units.flatMap((unit) =>
          unit.topics.filter((t) => !t.id.startsWith("new-")).map((t) => t.id)
        )
      );

      setItemsToDelete((prev) => ({
        ...prev,
        courses: [...prev.courses, ...coursesToDelete],
        units: [...prev.units, ...unitsToDelete],
        topics: [...prev.topics, ...topicsToDelete],
      }));
    }
  };

  const addCourse = (subjectIndex: number) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses.push({
      id: "new-" + Date.now(),
      name: "",
      isExpanded: true,
      units: [
        {
          id: "new-" + Date.now() + 1,
          name: "",
          isExpanded: true,
          topics: [{ id: "new-" + Date.now() + 2, name: "" }],
        },
      ],
    });
    setSubjects(newSubjects);
  };

  const removeCourse = (subjectIndex: number, courseIndex: number) => {
    const courseToRemove = subjects[subjectIndex].courses[courseIndex];
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses.splice(courseIndex, 1);
    setSubjects(newSubjects);

    if (!courseToRemove.id.startsWith("new-")) {
      setItemsToDelete((prev) => ({
        ...prev,
        courses: [...prev.courses, courseToRemove.id],
      }));

      const unitsToDelete = courseToRemove.units
        .filter((unit) => !unit.id.startsWith("new-"))
        .map((unit) => unit.id);

      const topicsToDelete = courseToRemove.units.flatMap((unit) =>
        unit.topics.filter((t) => !t.id.startsWith("new-")).map((t) => t.id)
      );

      setItemsToDelete((prev) => ({
        ...prev,
        units: [...prev.units, ...unitsToDelete],
        topics: [...prev.topics, ...topicsToDelete],
      }));
    }
  };

  const addUnit = (subjectIndex: number, courseIndex: number) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].units.push({
      id: "new-" + Date.now(),
      name: "",
      isExpanded: true,
      topics: [{ id: "new-" + Date.now() + 1, name: "" }],
    });
    setSubjects(newSubjects);
  };

  const removeUnit = (
    subjectIndex: number,
    courseIndex: number,
    unitIndex: number
  ) => {
    const unitToRemove =
      subjects[subjectIndex].courses[courseIndex].units[unitIndex];
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].units.splice(unitIndex, 1);
    setSubjects(newSubjects);

    if (!unitToRemove.id.startsWith("new-")) {
      setItemsToDelete((prev) => ({
        ...prev,
        units: [...prev.units, unitToRemove.id],
      }));

      const topicsToDelete = unitToRemove.topics
        .filter((t) => !t.id.startsWith("new-"))
        .map((t) => t.id);

      setItemsToDelete((prev) => ({
        ...prev,
        topics: [...prev.topics, ...topicsToDelete],
      }));
    }
  };

  const addTopic = (
    subjectIndex: number,
    courseIndex: number,
    unitIndex: number
  ) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].units[unitIndex].topics.push({
      id: "new-" + Date.now(),
      name: "",
    });
    setSubjects(newSubjects);
  };

  const removeTopic = (
    subjectIndex: number,
    courseIndex: number,
    unitIndex: number,
    topicIndex: number
  ) => {
    const topicToRemove =
      subjects[subjectIndex].courses[courseIndex].units[unitIndex].topics[
        topicIndex
      ];
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].units[
      unitIndex
    ].topics.splice(topicIndex, 1);
    setSubjects(newSubjects);

    if (!topicToRemove.id.startsWith("new-")) {
      setItemsToDelete((prev) => ({
        ...prev,
        topics: [...prev.topics, topicToRemove.id],
      }));
    }
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

  const updateUnitName = (
    subjectIndex: number,
    courseIndex: number,
    unitIndex: number,
    name: string
  ) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].units[unitIndex].name = name;
    setSubjects(newSubjects);
  };

  const updateTopicName = (
    subjectIndex: number,
    courseIndex: number,
    unitIndex: number,
    topicIndex: number,
    name: string
  ) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].units[unitIndex].topics[
      topicIndex
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

  const toggleUnitExpanded = (
    subjectIndex: number,
    courseIndex: number,
    unitIndex: number
  ) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].units[unitIndex].isExpanded = 
      !newSubjects[subjectIndex].courses[courseIndex].units[unitIndex].isExpanded;
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
              <BookOpen size={24} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Edit Curriculum</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all duration-200">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-600">Loading curriculum data...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start">
                  <AlertCircle size={20} className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Basic Info Section */}
                <div className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Basic Information</h3>
                  
                  <div className="mb-6">
                    <label
                      htmlFor="curriculum-name"
                      className="flex items-center text-sm font-medium text-gray-700 mb-3">
                      <Layers size={18} className="mr-2 text-gray-500" />
                      Curriculum Name
                    </label>
                    <input
                      type="text"
                      id="curriculum-name"
                      value={curriculumName}
                      onChange={(e) => setCurriculumName(e.target.value)}
                      placeholder="e.g., Advanced Placement (AP)"
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="curriculum-description"
                      className="flex items-center text-sm font-medium text-gray-700 mb-3">
                      <FileText size={18} className="mr-2 text-gray-500" />
                      Curriculum Description
                    </label>
                    <textarea
                      id="curriculum-description"
                      value={curriculumDescription}
                      onChange={(e) => setCurriculumDescription(e.target.value)}
                      placeholder="Describe this curriculum..."
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 min-h-[120px] resize-none"
                    />
                  </div>
                </div>

                {/* Content Structure Section */}
                <div className="mb-10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">Content Structure</h3>
                    <button
                      type="button"
                      onClick={addSubject}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium transition-colors duration-200 shadow-sm">
                      <Plus size={18} />
                      <span>Add Subject</span>
                    </button>
                  </div>

                  {/* Collapsible Structure for Subjects, Courses, Units, Topics */}
                  <div className="space-y-8">
                    {subjects.map((subject, subjectIndex) => (
                      <div
                        key={subject.id}
                        className="border-2 border-blue-200 rounded-xl overflow-hidden shadow-sm">
                        {/* Subject Header */}
                        <div 
                          className="bg-blue-50 p-5 flex items-center justify-between cursor-pointer"
                          onClick={() => toggleSubjectExpanded(subjectIndex)}
                        >
                          <div className="flex items-center">
                            <div className="bg-blue-100 rounded-lg p-2 mr-3">
                              <BookmarkIcon size={20} className="text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-lg text-blue-800">
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
                                className="mr-3 text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={18} />
                              </button>
                            )}
                            {subject.isExpanded ? (
                              <ChevronDown size={22} className="text-blue-600" />
                            ) : (
                              <ChevronRight size={22} className="text-blue-600" />
                            )}
                          </div>
                        </div>

                        {/* Subject Content */}
                        {subject.isExpanded && (
                          <div className="p-6 bg-white">
                            <div className="mb-6">
                              <label className="text-base font-medium text-gray-700 mb-3 block">
                                Subject Name
                              </label>
                              <input
                                type="text"
                                value={subject.name}
                                onChange={(e) => updateSubjectName(subjectIndex, e.target.value)}
                                placeholder="Subject Name (e.g., Mathematics)"
                                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                              />
                            </div>

                            {/* Courses */}
                            <div className="ml-6 mt-8 space-y-6">
                              {subject.courses.map((course, courseIndex) => (
                                <div 
                                  key={course.id}
                                  className="border-2 border-purple-200 rounded-xl overflow-hidden shadow-sm"
                                >
                                  {/* Course Header */}
                                  <div 
                                    className="bg-purple-50 p-4 flex items-center justify-between cursor-pointer"
                                    onClick={() => toggleCourseExpanded(subjectIndex, courseIndex)}
                                  >
                                    <div className="flex items-center">
                                      <div className="bg-purple-100 rounded-lg p-1.5 mr-3">
                                        <GraduationCap size={18} className="text-purple-600" />
                                      </div>
                                      <h5 className="font-semibold text-base text-purple-800">
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
                                          className="mr-3 flex items-center gap-1.5 px-3.5 py-1.5 text-sm rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 transition-colors shadow-sm">
                                          <Plus size={16} />
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
                                          className="mr-3 text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                                          <Trash2 size={16} />
                                        </button>
                                      )}
                                      {course.isExpanded ? (
                                        <ChevronDown size={20} className="text-purple-600" />
                                      ) : (
                                        <ChevronRight size={20} className="text-purple-600" />
                                      )}
                                    </div>
                                  </div>

                                  {/* Course Content */}
                                  {course.isExpanded && (
                                    <div className="p-5 bg-white">
                                      <div className="mb-5">
                                        <label className="text-base font-medium text-gray-700 mb-2 block">
                                          Course Name
                                        </label>
                                        <input
                                          type="text"
                                          value={course.name}
                                          onChange={(e) => updateCourseName(subjectIndex, courseIndex, e.target.value)}
                                          placeholder="Course Name (e.g., Calculus AB)"
                                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                        />
                                      </div>

                                      {/* Units */}
                                      <div className="ml-5 mt-7 space-y-5">
                                        {course.units.map((unit, unitIndex) => (
                                          <div 
                                            key={unit.id}
                                            className="border-2 border-teal-200 rounded-lg overflow-hidden shadow-sm"
                                          >
                                            {/* Unit Header */}
                                            <div 
                                              className="bg-teal-50 p-3.5 flex items-center justify-between cursor-pointer"
                                              onClick={() => toggleUnitExpanded(subjectIndex, courseIndex, unitIndex)}
                                            >
                                              <div className="flex items-center">
                                                <div className="bg-teal-100 rounded-lg p-1.5 mr-2.5">
                                                  <BookText size={16} className="text-teal-600" />
                                                </div>
                                                <h6 className="font-semibold text-base text-teal-800">
                                                  Unit {unitIndex + 1}
                                                  {unit.name && `: ${unit.name}`}
                                                </h6>
                                              </div>
                                              <div className="flex items-center">
                                                {unitIndex === course.units.length - 1 && (
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      addUnit(subjectIndex, courseIndex);
                                                    }}
                                                    className="mr-3 flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-700 transition-colors shadow-sm">
                                                    <Plus size={14} />
                                                    <span>Add Unit</span>
                                                  </button>
                                                )}
                                                {course.units.length > 1 && (
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      removeUnit(subjectIndex, courseIndex, unitIndex);
                                                    }}
                                                    className="mr-3 text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={14} />
                                                  </button>
                                                )}
                                                {unit.isExpanded ? (
                                                  <ChevronDown size={18} className="text-teal-600" />
                                                ) : (
                                                  <ChevronRight size={18} className="text-teal-600" />
                                                )}
                                              </div>
                                            </div>

                                            {/* Unit Content */}
                                            {unit.isExpanded && (
                                              <div className="p-4 bg-white">
                                                <div className="mb-4">
                                                  <label className="text-base font-medium text-gray-700 mb-2 block">
                                                    Unit Name
                                                  </label>
                                                  <input
                                                    type="text"
                                                    value={unit.name}
                                                    onChange={(e) => updateUnitName(subjectIndex, courseIndex, unitIndex, e.target.value)}
                                                    placeholder="Unit Name (e.g., Limits and Continuity)"
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                                  />
                                                </div>

                                                {/* Topics */}
                                                <div className="ml-5 mt-6 space-y-4">
                                                  <div className="flex justify-between items-center mb-3">
                                                    <h6 className="text-base font-medium text-amber-800 flex items-center">
                                                      <div className="bg-amber-100 rounded-lg p-1.5 mr-2">
                                                        <ListChecks size={14} className="text-amber-600" />
                                                      </div>
                                                      Topics
                                                    </h6>
                                                    <button
                                                      type="button"
                                                      onClick={() => addTopic(subjectIndex, courseIndex, unitIndex)}
                                                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors shadow-sm">
                                                      <Plus size={14} />
                                                      <span>Add Topic</span>
                                                    </button>
                                                  </div>
                                                  
                                                  {unit.topics.map((topic, topicIndex) => (
                                                    <div 
                                                      key={topic.id}
                                                      className="border-2 border-amber-200 rounded-lg overflow-hidden mb-4 shadow-sm"
                                                    >
                                                      <div className="bg-amber-50 p-3 flex justify-between items-center">
                                                        <span className="font-medium text-amber-800 flex items-center">
                                                          <div className="bg-amber-100 rounded-full p-1 mr-2 w-6 h-6 flex items-center justify-center">
                                                            <span className="text-xs font-bold text-amber-700">{topicIndex + 1}</span>
                                                          </div>
                                                          Topic {topicIndex + 1}
                                                          {topic.name && `: ${topic.name}`}
                                                        </span>
                                                        {unit.topics.length > 1 && (
                                                          <button
                                                            type="button"
                                                            onClick={() => removeTopic(subjectIndex, courseIndex, unitIndex, topicIndex)}
                                                            className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 size={14} />
                                                          </button>
                                                        )}
                                                      </div>
                                                      <div className="p-4 bg-white">
                                                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                                                          Topic Name
                                                        </label>
                                                        <input
                                                          type="text"
                                                          value={topic.name}
                                                          onChange={(e) => updateTopicName(subjectIndex, courseIndex, unitIndex, topicIndex, e.target.value)}
                                                          placeholder="Topic Name (e.g., Finding limits graphically)"
                                                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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

                <div className="text-gray-600 text-sm bg-blue-50 p-5 rounded-xl border border-blue-100 mb-8">
                  <p className="mb-2 font-medium text-blue-700 text-base">Note:</p>
                  <p>
                    All changes to the curriculum structure will be saved when
                    you click "Save Changes". Empty items will be ignored.
                  </p>
                </div>
              </form>
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
            disabled={isLoading || isFetching}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || isFetching}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2">
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
                Save Changes
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