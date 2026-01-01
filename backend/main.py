# backend/main.py

# ============= IMPORT NEW MODULES =============
from contextlib import asynccontextmanager
from database import db  # MongoDB database connection
import datetime
# Import your existing modules
from fastapi import FastAPI, UploadFile, File, HTTPException,status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from groq import Groq
import requests
import os

# Import your existing analysis modules
from analyzer import analyze_resume
from pdf_report import generate_pdf_report
from models import ResumeAnalysis, RewriteRequest, JobMatchRequest

# Import routes (NEW)
from routes import users, resume

# Import your Courses module
try:
    import Courses
except ImportError:
    import sys
    sys.path.append('.')
    import Courses

# Load environment variables from .env
load_dotenv()

# ---- KEYS ----
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST", "jsearch.p.rapidapi.com")

# ---- Groq Client ----
client = Groq(api_key=GROQ_API_KEY)

# ============= LIFESPAN MANAGER =============
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    try:
        await db.connect()
        print("✅ MongoDB connected successfully")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        # Continue anyway for development
    
    yield
    
    # Shutdown: Disconnect from MongoDB
    await db.disconnect()

# ============= CREATE FASTAPI APP =============
app = FastAPI(
    title="AI Resume Analyzer API",
    description="AI-powered resume analysis with user authentication",
    version="2.0.0",
    lifespan=lifespan  # Add lifespan manager
)

# ============= CORS - MOVE THIS BEFORE ROUTERS =============
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your React frontend
    allow_credentials=True,  # IMPORTANT: Allow cookies/auth headers
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ============= INCLUDE ROUTERS =============
app.include_router(users.router)
app.include_router(resume.router)

# ========================================================
# HEALTH CHECK
# ========================================================
@app.get("/")
async def root():
    return {
        "message": "AI Resume Analyzer API",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "Resume Analysis",
            "Job Matching",
            "User Authentication",
            "Resume History",
            "Course Recommendations"
        ]
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "database": "connected" if db.db else "disconnected",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

# ========================================================
# 🔥 NEW COURSES ENDPOINTS - UPDATED FOR AUTH
# ========================================================
@app.get("/api/courses/{field}")
async def get_courses(field: str):
    """
    Get courses for a specific field
    Example: GET /api/courses/web_development
    """
    # Map frontend field names to your course lists
    course_mapping = {
        # Data Science
        "data_science": Courses.ds_course,
        "datascience": Courses.ds_course,
        "data-science": Courses.ds_course,
        
        # Web Development
        "web_development": Courses.web_course,
        "webdevelopment": Courses.web_course,
        "web": Courses.web_course,
        
        # Android
        "android": Courses.android_course,
        "android_development": Courses.android_course,
        "androiddevelopment": Courses.android_course,
        
        # iOS
        "ios": Courses.ios_course,
        "ios_development": Courses.ios_course,
        "iosdevelopment": Courses.ios_course,
        
        # UI/UX
        "ui_ux": Courses.uiux_course,
        "uiux": Courses.uiux_course,
        "ui_ux_design": Courses.uiux_course,
        "design": Courses.uiux_course,
        
        # Resume Videos
        "resume": Courses.resume_videos,
        "resume_writing": Courses.resume_videos,
        "resumevideos": Courses.resume_videos,
        
        # Interview Videos
        "interview": Courses.interview_videos,
        "interview_preparation": Courses.interview_videos,
        "interviewvideos": Courses.interview_videos,
    }
    
    # Get courses or return empty list
    courses = course_mapping.get(field.lower(), [])
    
    return {
        "field": field,
        "courses": courses,
        "count": len(courses),
        "message": f"Found {len(courses)} courses for {field}"
    }

@app.get("/api/all-courses")
async def get_all_courses():
    """
    Get all available courses
    Example: GET /api/all-courses
    """
    return {
        "data_science": Courses.ds_course,
        "web_development": Courses.web_course,
        "android": Courses.android_course,
        "ios": Courses.ios_course,
        "ui_ux": Courses.uiux_course,
        "resume_videos": Courses.resume_videos,
        "interview_videos": Courses.interview_videos,
        "message": "All available courses",
        "total_count": len(Courses.ds_course) + len(Courses.web_course) + len(Courses.android_course) + 
                     len(Courses.ios_course) + len(Courses.uiux_course) + 
                     len(Courses.resume_videos) + len(Courses.interview_videos)
    }

# ========================================================
# 1️⃣ DOWNLOAD PDF REPORT - UPDATED FOR AUTH
# ========================================================
@app.post("/download-report")
async def download_report(data: dict):
    pdf_buffer = generate_pdf_report(data)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=resume_report.pdf"}
    )


