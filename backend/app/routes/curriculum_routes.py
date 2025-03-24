from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
import pymongo

from app.auth.auth_bearer import admin_required, teacher_required, student_or_above_required
from app.config.db import (
    curriculum_collection, subjects_collection, 
    courses_collection, units_collection, topics_collection
)
from app.models.curriculum import (
    CurriculumCreate, CurriculumUpdate, CurriculumOut, CurriculumWithSubjects,
    SubjectCreate, SubjectUpdate, SubjectOut, SubjectWithCourses,
    CourseCreate, CourseUpdate, CourseOut, CourseWithUnits,
    UnitCreate, UnitUpdate, UnitOut, UnitWithTopics,
    TopicCreate, TopicUpdate, TopicOut
)
from app.models.user import TokenData

router = APIRouter(tags=["Curriculum"])

# Helper functions
def parse_object_id(id_str: str):
    try:
        return ObjectId(id_str)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid ID format: {id_str}"
        )

# Curriculum endpoints
@router.post("/curriculum", response_model=CurriculumOut, status_code=status.HTTP_201_CREATED)
async def create_curriculum(curriculum: CurriculumCreate, token_data: TokenData = Depends(admin_required)):
    # Check if curriculum with the same name already exists
    if curriculum_collection.find_one({"name": curriculum.name}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Curriculum with name '{curriculum.name}' already exists"
        )
    
    now = datetime.utcnow()
    curriculum_data = {
        **curriculum.dict(),
        "created_by": token_data.user_id,
        "created_at": now,
        "updated_at": now
    }
    
    result = curriculum_collection.insert_one(curriculum_data)
    
    created_curriculum = curriculum_collection.find_one({"_id": result.inserted_id})
    return created_curriculum

@router.get("/curriculum", response_model=List[CurriculumOut])
async def get_all_curricula(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    token_data: TokenData = Depends(student_or_above_required)
):
    curricula = curriculum_collection.find().skip(skip).limit(limit)
    return list(curricula)

@router.get("/curriculum/{curriculum_id}", response_model=CurriculumOut)
async def get_curriculum(
    curriculum_id: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    curriculum = curriculum_collection.find_one({"_id": parse_object_id(curriculum_id)})
    if not curriculum:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Curriculum with ID {curriculum_id} not found"
        )
    return curriculum

@router.get("/curriculum/{curriculum_id}/full", response_model=CurriculumWithSubjects)
async def get_curriculum_with_hierarchy(
    curriculum_id: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    """Get full curriculum hierarchy with subjects, courses, units, and topics"""
    curriculum_oid = parse_object_id(curriculum_id)
    curriculum = curriculum_collection.find_one({"_id": curriculum_oid})
    
    if not curriculum:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Curriculum with ID {curriculum_id} not found"
        )
    
    # Get all subjects for this curriculum
    subjects = list(subjects_collection.find({"curriculum_id": curriculum_id}))
    subject_ids = [str(subject["_id"]) for subject in subjects]
    
    # Get all courses for these subjects
    courses = list(courses_collection.find({"subject_id": {"$in": subject_ids}}))
    course_dict = {str(course["_id"]): course for course in courses}
    
    # Group courses by subject_id
    subject_courses = {}
    for course in courses:
        subject_id = course["subject_id"]
        if subject_id not in subject_courses:
            subject_courses[subject_id] = []
        subject_courses[subject_id].append(course)
    
    # Get all units for these courses
    course_ids = [str(course["_id"]) for course in courses]
    units = list(units_collection.find({"course_id": {"$in": course_ids}}))
    
    # Group units by course_id
    course_units = {}
    for unit in units:
        course_id = unit["course_id"]
        if course_id not in course_units:
            course_units[course_id] = []
        course_units[course_id].append(unit)
    
    # Get all topics for these units
    unit_ids = [str(unit["_id"]) for unit in units]
    topics = list(topics_collection.find({"unit_id": {"$in": unit_ids}}))
    
    # Group topics by unit_id
    unit_topics = {}
    for topic in topics:
        unit_id = topic["unit_id"]
        if unit_id not in unit_topics:
            unit_topics[unit_id] = []
        unit_topics[unit_id].append(topic)
    
    # Build the hierarchy
    curriculum_with_hierarchy = dict(curriculum)
    curriculum_with_hierarchy["subjects"] = []
    
    for subject in subjects:
        subject_dict = dict(subject)
        subject_dict["courses"] = []
        
        # Add courses to subject
        for course in subject_courses.get(str(subject["_id"]), []):
            course_dict = dict(course)
            course_dict["units"] = []
            
            # Add units to course
            for unit in course_units.get(str(course["_id"]), []):
                unit_dict = dict(unit)
                unit_dict["topics"] = unit_topics.get(str(unit["_id"]), [])
                course_dict["units"].append(unit_dict)
            
            subject_dict["courses"].append(course_dict)
        
        curriculum_with_hierarchy["subjects"].append(subject_dict)
    
    return curriculum_with_hierarchy

