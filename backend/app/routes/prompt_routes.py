from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.auth.auth_bearer import admin_required, teacher_required
from app.config.db import prompts_collection
from app.models.question import (
    PromptTemplateCreate, PromptTemplateUpdate, PromptTemplateOut
)
from app.models.user import TokenData

router = APIRouter(tags=["Prompt Templates"])

# Helper functions
def parse_object_id(id_str: str):
    try:
        return ObjectId(id_str)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid ID format: {id_str}"
        )

# Prompt template endpoints
@router.post("/prompts", response_model=PromptTemplateOut, status_code=status.HTTP_201_CREATED)
async def create_prompt_template(prompt: PromptTemplateCreate, token_data: TokenData = Depends(admin_required)):
    """Create a new prompt template"""
    
    # Check if a template with this name already exists
    if prompts_collection.find_one({"name": prompt.name}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Prompt template with name '{prompt.name}' already exists"
        )
    
    # If this is set as default, unset any existing default
    if prompt.is_default:
        prompts_collection.update_many(
            {"is_default": True},
            {"$set": {"is_default": False}}
        )
    
    now = datetime.utcnow()
    prompt_data = {
        **prompt.dict(),
        "created_by": token_data.user_id,
        "created_at": now,
        "updated_at": now
    }
    
    result = prompts_collection.insert_one(prompt_data)
    created_prompt = prompts_collection.find_one({"_id": result.inserted_id})
    
    return created_prompt

@router.get("/prompts", response_model=List[PromptTemplateOut])
async def get_all_prompt_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    token_data: TokenData = Depends(teacher_required)
):
    """Get all prompt templates"""
    prompts = prompts_collection.find().skip(skip).limit(limit)
    return list(prompts)

@router.get("/prompts/default", response_model=PromptTemplateOut)
async def get_default_prompt_template(
    token_data: TokenData = Depends(teacher_required)
):
    """Get the default prompt template"""
    prompt = prompts_collection.find_one({"is_default": True})
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No default prompt template found"
        )
    return prompt

@router.get("/prompts/{prompt_id}", response_model=PromptTemplateOut)
async def get_prompt_template(
    prompt_id: str,
    token_data: TokenData = Depends(teacher_required)
):
    """Get a specific prompt template by ID"""
    prompt = prompts_collection.find_one({"_id": parse_object_id(prompt_id)})
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prompt template with ID {prompt_id} not found"
        )
    return prompt

@router.put("/prompts/{prompt_id}", response_model=PromptTemplateOut)
async def update_prompt_template(
    prompt_id: str,
    prompt: PromptTemplateUpdate,
    token_data: TokenData = Depends(admin_required)
):
    """Update an existing prompt template"""
    prompt_oid = parse_object_id(prompt_id)
    
    # Check if prompt exists
    existing_prompt = prompts_collection.find_one({"_id": prompt_oid})
    if not existing_prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prompt template with ID {prompt_id} not found"
        )
    
    # Check if the new name is already taken
    if prompt.name and prompt.name != existing_prompt["name"]:
        if prompts_collection.find_one({"name": prompt.name, "_id": {"$ne": prompt_oid}}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Prompt template with name '{prompt.name}' already exists"
            )
    
    # If this is being set as default, unset any existing default
    if prompt.is_default and prompt.is_default != existing_prompt.get("is_default", False):
        prompts_collection.update_many(
            {"is_default": True, "_id": {"$ne": prompt_oid}},
            {"$set": {"is_default": False}}
        )
    
    # Prepare update data, excluding None values
    update_data = {k: v for k, v in prompt.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        
        # Update the prompt
        prompts_collection.update_one(
            {"_id": prompt_oid},
            {"$set": update_data}
        )
    
    # Return the updated prompt
    updated_prompt = prompts_collection.find_one({"_id": prompt_oid})
    return updated_prompt

@router.delete("/prompts/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prompt_template(
    prompt_id: str,
    token_data: TokenData = Depends(admin_required)
):
    """Delete a prompt template"""
    prompt_oid = parse_object_id(prompt_id)
    
    # Check if prompt exists
    existing_prompt = prompts_collection.find_one({"_id": prompt_oid})
    if not existing_prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prompt template with ID {prompt_id} not found"
        )
    
    # Don't allow deletion of the default prompt
    if existing_prompt.get("is_default", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete the default prompt template. Set a different template as default first."
        )
    
    # Delete the prompt
    prompts_collection.delete_one({"_id": prompt_oid})
    
    return None

@router.post("/prompts/{prompt_id}/set-default", response_model=PromptTemplateOut)
async def set_default_prompt_template(
    prompt_id: str,
    token_data: TokenData = Depends(admin_required)
):
    """Set a prompt template as the default"""
    prompt_oid = parse_object_id(prompt_id)
    
    # Check if prompt exists
    existing_prompt = prompts_collection.find_one({"_id": prompt_oid})
    if not existing_prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prompt template with ID {prompt_id} not found"
        )
    
    # Unset any existing default
    prompts_collection.update_many(
        {"is_default": True},
        {"$set": {"is_default": False}}
    )
    
    # Set this one as default
    prompts_collection.update_one(
        {"_id": prompt_oid},
        {"$set": {"is_default": True, "updated_at": datetime.utcnow()}}
    )
    
    # Return the updated prompt
    updated_prompt = prompts_collection.find_one({"_id": prompt_oid})
    return updated_prompt