# backend/app/models/curriculum.py - Adding slug fields to models

from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

# Curriculum
class CurriculumBase(BaseModel):
    name: str
    description: Optional[str] = None
    slug: Optional[str] = None  # Added slug field

class CurriculumCreate(CurriculumBase):
    pass

class CurriculumUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    slug: Optional[str] = None  # Added slug field

class CurriculumInDB(CurriculumBase):
    id: str = Field(alias="_id")
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True  # For compatibility with Pydantic v2

class CurriculumOut(CurriculumBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

# Subject
class SubjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    curriculum_id: str
    slug: Optional[str] = None  # Added slug field

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    curriculum_id: Optional[str] = None
    slug: Optional[str] = None  # Added slug field

class SubjectInDB(SubjectBase):
    id: str = Field(alias="_id")
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True  # For compatibility with Pydantic v2

class SubjectOut(SubjectBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

# Course
class CourseBase(BaseModel):
    name: str
    description: Optional[str] = None
    subject_id: str
    slug: Optional[str] = None  # Added slug field

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    subject_id: Optional[str] = None
    slug: Optional[str] = None  # Added slug field

class CourseInDB(CourseBase):
    id: str = Field(alias="_id")
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True  # For compatibility with Pydantic v2

class CourseOut(CourseBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

# Unit
class UnitBase(BaseModel):
    name: str
    description: Optional[str] = None
    course_id: str
    slug: Optional[str] = None  # Added slug field

class UnitCreate(UnitBase):
    pass

class UnitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    course_id: Optional[str] = None
    slug: Optional[str] = None  # Added slug field

class UnitInDB(UnitBase):
    id: str = Field(alias="_id")
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True  # For compatibility with Pydantic v2

class UnitOut(UnitBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

# Topic
class TopicBase(BaseModel):
    name: str
    description: Optional[str] = None
    unit_id: str
    slug: Optional[str] = None  # Added slug field

class TopicCreate(TopicBase):
    pass

class TopicUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    unit_id: Optional[str] = None
    slug: Optional[str] = None  # Added slug field

class TopicInDB(TopicBase):
    id: str = Field(alias="_id")
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True  # For compatibility with Pydantic v2

class TopicOut(TopicBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

# Hierarchical models for retrieving full structure
class TopicWithDetails(TopicOut):
    pass

class UnitWithTopics(UnitOut):
    topics: List[TopicWithDetails] = []

class CourseWithUnits(CourseOut):
    units: List[UnitWithTopics] = []

class SubjectWithCourses(SubjectOut):
    courses: List[CourseWithUnits] = []

class CurriculumWithSubjects(CurriculumOut):
    subjects: List[SubjectWithCourses] = []