@router.put("/curriculum/{curriculum_id}", response_model=CurriculumOut)
async def update_curriculum(
    curriculum_id: str,
    curriculum: CurriculumUpdate,
    token_data: TokenData = Depends(admin_required)
):
    curriculum_oid = parse_object_id(curriculum_id)
    
    # Check if curriculum exists
    existing_curriculum = curriculum_collection.find_one({"_id": curriculum_oid})
    if not existing_curriculum:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Curriculum with ID {curriculum_id} not found"
        )
    
    # Check if the new name is already taken by another curriculum
    if curriculum.name and curriculum.name != existing_curriculum["name"]:
        if curriculum_collection.find_one({"name": curriculum.name, "_id": {"$ne": curriculum_oid}}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Curriculum with name '{curriculum.name}' already exists"
            )
    
    # Prepare update data, excluding None values
    update_data = {k: v for k, v in curriculum.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        
        # Update the curriculum
        curriculum_collection.update_one(
            {"_id": curriculum_oid},
            {"$set": update_data}
        )
    
    # Return the updated curriculum
    updated_curriculum = curriculum_collection.find_one({"_id": curriculum_oid})
    return updated_curriculum

@router.delete("/curriculum/{curriculum_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_curriculum(
    curriculum_id: str,
    token_data: TokenData = Depends(admin_required)
):
    curriculum_oid = parse_object_id(curriculum_id)
    
    # Check if curriculum exists
    existing_curriculum = curriculum_collection.find_one({"_id": curriculum_oid})
    if not existing_curriculum:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Curriculum with ID {curriculum_id} not found"
        )
    
    # Get all subjects for this curriculum
    subjects = subjects_collection.find({"curriculum_id": curriculum_id})
    subject_ids = [str(subject["_id"]) for subject in subjects]
    
    # Get all courses for these subjects
    courses = courses_collection.find({"subject_id": {"$in": subject_ids}})
    course_ids = [str(course["_id"]) for course in courses]
    
    # Get all units for these courses
    units = units_collection.find({"course_id": {"$in": course_ids}})
    unit_ids = [str(unit["_id"]) for unit in units]
    
    # Get all topics for these units
    topics = topics_collection.find({"unit_id": {"$in": unit_ids}})
    
    # Delete everything in reverse order (topics → units → courses → subjects → curriculum)
    topics_collection.delete_many({"unit_id": {"$in": unit_ids}})
    units_collection.delete_many({"course_id": {"$in": course_ids}})
    courses_collection.delete_many({"subject_id": {"$in": subject_ids}})
    subjects_collection.delete_many({"curriculum_id": curriculum_id})
    curriculum_collection.delete_one({"_id": curriculum_oid})
    
    return None

# Subject endpoints
@router.post("/subjects", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
async def create_subject(subject: SubjectCreate, token_data: TokenData = Depends(admin_required)):
    # Check if curriculum exists
    curriculum = curriculum_collection.find_one({"_id": parse_object_id(subject.curriculum_id)})
    if not curriculum:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Curriculum with ID {subject.curriculum_id} not found"
        )
    
    # Check if subject with the same name already exists in this curriculum
    if subjects_collection.find_one({
        "name": subject.name,
        "curriculum_id": subject.curriculum_id
    }):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Subject with name '{subject.name}' already exists in this curriculum"
        )
    
    now = datetime.utcnow()
    subject_data = {
        **subject.dict(),
        "created_by": token_data.user_id,
        "created_at": now,
        "updated_at": now
    }
    
    result = subjects_collection.insert_one(subject_data)
    created_subject = subjects_collection.find_one({"_id": result.inserted_id})
    
    return created_subject

