"use client";

import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function QuestionGeneratorPage() {
  const params = useParams();
  
  // Extract curriculum, course, and unit IDs directly from URL params
  const curriculumId = params.curriculumId;
  const courseId = params.courseId;
  const unitId = params.unitId;
  
  // In a real application, you would fetch the actual data here:
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       // Example API call
  //       const response = await fetch(`/api/unit-details?curriculumId=${curriculumId}&courseId=${courseId}&unitId=${unitId}`);
  //       const data = await response.json();
  //       // Set state with fetched data
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };
  //   
  //   fetchData();
  // }, [curriculumId, courseId, unitId]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="bg-blue-600 text-white px-6 py-4">
            <div className="flex items-center mb-2">
              <Link
                href="/generate"
                className="mr-4 p-2 rounded-full hover:bg-blue-700 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold">Question Generator</h1>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-6 border-b pb-2">Selected Content</h2>
              
              <div className="space-y-4">
                <div>
                  <span className="text-gray-500 block">Curriculum ID:</span>
                  <span className="font-medium text-lg">{curriculumId}</span>
                </div>
                
                <div>
                  <span className="text-gray-500 block">Course ID:</span>
                  <span className="font-medium text-lg">{courseId}</span>
                </div>
                
                <div>
                  <span className="text-gray-500 block">Unit ID:</span>
                  <span className="font-medium text-lg">{unitId}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-center text-blue-800">
                This is a placeholder for the question generator interface.
                In a real application, you would fetch the complete details
                from your backend using the IDs above and display the actual names
                and other relevant information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}