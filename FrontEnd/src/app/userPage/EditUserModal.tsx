// src/app/users/EditUserModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  X,
  UserCog,
  Mail,
  User,
  Lock,
  School,
  Shield,
  Briefcase,
  Eye,
  EyeOff,
  AlertCircle,
  Save,
  Check,
  X as XCircle
} from "lucide-react";
import { userAPI } from "@/services/api";
import { showToast } from "@/components/toast";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: any;
}

export default function EditUserModal({
  isOpen,
  onClose,
  onSuccess,
  user
}: EditUserModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [changePassword, setChangePassword] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
      setRole(user.role || "student");
      setIsActive(user.is_active !== false); // Default to true if not specified
      setPassword("");
      setChangePassword(false);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (changePassword && !password.trim()) {
      setError("Password is required");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Prepare data for API
      const userData: any = {
        full_name: fullName,
        email: email,
        role: role,
        is_active: isActive
      };

      // Only include password if it's being changed
      if (changePassword && password) {
        userData.password = password;
      }

      // Update the user
      await userAPI.updateUser(user.id, userData);
      
      // Show success message
      showToast.success("User updated successfully");

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Close the modal
        onClose();
      }
    } catch (err: any) {
      console.error("Error updating user:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to update user. Please try again."
      );
      showToast.error("Failed to update user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomPassword = () => {
    // Generate a random password with 10 characters (including uppercase, lowercase, numbers, and special characters)
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(password);
    setShowPassword(true); // Show the generated password
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="bg-blue-50 p-3 rounded-xl mr-4">
              <UserCog size={22} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Edit User
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all duration-200">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start">
              <AlertCircle size={20} className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="mb-4">
              <label
                htmlFor="full-name"
                className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="mr-2 text-gray-500" />
                Full Name
              </label>
              <input
                type="text"
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                required
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="mr-2 text-gray-500" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                required
              />
            </div>

            {/* Change Password Toggle */}
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  id="change-password"
                  type="checkbox"
                  checked={changePassword}
                  onChange={() => setChangePassword(!changePassword)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="change-password" className="ml-2 block text-sm text-gray-700">
                  Change password
                </label>
              </div>
            </div>

            {/* Password - only shown if changePassword is true */}
            {changePassword && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="password"
                    className="flex items-center text-sm font-medium text-gray-700">
                    <Lock size={16} className="mr-2 text-gray-500" />
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Generate random password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 pr-10"
                    required={changePassword}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long.
                </p>
              </div>
            )}

            {/* Account Status */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Account Status
              </label>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsActive(true)}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                    isActive
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-600 hover:border-green-200 hover:bg-green-50"
                  }`}
                >
                  <Check size={16} className={`mr-2 ${isActive ? "text-green-500" : "text-gray-400"}`} />
                  Active
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                    !isActive
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 text-gray-600 hover:border-red-200 hover:bg-red-50"
                  }`}
                >
                  <XCircle size={16} className={`mr-2 ${!isActive ? "text-red-500" : "text-gray-400"}`} />
                  Inactive
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                User Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                    role === "admin"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 hover:border-purple-200 hover:bg-purple-50"
                  }`}
                >
                  <Shield size={20} className={role === "admin" ? "text-purple-500" : "text-gray-500"} />
                  <span className="mt-1 text-sm font-medium">Admin</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setRole("teacher")}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                    role === "teacher"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-green-200 hover:bg-green-50"
                  }`}
                >
                  <School size={20} className={role === "teacher" ? "text-green-500" : "text-gray-500"} />
                  <span className="mt-1 text-sm font-medium">Teacher</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                    role === "student"
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-gray-200 hover:border-amber-200 hover:bg-amber-50"
                  }`}
                >
                  <Briefcase size={20} className={role === "student" ? "text-amber-500" : "text-gray-500"} />
                  <span className="mt-1 text-sm font-medium">Student</span>
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
                disabled={isLoading}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2">
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
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