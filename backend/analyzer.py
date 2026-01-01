# backend/analyzer.py

from typing import List, Dict, Any
from datetime import datetime
from resume_parser import parse_resume  # NEW fixed import
from Courses import ds_course, web_course, android_course, ios_course, uiux_course

# ----------------- KEYWORD LISTS -----------------
DS_KEYWORDS = [
 'machine learning', 'deep learning',
 'tensorflow', 'keras', 'pytorch',
 'scikit-learn', 'nlp', 'data science'
]

WEB_KEYWORDS = [
    'react', 'django', 'node js', 'react js', 'php', 'laravel', 'magento',
    'wordpress', 'javascript', 'angular js', 'c#', 'asp.net', 'html', 'css',
    'web development', 'frontend', 'backend', 'full stack'
]

ANDROID_KEYWORDS = [
    'android', 'android development', 'flutter', 'kotlin', 'xml', 'kivy',
    'jetpack', 'android studio', 'mobile development'
]

IOS_KEYWORDS = [
    'ios', 'ios development', 'swift', 'cocoa', 'cocoa touch', 'xcode',
    'objective-c', 'ios app'
]

UIUX_KEYWORDS = [
    'ux', 'ui', 'figma', 'adobe xd', 'photoshop', 'illustrator',
    'wireframes', 'prototyping', 'user research', 'ui/ux', 'design'
]

# ----------------- ATS SCORE  -----------------
def calculate_ats_score(text: str, skills: list, field_keywords: list):
    score = 0
    total = 100
    t = text.lower()

    # 1. Keyword Match Score (30%)
    matched = sum(1 for kw in field_keywords if kw in t)
    keyword_score = min((matched / len(field_keywords)) * 30, 30)
    score += keyword_score

    # 2. Section Completeness Score (20%)
    sections = ["education", "experience", "projects", "skills", "certifications"]
    found_sections = sum(1 for sec in sections if sec in t)
    section_score = (found_sections / len(sections)) * 20
    score += section_score

    # 3. Action Verbs Score (10%)
    action_verbs = ["developed", "created", "built", "designed",
                    "implemented", "optimized", "analyzed"]
    verb_count = sum(1 for v in action_verbs if v in t)
    action_score = min(verb_count * 2, 10)
    score += action_score

    # 4. Formatting Score (20%)
    formatting_issues = ["......", "____", "====", "*****"]
    formatting_penalty = any(f in text for f in formatting_issues)
    formatting_score = 20 if not formatting_penalty else 10
    score += formatting_score

    # 5. Readability Score (10%)
    words = len(t.split())
    if 250 < words < 800:
        score += 10
    elif 800 <= words < 1200:
        score += 7
    else:
        score += 5

    # 6. Resume Length Score (10%)
    score += 10 if "page" in t or "pages" in t else 8

    return round(score)


# ----------------- CANDIDATE LEVEL -----------------
def predict_candidate_level(text: str, pages: int) -> str:
    t = text.lower()

    if pages <= 1:
        return "Fresher"
    if "internship" in t:
        return "Intermediate"
    if "experience" in t or "work experience" in t:
        return "Experienced"
    return "Fresher"


# ----------------- FIELD & RECOMMENDATIONS -----------------
def detect_field_and_recommendations(skills):
    s = [x.lower() for x in skills]

    def score(keywords):
        return sum(1 for k in keywords if k in s)

    scores = {
        "Data Science": score(DS_KEYWORDS),
        "Web Development": score(WEB_KEYWORDS),
        "Android Development": score(ANDROID_KEYWORDS),
        "iOS Development": score(IOS_KEYWORDS),
        "UI/UX Design": score(UIUX_KEYWORDS)
    }

    predicted_field = max(scores, key=scores.get)

    # If no meaningful match
    if scores[predicted_field] == 0:
        return "Not Detected", [], []

    if predicted_field == "Data Science":
        return "Data Science", [], [c[0] for c in ds_course]

    if predicted_field == "Web Development":
        return "Web Development", [], [c[0] for c in web_course]

    if predicted_field == "Android Development":
        return "Android Development", [], [c[0] for c in android_course]

    if predicted_field == "iOS Development":
        return "iOS Development", [], [c[0] for c in ios_course]

    if predicted_field == "UI/UX Design":
        return "UI/UX Design", [], [c[0] for c in uiux_course]


# ----------------- RESUME SCORING -----------------
def score_resume(text: str):
    score = 0
    tips = []
    t = text.lower()

    def check(words, points, message):
        nonlocal score
        if any(w.lower() in t for w in words):
            score += points
        else:
            tips.append(message)

    check(["objective", "summary"], 6, "Add a career objective or summary.")
    check(["education", "school", "college"], 12, "Add an education section.")
    check(["experience", "work"], 16, "Mention your work experience or projects.")
    check(["internship"], 6, "Include internships if available.")
    check(["skills"], 7, "Add a dedicated skills section.")
    check(["projects", "project"], 19, "Include project details.")
    check(["certification", "certifications"], 12, "Add certifications.")
    check(["achievements"], 13, "Include achievements.")
    check(["hobbies", "interests"], 4, "Optionally add hobbies/interests.")

    return score, tips


# ----------------- MAIN FUNCTION -----------------
def analyze_resume(file_bytes: bytes, user_id: str = None, filename: str = None) -> Dict[str, Any]:
    """Analyze resume PDF with optional user tracking"""
    
    # Parse using new resume_parser
    parsed = parse_resume(file_bytes)

    name = parsed["name"]
    email = parsed["email"]
    phone = parsed["phone"]
    pages = parsed["pages"]
    skills = parsed["skills"]
    text = parsed["raw_text"]

    # Debug Logs
    print("=== RESUME ANALYSIS DEBUG ===")
    lines = text.strip().split('\n')
    print("First 10 lines of resume:")
    for i, line in enumerate(lines[:10]):
        print(f"  {i}: {repr(line)}")
    print(f"Extracted → Name: {name}, Email: {email}, Phone: {phone}")
    print("=== END DEBUG ===")

    # Field prediction
    field, rec_skills, rec_courses = detect_field_and_recommendations(skills)

    # Resume score
    score, tips = score_resume(text)

    # Candidate level
    level = predict_candidate_level(text, pages)

    # ATS score
    field_keywords = DS_KEYWORDS + WEB_KEYWORDS + ANDROID_KEYWORDS + IOS_KEYWORDS + UIUX_KEYWORDS
    ats_score = calculate_ats_score(text, skills, field_keywords)

    # Extract degree if possible
    degree = "N/A"
    education_keywords = ["bachelor", "master", "phd", "degree", "b.tech", "m.tech", "b.sc", "m.sc"]
    text_lower = text.lower()
    for line in text.split('\n'):
        line_lower = line.lower()
        if any(keyword in line_lower for keyword in education_keywords):
            degree = line.strip()
            break

    # Prepare result
    result = {
        "name": name,
        "email": email,
        "mobile_number": phone,
        "degree": degree,
        "no_of_pages": pages,
        "candidate_level": level, 
        "predicted_field": field,
        "skills": skills,
        "recommended_skills": rec_skills,
        "recommended_courses": rec_courses,
        "resume_score": score,
        "tips": tips,
        "ats_score": ats_score,
        "raw_text": text,
    }
    
    # Add user tracking if provided
    if user_id:
        result["user_id"] = user_id
        result["analysis_date"] = datetime.utcnow().isoformat()
        result["original_filename"] = filename
    
    return result