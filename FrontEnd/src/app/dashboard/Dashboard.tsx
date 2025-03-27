// src/app/dashboard/Dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import DashboardStatsCards from "./DashboardStatsCards";
import RecentActivity from "./RecentActivity";
import CurriculaGrid from "../curricula/CurriculaGrid";
import { dashboardAPI, questionAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import Link from "next/link";
import { Plus } from "lucide-react";

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
    activeUsers: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get dashboard data based on user role
      let dashboardData;
      if (user.role === "admin") {
        dashboardData = await dashboardAPI.getAdminDashboard();
      } else if (user.role === "teacher") {
        dashboardData = await dashboardAPI.getTeacherDashboard();
      } else {
        dashboardData = await dashboardAPI.getStudentDashboard();
      }

      // Process data for stats
      const totalCurricula = dashboardData.curricula?.length || 0;
      const totalQuestions = dashboardData.questions?.length || 0;

      setStats({
        totalCurricula,
        totalQuestions,
        avgGenerationTime: 1.8, // Placeholder, this isn't in the API yet
        activeUsers:
          dashboardData.stats?.total_users ||
          (user.role === "admin" ? dashboardData.users?.length || 0 : 1),
      });

      // Process recent activity - this would normally come from the dashboard API
      // but for now we'll generate mock data based on what we have
      const mockActivities = generateMockActivities(dashboardData);
      setActivities(mockActivities);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockActivities = (dashboardData: any): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    // Use data from curricula if available
    if (dashboardData.curricula && dashboardData.curricula.length > 0) {
      const randomCurricula = [...dashboardData.curricula]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      randomCurricula.forEach((curriculum: any, index: number) => {
        activities.push({
          id: `activity-${Date.now()}-${index}`,
          action: index === 0 ? "Created new curriculum" : "Updated curriculum",
          curriculum: curriculum.name,
          user: user?.full_name || "User",
          time: `${Math.floor(Math.random() * 12) + 1} ${
            Math.random() > 0.5 ? "hours" : "days"
          } ago`,
        });
      });
    }

    // Use data from questions if available
    if (dashboardData.questions && dashboardData.questions.length > 0) {
      const randomQuestions = [...dashboardData.questions]
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

      randomQuestions.forEach((question: any, index: number) => {
        const questionCount = Math.floor(Math.random() * 40) + 10;
        activities.push({
          id: `activity-${Date.now()}-q-${index}`,
          action: `Generated ${questionCount} questions`,
          curriculum: question.topic?.name || "Various topics",
          user: user?.full_name || "User",
          time: `${Math.floor(Math.random() * 5) + 1} ${
            Math.random() > 0.5 ? "hours" : "days"
          } ago`,
        });
      });
    }

    // Sort by "time" to make it more realistic
    return activities.sort((a, b) => {
      const aTime = a.time.split(" ")[0];
      const bTime = b.time.split(" ")[0];
      return parseInt(aTime) - parseInt(bTime);
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {user?.role === "admin"
            ? "Admin"
            : user?.role === "teacher"
            ? "Teacher"
            : "Student"}{" "}
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome to your question generator dashboard
        </p>
      </div>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 h-24 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-100 rounded-lg"></div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-96 bg-gray-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <DashboardStatsCards
            totalCurricula={stats.totalCurricula}
            totalQuestions={stats.totalQuestions}
            avgGenerationTime={stats.avgGenerationTime}
            activeUsers={stats.activeUsers}
          />

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error}</p>
              <button
                className="mt-2 text-red-700 font-medium underline"
                onClick={fetchDashboardData}>
                Retry
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold">Popular Curricula</h2>
                  <Link
                    href="/curricula"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    View All
                  </Link>
                </div>

                {stats.totalCurricula > 0 ? (
                  <CurriculaGrid limit={4} />
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <div className="mb-4">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      No curricula yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 mb-4">
                      Get started by creating your first curriculum.
                    </p>
                    <Link
                      href="/curricula"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Curriculum
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <RecentActivity activities={activities} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
