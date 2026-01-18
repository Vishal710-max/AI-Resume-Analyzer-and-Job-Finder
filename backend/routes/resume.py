# backend/routes/resume.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from typing import List, Optional
from datetime import datetime
import json

# CHANGE THIS IMPORT NAME to avoid conflict
from analyzer import analyze_resume as analyze_resume_function  # Renamed!

from models import (
    ResumeAnalysis, ResumeAnalysisResponse, ResumeAnalysisHistory,
    JobMatchRequest, JobMatchResponse, RewriteRequest,
    ErrorResponse
)
from database import UsersCollection, ResumeAnalysesCollection, CoursesCollection
from routes.users import get_current_user
from jwt_auth import get_current_user_data

router = APIRouter(prefix="/resume", tags=["resume"])

# ============================================
# Resume Analysis Endpoints
# ============================================

@router.post("/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume_endpoint(  # CHANGE FUNCTION NAME
    file: UploadFile = File(..., description="PDF resume file"),
    current_user: dict = Depends(get_current_user)
):
    """Analyze a resume PDF with authentication"""
    try:
        # Check file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are supported"
            )
        
        # Read file content
        contents = await file.read()
        
        # USE YOUR ACTUAL ANALYZER (with the renamed import)
        analysis_result = analyze_resume_function(
            file_bytes=contents,
            user_id=current_user["id"],
            filename=file.filename
        )
        
        # Store analysis in database
        analysis_doc = {
            "user_id": current_user["id"],
            "resume_score": analysis_result["resume_score"],
            "ats_score": analysis_result["ats_score"],
            "candidate_level": analysis_result["candidate_level"],
            "predicted_field": analysis_result["predicted_field"],
            "skills": analysis_result["skills"],
            "recommended_skills": analysis_result.get("recommended_skills", []),
            "recommended_courses": analysis_result.get("recommended_courses", []),
            "tips": analysis_result.get("tips", []),
            "original_filename": file.filename,
            "analysis_date": datetime.utcnow(),
            "extracted_data": {
                "name": analysis_result.get("name"),
                "email": analysis_result.get("email"),
                "mobile_number": analysis_result.get("mobile_number"),
                "degree": analysis_result.get("degree"),
                "no_of_pages": analysis_result.get("no_of_pages", 1),
                "raw_text": analysis_result.get("raw_text", "")[:1000]  # Store first 1000 chars
            }
        }
        
        # Save to database
        saved_analysis = await ResumeAnalysesCollection.create_analysis(analysis_doc)
        
        # Update user's resume count
        await UsersCollection.increment_resume_count(current_user["id"])
        
        # Prepare response
        response_data = {
            "id": saved_analysis["id"],
            "user_id": current_user["id"],
            "original_filename": file.filename,
            "analysis_date": saved_analysis["analysis_date"],
            **analysis_result
        }
        
        return ResumeAnalysisResponse(**response_data)
        
    except Exception as e:
        print(f"Error analyzing resume: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze resume: {str(e)}"
        )

@router.get("/history", response_model=ResumeAnalysisHistory)
async def get_resume_history(
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page")
):
    """Get user's resume analysis history"""
    skip = (page - 1) * limit
    
    history = await ResumeAnalysesCollection.get_user_analyses(
        current_user["id"], 
        limit=limit, 
        skip=skip
    )
    
    # Convert to proper response models
    analyses = []
    for analysis in history["analyses"]:
        # Combine extracted data with analysis
        extracted = analysis.get("extracted_data", {})
        analysis_response = {
            **analysis,
            "name": extracted.get("name"),
            "email": extracted.get("email"),
            "mobile_number": extracted.get("mobile_number"),
            "degree": extracted.get("degree"),
            "no_of_pages": extracted.get("no_of_pages", 1)
        }
        analyses.append(ResumeAnalysisResponse(**analysis_response))
    
    return ResumeAnalysisHistory(
        analyses=analyses,
        total_count=history["total_count"]
    )

@router.get("/{analysis_id}", response_model=ResumeAnalysisResponse)
async def get_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific resume analysis"""
    analysis = await ResumeAnalysesCollection.get_analysis_by_id(analysis_id)
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    # Check if analysis belongs to current user
    if analysis["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this analysis"
        )
    
    # Combine extracted data with analysis
    extracted = analysis.get("extracted_data", {})
    analysis_response = {
        **analysis,
        "name": extracted.get("name"),
        "email": extracted.get("email"),
        "mobile_number": extracted.get("mobile_number"),
        "degree": extracted.get("degree"),
        "no_of_pages": extracted.get("no_of_pages", 1)
    }
    
    return ResumeAnalysisResponse(**analysis_response)

@router.delete("/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a resume analysis"""
    analysis = await ResumeAnalysesCollection.get_analysis_by_id(analysis_id)
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    # Check if analysis belongs to current user
    if analysis["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this analysis"
        )
    
    # Delete analysis
    deleted = await ResumeAnalysesCollection.delete_analysis(analysis_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete analysis"
        )
    
    # Update user's resume count (decrement)
    await UsersCollection.update_user(
        current_user["id"],
        {"resume_count": max(0, current_user.get("resume_count", 1) - 1)}
    )
    
    return {"message": "Analysis deleted successfully"}

