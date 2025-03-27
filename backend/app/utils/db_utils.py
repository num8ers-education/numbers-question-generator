# backend/app/utils/db_utils.py
from typing import Dict, List, Any, Union
from bson import ObjectId

def transform_object_id(obj: Any) -> Any:
    """
    Transform MongoDB document by converting _id to id.
    Also handles nested documents and arrays.
    """
    if isinstance(obj, dict):
        # Handle MongoDB document
        result = {}
        for key, value in obj.items():
            if key == '_id':
                # Convert _id to id
                result['id'] = str(value)
            else:
                # Process other fields recursively
                result[key] = transform_object_id(value)
        return result
    elif isinstance(obj, list):
        # Handle arrays of documents
        return [transform_object_id(item) for item in obj]
    elif isinstance(obj, ObjectId):
        # Convert ObjectId to string
        return str(obj)
    else:
        # Return other types as is
        return obj