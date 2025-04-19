"""
Job Matcher Module for AutoJobber

This module provides functionality to match job listings with user profiles,
calculating relevance scores and providing matching reasons.
"""

import logging
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from resume_parser import ResumeData, Skill, Experience
from job_scraper import JobListing

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Download required NLTK resources (uncomment on first run)
# nltk.download('punkt')
# nltk.download('stopwords')
# nltk.download('wordnet')

class JobMatcher:
    """
    Matches job listings with user profiles using NLP techniques
    and a scoring algorithm to determine the best fits.
    """
    
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        self.vectorizer = TfidfVectorizer()
        
    def preprocess_text(self, text: str) -> str:
        """Preprocess text for NLP analysis"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and digits
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\d+', ' ', text)
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords and lemmatize
        filtered_tokens = [
            self.lemmatizer.lemmatize(token)
            for token in tokens
            if token not in self.stop_words
        ]
        
        return ' '.join(filtered_tokens)
    
    def extract_profile_keywords(self, resume_data: ResumeData) -> str:
        """Extract keywords from resume data"""
        keywords = []
        
        # Add name and title
        if resume_data.name:
            keywords.append(resume_data.name)
        
        # Add summary
        if resume_data.summary:
            keywords.append(resume_data.summary)
            
        # Add skills
        for skill in resume_data.skills:
            keywords.append(skill.name)
            if skill.keywords:
                keywords.extend(skill.keywords)
        
        # Add experience
        for exp in resume_data.experience:
            keywords.append(exp.title)
            keywords.append(exp.company)
            if exp.description:
                keywords.append(exp.description)
                
        # Add education
        for edu in resume_data.education:
            keywords.append(edu.institution)
            keywords.append(edu.degree or "")
            keywords.append(edu.field_of_study or "")
            
        # Join all keywords
        return ' '.join(keywords)
    
    def extract_job_keywords(self, job: JobListing) -> str:
        """Extract keywords from job listing"""
        keywords = [
            job.title,
            job.company,
            job.location,
            job.description
        ]
        
        # Add job type and work mode if available
        if job.job_type:
            keywords.append(job.job_type)
        if job.work_mode:
            keywords.append(job.work_mode)
            
        return ' '.join(keywords)
    
    def calculate_skill_match_score(
        self, 
        resume_skills: List[Skill], 
        job_description: str
    ) -> Tuple[float, List[str]]:
        """Calculate skill match score and matching skills"""
        job_desc_lower = job_description.lower()
        matching_skills = []
        total_skills = len(resume_skills)
        
        if total_skills == 0:
            return 0.0, []
            
        for skill in resume_skills:
            skill_name_lower = skill.name.lower()
            if skill_name_lower in job_desc_lower:
                matching_skills.append(skill.name)
                
        match_score = len(matching_skills) / total_skills
        return match_score, matching_skills
    
    def calculate_experience_match(
        self,
        resume_experience: List[Experience],
        job_title: str,
        job_description: str
    ) -> Tuple[float, Optional[str]]:
        """Calculate experience match score and relevant experience"""
        if not resume_experience:
            return 0.0, None
            
        job_title_lower = job_title.lower()
        job_desc_lower = job_description.lower()
        
        best_match_score = 0.0
        best_match_experience = None
        
        for exp in resume_experience:
            # Check if experience title matches job title
            exp_title_lower = exp.title.lower()
            title_similarity = JobMatcher._text_similarity(exp_title_lower, job_title_lower)
            
            # Check if experience description matches job description
            exp_desc = exp.description or ""
            exp_desc_lower = exp_desc.lower()
            desc_similarity = JobMatcher._text_similarity(exp_desc_lower, job_desc_lower)
            
            # Average the scores
            match_score = (title_similarity * 0.7) + (desc_similarity * 0.3)
            
            if match_score > best_match_score:
                best_match_score = match_score
                best_match_experience = exp.title
                
        return best_match_score, best_match_experience
    
    @staticmethod
    def _text_similarity(text1: str, text2: str) -> float:
        """Calculate simple text similarity"""
        if not text1 or not text2:
            return 0.0
            
        # Count common words
        words1 = set(text1.split())
        words2 = set(text2.split())
        common_words = words1.intersection(words2)
        
        # Calculate Jaccard similarity
        if not words1 or not words2:
            return 0.0
            
        similarity = len(common_words) / (len(words1) + len(words2) - len(common_words))
        return similarity
    
    def calculate_location_match(
        self,
        resume_location: Optional[str],
        job_location: str,
        remote_preference: bool = False
    ) -> Tuple[float, bool]:
        """Calculate location match score"""
        # Handle remote jobs
        job_location_lower = job_location.lower()
        is_remote_job = "remote" in job_location_lower
        
        # If user prefers remote and job is remote, perfect match
        if remote_preference and is_remote_job:
            return 1.0, True
            
        # If user has no location preference, medium match
        if not resume_location:
            return 0.5, False
            
        # Compare locations
        resume_location_lower = resume_location.lower()
        
        # Extract city and state from both locations
        resume_parts = resume_location_lower.replace(",", "").split()
        job_parts = job_location_lower.replace(",", "").split()
        
        # Check for overlapping parts
        common_parts = set(resume_parts).intersection(set(job_parts))
        
        if common_parts:
            return 0.8, False
        else:
            return 0.2, False
    
    def match_jobs(
        self,
        resume_data: ResumeData,
        job_listings: List[JobListing],
        preferences: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Match jobs with user profile and return sorted matches with scores and reasons
        """
        if preferences is None:
            preferences = {}
            
        matched_jobs = []
        
        for job in job_listings:
            # Calculate skill match
            skill_score, matching_skills = self.calculate_skill_match_score(
                resume_data.skills, job.description
            )
            
            # Calculate experience match
            experience_score, relevant_experience = self.calculate_experience_match(
                resume_data.experience, job.title, job.description
            )
            
            # Calculate location match
            location_preference = preferences.get("location", None)
            remote_preference = preferences.get("work_mode", "").lower() == "remote"
            location_score, is_remote_match = self.calculate_location_match(
                location_preference, job.location, remote_preference
            )
            
            # Calculate overall match score
            # Weights can be adjusted based on importance
            overall_score = (
                (skill_score * 0.5) +
                (experience_score * 0.3) +
                (location_score * 0.2)
            )
            
            # Prepare match reasons
            match_reasons = []
            
            if matching_skills:
                skills_to_show = matching_skills[:3]  # Show top 3 skills
                match_reasons.append(f"Skills match: {', '.join(skills_to_show)}")
                
            if relevant_experience:
                match_reasons.append(f"Experience match: {relevant_experience}")
                
            if is_remote_match:
                match_reasons.append("Remote work preference match")
            elif location_score > 0.7:
                match_reasons.append("Location preference match")
                
            # Add job type match if applicable
            if preferences.get("job_type") and job.job_type and preferences["job_type"].lower() in job.job_type.lower():
                match_reasons.append(f"Job type match: {job.job_type}")
                
            # Add matched job with score and reasons
            matched_job = {
                **job.to_dict(),
                "match_score": round(overall_score, 2),
                "match_reasons": match_reasons
            }
            
            matched_jobs.append(matched_job)
            
        # Sort by match score (highest first)
        matched_jobs.sort(key=lambda x: x["match_score"], reverse=True)
        
        return matched_jobs

