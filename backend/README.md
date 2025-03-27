AI Question Generator API
A FastAPI-based backend system for an educational platform that allows teachers to generate AI-powered questions based on curriculum data.
Features

User Management: Admin, Teacher, and Student roles with appropriate permissions
Curriculum Management: Hierarchical structure (Curriculum → Subject → Course → Unit → Topic)
Question Generation: AI-powered question generation using OpenAI
Multiple Question Types: Support for MCQ, Multiple Answer, True/False, and Fill-in-the-blank questions
Customizable Prompts: Admin-managed prompt templates for AI generation
No Duplicates: Content hashing to prevent duplicate questions
MongoDB Integration: Flexible document storage for all system data
SEO-Friendly URLs: All curriculum items have slug fields for better URLs

Getting Started

Clone the repository
bashCopygit clone <repository-url>
cd question-generator-api

Set up a virtual environment
bashCopypython -m venv venv
source venv/bin/activate # On Windows: venv\Scripts\activate

Install dependencies
bashCopypip install -r requirements.txt

Configure environment variables
Create a .env file in the project root with the following variables:
CopyMONGO_URI=mongodb://localhost:27017/
DB_NAME=question_generator_db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
OPENAI_API_KEY=your_openai_api_key_here
FRONTEND_URL=http://localhost:3000

Create an admin user
bashCopypython scripts/create_admin.py --email=admin@example.com --password=admin123 --name="Admin User"
Or manually with:

pythonCopypython -c "from app.auth.auth_handler import get_password_hash; from datetime import datetime; from bson import ObjectId; from pymongo import MongoClient; from dotenv import load_dotenv; import os; load_dotenv(); client = MongoClient(os.getenv('MONGO_URI')); db = client[os.getenv('DB_NAME')]; admin_id = ObjectId(); db.users.insert_one({'\_id': admin_id, 'email': 'admin@example.com', 'full_name': 'Admin User', 'role': 'admin', 'hashed_password': get_password_hash('admin123'), 'is_active': True, 'created_at': datetime.utcnow(), 'updated_at': datetime.utcnow()}); print(f'Admin user created with ID: {admin_id}')"

Run the application
bashCopypython main.py
Or with uvicorn directly:
bashCopyuvicorn main:app --reload --host 0.0.0.0 --port 8000
The API will be available at http://localhost:8000
View API documentation

Swagger UI: http://localhost:8000/docs
ReDoc: http://localhost:8000/redoc

Project Structure
Copy.
├── app/ # Main application package
│ ├── auth/ # Authentication modules
│ │ ├── auth_bearer.py # JWT bearer token validation
│ │ ├── auth_handler.py # JWT token generation and validation
│ │ └── auth_routes.py # Authentication endpoints
│ ├── config/ # Configuration modules
│ │ └── db.py # MongoDB connection and setup
│ ├── models/ # Pydantic models
│ │ ├── admin.py # Admin-specific models
│ │ ├── curriculum.py # Curriculum, subject, course, etc. models
│ │ ├── question.py # Question models and enums
│ │ ├── student.py # Student-specific models
│ │ ├── teacher.py # Teacher-specific models
│ │ └── user.py # User models and roles
│ ├── routes/ # API endpoints
│ │ ├── admin_routes.py # Admin endpoints
│ │ ├── curriculum_routes.py # Curriculum management endpoints
│ │ ├── prompt_routes.py # Prompt template endpoints
│ │ ├── question_routes.py # Question management endpoints
│ │ ├── student_auth_routes.py # Student auth endpoints
│ │ ├── student_routes.py # Student endpoints
│ │ └── teacher_routes.py # Teacher endpoints
│ ├── services/ # Business logic
│ │ ├── admin_service.py # Admin service
│ │ ├── ai_service.py # OpenAI integration
│ │ ├── curriculum_service.py # Curriculum service
│ │ ├── question_service.py # Question service
│ │ ├── student_service.py # Student service
│ │ └── teacher_service.py # Teacher service
│ └── utils/ # Utilities
│ ├── helpers.py # Helper functions
│ └── prompt_templates.py # AI prompt templates
├── scripts/ # Utility scripts
│ ├── add_slugs_to_existing_data.py # Add slugs to existing data
│ └── create_admin.py # Create admin user script
├── tests/ # Test modules
│ └── test_auth.py # Authentication tests
├── .env # Environment variables
├── main.py # Application entry point
└── requirements.txt # Dependencies
API Overview
Authentication Endpoints

POST /api/login - Authenticate and receive JWT token
POST /api/oauth/token - OAuth2 compatible authentication

Admin Endpoints

POST /api/users - Create a new user
GET /api/users - Get all users
GET /api/users/{user_id} - Get a specific user
PUT /api/users/{user_id} - Update a user
DELETE /api/users/{user_id} - Delete a user
POST /api/users/{user_id}/reset-password - Reset a user's password
POST /api/users/{user_id}/deactivate - Deactivate a user
POST /api/users/{user_id}/activate - Activate a user

Curriculum Endpoints

POST /api/curriculum - Create a new curriculum
GET /api/curriculum - Get all curricula
GET /api/curriculum/{curriculum_id_or_slug} - Get a specific curriculum by ID or slug
GET /api/curriculum/{curriculum_id_or_slug}/full - Get curriculum with full hierarchy by ID or slug
PUT /api/curriculum/{curriculum_id_or_slug} - Update a curriculum by ID or slug
DELETE /api/curriculum/{curriculum_id_or_slug} - Delete a curriculum by ID or slug

Similar endpoints exist for subjects, courses, units, and topics.
Question Endpoints

POST /api/questions - Create a question manually
GET /api/questions - Get all questions with optional filters
GET /api/questions/{question_id} - Get a specific question
PUT /api/questions/{question_id} - Update a question
DELETE /api/questions/{question_id} - Delete a question
POST /api/questions/ai/generate - Generate questions using AI
POST /api/questions/ai/regenerate - Regenerate a specific question
POST /api/questions/batch/delete - Delete multiple questions

Prompt Template Endpoints

POST /api/prompts - Create a new prompt template
GET /api/prompts - Get all prompt templates
GET /api/prompts/default - Get the default prompt template
GET /api/prompts/{prompt_id} - Get a specific prompt template
PUT /api/prompts/{prompt_id} - Update a prompt template
DELETE /api/prompts/{prompt_id} - Delete a prompt template
POST /api/prompts/{prompt_id}/set-default - Set a prompt as default

Teacher Endpoints

GET /api/teacher/dashboard - Get teacher dashboard data
GET /api/teacher/activity - Get teacher activity stats

Student Endpoints

GET /api/student/dashboard - Get student dashboard data
GET /api/student/question-sets - Get all available question sets
GET /api/student/topic/{topic_id}/questions - Get questions for a topic
POST /api/student/practice-quiz - Generate a practice quiz
POST /api/student/register - Register a new student account
POST /api/student/login - Student login endpoint

Development
Running Tests
bashCopypytest
Data Migration
To add slugs to existing data in the database, run:
bashCopypython scripts/add_slugs_to_existing_data.py
Adding New Features

Define models in app/models/
Implement business logic in app/services/
Create API endpoints in app/routes/
Update main.py to include new routes if needed

License
