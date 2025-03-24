from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Curriculum
class CurriculumBase(BaseModel):
    name: str
    description: Optional[str] = None

class CurriculumCreate(CurriculumBase):
    pass

class CurriculumUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class CurriculumInDB(CurriculumBase):
    id: str = Field(..., alias="_id")
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

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

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    curriculum_id: Optional[str] = None

class SubjectInDB(SubjectBase):
    id: str = Field(..., alias="_id")
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

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

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    subject_id: Optional[str] = None

class CourseInDB(CourseBase):
    id: str = Field(..., alias="_id")
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

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

class UnitCreate(UnitBase):
    pass

class UnitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    course_id: Optional[str] = None

class UnitInDB(UnitBase):
    id: str = Field(..., alias="_id")
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

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

class TopicCreate(TopicBase):
    pass

class TopicUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    unit_id: Optional[str] = None

class TopicInDB(TopicBase):
    id: str = Field(..., alias="_id")
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

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