'use client';

import { useState } from 'react';
import { X, Plus, Trash2, BookOpen, Layers, BookText, FileText, ListOrdered } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="bg-gray-200 p-2 rounded-md mr-3">
              <BookOpen size={20} className="text-gray-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Add New Curriculum</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="curriculum-name" className="flex items-center text-sm font-medium text-gray-700 mb-2">
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

            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium text-gray-800 flex items-center">
                  <BookText size={18} className="mr-2 text-gray-600" />
                  Subjects
                </h3>
                <button
                  type="button"
                  onClick={addSubject}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors duration-200"
                >
                  <Plus size={16} />
                  <span>Add Subject</span>
                </button>
              </div>

              {subjects.map((subject, subjectIndex) => (
                <div 
                  key={subjectIndex} 
                  className="border border-gray-200 rounded-md p-4 mb-5 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-full">
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <span className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-gray-700 font-medium">S</span>
                        Subject Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={subject.name}
                          onChange={(e) => updateSubjectName(subjectIndex, e.target.value)}
                          placeholder="e.g., Mathematics"
                          className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                          required
                        />
                        {subjects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSubject(subjectIndex)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 hover:bg-red-50 rounded-full"
                          >
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
                        <FileText size={16} className="mr-2 text-gray-500" />
                        Courses
                      </h4>
                      <button
                        type="button"
                        onClick={() => addCourse(subjectIndex)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200"
                      >
                        <Plus size={14} />
                        <span>Add Course</span>
                      </button>
                    </div>

                    {subject.courses.map((course, courseIndex) => (
                      <div 
                        key={courseIndex} 
                        className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="w-full">
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                              <span className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-gray-700 font-medium">C</span>
                              Course Name
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={course.name}
                                onChange={(e) => updateCourseName(subjectIndex, courseIndex, e.target.value)}
                                placeholder="e.g., AP Calculus AB"
                                className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                                required
                              />
                              {subject.courses.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeCourse(subjectIndex, courseIndex)}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 hover:bg-red-50 rounded-full"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Topics */}
                        <div className="ml-3 mb-3 border-l border-gray-200 pl-4">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="text-sm font-medium text-gray-700 flex items-center">
                              <ListOrdered size={16} className="mr-2 text-gray-500" />
                              Topics
                            </h5>
                            <button
                              type="button"
                              onClick={() => addTopic(subjectIndex, courseIndex)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200"
                            >
                              <Plus size={14} />
                              <span>Add Topic</span>
                            </button>
                          </div>

                          {course.topics.map((topic, topicIndex) => (
                            <div 
                              key={topicIndex} 
                              className="border border-gray-200 rounded-md p-4 mb-3 bg-white"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="w-full">
                                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <span className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-gray-700 font-medium">T</span>
                                    Topic Name
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={topic.name}
                                      onChange={(e) => updateTopicName(subjectIndex, courseIndex, topicIndex, e.target.value)}
                                      placeholder="e.g., Limits and Continuity"
                                      className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                                      required
                                    />
                                    {course.topics.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeTopic(subjectIndex, courseIndex, topicIndex)}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 hover:bg-red-50 rounded-full"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Units */}
                              <div className="ml-3 mb-2 border-l border-gray-200 pl-4">
                                <div className="flex justify-between items-center mb-2">
                                  <h6 className="text-sm font-medium text-gray-700 flex items-center">
                                    <span className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-gray-700 font-medium">U</span>
                                    Units
                                  </h6>
                                  <button
                                    type="button"
                                    onClick={() => addUnit(subjectIndex, courseIndex, topicIndex)}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200"
                                  >
                                    <Plus size={14} />
                                    <span>Add Unit</span>
                                  </button>
                                </div>

                                {topic.units.map((unit, unitIndex) => (
                                  <div key={unitIndex} className="flex items-center mb-3">
                                    <div className="relative w-full">
                                      <input
                                        type="text"
                                        value={unit.name}
                                        onChange={(e) => updateUnitName(subjectIndex, courseIndex, topicIndex, unitIndex, e.target.value)}
                                        placeholder="e.g., 1.1 Introducing Calculus"
                                        className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                                        required
                                      />
                                      {topic.units.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => removeUnit(subjectIndex, courseIndex, topicIndex, unitIndex)}
                                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 hover:bg-red-50 rounded-full"
                                        >
                                          <Trash2 size={16} />
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
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 shadow-sm"
          >
            Save Curriculum
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
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