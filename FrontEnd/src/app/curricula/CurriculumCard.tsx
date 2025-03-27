// src/app/curricula/CurriculumCard.tsx
import { useState } from "react";
import Link from "next/link";
import { BookOpen, FileText, Trash2, Edit, Calendar } from "lucide-react";

interface CurriculumCardProps {
  id: string;
  title: string;
  level: string;
  subjectArea: string;
  questionCount: number;
  imageSrc?: string;
  description?: string;
  lastGenerated?: string;
  onDelete?: () => void;
}

const CurriculumCard = ({
  id,
  title,
  level,
  subjectArea,
  questionCount,
  imageSrc,
  description,
  lastGenerated,
  onDelete,
}: CurriculumCardProps) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 h-full flex flex-col"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}>
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

        {/* Actions overlay */}
        {showActions && onDelete && (
          <div className="absolute top-2 right-2 bg-white/90 rounded-md shadow-sm flex">
            <Link
              href={`/curricula/edit/${id}`}
              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-l-md transition-colors">
              <Edit size={16} />
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-r-md transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2 flex gap-2">
          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
            {level}
          </span>
          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full">
            {subjectArea}
          </span>
        </div>

        <h3 className="font-bold text-lg mb-2">{title}</h3>

        {description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {description}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <FileText size={16} />
              <span>{questionCount} questions</span>
            </div>
          </div>

          {lastGenerated && (
            <div className="flex items-center text-xs text-gray-500">
              <Calendar size={14} className="mr-1" />
              <span>Last updated: {lastGenerated}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between">
        <Link
          href={`/curricula/${id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
          View Details
        </Link>
        <Link
          href={`/generate?curriculum=${id}`}
          className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
          Generate Questions
        </Link>
      </div>
    </div>
  );
};

export default CurriculumCard;
