// frontend/src/components/CoursesModal.jsx
import React, { useEffect, useState } from 'react';

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
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
    <div 
      className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <span className="text-3xl">📚</span>
              {displayField || field} Courses & Resources
            </h2>
            <p className="text-blue-100 text-sm">
              Curated learning resources to enhance your skills
            </p>
          </div>
          <button 
            className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 text-2xl font-light ml-4"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
      </div>
      
      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 font-medium">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Error Loading Courses</h3>
            <p className="text-slate-600 mb-6 max-w-md">{error}</p>
            <button 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
              onClick={fetchCourses}
            >
              Try Again
            </button>
          </div>
        ) : courses.length > 0 ? (
          <>
            {/* Stats Bar */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 flex flex-wrap gap-4 justify-center border border-blue-200">
              <span className="flex items-center gap-2 text-sm text-slate-700">
                <span className="font-bold text-blue-600 text-lg">{courses.length}</span>
                <span>resources available</span>
              </span>
              <span className="flex items-center gap-2 text-sm text-slate-700">
                <span className="font-bold text-green-600">Free</span>
                <span>resources marked with [Free]</span>
              </span>
            </div>
            
            {/* Courses List */}
            <div className="space-y-4">
              {courses.map((course, index) => {
                // Handle course data format
                let courseName = '';
                let courseUrl = '';
                let isVideo = false;
                
                if (Array.isArray(course)) {
                  courseName = course[0] || 'Unnamed Course';
                  courseUrl = course[1] || '#';
                  isVideo = courseUrl.includes('youtu.be') || courseUrl.includes('youtube.com');
                } else if (typeof course === 'string') {
                  courseName = `Video Tutorial ${index + 1}`;
                  courseUrl = course;
                  isVideo = true;
                } else {
                  courseName = 'Unknown Course';
                  courseUrl = '#';
                }
                
                return (
                  <div 
                    key={index} 
                    className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                          {courseName}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                            {isVideo ? (
                              <>
                                <span>🎬</span>
                                <span>Video Tutorial</span>
                              </>
                            ) : (
                              <>
                                <span>📖</span>
                                <span>Online Course</span>
                              </>
                            )}
                          </span>
                          {courseName.includes('[Free]') && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                              <span>🆓</span>
                              <span>Free</span>
                            </span>
                          )}
                        </div>
                        
                        <a
                          href={courseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                          <span>{isVideo ? 'Watch Now' : 'Start Learning'}</span>
                          <span>→</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Footer Note */}
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-900 flex items-start gap-2">
                <span className="text-lg">💡</span>
                <span>
                  <strong>Tip:</strong> Bookmark courses that interest you and complete them systematically for best results.
                </span>
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl font-semibold text-slate-800 mb-2">No courses found for "{displayField || field}"</p>
            <p className="text-slate-600 mb-6">Try refreshing or select a different field.</p>
            <button 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
              onClick={fetchCourses}
            >
              Refresh
            </button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="border-t border-slate-200 p-4 bg-slate-50 flex justify-between gap-3">
        <button 
          className="px-6 py-3 bg-white text-slate-700 hover:text-slate-900 rounded-lg font-medium border border-slate-300 hover:border-slate-400 shadow-sm hover:shadow-md transition-all duration-200"
          onClick={onClose}
        >
          Close
        </button>
        <button 
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Back to Top ↑
        </button>
      </div>
    </div>

    <style>{`
      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      @keyframes slide-up {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .animate-fade-in {
        animation: fade-in 0.2s ease-out;
      }
      
      .animate-slide-up {
        animation: slide-up 0.3s ease-out;
      }
    `}</style>
  </div>
  );
}