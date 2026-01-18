# backend/routes/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from datetime import datetime
import uuid

from models import UserCreate, UserResponse, LoginRequest, Token, ProfileUpdate, PasswordChange, ErrorResponse
from database import UsersCollection
from jwt_auth import (
    get_password_hash, verify_password, 
    create_tokens, authenticate_user,
    get_current_user_data, validate_token,
    get_user_id_from_token
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()

# Helper function for token extraction
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from token"""
    token = credentials.credentials
    user = await get_current_user_data(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    existing_user = await UsersCollection.find_by_email(user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    user_dict = user_data.dict()

    # Hash password
    user_dict["hashed_password"] = get_password_hash(user_dict["password"])
    user_dict.pop("password")
    user_dict.pop("confirm_password", None)

    # ✅ ADD ALL REQUIRED DEFAULT FIELDS
    user_dict.update({
        "created_at": datetime.utcnow(),
        "last_login": None,
        "resume_count": 0,
        "subscription_tier": "free",
        "is_active": True,
    })

    created_user = await UsersCollection.create_user(user_dict)

    return UserResponse(**created_user)


@router.post("/login",  response_model=Token, responses={
    401: {"model": ErrorResponse}
})
async def login(login_data: LoginRequest):
    """
    Login user with email and password
    """
    # Authenticate user
    user = await authenticate_user(login_data.email, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated"
        )
    
    # Create tokens
    tokens = create_tokens(user)
    tokens["user"] = UserResponse(**user)
    
    return tokens

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user = Depends(get_current_user)):
    """
    Get current user profile
    """
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_profile(
    profile_update: ProfileUpdate,
    current_user = Depends(get_current_user)
):
    """
    Update user profiloe
    """
    update_data = profile_update.dict(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided for update"
        )
    
    # Update user in database
    success = await UsersCollection.update_user(current_user["id"], update_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
    
    # Get updated user
    updated_user = await UsersCollection.find_by_id(current_user["id"])
    return updated_user

@router.post("/change-password", responses={
    400: {"model": ErrorResponse},
    401: {"model": ErrorResponse}
})
async def change_password(
    password_data: PasswordChange,
    current_user = Depends(get_current_user)
):
    """
    Change user password
    """
    # Verify current password
    if not verify_password(password_data.current_password, current_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Hash new password
    new_hashed_password = get_password_hash(password_data.new_password)
    
    # Update password in database
    success = await UsersCollection.update_user(
        current_user["id"],
        {"hashed_password": new_hashed_password}
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )
    
    return {"detail": "Password updated successfully"}

@router.post("/logout")
async def logout(current_user = Depends(get_current_user)):
    """
    Logout user (client should delete token)
    """
    return {"detail": "Logged out successfully"}

@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """
    Refresh access token using refresh token
    """
    from auth import refresh_access_token
    
    new_access_token = await refresh_access_token(refresh_token)
    
    if not new_access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    return {"access_token": new_access_token, "token_type": "bearer"}