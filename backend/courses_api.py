# courses_api.py (or add to your existing backend)
from fastapi import FastAPI
import Courses  # Your existing Courses.py file
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/courses/{field}")
async def get_courses(field: str):
    """Get courses for a specific field"""
    course_mapping = {
        "data_science": Courses.ds_course,
        "web_development": Courses.web_course,
        "android": Courses.android_course,
        "ios": Courses.ios_course,
        "ui_ux": Courses.uiux_course,
        "resume": Courses.resume_videos,
        "interview": Courses.interview_videos,
    }
    
    courses = course_mapping.get(field.lower(), [])
    return {"field": field, "courses": courses}

@app.get("/api/all-courses")
async def get_all_courses():
    """Get all available courses"""
    return {
        "data_science": Courses.ds_course,
        "web_development": Courses.web_course,
        "android": Courses.android_course,
        "ios": Courses.ios_course,
        "ui_ux": Courses.uiux_course,
        "resume_videos": Courses.resume_videos,
        "interview_videos": Courses.interview_videos,
    }