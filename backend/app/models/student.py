from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class StudentStats(BaseModel):
    """Statistics for student dashboard"""
    questions_viewed: int
    topics_viewed: int
    courses_enrolled: int
    recent_activity: List[Dict[str, Any]]

class StudentDashboard(BaseModel):
    """Student dashboard data"""
    stats: StudentStats
    recent_questions: List[Dict[str, Any]]
    recommended_topics: List[Dict[str, Any]]