# ========================================================
# 2️⃣ REAL JOB SEARCH (RapidAPI JSearch)
# ========================================================
@app.get("/job-search")
async def job_search(query: str = "developer", location: str = "India"):
    """
    Search real jobs using RapidAPI JSearch
    """

    url = "https://jsearch.p.rapidapi.com/search"

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
    }

    params = {
        "query": f"{query} jobs in {location}",
        "num_pages": 1
    }

    response = requests.get(url, headers=headers, params=params)

    return response.json()


@app.post("/job-match")
async def job_match(req: JobMatchRequest):
    """
    AI-powered job match analysis between resume and job description
    """
    print("Received job match request:")
    print(f"Resume text length: {len(req.resume_text)}")
    print(f"Job description length: {len(req.job_description)}")
    print(f"Skills: {req.skills}")
    
    # Build the AI prompt for job matching
    prompt = f"""
Analyze the match between the resume and job description below.

RESUME SKILLS:
{', '.join(req.skills) if req.skills else 'No skills provided'}

RESUME CONTENT (first 2000 chars):
{req.resume_text[:2000] if req.resume_text else 'No resume content provided'}

JOB DESCRIPTION:
{req.job_description[:3000] if req.job_description else 'No job description provided'}

ANALYSIS REQUIREMENTS:
1. Calculate a Job Match Score (0-100) based on skills match, experience match, and keyword overlap
2. List 5-10 specific Matched Keywords (technical terms found in both resume and job description)
3. List 5-10 Missing Important Keywords (important requirements from JD not in resume)
4. List 3-5 Strengths (what makes the candidate suitable)
5. List 3-5 Weaknesses (areas needing improvement)
6. Provide a brief Final Recommendation (1-2 sentences)

RETURN FORMAT: Pure JSON only, no explanations, no markdown, no code blocks.
"""
    
    try:
        # Call Groq API for analysis
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system", 
                    "content": "You are an expert career coach and technical recruiter. Analyze job matches and return ONLY valid JSON with no additional text. Return format: {\"Job Match Score\": number, \"Matched Keywords\": [], \"Missing Important Keywords\": [], \"Strengths\": [], \"Weaknesses\": [], \"Final Recommendation\": \"string\"}"
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=1000,
            response_format={"type": "json_object"}
        )
        
        # Extract the AI response
        ai_response = response.choices[0].message.content.strip()
        print(f"AI Response: {ai_response[:200]}...")
        
        # Parse JSON from the response
        import json
        try:
            result = json.loads(ai_response)
            print("Successfully parsed JSON response")
            
            # ✅ RETURN CONSISTENT STRUCTURE: Wrap in "result" key
            return {"result": result}
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            # Fallback: try to extract JSON from text
            import re
            json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
                return {"result": result}
            else:
                return {"result": {"error": "Failed to parse AI response", "raw_response": ai_response[:200]}}
        
    except Exception as e:
        print(f"Error in job match: {str(e)}")
        return {"result": {"error": f"Job match analysis failed: {str(e)}"}}

# ========================================================
# 4️⃣ AI RESUME REWRITE
# ========================================================
@app.post("/rewrite")
async def rewrite_text(req: RewriteRequest):

    prompt = f"""
Rewrite this resume section professionally and ATS-optimized.

Target Role: {req.target_role}

Original Text:
{req.text}

Rewrite using:
- Action verbs
- Measurable impact
- Short bullet points
- ATS keywords
- Professional tone

Return only the rewritten text.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are an expert ATS resume optimizer."},
            {"role": "user", "content": prompt},
        ],
    )

    rewritten = response.choices[0].message.content.strip()
    return {"rewritten": rewritten}


# ========================================================
# 5️⃣ RESUME ANALYZER - UPDATED TO USE NEW AUTHENTICATED ENDPOINT
# ========================================================
# NOTE: This endpoint is now handled by the resume router with authentication
# But keeping it for backward compatibility
# @app.post("/analyze-resume", response_model=ResumeAnalysis)
# async def analyze_resume_endpoint(file: UploadFile = File(...)):

#     if not file.filename.lower().endswith(".pdf"):
#         raise HTTPException(status_code=400, detail="Only PDF files are supported.")

#     file_bytes = await file.read()

#     if not file_bytes:
#         raise HTTPException(status_code=400, detail="Empty file uploaded.")

#     result = analyze_resume(file_bytes)
#    return result

# @app.post("/analyze-resume")
# async def analyze_resume_legacy():
#     """Legacy endpoint - redirect to authenticated version"""
#     raise HTTPException(
#         status_code=status.HTTP_410_GONE,
#         detail="This endpoint is deprecated. Please use /resume/analyze with authentication"
#     )