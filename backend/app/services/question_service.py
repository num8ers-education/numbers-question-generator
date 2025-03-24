from typing import Dict, List, Any, Optional
from bson import ObjectId
from datetime import datetime

from app.config.db import (
    questions_collection, topics_collection, units_collection,
    courses_collection, subjects_collection, curriculum_collection
)

class QuestionService:
    """Service for question-related business logic"""
    
    @staticmethod
    async def get_question_stats(topic_id: Optional[str] = None) -> Dict[str, Any]:
        """Get statistics about questions, optionally filtered by topic"""
        
        # Base filter
        filter_query = {}
        if topic_id:
            filter_query["topic_id"] = topic_id
        
        # Get total count
        total_questions = questions_collection.count_documents(filter_query)
        
        # Question distribution by type
        question_type_distribution = {
            "MCQ": questions_collection.count_documents({**filter_query, "question_type": "MCQ"}),
            "MultipleAnswer": questions_collection.count_documents({**filter_query, "question_type": "MultipleAnswer"}),
            "True/False": questions_collection.count_documents({**filter_query, "question_type": "True/False"}),
            "Fill-in-the-blank": questions_collection.count_documents({**filter_query, "question_type": "Fill-in-the-blank"})
        }
        
        # Question distribution by difficulty
        difficulty_distribution = {
            "Easy": questions_collection.count_documents({**filter_query, "difficulty": "Easy"}),
            "Medium": questions_collection.count_documents({**filter_query, "difficulty": "Medium"}),
            "Hard": questions_collection.count_documents({**filter_query, "difficulty": "Hard"}),
            "Mixed": questions_collection.count_documents({**filter_query, "difficulty": "Mixed"})
        }
        
        # AI vs manual questions
        ai_generated = questions_collection.count_documents({**filter_query, "ai_generated": True})
        manually_created = questions_collection.count_documents({**filter_query, "ai_generated": False})
        
        # Get topic info if topic_id is provided
        topic_info = None
        if topic_id:
            topic = topics_collection.find_one({"_id": ObjectId(topic_id)})
            if topic:
                # Get the full hierarchy path
                try:
                    unit = units_collection.find_one({"_id": ObjectId(topic["unit_id"])})
                    course = courses_collection.find_one({"_id": ObjectId(unit["course_id"])})
                    subject = subjects_collection.find_one({"_id": ObjectId(course["subject_id"])})
                    curriculum = curriculum_collection.find_one({"_id": ObjectId(subject["curriculum_id"])})
                    
                    topic_info = {
                        "id": str(topic["_id"]),
                        "name": topic["name"],
                        "description": topic.get("description", ""),
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
                except Exception as e:
                    # If any part of the hierarchy is missing, just provide the topic info
                    topic_info = {
                        "id": str(topic["_id"]),
                        "name": topic["name"],
                        "description": topic.get("description", "")
                    }
        
        return {
            "total_questions": total_questions,
            "by_type": question_type_distribution,
            "by_difficulty": difficulty_distribution,
            "generation": {
                "ai_generated": ai_generated,
                "manually_created": manually_created
            },
            "topic_info": topic_info
        }
    
    @staticmethod
    async def search_questions(
        query: str,
        topic_id: Optional[str] = None,
        question_type: Optional[str] = None,
        difficulty: Optional[str] = None,
        ai_generated: Optional[bool] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Search questions with various filters"""
        
        # Create base filter
        filter_query = {}
        
        # Add text search if query is provided
        if query:
            filter_query["$or"] = [
                {"question_text": {"$regex": query, "$options": "i"}},
                {"explanation": {"$regex": query, "$options": "i"}}
            ]
        
        # Add additional filters if provided
        if topic_id:
            filter_query["topic_id"] = topic_id
        
        if question_type:
            filter_query["question_type"] = question_type
        
        if difficulty:
            filter_query["difficulty"] = difficulty
        
        if ai_generated is not None:
            filter_query["ai_generated"] = ai_generated
        
        # Execute search
        questions = list(questions_collection.find(filter_query).limit(limit))
        
        # Format results
        result = []
        for question in questions:
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
                
            # Format question data
            formatted_question = {
                "id": str(question["_id"]),
                "question_text": question["question_text"],
                "question_type": question["question_type"],
                "difficulty": question["difficulty"],
                "ai_generated": question.get("ai_generated", False),
                "created_at": question["created_at"],
                "topic": topic_info,
                "options": question["options"],
                "correct_answer": question["correct_answer"]
            }
            
            result.append(formatted_question)
        
        return result
    
    @staticmethod
    async def get_question_sets_by_topic(topic_id: str, limit: int = 50) -> Dict[str, Any]:
        """Group questions by type and difficulty for a specific topic"""
        
        # Verify topic exists
        topic = topics_collection.find_one({"_id": ObjectId(topic_id)})
        if not topic:
            raise ValueError(f"Topic with ID {topic_id} not found")
        
        # Get questions for this topic
        questions = list(questions_collection.find({"topic_id": topic_id}).limit(limit))
        
        # Group by question type
        by_type = {}
        for question in questions:
            q_type = question["question_type"]
            if q_type not in by_type:
                by_type[q_type] = []
            
            # Format question for output
            formatted_q = {
                "id": str(question["_id"]),
                "question_text": question["question_text"],
                "difficulty": question["difficulty"],
                "options": question["options"],
                "correct_answer": question["correct_answer"],
                "ai_generated": question.get("ai_generated", False)
            }
            
            by_type[q_type].append(formatted_q)
        
        # Group by difficulty
        by_difficulty = {}
        for question in questions:
            difficulty = question["difficulty"]
            if difficulty not in by_difficulty:
                by_difficulty[difficulty] = []
            
            # Format question for output (reusing the same format)
            formatted_q = {
                "id": str(question["_id"]),
                "question_text": question["question_text"],
                "question_type": question["question_type"],
                "options": question["options"],
                "correct_answer": question["correct_answer"],
                "ai_generated": question.get("ai_generated", False)
            }
            
            by_difficulty[difficulty].append(formatted_q)
        
        # Get topic details including path
        topic_details = {
            "id": str(topic["_id"]),
            "name": topic["name"],
            "description": topic.get("description", "")
        }
        
        try:
            # Get the hierarchy path
            unit = units_collection.find_one({"_id": ObjectId(topic["unit_id"])})
            course = courses_collection.find_one({"_id": ObjectId(unit["course_id"])})
            subject = subjects_collection.find_one({"_id": ObjectId(course["subject_id"])})
            curriculum = curriculum_collection.find_one({"_id": ObjectId(subject["curriculum_id"])})
            
            topic_details["path"] = {
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
        except Exception as e:
            # If we can't get the full path, just continue without it
            pass
        
        return {
            "topic": topic_details,
            "total_questions": len(questions),
            "by_type": by_type,
            "by_difficulty": by_difficulty
        }
    
    @staticmethod
    async def generate_practice_set(
        topic_ids: List[str],
        question_types: Optional[List[str]] = None,
        difficulty: Optional[str] = None,
        count: int = 10
    ) -> List[Dict[str, Any]]:
        """Generate a practice set of questions from specified topics"""
        
        # Build filter
        filter_query = {"topic_id": {"$in": topic_ids}}
        
        if question_types:
            filter_query["question_type"] = {"$in": question_types}
        
        if difficulty:
            filter_query["difficulty"] = difficulty
        
        # Get random questions (using MongoDB's sample)
        pipeline = [
            {"$match": filter_query},
            {"$sample": {"size": count}}
        ]
        
        questions = list(questions_collection.aggregate(pipeline))
        
        # Format questions
        formatted_questions = []
        for question in questions:
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
            
            # Format question
            formatted_q = {
                "id": str(question["_id"]),
                "question_text": question["question_text"],
                "question_type": question["question_type"],
                "difficulty": question["difficulty"],
                "options": question["options"],
                "correct_answer": question["correct_answer"],
                "explanation": question["explanation"],
                "topic": topic_info
            }
            
            formatted_questions.append(formatted_q)
        
        return formatted_questions