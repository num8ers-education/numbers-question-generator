// src/app/layout/Header.tsx
'use client';

import { useState } from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would search through questions/curricula
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <form onSubmit={handleSearch} className="flex items-center gap-3 w-full max-w-md">
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
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <User size={16} />
            </div>
            <div className="text-sm">
              <p className="font-medium">{user.full_name}</p>
              <p className="text-gray-500 text-xs">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;