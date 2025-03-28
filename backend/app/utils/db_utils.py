# backend/app/utils/db_utils.py
from typing import Dict, List, Any, Union
from bson import ObjectId
from datetime import datetime

def transform_object_id(data: Any) -> Any:
    """
    Transform MongoDB document by converting _id fields to id.
    Works recursively with nested objects and arrays.
    
    Args:
        data: MongoDB document or list of documents, or any nested structure
             containing ObjectId values
    
    Returns:
        Transformed data with _id -> id and ObjectId -> str
    """
    if data is None:
        return None
    
    if isinstance(data, list):
        return [transform_object_id(item) for item in data]
    
    if isinstance(data, dict):
        result = {}
        for key, value in data.items():
            if key == "_id":
                # Convert _id field to id
                result["id"] = str(value)
            elif isinstance(value, ObjectId):
                # Convert ObjectId values to strings
                result[key] = str(value)
            elif isinstance(value, dict) or isinstance(value, list):
                # Recursively transform nested objects and arrays
                result[key] = transform_object_id(value)
            elif isinstance(value, datetime):
                # Convert datetimes to ISO format strings
                result[key] = value.isoformat()
            else:
                # Keep other values as is
                result[key] = value
        return result
    
    # Convert ObjectId to string if encountered directly
    if isinstance(data, ObjectId):
        return str(data)
    
    # Convert datetime to ISO format if encountered directly
    if isinstance(data, datetime):
        return data.isoformat()
    
    # Return other types unchanged
    return data