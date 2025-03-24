from typing import Dict, List, Any, Optional
from bson import ObjectId
from datetime import datetime

from app.config.db import (
    curriculum_collection, subjects_collection, courses_collection, 
    units_collection, topics_collection, questions_collection
)

class CurriculumService:
    """Service for curriculum-related business logic"""
    
    @staticmethod
    async def get_curriculum_stats(curriculum_id: str) -> Dict[str, Any]:
        """Get statistics for a specific curriculum"""
        
        # Check if curriculum exists
        curriculum_oid = ObjectId(curriculum_id)
        curriculum = curriculum_collection.find_one({"_id": curriculum_oid})
        if not curriculum:
            raise ValueError(f"Curriculum with ID {curriculum_id} not found")
            
        # Get counts for each level
        subjects_count = subjects_collection.count_documents({"curriculum_id": curriculum_id})
        
        # Get subject IDs for this curriculum
        subject_ids = [str(subject["_id"]) for subject in subjects_collection.find({"curriculum_id": curriculum_id})]
        
        # Get course count for these subjects
        courses_count = courses_collection.count_documents({"subject_id": {"$in": subject_ids}})
        
        # Get course IDs
        course_ids = [str(course["_id"]) for course in courses_collection.find({"subject_id": {"$in": subject_ids}})]
        
        # Get unit count for these courses
        units_count = units_collection.count_documents({"course_id": {"$in": course_ids}})
        
        # Get unit IDs
        unit_ids = [str(unit["_id"]) for unit in units_collection.find({"course_id": {"$in": course_ids}})]
        
        # Get topic count for these units
        topics_count = topics_collection.count_documents({"unit_id": {"$in": unit_ids}})
        
        # Get topic IDs
        topic_ids = [str(topic["_id"]) for topic in topics_collection.find({"unit_id": {"$in": unit_ids}})]
        
        # Get question count for these topics
        questions_count = questions_collection.count_documents({"topic_id": {"$in": topic_ids}})
        
        # Question distribution by type
        question_type_distribution = {
            "MCQ": questions_collection.count_documents({"topic_id": {"$in": topic_ids}, "question_type": "MCQ"}),
            "MultipleAnswer": questions_collection.count_documents({"topic_id": {"$in": topic_ids}, "question_type": "MultipleAnswer"}),
            "True/False": questions_collection.count_documents({"topic_id": {"$in": topic_ids}, "question_type": "True/False"}),
            "Fill-in-the-blank": questions_collection.count_documents({"topic_id": {"$in": topic_ids}, "question_type": "Fill-in-the-blank"})
        }
        
        # Question distribution by difficulty
        difficulty_distribution = {
            "Easy": questions_collection.count_documents({"topic_id": {"$in": topic_ids}, "difficulty": "Easy"}),
            "Medium": questions_collection.count_documents({"topic_id": {"$in": topic_ids}, "difficulty": "Medium"}),
            "Hard": questions_collection.count_documents({"topic_id": {"$in": topic_ids}, "difficulty": "Hard"}),
            "Mixed": questions_collection.count_documents({"topic_id": {"$in": topic_ids}, "difficulty": "Mixed"})
        }
        
        # AI vs manual questions
        ai_generated = questions_collection.count_documents({"topic_id": {"$in": topic_ids}, "ai_generated": True})
        manually_created = questions_collection.count_documents({"topic_id": {"$in": topic_ids}, "ai_generated": False})
        
        return {
            "curriculum_id": curriculum_id,
            "curriculum_name": curriculum["name"],
            "stats": {
                "subjects_count": subjects_count,
                "courses_count": courses_count,
                "units_count": units_count,
                "topics_count": topics_count,
                "questions_count": questions_count
            },
            "question_stats": {
                "by_type": question_type_distribution,
                "by_difficulty": difficulty_distribution,
                "ai_generated": ai_generated,
                "manually_created": manually_created
            }
        }
    
    @staticmethod
    async def find_topic_path(topic_id: str) -> Dict[str, Any]:
        """Find the full path from curriculum to the specified topic"""
        
        # Check if topic exists
        topic_oid = ObjectId(topic_id)
        topic = topics_collection.find_one({"_id": topic_oid})
        if not topic:
            raise ValueError(f"Topic with ID {topic_id} not found")
            
        # Get the unit
        unit = units_collection.find_one({"_id": ObjectId(topic["unit_id"])})
        if not unit:
            raise ValueError(f"Unit with ID {topic['unit_id']} not found")
            
        # Get the course
        course = courses_collection.find_one({"_id": ObjectId(unit["course_id"])})
        if not course:
            raise ValueError(f"Course with ID {unit['course_id']} not found")
            
        # Get the subject
        subject = subjects_collection.find_one({"_id": ObjectId(course["subject_id"])})
        if not subject:
            raise ValueError(f"Subject with ID {course['subject_id']} not found")
            
        # Get the curriculum
        curriculum = curriculum_collection.find_one({"_id": ObjectId(subject["curriculum_id"])})
        if not curriculum:
            raise ValueError(f"Curriculum with ID {subject['curriculum_id']} not found")
            
        # Build the path
        return {
            "topic": {
                "id": str(topic["_id"]),
                "name": topic["name"]
            },
            "unit": {
                "id": str(unit["_id"]),
                "name": unit["name"]
            },
            "course": {
                "id": str(course["_id"]),
                "name": course["name"]
            },
            "subject": {
                "id": str(subject["_id"]),
                "name": subject["name"]
            },
            "curriculum": {
                "id": str(curriculum["_id"]),
                "name": curriculum["name"]
            }
        }
    
    @staticmethod
    async def search_curriculum(
        query: str, 
        limit: int = 20, 
        curriculum_id: Optional[str] = None
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Search across curriculum items (subjects, courses, units, topics)"""
        
        # Create regex pattern
        pattern = {"$regex": query, "$options": "i"}  # Case-insensitive regex
        
        # Base filter to use for all queries
        base_filter = {}
        if curriculum_id:
            base_filter["curriculum_id"] = curriculum_id
        
        # Search subjects
        subject_filter = {**base_filter, "name": pattern}
        subjects = list(subjects_collection.find(subject_filter).limit(limit))
        subject_results = []
        for subject in subjects:
            subject_results.append({
                "id": str(subject["_id"]),
                "name": subject["name"],
                "type": "subject",
                "curriculum_id": subject["curriculum_id"],
                "description": subject.get("description", "")
            })
        
        # If we have subjects, get their IDs for course filtering
        subject_ids = [str(subject["_id"]) for subject in subjects]
        
        # Search courses
        course_filter = {"name": pattern}
        if curriculum_id:
            # If curriculum_id is specified, we need to get all subjects in that curriculum
            if not subject_ids:
                subject_ids = [str(subject["_id"]) for subject in subjects_collection.find({"curriculum_id": curriculum_id})]
            
            course_filter["subject_id"] = {"$in": subject_ids}
        
        courses = list(courses_collection.find(course_filter).limit(limit))
        course_results = []
        for course in courses:
            course_results.append({
                "id": str(course["_id"]),
                "name": course["name"],
                "type": "course",
                "subject_id": course["subject_id"],
                "description": course.get("description", "")
            })
        
        # Get course IDs for unit filtering
        course_ids = [str(course["_id"]) for course in courses]
        
        # Search units
        unit_filter = {"name": pattern}
        if course_ids:
            unit_filter["course_id"] = {"$in": course_ids}
        
        units = list(units_collection.find(unit_filter).limit(limit))
        unit_results = []
        for unit in units:
            unit_results.append({
                "id": str(unit["_id"]),
                "name": unit["name"],
                "type": "unit",
                "course_id": unit["course_id"],
                "description": unit.get("description", "")
            })
        
        # Get unit IDs for topic filtering
        unit_ids = [str(unit["_id"]) for unit in units]
        
        # Search topics
        topic_filter = {"name": pattern}
        if unit_ids:
            topic_filter["unit_id"] = {"$in": unit_ids}
        
        topics = list(topics_collection.find(topic_filter).limit(limit))
        topic_results = []
        for topic in topics:
            topic_results.append({
                "id": str(topic["_id"]),
                "name": topic["name"],
                "type": "topic",
                "unit_id": topic["unit_id"],
                "description": topic.get("description", "")
            })
        
        # Return combined results
        return {
            "subjects": subject_results,
            "courses": course_results,
            "units": unit_results,
            "topics": topic_results
        }