@router.get("/subjects", response_model=List[SubjectOut])
async def get_all_subjects(
    curriculum_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    token_data: TokenData = Depends(student_or_above_required)
):
    query = {}
    if curriculum_id:
        query["curriculum_id"] = curriculum_id
        
    subjects = subjects_collection.find(query).skip(skip).limit(limit)
    return list(subjects)

@router.get("/subjects/{subject_id}", response_model=SubjectOut)
async def get_subject(
    subject_id: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    subject = subjects_collection.find_one({"_id": parse_object_id(subject_id)})
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with ID {subject_id} not found"
        )
    return subject

@router.get("/subjects/{subject_id}/full", response_model=SubjectWithCourses)
async def get_subject_with_hierarchy(
    subject_id: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    """Get subject with its courses, units, and topics"""
    subject_oid = parse_object_id(subject_id)
    subject = subjects_collection.find_one({"_id": subject_oid})
    
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with ID {subject_id} not found"
        )
    
    # Get all courses for this subject
    courses = list(courses_collection.find({"subject_id": subject_id}))
    course_ids = [str(course["_id"]) for course in courses]
    
    # Get all units for these courses
    units = list(units_collection.find({"course_id": {"$in": course_ids}}))
    
    # Group units by course_id
    course_units = {}
    for unit in units:
        course_id = unit["course_id"]
        if course_id not in course_units:
            course_units[course_id] = []
        course_units[course_id].append(unit)
    
    # Get all topics for these units
    unit_ids = [str(unit["_id"]) for unit in units]
    topics = list(topics_collection.find({"unit_id": {"$in": unit_ids}}))
    
    # Group topics by unit_id
    unit_topics = {}
    for topic in topics:
        unit_id = topic["unit_id"]
        if unit_id not in unit_topics:
            unit_topics[unit_id] = []
        unit_topics[unit_id].append(topic)
    
    # Build the hierarchy
    subject_with_hierarchy = dict(subject)
    subject_with_hierarchy["courses"] = []
    
    for course in courses:
        course_dict = dict(course)
        course_dict["units"] = []
        
        # Add units to course
        for unit in course_units.get(str(course["_id"]), []):
            unit_dict = dict(unit)
            unit_dict["topics"] = unit_topics.get(str(unit["_id"]), [])
            course_dict["units"].append(unit_dict)
        
        subject_with_hierarchy["courses"].append(course_dict)
    
    return subject_with_hierarchy

@router.put("/subjects/{subject_id}", response_model=SubjectOut)
async def update_subject(
    subject_id: str,
    subject: SubjectUpdate,
    token_data: TokenData = Depends(admin_required)
):
    subject_oid = parse_object_id(subject_id)
    
    # Check if subject exists
    existing_subject = subjects_collection.find_one({"_id": subject_oid})
    if not existing_subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with ID {subject_id} not found"
        )
    
    # If curriculum_id is being changed, check if the new curriculum exists
    if subject.curriculum_id and subject.curriculum_id != existing_subject["curriculum_id"]:
        curriculum = curriculum_collection.find_one({"_id": parse_object_id(subject.curriculum_id)})
        if not curriculum:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Curriculum with ID {subject.curriculum_id} not found"
            )
    
    # Check if the new name is already taken by another subject in the same curriculum
    curriculum_id = subject.curriculum_id or existing_subject["curriculum_id"]
    if subject.name and subject.name != existing_subject["name"]:
        if subjects_collection.find_one({
            "name": subject.name,
            "curriculum_id": curriculum_id,
            "_id": {"$ne": subject_oid}
        }):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Subject with name '{subject.name}' already exists in this curriculum"
            )
    
    # Prepare update data, excluding None values
    update_data = {k: v for k, v in subject.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        
        # Update the subject
        subjects_collection.update_one(
            {"_id": subject_oid},
            {"$set": update_data}
        )
    
    # Return the updated subject
    updated_subject = subjects_collection.find_one({"_id": subject_oid})
    return updated_subject

@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(
    subject_id: str,
    token_data: TokenData = Depends(admin_required)
):
    subject_oid = parse_object_id(subject_id)
    
    # Check if subject exists
    existing_subject = subjects_collection.find_one({"_id": subject_oid})
    if not existing_subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with ID {subject_id} not found"
        )
    
    # Get all courses for this subject
    courses = courses_collection.find({"subject_id": subject_id})
    course_ids = [str(course["_id"]) for course in courses]
    
    # Get all units for these courses
    units = units_collection.find({"course_id": {"$in": course_ids}})
    unit_ids = [str(unit["_id"]) for unit in units]
    
    # Get all topics for these units
    topics = topics_collection.find({"unit_id": {"$in": unit_ids}})
    
    # Delete everything in reverse order (topics → units → courses → subject)
    topics_collection.delete_many({"unit_id": {"$in": unit_ids}})
    units_collection.delete_many({"course_id": {"$in": course_ids}})
    courses_collection.delete_many({"subject_id": subject_id})
    subjects_collection.delete_one({"_id": subject_oid})
    
    return None

