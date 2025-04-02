// src/app/users/page.tsx
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  User,
  UserPlus,
  Users as UsersIcon,
  School,
  UserCheck,
  AlertCircle
} from "lucide-react";
import AddUserModal from "./AddUserModal";
import UsersGrid from "./UsersGrid";
import { userAPI } from "@/services/api";
import Layout from "@/app/layout/Layout";
import { showToast } from "@/components/toast";



export default function UsersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch users data on load and when refresh is triggered
  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userAPI.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again later.");
      showToast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUserSuccess = () => {
    // Trigger a refresh to update the users list
    setRefreshTrigger((prev) => prev + 1);
    showToast.success("User added successfully!");
    
    // Close the modal
    setIsAddModalOpen(false);
  };

  // Filter users based on search query and role filter
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = 
      searchQuery === "" || 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = 
      filterRole === null || 
      user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const userStats = {
    total: users.length,
    admins: users.filter((user: any) => user.role === "admin").length,
    teachers: users.filter((user: any) => user.role === "teacher").length,
    students: users.filter((user: any) => user.role === "student").length
  };

  return (
    <Layout allowedRoles={["admin"]}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">
              Manage user accounts and permissions
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md transition-all duration-200 shadow-sm hover:shadow font-medium">
            <UserPlus size={18} />
            <span>Add User</span>
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-full">
                <UsersIcon size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-2xl font-bold">{userStats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 text-purple-600 p-3 rounded-full">
                <UserCheck size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Admins</p>
                <p className="text-2xl font-bold">{userStats.admins}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 text-green-600 p-3 rounded-full">
                <School size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Teachers</p>
                <p className="text-2xl font-bold">{userStats.teachers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-amber-50 text-amber-600 p-3 rounded-full">
                <User size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Students</p>
                <p className="text-2xl font-bold">{userStats.students}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-700"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterRole(null)}
              className={`px-4 py-2.5 rounded-md transition-all duration-200 ${
                filterRole === null
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRole("admin")}
              className={`px-4 py-2.5 rounded-md transition-all duration-200 ${
                filterRole === "admin"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Admins
            </button>
            <button
              onClick={() => setFilterRole("teacher")}
              className={`px-4 py-2.5 rounded-md transition-all duration-200 ${
                filterRole === "teacher"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Teachers
            </button>
            <button
              onClick={() => setFilterRole("student")}
              className={`px-4 py-2.5 rounded-md transition-all duration-200 ${
                filterRole === "student"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Students
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start">
            <AlertCircle size={20} className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <UsersGrid 
          users={filteredUsers}
          isLoading={isLoading} 
          onRefreshNeeded={() => setRefreshTrigger(prev => prev + 1)}
        />

        {/* Add User Modal */}
        {isAddModalOpen && (
          <AddUserModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={handleAddUserSuccess}
          />
        )}
      </div>
    </Layout>
  );
}