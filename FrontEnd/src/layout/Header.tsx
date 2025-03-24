// src/components/layout/Header.tsx
'use client';

import { Bell, Search, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-3 w-full max-w-md">
        <Search size={20} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Search curricula or questions..." 
          className="border-none outline-none w-full text-sm"
        />
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <User size={16} />
          </div>
          <div className="text-sm">
            <p className="font-medium">Admin User</p>
            <p className="text-gray-500 text-xs">admin@example.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;