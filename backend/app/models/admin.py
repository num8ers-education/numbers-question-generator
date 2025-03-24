from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

from app.models.user import UserOut

class AdminStats(BaseModel):
    """Statistics for admin dashboard"""
    total_users: int
    total_teachers: int
    total_students: int
    total_curricula: int
    total_subjects: int
    total_courses: int
    total_units: int
    total_topics: int
    total_questions: int
    questions_by_ai: int
    questions_by_teachers: int

class AdminDashboard(BaseModel):
    """Admin dashboard data"""
    stats: AdminStats
    recent_users: List[UserOut]
    recent_questions: List[dict]