# Course endpoints
@router.post("/courses", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
async def create_course(course: CourseCreate, token_data: TokenData = Depends(admin_required)):
    # Check if subject exists
    subject = subjects_collection.find_one({"_id": parse_object_id(course.subject_id)})
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with ID {course.subject_id} not found"
        )
    
    # Check if course with the same name already exists in this subject
    if courses_collection.find_one({
        "name": course.name,
        "subject_id": course.subject_id
    }):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Course with name '{course.name}' already exists in this subject"
        )
    
    now = datetime.utcnow()
    course_data = {
        **course.dict(),
        "created_by": token_data.user_id,
        "created_at": now,
        "updated_at": now
    }
    
    result = courses_collection.insert_one(course_data)
    created_course = courses_collection.find_one({"_id": result.inserted_id})
    
    return created_course

@router.get("/courses", response_model=List[CourseOut])
async def get_all_courses(
    subject_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    token_data: TokenData = Depends(student_or_above_required)
):
    query = {}
    if subject_id:
        query["subject_id"] = subject_id
        
    courses = courses_collection.find(query).skip(skip).limit(limit)
    return list(courses)

@router.get("/courses/{course_id}", response_model=CourseOut)
async def get_course(
    course_id: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    course = courses_collection.find_one({"_id": parse_object_id(course_id)})
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID {course_id} not found"
        )
    return course

@router.get("/courses/{course_id}/full", response_model=CourseWithUnits)
async def get_course_with_hierarchy(
    course_id: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    """Get course with its units and topics"""
    course_oid = parse_object_id(course_id)
    course = courses_collection.find_one({"_id": course_oid})
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID {course_id} not found"
        )
    
    # Get all units for this course
    units = list(units_collection.find({"course_id": course_id}))
    unit_ids = [str(unit["_id"]) for unit in units]
    
    # Get all topics for these units
    topics = list(topics_collection.find({"unit_id": {"$in": unit_ids}}))
    
    # Group topics by unit_id
    unit_topics = {}
    for topic in topics:
        unit_id = topic["unit_id"]
        if unit_id not in unit_topics:
            unit_topics[unit_id] = []
        unit_topics[unit_id].append(topic)
    
    # Build the hierarchy
    course_with_hierarchy = dict(course)
    course_with_hierarchy["units"] = []
    
    for unit in units:
        unit_dict = dict(unit)
        unit_dict["topics"] = unit_topics.get(str(unit["_id"]), [])
        course_with_hierarchy["units"].append(unit_dict)
    
    return course_with_hierarchy

