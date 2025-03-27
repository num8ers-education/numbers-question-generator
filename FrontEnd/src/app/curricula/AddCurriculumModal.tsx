'use client';

import { useState } from 'react';
import { X, Plus, Trash } from 'lucide-react';

export default function AddCurriculumModal({ isOpen, onClose }) {
  const [curriculumName, setCurriculumName] = useState('');
  const [subjects, setSubjects] = useState([
    {
      name: '',
      courses: [
        {
          name: '',
          topics: [
            {
              name: '',
              units: [{ name: '' }]
            }
          ]
        }
      ]
    }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, we would save the data to the backend here
    console.log('Submitting curriculum:', { name: curriculumName, subjects });
    // Close the modal and reset the form
    onClose();
  };

  const addSubject = () => {
    setSubjects([
      ...subjects,
      {
        name: '',
        courses: [
          {
            name: '',
            topics: [
              {
                name: '',
                units: [{ name: '' }]
              }
            ]
          }
        ]
      }
    ]);
  };

  const addCourse = (subjectIndex) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses.push({
      name: '',
      topics: [
        {
          name: '',
          units: [{ name: '' }]
        }
      ]
    });
    setSubjects(newSubjects);
  };

  const addTopic = (subjectIndex, courseIndex) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].topics.push({
      name: '',
      units: [{ name: '' }]
    });
    setSubjects(newSubjects);
  };

  const addUnit = (subjectIndex, courseIndex, topicIndex) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].topics[topicIndex].units.push({
      name: ''
    });
    setSubjects(newSubjects);
  };

  const removeSubject = (subjectIndex) => {
    const newSubjects = [...subjects];
    newSubjects.splice(subjectIndex, 1);
    setSubjects(newSubjects);
  };

  const removeCourse = (subjectIndex, courseIndex) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses.splice(courseIndex, 1);
    setSubjects(newSubjects);
  };

  const removeTopic = (subjectIndex, courseIndex, topicIndex) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].topics.splice(topicIndex, 1);
    setSubjects(newSubjects);
  };

  const removeUnit = (subjectIndex, courseIndex, topicIndex, unitIndex) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].topics[topicIndex].units.splice(unitIndex, 1);
    setSubjects(newSubjects);
  };

  const updateSubjectName = (subjectIndex, name) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].name = name;
    setSubjects(newSubjects);
  };

  const updateCourseName = (subjectIndex, courseIndex, name) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].name = name;
    setSubjects(newSubjects);
  };

  const updateTopicName = (subjectIndex, courseIndex, topicIndex, name) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].topics[topicIndex].name = name;
    setSubjects(newSubjects);
  };

  const updateUnitName = (subjectIndex, courseIndex, topicIndex, unitIndex, name) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].courses[courseIndex].topics[topicIndex].units[unitIndex].name = name;
    setSubjects(newSubjects);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Add New Curriculum</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="curriculum-name" className="block text-sm font-medium text-gray-700 mb-1">
                Curriculum Name
              </label>
              <input
                type="text"
                id="curriculum-name"
                value={curriculumName}
                onChange={(e) => setCurriculumName(e.target.value)}
                placeholder="e.g., Advanced Placement (AP)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Subjects</h3>
                <button
                  type="button"
                  onClick={addSubject}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  <Plus size={16} />
                  <span>Add Subject</span>
                </button>
              </div>

              {subjects.map((subject, subjectIndex) => (
                <div key={subjectIndex} className="border border-gray-200 rounded-md p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject Name
                      </label>
                      <input
                        type="text"
                        value={subject.name}
                        onChange={(e) => updateSubjectName(subjectIndex, e.target.value)}
                        placeholder="e.g., Mathematics"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    {subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubject(subjectIndex)}
                        className="ml-4 text-red-500 hover:text-red-700"
                      >
                        <Trash size={18} />
                      </button>
                    )}
                  </div>

                  {/* Courses */}
                  <div className="ml-4 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-md font-medium">Courses</h4>
                      <button
                        type="button"
                        onClick={() => addCourse(subjectIndex)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Plus size={14} />
                        <span>Add Course</span>
                      </button>
                    </div>

                    {subject.courses.map((course, courseIndex) => (
                      <div key={courseIndex} className="border border-gray-200 rounded-md p-3 mb-3">
                        <div className="flex justify-between items-center mb-3">
                          <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Course Name
                            </label>
                            <input
                              type="text"
                              value={course.name}
                              onChange={(e) => updateCourseName(subjectIndex, courseIndex, e.target.value)}
                              placeholder="e.g., AP Calculus AB"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                          {subject.courses.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCourse(subjectIndex, courseIndex)}
                              className="ml-4 text-red-500 hover:text-red-700"
                            >
                              <Trash size={16} />
                            </button>
                          )}
                        </div>

                        {/* Topics */}
                        <div className="ml-4 mb-3">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="text-sm font-medium">Topics</h5>
                            <button
                              type="button"
                              onClick={() => addTopic(subjectIndex, courseIndex)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                            >
                              <Plus size={12} />
                              <span>Add Topic</span>
                            </button>
                          </div>

                          {course.topics.map((topic, topicIndex) => (
                            <div key={topicIndex} className="border border-gray-200 rounded-md p-2 mb-2">
                              <div className="flex justify-between items-center mb-2">
                                <div className="w-full">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Topic Name
                                  </label>
                                  <input
                                    type="text"
                                    value={topic.name}
                                    onChange={(e) => updateTopicName(subjectIndex, courseIndex, topicIndex, e.target.value)}
                                    placeholder="e.g., Limits and Continuity"
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                  />
                                </div>
                                {course.topics.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeTopic(subjectIndex, courseIndex, topicIndex)}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                  >
                                    <Trash size={14} />
                                  </button>
                                )}
                              </div>

                              {/* Units */}
                              <div className="ml-3 mb-2">
                                <div className="flex justify-between items-center mb-1">
                                  <h6 className="text-xs font-medium">Units</h6>
                                  <button
                                    type="button"
                                    onClick={() => addUnit(subjectIndex, courseIndex, topicIndex)}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    <Plus size={10} />
                                    <span>Add Unit</span>
                                  </button>
                                </div>

                                {topic.units.map((unit, unitIndex) => (
                                  <div key={unitIndex} className="flex items-center mb-1">
                                    <input
                                      type="text"
                                      value={unit.name}
                                      onChange={(e) => updateUnitName(subjectIndex, courseIndex, topicIndex, unitIndex, e.target.value)}
                                      placeholder="e.g., 1.1 Introducing Calculus"
                                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                      required
                                    />
                                    {topic.units.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeUnit(subjectIndex, courseIndex, topicIndex, unitIndex)}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                      >
                                        <Trash size={12} />
                                      </button>
                                    )}
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
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
          >
            Save Curriculum
          </button>
        </div>
      </div>
    </div>
  );
}