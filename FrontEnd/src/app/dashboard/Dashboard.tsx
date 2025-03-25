// src/app/dashboard/Dashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import DashboardStatsCards from './DashboardStatsCards';
import RecentActivity from './RecentActivity';
import CurriculaGrid from '../curricula/CurriculaGrid';
import { dashboardAPI, questionAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalCurricula: number;
  totalQuestions: number;
  avgGenerationTime: number;
  activeUsers: number;
}

interface ActivityItem {
  id: string;
  action: string;
  curriculum: string;
  user: string;
  time: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalCurricula: 0,
    totalQuestions: 0,
    avgGenerationTime: 0,
    activeUsers: 0
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Get dashboard data based on user role
        let dashboardData;
        if (user.role === 'admin') {
          dashboardData = await dashboardAPI.getAdminDashboard();
        } else if (user.role === 'teacher') {
          dashboardData = await dashboardAPI.getTeacherDashboard();
        } else {
          dashboardData = await dashboardAPI.getStudentDashboard();
        }

        // Get question stats
        const questions = await questionAPI.getAllQuestions();

        // Process data for stats
        setStats({
          totalCurricula: dashboardData.stats?.total_curricula || 0,
          totalQuestions: questions.length || 0,
          avgGenerationTime: 1.8, // Placeholder, this isn't in the API
          activeUsers: dashboardData.stats?.total_users || 0
        });

        // Process recent activity - this would come from the dashboard API
        // but for now we'll use placeholder data
        const mockActivities = [
          { 
            id: '1', 
            action: 'Generated 45 questions', 
            curriculum: 'AP Calculus AB', 
            user: 'John Smith', 
            time: '2 hours ago' 
          },
          { 
            id: '2', 
            action: 'Added new curriculum', 
            curriculum: 'IB Computer Science HL', 
            user: 'Emma Johnson', 
            time: '5 hours ago' 
          },
          { 
            id: '3', 
            action: 'Updated question bank', 
            curriculum: 'A-Level Physics', 
            user: 'Michael Brown', 
            time: '1 day ago' 
          },
          { 
            id: '4', 
            action: 'Generated 32 questions', 
            curriculum: 'AP Biology', 
            user: 'Sarah Davis', 
            time: '1 day ago' 
          }
        ];
        setActivities(mockActivities);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome to your question generator dashboard</p>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="bg-white rounded-lg p-6 h-24">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <DashboardStatsCards 
          totalCurricula={stats.totalCurricula}
          totalQuestions={stats.totalQuestions}
          avgGenerationTime={stats.avgGenerationTime}
          activeUsers={stats.activeUsers}
        />
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Popular Curricula</h2>
              <a href="/curricula" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                View All
              </a>
            </div>
            
            <CurriculaGrid />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  );
}