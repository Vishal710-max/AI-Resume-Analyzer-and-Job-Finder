// frontend/src/components/AnalysisResult.jsx
import React, { useState } from 'react';
import CoursesModal from './CoursesModal';

export default function AnalysisResult({ result }) {
  const [showCourses, setShowCourses] = useState(false);
  const [selectedField, setSelectedField] = useState('');
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  if (!result) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-average';
    return 'score-poor';
  };

  const getScoreText = (score) => {
    if (score >= 80) return 'Excellent!';
    if (score >= 60) return 'Good job!';
    if (score >= 40) return 'Needs improvement';
    return 'Needs major work';
  };

  // Format phone number for better display
  const formatPhoneNumber = (phone) => {
    if (!phone) return "Not specified";
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }
    
    return phone;
  };

  // Map predicted field to backend field names
  const mapFieldToBackend = (field) => {
    const fieldMap = {
      'Data Science': 'data_science',
      'Data science': 'data_science',
      'Web Development': 'web_development',
      'Web development': 'web_development',
      'Android Development': 'android',
      'Android development': 'android',
      'Android': 'android',
      'iOS Development': 'ios',
      'iOS development': 'ios',
      'iOS': 'ios',
      'UI/UX Design': 'ui_ux',
      'UI/UX': 'ui_ux',
      'UI UX Design': 'ui_ux',
      'Resume Writing': 'resume',
      'Resume writing': 'resume',
      'Interview Preparation': 'interview',
      'Interview preparation': 'interview',
    };
    
    // Try exact match first
    if (fieldMap[field]) {
      return fieldMap[field];
    }
    
    // Try case-insensitive match
    const lowerField = field.toLowerCase();
    for (const [key, value] of Object.entries(fieldMap)) {
      if (key.toLowerCase() === lowerField) {
        return value;
      }
    }
    
    // Fallback
    return field.toLowerCase().replace(/\s+/g, '_');
  };

  // ============ FIXED: Add this function ============
  const handleViewCourses = () => {
    console.log('handleViewCourses called with field:', result.predicted_field);
    if (result.predicted_field) {
      const backendField = mapFieldToBackend(result.predicted_field);
      console.log('Mapped to backend field:', backendField);
      setSelectedField(backendField);
      setShowCourses(true);
    } else {
      console.error('No predicted field found in result:', result);
    }
  };

  const handleCloseModal = () => {
    setShowCourses(false);
    setSelectedField('');
  };

  return (
    <>
      <div className="result-container">
        {/* Score Header */}
        <div className={`score-header ${getScoreColor(result.resume_score)}`}>
          <div className="score-content">
            <div className="score-main">
              <div className="score-value">{result.resume_score}/100</div>
              <div className="score-label">{getScoreText(result.resume_score)}</div>
            </div>
            <div className="score-progress">
              <div 
                className="progress-bar"
                style={{ width: `${result.resume_score}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">👤</div>
            <div className="info-content">
              <label>Name</label>
              <p title={result.name || "Not specified"}>
                {result.name || "Not specified"}
              </p>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">📧</div>
            <div className="info-content">
              <label>Email</label>
              <p title={result.email || "Not specified"}>
                {result.email || "Not specified"}
              </p>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">📱</div>
            <div className="info-content">
              <label>Phone</label>
              <p title={result.mobile_number || "Not specified"}>
                {formatPhoneNumber(result.mobile_number) || "Not specified"}
              </p>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">📄</div>
            <div className="info-content">
              <label>Pages</label>
              <p>{result.no_of_pages}</p>
            </div>
          </div>
        </div>

        {/* Assessment Cards */}
        <div className="assessment-grid">
          <div className="assessment-card">
            <h3>🧭 Career Level</h3>
            <p className="assessment-value">{result.candidate_level}</p>
          </div>
          
          <div className="assessment-card">
            <h3>🎯 Predicted Field</h3>
            <p className="assessment-value">{result.predicted_field}</p>
          </div>
        </div>

        {/* Skills Section */}
        <div className="section">
          <h2 className="section-title">
            <span className="section-icon">🛠️</span>
            Current Skills
          </h2>
          <div className="skills-container">
            {result.skills?.length > 0 ? (
              result.skills.map((skill, index) => (
                <span key={index} className="skill-tag" title={skill}>
                  {skill}
                </span>
              ))
            ) : (
              <p className="no-data">No skills detected</p>
            )}
          </div>
        </div>

        {/* Recommended Skills */}
        {result.recommended_skills && result.recommended_skills.length > 0 && (
          <div className="section">
            <h2 className="section-title">
              <span className="section-icon">🚀</span>
              Recommended Skills
            </h2>
            <div className="skills-container recommended">
              {result.recommended_skills.map((skill, index) => (
                <span key={index} className="skill-tag recommended" title={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Courses */}
        <div className="section">
          <h2 className="section-title">
            <span className="section-icon">🎓</span>
            Recommended Courses
          </h2>
          <div className="courses-section">
            {/* Short course list from analysis result */}
            {result.recommended_courses && result.recommended_courses.length > 0 ? (
              <div className="courses-list">
                {result.recommended_courses.slice(0, 3).map((course, index) => (
                  <div key={index} className="course-item">
                    <div className="course-number">{index + 1}</div>
                    <div className="course-content">
                      <p title={course}>{course}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No specific course recommendations generated.</p>
            )}
            
            {/* Button to view detailed courses */}
            {result.predicted_field && (
              <div className="courses-action">
                <button 
                  className="view-courses-btn"
                  onClick={handleViewCourses}   
                  disabled={isLoadingCourses}
                >
                  {isLoadingCourses ? (
                    <>
                      <span className="spinner"></span>
                      Loading Courses...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">📚</span>
                      View Complete Course List for {result.predicted_field}
                    </>
                  )}
                </button>
                <p className="courses-hint">
                  Click to browse {result.predicted_field} courses with direct links
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Improvement Tips */}
        {result.tips && result.tips.length > 0 && (
          <div className="section">
            <h2 className="section-title">
              <span className="section-icon">💡</span>
              Tips to Improve Your Resume
            </h2>
            <div className="tips-list">
              {result.tips.map((tip, index) => (
                <div key={index} className="tip-item">
                  <div className="tip-icon">✓</div>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Courses Modal */}
      {showCourses && (
        <CoursesModal
          field={selectedField}
          displayField={result.predicted_field}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}