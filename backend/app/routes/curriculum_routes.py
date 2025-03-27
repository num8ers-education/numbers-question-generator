# backend/app/routes/curriculum_routes.py - Update to use slug fields and fix ObjectId transformation

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
from app.utils.helpers import create_unique_slug
from app.utils.db_utils import transform_object_id

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
    
    # Generate a unique slug if not provided
    if not curriculum.slug:
        curriculum.slug = create_unique_slug(curriculum_collection, curriculum.name)
    else:
        # Check if the provided slug already exists
        if curriculum_collection.find_one({"slug": curriculum.slug}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Curriculum with slug '{curriculum.slug}' already exists"
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
    # Transform MongoDB document to match Pydantic model
    return transform_object_id(created_curriculum)

@router.get("/curriculum", response_model=List[CurriculumOut])
async def get_all_curricula(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    token_data: TokenData = Depends(student_or_above_required)
):
    curricula = list(curriculum_collection.find().skip(skip).limit(limit))
    # Transform MongoDB documents to match Pydantic model
    return [transform_object_id(curriculum) for curriculum in curricula]

@router.get("/curriculum/{curriculum_id_or_slug}", response_model=CurriculumOut)
async def get_curriculum(
    curriculum_id_or_slug: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    # Try to find by ID first
    try:
        curriculum_oid = ObjectId(curriculum_id_or_slug)
        curriculum = curriculum_collection.find_one({"_id": curriculum_oid})
        if curriculum:
            return transform_object_id(curriculum)
    except:
        # If not a valid ObjectId, try to find by slug
        curriculum = curriculum_collection.find_one({"slug": curriculum_id_or_slug})
        if curriculum:
            return transform_object_id(curriculum)
    
    # If we get here, the curriculum wasn't found
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Curriculum with ID or slug {curriculum_id_or_slug} not found"
    )

@router.get("/curriculum/{curriculum_id_or_slug}/full", response_model=CurriculumWithSubjects)
async def get_curriculum_with_hierarchy(
    curriculum_id_or_slug: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    """Get full curriculum hierarchy with subjects, courses, units, and topics"""
    # Try to find by ID first
    curriculum = None
    curriculum_id = None
    
    try:
        curriculum_oid = ObjectId(curriculum_id_or_slug)
        curriculum = curriculum_collection.find_one({"_id": curriculum_oid})
        if curriculum:
            curriculum_id = str(curriculum["_id"])
    except:
        # If not a valid ObjectId, try to find by slug
        curriculum = curriculum_collection.find_one({"slug": curriculum_id_or_slug})
        if curriculum:
            curriculum_id = str(curriculum["_id"])
    
    if not curriculum:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Curriculum with ID or slug {curriculum_id_or_slug} not found"
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
    
    # Transform the entire structure to match Pydantic model
    return transform_object_id(curriculum_with_hierarchy)

@router.put("/curriculum/{curriculum_id_or_slug}", response_model=CurriculumOut)
async def update_curriculum(
    curriculum_id_or_slug: str,
    curriculum: CurriculumUpdate,
    token_data: TokenData = Depends(admin_required)
):
    # Try to find by ID first
    curriculum_obj = None
    try:
        curriculum_oid = ObjectId(curriculum_id_or_slug)
        curriculum_obj = curriculum_collection.find_one({"_id": curriculum_oid})
    except:
        # If not a valid ObjectId, try to find by slug
        curriculum_obj = curriculum_collection.find_one({"slug": curriculum_id_or_slug})
    
    if not curriculum_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Curriculum with ID or slug {curriculum_id_or_slug} not found"
        )
    
    curriculum_oid = curriculum_obj["_id"]
    
    # Check if the new name is already taken by another curriculum
    if curriculum.name and curriculum.name != curriculum_obj["name"]:
        if curriculum_collection.find_one({"name": curriculum.name, "_id": {"$ne": curriculum_oid}}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Curriculum with name '{curriculum.name}' already exists"
            )
    
    # If slug is being updated, check if it's unique
    if curriculum.slug and curriculum.slug != curriculum_obj.get("slug"):
        if curriculum_collection.find_one({"slug": curriculum.slug, "_id": {"$ne": curriculum_oid}}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Curriculum with slug '{curriculum.slug}' already exists"
            )
    
    # Generate a new slug if name is changing but slug isn't provided
    if curriculum.name and not curriculum.slug and curriculum.name != curriculum_obj["name"]:
        curriculum.slug = create_unique_slug(curriculum_collection, curriculum.name)
    
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
    return transform_object_id(updated_curriculum)

@router.delete("/curriculum/{curriculum_id_or_slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_curriculum(
    curriculum_id_or_slug: str,
    token_data: TokenData = Depends(admin_required)
):
    # Try to find by ID first
    curriculum_obj = None
    try:
        curriculum_oid = ObjectId(curriculum_id_or_slug)
        curriculum_obj = curriculum_collection.find_one({"_id": curriculum_oid})
    except:
        # If not a valid ObjectId, try to find by slug
        curriculum_obj = curriculum_collection.find_one({"slug": curriculum_id_or_slug})
    
    if not curriculum_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Curriculum with ID or slug {curriculum_id_or_slug} not found"
        )
    
    curriculum_oid = curriculum_obj["_id"]
    curriculum_id = str(curriculum_oid)
    
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

