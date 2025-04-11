from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime, timedelta
from bson import ObjectId

from app.config.db import users_collection
from app.models.user import UserCreate, UserOut, UserRole, UserLogin, Token
from app.auth.auth_handler import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(tags=["Student Authentication"])

@router.post("/student/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_student(user: UserCreate):
    """Register a new student account and return a token"""
    
    # Check if user with this email already exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{user.email}' already exists"
        )
    
    # Hash the password
    hashed_password = get_password_hash(user.password)
    
    now = datetime.utcnow()
    user_id = ObjectId()
    
    # Force role to be student for security
    user_data = {
        "_id": user_id,
        "email": user.email,
        "full_name": user.full_name,
        "role": UserRole.STUDENT,  # Force role to be student
        "hashed_password": hashed_password,
        "is_active": True,
        "created_at": now,
        "updated_at": now
    }
    
    try:
        # Insert the new user
        users_collection.insert_one(user_data)
        
        # Generate token for automatic login
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user_id), "role": UserRole.STUDENT},
            expires_delta=access_token_expires
        )
        
        # Return token response
        return Token(
            access_token=access_token,
            token_type="bearer",
            user_id=str(user_id),
            role=UserRole.STUDENT,
            full_name=user.full_name
        )
    
    except Exception as e:
        # If there's an error, we should log it and return a helpful message
        print(f"Error registering student: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )
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