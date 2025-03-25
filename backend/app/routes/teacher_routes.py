from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import Dict, List, Any, Optional
from datetime import datetime

from app.auth.auth_bearer import teacher_required
from app.models.user import TokenData
from app.services.teacher_service import TeacherService

router = APIRouter(tags=["Teacher"])

@router.get("/teacher/dashboard")
async def get_teacher_dashboard(token_data: TokenData = Depends(teacher_required)):
    """Get teacher dashboard with statistics and recent activity"""
    try:
        dashboard = await TeacherService.get_teacher_dashboard(token_data.user_id)
        return dashboard
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving teacher dashboard: {str(e)}"
        )

@router.get("/teacher/activity")
async def get_teacher_activity(
    days: int = Query(30, ge=1, le=365),
    token_data: TokenData = Depends(teacher_required)
):
    """Get detailed teacher activity over a period of time"""
    try:
        activity = await TeacherService.get_teacher_activity(token_data.user_id, days)
        return activity
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving teacher activity: {str(e)}"
        )
