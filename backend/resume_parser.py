import re
import spacy
import fitz  # PyMuPDF
from spacy.matcher import Matcher
import io

nlp = spacy.load("en_core_web_sm")


# -------------------------------------------------------------------
#                 ✓ CLEAN & ACCURATE NAME EXTRACTION
# -------------------------------------------------------------------
def extract_name(text):
    lines = text.split("\n")

    # --- RULE 1: Look for ALL UPPERCASE names (Best match for modern resumes)
    for line in lines:
        line_clean = line.strip()
        if (
            5 < len(line_clean) < 40
            and line_clean.replace(" ", "").isalpha()
            and line_clean.isupper()
            and 2 <= len(line_clean.split()) <= 4
        ):
            return line_clean.title()  # Convert: VISHAL BHINGARDE → Vishal Bhingarde

    # --- RULE 2: Look for Capitalized Name Patterns
    for line in lines:
        parts = line.strip().split()
        if 2 <= len(parts) <= 4:
            if all(p[0].isupper() for p in parts if p.isalpha()):
                return line.strip()

    # --- RULE 3: Email-based Guess (Fallback)
    import re
    email_match = re.search(r'([a-z]{3,})([a-z]+)[0-9]*@', text, re.I)
    if email_match:
        part1, part2 = email_match.group(1), email_match.group(2)
        return (part1 + " " + part2).title()

    return "Not Found"



def is_valid_name(name):
    """
    Your resumes use uppercase full names.
    This function ensures:
    - 1–3 words
    - No numbers
    - No tech words like MERN, React, Java, etc.
    - Starts with a capital letter
    """

    name = name.strip()

    # Reject numbers
    if re.search(r"\d", name):
        return False

    words = name.split()

    # Accept 1–3 words max
    if not (1 <= len(words) <= 3):
        return False

    # Reject tech words / cities / skills
    banned = {
        "solapur", "sangola", "developer", "mern", "data", "python",
        "java", "full", "stack", "engineer", "bsc", "ecs", "resume",
        "project", "email", "github", "linkedin"
    }

    for w in words:
        if w.lower() in banned:
            return False

    # Must begin with a capital letter OR all caps
    for w in words:
        if not (w[0].isupper() or w.isupper()):
            return False

    return True


# -------------------------------------------------------------------
#                  EMAIL EXTRACTION
# -------------------------------------------------------------------
def extract_email(text):
    match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    return match.group(0) if match else "Not specified"


# -------------------------------------------------------------------
#                  PHONE EXTRACTION
# -------------------------------------------------------------------
def extract_phone(text):
    # More comprehensive phone number patterns
    patterns = [
        r'\+?[1-9][0-9\s\-\(\)\.]{8,}',  # General pattern with +, spaces, dashes, parentheses
        r'\(\d{3}\)\s*\d{3}[-\s]?\d{4}',  # (123) 456-7890 or (123)456-7890
        r'\d{3}[-\s\.]?\d{3}[-\s\.]?\d{4}',  # 123-456-7890, 123.456.7890, 123 456 7890
        r'\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',  # International formats
        r'\+?[1-9]\d{0,2}[-.\s]?\d{10}',  # Indian format with country code
        r'\d{10}',  # Simple 10-digit number
        r'\+91[-\s]?\d{10}',  # Indian +91 format
        r'\+91[-\s]?\d{5}[-\s]?\d{5}',  # Indian +91 with spaces
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            # Clean the phone number
            phone = re.sub(r'[^\d\+]', '', str(match))
            
            # Validate: should have 10-15 digits (including country code)
            digits = re.sub(r'\D', '', phone)
            if 10 <= len(digits) <= 15:
                # Format nicely
                if len(digits) == 10:
                    return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"
                elif digits.startswith('91') and len(digits) == 12:
                    return f"+{digits[:2]} {digits[2:5]}-{digits[5:8]}-{digits[8:]}"
                elif digits.startswith('1') and len(digits) == 11:
                    return f"+{digits[:1]} ({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
                else:
                    return phone
    
    return "Not specified"


# -------------------------------------------------------------------
#             CLEAN TEXT EXTRACTION FROM PDF (PyMuPDF)
# -------------------------------------------------------------------
def extract_text_from_pdf(file_bytes):
    # Use file_bytes directly (it's already bytes)
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""

    for page in doc:
        text += page.get_text()

    return text


# -------------------------------------------------------------------
#                     PAGE COUNT
# -------------------------------------------------------------------
def get_pages(file_bytes):
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        return len(doc)
    except:
        return 1


# -------------------------------------------------------------------
#                  SKILL EXTRACTION (Simple)
# -------------------------------------------------------------------
def get_skills(text):
    skills = [
        "python", "java", "c++", "c#", "javascript", "react", "node",
        "html", "css", "mysql", "mongodb", "spring", "spring boot",
        "php", "git", "github", "aws", "api", "rest", "dsa","algorithms"
    ]

    found = []
    text_lower = text.lower()

    for skill in skills:
        if skill in text_lower:
            found.append(skill.capitalize())

    return list(set(found))


# -------------------------------------------------------------------
#              MAIN RESUME PARSER (USED BY main.py)
# -------------------------------------------------------------------
def parse_resume(file_bytes):
    # If file_bytes is already bytes → use it directly
    if isinstance(file_bytes, bytes):
        pdf_bytes = file_bytes
    else:
        pdf_bytes = file_bytes.read()

    # Pass pdf_bytes instead of file_bytes to all functions
    text = extract_text_from_pdf(pdf_bytes)
    name = extract_name(text)
    email = extract_email(text)
    phone = extract_phone(text)
    pages = get_pages(pdf_bytes)
    skills = get_skills(text)

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "pages": pages,
        "skills": skills,
        "raw_text": text
    }