# Subject endpoints (similar updates needed for all other endpoints)
@router.post("/subjects", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
async def create_subject(subject: SubjectCreate, token_data: TokenData = Depends(admin_required)):
    # Check if curriculum exists
    curriculum = None
    try:
        curriculum_oid = ObjectId(subject.curriculum_id)
        curriculum = curriculum_collection.find_one({"_id": curriculum_oid})
    except:
        # If not a valid ObjectId, try to find by slug
        curriculum = curriculum_collection.find_one({"slug": subject.curriculum_id})
        if curriculum:
            subject.curriculum_id = str(curriculum["_id"])
    
    if not curriculum:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Curriculum with ID or slug {subject.curriculum_id} not found"
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
    
    # Generate a unique slug if not provided
    if not subject.slug:
        subject.slug = create_unique_slug(subjects_collection, subject.name)
    else:
        # Check if the provided slug already exists
        if subjects_collection.find_one({"slug": subject.slug}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Subject with slug '{subject.slug}' already exists"
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
    
    return transform_object_id(created_subject)

@router.get("/subjects", response_model=List[SubjectOut])
async def get_all_subjects(
    curriculum_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    token_data: TokenData = Depends(student_or_above_required)
):
    query = {}
    if curriculum_id:
        # Check if it's an ObjectId or a slug
        try:
            curriculum_oid = ObjectId(curriculum_id)
            query["curriculum_id"] = str(curriculum_oid)
        except:
            # If not a valid ObjectId, try to find curriculum by slug
            curriculum = curriculum_collection.find_one({"slug": curriculum_id})
            if curriculum:
                query["curriculum_id"] = str(curriculum["_id"])
            else:
                query["curriculum_id"] = curriculum_id  # Use the value as is
        
    subjects = subjects_collection.find(query).skip(skip).limit(limit)
    return [transform_object_id(subject) for subject in subjects]

@router.get("/subjects/{subject_id_or_slug}", response_model=SubjectOut)
async def get_subject(
    subject_id_or_slug: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    # Try to find by ID first
    subject = None
    try:
        subject_oid = ObjectId(subject_id_or_slug)
        subject = subjects_collection.find_one({"_id": subject_oid})
        if subject:
            return transform_object_id(subject)
    except:
        # If not a valid ObjectId, try to find by slug
        subject = subjects_collection.find_one({"slug": subject_id_or_slug})
        if subject:
            return transform_object_id(subject)
    
    # If we get here, the subject wasn't found
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Subject with ID or slug {subject_id_or_slug} not found"
    )

@router.get("/subjects/{subject_id_or_slug}/full", response_model=SubjectWithCourses)
async def get_subject_with_hierarchy(
    subject_id_or_slug: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    """Get subject with its courses, units, and topics"""
    # Try to find by ID first
    subject = None
    subject_id = None
    
    try:
        subject_oid = ObjectId(subject_id_or_slug)
        subject = subjects_collection.find_one({"_id": subject_oid})
        if subject:
            subject_id = str(subject["_id"])
    except:
        # If not a valid ObjectId, try to find by slug
        subject = subjects_collection.find_one({"slug": subject_id_or_slug})
        if subject:
            subject_id = str(subject["_id"])
    
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with ID or slug {subject_id_or_slug} not found"
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
    
    return transform_object_id(subject_with_hierarchy)

@router.put("/subjects/{subject_id_or_slug}", response_model=SubjectOut)
async def update_subject(
    subject_id_or_slug: str,
    subject: SubjectUpdate,
    token_data: TokenData = Depends(admin_required)
):
    # Try to find by ID first
    subject_obj = None
    try:
        subject_oid = ObjectId(subject_id_or_slug)
        subject_obj = subjects_collection.find_one({"_id": subject_oid})
    except:
        # If not a valid ObjectId, try to find by slug
        subject_obj = subjects_collection.find_one({"slug": subject_id_or_slug})
    
    if not subject_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with ID or slug {subject_id_or_slug} not found"
        )
    
    subject_oid = subject_obj["_id"]
    
    # If curriculum_id is being changed, check if the new curriculum exists
    if subject.curriculum_id and subject.curriculum_id != subject_obj["curriculum_id"]:
        curriculum = None
        try:
            curriculum_oid = ObjectId(subject.curriculum_id)
            curriculum = curriculum_collection.find_one({"_id": curriculum_oid})
            if curriculum:
                subject.curriculum_id = str(curriculum["_id"])
        except:
            # If not a valid ObjectId, try to find by slug
            curriculum = curriculum_collection.find_one({"slug": subject.curriculum_id})
            if curriculum:
                subject.curriculum_id = str(curriculum["_id"])
        
        if not curriculum:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Curriculum with ID or slug {subject.curriculum_id} not found"
            )
    
    # Check if the new name is already taken by another subject in the same curriculum
    curriculum_id = subject.curriculum_id or subject_obj["curriculum_id"]
    if subject.name and subject.name != subject_obj["name"]:
        if subjects_collection.find_one({
            "name": subject.name,
            "curriculum_id": curriculum_id,
            "_id": {"$ne": subject_oid}
        }):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Subject with name '{subject.name}' already exists in this curriculum"
            )
    
    # If slug is being updated, check if it's unique
    if subject.slug and subject.slug != subject_obj.get("slug"):
        if subjects_collection.find_one({"slug": subject.slug, "_id": {"$ne": subject_oid}}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Subject with slug '{subject.slug}' already exists"
            )
    
    # Generate a new slug if name is changing but slug isn't provided
    if subject.name and not subject.slug and subject.name != subject_obj["name"]:
        subject.slug = create_unique_slug(subjects_collection, subject.name)
    
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
    return transform_object_id(updated_subject)

