from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import Dict, List, Any, Optional
from datetime import datetime

from app.auth.auth_bearer import student_or_above_required
from app.models.user import TokenData
from app.services.student_service import StudentService

router = APIRouter(tags=["Student"])

@router.get("/student/dashboard")
async def get_student_dashboard(token_data: TokenData = Depends(student_or_above_required)):
    """Get student dashboard with available questions and recommended topics"""
    try:
        dashboard = await StudentService.get_student_dashboard(token_data.user_id)
        return dashboard
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving student dashboard: {str(e)}"
        )

@router.get("/student/question-sets")
async def get_available_question_sets(token_data: TokenData = Depends(student_or_above_required)):
    """Get all available question sets grouped by curriculum structure"""
    try:
        question_sets = await StudentService.get_available_question_sets()
        return question_sets
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving question sets: {str(e)}"
        )

@router.get("/student/topic/{topic_id}/questions")
async def get_topic_questions(
    topic_id: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    """Get all questions for a specific topic"""
    try:
        questions = await StudentService.get_topic_questions(topic_id)
        return questions
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving topic questions: {str(e)}"
        )

@router.post("/student/practice-quiz")
async def generate_practice_quiz(
    topic_ids: List[str],
    question_count: int = Query(10, ge=1, le=50),
    difficulty: Optional[str] = None,
    question_types: Optional[List[str]] = None,
    token_data: TokenData = Depends(student_or_above_required)
):
    """Generate a practice quiz from specified topics"""
    try:
        quiz = await StudentService.generate_practice_quiz(
            topic_ids,
            question_count,
            difficulty,
            question_types
        )
        return quiz
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating practice quiz: {str(e)}"
        )
