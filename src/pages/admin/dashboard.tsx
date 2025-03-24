import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/templates/AdminLayout/AdminLayout';
import { Button } from '@/components/atoms/Button/Button';
import { Badge } from '@/components/atoms/Badge/Badge';
import { useAuth } from '@/context/AuthContext';
import courseService from '@/services/courseService';
import questionService from '@/services/questionService';

const AdminDashboard: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalUnits: 0,
    totalTopics: 0,
    totalQuestions: 0,
    totalStudents: 0,
    aiGeneratedQuestions: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // This would be replaced with actual API calls in a real application
        // For now, we'll use mock data

        // Mock stats data
        setStats({
          totalCourses: 8,
          totalUnits: 24,
          totalTopics: 96,
          totalQuestions: 560,
          totalStudents: 1250,
          aiGeneratedQuestions: 380,
        });
        
        // Mock recent activity
        setRecentActivity([
          {
            id: '1',
            type: 'question_generated',
            count: 15,
            topic: 'Introduction to Algorithms',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            type: 'student_enrolled',
            student: 'Alex Johnson',
            course: 'Data Structures and Algorithms',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            type: 'course_created',
            course: 'Advanced Python Programming',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '4',
            type: 'question_generated',
            count: 25,
            topic: 'Python Data Types',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
        
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return `${diffSec} seconds ago`;
    
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    
    const diffMonth = Math.floor(diffDay / 30);
    return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`;
  };
  
  const renderActivityIcon = (type: string) => {
    switch (type) {
      case 'question_generated':
        return (
          <div className="rounded-full bg-primary-100 p-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'student_enrolled':
        return (
          <div className="rounded-full bg-success-100 p-2">
            <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      case 'course_created':
        return (
          <div className="rounded-full bg-warning-100 p-2">
            <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="rounded-full bg-neutral-100 p-2">
            <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };
  
  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Section */}
        <div className="lg:col-span-3 bg-white shadow-card rounded-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Welcome, {user?.firstName}!
              </h2>
              <p className="text-neutral-500 mt-1">
                Here's what's happening with your educational platform
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/curriculum/courses')}
              >
                Manage Courses
              </Button>
              <Button
                onClick={() => router.push('/admin/questions/generate')}
                rightIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Generate Questions
              </Button>
            </div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {isLoading ? (
            // Loading skeletons
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white shadow-card rounded-card p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                  <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="bg-white shadow-card rounded-card p-4">
                <p className="text-sm text-neutral-500">Total Courses</p>
                <p className="text-2xl font-semibold mt-1">{stats.totalCourses}</p>
              </div>
              <div className="bg-white shadow-card rounded-card p-4">
                <p className="text-sm text-neutral-500">Total Units</p>
                <p className="text-2xl font-semibold mt-1">{stats.totalUnits}</p>
              </div>
              <div className="bg-white shadow-card rounded-card p-4">
                <p className="text-sm text-neutral-500">Total Topics</p>
                <p className="text-2xl font-semibold mt-1">{stats.totalTopics}</p>
              </div>
              <div className="bg-white shadow-card rounded-card p-4">
                <p className="text-sm text-neutral-500">Total Questions</p>
                <p className="text-2xl font-semibold mt-1">{stats.totalQuestions}</p>
              </div>
              <div className="bg-white shadow-card rounded-card p-4">
                <p className="text-sm text-neutral-500">AI Generated</p>
                <p className="text-2xl font-semibold mt-1">{stats.aiGeneratedQuestions}</p>
              </div>
              <div className="bg-white shadow-card rounded-card p-4">
                <p className="text-sm text-neutral-500">Total Students</p>
                <p className="text-2xl font-semibold mt-1">{stats.totalStudents}</p>
              </div>
            </>
          )}
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white shadow-card rounded-card p-6">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/admin/curriculum/courses/new"
                className="flex flex-col items-center p-4 border border-neutral-200 rounded-md hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <svg className="w-8 h-8 text-primary-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm font-medium">Add Course</span>
              </Link>
              
              <Link
                href="/admin/questions/generate"
                className="flex flex-col items-center p-4 border border-neutral-200 rounded-md hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <svg className="w-8 h-8 text-primary-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Generate Questions</span>
              </Link>
              
              <Link
                href="/admin/users/new"
                className="flex flex-col items-center p-4 border border-neutral-200 rounded-md hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <svg className="w-8 h-8 text-primary-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="text-sm font-medium">Add User</span>
              </Link>
              
              <Link
                href="/admin/analytics"
                className="flex flex-col items-center p-4 border border-neutral-200 rounded-md hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <svg className="w-8 h-8 text-primary-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm font-medium">View Analytics</span>
              </Link>
            </div>
          </div>
          
          {/* AI System Overview */}
          <div className="bg-white shadow-card rounded-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">AI System Overview</h3>
              <Badge variant="primary">
                AI Powered
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-md">
                <div className="flex items-center">
                  <div className="rounded-full bg-primary-100 p-2 mr-3">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">AI Question Generation</h4>
                    <p className="text-sm text-neutral-500">Auto-generate questions for your curriculum</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-neutral-600">
                    {stats.aiGeneratedQuestions} questions generated
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-md">
                <div className="flex items-center">
                  <div className="rounded-full bg-primary-100 p-2 mr-3">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">AI Student Assistance</h4>
                    <p className="text-sm text-neutral-500">Personalized help and feedback for students</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-neutral-600">
                    Active
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-md">
                <div className="flex items-center">
                  <div className="rounded-full bg-primary-100 p-2 mr-3">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">AI Analytics & Recommendations</h4>
                    <p className="text-sm text-neutral-500">Insights and personalized learning paths</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-neutral-600">
                    Processing data
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <Link 
                  href="/admin/settings/ai"
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                >
                  Configure AI Settings
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Recent Activity */}
          <div className="bg-white shadow-card rounded-card p-6">
            <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
            
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex space-x-3">
                    <div className="rounded-full bg-neutral-200 h-8 w-8"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-neutral-500">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex space-x-3">
                    {renderActivityIcon(activity.type)}
                    <div>
                      <p className="text-sm">
                        {activity.type === 'question_generated' && (
                          <>Generated <span className="font-medium">{activity.count} questions</span> for {activity.topic}</>
                        )}
                        {activity.type === 'student_enrolled' && (
                          <><span className="font-medium">{activity.student}</span> enrolled in {activity.course}</>
                        )}
                        {activity.type === 'course_created' && (
                          <>Created course <span className="font-medium">{activity.course}</span></>
                        )}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="pt-2">
                  <Link 
                    href="/admin/activity"
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    View All Activity
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* System Status */}
          <div className="bg-white shadow-card rounded-card p-6">
            <h3 className="text-lg font-medium mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">API Service</span>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Database</span>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">AI Service</span>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Storage</span>
                <Badge variant="success">Operational</Badge>
              </div>
              
              <div className="pt-2">
                <Link 
                  href="/admin/settings/system"
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                >
                  System Settings
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;