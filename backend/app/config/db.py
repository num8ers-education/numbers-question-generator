# backend/app/config/db.py - Update indexes to include slug fields

from pymongo import MongoClient, errors
from dotenv import load_dotenv
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# MongoDB connection details
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://js3233002:Nrq3bHri56lzr7H4@cluster0.pmxkhv2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
DB_NAME = os.getenv("DB_NAME", "question_generator_db")

try:
    # Connect to MongoDB
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Check connection
    client.server_info()
    logger.info(f"Connected to MongoDB database: {DB_NAME}")
    
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
    try:
        users_collection.create_index("email", unique=True)
        curriculum_collection.create_index("name", unique=True)
        curriculum_collection.create_index("slug", unique=True)  # Add slug index
        subjects_collection.create_index([("name", 1), ("curriculum_id", 1)], unique=True)
        subjects_collection.create_index("slug", unique=True)  # Add slug index
        courses_collection.create_index([("name", 1), ("subject_id", 1)], unique=True)
        courses_collection.create_index("slug", unique=True)  # Add slug index
        units_collection.create_index([("name", 1), ("course_id", 1)], unique=True)
        units_collection.create_index("slug", unique=True)  # Add slug index
        topics_collection.create_index([("name", 1), ("unit_id", 1)], unique=True)
        topics_collection.create_index("slug", unique=True)  # Add slug index
        questions_collection.create_index("question_text")
        logger.info("Database indexes created successfully")
    except errors.OperationFailure as e:
        logger.warning(f"Error creating indexes: {e}")

except errors.ServerSelectionTimeoutError as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise

except errors.ConfigurationError as e:
    logger.error(f"MongoDB configuration error: {e}")
    raise

except Exception as e:
    logger.error(f"Unexpected error when connecting to MongoDB: {e}")
    raise