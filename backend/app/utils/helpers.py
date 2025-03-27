# backend/app/utils/helpers.py - Add slug generation utilities

import re
import hashlib
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import json
from slugify import slugify as python_slugify
import uuid

def convert_object_id_to_str(obj: Any) -> Any:
    """
    Recursively convert ObjectId types in a dictionary to strings
    """
    if isinstance(obj, dict):
        return {k: convert_object_id_to_str(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_object_id_to_str(item) for item in obj]
    elif str(type(obj)) == "<class 'bson.objectid.ObjectId'>":
        return str(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    else:
        return obj

def sanitize_string(text: str) -> str:
    """
    Sanitize a string by removing special characters and normalizing whitespace
    """
    if not text:
        return ""
    
    # Remove HTML tags if any
    text = re.sub(r'<[^>]+>', '', text)
    
    # Replace multiple whitespace with a single space
    text = re.sub(r'\s+', ' ', text)
    
    # Strip leading and trailing whitespace
    return text.strip()

def compute_content_hash(content: Union[str, Dict, List]) -> str:
    """
    Compute a hash for content to detect duplicates
    """
    if isinstance(content, (dict, list)):
        content = json.dumps(content, sort_keys=True)
    
    # Convert to string if not already
    content_str = str(content)
    
    # Normalize text: lowercase, remove extra whitespace
    normalized = re.sub(r'\s+', ' ', content_str.lower()).strip()
    
    # Compute hash
    return hashlib.md5(normalized.encode('utf-8')).hexdigest()

def format_error_response(error: Exception) -> Dict[str, Any]:
    """
    Format an exception into a standard error response
    """
    return {
        "error": type(error).__name__,
        "detail": str(error)
    }

def validate_option_format(options: List[str], question_type: str) -> bool:
    """
    Validate that options are correctly formatted for the given question type
    """
    if not isinstance(options, list):
        return False
    
    # Check if we have options (except for fill-in-the-blank which might not need them)
    if question_type != "Fill-in-the-blank" and len(options) == 0:
        return False
    
    # For MCQ, we need exactly 4 options
    if question_type == "MCQ" and len(options) != 4:
        return False
    
    # For MultipleAnswer, we need at least 3 options
    if question_type == "MultipleAnswer" and len(options) < 3:
        return False
    
    # For True/False, we need exactly 2 options: True and False
    if question_type == "True/False":
        if len(options) != 2:
            return False
        if "True" not in options or "False" not in options:
            return False
    
    # Check that all options are strings
    return all(isinstance(option, str) for option in options)

def validate_correct_answer(correct_answer: Union[str, List[str]], question_type: str, options: List[str]) -> bool:
    """
    Validate that the correct answer is valid for the given question type and options
    """
    # For MultipleAnswer, correct_answer should be a list
    if question_type == "MultipleAnswer":
        if not isinstance(correct_answer, list):
            return False
        
        # All correct answers should be in the options
        return all(answer in options for answer in correct_answer)
    
    # For other types, correct_answer should be a string
    elif not isinstance(correct_answer, str):
        return False
    
    # For MCQ and True/False, correct_answer should be one of the options
    if question_type in ["MCQ", "True/False"]:
        return correct_answer in options
    
    # For Fill-in-the-blank, we just need a non-empty string
    return len(correct_answer) > 0

def slugify(text: str) -> str:
    """Wrapper around python-slugify to handle None values"""
    if not text:
        return ""
    return python_slugify(text)

def generate_slug(name: str, add_random: bool = True) -> str:
    """
    Generate a URL-friendly slug from a name
    
    Args:
        name: The string to convert to a slug
        add_random: Whether to add a random suffix for uniqueness
        
    Returns:
        A URL-friendly slug
    """
    # Generate base slug
    base_slug = slugify(name)
    
    # Add a short random suffix if requested
    if add_random:
        # Generate a short unique ID (first 8 chars of a UUID)
        short_id = str(uuid.uuid4())[:8]
        return f"{base_slug}-{short_id}"
    
    return base_slug

def check_slug_exists(collection, slug: str) -> bool:
    """
    Check if a slug already exists in a collection
    
    Args:
        collection: MongoDB collection to check
        slug: The slug to check
        
    Returns:
        True if slug exists, False otherwise
    """
    return collection.find_one({"slug": slug}) is not None

def create_unique_slug(collection, name: str) -> str:
    """
    Create a unique slug for a collection
    
    Args:
        collection: MongoDB collection to check for uniqueness
        name: The name to create a slug from
        
    Returns:
        A unique slug for the collection
    """
    # First try without random suffix
    base_slug = generate_slug(name, add_random=False)
    
    # Check if it exists
    if not check_slug_exists(collection, base_slug):
        return base_slug
    
    # If it exists, add a random suffix
    unique_slug = generate_slug(name, add_random=True)
    
    # In the rare case that even this exists, keep trying with new UUIDs
    attempt = 1
    while check_slug_exists(collection, unique_slug) and attempt < 5:
        unique_slug = generate_slug(name, add_random=True)
        attempt += 1
    
    return unique_slug