// src/app/student/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import Layout from "@/app/layout/Layout";
import { dashboardAPI } from "@/services/api";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Target,
  Award,
  TrendingUp,
  Eye
} from "lucide-react";

import Link from "next/link";

interface Topic {
  id: string;
  name: string;
  question_count: number;
}

interface Question {
  id: string;
  question_text: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: {
    name: string;
  };
}

interface DashboardStats {
  questions_viewed: number;
  topics_viewed: number;
  courses_enrolled: number;
  recent_activity: any[]; // Define proper type if needed
}

interface DashboardData {
  stats: DashboardStats;
  recommended_topics: Topic[];
  recent_questions: Question[];
}

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Explicitly type the error state

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await dashboardAPI.getStudentDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching student dashboard:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <Layout allowedRoles={["student"]}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout allowedRoles={["student"]}>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      </Layout>
    );
  }

  // Use static data if the API doesn't return data yet
  const stats =
    dashboardData?.stats ||
    ({
      questions_viewed: 127,
      topics_viewed: 14,
      courses_enrolled: 3,
      recent_activity: [],
    } as DashboardStats);

  const recommendedTopics =
    dashboardData?.recommended_topics ||
    ([
      { id: "1", name: "Limits and Continuity", question_count: 32 },
      { id: "2", name: "Integration Techniques", question_count: 45 },
      { id: "3", name: "Applications of Derivatives", question_count: 38 },
    ] as Topic[]);

  const recentQuestions =
    dashboardData?.recent_questions ||
    ([
      {
        id: "1",
        question_text: "Calculate the derivative of f(x) = x³ - 6x² + 9x - 5.",
        difficulty: "Medium",
        topic: { name: "Derivatives" },
      },
      {
        id: "2",
        question_text: "Solve the following limit: lim(x→0) (sin(3x)/x)",
        difficulty: "Hard",
        topic: { name: "Limits" },
      },
      {
        id: "3",
        question_text: "Find the indefinite integral of f(x) = 2x + 3.",
        difficulty: "Easy",
        topic: { name: "Integration" },
      },
    ] as Question[]);

  return (
    <Layout allowedRoles={["student"]}>
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <p className="text-gray-600">
            Track your progress and practice new topics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-full">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Questions Completed</p>
                <p className="text-2xl font-bold">{stats.questions_viewed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 text-green-600 p-3 rounded-full">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Topics Studied</p>
                <p className="text-2xl font-bold">{stats.topics_viewed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 text-purple-600 p-3 rounded-full">
                <Award size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Courses Enrolled</p>
                <p className="text-2xl font-bold">{stats.courses_enrolled}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-50 text-yellow-600 p-3 rounded-full">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Current Streak</p>
                <p className="text-2xl font-bold">5 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recommended Topics */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-bold text-lg">Recommended Topics</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedTopics.map((topic: Topic) => (
                    <div
                      key={topic.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                    >
                      <h3 className="font-medium text-gray-900 mb-2">
                        {topic.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {topic.question_count} questions
                        </span>
                        <button className="text-sm text-blue-600 font-medium">
                          Practice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Questions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-bold text-lg">Recent Questions</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {recentQuestions.map((question: Question) => (
                  <div
                    key={question.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">
                          {question.question_text}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-4">
                            Topic: {question.topic.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              question.difficulty === "Easy"
                                ? "bg-green-100 text-green-800"
                                : question.difficulty === "Medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {question.difficulty}
                          </span>
                        </div>
                      </div>
                      <button className="text-blue-600 text-sm font-medium">
                        Retry
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <button className="text-sm font-medium text-blue-600">
                  View all questions
                </button>
                <Link
                  href="/questions"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Eye size={14} /> Browse Question Bank
                </Link>
              </div>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-bold text-lg">Weekly Progress</h2>
              </div>
              <div className="p-6">
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="rounded-full bg-blue-100 p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                      <Target className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-gray-900 font-medium mb-2">
                      Keep up the good work!
                    </p>
                    <p className="text-gray-600 text-sm">
                      You've completed 32 questions this week.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Streak */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-bold text-lg">Study Streak</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">5</div>
                  <div className="text-lg ml-2 text-gray-700">days</div>
                </div>
                <div className="flex justify-between">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <div key={day} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                          day <= 5
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {day}
                      </div>
                      <span className="text-xs text-gray-500">
                        {["M", "T", "W", "T", "F", "S", "S"][day - 1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
