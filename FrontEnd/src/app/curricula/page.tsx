'use client';

import { useState } from 'react';
import { Plus, Search, Filter, ChevronDown, ChevronRight, BookOpen, Edit, Trash2 } from 'lucide-react';
import AddCurriculumModal from './AddCurriculumModal';

export default function CurriculumsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);

  // Mock data for curriculums
  const curriculums = [
    {
      id: '1',
      name: 'Advanced Placement (AP)',
      subjects: [
        {
          id: 's1',
          name: 'Mathematics',
          courses: [
            {
              id: 'c1',
              name: 'AP Calculus AB',
              topics: [
                {
                  id: 't1',
                  name: 'Limits and Continuity',
                  units: [
                    { id: 'u1', name: '1.1 Introducing Calculus' },
                    { id: 'u2', name: '1.2 Defining Limits and Using Limit Notation' }
                  ]
                },
                {
                  id: 't2',
                  name: 'Differentiation',
                  units: [
                    { id: 'u3', name: '2.1 Defining Average and Instantaneous Rates of Change' },
                    { id: 'u4', name: '2.2 The Derivative Function' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: '2',
      name: 'International Baccalaureate (IB)',
      subjects: [
        {
          id: 's2',
          name: 'Sciences',
          courses: [
            {
              id: 'c2',
              name: 'IB Physics HL',
              topics: [
                {
                  id: 't3',
                  name: 'Mechanics',
                  units: [
                    { id: 'u5', name: '1.1 Measurement in Physics' },
                    { id: 'u6', name: '1.2 Uncertainties and Errors' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: '3',
      name: 'A-Levels',
      subjects: [
        {
          id: 's3',
          name: 'Computer Science',
          courses: [
            {
              id: 'c3',
              name: 'A-Level Computer Science',
              topics: [
                {
                  id: 't4',
                  name: 'Programming Fundamentals',
                  units: [
                    { id: 'u7', name: '1.1 Data Types and Structures' },
                    { id: 'u8', name: '1.2 Algorithms and Problem Solving' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  const filteredCurriculums = curriculums.filter(curriculum => 
    curriculum.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCurriculumClick = (curriculum) => {
    setSelectedCurriculum(selectedCurriculum?.id === curriculum.id ? null : curriculum);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Curriculums</h1>
          <p className="text-gray-600 mt-1">Manage your educational curriculums</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md transition-all duration-200 shadow-sm hover:shadow font-medium"
        >
          <Plus size={18} />
          <span>Add Curriculum</span>
        </button>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search curriculums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-700"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium shadow-sm">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50">
          <h2 className="font-semibold text-gray-800">Curriculum</h2>
          <h2 className="font-semibold text-gray-800">Details</h2>
        </div>

        <ul className="divide-y divide-gray-200">
          {filteredCurriculums.length > 0 ? (
            filteredCurriculums.map(curriculum => (
              <li key={curriculum.id} className="group">
                <div 
                  className="px-6 py-5 hover:bg-gray-50 transition-all duration-200 flex justify-between items-center cursor-pointer"
                  onClick={() => handleCurriculumClick(curriculum)}
                >
                  <div className="flex items-center">
                                          <div className="bg-gray-100 text-gray-600 p-2 rounded-md mr-4 group-hover:bg-gray-200 transition-colors duration-200">
                      <BookOpen size={20} />
                    </div>
                    <div className="font-medium text-gray-800 group-hover:text-gray-900 transition-colors duration-200">
                      {curriculum.name}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex space-x-4 mr-6">
                      <div className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {curriculum.subjects.length} {curriculum.subjects.length === 1 ? 'Subject' : 'Subjects'}
                      </div>
                      <div className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {curriculum.subjects.reduce((total, subject) => total + subject.courses.length, 0)} Courses
                      </div>
                    </div>
                    {selectedCurriculum?.id === curriculum.id ? (
                      <div className="bg-gray-200 p-1 rounded-full text-gray-600">
                        <ChevronDown size={20} className="transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="bg-gray-100 p-1 rounded-full text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-600 transition-colors duration-200">
                        <ChevronRight size={20} className="transition-transform duration-300" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded view for selected curriculum */}
                {selectedCurriculum?.id === curriculum.id && (
                  <div className="bg-gray-50 px-6 py-5 border-t border-gray-200 transition-all duration-300 animate-fadeIn">
                    {curriculum.subjects.map(subject => (
                      <div key={subject.id} className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                          <span className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-sm text-gray-700 font-semibold">S</span>
                          <span>Subject: {subject.name}</span>
                        </h3>
                        
                        {subject.courses.map(course => (
                          <div key={course.id} className="ml-5 mb-4 border-l-2 border-gray-200 pl-4">
                            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                              <span className="bg-gray-100 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-sm text-gray-700 font-semibold">C</span>
                              <span>Course: {course.name}</span>
                            </h4>
                            
                            {course.topics.map(topic => (
                              <div key={topic.id} className="ml-5 mb-3 border-l-2 border-gray-200 pl-4">
                                <h5 className="text-gray-700 mb-2 flex items-center">
                                  <span className="bg-gray-100 h-5 w-5 rounded-full flex items-center justify-center mr-2 text-xs text-gray-700 font-semibold">T</span>
                                  <span>Topic: {topic.name}</span>
                                </h5>
                                
                                <ul className="ml-5 space-y-2 border-l-2 border-gray-200 pl-4">
                                  {topic.units.map(unit => (
                                    <li key={unit.id} className="text-gray-600 text-sm flex items-center">
                                      <span className="bg-gray-100 h-5 w-5 rounded-full flex items-center justify-center mr-2 text-xs text-gray-600 font-semibold">U</span>
                                      <span>Unit: {unit.name}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                    
                    <div className="flex justify-end mt-4">
                      <button className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 font-medium mr-6 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors duration-200">
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-red-600 hover:text-red-800 font-medium px-3 py-1.5 rounded hover:bg-red-50 transition-colors duration-200">
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))
          ) : (
            <li className="px-6 py-10 text-center text-gray-500">
              No curriculums found. Try changing your search query or add a new curriculum.
            </li>
          )}
        </ul>
      </div>

      {/* Add Curriculum Modal */}
      {isAddModalOpen && (
        <AddCurriculumModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}