# backend/auth.py
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "type": "access"
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": expire,
        "type": "refresh"
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def authenticate_user(email: str, password: str):
    """Authenticate a user with email and password"""
    from database import UsersCollection
    
    user = await UsersCollection.find_by_email(email)
    
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    
    # Update last login
    await UsersCollection.update_user(user["id"], {"last_login": datetime.utcnow()})
    
    return user

def decode_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_user(token: str):
    """Get current user email from token"""
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        return None
    
    email: str = payload.get("sub")
    return email

def get_user_id_from_token(token: str) -> Optional[str]:
    """Get user ID from token"""
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        return None
    
    return payload.get("user_id")

async def get_current_user_data(token: str):
    """Get current user data from token"""
    from database import UsersCollection
    
    email = get_current_user(token)
    if not email:
        return None
    
    user = await UsersCollection.find_by_email(email)
    return user

def validate_token(token: str) -> bool:
    """Validate if a token is valid"""
    payload = decode_token(token)
    if not payload:
        return False
    
    # Check if token is expired
    expire_timestamp = payload.get("exp")
    if not expire_timestamp:
        return False
    
    expire_time = datetime.fromtimestamp(expire_timestamp)
    if datetime.utcnow() > expire_time:
        return False
    
    return True

def create_tokens(user_data: dict):
    """Create both access and refresh tokens for a user"""
    access_token = create_access_token({
        "sub": user_data["email"],
        "user_id": user_data["id"],
        "name": user_data["name"]
    })
    
    refresh_token = create_refresh_token({
        "sub": user_data["email"],
        "user_id": user_data["id"]
    })
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60  # in seconds
    }

async def refresh_access_token(refresh_token: str):
    """Create new access token using refresh token"""
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        return None
    
    email = payload.get("sub")
    user_id = payload.get("user_id")
    
    if not email or not user_id:
        return None
    
    # Verify user still exists
    from database import UsersCollection
    user = await UsersCollection.find_by_email(email)
    if not user:
        return None
    
    # Create new access token
    new_access_token = create_access_token({
        "sub": email,
        "user_id": user_id,
        "name": user["name"]
    })
    
    return new_access_token