# Testing function
if __name__ == "__main__":
    from job_scraper import JobListing
    from datetime import datetime
    
    # Create a mock resume
    mock_resume = ResumeData(
        name="John Doe",
        email="john@example.com",
        phone="555-1234",
        location="New York, NY",
        summary="Experienced software engineer with expertise in Python and machine learning.",
        skills=[
            Skill(name="Python", level="Expert", keywords=["Django", "Flask"]),
            Skill(name="Machine Learning", level="Intermediate", keywords=["TensorFlow", "scikit-learn"]),
            Skill(name="SQL", level="Advanced", keywords=["PostgreSQL", "MySQL"])
        ],
        experience=[
            Experience(
                title="Senior Software Engineer",
                company="Tech Company",
                location="New York, NY",
                start_date="2020-01",
                end_date="2023-05",
                description="Developed machine learning models for recommendation systems."
            ),
            Experience(
                title="Data Scientist",
                company="Data Corp",
                location="Remote",
                start_date="2018-03",
                end_date="2019-12",
                description="Analyzed large datasets and created predictive models."
            )
        ],
        education=[],
        certifications=[],
        projects=[],
        languages=[]
    )
    
    # Create mock job listings
    mock_jobs = [
        JobListing(
            job_id="job1",
            title="Senior Machine Learning Engineer",
            company="AI Solutions",
            location="New York, NY",
            description="We're looking for an expert in Python and machine learning to join our team.",
            url="https://example.com/job1",
            date_posted=datetime.now(),
            salary_range="$120K-$150K",
            job_type="Full-time",
            work_mode="Hybrid",
            source="linkedin"
        ),
        JobListing(
            job_id="job2",
            title="Python Developer",
            company="Web Corp",
            location="Remote",
            description="Seeking a developer with strong SQL and Python skills for our backend team.",
            url="https://example.com/job2",
            date_posted=datetime.now(),
            salary_range="$100K-$130K",
            job_type="Full-time",
            work_mode="Remote",
            source="indeed"
        )
    ]
    
    # Create preferences
    preferences = {
        "location": "New York, NY",
        "work_mode": "hybrid",
        "job_type": "Full-time"
    }
    
    # Match jobs
    matcher = JobMatcher()
    matches = matcher.match_jobs(mock_resume, mock_jobs, preferences)
    
    # Print results
    for match in matches:
        print(f"Job: {match['title']} at {match['company']}")
        print(f"Match score: {match['match_score']}")
        print(f"Match reasons: {', '.join(match['match_reasons'])}")
        print("---") 