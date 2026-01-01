from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.units import inch
from io import BytesIO
from reportlab.lib.enums import TA_LEFT

def generate_pdf_report(data):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    
    # Create story (content) list
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=12,
        alignment=TA_LEFT
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=6,
        spaceBefore=12,
        alignment=TA_LEFT
    )
    
    normal_style = styles["Normal"]
    
    # Title
    story.append(Paragraph("AI Resume Analysis Report", title_style))
    story.append(Paragraph("=" * 50, normal_style))
    story.append(Spacer(1, 0.2 * inch))
    
    # Basic Information
    story.append(Paragraph("Candidate Information:", heading_style))
    story.append(Paragraph(f"<b>Name:</b> {data.get('name', 'N/A')}", normal_style))
    story.append(Paragraph(f"<b>Email:</b> {data.get('email', 'N/A')}", normal_style))
    story.append(Paragraph(f"<b>Phone:</b> {data.get('mobile_number', 'N/A')}", normal_style))
    story.append(Spacer(1, 0.1 * inch))
    
    # Scores
    story.append(Paragraph("Scores:", heading_style))
    story.append(Paragraph(f"<b>Resume Score:</b> {data.get('resume_score', 0)}/100", normal_style))
    story.append(Paragraph(f"<b>ATS Score:</b> {data.get('ats_score', 0)}/100", normal_style))
    story.append(Paragraph(f"<b>Candidate Level:</b> {data.get('candidate_level', 'N/A')}", normal_style))
    story.append(Spacer(1, 0.1 * inch))
    
    # Extracted Skills
    story.append(Paragraph("Extracted Skills:", heading_style))
    skills = data.get('skills', [])
    if skills:
        for skill in skills:
            story.append(Paragraph(f"• {skill}", normal_style))
    else:
        story.append(Paragraph("No skills detected", normal_style))
    story.append(Spacer(1, 0.1 * inch))
    
    # Recommended Skills
    recommended_skills = data.get('recommended_skills', [])
    if recommended_skills:
        story.append(Paragraph("Recommended Skills:", heading_style))
        for skill in recommended_skills:
            story.append(Paragraph(f"• {skill}", normal_style))
        story.append(Spacer(1, 0.1 * inch))
    
    # Recommended Courses - Add page break if needed
    recommended_courses = data.get('recommended_courses', [])
    if recommended_courses:
        # Add page break before courses if we have a lot of content
        story.append(PageBreak())
        story.append(Paragraph("Recommended Courses:", heading_style))
        for i, course in enumerate(recommended_courses, 1):
            story.append(Paragraph(f"{i}. {course}", normal_style))
        story.append(Spacer(1, 0.1 * inch))
    
    # Improvement Tips
    tips = data.get('tips', [])
    if tips:
        story.append(Paragraph("Improvement Tips:", heading_style))
        for tip in tips:
            story.append(Paragraph(f"✓ {tip}", normal_style))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer