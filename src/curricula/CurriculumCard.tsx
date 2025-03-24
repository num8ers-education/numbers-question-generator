import { BookOpen, Clock, FileText } from 'lucide-react';

interface CurriculumCardProps {
  id: string;
  title: string;
  description: string;
  level: string;
  subjectArea: string;
  questionCount: number;
  lastGenerated?: string;
  imageSrc?: string;
}

const CurriculumCard = ({
  id,
  title,
  description,
  level,
  subjectArea,
  questionCount,
  lastGenerated,
  imageSrc,
}: CurriculumCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 h-full flex flex-col">
      <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={title} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen size={48} className="text-white/80" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium">
          {level}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">
            {subjectArea}
          </span>
        </div>
        
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <FileText size={16} />
              <span>{questionCount} questions</span>
            </div>
            
            {lastGenerated && (
              <div className="flex items-center gap-1 text-gray-600">
                <Clock size={16} />
                <span>{lastGenerated}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between">
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
          View Details
        </button>
        <button className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
          Generate Questions
        </button>
      </div>
    </div>
  );
};

export default CurriculumCard;
