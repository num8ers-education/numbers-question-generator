// src/app/users/UserCard.tsx
import { useState } from "react";
import { User, Edit, Trash2, Mail, Calendar, Shield, School, Briefcase } from "lucide-react";

interface UserCardProps {
  user: any;
  onEdit: () => void;
  onDelete: () => void;
}

const UserCard = ({ user, onEdit, onDelete }: UserCardProps) => {
  const [showActions, setShowActions] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full flex items-center">
            <Shield size={12} className="mr-1" />
            Admin
          </span>
        );
      case "teacher":
        return (
          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full flex items-center">
            <School size={12} className="mr-1" />
            Teacher
          </span>
        );
      case "student":
        return (
          <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full flex items-center">
            <Briefcase size={12} className="mr-1" />
            Student
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full">
            {role}
          </span>
        );
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 h-full flex flex-col"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="h-24 relative flex items-center justify-center p-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold ${
          user.role === "admin" 
            ? "bg-purple-600" 
            : user.role === "teacher" 
              ? "bg-green-600" 
              : "bg-amber-600"
        }`}>
          {user.profile_image 
            ? <img src={user.profile_image} alt={user.full_name} className="w-full h-full object-cover rounded-full" /> 
            : user.full_name ? user.full_name.charAt(0).toUpperCase() : <User size={24} />
          }
        </div>

        {/* Actions overlay */}
        {showActions && (
          <div className="absolute top-2 right-2 bg-white/90 rounded-md shadow-sm flex">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-l-md transition-colors">
              <Edit size={16} />
            </button>
            {user.role !== "admin" && ( // Prevent deleting admin users
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-r-md transition-colors">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col border-t border-gray-100">
        <div className="mb-2 flex justify-center">
          {getRoleBadge(user.role)}
        </div>

        <h3 className="font-bold text-lg text-center mb-2">{user.full_name}</h3>

        <div className="mt-2 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Mail size={14} className="mr-2 flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          
          {user.created_at && (
            <div className="flex items-center text-xs text-gray-500">
              <Calendar size={14} className="mr-2 flex-shrink-0" />
              <span>Joined: {formatDate(user.created_at)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
        <button
          onClick={onEdit}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
          Edit Details
        </button>
      </div>
    </div>
  );
};

export default UserCard;