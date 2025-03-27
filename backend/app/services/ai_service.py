import os
import json
import hashlib
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.config.db import (
    topics_collection, units_collection, courses_collection, 
    subjects_collection, curriculum_collection, prompts_collection,
    questions_collection
)
from app.models.question import (
    QuestionType, DifficultyLevel, QuestionGenerationRequest, 
    QuestionRegenerationRequest
)
from bson import ObjectId

# Load OpenAI API key from environment
openai_api_key = os.getenv("OPENAI_API_KEY")

class AIService:
    """Service for interacting with AI to generate questions"""
    
    @staticmethod
    async def generate_questions(
        request: QuestionGenerationRequest,
        user_id: str
    ) -> List[Dict[str, Any]]:
        """Generate questions based on a topic and preferences"""
        
        # Get topic details
        topic_id = request.topic_id
        try:
            topic_oid = ObjectId(topic_id)
        except:
            raise ValueError(f"Invalid topic ID format: {topic_id}")
            
        topic = topics_collection.find_one({"_id": topic_oid})
        if not topic:
            raise ValueError(f"Topic with ID {topic_id} not found")
        
        # Get unit, course, subject and curriculum details to build context
        unit = units_collection.find_one({"_id": ObjectId(topic["unit_id"])})
        if not unit:
            raise ValueError(f"Unit with ID {topic['unit_id']} not found")
            
        course = courses_collection.find_one({"_id": ObjectId(unit["course_id"])})
        if not course:
            raise ValueError(f"Course with ID {unit['course_id']} not found")
            
        subject = subjects_collection.find_one({"_id": ObjectId(course["subject_id"])})
        if not subject:
            raise ValueError(f"Subject with ID {course['subject_id']} not found")
            
        curriculum = curriculum_collection.find_one({"_id": ObjectId(subject["curriculum_id"])})
        if not curriculum:
            raise ValueError(f"Curriculum with ID {subject['curriculum_id']} not found")
        
        # Build question types string
        question_types_str = ", ".join([qt.value for qt in request.question_types])
        
        # Get prompt template - either default or custom
        prompt_template = await AIService._get_prompt_template(request.custom_prompt)
        
        # Format the prompt
        prompt = prompt_template.format(
            num_questions=request.num_questions,
            topic=topic["name"],
            topic_description=topic.get("description", ""),
            unit=unit["name"],
            course=course["name"],
            subject=subject["name"],
            curriculum=curriculum["name"],
            question_types=question_types_str,
            difficulty=request.difficulty.value
        )
        
        # Call the AI model to generate questions
        try:
            response = await AIService._call_openai(prompt)
            
            # Parse the response into questions
            questions = AIService._parse_questions(response)
            
            # Check if we got the requested number of questions
            if len(questions) < request.num_questions:
                # If not enough questions, retry with a more explicit prompt
                retry_prompt = prompt + "\n\nYou did not provide enough questions. Please generate exactly " + \
                              f"{request.num_questions} questions in the requested format."
                response = await AIService._call_openai(retry_prompt)
                questions = AIService._parse_questions(response)
            
            # Validate and format questions
            formatted_questions = []
            for q in questions[:request.num_questions]:  # Limit to requested number
                # Ensure question has all required fields
                if AIService._validate_question(q):
                    # Compute content hash to avoid duplicates
                    content_hash = AIService._compute_content_hash(q)
                    
                    # Add metadata
                    formatted_question = {
                        **q,
                        "topic_id": topic_id,
                        "difficulty": q.get("difficulty", request.difficulty.value),
                        "created_by": user_id,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                        "ai_generated": True,
                        "ai_model": "gpt-4",  # Or whichever model you're using
                        "ai_prompt": prompt,
                        "content_hash": content_hash
                    }
                    
                    # Convert question_type to enum if it's not
                    if isinstance(formatted_question["question_type"], str):
                        formatted_question["question_type"] = formatted_question["question_type"]
                    
                    formatted_questions.append(formatted_question)
            
            return formatted_questions
            
        except Exception as e:
            # Handle any errors from the OpenAI call
            raise Exception(f"Error generating questions: {str(e)}")
    
    @staticmethod
    async def regenerate_question(
        request: QuestionRegenerationRequest,
        user_id: str
    ) -> Dict[str, Any]:
        """Regenerate a specific question"""
        
        # Get the existing question
        try:
            question_oid = ObjectId(request.question_id)
        except:
            raise ValueError(f"Invalid question ID format: {request.question_id}")
            
        existing_question = questions_collection.find_one({"_id": question_oid})
        if not existing_question:
            raise ValueError(f"Question with ID {request.question_id} not found")
        
        # Get topic details
        topic_id = existing_question["topic_id"]
        topic = topics_collection.find_one({"_id": ObjectId(topic_id)})
        if not topic:
            raise ValueError(f"Topic with ID {topic_id} not found")
        
        # Get unit, course, subject and curriculum details
        unit = units_collection.find_one({"_id": ObjectId(topic["unit_id"])})
        course = courses_collection.find_one({"_id": ObjectId(unit["course_id"])})
        subject = subjects_collection.find_one({"_id": ObjectId(course["subject_id"])})
        curriculum = curriculum_collection.find_one({"_id": ObjectId(subject["curriculum_id"])})
        
        # Get or create custom prompt
        custom_prompt = request.with_custom_prompt or existing_question.get("ai_prompt")
        if not custom_prompt:
            prompt_template = await AIService._get_prompt_template()
            
            # Format the prompt for a single question
            custom_prompt = prompt_template.format(
                num_questions=1,
                topic=topic["name"],
                topic_description=topic.get("description", ""),
                unit=unit["name"],
                course=course["name"],
                subject=subject["name"],
                curriculum=curriculum["name"],
                question_types=existing_question["question_type"],
                difficulty=existing_question["difficulty"]
            )
        
        # Call the AI model to regenerate the question
        try:
            response = await AIService._call_openai(custom_prompt)
            
            # Parse the response
            questions = AIService._parse_questions(response)
            
            if not questions:
                # If parsing failed, retry with an explicit format reminder
                retry_prompt = custom_prompt + "\n\nPlease provide exactly 1 question in valid JSON format with fields: question_type, question_text, options, correct_answer, and explanation."
                response = await AIService._call_openai(retry_prompt)
                questions = AIService._parse_questions(response)
            
            if not questions:
                raise ValueError("Failed to generate a valid question after multiple attempts")
            
            # Take the first question (should be the only one)
            new_question = questions[0]
            
            # Validate the regenerated question
            if not AIService._validate_question(new_question):
                raise ValueError("Generated question is invalid or incomplete")
            
            # Compute content hash
            content_hash = AIService._compute_content_hash(new_question)
            
            # Check for duplicates
            if questions_collection.find_one({"content_hash": content_hash, "_id": {"$ne": question_oid}}):
                # If duplicate found, regenerate with diversity instruction
                diversity_prompt = custom_prompt + "\n\nPlease provide a completely different question than previously generated ones."
                response = await AIService._call_openai(diversity_prompt)
                questions = AIService._parse_questions(response)
                
                if questions:
                    new_question = questions[0]
                    content_hash = AIService._compute_content_hash(new_question)
            
            # Update with metadata
            new_question.update({
                "topic_id": topic_id,
                "updated_at": datetime.utcnow(),
                "ai_generated": True,
                "ai_model": "gpt-4",  # Or whichever model you're using
                "ai_prompt": custom_prompt,
                "content_hash": content_hash
            })
            
            return new_question
            
        except Exception as e:
            # Handle any errors
            raise Exception(f"Error regenerating question: {str(e)}")
    
    @staticmethod
    async def _get_prompt_template(custom_prompt: Optional[str] = None) -> str:
        """Get a prompt template from the database or use custom/default"""
        if custom_prompt:
            return custom_prompt
        
        # Get default prompt template from database
        default_template = prompts_collection.find_one({"is_default": True})
        
        if default_template:
            return default_template["template"]
        
        # If no default template exists, use a built-in default
        return """You are an expert in creating educational questions for students. Generate {num_questions} questions on the topic "{topic}" under the unit "{unit}" of the course "{course}" in the subject "{subject}" following the curriculum "{curriculum}".

- Topic Description: {topic_description}
- Question Types: {question_types}
- Difficulty: {difficulty}
- Ensure the questions align with the curriculum standards.
- Provide detailed explanations for correct and incorrect answers.
- Do NOT repeat previously generated questions.
- Use LaTeX format for mathematical expressions and equations, e.g., use \\frac{{a}}{{b}} for fractions, x^2 for exponents, etc.
- Format: JSON array with each question having: question_type, question_text, options, correct_answer, and explanation.
- For MCQ (Multiple Choice Questions), ALWAYS provide exactly 4 options with exactly one correct answer.
- For MultipleAnswer questions, provide 4-5 options with 2-3 correct answers as an array.
- For Fill-in-the-blank questions, provide the question with a blank (represented by ________) and a single correct answer.
- Return ONLY the JSON array with no additional text."""
    
    @staticmethod
    async def _call_openai(prompt: str) -> str:
        """Call OpenAI API to generate questions"""
        try:
            # Import here to avoid importing if not needed
            from openai import AsyncOpenAI
            
            # Initialize client
            client = AsyncOpenAI(api_key=openai_api_key)
            
            # Make the API call
            response = await client.chat.completions.create(
                model="gpt-4",  # Or any other appropriate model
                messages=[
                    {"role": "system", "content": "You are an expert in creating educational assessment questions."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=3000
            )
            
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    @staticmethod
    def _parse_questions(response: str) -> List[Dict[str, Any]]:
        """Parse the AI response into a list of question dictionaries"""
        try:
            # Try to parse the entire response as JSON
            questions = json.loads(response)
            
            # If it's a dictionary with a single question, wrap it in a list
            if isinstance(questions, dict):
                questions = [questions]
                
            return questions
            
        except json.JSONDecodeError:
            # If the response isn't valid JSON, try to extract JSON from the text
            import re
            json_pattern = r'(\[.*\]|\{.*\})'
            match = re.search(json_pattern, response, re.DOTALL)
            
            if match:
                try:
                    questions = json.loads(match.group(0))
                    
                    # If it's a dictionary with a single question, wrap it in a list
                    if isinstance(questions, dict):
                        questions = [questions]
                        
                    return questions
                except:
                    pass
            
            # If all else fails, return empty list
            return []
    
    @staticmethod
    def _validate_question(question: Dict[str, Any]) -> bool:
        """Validate that a question has all required fields and correct format"""
        required_fields = ["question_type", "options", "correct_answer", "explanation"]
        
        # Check if question has question_text or question field
        if "question_text" not in question and "question" not in question:
            return False
            
        # Standardize question_text field
        if "question" in question and "question_text" not in question:
            question["question_text"] = question.pop("question")
        
        # Check all other required fields
        for field in required_fields:
            if field not in question:
                return False
        
        # Validate question_type
        question_type = question["question_type"]
        valid_types = [qt.value for qt in QuestionType]
        if question_type not in valid_types:
            # Try to fix common formatting issues
            if question_type.lower() == "mcq" or question_type.lower() == "multiple choice":
                question["question_type"] = "MCQ"
            elif "multiple" in question_type.lower() and "answer" in question_type.lower():
                question["question_type"] = "MultipleAnswer"
            elif "true" in question_type.lower() and "false" in question_type.lower():
                question["question_type"] = "True/False"
            elif "fill" in question_type.lower() and "blank" in question_type.lower():
                question["question_type"] = "Fill-in-the-blank"
            else:
                return False
        
        # Validate options
        if not isinstance(question["options"], list):
            return False
            
        # Validate correct_answer based on question_type
        if question["question_type"] == "MultipleAnswer":
            if not isinstance(question["correct_answer"], list):
                # Try to convert string to list if it looks like a list representation
                if isinstance(question["correct_answer"], str):
                    try:
                        question["correct_answer"] = json.loads(question["correct_answer"].replace("'", "\""))
                    except:
                        return False
                else:
                    return False
        else:
            if isinstance(question["correct_answer"], list):
                # Convert list to string if it's a single-answer question type with one answer
                if len(question["correct_answer"]) == 1:
                    question["correct_answer"] = question["correct_answer"][0]
                else:
                    return False
        
        return True
    
    @staticmethod
    def _compute_content_hash(question: Dict[str, Any]) -> str:
        """Compute a hash of the question content to detect duplicates"""
        # Create a normalized string representation of the core question content
        content = (
            question.get("question_text", "") + 
            question.get("explanation", "") +
            str(question.get("options", []))
        )
        
        # Normalize text: lowercase, remove extra whitespace
        normalized = " ".join(content.lower().split())
        
        # Compute hash
        return hashlib.md5(normalized.encode('utf-8')).hexdigest()