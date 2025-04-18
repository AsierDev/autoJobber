"""
Resume parsing module for extracting structured data from resumes
"""
import os
import re
import io
import json
import logging
from typing import Dict, List, Any, Optional, Tuple, Union
import PyPDF2
import docx2txt
import spacy
from spacy.matcher import Matcher
from pydantic import BaseModel

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load NLP model
try:
    nlp = spacy.load("en_core_web_md")
    logger.info("Loaded spaCy NLP model successfully")
except Exception as e:
    logger.error(f"Error loading spaCy model: {e}")
    logger.warning("Falling back to en_core_web_sm")
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception as e:
        logger.error(f"Error loading fallback model: {e}")
        raise RuntimeError("Failed to load NLP models")

# Define patterns for information extraction
NAME_PATTERNS = [
    [{"POS": "PROPN"}, {"POS": "PROPN"}],
    [{"ENT_TYPE": "PERSON", "OP": "+"}]
]

EMAIL_PATTERN = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
PHONE_PATTERN = r'(\+\d{1,3}[\s.-])?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}'
EDUCATION_KEYWORDS = ['education', 'university', 'college', 'bachelor', 'master', 'phd', 'degree', 'diploma']
EXPERIENCE_KEYWORDS = ['experience', 'work experience', 'employment', 'job', 'position', 'career']
SKILLS_KEYWORDS = ['skills', 'technical skills', 'competencies', 'expertise', 'proficiencies']

# Common skills with normalized names
SKILL_MAPPING = {
    'python': 'Python',
    'javascript': 'JavaScript',
    'js': 'JavaScript',
    'typescript': 'TypeScript',
    'ts': 'TypeScript',
    'java': 'Java',
    'c#': 'C#',
    'c++': 'C++',
    'react': 'React',
    'reactjs': 'React',
    'vue': 'Vue.js',
    'vuejs': 'Vue.js',
    'angular': 'Angular',
    'node': 'Node.js',
    'nodejs': 'Node.js',
    'express': 'Express',
    'django': 'Django',
    'flask': 'Flask',
    'fastapi': 'FastAPI',
    'sql': 'SQL',
    'mysql': 'MySQL',
    'postgresql': 'PostgreSQL',
    'postgres': 'PostgreSQL',
    'mongodb': 'MongoDB',
    'aws': 'AWS',
    'azure': 'Azure',
    'gcp': 'Google Cloud Platform',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'k8s': 'Kubernetes',
    'git': 'Git',
    'machine learning': 'Machine Learning',
    'ml': 'Machine Learning',
    'ai': 'Artificial Intelligence',
    'nlp': 'Natural Language Processing',
    'data science': 'Data Science',
    'data analysis': 'Data Analysis',
}

class Skill(BaseModel):
    name: str
    level: Optional[str] = None

