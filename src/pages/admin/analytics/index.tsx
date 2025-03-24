import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import AdminLayout from '@/components/templates/AdminLayout/AdminLayout';
import { Button } from '@/components/atoms/Button/Button';
import { Select } from '@/components/atoms/Select/Select';
import { Badge } from '@/components/atoms/Badge/Badge';
import courseService from '@/services/courseService';
import { Course } from '@/types/course';

// Mock analytics data
const generateMockData = () => {
  // Mock performance data by question difficulty
  const difficultyData = [
    { difficulty: 'Easy', correctPercentage: 85, totalAttempts: 428 },
    { difficulty: 'Medium', correctPercentage: 62, totalAttempts: 356 },
    { difficulty: 'Hard', correctPercentage: 41, totalAttempts: 215 },
  ];
  
  // Mock student activity by day for the past week
  const today = new Date();
  const activityData = Array(7).fill(0).map((_, index) => {
    const date = new Date();
    date.setDate(today.getDate() - (6 - index));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      questionsAttempted: Math.floor(Math.random() * 300) + 100,
      uniqueStudents: Math.floor(Math.random() * 40) + 20,
    };
  });
  
  // Mock top performing topics
  const topTopics = [
    { id: '1', name: 'Variables and Data Types', accuracy: 92, questionsAttempted: 245 },
    { id: '2', name: 'Control Flow', accuracy: 87, questionsAttempted: 198 },
    { id: '3', name: 'Functions', accuracy: 85, questionsAttempted: 176 },
    { id: '4', name: 'Error Handling', accuracy: 83, questionsAttempted: 142 },
    { id: '5', name: 'Object-Oriented Programming', accuracy: 78, questionsAttempted: 204 },
  ];
  
  // Mock struggling topics
  const strugglingTopics = [
    { id: '6', name: 'Recursion', accuracy: 38, questionsAttempted: 112 },
    { id: '7', name: 'Pointers', accuracy: 42, questionsAttempted: 98 },
    { id: '8', name: 'Memory Management', accuracy: 45, questionsAttempted: 87 },
    { id: '9', name: 'Multithreading', accuracy: 47, questionsAttempted: 104 },
    { id: '10', name: 'Complex Algorithms', accuracy: 51, questionsAttempted: 145 },
  ];
  
  return {
    summary: {
      totalStudents: 156,
      totalQuestions: 1250,
      totalQuestionsAttempted: 8954,
      averageAccuracy: 68,
      aiGeneratedPercentage: 74,
    },
    difficultyData,
    activityData,
    topTopics,
    strugglingTopics,
  };
};

