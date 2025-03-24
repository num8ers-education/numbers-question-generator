from typing import Dict, List, Any, Optional
from bson import ObjectId
from datetime import datetime, timedelta

from app.config.db import (
    questions_collection, topics_collection, units_collection,
    courses_collection, subjects_collection, curriculum_collection,
    users_collection
)
from app.models.teacher import TeacherStats, TeacherDashboard

class TeacherService:
    """Service for teacher-specific business logic"""
    
    @staticmethod
    async def get_teacher_dashboard(teacher_id: str) -> Dict[str, Any]:
        """Get teacher dashboard data including statistics and recent activity"""
        
        # Validate teacher exists
        teacher = users_collection.find_one({"_id": ObjectId(teacher_id)})
        if not teacher:
            raise ValueError(f"Teacher with ID {teacher_id} not found")
        
        # Get teacher's question stats
        questions_created = questions_collection.count_documents({"created_by": teacher_id})
        questions_by_ai = questions_collection.count_documents({"created_by": teacher_id, "ai_generated": True})
        questions_manually_created = questions_collection.count_documents({"created_by": teacher_id, "ai_generated": False})
        
        # Get topics covered
        topic_ids = set()
        for question in questions_collection.find({"created_by": teacher_id}, {"topic_id": 1}):
            topic_ids.add(question["topic_id"])
        
        topics_covered = len(topic_ids)
        
        # Get recent activity (questions created in the last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_activity_cursor = questions_collection.find({
            "created_by": teacher_id,
            "created_at": {"$gte": thirty_days_ago}
        }).sort("created_at", -1).limit(10)
        
        recent_activity = []
        for activity in recent_activity_cursor:
            # Get topic info
            topic_info = None
            try:
                topic = topics_collection.find_one({"_id": ObjectId(activity["topic_id"])})
                if topic:
                    topic_info = {
                        "id": str(topic["_id"]),
                        "name": topic["name"]
                    }
                    
                    # Try to get unit info
                    unit = units_collection.find_one({"_id": ObjectId(topic["unit_id"])})
                    if unit:
                        topic_info["unit"] = {
                            "id": str(unit["_id"]),
                            "name": unit["name"]
                        }
            except:
                pass
            
            recent_activity.append({
                "id": str(activity["_id"]),
                "activity_type": "question_created",
                "question_type": activity["question_type"],
                "difficulty": activity["difficulty"],
                "ai_generated": activity.get("ai_generated", False),
                "timestamp": activity["created_at"],
                "topic": topic_info
            })
        
        # Get recent questions
        recent_questions_cursor = questions_collection.find({
            "created_by": teacher_id
        }).sort("created_at", -1).limit(5)
        
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
                "ai_generated": question.get("ai_generated", False),
                "created_at": question["created_at"],
                "topic": topic_info
            })
        
        # Get favorite topics (topics with most questions)
        pipeline = [
            {"$match": {"created_by": teacher_id}},
            {"$group": {"_id": "$topic_id", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        
        favorite_topics_result = list(questions_collection.aggregate(pipeline))
        favorite_topics = []
        
        for topic_result in favorite_topics_result:
            topic_id = topic_result["_id"]
            question_count = topic_result["count"]
            
            # Get topic info
            try:
                topic = topics_collection.find_one({"_id": ObjectId(topic_id)})
                if topic:
                    # Try to get unit info
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
                    
                    favorite_topics.append({
                        "id": str(topic["_id"]),
                        "name": topic["name"],
                        "description": topic.get("description", ""),
                        "question_count": question_count,
                        "unit": unit_info
                    })
            except:
                pass
        
        # Build stats object
        stats = TeacherStats(
            questions_created=questions_created,
            questions_by_ai=questions_by_ai,
            questions_manually_created=questions_manually_created,
            topics_covered=topics_covered,
            recent_activity=recent_activity
        )
        
        # Build dashboard
        dashboard = TeacherDashboard(
            stats=stats,
            recent_questions=recent_questions,
            favorite_topics=favorite_topics
        )
        
        return dashboard.dict()
    
    @staticmethod
    async def get_teacher_activity(teacher_id: str, days: int = 30) -> Dict[str, Any]:
        """Get detailed teacher activity over a period of time"""
        
        # Validate teacher exists
        teacher = users_collection.find_one({"_id": ObjectId(teacher_id)})
        if not teacher:
            raise ValueError(f"Teacher with ID {teacher_id} not found")
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get all questions created in the date range
        questions_cursor = questions_collection.find({
            "created_by": teacher_id,
            "created_at": {"$gte": start_date, "$lte": end_date}
        }).sort("created_at", 1)
        
        # Prepare activity data
        activity_by_date = {}
        question_types_count = {
            "MCQ": 0,
            "MultipleAnswer": 0,
            "True/False": 0,
            "Fill-in-the-blank": 0
        }
        difficulty_count = {
            "Easy": 0,
            "Medium": 0,
            "Hard": 0,
            "Mixed": 0
        }
        
        # Track topics used
        topic_usage = {}
        
        for question in questions_cursor:
            # Format date as string (YYYY-MM-DD)
            date_str = question["created_at"].strftime("%Y-%m-%d")
            
            # Initialize date entry if it doesn't exist
            if date_str not in activity_by_date:
                activity_by_date[date_str] = {
                    "total": 0,
                    "ai_generated": 0,
                    "manually_created": 0
                }
            
            # Increment counters
            activity_by_date[date_str]["total"] += 1
            
            if question.get("ai_generated", False):
                activity_by_date[date_str]["ai_generated"] += 1
            else:
                activity_by_date[date_str]["manually_created"] += 1
            
            # Count by question type
            q_type = question["question_type"]
            if q_type in question_types_count:
                question_types_count[q_type] += 1
            
            # Count by difficulty
            difficulty = question["difficulty"]
            if difficulty in difficulty_count:
                difficulty_count[difficulty] += 1
            
            # Track topic usage
            topic_id = question["topic_id"]
            if topic_id not in topic_usage:
                # Get topic info
                try:
                    topic = topics_collection.find_one({"_id": ObjectId(topic_id)})
                    if topic:
                        topic_usage[topic_id] = {
                            "id": str(topic["_id"]),
                            "name": topic["name"],
                            "count": 0
                        }
                except:
                    topic_usage[topic_id] = {
                        "id": topic_id,
                        "name": "Unknown Topic",
                        "count": 0
                    }
            
            topic_usage[topic_id]["count"] += 1
        
        # Convert topic usage to a list and sort by count
        topics_list = list(topic_usage.values())
        topics_list.sort(key=lambda x: x["count"], reverse=True)
        
        # Create a list of dates for the entire range
        date_range = []
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.strftime("%Y-%m-%d")
            if date_str not in activity_by_date:
                activity_by_date[date_str] = {
                    "total": 0,
                    "ai_generated": 0,
                    "manually_created": 0
                }
            date_range.append(date_str)
            current_date += timedelta(days=1)
        
        # Sort dates
        date_range.sort()
        
        # Prepare timeline data in sorted order
        timeline = [
            {
                "date": date,
                **activity_by_date[date]
            }
            for date in date_range
        ]
        
        return {
            "teacher_id": teacher_id,
            "teacher_name": teacher["full_name"],
            "date_range": {
                "start": start_date,
                "end": end_date,
                "days": days
            },
            "timeline": timeline,
            "by_question_type": question_types_count,
            "by_difficulty": difficulty_count,
            "topics_used": topics_list
        }