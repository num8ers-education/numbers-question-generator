'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, ChevronDown, ChevronRight, BookOpen, Edit, Trash2 } from 'lucide-react';
import AddCurriculumModal from './AddCurriculumModal';
import CurriculaGrid from './CurriculaGrid';
import { curriculumAPI } from '@/services/api';
import Layout from '@/app/layout/Layout';
import toast from 'react-hot-toast';

export default function CurriculumsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurriculum, setSelectedCurriculum] = useState<any>(null);
  
  const [curriculums, setCurriculums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterApplied, setFilterApplied] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch curriculum data on load and when refresh is triggered
  useEffect(() => {
    fetchCurriculums();
  }, [refreshTrigger]);

  const fetchCurriculums = async () => {
    try {
      setIsLoading(true);
      const data = await curriculumAPI.getAllCurricula();
      
      // Enhance curricula with hierarchy data where possible
      const enhancedCurricula = await Promise.all(
        data.map(async (curriculum: any) => {
          try {
            // Try to get the full hierarchy for each curriculum
            const curriculumWithHierarchy = await curriculumAPI.getCurriculumWithHierarchy(curriculum.id);
            return curriculumWithHierarchy;
          } catch (err) {
            // If hierarchy fetch fails, just add an empty subjects array
            return {
              ...curriculum,
              subjects: []
            };
          }
        })
      );
      
      setCurriculums(enhancedCurricula);
    } catch (err) {
      console.error("Error fetching curricula:", err);
      setError("Failed to load curricula. Please try again later.");
      toast.error("Failed to load curricula");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurriculumClick = (curriculum: any) => {
    setSelectedCurriculum(selectedCurriculum?.id === curriculum.id ? null : curriculum);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this curriculum?')) {
      try {
        await curriculumAPI.deleteCurriculum(id);
        toast.success("Curriculum deleted successfully");
        
        // Refresh the list
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        console.error("Error deleting curriculum:", err);
        toast.error("Failed to delete curriculum");
      }
    }
  };

  const handleAddCurriculumSuccess = () => {
    // Refresh the list after adding a new curriculum
    setRefreshTrigger(prev => prev + 1);
    toast.success("Curriculum added successfully!");
  };

  const filteredCurriculums = searchQuery 
    ? curriculums.filter(curriculum => 
        curriculum.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : curriculums;

  return (
    <Layout allowedRoles={['admin', 'teacher']}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Curricula</h1>
            <p className="text-gray-600 mt-1">Manage your educational curricula</p>
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
              placeholder="Search curricula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-700"
            />
          </div>
          <button 
            className={`flex items-center gap-2 px-5 py-2.5 border rounded-md transition-all duration-200 text-gray-700 font-medium shadow-sm ${
              filterApplied 
                ? 'border-blue-500 bg-blue-50 hover:bg-blue-100' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setFilterApplied(!filterApplied)}
          >
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>

        {/* Grid view for small screen or when no search is applied */}
        {(searchQuery === '' || window.innerWidth < 768) && (
          <div className="mb-10">
            <CurriculaGrid 
              onRefreshNeeded={() => setRefreshTrigger(prev => prev + 1)}
            />
          </div>
        )}

        {/* List view for search results or when filter is applied */}
        {(searchQuery !== '' || filterApplied) && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50">
              <h2 className="font-semibold text-gray-800">Curriculum</h2>
              <h2 className="font-semibold text-gray-800">Details</h2>
            </div>

            <ul className="divide-y divide-gray-200">
              {isLoading ? (
                <li className="px-6 py-10 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  Loading curricula...
                </li>
              ) : error ? (
                <li className="px-6 py-10 text-center text-red-500">
                  {error}
                  <button 
                    className="ml-3 underline"
                    onClick={() => fetchCurriculums()}
                  >
                    Retry
                  </button>
                </li>
              ) : filteredCurriculums.length > 0 ? (
                filteredCurriculums.map((curriculum) => (
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
                            {curriculum.subjects?.length || 0} {curriculum.subjects?.length === 1 ? 'Subject' : 'Subjects'}
                          </div>
                          <div className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {curriculum.subjects?.reduce((total: number, subject: any) => total + (subject.courses?.length || 0), 0) || 0} Courses
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
                        {curriculum.subjects && curriculum.subjects.length > 0 ? (
                          curriculum.subjects.map((subject: any) => (
                            <div key={subject.id} className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                              <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                                <span className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-sm text-gray-700 font-semibold">S</span>
                                <span>Subject: {subject.name}</span>
                              </h3>
                              
                              {subject.courses && subject.courses.length > 0 ? (
                                subject.courses.map((course: any) => (
                                  <div key={course.id} className="ml-5 mb-4 border-l-2 border-gray-200 pl-4">
                                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                                      <span className="bg-gray-100 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-sm text-gray-700 font-semibold">C</span>
                                      <span>Course: {course.name}</span>
                                    </h4>
                                    
                                    {course.topics && course.topics.length > 0 ? (
                                      course.topics.map((topic: any) => (
                                        <div key={topic.id} className="ml-5 mb-3 border-l-2 border-gray-200 pl-4">
                                          <h5 className="text-gray-700 mb-2 flex items-center">
                                            <span className="bg-gray-100 h-5 w-5 rounded-full flex items-center justify-center mr-2 text-xs text-gray-700 font-semibold">T</span>
                                            <span>Topic: {topic.name}</span>
                                          </h5>
                                          
                                          {topic.units && topic.units.length > 0 ? (
                                            <ul className="ml-5 space-y-2 border-l-2 border-gray-200 pl-4">
                                              {topic.units.map((unit: any) => (
                                                <li key={unit.id} className="text-gray-600 text-sm flex items-center">
                                                  <span className="bg-gray-100 h-5 w-5 rounded-full flex items-center justify-center mr-2 text-xs text-gray-600 font-semibold">U</span>
                                                  <span>Unit: {unit.name}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          ) : (
                                            <p className="ml-5 pl-4 text-sm text-gray-500">No units available</p>
                                          )}
                                        </div>
                                      ))
                                    ) : (
                                      <p className="ml-5 pl-4 text-sm text-gray-500">No topics available</p>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="ml-5 pl-4 text-sm text-gray-500">No courses available</p>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="bg-white p-4 rounded-lg text-center">
                            <p className="text-gray-500">No subjects available for this curriculum.</p>
                            <p className="text-sm text-gray-400 mt-1">Use the curriculum editor to add subjects and courses.</p>
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-4">
                          <button className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 font-medium mr-6 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors duration-200">
                            <Edit size={16} />
                            <span>Edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(curriculum.id)}
                            className="flex items-center gap-1.5 text-red-600 hover:text-red-800 font-medium px-3 py-1.5 rounded hover:bg-red-50 transition-colors duration-200"
                          >
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
                  No curricula found. Try changing your search query or add a new curriculum.
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Add Curriculum Modal */}
        {isAddModalOpen && (
          <AddCurriculumModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={handleAddCurriculumSuccess}
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
    </Layout>
  );