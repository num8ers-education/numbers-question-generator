# backend/scripts/create_admin.py

import os
import sys
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.auth.auth_handler import get_password_hash

# Load environment variables
load_dotenv()

# MongoDB connection details
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://question_generator_db:AkJEPFZWqFq1EEZY@cluster0.7u93pus.mongodb.net/question_generator_db?retryWrites=true&w=majority")
DB_NAME = os.getenv("DB_NAME", "question_generator_db")

def create_admin_user(email="admin@example.com", password="admin123", full_name="Admin User"):
    """Create an admin user in the database"""
    
    # Connect to MongoDB
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    users_collection = db["users"]
    
    # Check if admin user already exists
    existing_admin = users_collection.find_one({"email": email})
    if existing_admin:
        print(f"Admin user with email {email} already exists.")
        return
    
    # Hash the password
    hashed_password = get_password_hash(password)
    
    # Create admin user
    admin_id = ObjectId()
    now = datetime.utcnow()
    
    # Prepare user data
    admin_data = {
        "_id": admin_id,
        "email": email,
        "full_name": full_name,
        "role": "admin",
        "hashed_password": hashed_password,
        "is_active": True,
        "created_at": now,
        "updated_at": now
    }
    
    # Insert admin user
    users_collection.insert_one(admin_data)
    
    print(f"Admin user created with ID: {admin_id}")
    print(f"Email: {email}")
    print(f"Password: {password}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Create an admin user for the Question Generator API")
    parser.add_argument("--email", default="admin@example.com", help="Admin email")
    parser.add_argument("--password", default="admin123", help="Admin password")
    parser.add_argument("--name", default="Admin User", help="Admin full name")
    
    args = parser.parse_args()
    
    create_admin_user(args.email, args.password, args.name)