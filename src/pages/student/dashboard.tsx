import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import StudentLayout from '@/components/templates/StudentLayout/StudentLayout';
import { Button } from '@/components/atoms/Button/Button';
import { useAuth } from '@/context/AuthContext';
import { useAI } from '@/context/AIContext';
import courseService from '@/services/courseService';
import questionService from '@/services/questionService';
import { Course } from '@/types/course';

const StudentDashboard: NextPage = () => {
  const { user } = useAuth();
  const { getLearningRecommendations } = useAI();
  const router = useRouter();
  
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<{
    weakTopics: Array<{ topicId: string; topicTitle: string; accuracy: number }>;
    recommendedQuestions: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch enrolled courses
        if (user) {
          const courses = await courseService.getStudentCourses(user.id);
          setEnrolledCourses(courses);
        }
        
        // Get AI recommendations
        const aiRecommendations = await getLearningRecommendations();
        setRecommendations(aiRecommendations);
        
        // Fetch recent activity (mock data for demonstration)
        setRecentActivity([
          {
            id: '1',
            type: 'practice',
            topic: 'Introduction to Variables',
            course: 'Programming Fundamentals',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            details: {
              questionsAttempted: 10,
              correctAnswers: 8
            }
          },
          {
            id: '2',
            type: 'enrollment',
            course: 'Data Structures',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            type: 'achievement',
            achievement: 'Fast Learner',
            course: 'Programming Fundamentals',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ]);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, getLearningRecommendations]);
  
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
      case 'practice':
        return (
          <div className="rounded-full bg-primary-100 p-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
        );
      case 'enrollment':
        return (
          <div className="rounded-full bg-success-100 p-2">
            <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      case 'achievement':
        return (
          <div className="rounded-full bg-warning-100 p-2">
            <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
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
    <StudentLayout title="Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Section */}
        <div className="lg:col-span-3 bg-white shadow-card rounded-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Welcome back, {user?.firstName}!
              </h2>
              <p className="text-neutral-500 mt-1">
                Continue your learning journey
              </p>
            </div>
            <Button
              onClick={() => router.push('/student/practice')}
              rightIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              }
            >
              Start Practicing
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Courses */}
          <div className="bg-white shadow-card rounded-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">My Courses</h3>
              <Link
                href="/student/courses"
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
              >
                View All
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-3">
                    <div className="rounded-md bg-neutral-200 h-12 w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-500 mb-4">You are not enrolled in any courses yet</p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/student/courses')}
                >
                  Browse Courses
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {enrolledCourses.slice(0, 3).map((course) => (
                  <div
                    key={course.id}
                    className="p-3 hover:bg-neutral-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/student/courses/${course.id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 h-12 w-12 rounded-md bg-primary-100 flex items-center justify-center text-primary-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-neutral-900">{course.title}</h4>
                        <p className="text-xs text-neutral-500 mt-1">
                          Continue learning
                        </p>
                      </div>
                      <div>
                        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* AI Recommendations */}
          <div className="bg-white shadow-card rounded-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Recommended Practice</h3>
              <div className="flex items-center text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Generated
              </div>
            </div>
            
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-3 rounded-md border border-neutral-200">
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recommendations?.weakTopics.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-neutral-500 mb-2">Not enough practice data to generate recommendations</p>
                <p className="text-sm text-neutral-400">
                  Practice more to get personalized suggestions
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations?.weakTopics.slice(0, 2).map((topic) => (
                  <div
                    key={topic.topicId}
                    className="p-3 rounded-md border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/student/practice?topicId=${topic.topicId}`)}
                  >
                    <h4 className="font-medium text-sm">{topic.topicTitle}</h4>
                    <div className="flex items-center mt-2">
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${topic.accuracy}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-neutral-500">{topic.accuracy}%</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                      Focus on improving this topic
                    </p>
                  </div>
                ))}
                
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/student/practice')}
                    size="sm"
                  >
                    View All Recommendations
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Recent Activity */}
          <div className="bg-white shadow-card rounded-card p-6">
            <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
            
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
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
                        {activity.type === 'practice' && (
                          <>Practiced <span className="font-medium">{activity.topic}</span></>
                        )}
                        {activity.type === 'enrollment' && (
                          <>Enrolled in <span className="font-medium">{activity.course}</span></>
                        )}
                        {activity.type === 'achievement' && (
                          <>Earned <span className="font-medium">{activity.achievement}</span> badge</>
                        )}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Quick Links */}
          <div className="bg-white shadow-card rounded-card p-6">
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link
                href="/student/practice"
                className="flex items-center p-2 rounded-md hover:bg-neutral-50"
              >
                <svg className="w-5 h-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Practice Questions
              </Link>
              <Link
                href="/student/chat"
                className="flex items-center p-2 rounded-md hover:bg-neutral-50"
              >
                <svg className="w-5 h-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                AI Assistant
              </Link>
              <Link
                href="/student/progress"
                className="flex items-center p-2 rounded-md hover:bg-neutral-50"
              >
                <svg className="w-5 h-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View Progress
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;