# AI Question Generator API

A FastAPI-based backend system for an educational platform that allows teachers to generate AI-powered questions based on curriculum data.

## Features

- **User Management**: Admin, Teacher, and Student roles with appropriate permissions
- **Curriculum Management**: Hierarchical structure (Curriculum → Subject → Course → Unit → Topic)
- **Question Generation**: AI-powered question generation using OpenAI
- **Multiple Question Types**: Support for MCQ, Multiple Answer, True/False, and Fill-in-the-blank questions
- **Customizable Prompts**: Admin-managed prompt templates for AI generation
- **No Duplicates**: Content hashing to prevent duplicate questions
- **MongoDB Integration**: Flexible document storage for all system data

## Project Structure

```
question-generator-api/
├── .env                        # Environment variables
├── main.py                     # FastAPI application entrypoint
├── requirements.txt            # Dependencies
├── README.md                   # This file
├── app/
│   ├── __init__.py
│   ├── auth/                   # Authentication
│   ├── models/                 # Pydantic models
│   ├── routes/                 # API routes
│   ├── services/               # Business logic
│   ├── config/                 # Configuration
│   └── utils/                  # Utility functions
└── tests/                      # Test files
```

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd question-generator-api
   ```

2. **Set up a virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**

   Create a `.env` file in the project root with the following variables:

   ```
   MONGO_URI=mongodb://localhost:27017/
   DB_NAME=question_generator_db
   SECRET_KEY=your_secret_key_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. **Run the application**

   ```bash
   python main.py
   ```

   The API will be available at http://localhost:8000

6. **View API documentation**

   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## API Overview

### Authentication Endpoints

- `POST /api/login` - Authenticate and receive JWT token
- `POST /api/oauth/token` - OAuth2 compatible authentication

### Admin Endpoints

- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users
- `GET /api/users/{user_id}` - Get a specific user
- `PUT /api/users/{user_id}` - Update a user
- `DELETE /api/users/{user_id}` - Delete a user
- `POST /api/users/{user_id}/reset-password` - Reset a user's password
- `POST /api/users/{user_id}/deactivate` - Deactivate a user
- `POST /api/users/{user_id}/activate` - Activate a user

### Curriculum Endpoints

- `POST /api/curriculum` - Create a new curriculum
- `GET /api/curriculum` - Get all curricula
- `GET /api/curriculum/{curriculum_id}` - Get a specific curriculum
- `GET /api/curriculum/{curriculum_id}/full` - Get curriculum with full hierarchy
- `PUT /api/curriculum/{curriculum_id}` - Update a curriculum
- `DELETE /api/curriculum/{curriculum_id}` - Delete a curriculum

Similar endpoints exist for subjects, courses, units, and topics.

### Question Endpoints

- `POST /api/questions` - Create a question manually
- `GET /api/questions` - Get all questions with optional filters
- `GET /api/questions/{question_id}` - Get a specific question
- `PUT /api/questions/{question_id}` - Update a question
- `DELETE /api/questions/{question_id}` - Delete a question
- `POST /api/questions/ai/generate` - Generate questions using AI
- `POST /api/questions/ai/regenerate` - Regenerate a specific question
- `POST /api/questions/batch/delete` - Delete multiple questions

### Prompt Template Endpoints

- `POST /api/prompts` - Create a new prompt template
- `GET /api/prompts` - Get all prompt templates
- `GET /api/prompts/default` - Get the default prompt template
- `GET /api/prompts/{prompt_id}` - Get a specific prompt template
- `PUT /api/prompts/{prompt_id}` - Update a prompt template
- `DELETE /api/prompts/{prompt_id}` - Delete a prompt template
- `POST /api/prompts/{prompt_id}/set-default` - Set a prompt as default

### Teacher Endpoints

- `GET /api/teacher/dashboard` - Get teacher dashboard data
- `GET /api/teacher/activity` - Get teacher activity stats

### Student Endpoints

- `GET /api/student/dashboard` - Get student dashboard data
- `GET /api/student/question-sets` - Get all available question sets
- `GET /api/student/topic/{topic_id}/questions` - Get questions for a topic
- `POST /api/student/practice-quiz` - Generate a practice quiz

## Development

### Running Tests

```bash
pytest
```

### Adding New Features

1. Define models in `app/models/`
2. Implement business logic in `app/services/`
3. Create API endpoints in `app/routes/`
4. Update main.py to include new routes if needed

## License

[MIT License](LICENSE)
