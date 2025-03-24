"""
Default prompt templates for AI question generation
"""

DEFAULT_QUESTION_GENERATION_PROMPT = """You are an expert in creating educational questions for students. Generate {num_questions} questions on the topic "{topic}" under the unit "{unit}" of the course "{course}" in the subject "{subject}" following the curriculum "{curriculum}".

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

# Template for regenerating a specific question
QUESTION_REGENERATION_PROMPT = """You are an expert in creating educational questions. Please regenerate a different question on the topic "{topic}" under the unit "{unit}" of the course "{course}" in the subject "{subject}" following the curriculum "{curriculum}".

- Topic Description: {topic_description}
- Question Type: {question_type}
- Difficulty: {difficulty}
- Ensure the question aligns with the curriculum standards.
- Provide a detailed explanation for correct and incorrect answers.
- Create a question that is different from this previous question: "{previous_question}"
- Use LaTeX format for mathematical expressions and equations if needed.
- Format your response as a JSON object with these fields: question_type, question_text, options, correct_answer, and explanation.
- For MCQ, provide exactly 4 options with one correct answer.
- For MultipleAnswer, provide 4-5 options with 2-3 correct answers as an array.
- For Fill-in-the-blank, provide the question with a blank (represented by ________) and a single correct answer.
- For True/False, provide options as ["True", "False"] and the correct answer as one of these.
- Return ONLY the JSON object with no additional text."""

# Template for generating questions with specific educational standards
STANDARDS_BASED_PROMPT = """You are an expert in creating educational questions aligned with specific educational standards. Generate {num_questions} questions on the topic "{topic}" that align with the following educational standards and objectives:

Standards: {standards}
Learning Objectives: {objectives}

- Question Types: {question_types}
- Difficulty: {difficulty}
- Provide detailed explanations that reference the specific standard or objective being assessed.
- Use clear, grade-appropriate language for {grade_level} students.
- Use LaTeX format for mathematical expressions and equations if needed.
- Format: JSON array with each question having: question_type, question_text, options, correct_answer, explanation, and aligned_standard.
- For MCQ, provide exactly 4 options with one correct answer.
- For MultipleAnswer, provide 4-5 options with 2-3 correct answers as an array.
- For Fill-in-the-blank, provide the question with a blank (represented by ________) and a single correct answer.
- Return ONLY the JSON array with no additional text."""

# Template for mathematics-specific questions
MATH_QUESTION_PROMPT = """You are an expert mathematics educator. Generate {num_questions} mathematics questions on the topic "{topic}" for {grade_level} students.

- Question Types: {question_types}
- Difficulty: {difficulty}
- Include a mix of conceptual understanding, procedural fluency, and application problems.
- For computational problems, provide step-by-step solutions in the explanation.
- All mathematical expressions must be in LaTeX format.
- For each question, include at least one visual representation where appropriate (described in LaTeX).
- Format: JSON array with each question having: question_type, question_text, options, correct_answer, explanation, and solution_steps.
- For MCQ, provide exactly 4 options with one correct answer.
- For MultipleAnswer, provide 4-5 options with 2-3 correct answers as an array.
- Include common misconceptions as distractors in the options.
- Return ONLY the JSON array with no additional text."""

# Template for language arts/English questions
LANGUAGE_ARTS_PROMPT = """You are an expert language arts educator. Generate {num_questions} questions on the topic "{topic}" for {grade_level} students.

- Question Types: {question_types}
- Difficulty: {difficulty}
- Include questions that assess reading comprehension, vocabulary, grammar, and critical thinking.
- For reading comprehension questions, include a short passage (3-5 sentences) followed by questions.
- Questions should promote higher-order thinking skills where appropriate.
- Format: JSON array with each question having: question_type, question_text, options, correct_answer, explanation, and skill_assessed.
- For grammar questions, provide clear explanations of the grammatical rules in the explanation.
- Return ONLY the JSON array with no additional text."""

# Template for science questions
SCIENCE_QUESTION_PROMPT = """You are an expert science educator. Generate {num_questions} science questions on the topic "{topic}" for {grade_level} students.

- Question Types: {question_types}
- Difficulty: {difficulty}
- Include a mix of factual recall, conceptual understanding, and application questions.
- For experimental design questions, include proper scientific method terminology.
- Questions should assess scientific literacy and critical thinking.
- Include diagrams or visual elements where appropriate (described in text).
- Format: JSON array with each question having: question_type, question_text, options, correct_answer, explanation, and science_domain (e.g., biology, chemistry, physics).
- For MCQ, provide exactly 4 options with one correct answer.
- Return ONLY the JSON array with no additional text."""

# Template for history/social studies questions
HISTORY_QUESTION_PROMPT = """You are an expert history and social studies educator. Generate {num_questions} questions on the topic "{topic}" for {grade_level} students.

- Question Types: {question_types}
- Difficulty: {difficulty}
- Include questions that assess factual knowledge, chronological understanding, and historical analysis.
- Questions should encourage critical thinking about historical events and their significance.
- Include primary source analysis where appropriate.
- Format: JSON array with each question having: question_type, question_text, options, correct_answer, explanation, and historical_period.
- For MCQ, provide exactly 4 options with one correct answer.
- Return ONLY the JSON array with no additional text."""

# Function to select the appropriate template based on subject
def get_subject_specific_template(subject: str) -> str:
    """
    Return the appropriate template based on the subject area
    """
    subject_lower = subject.lower()
    
    if any(term in subject_lower for term in ["math", "algebra", "geometry", "calculus", "statistics"]):
        return MATH_QUESTION_PROMPT
    
    elif any(term in subject_lower for term in ["english", "language", "literature", "reading", "writing"]):
        return LANGUAGE_ARTS_PROMPT
    
    elif any(term in subject_lower for term in ["science", "biology", "chemistry", "physics", "earth"]):
        return SCIENCE_QUESTION_PROMPT
    
    elif any(term in subject_lower for term in ["history", "social studies", "geography", "civics"]):
        return HISTORY_QUESTION_PROMPT
    
    # Default to the standard template if no specific match
    return DEFAULT_QUESTION_GENERATION_PROMPT