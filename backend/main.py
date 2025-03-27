# backend/main.py - Updated CORS Configuration

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os

from app.auth.auth_routes import router as auth_router
from app.routes.admin_routes import router as admin_router
from app.routes.curriculum_routes import router as curriculum_router
from app.routes.question_routes import router as question_router
from app.routes.prompt_routes import router as prompt_router
from app.routes.teacher_routes import router as teacher_router
from app.routes.student_routes import router as student_router
from app.routes.student_auth_routes import router as student_auth_router

app = FastAPI(
    title="AI Question Generator API",
    description="API for an AI-powered educational question generation system",
    version="1.0.0"
)

# Get frontend URL from environment or default to localhost
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

# CORS middleware configuration - Updated for better security and reliability
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000", "http://127.0.0.1:3000"],  # Specify allowed origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # Specify allowed methods
    allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],  # Specify allowed headers
    expose_headers=["Content-Type", "Authorization"],  # Headers that can be exposed to the browser
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(curriculum_router, prefix="/api")
app.include_router(question_router, prefix="/api")
app.include_router(prompt_router, prefix="/api")
app.include_router(teacher_router, prefix="/api")
app.include_router(student_router, prefix="/api")
app.include_router(student_auth_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to the AI Question Generator API"}

@app.get("/api/health")
async def health_check():
    return JSONResponse(content={"status": "healthy"})

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)