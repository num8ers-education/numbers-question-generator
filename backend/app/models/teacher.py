from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class TeacherStats(BaseModel):
    """Statistics for teacher dashboard"""
    questions_created: int
    questions_by_ai: int
    questions_manually_created: int
    topics_covered: int
    recent_activity: List[Dict[str, Any]]

class TeacherDashboard(BaseModel):
    """Teacher dashboard data"""
    stats: TeacherStats
    recent_questions: List[Dict[str, Any]]
    favorite_topics: List[Dict[str, Any]]