// src/app/layout/Header.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Header = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: "New questions added",
      message: "New AP Calculus questions have been added",
      time: "2 hours ago",
      isRead: false,
    },
    {
      id: 2,
      title: "System update",
      message: "The system has been updated with new features",
      time: "1 day ago",
      isRead: true,
    },
    {
      id: 3,
      title: "Welcome!",
      message: "Welcome to the Question Generator platform",
      time: "3 days ago",
      isRead: true,
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-3 w-full max-w-md">
        <Search size={20} className="text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search curricula or questions..."
          className="border-none outline-none w-full text-sm"
        />
      </form>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div ref={notificationsRef} className="relative">
          <button
            className="relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
            <Bell size={20} className="text-gray-600" />
            {notifications.some((n) => !n.isRead) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">
                  Notifications
                </h3>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 ${
                        !notification.isRead ? "bg-blue-50" : ""
                      }`}>
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {notification.time}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-200 text-xs text-center">
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User profile */}
        {user && (
          <div ref={profileRef} className="relative">
            <button
              className="flex items-center gap-2 hover:bg-gray-100 py-1 px-2 rounded-md transition-all duration-200"
              onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <User size={16} />
              </div>
              <div className="text-sm">
                <p className="font-medium text-left">{user.full_name}</p>
                <p className="text-gray-500 text-xs text-left capitalize">
                  {user.role}
                </p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-20">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {user.full_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}>
                    <User size={16} className="mr-2" />
                    Your Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}>
                    <Settings size={16} className="mr-2" />
                    Settings
                  </Link>
                </div>
                <div className="py-1 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut size={16} className="mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
