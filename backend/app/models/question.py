from pydantic import BaseModel, Field
from typing import Optional, List, Union, Any
from datetime import datetime
from enum import Enum

class QuestionType(str, Enum):
    MCQ = "MCQ"
    MULTIPLE_ANSWER = "MultipleAnswer"
    TRUE_FALSE = "True/False"
    FILL_IN_THE_BLANK = "Fill-in-the-blank"

class DifficultyLevel(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"
    MIXED = "Mixed"

class QuestionBase(BaseModel):
    question_text: str
    question_type: QuestionType
    options: List[str]
    correct_answer: Union[str, List[str]]
    explanation: str
    difficulty: DifficultyLevel
    topic_id: str

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[QuestionType] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[Union[str, List[str]]] = None
    explanation: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    topic_id: Optional[str] = None

class QuestionInDB(QuestionBase):
    id: str = Field(..., alias="_id")
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Fields to track AI generation
    ai_generated: bool = True
    ai_model: Optional[str] = None
    raw_ai_response: Optional[Any] = None
    ai_prompt: Optional[str] = None
    # To prevent duplicate generations
    content_hash: Optional[str] = None

class QuestionOut(QuestionBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    ai_generated: bool

# Model for question generation request
class QuestionGenerationRequest(BaseModel):
    topic_id: str
    num_questions: int = Field(5, ge=1, le=20)
    question_types: List[QuestionType]
    difficulty: DifficultyLevel
    custom_prompt: Optional[str] = None

# Model for regeneration request
class QuestionRegenerationRequest(BaseModel):
    question_id: str
    with_custom_prompt: Optional[str] = None

# Model for batch question operations
class QuestionBatchAction(BaseModel):
    question_ids: List[str]

# Prompt model
class PromptTemplate(BaseModel):
    name: str
    description: Optional[str] = None
    template: str
    created_by: str
    is_default: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

class PromptTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    template: str
    is_default: bool = False

class PromptTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    template: Optional[str] = None
    is_default: Optional[bool] = None

class PromptTemplateInDB(PromptTemplate):
    id: str = Field(..., alias="_id")

class PromptTemplateOut(PromptTemplate):
    id: str