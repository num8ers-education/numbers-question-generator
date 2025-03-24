from typing import Dict, List, Any, Optional
from bson import ObjectId
from datetime import datetime, timedelta

from app.config.db import (
    questions_collection, topics_collection, units_collection,
    courses_collection, subjects_collection, curriculum_collection,
    users_collection
)
from app.models.student import StudentStats, StudentDashboard

class StudentService:
    """Service for student-specific business logic"""
    
    @staticmethod
    async def get_student_dashboard(student_id: str) -> Dict[str, Any]:
        """Get student dashboard data including available questions and recommended topics"""
        
        # Validate student exists
        student = users_collection.find_one({"_id": ObjectId(student_id)})
        if not student:
            raise ValueError(f"Student with ID {student_id} not found")
        
        # For demonstration, we'll count questions available to the student
        questions_count = questions_collection.count_documents({})
        
        # Get count of topics with questions
        topic_ids = set()
        for question in questions_collection.find({}, {"topic_id": 1}):
            topic_ids.add(question["topic_id"])
        
        topics_count = len(topic_ids)
        
        # Get count of courses with topics that have questions
        course_ids = set()
        for topic_id in topic_ids:
            try:
                topic = topics_collection.find_one({"_id": ObjectId(topic_id)})
                if topic:
                    unit = units_collection.find_one({"_id": ObjectId(topic["unit_id"])})
                    if unit:
                        course_ids.add(unit["course_id"])
            except:
                pass
        
        courses_count = len(course_ids)
        
        # Mock recent activity (in a real app, this would track student interactions)
        recent_activity = []
        
        # Get recent questions (using the most recently created questions)
        recent_questions_cursor = questions_collection.find({}).sort("created_at", -1).limit(5)
        
        recent_questions = []
        for question in recent_questions_cursor:
            # Get topic info
            topic_info = None
            try:
                topic = topics_collection.find_one({"_id": ObjectId(question["topic_id"])})
                if topic:
                    topic_info = {
                        "id": str(topic["_id"]),
                        "name": topic["name"]
                    }
            except:
                pass
            
            recent_questions.append({
                "id": str(question["_id"]),
                "question_text": question["question_text"],
                "question_type": question["question_type"],
                "difficulty": question["difficulty"],
                "created_at": question["created_at"],
                "topic": topic_info
            })
        
        # Get recommended topics (topics with most questions)
        pipeline = [
            {"$group": {"_id": "$topic_id", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        
        topic_counts = list(questions_collection.aggregate(pipeline))
        recommended_topics = []
        
        for topic_result in topic_counts:
            topic_id = topic_result["_id"]
            question_count = topic_result["count"]
            
            # Get topic info
            try:
                topic = topics_collection.find_one({"_id": ObjectId(topic_id)})
                if topic:
                    # Try to get unit and course info
                    unit_info = None
                    try:
                        unit = units_collection.find_one({"_id": ObjectId(topic["unit_id"])})
                        if unit:
                            unit_info = {
                                "id": str(unit["_id"]),
                                "name": unit["name"]
                            }
                            
                            # Try to get course info
                            try:
                                course = courses_collection.find_one({"_id": ObjectId(unit["course_id"])})
                                if course:
                                    unit_info["course"] = {
                                        "id": str(course["_id"]),
                                        "name": course["name"]
                                    }
                            except:
                                pass
                    except:
                        pass
                    
                    recommended_topics.append({
                        "id": str(topic["_id"]),
                        "name": topic["name"],
                        "description": topic.get("description", ""),
                        "question_count": question_count,
                        "unit": unit_info
                    })
            except:
                pass
        
        # Build stats object
        stats = StudentStats(
            questions_viewed=0,  # Mock value, would be tracked in a real app
            topics_viewed=0,     # Mock value, would be tracked in a real app
            courses_enrolled=0,  # Mock value, would be tracked in a real app
            recent_activity=recent_activity
        )
        
        # Build dashboard
        dashboard = StudentDashboard(
            stats=stats,
            recent_questions=recent_questions,
            recommended_topics=recommended_topics
        )
        
        return dashboard.dict()
    
    @staticmethod
    async def get_available_question_sets() -> List[Dict[str, Any]]:
        """Get sets of questions available to students grouped by curriculum structure"""
        
        # Get all curricula
        curricula = list(curriculum_collection.find())
        
        result = []
        for curriculum in curricula:
            curriculum_data = {
                "id": str(curriculum["_id"]),
                "name": curriculum["name"],
                "description": curriculum.get("description", ""),
                "subjects": []
            }
            
            # Get subjects for this curriculum
            subjects = list(subjects_collection.find({"curriculum_id": str(curriculum["_id"])}))
            
            for subject in subjects:
                subject_data = {
                    "id": str(subject["_id"]),
                    "name": subject["name"],
                    "description": subject.get("description", ""),
                    "courses": []
                }
                
                # Get courses for this subject
                courses = list(courses_collection.find({"subject_id": str(subject["_id"])}))
                
                for course in courses:
                    course_data = {
                        "id": str(course["_id"]),
                        "name": course["name"],
                        "description": course.get("description", ""),
                        "units": []
                    }
                    
                    # Get units for this course
                    units = list(units_collection.find({"course_id": str(course["_id"])}))
                    
                    for unit in units:
                        unit_data = {
                            "id": str(unit["_id"]),
                            "name": unit["name"],
                            "description": unit.get("description", ""),
                            "topics": []
                        }
                        
                        # Get topics for this unit
                        topics = list(topics_collection.find({"unit_id": str(unit["_id"])}))
                        
                        for topic in topics:
                            # Get question count for this topic
                            question_count = questions_collection.count_documents({"topic_id": str(topic["_id"])})
                            
                            if question_count > 0:  # Only include topics with questions
                                topic_data = {
                                    "id": str(topic["_id"]),
                                    "name": topic["name"],
                                    "description": topic.get("description", ""),
                                    "question_count": question_count
                                }
                                
                                unit_data["topics"].append(topic_data)
                        
                        if unit_data["topics"]:  # Only include units with topics that have questions
                            course_data["units"].append(unit_data)
                    
                    if course_data["units"]:  # Only include courses with units that have topics with questions
                        subject_data["courses"].append(course_data)
                
                if subject_data["courses"]:  # Only include subjects with courses that have units with topics with questions
                    curriculum_data["subjects"].append(subject_data)
            
            if curriculum_data["subjects"]:  # Only include curricula with subjects that have content
                result.append(curriculum_data)
        
        return result
    
    @staticmethod
    async def get_topic_questions(topic_id: str) -> Dict[str, Any]:
        """Get all questions for a specific topic with metadata"""
        
        # Verify topic exists
        topic = topics_collection.find_one({"_id": ObjectId(topic_id)})
        if not topic:
            raise ValueError(f"Topic with ID {topic_id} not found")
        
        # Get all questions for this topic
        questions_cursor = questions_collection.find({"topic_id": topic_id})
        
        questions = []
        for question in questions_cursor:
            questions.append({
                "id": str(question["_id"]),
                "question_text": question["question_text"],
                "question_type": question["question_type"],
                "difficulty": question["difficulty"],
                "options": question["options"],
                "created_at": question["created_at"]
            })
        
        # Group questions by type
        questions_by_type = {}
        for question in questions:
            q_type = question["question_type"]
            if q_type not in questions_by_type:
                questions_by_type[q_type] = []
            questions_by_type[q_type].append(question)
        
        # Group questions by difficulty
        questions_by_difficulty = {}
        for question in questions:
            difficulty = question["difficulty"]
            if difficulty not in questions_by_difficulty:
                questions_by_difficulty[difficulty] = []
            questions_by_difficulty[difficulty].append(question)
        
        # Get topic hierarchy info
        topic_info = {
            "id": str(topic["_id"]),
            "name": topic["name"],
            "description": topic.get("description", "")
        }
        
        try:
            # Get hierarchy info
            unit = units_collection.find_one({"_id": ObjectId(topic["unit_id"])})
            if unit:
                topic_info["unit"] = {
                    "id": str(unit["_id"]),
                    "name": unit["name"]
                }
                
                course = courses_collection.find_one({"_id": ObjectId(unit["course_id"])})
                if course:
                    topic_info["unit"]["course"] = {
                        "id": str(course["_id"]),
                        "name": course["name"]
                    }
                    
                    subject = subjects_collection.find_one({"_id": ObjectId(course["subject_id"])})
                    if subject:
                        topic_info["unit"]["course"]["subject"] = {
                            "id": str(subject["_id"]),
                            "name": subject["name"]
                        }
                        
                        curriculum = curriculum_collection.find_one({"_id": ObjectId(subject["curriculum_id"])})
                        if curriculum:
                            topic_info["unit"]["course"]["subject"]["curriculum"] = {
                                "id": str(curriculum["_id"]),
                                "name": curriculum["name"]
                            }
        except:
            # If we can't get the full path, just use what we have
            pass
        
        return {
            "topic": topic_info,
            "question_count": len(questions),
            "questions": questions,
            "by_type": questions_by_type,
            "by_difficulty": questions_by_difficulty
        }
    
    @staticmethod
    async def generate_practice_quiz(
        topic_ids: List[str],
        question_count: int = 10,
        difficulty: Optional[str] = None,
        question_types: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Generate a practice quiz from specified topics with optional filters"""
        
        # Build the filter
        filter_query = {"topic_id": {"$in": topic_ids}}
        
        if difficulty:
            filter_query["difficulty"] = difficulty
        
        if question_types:
            filter_query["question_type"] = {"$in": question_types}
        
        # Use aggregation to get a random sample of questions
        pipeline = [
            {"$match": filter_query},
            {"$sample": {"size": question_count}}
        ]
        
        questions_cursor = questions_collection.aggregate(pipeline)
        
        # Format questions for the quiz
        quiz_questions = []
        for question in questions_cursor:
            # Get topic info
            topic_info = None
            try:
                topic = topics_collection.find_one({"_id": ObjectId(question["topic_id"])})
                if topic:
                    topic_info = {
                        "id": str(topic["_id"]),
                        "name": topic["name"]
                    }
            except:
                pass
            
            quiz_questions.append({
                "id": str(question["_id"]),
                "question_text": question["question_text"],
                "question_type": question["question_type"],
                "difficulty": question["difficulty"],
                "options": question["options"],
                "topic": topic_info
            })
        
        # Get topic names
        topic_names = []
        for topic_id in topic_ids:
            try:
                topic = topics_collection.find_one({"_id": ObjectId(topic_id)})
                if topic:
                    topic_names.append(topic["name"])
            except:
                pass
        
        # Create quiz metadata
        quiz_info = {
            "created_at": datetime.utcnow(),
            "topic_ids": topic_ids,
            "topic_names": topic_names,
            "question_count": len(quiz_questions),
            "difficulty": difficulty or "Mixed",
            "question_types": question_types or ["All Types"]
        }
        
        return {
            "quiz_info": quiz_info,
            "questions": quiz_questions
        }