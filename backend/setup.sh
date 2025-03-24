#!/bin/bash

# Define directories
directories=(
  "app"
  "app/auth"
  "app/models"
  "app/routes"
  "app/services"
  "app/config"
  "app/utils"
  "tests"
)

# Define files
files=(
  ".env"
  "main.py"
  "requirements.txt"
  "app/__init__.py"
  "app/auth/__init__.py"
  "app/auth/auth_bearer.py"
  "app/auth/auth_handler.py"
  "app/auth/auth_routes.py"
  "app/models/__init__.py"
  "app/models/admin.py"
  "app/models/curriculum.py"
  "app/models/question.py"
  "app/models/teacher.py"
  "app/models/student.py"
  "app/models/user.py"
  "app/routes/__init__.py"
  "app/routes/admin_routes.py"
  "app/routes/curriculum_routes.py"
  "app/routes/question_routes.py"
  "app/routes/teacher_routes.py"
  "app/routes/student_routes.py"
  "app/services/__init__.py"
  "app/services/ai_service.py"
  "app/services/admin_service.py"
  "app/services/curriculum_service.py"
  "app/services/question_service.py"
  "app/services/teacher_service.py"
  "app/services/student_service.py"
  "app/config/__init__.py"
  "app/config/db.py"
  "app/utils/__init__.py"
  "app/utils/helpers.py"
  "app/utils/prompt_templates.py"
)

# Create directories
for dir in "${directories[@]}"; do
  mkdir -p "$dir"
done

# Create empty files
for file in "${files[@]}"; do
  touch "$file"
done

echo "✅ Folder and file structure created successfully!"
