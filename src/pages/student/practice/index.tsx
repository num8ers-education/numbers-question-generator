import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import StudentLayout from '@/components/templates/StudentLayout/StudentLayout';
import PracticeArea from '@/components/organisms/PracticeArea/PracticeArea';
import { Button } from '@/components/atoms/Button/Button';
import { Select } from '@/components/atoms/Select/Select';
import { useAuth } from '@/context/AuthContext';
import { useAI } from '@/context/AIContext';
import courseService from '@/services/courseService';
import { Course, Unit, Topic } from '@/types/course';

const PracticePage: NextPage = () => {
  const { user } = useAuth();
  const { getLearningRecommendations } = useAI();
  const router = useRouter();
  const { topicId } = router.query;
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>(topicId as string || '');
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recommendations, setRecommendations] = useState<{
    weakTopics: Array<{ topicId: string; topicTitle: string; accuracy: number }>;
  } | null>(null);
  
  // Load courses and recommendations
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch courses
        const coursesData = await courseService.getCourses();
        setCourses(coursesData);
        
        // Get AI recommendations for weak topics
        if (user) {
          const aiRecommendations = await getLearningRecommendations();
          setRecommendations(aiRecommendations);
        }
        
        // If topicId is provided in URL, fetch the corresponding course and unit
        if (topicId) {
          // We would need to fetch the topic first to get its unit ID
          // This is a simplified version - in a real app, you'd need proper API endpoints
          const topic = await courseService.getTopicById(topicId as string);
          setSelectedTopic(topicId as string);
          
          if (topic) {
            const unit = await courseService.getUnitById(topic.unitId);
            setSelectedUnit(topic.unitId);
            
            if (unit) {
              setSelectedCourse(unit.courseId);
              // Load units for this course
              const unitsData = await courseService.getCourseUnits(unit.courseId);
              setUnits(unitsData);
              
              // Load topics for this unit
              const topicsData = await courseService.getUnitTopics(unit.unitId);
              setTopics(topicsData);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, [user, getLearningRecommendations, topicId]);
  
  // Load units when course changes
  useEffect(() => {
    const loadUnits = async () => {
      if (!selectedCourse) {
        setUnits([]);
        setSelectedUnit('');
        return;
      }
      
      try {
        const unitData = await courseService.getCourseUnits(selectedCourse);
        setUnits(unitData);
      } catch (error) {
        console.error('Failed to load units:', error);
      }
    };
    
    loadUnits();
  }, [selectedCourse]);
  
  // Load topics when unit changes
  useEffect(() => {
    const loadTopics = async () => {
      if (!selectedUnit) {
        setTopics([]);
        setSelectedTopic('');
        return;
      }
      
      try {
        const topicData = await courseService.getUnitTopics(selectedUnit);
        setTopics(topicData);
      } catch (error) {
        console.error('Failed to load topics:', error);
      }
    };
    
    loadTopics();
  }, [selectedUnit]);
  
  // Update URL when topic changes
  useEffect(() => {
    if (selectedTopic) {
      router.push({
        pathname: router.pathname,
        query: { topicId: selectedTopic },
      }, undefined, { shallow: true });
    } else if (topicId && !selectedTopic) {
      router.push({
        pathname: router.pathname,
      }, undefined, { shallow: true });
    }
  }, [selectedTopic, router, topicId]);
  
  return (
    <StudentLayout title="Practice Questions">
      <div className="space-y-6">
        {/* Topic Selection */}
        <div className="bg-white shadow-card rounded-card p-6">
          <h2 className="text-lg font-medium mb-4">Practice Area</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </Select>
            
            <Select
              label="Unit"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              disabled={!selectedCourse}
            >
              <option value="">Select a unit</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.title}
                </option>
              ))}
            </Select>
            
            <Select
              label="Topic"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={!selectedUnit}
            >
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </Select>
          </div>
        </div>
        
        {/* AI Recommendations (if no topic selected) */}
        {!selectedTopic && recommendations && (
          <div className="bg-white shadow-card rounded-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Recommended Topics</h2>
              <div className="flex items-center text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Generated
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.weakTopics.map((topic) => (
                <div
                  key={topic.topicId}
                  className="border border-neutral-200 rounded-md p-4 hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedTopic(topic.topicId)}
                >
                  <h3 className="font-medium text-sm mb-2">{topic.topicTitle}</h3>
                  <div className="flex items-center">
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${topic.accuracy}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs text-neutral-500">{topic.accuracy}%</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    Current accuracy - click to practice
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Practice Area */}
        {selectedTopic ? (
          <PracticeArea topicId={selectedTopic} />
        ) : (
          <div className="bg-white shadow-card rounded-card p-6 flex flex-col items-center justify-center py-12">
            <div className="text-center max-w-md">
              <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-neutral-900">
                Select a topic to practice
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Choose a topic from the dropdown above or select one of our AI-recommended topics based on your performance.
              </p>
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (recommendations && recommendations.weakTopics.length > 0) {
                      setSelectedTopic(recommendations.weakTopics[0].topicId);
                    }
                  }}
                  disabled={!recommendations || recommendations.weakTopics.length === 0}
                >
                  Start with recommended topic
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default PracticePage;