// src/app/users/UsersGrid.tsx
"use client";

import { useState } from "react";
import { userAPI } from "@/services/api";
import { showToast } from "@/components/toast";
import UserCard from "./UserCard";
import EditUserModal from "./EditUserModal";
import {
  User,
  Loader2,
  AlertCircle
} from "lucide-react";

interface UsersGridProps {
  users: any[];
  isLoading: boolean;
  onRefreshNeeded: () => void;
}

// Confirmation dialog component
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const UsersGrid = ({ users, isLoading, onRefreshNeeded }: UsersGridProps) => {
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Prepare for deletion
  const handleDeleteRequest = (id: string) => {
    setUserToDelete(id);
    setConfirmDialogOpen(true);
  };

  // Function to handle user deletion
  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      // Set deleting state to show visual feedback
      setDeletingId(userToDelete);
      
      // Close the confirmation dialog
      setConfirmDialogOpen(false);
      
      // Delete the user
      await userAPI.deleteUser(userToDelete);
      
      // Show success message
      showToast.success("User deleted successfully");
      
      // Notify parent component to refresh
      onRefreshNeeded();
    } catch (err) {
      console.error("Error deleting user:", err);
      showToast.error("Failed to delete user");
    } finally {
      // Clear the deleting state
      setDeletingId(null);
      setUserToDelete(null);
    }
  };

  const handleEditRequest = (user: any) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    onRefreshNeeded();
    showToast.success("User updated successfully");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 p-4 rounded-full">
            <User className="h-12 w-12 text-gray-400" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900">No users found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {users.length === 0 
            ? "No users match your search criteria." 
            : "No users have been created yet."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map((user) => (
          <div key={user.id} className="relative">
            {/* Deletion loading overlay */}
            {deletingId === user.id && (
              <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex flex-col items-center justify-center rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mb-2"></div>
                <span className="text-sm text-gray-600">Deleting...</span>
              </div>
            )}
            
            <UserCard 
              user={user}
              onEdit={() => handleEditRequest(user)}
              onDelete={() => handleDeleteRequest(user.id)}
            />
          </div>
        ))}
      </div>
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          user={editingUser}
        />
      )}
    </>
  );
};

export default UsersGrid;