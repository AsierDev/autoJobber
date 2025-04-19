from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
import uvicorn
import os
import io
from datetime import datetime, timedelta
import logging
from dotenv import load_dotenv

# Import modules from our application
from resume_parser import parse_resume, ResumeData, Skill, Experience, Education
from job_scraper import JobAggregator, JobListing
from job_matcher import JobMatcher
from job_worker import get_worker
from notification_service import get_notification_service

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

# Initialize services
job_aggregator = JobAggregator()
job_matcher = JobMatcher()
worker = get_worker()
notification_service = get_notification_service()

# Models
class JobPreference(BaseModel):
    title: str
    industry: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None  # remote, hybrid, onsite
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    company_size: Optional[str] = None
    job_type: Optional[str] = None  # full-time, part-time, contract

class JobMatch(BaseModel):
    job_id: str
    title: str
    company: str
    location: str
    description: str
    match_score: float
    match_reasons: List[str]
    url: Optional[str] = None
    date_posted: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: Optional[str] = None
    work_mode: Optional[str] = None
    source: Optional[str] = None

class GenerativeResponse(BaseModel):
    content: str
    sources: Optional[List[Dict[str, Any]]] = None

class SearchJobsRequest(BaseModel):
    keywords: List[str]
    location: Optional[str] = None
    sources: Optional[List[str]] = None
    limit: Optional[int] = 20

class JobSearchScheduleRequest(BaseModel):
    user_id: str
    interval_hours: Optional[int] = 12
    notification_preference: Optional[str] = "email"  # email, push, both

class NotificationRequest(BaseModel):
    user_id: str
    title: str
    message: str
    notification_type: Optional[str] = "general"
    data: Optional[Dict[str, Any]] = None

class NotificationResponse(BaseModel):
    success: bool
    message: str

# Routes
@app.get("/")
async def root():
    return {"message": "AutoJobber AI Service is running"}

@app.on_event("startup")
async def startup_event():
    """Start the background worker on app startup"""
    worker.start()
    logger.info("Started background job worker")

@app.on_event("shutdown")
async def shutdown_event():
    """Stop the background worker on app shutdown"""
    worker.stop()
    logger.info("Stopped background job worker")

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

@app.post("/search-jobs", response_model=List[JobMatch])
async def search_jobs(search_request: SearchJobsRequest):
    """Search for jobs based on keywords and location"""
    try:
        # Search for jobs using the aggregator
        job_listings = job_aggregator.search_jobs(
            keywords=search_request.keywords,
            location=search_request.location,
            sources=search_request.sources or ["linkedin", "indeed"],
            limit_per_source=search_request.limit // 2 if search_request.limit else 10
        )
        
        # Convert JobListing objects to JobMatch format
        job_matches = []
        for job in job_listings:
            job_matches.append(JobMatch(
                job_id=job.job_id,
                title=job.title,
                company=job.company,
                location=job.location,
                description=job.description,
                match_score=0.0,  # No matching done yet
                match_reasons=[],
                url=job.url,
                date_posted=job.date_posted.isoformat() if job.date_posted else None,
                salary_range=job.salary_range,
                job_type=job.job_type,
                work_mode=job.work_mode,
                source=job.source
            ))
            
        return job_matches
    except Exception as e:
        logger.error(f"Error searching jobs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error searching jobs: {str(e)}")

@app.post("/match-jobs", response_model=List[JobMatch])
async def match_jobs(resume_data: ResumeData, preferences: JobPreference):
    """Match jobs based on resume data and preferences"""
    try:
        # Extract search keywords from resume and preferences
        keywords = []
        for skill in resume_data.skills:
            keywords.append(skill.name)
        
        if preferences.title:
            keywords.append(preferences.title)
            
        if preferences.industry:
            keywords.append(preferences.industry)
            
        # Search for jobs
        job_listings = job_aggregator.search_jobs(
            keywords=keywords[:10],  # Limit to 10 keywords
            location=preferences.location,
            limit_per_source=25  # Get more jobs for better matching
        )
        
        # Convert preferences to dict format for matcher
        preferences_dict = preferences.dict()
        
        # Match jobs with resume data
        matched_jobs = job_matcher.match_jobs(
            resume_data=resume_data,
            job_listings=job_listings,
            preferences=preferences_dict
        )
        
        # Convert to JobMatch format
        job_matches = []
        for job in matched_jobs:
            job_matches.append(JobMatch(
                job_id=job["job_id"],
                title=job["title"],
                company=job["company"],
                location=job["location"],
                description=job["description"],
                match_score=job["match_score"],
                match_reasons=job["match_reasons"],
                url=job.get("url"),
                date_posted=job.get("date_posted"),
                salary_range=job.get("salary_range"),
                job_type=job.get("job_type"),
                work_mode=job.get("work_mode"),
                source=job.get("source")
            ))
            
        return job_matches
    except Exception as e:
        logger.error(f"Error matching jobs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error matching jobs: {str(e)}")

@app.post("/schedule-job-search", response_model=Dict[str, Any])
async def schedule_job_search(request: JobSearchScheduleRequest):
    """Schedule recurring job searches for a user"""
    try:
        # Schedule the job search
        next_run = worker.schedule_job_search(
            user_id=request.user_id,
            schedule_interval_hours=request.interval_hours
        )
        
        return {
            "user_id": request.user_id,
            "scheduled": True,
            "interval_hours": request.interval_hours,
            "next_run": next_run.isoformat() if next_run else None,
            "message": f"Job search scheduled for user {request.user_id}"
        }
    except Exception as e:
        logger.error(f"Error scheduling job search: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error scheduling job search: {str(e)}")

@app.post("/run-job-search-now", response_model=Dict[str, Any])
async def run_job_search_now(
    user_id: str,
    background_tasks: BackgroundTasks
):
    """Run a job search immediately for a user"""
    try:
        # Schedule the job to run in the background
        background_tasks.add_task(worker.process_user_job_search, user_id)
        
        return {
            "user_id": user_id,
            "job_search_initiated": True,
            "message": f"Job search initiated for user {user_id}"
        }
    except Exception as e:
        logger.error(f"Error running job search: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error running job search: {str(e)}")

@app.post("/send-notification", response_model=NotificationResponse)
async def send_notification(request: NotificationRequest):
    """Send a notification to a user"""
    try:
        # Send the notification
        success = notification_service.send_notification(
            user_id=request.user_id,
            title=request.title,
            message=request.message,
            notification_type=request.notification_type,
            data=request.data
        )
        
        if success:
            return NotificationResponse(
                success=True,
                message=f"Notification sent to user {request.user_id}"
            )
        else:
            return NotificationResponse(
                success=False,
                message="Failed to send notification"
            )
    except Exception as e:
        logger.error(f"Error sending notification: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sending notification: {str(e)}")

@app.get("/job-search-stats", response_model=Dict[str, Any])
async def get_job_search_stats():
    """Get statistics about job searching"""
    try:
        # This would normally query a database
        # For now, we'll return mock data
        return {
            "total_jobs_indexed": 10000,
            "jobs_added_today": 250,
            "active_search_users": 150,
            "avg_match_score": 0.68,
            "top_skills_in_demand": [
                "Python", "JavaScript", "Machine Learning",
                "React", "AWS", "Data Science", "DevOps"
            ],
            "top_job_locations": [
                "Remote", "New York, NY", "San Francisco, CA",
                "Austin, TX", "Seattle, WA"
            ],
            "avg_search_time_ms": 320
        }
    except Exception as e:
        logger.error(f"Error getting job search stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting job search stats: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True) 