@router.put("/courses/{course_id}", response_model=CourseOut)
async def update_course(
    course_id: str,
    course: CourseUpdate,
    token_data: TokenData = Depends(admin_required)
):
    course_oid = parse_object_id(course_id)
    
    # Check if course exists
    existing_course = courses_collection.find_one({"_id": course_oid})
    if not existing_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID {course_id} not found"
        )
    
    # If subject_id is being changed, check if the new subject exists
    if course.subject_id and course.subject_id != existing_course["subject_id"]:
        subject = subjects_collection.find_one({"_id": parse_object_id(course.subject_id)})
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Subject with ID {course.subject_id} not found"
            )
    
    # Check if the new name is already taken by another course in the same subject
    subject_id = course.subject_id or existing_course["subject_id"]
    if course.name and course.name != existing_course["name"]:
        if courses_collection.find_one({
            "name": course.name,
            "subject_id": subject_id,
            "_id": {"$ne": course_oid}
        }):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Course with name '{course.name}' already exists in this subject"
            )
    
    # Prepare update data, excluding None values
    update_data = {k: v for k, v in course.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        
        # Update the course
        courses_collection.update_one(
            {"_id": course_oid},
            {"$set": update_data}
        )
    
    # Return the updated course
    updated_course = courses_collection.find_one({"_id": course_oid})
    return updated_course

@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: str,
    token_data: TokenData = Depends(admin_required)
):
    course_oid = parse_object_id(course_id)
    
    # Check if course exists
    existing_course = courses_collection.find_one({"_id": course_oid})
    if not existing_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID {course_id} not found"
        )
    
    # Get all units for this course
    units = units_collection.find({"course_id": course_id})
    unit_ids = [str(unit["_id"]) for unit in units]
    
    # Get all topics for these units
    topics = topics_collection.find({"unit_id": {"$in": unit_ids}})
    
    # Delete everything in reverse order (topics → units → course)
    topics_collection.delete_many({"unit_id": {"$in": unit_ids}})
    units_collection.delete_many({"course_id": course_id})
    courses_collection.delete_one({"_id": course_oid})
    
    return None

# Unit endpoints
@router.post("/units", response_model=UnitOut, status_code=status.HTTP_201_CREATED)
async def create_unit(unit: UnitCreate, token_data: TokenData = Depends(admin_required)):
    # Check if course exists
    course = courses_collection.find_one({"_id": parse_object_id(unit.course_id)})
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID {unit.course_id} not found"
        )
    
    # Check if unit with the same name already exists in this course
    if units_collection.find_one({
        "name": unit.name,
        "course_id": unit.course_id
    }):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unit with name '{unit.name}' already exists in this course"
        )
    
    now = datetime.utcnow()
    unit_data = {
        **unit.dict(),
        "created_by": token_data.user_id,
        "created_at": now,
        "updated_at": now
    }
    
    result = units_collection.insert_one(unit_data)
    created_unit = units_collection.find_one({"_id": result.inserted_id})
    
    return created_unit

@router.get("/units", response_model=List[UnitOut])
async def get_all_units(
    course_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    token_data: TokenData = Depends(student_or_above_required)
):
    query = {}
    if course_id:
        query["course_id"] = course_id
        
    units = units_collection.find(query).skip(skip).limit(limit)
    return list(units)

@router.get("/units/{unit_id}", response_model=UnitOut)
async def get_unit(
    unit_id: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    unit = units_collection.find_one({"_id": parse_object_id(unit_id)})
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unit with ID {unit_id} not found"
        )
    return unit

@router.get("/units/{unit_id}/full", response_model=UnitWithTopics)
async def get_unit_with_topics(
    unit_id: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    """Get unit with its topics"""
    unit_oid = parse_object_id(unit_id)
    unit = units_collection.find_one({"_id": unit_oid})
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unit with ID {unit_id} not found"
        )
    
    # Get all topics for this unit
    topics = list(topics_collection.find({"unit_id": unit_id}))
    
    # Build the hierarchy
    unit_with_topics = dict(unit)
    unit_with_topics["topics"] = topics
    
    return unit_with_topics

@router.put("/units/{unit_id}", response_model=UnitOut)
async def update_unit(
    unit_id: str,
    unit: UnitUpdate,
    token_data: TokenData = Depends(admin_required)
):
    unit_oid = parse_object_id(unit_id)
    
    # Check if unit exists
    existing_unit = units_collection.find_one({"_id": unit_oid})
    if not existing_unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unit with ID {unit_id} not found"
        )
    
    # If course_id is being changed, check if the new course exists
    if unit.course_id and unit.course_id != existing_unit["course_id"]:
        course = courses_collection.find_one({"_id": parse_object_id(unit.course_id)})
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Course with ID {unit.course_id} not found"
            )
    
    # Check if the new name is already taken by another unit in the same course
    course_id = unit.course_id or existing_unit["course_id"]
    if unit.name and unit.name != existing_unit["name"]:
        if units_collection.find_one({
            "name": unit.name,
            "course_id": course_id,
            "_id": {"$ne": unit_oid}
        }):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unit with name '{unit.name}' already exists in this course"
            )
    
    # Prepare update data, excluding None values
    update_data = {k: v for k, v in unit.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        
        # Update the unit
        units_collection.update_one(
            {"_id": unit_oid},
            {"$set": update_data}
        )
    
    # Return the updated unit
    updated_unit = units_collection.find_one({"_id": unit_oid})
    return updated_unit

@router.delete("/units/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_unit(
    unit_id: str,
    token_data: TokenData = Depends(admin_required)
):
    unit_oid = parse_object_id(unit_id)
    
    # Check if unit exists
    existing_unit = units_collection.find_one({"_id": unit_oid})
    if not existing_unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unit with ID {unit_id} not found"
        )
    
    # Delete all topics for this unit
    topics_collection.delete_many({"unit_id": unit_id})
    
    # Delete the unit
    units_collection.delete_one({"_id": unit_oid})
    
    return None