class Experience(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    description: Optional[List[str]] = None

class Education(BaseModel):
    institution: str
    degree: str
    field: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    gpa: Optional[float] = None

class ResumeData(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    skills: List[Skill] = []
    experience: List[Experience] = []
    education: List[Education] = []

def extract_text_from_pdf(file_contents: bytes) -> str:
    """Extract text from PDF file contents"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_contents))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        return ""

def extract_text_from_docx(file_contents: bytes) -> str:
    """Extract text from DOCX file contents"""
    try:
        # Save temporary file
        temp_file = "temp_resume.docx"
        with open(temp_file, "wb") as f:
            f.write(file_contents)
        
        # Extract text
        text = docx2txt.process(temp_file)
        
        # Clean up
        if os.path.exists(temp_file):
            os.remove(temp_file)
            
        return text
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {e}")
        if os.path.exists("temp_resume.docx"):
            os.remove("temp_resume.docx")
        return ""

def extract_text(file_contents: bytes, file_extension: str) -> str:
    """Extract text based on file extension"""
    if file_extension.lower() == '.pdf':
        return extract_text_from_pdf(file_contents)
    elif file_extension.lower() == '.docx':
        return extract_text_from_docx(file_contents)
    else:
        logger.error(f"Unsupported file extension: {file_extension}")
        return ""

def extract_name(doc) -> str:
    """Extract name from resume text"""
    matcher = Matcher(nlp.vocab)
    
    # Add patterns for matching names
    for pattern in NAME_PATTERNS:
        matcher.add("NAME", [pattern])
    
    matches = matcher(doc)
    
    for match_id, start, end in matches:
        span = doc[start:end]
        # Assume the first match in the document might be the name
        # This is a simplification and might need refinement
        if len(span.text.split()) <= 3:  # Most names are 2-3 words
            return span.text
    
    return "Unknown"

def extract_email(text: str) -> Optional[str]:
    """Extract email address from text"""
    emails = re.findall(EMAIL_PATTERN, text)
    return emails[0] if emails else None

def extract_phone(text: str) -> Optional[str]:
    """Extract phone number from text"""
    phones = re.findall(PHONE_PATTERN, text)
    return phones[0] if phones else None

def extract_skills(text: str) -> List[Skill]:
    """Extract skills from resume text"""
    skills = []
    
    # Find skills section
    skills_section = None
    for keyword in SKILLS_KEYWORDS:
        pattern = re.compile(f"{keyword}:?.*?($|\\n\\n)", re.IGNORECASE | re.DOTALL)
        match = pattern.search(text)
        if match:
            skills_section = match.group(0)
            break
    
    # If skills section found, process it
    if skills_section:
        # Split into lines and process each line
        lines = skills_section.split('\n')
        for line in lines:
            words = line.split()
            for word in words:
                # Clean word
                word = word.strip().lower().rstrip(',.:;')
                
                # Check against skill mapping
                for skill_kw, skill_name in SKILL_MAPPING.items():
                    if skill_kw == word or skill_kw in word:
                        if not any(s.name == skill_name for s in skills):
                            skills.append(Skill(name=skill_name))
    
    # If no skills found, try to extract skills from entire text
    if not skills:
        doc = nlp(text)
        for token in doc:
            word = token.text.lower()
            for skill_kw, skill_name in SKILL_MAPPING.items():
                if skill_kw == word or skill_kw in word:
                    if not any(s.name == skill_name for s in skills):
                        skills.append(Skill(name=skill_name))
    
    return skills

def extract_education(text: str) -> List[Education]:
    """Extract education information from resume text"""
    education_list = []
    
    # Find education section
    education_section = None
    for keyword in EDUCATION_KEYWORDS:
        pattern = re.compile(f"{keyword}:?.*?($|\\n\\n)", re.IGNORECASE | re.DOTALL)
        match = pattern.search(text)
        if match:
            education_section = match.group(0)
            break
    
    # If education section found, use simplified approach
    if education_section:
        # Basic extraction for demo purposes
        # In a real implementation, this would be more sophisticated
        lines = education_section.split('\n')
        current_edu = {}
        
        for line in lines[1:]:  # Skip header line
            line = line.strip()
            if not line:
                continue
                
            if not current_edu and (line.lower().startswith(('university', 'college', 'school'))):
                current_edu = {
                    "institution": line,
                    "degree": "Degree",
                    "start_date": "2018",
                    "end_date": "2022"
                }
                education_list.append(Education(**current_edu))
                current_edu = {}
    
    # If no education found, add a placeholder
    if not education_list:
        education_list.append(
            Education(
                institution="Unknown University",
                degree="Degree",
                start_date="Unknown"
            )
        )
    
    return education_list

def extract_experience(text: str) -> List[Experience]:
    """Extract work experience from resume text"""
    experience_list = []
    
    # Find experience section
    experience_section = None
    for keyword in EXPERIENCE_KEYWORDS:
        pattern = re.compile(f"{keyword}:?.*?($|\\n\\n)", re.IGNORECASE | re.DOTALL)
        match = pattern.search(text)
        if match:
            experience_section = match.group(0)
            break
    
    # If experience section found, use simplified approach
    if experience_section:
        # Basic extraction for demo purposes
        # In a real implementation, this would be more sophisticated
        lines = experience_section.split('\n')
        current_exp = {}
        
        for line in lines[1:]:  # Skip header line
            line = line.strip()
            if not line:
                continue
                
            if not current_exp and any(x.isupper() for x in line):
                current_exp = {
                    "title": line,
                    "company": "Company",
                    "start_date": "2020-01",
                    "description": ["Worked on various projects"]
                }
                experience_list.append(Experience(**current_exp))
                current_exp = {}
    
    # If no experience found, add a placeholder
    if not experience_list:
        experience_list.append(
            Experience(
                title="Position",
                company="Company",
                start_date="Unknown",
                description=["Experience description not found"]
            )
        )
    
    return experience_list

def extract_summary(text: str) -> Optional[str]:
    """Extract summary or objective from resume"""
    summary_keywords = ['summary', 'objective', 'profile', 'about me']
    
    for keyword in summary_keywords:
        pattern = re.compile(f"{keyword}:?.*?($|\\n\\n)", re.IGNORECASE | re.DOTALL)
        match = pattern.search(text)
        if match:
            # Extract and clean summary
            summary = match.group(0)
            # Remove the keyword itself
            summary = re.sub(f"{keyword}:?\\s*", "", summary, flags=re.IGNORECASE)
            return summary.strip()
    
    return None

def parse_resume(file_contents: bytes, file_extension: str) -> ResumeData:
    """
    Parse resume and extract structured information
    
    Args:
        file_contents: Binary content of the resume file
        file_extension: File extension (e.g., '.pdf', '.docx')
        
    Returns:
        ResumeData object containing structured information
    """
    # Extract text from file
    text = extract_text(file_contents, file_extension)
    
    if not text:
        logger.error("Failed to extract text from resume")
        raise ValueError("Could not extract text from the provided file")
    
    # Process text with spaCy
    doc = nlp(text)
    
    # Extract information
    name = extract_name(doc)
    email = extract_email(text) or "unknown@example.com"
    phone = extract_phone(text)
    skills = extract_skills(text)
    education = extract_education(text)
    experience = extract_experience(text)
    summary = extract_summary(text)
    
    # Create and return ResumeData object
    resume_data = ResumeData(
        name=name,
        email=email,
        phone=phone,
        summary=summary,
        skills=skills,
        experience=experience,
        education=education
    )
    
    return resume_data 