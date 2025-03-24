from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.auth.auth_bearer import admin_required, teacher_required, student_or_above_required
from app.config.db import questions_collection, topics_collection
from app.models.question import (
    QuestionCreate, QuestionUpdate, QuestionOut, 
    QuestionGenerationRequest, QuestionRegenerationRequest,
    QuestionBatchAction
)
from app.models.user import TokenData
from app.services.ai_service import AIService

router = APIRouter(tags=["Questions"])

# Helper functions
def parse_object_id(id_str: str):
    try:
        return ObjectId(id_str)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid ID format: {id_str}"
        )

# Question endpoints
@router.post("/questions", response_model=QuestionOut, status_code=status.HTTP_201_CREATED)
async def create_question(question: QuestionCreate, token_data: TokenData = Depends(teacher_required)):
    """Create a new question manually (not AI-generated)"""
    
    # Check if topic exists
    topic = topics_collection.find_one({"_id": parse_object_id(question.topic_id)})
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic with ID {question.topic_id} not found"
        )
    
    now = datetime.utcnow()
    question_data = {
        **question.dict(),
        "created_by": token_data.user_id,
        "created_at": now,
        "updated_at": now,
        "ai_generated": False
    }
    
    result = questions_collection.insert_one(question_data)
    created_question = questions_collection.find_one({"_id": result.inserted_id})
    
    return created_question

@router.get("/questions", response_model=List[QuestionOut])
async def get_all_questions(
    topic_id: Optional[str] = None,
    difficulty: Optional[str] = None,
    question_type: Optional[str] = None,
    ai_generated: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    token_data: TokenData = Depends(student_or_above_required)
):
    """Get all questions with optional filtering"""
    query = {}
    
    if topic_id:
        query["topic_id"] = topic_id
        
    if difficulty:
        query["difficulty"] = difficulty
        
    if question_type:
        query["question_type"] = question_type
        
    if ai_generated is not None:
        query["ai_generated"] = ai_generated
    
    questions = questions_collection.find(query).skip(skip).limit(limit)
    return list(questions)

@router.get("/questions/{question_id}", response_model=QuestionOut)
async def get_question(
    question_id: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    """Get a specific question by ID"""
    question = questions_collection.find_one({"_id": parse_object_id(question_id)})
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID {question_id} not found"
        )
    return question

@router.put("/questions/{question_id}", response_model=QuestionOut)
async def update_question(
    question_id: str,
    question: QuestionUpdate,
    token_data: TokenData = Depends(teacher_required)
):
    """Update an existing question"""
    question_oid = parse_object_id(question_id)
    
    # Check if question exists
    existing_question = questions_collection.find_one({"_id": question_oid})
    if not existing_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID {question_id} not found"
        )
    
    # If topic_id is being changed, check if the new topic exists
    if question.topic_id and question.topic_id != existing_question["topic_id"]:
        topic = topics_collection.find_one({"_id": parse_object_id(question.topic_id)})
        if not topic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Topic with ID {question.topic_id} not found"
            )
    
    # Prepare update data, excluding None values
    update_data = {k: v for k, v in question.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        
        # Update the question
        questions_collection.update_one(
            {"_id": question_oid},
            {"$set": update_data}
        )
    
    # Return the updated question
    updated_question = questions_collection.find_one({"_id": question_oid})
    return updated_question

@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: str,
    token_data: TokenData = Depends(teacher_required)
):
    """Delete a question"""
    question_oid = parse_object_id(question_id)
    
    # Check if question exists
    existing_question = questions_collection.find_one({"_id": question_oid})
    if not existing_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID {question_id} not found"
        )
    
    # Delete the question
    questions_collection.delete_one({"_id": question_oid})
    
    return None

@router.post("/questions/ai/generate", response_model=List[QuestionOut])
async def generate_questions(
    request: QuestionGenerationRequest,
    token_data: TokenData = Depends(teacher_required)
):
    """Generate questions using AI"""
    try:
        # Generate questions using AI service
        generated_questions = await AIService.generate_questions(request, token_data.user_id)
        
        # Check if any questions were generated
        if not generated_questions:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate any valid questions"
            )
        
        # For each question, check if a similar one already exists
        saved_questions = []
        for question in generated_questions:
            # Check for duplicates using content hash
            if "content_hash" in question:
                duplicate = questions_collection.find_one({"content_hash": question["content_hash"]})
                if duplicate:
                    # Skip this question as it's a duplicate
                    continue
            
            # Insert new question
            result = questions_collection.insert_one(question)
            saved_question = questions_collection.find_one({"_id": result.inserted_id})
            saved_questions.append(saved_question)
        
        return saved_questions
        
    except ValueError as e:
        # Handle validation errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Handle other errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating questions: {str(e)}"
        )

@router.post("/questions/ai/regenerate", response_model=QuestionOut)
async def regenerate_question(
    request: QuestionRegenerationRequest,
    token_data: TokenData = Depends(teacher_required)
):
    """Regenerate a specific question using AI"""
    try:
        # Regenerate the question
        new_question = await AIService.regenerate_question(request, token_data.user_id)
        
        # Update the question in the database
        question_oid = parse_object_id(request.question_id)
        
        questions_collection.update_one(
            {"_id": question_oid},
            {"$set": new_question}
        )
        
        # Return the updated question
        updated_question = questions_collection.find_one({"_id": question_oid})
        return updated_question
        
    except ValueError as e:
        # Handle validation errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Handle other errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error regenerating question: {str(e)}"
        )

@router.post("/questions/batch/delete", status_code=status.HTTP_204_NO_CONTENT)
async def batch_delete_questions(
    request: QuestionBatchAction,
    token_data: TokenData = Depends(teacher_required)
):
    """Delete multiple questions at once"""
    if not request.question_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No question IDs provided"
        )
    
    # Convert string IDs to ObjectId
    question_oids = []
    for q_id in request.question_ids:
        try:
            question_oids.append(ObjectId(q_id))
        except:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid ID format: {q_id}"
            )
    
    # Delete all questions in the list
    result = questions_collection.delete_many({"_id": {"$in": question_oids}})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No questions were deleted. The provided IDs may not exist."
        )
    
    return None