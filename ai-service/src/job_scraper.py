"""
Job Scraper Module for AutoJobber

This module provides functionality to scrape job listings from various
job boards and APIs, including LinkedIn, Indeed, and others.
"""

import requests
import os
import logging
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional
from datetime import datetime
from dotenv import load_dotenv
import time
import random

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class JobListing:
    """Represents a job listing with standardized fields"""
    
    def __init__(
        self,
        job_id: str,
        title: str,
        company: str,
        location: str,
        description: str,
        url: str,
        date_posted: datetime,
        salary_range: Optional[str] = None,
        job_type: Optional[str] = None,
        work_mode: Optional[str] = None,
        source: str = "unknown"
    ):
        self.job_id = job_id
        self.title = title
        self.company = company
        self.location = location
        self.description = description
        self.url = url
        self.date_posted = date_posted
        self.salary_range = salary_range
        self.job_type = job_type
        self.work_mode = work_mode
        self.source = source
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert job listing to dictionary"""
        return {
            "job_id": self.job_id,
            "title": self.title,
            "company": self.company,
            "location": self.location,
            "description": self.description,
            "url": self.url,
            "date_posted": self.date_posted.isoformat(),
            "salary_range": self.salary_range,
            "job_type": self.job_type,
            "work_mode": self.work_mode,
            "source": self.source
        }

class LinkedInScraper:
    """Scraper for LinkedIn jobs"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("LINKEDIN_API_KEY")
        self.base_url = "https://api.linkedin.com/v2"
        
    def search_jobs(
        self,
        keywords: List[str],
        location: Optional[str] = None,
        limit: int = 20
    ) -> List[JobListing]:
        """
        Search for jobs on LinkedIn
        
        Note: This is a placeholder for the LinkedIn API integration.
        In a real implementation, you would use the LinkedIn API with proper authentication.
        """
        logger.info(f"Searching LinkedIn jobs with keywords: {keywords}, location: {location}")
        
        # This is mock data - in reality you would call the LinkedIn API
        mock_jobs = [
            JobListing(
                job_id=f"linkedin-{i}",
                title=f"Senior {random.choice(['Software Engineer', 'Developer', 'Data Scientist'])}",
                company=random.choice(["Tech Inc.", "Software Solutions", "Data Corp"]),
                location=location or random.choice(["Remote", "New York, NY", "San Francisco, CA"]),
                description=f"We're looking for a talented professional with skills in {', '.join(keywords[:3])}...",
                url=f"https://linkedin.com/jobs/view/job-{i}",
                date_posted=datetime.now(),
                salary_range=random.choice(["$100K-$130K", "$130K-$160K", None]),
                job_type="Full-time",
                work_mode=random.choice(["Remote", "On-site", "Hybrid"]),
                source="linkedin"
            )
            for i in range(limit)
        ]
        
        # Simulate API delay
        time.sleep(1)
        
        return mock_jobs[:limit]

class IndeedScraper:
    """Scraper for Indeed jobs"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("INDEED_API_KEY")
        self.base_url = "https://api.indeed.com/v2"
        
    def search_jobs(
        self,
        keywords: List[str],
        location: Optional[str] = None,
        limit: int = 20
    ) -> List[JobListing]:
        """
        Search for jobs on Indeed
        
        Note: This is a placeholder for the Indeed API integration.
        In a real implementation, you would use the Indeed API with proper authentication.
        """
        logger.info(f"Searching Indeed jobs with keywords: {keywords}, location: {location}")
        
        # This is mock data - in reality you would call the Indeed API
        mock_jobs = [
            JobListing(
                job_id=f"indeed-{i}",
                title=f"{random.choice(['Junior', 'Mid-level', 'Senior'])} {random.choice(['Developer', 'Engineer', 'Analyst'])}",
                company=random.choice(["Tech Solutions", "Digital Inc.", "WebDev Company"]),
                location=location or random.choice(["Remote", "Chicago, IL", "Austin, TX"]),
                description=f"Great opportunity for someone with experience in {', '.join(keywords[:3])}...",
                url=f"https://indeed.com/viewjob?jk=job-{i}",
                date_posted=datetime.now(),
                salary_range=random.choice(["$80K-$100K", "$100K-$120K", None]),
                job_type=random.choice(["Full-time", "Contract", "Part-time"]),
                work_mode=random.choice(["Remote", "On-site", "Hybrid"]),
                source="indeed"
            )
            for i in range(limit)
        ]
        
        # Simulate API delay
        time.sleep(1)
        
        return mock_jobs[:limit]

class JobAggregator:
    """Aggregates job listings from multiple sources"""
    
    def __init__(self):
        self.linkedin_scraper = LinkedInScraper()
        self.indeed_scraper = IndeedScraper()
        
    def search_jobs(
        self,
        keywords: List[str],
        location: Optional[str] = None,
        sources: List[str] = ["linkedin", "indeed"],
        limit_per_source: int = 10
    ) -> List[JobListing]:
        """Search for jobs across multiple sources"""
        all_jobs = []
        
        if "linkedin" in sources:
            linkedin_jobs = self.linkedin_scraper.search_jobs(keywords, location, limit_per_source)
            all_jobs.extend(linkedin_jobs)
            
        if "indeed" in sources:
            indeed_jobs = self.indeed_scraper.search_jobs(keywords, location, limit_per_source)
            all_jobs.extend(indeed_jobs)
            
        # Sort jobs by date posted (newest first)
        all_jobs.sort(key=lambda job: job.date_posted, reverse=True)
        
        return all_jobs

# Testing function
if __name__ == "__main__":
    aggregator = JobAggregator()
    jobs = aggregator.search_jobs(
        keywords=["python", "machine learning", "data science"],
        location="Remote",
        limit_per_source=5
    )
    
    print(f"Found {len(jobs)} jobs:")
    for job in jobs:
        print(f"{job.title} at {job.company} - {job.location}") 