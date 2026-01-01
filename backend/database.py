# backend/database.py
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
from bson import ObjectId
import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "resume_analyzer")

class Database:
    client: AsyncIOMotorClient = None
    db = None
    
    async def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = AsyncIOMotorClient(MONGO_URI)
            self.db = self.client[DATABASE_NAME]
            
            # Test connection
            await self.client.admin.command('ping')
            print(f"✅ Connected to MongoDB: {DATABASE_NAME}")
            
            # Create indexes
            await self.create_indexes()
            
        except Exception as e:
            print(f"❌ Failed to connect to MongoDB: {e}")
            raise
    
    async def create_indexes(self):
        """Create database indexes for performance"""
        try:
            # Users collection indexes
            await self.db.users.create_index([("email", ASCENDING)], unique=True)
            await self.db.users.create_index([("created_at", DESCENDING)])
            
            # Resume analyses collection indexes
            await self.db.resume_analyses.create_index([("user_id", ASCENDING)])
            await self.db.resume_analyses.create_index([("analysis_date", DESCENDING)])
            await self.db.resume_analyses.create_index([
                ("user_id", ASCENDING),
                ("analysis_date", DESCENDING)
            ])
            
            # Courses collection indexes
            await self.db.courses.create_index([("field", ASCENDING)])
            
            print("✅ Database indexes created successfully")
            
        except Exception as e:
            print(f"⚠️ Failed to create indexes: {e}")
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            print("✅ Disconnected from MongoDB")

# Database instance
db = Database()

# Helper function to convert ObjectId to string
def convert_objectid(doc):
    """Convert MongoDB ObjectId to string for JSON serialization"""
    if doc and '_id' in doc:
        doc['id'] = str(doc['_id'])
        del doc['_id']
    return doc

# Collection getters with helper functions
class UsersCollection:
    @staticmethod
    def get_collection():
        return db.db.users
    
    @staticmethod
    async def find_by_email(email: str):
        """Find user by email"""
        collection = UsersCollection.get_collection()
        user = await collection.find_one({"email": email})
        return convert_objectid(user)
    
    @staticmethod
    async def find_by_id(user_id: str):
        """Find user by ID"""
        collection = UsersCollection.get_collection()
        try:
            user = await collection.find_one({"_id": ObjectId(user_id)})
            return convert_objectid(user)
        except:
            return None
    
    @staticmethod
    async def create_user(user_data: dict):
        """Create a new user"""
        collection = UsersCollection.get_collection()
        result = await collection.insert_one(user_data)
        user_data['id'] = str(result.inserted_id)
        return user_data
    
    @staticmethod
    async def update_user(user_id: str, update_data: dict):
        """Update user data"""
        collection = UsersCollection.get_collection()
        result = await collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0
    
    @staticmethod
    async def increment_resume_count(user_id: str):
        """Increment user's resume count"""
        collection = UsersCollection.get_collection()
        await collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"resume_count": 1}}
        )

class ResumeAnalysesCollection:
    @staticmethod
    def get_collection():
        return db.db.resume_analyses
    
    @staticmethod
    async def create_analysis(analysis_data: dict):
        """Create a new resume analysis record"""
        collection = ResumeAnalysesCollection.get_collection()
        result = await collection.insert_one(analysis_data)
        analysis_data['id'] = str(result.inserted_id)
        return analysis_data
    
    @staticmethod
    async def get_user_analyses(user_id: str, limit: int = 10, skip: int = 0):
        """Get all resume analyses for a user"""
        collection = ResumeAnalysesCollection.get_collection()
        
        cursor = collection.find({"user_id": user_id}) \
            .sort("analysis_date", DESCENDING) \
            .skip(skip) \
            .limit(limit)
        
        analyses = []
        async for doc in cursor:
            analyses.append(convert_objectid(doc))
        
        total = await collection.count_documents({"user_id": user_id})
        
        return {
            "analyses": analyses,
            "total_count": total,
            "has_more": (skip + len(analyses)) < total
        }
    
    @staticmethod
    async def get_analysis_by_id(analysis_id: str):
        """Get a specific analysis by ID"""
        collection = ResumeAnalysesCollection.get_collection()
        try:
            analysis = await collection.find_one({"_id": ObjectId(analysis_id)})
            return convert_objectid(analysis)
        except:
            return None
    
    @staticmethod
    async def delete_analysis(analysis_id: str):
        """Delete a resume analysis"""
        collection = ResumeAnalysesCollection.get_collection()
        result = await collection.delete_one({"_id": ObjectId(analysis_id)})
        return result.deleted_count > 0

class CoursesCollection:
    @staticmethod
    def get_collection():
        return db.db.courses
    
    @staticmethod
    async def get_courses_by_field(field: str):
        """Get courses by field/category"""
        collection = CoursesCollection.get_collection()
        cursor = collection.find({"field": field})
        
        courses = []
        async for doc in cursor:
            courses.append(convert_objectid(doc))
        
        return courses
    
    @staticmethod
    async def add_course(course_data: dict):
        """Add a new course to the database"""
        collection = CoursesCollection.get_collection()
        result = await collection.insert_one(course_data)
        course_data['id'] = str(result.inserted_id)
        return course_data