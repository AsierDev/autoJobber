from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv

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

# Mock resume parsing function (to be replaced with actual NLP)
async def parse_resume(file_contents: bytes, file_extension: str) -> ResumeData:
    # This is a placeholder. In a real implementation, we would:
    # 1. Use OCR if needed (for PDFs)
    # 2. Extract text content
    # 3. Use NER (Named Entity Recognition) to identify entities
    # 4. Use custom models to extract structured data
    
    # For now, return mock data
    return ResumeData(
        name="John Doe",
        email="john.doe@example.com",
        phone="+1 123-456-7890",
        location="San Francisco, CA",
        summary="Experienced software engineer with a passion for AI",
        skills=[
            Skill(name="Python", level="Expert"),
            Skill(name="Machine Learning", level="Intermediate"),
            Skill(name="React", level="Beginner")
        ],
        experience=[
            Experience(
                title="Software Engineer",
                company="Tech Corp",
                location="San Francisco, CA",
                start_date="2018-01",
                end_date="Present",
                description=[
                    "Developed scalable backend services",
                    "Implemented machine learning models",
                    "Led a team of 3 junior developers"
                ]
            )
        ],
        education=[
            Education(
                institution="Stanford University",
                degree="Bachelor of Science",
                field="Computer Science",
                start_date="2014-09",
                end_date="2018-05",
                gpa=3.8
            )
        ]
    )

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
        resume_data = await parse_resume(contents, file_extension)
        return resume_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(e)}")

@app.post("/match-jobs", response_model=List[JobMatch])
async def match_jobs(resume_data: ResumeData, preferences: JobPreference):
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

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True) 