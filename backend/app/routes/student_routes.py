from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import Dict, List, Any, Optional
from datetime import datetime

from app.auth.auth_bearer import student_or_above_required
from app.models.user import TokenData
from app.services.student_service import StudentService

router = APIRouter(tags=["Student"])






from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime, timedelta
from bson import ObjectId

from app.config.db import users_collection
from app.models.user import UserCreate, UserOut, UserRole, UserLogin, Token
from app.auth.auth_handler import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(tags=["Student Authentication"])

@router.post("/student/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_student(user: UserCreate):
    """Register a new student account"""
    
    # Check if user with this email already exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{user.email}' already exists"
        )
    
    # Hash the password
    hashed_password = get_password_hash(user.password)
    
    now = datetime.utcnow()
    user_data = {
        **user.dict(exclude={"password"}),
        "role": UserRole.STUDENT,  # Force role to be student
        "hashed_password": hashed_password,
        "is_active": True,
        "created_at": now,
        "updated_at": now
    }
    
    result = users_collection.insert_one(user_data)
    
    # Fetch the created user (without password)
    created_user = users_collection.find_one({"_id": result.inserted_id})
    
    return created_user

@router.post("/student/login", response_model=Token)
async def student_login(user_data: UserLogin):
    """Student login endpoint"""
    
    # Find user by email
    user = users_collection.find_one({"email": user_data.email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is a student
    if user["role"] != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This login is for students only",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"]), "role": user["role"]},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=str(user["_id"]),
        role=UserRole(user["role"])
    )

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
