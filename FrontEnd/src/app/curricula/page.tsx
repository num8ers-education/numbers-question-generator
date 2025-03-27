'use client';

import { useState } from 'react';
import { Plus, Search, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import CurriculumListItem from './CurriculumListItem';
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">All Curriculums</h1>
          <p className="text-gray-600">Manage your educational curriculums</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all duration-200"
        >
          <Plus size={18} />
          <span>Add Curriculum</span>
        </button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search curriculums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50">
          <h2 className="font-semibold">Curriculum</h2>
          <h2 className="font-semibold">Details</h2>
        </div>

        <ul className="divide-y divide-gray-200">
          {filteredCurriculums.map(curriculum => (
            <li key={curriculum.id} className="cursor-pointer">
              <div 
                className="px-6 py-4 hover:bg-gray-50 transition-all duration-200 flex justify-between items-center"
                onClick={() => handleCurriculumClick(curriculum)}
              >
                <div className="font-medium">{curriculum.name}</div>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm mr-3">
                    {curriculum.subjects.length} Subjects
                  </span>
                  {selectedCurriculum?.id === curriculum.id ? (
                    <ChevronDown size={20} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded view for selected curriculum */}
              {selectedCurriculum?.id === curriculum.id && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  {curriculum.subjects.map(subject => (
                    <div key={subject.id} className="mb-4">
                      <h3 className="font-medium text-blue-600 mb-2">
                        Subject: {subject.name}
                      </h3>
                      
                      {subject.courses.map(course => (
                        <div key={course.id} className="ml-4 mb-3">
                          <h4 className="font-medium text-gray-700 mb-2">
                            Course: {course.name}
                          </h4>
                          
                          {course.topics.map(topic => (
                            <div key={topic.id} className="ml-4 mb-2">
                              <h5 className="text-gray-600 mb-1">
                                Topic: {topic.name}
                              </h5>
                              
                              <ul className="ml-4 space-y-1">
                                {topic.units.map(unit => (
                                  <li key={unit.id} className="text-gray-500 text-sm">
                                    Unit: {unit.name}
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
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4">
                      Edit Curriculum
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Add Curriculum Modal */}
      {isAddModalOpen && (
        <AddCurriculumModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
}