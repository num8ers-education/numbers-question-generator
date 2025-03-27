'use client';

import { ChevronRight } from 'lucide-react';

export default function CurriculumListItem({ curriculum, onClick }) {
  const subjectCount = curriculum.subjects.length;
  const courseCount = curriculum.subjects.reduce(
    (total, subject) => total + subject.courses.length, 0
  );

  return (
    <div 
      onClick={() => onClick(curriculum)}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
    >
      <div className="p-5">
        <h3 className="font-bold text-lg mb-2 text-gray-900">{curriculum.name}</h3>
        
        <div className="flex flex-wrap text-sm text-gray-500 mb-4">
          <div className="mr-6">
            <span className="font-medium text-gray-700">{subjectCount}</span> Subjects
          </div>
          <div>
            <span className="font-medium text-gray-700">{courseCount}</span> Courses
          </div>
        </div>
        
        {curriculum.subjects.length > 0 && (
          <div className="text-gray-600 text-sm">
            <span className="font-medium">Subjects: </span>
            {curriculum.subjects.slice(0, 3).map((subject, index) => (
              <span key={subject.id}>
                {subject.name}
                {index < Math.min(curriculum.subjects.length, 3) - 1 && ", "}
              </span>
            ))}
            {curriculum.subjects.length > 3 && ", ..."}
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 flex justify-between items-center">
        <span className="text-sm font-medium text-blue-600">View Details</span>
        <ChevronRight size={18} className="text-blue-600" />
      </div>
    </div>
  );
}