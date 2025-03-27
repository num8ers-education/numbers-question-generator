# backend/scripts/add_slugs_to_existing_data.py

import os
import sys
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.helpers import create_unique_slug

# Load environment variables
load_dotenv()

# MongoDB connection details
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://question_generator_db:AkJEPFZWqFq1EEZY@cluster0.7u93pus.mongodb.net/question_generator_db?retryWrites=true&w=majority")
DB_NAME = os.getenv("DB_NAME", "question_generator_db")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Collections
curriculum_collection = db["curriculum"]
subjects_collection = db["subjects"]
courses_collection = db["courses"]
units_collection = db["units"]
topics_collection = db["topics"]

def add_slugs_to_collection(collection, name_field="name"):
    """Add slugs to all documents in a collection that don't have one"""
    documents = collection.find({"slug": {"$exists": False}})
    
    count = 0
    for doc in documents:
        name = doc.get(name_field)
        if name:
            slug = create_unique_slug(collection, name)
            collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {
                    "slug": slug,
                    "updated_at": datetime.utcnow()
                }}
            )
            count += 1
    
    return count

def main():
    """Add slugs to all collections"""
    print("Adding slugs to existing data...")
    
    curriculum_count = add_slugs_to_collection(curriculum_collection)
    print(f"Added slugs to {curriculum_count} curricula")
    
    subject_count = add_slugs_to_collection(subjects_collection)
    print(f"Added slugs to {subject_count} subjects")
    
    course_count = add_slugs_to_collection(courses_collection)
    print(f"Added slugs to {course_count} courses")
    
    unit_count = add_slugs_to_collection(units_collection)
    print(f"Added slugs to {unit_count} units")
    
    topic_count = add_slugs_to_collection(topics_collection)
    print(f"Added slugs to {topic_count} topics")
    
    print("Done!")

if __name__ == "__main__":
    main()