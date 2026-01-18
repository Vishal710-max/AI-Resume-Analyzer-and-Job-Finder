🤖 AI Resume Analyzer & Job Finder

A modern, AI-powered resume analysis and job-matching platform built with a full-stack architecture.
The system analyzes resumes using NLP techniques, scores them against ATS-style criteria, recommends suitable roles and courses, and matches resumes with job descriptions. Designed as a production-style SaaS project to demonstrate full-stack, backend, and AI integration skills.

Table of contents

Features

Demo / Screenshots

Tech stack

Requirements

Install & Run

Quick start

Usage notes

Authentication & security

Project structure

Development

Future enhancements

Contact

Features
🔍 Resume Analysis

Upload PDF resumes for AI-powered analysis

Extracts skills, keywords, and experience using NLP

Calculates an ATS-style resume score

Identifies candidate level (Fresher / Intermediate / Experienced)

Provides actionable improvement suggestions

🎯 Resume–Job Matching

Matches resumes against job descriptions

Scores compatibility based on skill and keyword alignment

Categorizes match results (Strong / Moderate / Weak)

Provides role suitability insights

✍️ AI Resume Rewrite

Rewrites resume sections for a selected target role

Improves clarity, relevance, and professional tone

Helps align resumes with job requirements

🎓 Course Recommendations

Suggests learning resources based on missing skills

Personalized recommendations aligned with career goals

👤 User & Profile Management

Secure authentication using JWT

OAuth login with Google and GitHub

User profile with resume history and analytics

Plan-based feature gating (Free / Pro-ready)

Demo / Screenshots

Suggested screenshots to include:

Home page (resume upload & features overview)

Login / Register page (OAuth options)

Resume analysis result dashboard

Job matching result view

Profile page (resume history & analytics)

📌 Add screenshots inside assets/images/ and link them here for maximum recruiter impact.

Tech stack
Frontend

React

Tailwind CSS

Vite

Backend

Python (FastAPI-style architecture)

JWT authentication

OAuth 2.0 (Google & GitHub)

MongoDB

AI / NLP

Resume text parsing

Skill & keyword extraction

ATS-style scoring logic

Resume–job similarity matching

Requirements

Node.js 18+

Python 3.9+

MongoDB (local or Atlas)

Internet connection for OAuth and package installation

Install & Run
1. Clone the repository
git clone https://github.com/your-username/ai-resume-analyzer.git
cd ai-resume-analyzer

2. Backend setup

Create and activate a virtual environment:

python -m venv venv
source venv/bin/activate   # macOS / Linux
venv\Scripts\activate      # Windows


Install dependencies:

pip install -r requirements.txt


Create a .env file:

MONGODB_URI=mongodb://localhost:27017/resume_analyzer
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret


Run backend:

uvicorn main:app --reload

3. Frontend setup
cd frontend
npm install
npm run dev


Open:
👉 http://localhost:5173

Quick start

Register a new account or sign in using Google/GitHub

Upload a PDF resume

View ATS score, skill analysis, and improvement suggestions

Paste a job description to see resume–job match results

Explore recommended courses based on skill gaps

Manage resume history and analytics from the profile page

Usage notes

Only PDF resumes are supported

Resume history and analytics are plan-gated

OAuth users share the same identity model as email/password users

All AI processing happens server-side for consistency

Authentication & security

JWT-based authentication for API access

OAuth 2.0 login with Google and GitHub

Unified email-based user identity across all auth methods

Secure token handling and logout flow

Passwords are hashed before storage

Project structure
ai-resume-analyzer/
├── backend/
│   ├── main.py               # Application entry point
│   ├── database.py           # MongoDB connection & setup
│   ├── models.py             # Data models
│   ├── users.py              # User & auth routes
│   ├── oauth.py              # Google & GitHub OAuth
│   ├── resume.py             # Resume analysis APIs
│   ├── analyzer.py           # ATS scoring & NLP logic
│   ├── job_match.py          # Resume–job matching logic
│   ├── courses_api.py        # Course recommendations
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── assets/
│   └── images/               # Screenshots & branding
│
└── README.md

Development

Modular frontend component design

Clean separation of concerns in backend services

Error handling and validation for all APIs

Designed to be extensible for future SaaS features

Future enhancements

Payment integration for Pro subscriptions

Advanced analytics dashboard

Real-time job listings integration

Multi-resume comparison

Admin insights panel

Contact

Vishal Bhingarde
Final-year Computer Science student
Focused on full-stack development, backend systems, and AI-driven applications

For questions, feedback, or collaboration, feel free to open an issue or pull request. 
