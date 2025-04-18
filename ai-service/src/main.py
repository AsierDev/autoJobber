from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
import io
from dotenv import load_dotenv
from resume_parser import parse_resume, ResumeData, Skill, Experience, Education
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="AutoJobber AI Service",
    description="AI-powered services for resume parsing and job matching",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class JobPreference(BaseModel):
    title: str
    industry: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None  # remote, hybrid, onsite
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    company_size: Optional[str] = None

class JobMatch(BaseModel):
    job_id: str
    title: str
    company: str
    location: str
    description: str
    match_score: float
    match_reasons: List[str]

class GenerativeResponse(BaseModel):
    content: str
    sources: Optional[List[Dict[str, Any]]] = None

# Routes
@app.get("/")
async def root():
    return {"message": "AutoJobber AI Service is running"}

@app.post("/parse-resume", response_model=ResumeData)
async def upload_resume(file: UploadFile = File(...)):
    # Validate file type
    if file.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    # Read file contents
    contents = await file.read()
    
    # Get file extension
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    # Parse resume
    try:
        logger.info(f"Parsing resume: {file.filename}")
        resume_data = parse_resume(contents, file_extension)
        logger.info(f"Resume parsed successfully: {resume_data.name}")
        return resume_data
    except Exception as e:
        logger.error(f"Error parsing resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(e)}")

@app.post("/generate-summary", response_model=GenerativeResponse)
async def generate_summary(resume_data: ResumeData):
    """Generate a personalized summary based on the resume data"""
    try:
        # This would connect to a generative AI model in a real implementation
        # For now, we'll use a simple template-based approach
        
        skills_str = ", ".join([skill.name for skill in resume_data.skills[:5]])
        experience_str = ", ".join([exp.title for exp in resume_data.experience[:2]])
        
        summary = f"""
        {resume_data.name} is a professional with experience as {experience_str}.
        Their key skills include {skills_str}.
        They have education from {resume_data.education[0].institution if resume_data.education else 'a recognized institution'}.
        """
        
        return GenerativeResponse(
            content=summary.strip(),
            sources=[
                {"type": "resume", "id": "resume-data"}
            ]
        )
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

@app.post("/suggest-improvements", response_model=GenerativeResponse)
async def suggest_improvements(resume_data: ResumeData):
    """Suggest improvements for the resume"""
    try:
        # This would connect to a generative AI model in a real implementation
        # For now, we'll use a simple template-based approach
        
        suggestions = []
        
        # Check for missing data
        if not resume_data.summary:
            suggestions.append("Add a professional summary to highlight your key qualifications.")
        
        if len(resume_data.skills) < 5:
            suggestions.append("Include more skills to showcase your expertise.")
        
        if not any('description' in exp and exp.description for exp in resume_data.experience):
            suggestions.append("Add detailed descriptions of your work responsibilities and achievements.")
        
        # Generate response
        if not suggestions:
            suggestions = ["Your resume looks good! Consider tailoring it for specific job applications."]
        
        return GenerativeResponse(
            content="\n".join(suggestions),
            sources=[
                {"type": "analysis", "id": "resume-improvement"}
            ]
        )
    except Exception as e:
        logger.error(f"Error suggesting improvements: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error suggesting improvements: {str(e)}")

@app.post("/match-jobs", response_model=List[JobMatch])
async def match_jobs(resume_data: ResumeData, preferences: JobPreference):
    """Match jobs based on resume data and preferences"""
    try:
        # This is a placeholder. In a real implementation, we would:
        # 1. Query job database or external APIs
        # 2. Calculate match scores based on resume and preferences
        # 3. Return sorted matches
        
        # For now, return mock data
        return [
            JobMatch(
                job_id="job-123",
                title="Senior Software Engineer",
                company="Tech Giant Inc.",
                location="San Francisco, CA",
                description="We're looking for an experienced software engineer...",
                match_score=0.89,
                match_reasons=[
                    "Skills match: Python, Machine Learning",
                    "Location preference match",
                    "Experience level: Senior"
                ]
            ),
            JobMatch(
                job_id="job-456",
                title="Machine Learning Engineer",
                company="AI Startup",
                location="Remote",
                description="Join our team of ML experts...",
                match_score=0.75,
                match_reasons=[
                    "Skills match: Machine Learning",
                    "Remote work available",
                    "Industry preference match"
                ]
            )
        ]
    except Exception as e:
        logger.error(f"Error matching jobs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error matching jobs: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True) 