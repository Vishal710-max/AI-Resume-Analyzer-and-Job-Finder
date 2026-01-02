// frontend/src/components/CoursesModal.jsx
import React, { useEffect, useState } from 'react';
import './CoursesModal.css';

export default function CoursesModal({ field, displayField, onClose }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [field]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the specific courses endpoint
      const backendUrl = import.meta.env.VITE_BACKEND_UR || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/courses/${field}`);
      
      console.log('Courses API Response Status:', response.status);
      console.log('Courses API URL:', `${backendUrl}/api/courses/${field}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Courses API Data:', data);
      
      // Handle both array formats from your Courses.py
      let coursesArray = [];
      
      if (Array.isArray(data.courses)) {
        coursesArray = data.courses;
      } else if (data.courses && typeof data.courses === 'object') {
        // If courses is an object, convert to array
        coursesArray = Object.values(data.courses).flat();
      } else if (data.data_science) {
        // If response contains specific field arrays
        coursesArray = data[field] || data.web_development || data.data_science || [];
      }
      
      console.log('Processed courses array:', coursesArray);
      setCourses(coursesArray);
      
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError(`Failed to load courses: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle course data format from Courses.py
  const renderCourseItem = (course, index) => {
    console.log('Rendering course:', course);
    
    // Handle both formats: [name, url] array or string (for videos)
    let courseName = '';
    let courseUrl = '';
    let isVideo = false;
    
    if (Array.isArray(course)) {
      // Format: ['Course Name', 'https://url.com']
      courseName = course[0] || 'Unnamed Course';
      courseUrl = course[1] || '#';
      isVideo = courseUrl.includes('youtu.be') || courseUrl.includes('youtube.com');
    } else if (typeof course === 'string') {
      // Format: 'https://youtube.com/video'
      courseName = `Video Tutorial ${index + 1}`;
      courseUrl = course;
      isVideo = true;
    } else {
      // Unknown format
      courseName = 'Unknown Course';
      courseUrl = '#';
    }
    
    return (
      <div key={index} className="course-card">
        <div className="course-index">
          {index + 1}
        </div>
        <div className="course-details">
          <h3 className="course-title">{courseName}</h3>
          <div className="course-meta">
            <span className="course-type">
              {isVideo ? '🎬 Video Tutorial' : '📖 Online Course'}
            </span>
            {courseName.includes('[Free]') && (
              <span className="course-free">🆓 Free</span>
            )}
          </div>
          <div className="course-actions">
            <a
              href={courseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="course-link"
            >
              {isVideo ? 'Watch Now →' : 'Start Learning →'}
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="courses-modal-overlay" onClick={onClose}>
      <div className="courses-modal-content" onClick={e => e.stopPropagation()}>
        <div className="courses-modal-header">
          <div className="modal-title-section">
            <h2>
              <span className="modal-icon">📚</span>
              {displayField || field} Courses & Resources
            </h2>
            <p className="modal-subtitle">
              Curated learning resources to enhance your skills
            </p>
          </div>
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="courses-modal-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Loading courses...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Error Loading Courses</h3>
              <p>{error}</p>
              <button 
                className="retry-btn"
                onClick={fetchCourses}
              >
                Try Again
              </button>
            </div>
          ) : courses.length > 0 ? (
            <>
              <div className="courses-stats">
                <span className="stat-item">
                  <strong>{courses.length}</strong> resources available
                </span>
                <span className="stat-item">
                  <strong>Free</strong> resources marked with [Free]
                </span>
              </div>
              
              <div className="courses-list-modal">
                {courses.map((course, index) => renderCourseItem(course, index))}
              </div>
              
              <div className="courses-footer">
                <p className="courses-note">
                  💡 <strong>Tip:</strong> Bookmark courses that interest you and complete them systematically.
                </p>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No courses found for "{displayField || field}".</p>
              <p className="empty-subtext">Try refreshing or select a different field.</p>
              <button 
                className="retry-btn"
                onClick={fetchCourses}
              >
                Refresh
              </button>
            </div>
          )}
        </div>
        
        <div className="courses-modal-footer">
          <button 
            className="modal-action-btn secondary"
            onClick={onClose}
          >
            Close
          </button>
          <button 
            className="modal-action-btn primary"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Back to Top
          </button>
        </div>
      </div>
    </div>
  );
}