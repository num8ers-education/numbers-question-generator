"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FileQuestion,
  Settings,
  BarChart3,
  LogOut,
  Sparkles,
  BookOpen,
  Users,
  FileText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Determine which menu items to show based on user role
  const getMenuItems = () => {
    const baseMenuItems = [
      { name: "Dashboard", icon: <LayoutGrid size={20} />, href: "/dashboard" },
    ];

    if (user?.role === "admin") {
      return [
        ...baseMenuItems,
        {
          name: "Generate Questions",
          icon: <Sparkles size={20} />,
          href: "/generate",
        },
        {
          name: "Questions",
          icon: <FileQuestion size={20} />,
          href: "/questions",
        },
        { name: "Curricula", icon: <BookOpen size={20} />, href: "/curricula" },
        { name: "Users", icon: <Users size={20} />, href: "/users" },
        {
          name: "Analytics",
          icon: <BarChart3 size={20} />,
          href: "/analytics",
        },
        {
          name: "Prompts",
          icon: <FileText size={20} />,
          href: "/prompts",
        },
        { name: "Settings", icon: <Settings size={20} />, href: "/settings" },
      ];
    } else if (user?.role === "teacher") {
      return [
        ...baseMenuItems,
        {
          name: "Generate Questions",
          icon: <Sparkles size={20} />,
          href: "/generate",
        },
        {
          name: "Questions",
          icon: <FileQuestion size={20} />,
          href: "/questions",
        },
        {
          name: "Analytics",
          icon: <BarChart3 size={20} />,
          href: "/analytics",
        },
        {
          name: "Prompts",
          icon: <FileText size={20} />,
          href: "/prompts",
        },
        { name: "Settings", icon: <Settings size={20} />, href: "/settings" },
      ];
    } else {
      // Student view
      return [
        ...baseMenuItems,
        {
          name: "Practice",
          icon: <FileQuestion size={20} />,
          href: "/practice",
        },
        { name: "Progress", icon: <BarChart3 size={20} />, href: "/progress" },
        { name: "Settings", icon: <Settings size={20} />, href: "/settings" },
      ];
    }
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="font-bold text-xl">Question Generator</h1>
      </div>

      {user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}>
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-700 w-full px-3 py-2 rounded-md hover:bg-gray-100 transition-all duration-200">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;