# backend/scripts/model_converter.py
"""
Utility script to transform MongoDB documents to make them compatible with Pydantic models.
This helps debugging issues where MongoDB's _id fields need to be converted to id fields.
"""

import json
from bson import ObjectId
from datetime import datetime
import sys

class JSONEncoder(json.JSONEncoder):
    """Custom JSON encoder that can handle ObjectId and datetime objects"""
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

def transform_object_id(obj):
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

def print_transformed(obj):
    """Print the object before and after transformation"""
    print("\nOriginal Object:")
    print(json.dumps(obj, cls=JSONEncoder, indent=2))
    
    print("\nTransformed Object:")
    transformed = transform_object_id(obj)
    print(json.dumps(transformed, indent=2))
    
    return transformed

if __name__ == "__main__":
    # Example usage
    example = {
        "_id": ObjectId("5f50c31a8a1d7a9b3c7d5e6f"),
        "name": "Test Document",
        "created_at": datetime.utcnow(),
        "nested": {
            "_id": ObjectId("5f50c31a8a1d7a9b3c7d5e70"),
            "value": "Nested value"
        },
        "array": [
            {
                "_id": ObjectId("5f50c31a8a1d7a9b3c7d5e71"),
                "item": "Item 1"
            },
            {
                "_id": ObjectId("5f50c31a8a1d7a9b3c7d5e72"),
                "item": "Item 2"
            }
        ]
    }
    
    print_transformed(example)
    
    # If a JSON string is provided as an argument, transform it
    if len(sys.argv) > 1:
        try:
            with open(sys.argv[1], 'r') as f:
                data = json.load(f)
                print_transformed(data)
        except:
            print(f"Error loading file: {sys.argv[1]}")