# ============================================
# Job Matching Endpoints
# ============================================

@router.post("/job-match", response_model=JobMatchResponse)
async def job_match(
    match_request: JobMatchRequest,
    current_user: dict = Depends(get_current_user)
):
    """Match resume with job description"""
    try:
        # TODO: Integrate with your existing job matching logic
        # This is where you would call your ML/AI model
        
        # Mock job match result
        match_result = {
            "match_score": 78.5,
            "missing_skills": ["Docker", "Kubernetes", "AWS Lambda"],
            "matching_skills": ["Python", "Machine Learning", "SQL", "Data Analysis"],
            "suggestions": [
                "Highlight your Python experience more prominently",
                "Consider getting AWS certification",
                "Add Docker projects to your portfolio"
            ],
            "job_title": "Data Scientist",
            "company": "Tech Corp Inc."
        }
        
        return JobMatchResponse(**match_result)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform job matching: {str(e)}"
        )

# ============================================
# Resume Rewriting Endpoints
# ============================================

@router.post("/rewrite")
async def rewrite_resume_section(
    rewrite_request: RewriteRequest,
    current_user: dict = Depends(get_current_user)
):
    """Rewrite a resume section for a specific role"""
    try:
        # TODO: Integrate with your existing rewriting logic
        # This is where you would call your ML/AI model
        
        # Mock rewrite result
        rewrite_result = {
            "original_text": rewrite_request.text,
            "rewritten_text": f"[Optimized for {rewrite_request.target_role}]: {rewrite_request.text} with enhanced focus on relevant skills and achievements.",
            "improvements": [
                "Added role-specific keywords",
                "Made achievements more quantifiable",
                "Improved action verb usage"
            ]
        }
        
        return rewrite_result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to rewrite resume section: {str(e)}"
        )

# ============================================
# Course Recommendations Endpoints
# ============================================

@router.get("/courses/{field}")
async def get_courses_by_field(
    field: str,
    current_user: dict = Depends(get_current_user)
):
    """Get course recommendations for a specific field"""
    try:
        # Get courses from database
        courses = await CoursesCollection.get_courses_by_field(field)
        
        if not courses:
            # Return default courses if none in database
            default_courses = {
                "data_science": [
                    {
                        "title": "Machine Learning Specialization",
                        "platform": "Coursera",
                        "url": "https://www.coursera.org/specializations/machine-learning",
                        "duration": "4 months",
                        "level": "Intermediate",
                        "rating": 4.8
                    },
                    {
                        "title": "Python for Data Science and Machine Learning Bootcamp",
                        "platform": "Udemy",
                        "url": "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
                        "duration": "25 hours",
                        "level": "Beginner",
                        "rating": 4.6
                    }
                ],
                "web_development": [
                    {
                        "title": "The Complete Web Developer Bootcamp",
                        "platform": "Udemy",
                        "url": "https://www.udemy.com/course/the-complete-web-developer-zero-to-mastery/",
                        "duration": "35 hours",
                        "level": "Beginner",
                        "rating": 4.7
                    }
                ]
            }
            
            field_key = field.lower().replace(" ", "_")
            courses = default_courses.get(field_key, [])
        
        return {
            "field": field,
            "courses": courses,
            "count": len(courses)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get courses: {str(e)}"
        )

@router.get("/stats/summary")
async def get_resume_stats_summary(current_user: dict = Depends(get_current_user)):
    """Get resume analysis statistics summary"""
    try:
        history = await ResumeAnalysesCollection.get_user_analyses(current_user["id"], limit=100)
        
        if not history["analyses"]:
            return {
                "total_analyses": 0,
                "average_score": 0,
                "best_score": 0,
                "most_common_field": "N/A",
                "skill_frequency": {}
            }
        
        # Calculate statistics
        scores = [a.get("resume_score", 0) for a in history["analyses"]]
        fields = [a.get("predicted_field", "Unknown") for a in history["analyses"]]
        
        # Count skill frequency
        skill_frequency = {}
        for analysis in history["analyses"]:
            for skill in analysis.get("skills", []):
                skill_frequency[skill] = skill_frequency.get(skill, 0) + 1
        
        # Find most common field
        from collections import Counter
        field_counter = Counter(fields)
        most_common_field = field_counter.most_common(1)[0][0] if field_counter else "N/A"
        
        return {
            "total_analyses": history["total_count"],
            "average_score": sum(scores) / len(scores) if scores else 0,
            "best_score": max(scores) if scores else 0,
            "most_common_field": most_common_field,
            "skill_frequency": dict(sorted(skill_frequency.items(), key=lambda x: x[1], reverse=True)[:10]),
            "last_analysis_date": history["analyses"][0].get("analysis_date") if history["analyses"] else None
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get statistics: {str(e)}"
        )
