from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.auth.auth_bearer import admin_required
from app.auth.auth_handler import get_password_hash
from app.config.db import users_collection
from app.models.user import (
    UserCreate, UserUpdate, UserOut, UserRole, TokenData
)

router = APIRouter(tags=["Admin"])

# Helper functions
def parse_object_id(id_str: str):
    try:
        return ObjectId(id_str)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid ID format: {id_str}"
        )

# User management endpoints
@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, token_data: TokenData = Depends(admin_required)):
    """Create a new user (admin, teacher, or student)"""
    
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
        "hashed_password": hashed_password,
        "is_active": True,
        "created_at": now,
        "updated_at": now
    }
    
    result = users_collection.insert_one(user_data)
    
    # Fetch the created user (without password)
    created_user = users_collection.find_one({"_id": result.inserted_id})
    
    return created_user

@router.get("/users", response_model=List[UserOut])
async def get_all_users(
    role: Optional[UserRole] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    token_data: TokenData = Depends(admin_required)
):
    """Get all users with optional role filtering"""
    query = {}
    if role:
        query["role"] = role
        
    users = users_collection.find(query).skip(skip).limit(limit)
    return list(users)

@router.get("/users/{user_id}", response_model=UserOut)
async def get_user(
    user_id: str,
    token_data: TokenData = Depends(admin_required)
):
    """Get a specific user by ID"""
    user = users_collection.find_one({"_id": parse_object_id(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    return user

@router.put("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: str,
    user: UserUpdate,
    token_data: TokenData = Depends(admin_required)
):
    """Update an existing user"""
    user_oid = parse_object_id(user_id)
    
    # Check if user exists
    existing_user = users_collection.find_one({"_id": user_oid})
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    # Check if the new email is already taken
    if user.email and user.email != existing_user["email"]:
        if users_collection.find_one({"email": user.email, "_id": {"$ne": user_oid}}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with email '{user.email}' already exists"
            )
    
    # Prepare update data, excluding None values
    update_data = {k: v for k, v in user.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        
        # Update the user
        users_collection.update_one(
            {"_id": user_oid},
            {"$set": update_data}
        )
    
    # Return the updated user
    updated_user = users_collection.find_one({"_id": user_oid})
    return updated_user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    token_data: TokenData = Depends(admin_required)
):
    """Delete a user"""
    user_oid = parse_object_id(user_id)
    
    # Check if user exists
    existing_user = users_collection.find_one({"_id": user_oid})
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    # Prevent self-deletion
    if str(existing_user["_id"]) == token_data.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Delete the user
    users_collection.delete_one({"_id": user_oid})
    
    return None

@router.post("/users/{user_id}/reset-password", status_code=status.HTTP_204_NO_CONTENT)
async def reset_user_password(
    user_id: str,
    new_password: str,
    token_data: TokenData = Depends(admin_required)
):
    """Reset a user's password"""
    user_oid = parse_object_id(user_id)
    
    # Check if user exists
    existing_user = users_collection.find_one({"_id": user_oid})
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    # Hash the new password
    hashed_password = get_password_hash(new_password)
    
    # Update the user
    users_collection.update_one(
        {"_id": user_oid},
        {"$set": {
            "hashed_password": hashed_password,
            "updated_at": datetime.utcnow()
        }}
    )
    
    return None

@router.post("/users/{user_id}/deactivate", response_model=UserOut)
async def deactivate_user(
    user_id: str,
    token_data: TokenData = Depends(admin_required)
):
    """Deactivate a user account"""
    user_oid = parse_object_id(user_id)
    
    # Check if user exists
    existing_user = users_collection.find_one({"_id": user_oid})
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    # Prevent self-deactivation
    if str(existing_user["_id"]) == token_data.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    # Update the user
    users_collection.update_one(
        {"_id": user_oid},
        {"$set": {
            "is_active": False,
            "updated_at": datetime.utcnow()
        }}
    )
    
    # Return the updated user
    updated_user = users_collection.find_one({"_id": user_oid})
    return updated_user

@router.post("/users/{user_id}/activate", response_model=UserOut)
async def activate_user(
    user_id: str,
    token_data: TokenData = Depends(admin_required)
):
    """Activate a user account"""
    user_oid = parse_object_id(user_id)
    
    # Check if user exists
    existing_user = users_collection.find_one({"_id": user_oid})
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    # Update the user
    users_collection.update_one(
        {"_id": user_oid},
        {"$set": {
            "is_active": True,
            "updated_at": datetime.utcnow()
        }}
    )
    
    # Return the updated user
    updated_user = users_collection.find_one({"_id": user_oid})
    return updated_user