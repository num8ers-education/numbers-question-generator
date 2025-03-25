'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  FileQuestion, 
  Settings, 
  BarChart3, 
  LogOut,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutGrid size={20} />, href: '/' },
    { name: 'Generate Questions', icon: <Sparkles size={20} />, href: '/generate' },
    { name: 'My Questions', icon: <FileQuestion size={20} />, href: '/questions' },
    { name: 'Analytics', icon: <BarChart3 size={20} />, href: '/analytics' },
    { name: 'Settings', icon: <Settings size={20} />, href: '/settings' },
  ];
  
  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="font-bold text-xl">Question Generator</h1>
      </div>
      
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
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center gap-3 text-gray-700 w-full px-3 py-2 rounded-md hover:bg-gray-100 transition-all duration-200">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;