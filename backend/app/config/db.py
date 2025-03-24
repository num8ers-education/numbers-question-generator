from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# MongoDB connection details
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "question_generator_db")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Collections
users_collection = db["users"]
curriculum_collection = db["curriculum"]
subjects_collection = db["subjects"]
courses_collection = db["courses"]
units_collection = db["units"]
topics_collection = db["topics"]
questions_collection = db["questions"]
prompts_collection = db["prompts"]

# Create indexes
users_collection.create_index("email", unique=True)
curriculum_collection.create_index("name", unique=True)
subjects_collection.create_index([("name", 1), ("curriculum_id", 1)], unique=True)
courses_collection.create_index([("name", 1), ("subject_id", 1)], unique=True)
units_collection.create_index([("name", 1), ("course_id", 1)], unique=True)
topics_collection.create_index([("name", 1), ("unit_id", 1)], unique=True)
questions_collection.create_index("question_text")