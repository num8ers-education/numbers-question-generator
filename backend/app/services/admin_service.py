from datetime import datetime, timedelta
from typing import Dict, List, Any
from bson import ObjectId

from app.config.db import (
    users_collection, curriculum_collection, subjects_collection, 
    courses_collection, units_collection, topics_collection, 
    questions_collection
)
from app.models.admin import AdminStats, AdminDashboard
from app.models.user import UserRole

class AdminService:
    """Service for admin-specific business logic"""
    
    @staticmethod
    async def get_admin_dashboard() -> Dict[str, Any]:
        """Get stats and data for admin dashboard"""
        
        # Get user counts
        total_users = users_collection.count_documents({})
        total_teachers = users_collection.count_documents({"role": UserRole.TEACHER})
        total_students = users_collection.count_documents({"role": UserRole.STUDENT})
        
        # Get curriculum item counts
        total_curricula = curriculum_collection.count_documents({})
        total_subjects = subjects_collection.count_documents({})
        total_courses = courses_collection.count_documents({})
        total_units = units_collection.count_documents({})
        total_topics = topics_collection.count_documents({})
        
        # Get question counts
        total_questions = questions_collection.count_documents({})
        questions_by_ai = questions_collection.count_documents({"ai_generated": True})
        questions_by_teachers = questions_collection.count_documents({"ai_generated": False})
        
        # Get recent users
        recent_users = list(users_collection.find().sort("created_at", -1).limit(5))
        for user in recent_users:
            user["id"] = str(user.pop("_id"))
        
        # Get recent questions
        recent_questions = list(questions_collection.find().sort("created_at", -1).limit(5))
        for question in recent_questions:
            question["id"] = str(question.pop("_id"))
            question["created_by_user"] = users_collection.find_one({"_id": ObjectId(question["created_by"])})
            if question["created_by_user"]:
                question["created_by_user"] = {
                    "id": str(question["created_by_user"]["_id"]),
                    "full_name": question["created_by_user"]["full_name"],
                    "email": question["created_by_user"]["email"],
                    "role": question["created_by_user"]["role"]
                }
        
        # Build dashboard data
        stats = AdminStats(
            total_users=total_users,
            total_teachers=total_teachers,
            total_students=total_students,
            total_curricula=total_curricula,
            total_subjects=total_subjects,
            total_courses=total_courses,
            total_units=total_units,
            total_topics=total_topics,
            total_questions=total_questions,
            questions_by_ai=questions_by_ai,
            questions_by_teachers=questions_by_teachers
        )
        
        dashboard = AdminDashboard(
            stats=stats,
            recent_users=recent_users,
            recent_questions=recent_questions
        )
        
        return dashboard.dict()
    
    @staticmethod
    async def get_system_stats() -> Dict[str, Any]:
        """Get system statistics for monitoring"""
        
        # Get counts per collection
        collection_stats = {
            "users": users_collection.count_documents({}),
            "curricula": curriculum_collection.count_documents({}),
            "subjects": subjects_collection.count_documents({}),
            "courses": courses_collection.count_documents({}),
            "units": units_collection.count_documents({}),
            "topics": topics_collection.count_documents({}),
            "questions": questions_collection.count_documents({})
        }
        
        # Get user role distribution
        user_roles = {
            "admin": users_collection.count_documents({"role": UserRole.ADMIN}),
            "teacher": users_collection.count_documents({"role": UserRole.TEACHER}),
            "student": users_collection.count_documents({"role": UserRole.STUDENT})
        }
        
        # Get activity metrics for the past week
        one_week_ago = datetime.utcnow() - timedelta(days=7)
        
        new_users = users_collection.count_documents({"created_at": {"$gte": one_week_ago}})
        new_questions = questions_collection.count_documents({"created_at": {"$gte": one_week_ago}})
        
        # Get AI vs manual questions breakdown
        question_types = {
            "ai_generated": questions_collection.count_documents({"ai_generated": True}),
            "manually_created": questions_collection.count_documents({"ai_generated": False})
        }
        
        # Get question type distribution
        question_type_distribution = {
            "MCQ": questions_collection.count_documents({"question_type": "MCQ"}),
            "MultipleAnswer": questions_collection.count_documents({"question_type": "MultipleAnswer"}),
            "True/False": questions_collection.count_documents({"question_type": "True/False"}),
            "Fill-in-the-blank": questions_collection.count_documents({"question_type": "Fill-in-the-blank"})
        }
        
        # Get difficulty level distribution
        difficulty_distribution = {
            "Easy": questions_collection.count_documents({"difficulty": "Easy"}),
            "Medium": questions_collection.count_documents({"difficulty": "Medium"}),
            "Hard": questions_collection.count_documents({"difficulty": "Hard"}),
            "Mixed": questions_collection.count_documents({"difficulty": "Mixed"})
        }
        
        # Return combined stats
        return {
            "collection_stats": collection_stats,
            "user_roles": user_roles,
            "activity": {
                "new_users_last_week": new_users,
                "new_questions_last_week": new_questions
            },
            "question_stats": {
                "by_generation": question_types,
                "by_type": question_type_distribution,
                "by_difficulty": difficulty_distribution
            }
        }