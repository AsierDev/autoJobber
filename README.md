# AutoJobber

AutoJobber is a comprehensive platform for automating job applications and resume management using AI.

## Project Structure

- `server/`: Backend API server (Node.js, Express, TypeScript)
- `client/`: Frontend application (React, TypeScript)
- `ai-service/`: AI service for resume parsing and job matching (Python, FastAPI)

## Setup and Installation

### Prerequisites

- Node.js (v16+)
- Python (v3.9+)
- PostgreSQL
- AWS Account (for S3 storage)

### Server Setup

1. Install dependencies:
   ```
   cd server
   npm install
   ```

2. Set up environment variables by creating a `.env` file in the `server/` directory:
   ```
   # Database Configuration
   DB_NAME=autojobber
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432

   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=autojobber

   # AI Service Configuration
   AI_SERVICE_URL=http://localhost:8000

   # Authentication
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   ```

3. Create an AWS S3 bucket:
   - Login to AWS Console
   - Navigate to S3
   - Create a new bucket named "autojobber" (or your preferred name)
   - Update the `.env` file with your bucket name

4. Build and start the server:
   ```
   npm run build
   npm start
   ```

   For development:
   ```
   npm run dev
   ```

### AI Service Setup

1. Set up Python virtual environment:
   ```
   cd ai-service
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Download spaCy models:
   ```
   python -m spacy download en_core_web_md
   python -m spacy download en_core_web_sm
   ```

4. Start the AI service:
   ```
   cd src
   uvicorn main:app --reload
   ```

### Client Setup

1. Install dependencies:
   ```
   cd client
   npm install
   ```

2. Start the client:
   ```
   npm start
   ```

## Resume Management Implementation

The resume management system includes:

1. **Secure Storage with AWS S3**:
   - Resumes are uploaded to AWS S3 for secure storage
   - Files are stored with private ACL to prevent unauthorized access
   - Metadata includes user ID and original filename

2. **Resume Parsing with AI**:
   - PDF and DOCX files are processed by the AI service
   - Text extraction using PyPDF2 (for PDF) and docx2txt (for DOCX)
   - NLP with spaCy for extracting:
     - Personal information (name, email, phone)
     - Skills
     - Work experience
     - Education

3. **Authentication**:
   - JWT-based authentication
   - Token verification middleware

4. **File Validation**:
   - File type validation (PDF, DOCX only)
   - File size limits (5MB)
   - Filename sanitization to prevent security issues

## API Endpoints

### Server API

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and get JWT token
- `POST /api/resume/upload`: Upload a resume
- `GET /api/resume/active`: Get the active resume
- `GET /api/resume`: Get all user's resumes
- `DELETE /api/resume/:id`: Delete a resume
- `PATCH /api/resume/:id/active`: Set a resume as active

### AI Service API

- `POST /parse-resume`: Parse a resume file
- `POST /generate-summary`: Generate a summary from resume data
- `POST /suggest-improvements`: Suggest improvements for a resume
- `POST /match-jobs`: Match jobs based on resume data and preferences

## License

MIT 