@router.delete("/subjects/{subject_id_or_slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(
    subject_id_or_slug: str,
    token_data: TokenData = Depends(admin_required)
):
    # Try to find by ID first
    subject_obj = None
    try:
        subject_oid = ObjectId(subject_id_or_slug)
        subject_obj = subjects_collection.find_one({"_id": subject_oid})
    except:
        # If not a valid ObjectId, try to find by slug
        subject_obj = subjects_collection.find_one({"slug": subject_id_or_slug})
    
    if not subject_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with ID or slug {subject_id_or_slug} not found"
        )
    
    subject_oid = subject_obj["_id"]
    subject_id = str(subject_oid)
    
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
    subject = None
    try:
        subject_oid = ObjectId(course.subject_id)
        subject = subjects_collection.find_one({"_id": subject_oid})
    except:
        # If not a valid ObjectId, try to find by slug
        subject = subjects_collection.find_one({"slug": course.subject_id})
        if subject:
            course.subject_id = str(subject["_id"])
    
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with ID or slug {course.subject_id} not found"
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
    
    # Generate a unique slug if not provided
    if not course.slug:
        course.slug = create_unique_slug(courses_collection, course.name)
    else:
        # Check if the provided slug already exists
        if courses_collection.find_one({"slug": course.slug}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Course with slug '{course.slug}' already exists"
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
    
    return transform_object_id(created_course)

@router.get("/courses", response_model=List[CourseOut])
async def get_all_courses(
    subject_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    token_data: TokenData = Depends(student_or_above_required)
):
    query = {}
    if subject_id:
        # Check if it's an ObjectId or a slug
        try:
            subject_oid = ObjectId(subject_id)
            query["subject_id"] = str(subject_oid)
        except:
            # If not a valid ObjectId, try to find subject by slug
            subject = subjects_collection.find_one({"slug": subject_id})
            if subject:
                query["subject_id"] = str(subject["_id"])
            else:
                query["subject_id"] = subject_id  # Use the value as is
    
    courses = courses_collection.find(query).skip(skip).limit(limit)
    return [transform_object_id(course) for course in courses]

@router.get("/courses/{course_id_or_slug}", response_model=CourseOut)
async def get_course(
    course_id_or_slug: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    # Try to find by ID first
    course = None
    try:
        course_oid = ObjectId(course_id_or_slug)
        course = courses_collection.find_one({"_id": course_oid})
        if course:
            return transform_object_id(course)
    except:
        # If not a valid ObjectId, try to find by slug
        course = courses_collection.find_one({"slug": course_id_or_slug})
        if course:
            return transform_object_id(course)
    
    # If we get here, the course wasn't found
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Course with ID or slug {course_id_or_slug} not found"
    )

@router.get("/courses/{course_id_or_slug}/full", response_model=CourseWithUnits)
async def get_course_with_hierarchy(
    course_id_or_slug: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    """Get course with its units and topics"""
    # Try to find by ID first
    course = None
    course_id = None
    
    try:
        course_oid = ObjectId(course_id_or_slug)
        course = courses_collection.find_one({"_id": course_oid})
        if course:
            course_id = str(course["_id"])
    except:
        # If not a valid ObjectId, try to find by slug
        course = courses_collection.find_one({"slug": course_id_or_slug})
        if course:
            course_id = str(course["_id"])
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID or slug {course_id_or_slug} not found"
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
    
    return transform_object_id(course_with_hierarchy)

# Unit endpoints
@router.post("/units", response_model=UnitOut, status_code=status.HTTP_201_CREATED)
async def create_unit(unit: UnitCreate, token_data: TokenData = Depends(admin_required)):
    # Check if course exists
    course = None
    try:
        course_oid = ObjectId(unit.course_id)
        course = courses_collection.find_one({"_id": course_oid})
    except:
        # If not a valid ObjectId, try to find by slug
        course = courses_collection.find_one({"slug": unit.course_id})
        if course:
            unit.course_id = str(course["_id"])
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID or slug {unit.course_id} not found"
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
    
    # Generate a unique slug if not provided
    if not unit.slug:
        unit.slug = create_unique_slug(units_collection, unit.name)
    else:
        # Check if the provided slug already exists
        if units_collection.find_one({"slug": unit.slug}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unit with slug '{unit.slug}' already exists"
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
    
    return transform_object_id(created_unit)

@router.get("/units", response_model=List[UnitOut])
async def get_all_units(
    course_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    token_data: TokenData = Depends(student_or_above_required)
):
    query = {}
    if course_id:
        # Check if it's an ObjectId or a slug
        try:
            course_oid = ObjectId(course_id)
            query["course_id"] = str(course_oid)
        except:
            # If not a valid ObjectId, try to find course by slug
            course = courses_collection.find_one({"slug": course_id})
            if course:
                query["course_id"] = str(course["_id"])
            else:
                query["course_id"] = course_id  # Use the value as is
    
    units = units_collection.find(query).skip(skip).limit(limit)
    return [transform_object_id(unit) for unit in units]

@router.get("/units/{unit_id_or_slug}", response_model=UnitOut)
async def get_unit(
    unit_id_or_slug: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    # Try to find by ID first
    unit = None
    try:
        unit_oid = ObjectId(unit_id_or_slug)
        unit = units_collection.find_one({"_id": unit_oid})
        if unit:
            return transform_object_id(unit)
    except:
        # If not a valid ObjectId, try to find by slug
        unit = units_collection.find_one({"slug": unit_id_or_slug})
        if unit:
            return transform_object_id(unit)
    
    # If we get here, the unit wasn't found
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Unit with ID or slug {unit_id_or_slug} not found"
    )

@router.get("/units/{unit_id_or_slug}/topics", response_model=UnitWithTopics)
async def get_unit_with_topics(
    unit_id_or_slug: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    """Get unit with its topics"""
    # Try to find by ID first
    unit = None
    unit_id = None
    
    try:
        unit_oid = ObjectId(unit_id_or_slug)
        unit = units_collection.find_one({"_id": unit_oid})
        if unit:
            unit_id = str(unit["_id"])
    except:
        # If not a valid ObjectId, try to find by slug
        unit = units_collection.find_one({"slug": unit_id_or_slug})
        if unit:
            unit_id = str(unit["_id"])
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unit with ID or slug {unit_id_or_slug} not found"
        )
    
    # Get all topics for this unit
    topics = list(topics_collection.find({"unit_id": unit_id}))
    
    # Build the hierarchy
    unit_with_topics = dict(unit)
    unit_with_topics["topics"] = topics
    
    return transform_object_id(unit_with_topics)

# Topic endpoints
@router.post("/topics", response_model=TopicOut, status_code=status.HTTP_201_CREATED)
async def create_topic(topic: TopicCreate, token_data: TokenData = Depends(admin_required)):
    # Check if unit exists
    unit = None
    try:
        unit_oid = ObjectId(topic.unit_id)
        unit = units_collection.find_one({"_id": unit_oid})
    except:
        # If not a valid ObjectId, try to find by slug
        unit = units_collection.find_one({"slug": topic.unit_id})
        if unit:
            topic.unit_id = str(unit["_id"])
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unit with ID or slug {topic.unit_id} not found"
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
    
    # Generate a unique slug if not provided
    if not topic.slug:
        topic.slug = create_unique_slug(topics_collection, topic.name)
    else:
        # Check if the provided slug already exists
        if topics_collection.find_one({"slug": topic.slug}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Topic with slug '{topic.slug}' already exists"
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
    
    return transform_object_id(created_topic)

@router.get("/topics", response_model=List[TopicOut])
async def get_all_topics(
    unit_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    token_data: TokenData = Depends(student_or_above_required)
):
    query = {}
    if unit_id:
        # Check if it's an ObjectId or a slug
        try:
            unit_oid = ObjectId(unit_id)
            query["unit_id"] = str(unit_oid)
        except:
            # If not a valid ObjectId, try to find unit by slug
            unit = units_collection.find_one({"slug": unit_id})
            if unit:
                query["unit_id"] = str(unit["_id"])
            else:
                query["unit_id"] = unit_id  # Use the value as is
    
    topics = topics_collection.find(query).skip(skip).limit(limit)
    return [transform_object_id(topic) for topic in topics]

@router.get("/topics/{topic_id_or_slug}", response_model=TopicOut)
async def get_topic(
    topic_id_or_slug: str,
    token_data: TokenData = Depends(student_or_above_required)
):
    # Try to find by ID first
    topic = None
    try:
        topic_oid = ObjectId(topic_id_or_slug)
        topic = topics_collection.find_one({"_id": topic_oid})
        if topic:
            return transform_object_id(topic)
    except:
        # If not a valid ObjectId, try to find by slug
        topic = topics_collection.find_one({"slug": topic_id_or_slug})
        if topic:
            return transform_object_id(topic)
    
    # If we get here, the topic wasn't found
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Topic with ID or slug {topic_id_or_slug} not found"
    )