const AnalyticsDashboardPage: NextPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Fetch courses and analytics data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch courses
        const coursesData = await courseService.getCourses();
        setCourses(coursesData);
        
        // Mock analytics data
        const mockData = generateMockData();
        setAnalyticsData(mockData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Update analytics data when filters change
  useEffect(() => {
    // In a real app, we would fetch new data based on the selected filters
    // For now, we'll just regenerate the mock data with slight variations
    if (analyticsData) {
      const mockData = generateMockData();
      
      // Add some variations based on selected course and period
      if (selectedCourse !== 'all') {
        // Adjust data for specific course (simulate)
        mockData.summary.totalStudents = Math.floor(mockData.summary.totalStudents * 0.7);
        mockData.summary.totalQuestionsAttempted = Math.floor(mockData.summary.totalQuestionsAttempted * 0.8);
      }
      
      if (selectedPeriod === 'month') {
        // Increase numbers for longer period
        mockData.summary.totalQuestionsAttempted = Math.floor(mockData.summary.totalQuestionsAttempted * 4.2);
      } else if (selectedPeriod === 'year') {
        // Further increase for yearly data
        mockData.summary.totalQuestionsAttempted = Math.floor(mockData.summary.totalQuestionsAttempted * 12.5);
      }
      
      setAnalyticsData(mockData);
    }
  }, [selectedCourse, selectedPeriod]);
  
  // Generate a percentage bar
  const PercentageBar = ({ percentage, color }: { percentage: number, color: string }) => (
    <div className="relative w-full h-4 bg-neutral-200 rounded-full overflow-hidden">
      <div
        className={`absolute top-0 left-0 h-full ${color}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
  
  return (
    <AdminLayout title="Analytics Dashboard">
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white shadow-card rounded-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <h2 className="text-lg font-medium">Analytics Overview</h2>
            
            <div className="flex space-x-4">
              <div className="w-48">
                <Select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="all">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </Select>
              </div>
              
              <div className="w-48">
                <Select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last 12 Months</option>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-white shadow-card rounded-card p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                  <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white shadow-card rounded-card p-4">
                <p className="text-sm text-neutral-500">Total Students</p>
                <p className="text-2xl font-semibold mt-1">{analyticsData.summary.totalStudents}</p>
              </div>
              
              <div className="bg-white shadow-card rounded-card p-4">
                <p className="text-sm text-neutral-500">Total Questions</p>
                <p className="text-2xl font-semibold mt-1">{analyticsData.summary.totalQuestions}</p>
              </div>
              
              <div className="bg-white shadow-card rounded-card p-4">
                <p className="text-sm text-neutral-500">Questions Attempted</p>
                <p className="text-2xl font-semibold mt-1">{analyticsData.summary.totalQuestionsAttempted.toLocaleString()}</p>
              </div>
              
              <div className="bg-white shadow-card rounded-card p-4">
                <p className="text-sm text-neutral-500">Average Accuracy</p>
                <p className="text-2xl font-semibold mt-1">{analyticsData.summary.averageAccuracy}%</p>
              </div>
              
              <div className="bg-white shadow-card rounded-card p-4">
                <p className="text-sm text-neutral-500">AI Generated Questions</p>
                <p className="text-2xl font-semibold mt-1">{analyticsData.summary.aiGeneratedPercentage}%</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance by Difficulty */}
              <div className="bg-white shadow-card rounded-card p-6">
                <h3 className="text-lg font-medium mb-4">Performance by Difficulty</h3>
                <div className="space-y-6">
                  {analyticsData.difficultyData.map((data: any) => (
                    <div key={data.difficulty} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Badge
                            variant={
                              data.difficulty === 'Easy' ? 'success' :
                              data.difficulty === 'Medium' ? 'warning' : 'danger'
                            }
                          >
                            {data.difficulty}
                          </Badge>
                          <span className="ml-2 text-sm text-neutral-500">
                            {data.totalAttempts} attempts
                          </span>
                        </div>
                        <span className="font-medium">{data.correctPercentage}% correct</span>
                      </div>
                      <PercentageBar
                        percentage={data.correctPercentage}
                        color={
                          data.difficulty === 'Easy' ? 'bg-success-500' :
                          data.difficulty === 'Medium' ? 'bg-warning-500' : 'bg-danger-500'
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Student Activity */}
              <div className="bg-white shadow-card rounded-card p-6">
                <h3 className="text-lg font-medium mb-4">Student Activity</h3>
                <div className="h-64 flex items-end space-x-2">
                  {analyticsData.activityData.map((data: any, index: number) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center justify-end"
                    >
                      <div className="text-xs text-neutral-500 mb-1">{data.uniqueStudents}</div>
                      <div
                        className="w-full bg-primary-500 rounded-t"
                        style={{ height: `${(data.uniqueStudents / 50) * 100}%` }}
                      ></div>
                      <div className="text-xs text-neutral-500 mt-1 truncate w-full text-center">
                        {data.date}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-sm text-neutral-500">
                  <span className="inline-block w-4 h-2 bg-primary-500 rounded mr-1"></span>
                  Unique Students
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing Topics */}
              <div className="bg-white shadow-card rounded-card p-6">
                <h3 className="text-lg font-medium mb-4">Top Performing Topics</h3>
                <div className="space-y-4">
                  {analyticsData.topTopics.map((topic: any) => (
                    <div key={topic.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">{topic.name}</div>
                        <div className="text-sm">
                          <span className="font-medium text-success-600">{topic.accuracy}%</span>
                          <span className="text-neutral-500 text-xs ml-1">
                            ({topic.questionsAttempted} attempts)
                          </span>
                        </div>
                      </div>
                      <PercentageBar percentage={topic.accuracy} color="bg-success-500" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Struggling Topics */}
              <div className="bg-white shadow-card rounded-card p-6">
                <h3 className="text-lg font-medium mb-4">Topics Needing Improvement</h3>
                <div className="space-y-4">
                  {analyticsData.strugglingTopics.map((topic: any) => (
                    <div key={topic.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">{topic.name}</div>
                        <div className="text-sm">
                          <span className="font-medium text-danger-600">{topic.accuracy}%</span>
                          <span className="text-neutral-500 text-xs ml-1">
                            ({topic.questionsAttempted} attempts)
                          </span>
                        </div>
                      </div>
                      <PercentageBar percentage={topic.accuracy} color="bg-danger-500" />
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={() => alert('This would navigate to generate questions for these struggling topics')}
                  >
                    Generate Questions for Struggling Topics
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AnalyticsDashboardPage;