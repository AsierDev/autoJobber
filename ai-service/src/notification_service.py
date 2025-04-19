"""
Notification Service Module for AutoJobber

This module handles notifications for job matches and other important events,
supporting multiple notification channels including email and push notifications.
"""

import logging
import os
import json
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "autojobber@example.com")

# Push notification configuration
PUSH_ENABLED = os.getenv("PUSH_ENABLED", "false").lower() == "true"
PUSH_API_URL = os.getenv("PUSH_API_URL", "")
PUSH_API_KEY = os.getenv("PUSH_API_KEY", "")

# Server API URL
SERVER_API_URL = os.getenv("SERVER_API_URL", "http://localhost:3000/api")

class NotificationChannel:
    """Base class for notification channels"""
    
    def send_notification(self, user_id: str, notification_data: Dict[str, Any]) -> bool:
        """Send a notification through this channel"""
        raise NotImplementedError("Subclasses must implement this method")

class EmailNotificationChannel(NotificationChannel):
    """Email notification channel"""
    
    def __init__(self):
        self.smtp_server = SMTP_SERVER
        self.smtp_port = SMTP_PORT
        self.username = SMTP_USERNAME
        self.password = SMTP_PASSWORD
        self.from_email = EMAIL_FROM
    
    def send_notification(self, user_id: str, notification_data: Dict[str, Any]) -> bool:
        """Send an email notification"""
        try:
            # Get user email
            user_data = self._get_user_data(user_id)
            if not user_data or "email" not in user_data:
                logger.error(f"No email found for user {user_id}")
                return False
                
            to_email = user_data["email"]
            
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = notification_data.get("title", "AutoJobber Notification")
            msg["From"] = self.from_email
            msg["To"] = to_email
            
            # Create plain text content
            text_content = self._format_text_email(notification_data)
            msg.attach(MIMEText(text_content, "plain"))
            
            # Create HTML content
            html_content = self._format_html_email(notification_data)
            msg.attach(MIMEText(html_content, "html"))
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                if self.username and self.password:
                    server.login(self.username, self.password)
                server.send_message(msg)
                
            logger.info(f"Email notification sent to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email notification: {str(e)}")
            return False
    
    def _get_user_data(self, user_id: str) -> Dict[str, Any]:
        """Get user data from the server"""
        try:
            response = requests.get(f"{SERVER_API_URL}/users/{user_id}")
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to get user data: {response.status_code}")
                return {}
        except Exception as e:
            logger.error(f"Error getting user data: {str(e)}")
            return {}
    
    def _format_text_email(self, notification_data: Dict[str, Any]) -> str:
        """Format plain text email content"""
        if notification_data.get("type") == "job_matches":
            return self._format_job_matches_text(notification_data)
        else:
            return notification_data.get("message", "You have a new notification from AutoJobber.")
    
    def _format_html_email(self, notification_data: Dict[str, Any]) -> str:
        """Format HTML email content"""
        if notification_data.get("type") == "job_matches":
            return self._format_job_matches_html(notification_data)
        else:
            return f"""
            <html>
              <body>
                <h2>AutoJobber Notification</h2>
                <p>{notification_data.get("message", "You have a new notification from AutoJobber.")}</p>
              </body>
            </html>
            """
    
    def _format_job_matches_text(self, notification_data: Dict[str, Any]) -> str:
        """Format job matches as plain text"""
        message = notification_data.get("title", "New Job Matches") + "\n\n"
        
        if "data" in notification_data and "top_matches" in notification_data["data"]:
            top_matches = notification_data["data"]["top_matches"]
            
            for i, match in enumerate(top_matches, 1):
                message += f"{i}. {match['title']} at {match['company']}\n"
                message += f"   Location: {match['location']}\n"
                message += f"   Match score: {match['match_score']}\n"
                if "match_reasons" in match:
                    message += f"   Match reasons: {', '.join(match['match_reasons'])}\n"
                message += f"   URL: {match.get('url', 'N/A')}\n\n"
                
        message += "View all matches on your AutoJobber dashboard."
        return message
    
    def _format_job_matches_html(self, notification_data: Dict[str, Any]) -> str:
        """Format job matches as HTML"""
        html = f"""
        <html>
          <head>
            <style>
              body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
              .job-match {{ margin-bottom: 20px; border-left: 4px solid #4CAF50; padding-left: 15px; }}
              .job-title {{ font-size: 18px; font-weight: bold; margin-bottom: 5px; color: #333; }}
              .job-company {{ font-size: 16px; color: #666; margin-bottom: 5px; }}
              .job-details {{ font-size: 14px; color: #777; }}
              .match-score {{ display: inline-block; padding: 2px 8px; background-color: #4CAF50; color: white; border-radius: 12px; font-size: 12px; }}
              .match-reasons {{ font-style: italic; color: #555; }}
              .view-all {{ margin-top: 20px; text-align: center; }}
              .view-button {{ display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; }}
            </style>
          </head>
          <body>
            <h2>{notification_data.get("title", "New Job Matches")}</h2>
        """
        
        if "data" in notification_data and "top_matches" in notification_data["data"]:
            top_matches = notification_data["data"]["top_matches"]
            
            for match in top_matches:
                html += f"""
                <div class="job-match">
                  <div class="job-title">{match['title']}</div>
                  <div class="job-company">{match['company']} - {match['location']}</div>
                  <div class="job-details">
                    <span class="match-score">{int(match['match_score'] * 100)}% Match</span>
                    <p class="match-reasons">
                      {', '.join(match.get('match_reasons', []))}
                    </p>
                    <p><a href="{match.get('url', '#')}">View Job Details</a></p>
                  </div>
                </div>
                """
                
        html += """
            <div class="view-all">
              <a href="https://autojobber-app.example.com/dashboard" class="view-button">View All Matches</a>
            </div>
          </body>
        </html>
        """
        
        return html

class PushNotificationChannel(NotificationChannel):
    """Push notification channel"""
    
    def __init__(self):
        self.enabled = PUSH_ENABLED
        self.api_url = PUSH_API_URL
        self.api_key = PUSH_API_KEY
    
    def send_notification(self, user_id: str, notification_data: Dict[str, Any]) -> bool:
        """Send a push notification"""
        if not self.enabled:
            logger.info("Push notifications are disabled")
            return False
            
        try:
            # Get user's push tokens
            user_tokens = self._get_user_push_tokens(user_id)
            if not user_tokens:
                logger.warning(f"No push tokens found for user {user_id}")
                return False
                
            # Prepare notification payload
            payload = {
                "tokens": user_tokens,
                "notification": {
                    "title": notification_data.get("title", "AutoJobber Notification"),
                    "body": notification_data.get("message", "You have a new notification")
                },
                "data": notification_data.get("data", {})
            }
            
            # Send notification
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                logger.info(f"Push notification sent to user {user_id}")
                return True
            else:
                logger.error(f"Failed to send push notification: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending push notification: {str(e)}")
            return False
    
    def _get_user_push_tokens(self, user_id: str) -> List[str]:
        """Get user's push notification tokens"""
        try:
            response = requests.get(f"{SERVER_API_URL}/users/{user_id}/push-tokens")
            if response.status_code == 200:
                data = response.json()
                return data.get("tokens", [])
            else:
                logger.error(f"Failed to get user push tokens: {response.status_code}")
                return []
        except Exception as e:
            logger.error(f"Error getting user push tokens: {str(e)}")
            return []

class NotificationService:
    """Service for sending notifications through multiple channels"""
    
    def __init__(self):
        self.channels = []
        
        # Add email channel
        if SMTP_USERNAME and SMTP_PASSWORD:
            self.channels.append(EmailNotificationChannel())
            
        # Add push notification channel
        if PUSH_ENABLED and PUSH_API_URL and PUSH_API_KEY:
            self.channels.append(PushNotificationChannel())
    
    def send_notification(
        self, 
        user_id: str, 
        title: str, 
        message: str, 
        notification_type: str = "general",
        data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Send a notification to a user through all available channels"""
        if not self.channels:
            logger.warning("No notification channels configured")
            return False
            
        notification_data = {
            "title": title,
            "message": message,
            "type": notification_type,
            "data": data or {},
            "timestamp": datetime.now().isoformat()
        }
        
        # Record notification in the database
        self._store_notification(user_id, notification_data)
        
        # Send through all channels
        success = False
        for channel in self.channels:
            channel_success = channel.send_notification(user_id, notification_data)
            success = success or channel_success
            
        return success
    
    def send_job_matches_notification(
        self, 
        user_id: str, 
        matches: List[Dict[str, Any]]
    ) -> bool:
        """Send a notification about new job matches"""
        if not matches:
            return False
            
        match_count = len(matches)
        title = f"Found {match_count} job matches for you"
        
        top_match = matches[0]
        message = f"Top match: {top_match['title']} at {top_match['company']}"
        
        data = {
            "match_count": match_count,
            "top_matches": matches[:5]  # Include top 5 matches in notification data
        }
        
        return self.send_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type="job_matches",
            data=data
        )
    
    def _store_notification(self, user_id: str, notification_data: Dict[str, Any]):
        """Store notification in the database"""
        try:
            payload = {
                "user_id": user_id,
                "notification": notification_data
            }
            
            response = requests.post(
                f"{SERVER_API_URL}/notifications",
                json=payload
            )
            
            if response.status_code == 200:
                logger.info(f"Notification stored for user {user_id}")
            else:
                logger.error(f"Failed to store notification: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Error storing notification: {str(e)}")

# Singleton notification service instance
_notification_service_instance = None

def get_notification_service() -> NotificationService:
    """Get the singleton notification service instance"""
    global _notification_service_instance
    if _notification_service_instance is None:
        _notification_service_instance = NotificationService()
    return _notification_service_instance

# Testing function
if __name__ == "__main__":
    # Test notification service
    notification_service = get_notification_service()
    
    # Test general notification
    notification_service.send_notification(
        user_id="test_user_123",
        title="Test Notification",
        message="This is a test notification from AutoJobber",
        notification_type="test"
    )
    
    # Test job matches notification
    test_matches = [
        {
            "job_id": "job1",
            "title": "Senior Software Engineer",
            "company": "Tech Inc.",
            "location": "Remote",
            "description": "We're looking for a talented engineer...",
            "url": "https://example.com/job1",
            "match_score": 0.85,
            "match_reasons": ["Skills match: Python, JavaScript", "Remote work preference"]
        },
        {
            "job_id": "job2",
            "title": "Frontend Developer",
            "company": "Web Solutions",
            "location": "New York, NY",
            "description": "Join our team of frontend experts...",
            "url": "https://example.com/job2",
            "match_score": 0.78,
            "match_reasons": ["Skills match: React, CSS"]
        }
    ]
    
    notification_service.send_job_matches_notification(
        user_id="test_user_123",
        matches=test_matches
    ) 