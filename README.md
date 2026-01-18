🤖 AI Resume Analyzer & Job Finder

  An end-to-end AI-powered resume analysis and job-matching platform that helps users evaluate resumes, identify skill gaps, receive role-based recommendations, and match      resumes with relevant job descriptions.
  Built with a modern full-stack architecture, secure authentication, and NLP-driven analysis.

🚀 Features

🔍 Resume Analysis

  Upload PDF resumes for automated analysis
    
  Extracts skills, keywords, and experience using NLP
    
  Calculates an ATS-style resume score
    
  Determines candidate level (Fresher / Intermediate / Experienced)
    
  Provides actionable improvement suggestions


🎯 Resume–Job Matching

  Matches resumes against job descriptions

  Scores compatibility based on skill and keyword alignment

  Generates clear match insights for role suitability


✍️ AI Resume Rewrite

  Rewrites resume sections for specific target roles

  Improves clarity, relevance, and professional tone


🎓 Course Recommendations

  Suggests learning resources based on missing skills

  Personalized recommendations aligned with career goals


👤 User Management

  Secure authentication using JWT

  OAuth sign-in with Google and GitHub

  User profile with resume history and analytics

  Plan-based feature access (Free / Pro-ready)


🧩 Tech Stack

Frontend

  React

  Tailwind CSS

  Vite

  Modular component-based architecture

Backend

  Python (FastAPI-style services)

  JWT Authentication

  OAuth 2.0 (Google & GitHub)

  MongoDB

  AI / NLP

Resume text parsing

  Skill & keyword extraction

  Rule-based + NLP scoring

  Job–resume similarity matching


🔐 Authentication Flow

   Email & password authentication using JWT

   OAuth login via Google and GitHub

   Unified identity model: email-based user identity across all auth methods

   Secure token handling and logout flow

 This ensures:

   Correct profile data after OAuth login

   Accurate resume history per user

   Reliable analytics and personalization

📊 Resume Analysis Flow

   User uploads a resume (PDF)

   Resume text is parsed and cleaned

   Skills, keywords, and sections are extracted

   Resume is scored against ATS-style criteria

 AI generates:

   Strengths & weaknesses

   Role recommendations

 Improvement tips

   Results are saved and displayed in the user dashboard

 🔍 Job Matching Flow

   User provides a job description

   Resume skills are compared with job requirements

   Compatibility score is generated

   Match result is categorized (Strong / Moderate / Weak)

   Feedback is shown with actionable insights

   
