"""
Job Worker Module for AutoJobber

This module provides background processing for continuous job searching,
implementing a worker-based architecture for scheduled searches.
"""

import logging
import time
import os
import json
import schedule
import threading
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import requests

from job_scraper import JobAggregator, JobListing
from job_matcher import JobMatcher
from resume_parser import ResumeData

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configuration
SERVER_API_URL = os.getenv("SERVER_API_URL", "http://localhost:3000/api")
DEFAULT_SEARCH_INTERVAL_HOURS = 12
DEFAULT_MAX_JOBS_PER_SEARCH = 50
DEFAULT_SEARCH_LIMIT_PER_SOURCE = 25
DEFAULT_MATCH_THRESHOLD = 0.6  # Minimum match score to notify

class JobWorker:
    """Worker for background job searching and matching"""
    
    def __init__(self):
        self.job_aggregator = JobAggregator()
        self.job_matcher = JobMatcher()
        self.running = False
        self.worker_thread = None
        self.scheduler = schedule.Scheduler()
        
    def start(self):
        """Start the worker thread"""
        if self.running:
            logger.warning("Worker is already running")
            return
            
        self.running = True
        self.worker_thread = threading.Thread(target=self._run_scheduler)
        self.worker_thread.daemon = True
        self.worker_thread.start()
        logger.info("Job worker started")
        
    def stop(self):
        """Stop the worker thread"""
        self.running = False
        if self.worker_thread:
            self.worker_thread.join(timeout=2.0)
            logger.info("Job worker stopped")
    
    def _run_scheduler(self):
        """Run the scheduler loop"""
        while self.running:
            self.scheduler.run_pending()
            time.sleep(1)
    
    def schedule_job_search(
        self, 
        user_id: str, 
        schedule_interval_hours: int = DEFAULT_SEARCH_INTERVAL_HOURS
    ):
        """Schedule a recurring job search for a user"""
        # Remove any existing schedule for this user
        self.scheduler.clear(f"job_search_{user_id}")
        
        # Schedule the job search
        job_time = datetime.now() + timedelta(minutes=1)  # First run in 1 minute
        
        # Schedule immediate and recurring searches
        self.scheduler.every().day.at(job_time.strftime("%H:%M")).do(
            self.process_user_job_search, user_id
        ).tag(f"job_search_{user_id}")
        
        # Also schedule regular interval
        self.scheduler.every(schedule_interval_hours).hours.do(
            self.process_user_job_search, user_id
        ).tag(f"job_search_{user_id}")
        
        logger.info(f"Scheduled job search for user {user_id} every {schedule_interval_hours} hours")
        
        # Return the next scheduled run time
        next_run = self.scheduler.next_run()
        return next_run
    
    def process_user_job_search(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Process a job search for a specific user
        1. Fetch user profile and preferences from the server
        2. Search for jobs based on the profile and preferences
        3. Match jobs with the user profile
        4. Store matches in the database and notify user of relevant matches
        """
        try:
            # 1. Fetch user profile and preferences
            user_data = self._fetch_user_data(user_id)
            if not user_data:
                logger.error(f"Could not fetch user data for user {user_id}")
                return []
                
            resume_data = self._parse_user_resume_data(user_data.get("resume", {}))
            preferences = user_data.get("preferences", {})
            
            # Extract relevant search parameters
            search_keywords = self._extract_search_keywords(resume_data, preferences)
            location = preferences.get("location")
            
            # 2. Search for jobs
            logger.info(f"Searching jobs for user {user_id} with keywords: {search_keywords}")
            job_listings = self.job_aggregator.search_jobs(
                keywords=search_keywords,
                location=location,
                limit_per_source=DEFAULT_SEARCH_LIMIT_PER_SOURCE
            )
            
            if not job_listings:
                logger.warning(f"No jobs found for user {user_id}")
                return []
                
            logger.info(f"Found {len(job_listings)} potential jobs for user {user_id}")
            
            # 3. Match jobs with user profile
            matched_jobs = self.job_matcher.match_jobs(
                resume_data=resume_data,
                job_listings=job_listings,
                preferences=preferences
            )
            
            logger.info(f"Matched {len(matched_jobs)} jobs for user {user_id}")
            
            # Filter jobs by match threshold
            relevant_matches = [
                job for job in matched_jobs 
                if job["match_score"] >= DEFAULT_MATCH_THRESHOLD
            ]
            
            logger.info(f"Found {len(relevant_matches)} relevant job matches for user {user_id}")
            
            # 4. Store matches and send notifications
            if relevant_matches:
                self._store_job_matches(user_id, relevant_matches)
                self._send_job_notifications(user_id, relevant_matches)
                
            return relevant_matches
            
        except Exception as e:
            logger.error(f"Error processing job search for user {user_id}: {str(e)}")
            return []
    
    def _fetch_user_data(self, user_id: str) -> Dict[str, Any]:
        """Fetch user profile and preferences from the server"""
        try:
            response = requests.get(f"{SERVER_API_URL}/users/{user_id}/profile")
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to fetch user data: {response.status_code}")
                return {}
        except Exception as e:
            logger.error(f"Error fetching user data: {str(e)}")
            return {}
    
    def _parse_user_resume_data(self, resume_json: Dict[str, Any]) -> ResumeData:
        """Parse resume JSON data into ResumeData object"""
        # This is a basic implementation - in a real system, you would 
        # do more sophisticated parsing based on your data structure
        from resume_parser import Skill, Experience, Education
        
        skills = [
            Skill(
                name=skill.get("name", ""),
                level=skill.get("level", ""),
                keywords=skill.get("keywords", [])
            )
            for skill in resume_json.get("skills", [])
        ]
        
        experience = [
            Experience(
                title=exp.get("title", ""),
                company=exp.get("company", ""),
                location=exp.get("location", ""),
                start_date=exp.get("start_date", ""),
                end_date=exp.get("end_date", ""),
                description=exp.get("description", "")
            )
            for exp in resume_json.get("experience", [])
        ]
        
        education = [
            Education(
                institution=edu.get("institution", ""),
                degree=edu.get("degree", ""),
                field_of_study=edu.get("field_of_study", ""),
                start_date=edu.get("start_date", ""),
                end_date=edu.get("end_date", ""),
                description=edu.get("description", "")
            )
            for edu in resume_json.get("education", [])
        ]
        
        return ResumeData(
            name=resume_json.get("name", ""),
            email=resume_json.get("email", ""),
            phone=resume_json.get("phone", ""),
            location=resume_json.get("location", ""),
            summary=resume_json.get("summary", ""),
            skills=skills,
            experience=experience,
            education=education,
            certifications=[],
            projects=[],
            languages=[]
        )
    
    def _extract_search_keywords(
        self, 
        resume_data: ResumeData, 
        preferences: Dict[str, Any]
    ) -> List[str]:
        """Extract search keywords from resume data and preferences"""
        keywords = []
        
        # Add skill keywords
        for skill in resume_data.skills:
            keywords.append(skill.name)
        
        # Add job title preferences
        if preferences.get("title"):
            keywords.append(preferences["title"])
        
        # Add industry preferences
        if preferences.get("industry"):
            keywords.append(preferences["industry"])
        
        # If user has recent experience, use that title as well
        if resume_data.experience:
            most_recent_title = resume_data.experience[0].title
            if most_recent_title and most_recent_title not in keywords:
                keywords.append(most_recent_title)
        
        # Remove duplicates and limit to top 10 keywords
        unique_keywords = list(set(keywords))
        return unique_keywords[:10]
    
    def _store_job_matches(self, user_id: str, job_matches: List[Dict[str, Any]]):
        """Store job matches in the database"""
        try:
            response = requests.post(
                f"{SERVER_API_URL}/users/{user_id}/job-matches",
                json={"matches": job_matches}
            )
            
            if response.status_code == 200:
                logger.info(f"Stored {len(job_matches)} job matches for user {user_id}")
            else:
                logger.error(f"Failed to store job matches: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Error storing job matches: {str(e)}")
    
    def _send_job_notifications(self, user_id: str, job_matches: List[Dict[str, Any]]):
        """Send notifications for relevant job matches"""
        try:
            # Get top 5 matches for notification
            top_matches = sorted(
                job_matches, 
                key=lambda x: x["match_score"], 
                reverse=True
            )[:5]
            
            if not top_matches:
                return
                
            # Prepare notification data
            notification_data = {
                "user_id": user_id,
                "type": "job_matches",
                "title": f"Found {len(job_matches)} job matches for you",
                "message": f"Top match: {top_matches[0]['title']} at {top_matches[0]['company']}",
                "data": {
                    "match_count": len(job_matches),
                    "top_matches": top_matches
                }
            }
            
            # Send notification
            response = requests.post(
                f"{SERVER_API_URL}/notifications",
                json=notification_data
            )
            
            if response.status_code == 200:
                logger.info(f"Sent job notification to user {user_id}")
            else:
                logger.error(f"Failed to send job notification: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Error sending job notification: {str(e)}")

# Singleton worker instance
_worker_instance = None

def get_worker() -> JobWorker:
    """Get the singleton worker instance"""
    global _worker_instance
    if _worker_instance is None:
        _worker_instance = JobWorker()
    return _worker_instance

# Main function for testing
if __name__ == "__main__":
    worker = get_worker()
    worker.start()
    
    # Schedule a test job search
    test_user_id = "test_user_123"
    worker.schedule_job_search(test_user_id, schedule_interval_hours=1)
    
    try:
        # Keep the main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        worker.stop()
        print("Worker stopped") 