# Topic endpoints
@router.post("/topics", response_model=TopicOut, status_code=status.HTTP_201_CREATED)
async def create_topic(topic: TopicCreate, token_data: TokenData = Depends(admin_required)):
    # Check if unit exists
    unit = units_collection.find_one({"_id": parse_object_id(topic.unit_id)})
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unit with ID {topic.unit_id} not found"
        )
    
    # Check if topic with the same name already exists in this unit
    if topics_collection.find_one({
        "name": topic.name,
        "unit_id": topic.unit_id
    }):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Topic with name '{topic.name}' already exists in this unit"
        )
    
    now = datetime.utcnow()
    topic_data = {
        **topic.dict(),
        "created_by": token_data.user_id,
        "created_at": now,
        "updated_at": now
    }
    
    result = topics_collection.insert_one(topic_data)
    created_topic = topics_collection.find_one({"_id": result.inserted_id})
    
    return created_topic

@router.get("/topics", response_model=List[TopicOut])
async def get_all_topics(
    unit_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    token_data: TokenData = Depends(student_or_above_required)
):
    query = {}
    if unit_id:
        query["unit_id"] = unit_id
        
    topics = topics_collection.find(query).skip(skip).limit(limit)
    return list(topics)

@router.get("/topics/{topic_id}", response_model=TopicOut)
async def get_topic(
    topic_id: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    topic = topics_collection.find_one({"_id": parse_object_id(topic_id)})
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic with ID {topic_id} not found"
        )
    return topic

@router.put("/topics/{topic_id}", response_model=TopicOut)
async def update_topic(
    topic_id: str,
    topic: TopicUpdate,
    token_data: TokenData = Depends(admin_required)
):
    topic_oid = parse_object_id(topic_id)
    
    # Check if topic exists
    existing_topic = topics_collection.find_one({"_id": topic_oid})
    if not existing_topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic with ID {topic_id} not found"
        )
    
    # If unit_id is being changed, check if the new unit exists
    if topic.unit_id and topic.unit_id != existing_topic["unit_id"]:
        unit = units_collection.find_one({"_id": parse_object_id(topic.unit_id)})
        if not unit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Unit with ID {topic.unit_id} not found"
            )
    
    # Check if the new name is already taken by another topic in the same unit
    unit_id = topic.unit_id or existing_topic["unit_id"]
    if topic.name and topic.name != existing_topic["name"]:
        if topics_collection.find_one({
            "name": topic.name,
            "unit_id": unit_id,
            "_id": {"$ne": topic_oid}
        }):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Topic with name '{topic.name}' already exists in this unit"
            )
    
    # Prepare update data, excluding None values
    update_data = {k: v for k, v in topic.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        
        # Update the topic
        topics_collection.update_one(
            {"_id": topic_oid},
            {"$set": update_data}
        )
    
    # Return the updated topic
    updated_topic = topics_collection.find_one({"_id": topic_oid})
    return updated_topic

@router.delete("/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topic(
    topic_id: str,
    token_data: TokenData = Depends(admin_required)
):
    topic_oid = parse_object_id(topic_id)
    
    # Check if topic exists
    existing_topic = topics_collection.find_one({"_id": topic_oid})
    if not existing_topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic with ID {topic_id} not found"
        )
    
    # Delete the topic
    topics_collection.delete_one({"_id": topic_oid})
    
    return None