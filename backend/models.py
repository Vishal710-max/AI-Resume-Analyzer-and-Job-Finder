# backend/models.py
from pydantic import BaseModel, EmailStr, validator, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum
import re

# ============================================
# User Authentication Models
# ============================================

class UserLevel(str, Enum):
    FRESHER = "Fresher"
    INTERMEDIATE = "Intermediate"
    EXPERIENCED = "Experienced"
    SENIOR = "Senior"

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="User's full name")
    email: EmailStr
    phone: Optional[str] = Field(None, pattern=r'^\+?[1-9]\d{1,14}$', description="Phone number in E.164 format")
    
    @validator('phone')
    def validate_phone(cls, v):
        if v:
            # Remove all non-digit characters except +
            cleaned = re.sub(r'[^\d+]', '', v)
            if not re.match(r'^\+?[1-9]\d{1,14}$', cleaned):
                raise ValueError('Invalid phone number format')
            return cleaned
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100, description="Password must be at least 8 characters")
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one number')
        if not any(char.isalpha() for char in v):
            raise ValueError('Password must contain at least one letter')
        return v

class UserInDB(UserBase):
    id: str
    hashed_password: str
    created_at: datetime
    last_login: Optional[datetime] = None
    is_active: bool = True
    resume_count: int = 0
    subscription_tier: str = "free"  # free, pro, enterprise
    
    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: str
    created_at: datetime
    last_login: Optional[datetime]
    resume_count: int
    subscription_tier: str
    is_active: bool
    
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, description="Password cannot be empty")

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserResponse] = None

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None

# ============================================
# Resume Analysis Models (Your existing models)
# ============================================

class ResumeAnalysis(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    mobile_number: Optional[str] = None
    degree: Optional[str] = None
    no_of_pages: int

    candidate_level: str
    predicted_field: str
    skills: List[str]
    recommended_skills: List[str]
    recommended_courses: List[str]

    resume_score: int = Field(..., ge=0, le=100, description="Score must be between 0 and 100")
    ats_score: int = Field(..., ge=0, le=100, description="ATS score must be between 0 and 100")
    tips: List[str]
    
    # New fields for user association
    user_id: Optional[str] = None
    original_filename: Optional[str] = None
    analysis_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ResumeAnalysisCreate(BaseModel):
    """For creating new resume analysis records in database"""
    user_id: str
    resume_score: int
    ats_score: int
    candidate_level: str
    predicted_field: str
    skills: List[str]
    recommended_skills: List[str]
    recommended_courses: List[str]
    tips: List[str]
    original_filename: str
    analysis_date: datetime = datetime.utcnow()

class ResumeAnalysisResponse(ResumeAnalysis):
    """Response model for resume analysis with ID"""
    id: str
    
    class Config:
        from_attributes = True

class ResumeAnalysisHistory(BaseModel):
    """Model for user's resume analysis history"""
    analyses: List[ResumeAnalysisResponse]
    total_count: int

# ============================================
# Job Matching & Rewrite Models
# ============================================

class RewriteRequest(BaseModel):
    text: str
    target_role: str

class JobMatchRequest(BaseModel):
    resume_text: str
    job_description: str
    skills: List[str] = []  # Ensure default empty list

class JobMatchResponse(BaseModel):
    match_score: float = Field(..., ge=0, le=100, description="Match score between 0 and 100")
    missing_skills: List[str]
    matching_skills: List[str]
    suggestions: List[str]
    job_title: Optional[str] = None
    company: Optional[str] = None

# ============================================
# Course Models
# ============================================

class Course(BaseModel):
    title: str
    platform: str  # e.g., "Coursera", "Udemy", "edX"
    url: str
    duration: Optional[str] = None
    level: Optional[str] = None  # beginner, intermediate, advanced
    rating: Optional[float] = None

class CourseRecommendation(BaseModel):
    field: str
    courses: List[Course]

# ============================================
# Profile Update Models
# ============================================

class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, pattern=r'^\+?[1-9]\d{1,14}$')
    
    @validator('phone')
    def validate_update_phone(cls, v):
        if v:
            cleaned = re.sub(r'[^\d+]', '', v)
            if not re.match(r'^\+?[1-9]\d{1,14}$', cleaned):
                raise ValueError('Invalid phone number format')
            return cleaned
        return v

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
    confirm_new_password: str
    
    @validator('confirm_new_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('New passwords do not match')
        return v

# ============================================
# Error Response Models
# ============================================

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None

class ValidationError(BaseModel):
    loc: List[str]
    msg: str
    type: str

class HTTPValidationError(BaseModel):
    detail: List[ValidationError]