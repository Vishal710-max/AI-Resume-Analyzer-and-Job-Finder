// frontend/src/components/AnalysisResult.jsx
import React, { useState } from 'react';
import CoursesModal from './CoursesModal';

export default function AnalysisResult({ result }) {
  const [showCourses, setShowCourses] = useState(false);
  const [selectedField, setSelectedField] = useState('');
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  if (!result) return null;

  const getScoreText = (score) => {
    if (score >= 80) return 'Excellent!';
    if (score >= 60) return 'Good job!';
    if (score >= 40) return 'Needs improvement';
    return 'Needs major work';
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not specified';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
  };

  const mapFieldToBackend = (field) =>
    field.toLowerCase().replace(/\s+/g, '_');

  const handleViewCourses = () => {
    if (result.predicted_field) {
      setSelectedField(mapFieldToBackend(result.predicted_field));
      setShowCourses(true);
    }
  };

return (
  <>
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

      {/* Score Card - Compact */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-5xl font-bold mb-1">{result.resume_score}/100</p>
            <p className="text-blue-100 text-sm">
              {getScoreText(result.resume_score)}
            </p>
          </div>

          <div className="flex-1 max-w-md">
            <div className="h-2.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${result.resume_score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Basic Info - Compact Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '👤', label: 'Name', value: result.name },
          { icon: '📧', label: 'Email', value: result.email },
          { icon: '📱', label: 'Phone', value: formatPhoneNumber(result.mobile_number) },
          { icon: '📄', label: 'Pages', value: result.no_of_pages },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-lg p-4 shadow-sm border border-slate-200"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                <p className="font-semibold text-slate-900 text-sm truncate">
                  {item.value || 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Career Info - Compact */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🧭</span>
            <h3 className="font-semibold text-slate-700 text-sm">Career Level</h3>
          </div>
          <p className="text-blue-600 font-bold text-lg">{result.candidate_level}</p>
        </div>

        <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎯</span>
            <h3 className="font-semibold text-slate-700 text-sm">Predicted Field</h3>
          </div>
          <p className="text-indigo-600 font-bold text-lg">{result.predicted_field}</p>
        </div>
      </div>

      {/* Skills - Compact */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
        <h2 className="flex items-center gap-2 font-bold text-slate-900 mb-3 text-base">
          <span className="text-xl">🛠️</span>
          Current Skills
        </h2>
        {result.skills?.length ? (
          <div className="flex flex-wrap gap-2">
            {result.skills.map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No data available</p>
        )}
      </div>

      {/* Recommended Skills - Compact */}
      {result.recommended_skills?.length > 0 && (
        <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
          <h2 className="flex items-center gap-2 font-bold text-slate-900 mb-3 text-base">
            <span className="text-xl">🚀</span>
            Recommended Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {result.recommended_skills.map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Courses - Compact */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
        <h2 className="flex items-center gap-2 font-bold text-slate-900 mb-3 text-base">
          <span className="text-xl">🎓</span>
          Recommended Courses
        </h2>
        {result.recommended_courses?.length ? (
          <div className="space-y-2 mb-4">
            {result.recommended_courses.slice(0, 3).map((course, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200"
              >
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-800 leading-snug">{course}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 mb-4">No data available</p>
        )}

        {result.predicted_field && (
          <div className="text-center pt-2">
            <button
              onClick={handleViewCourses}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>📚</span>
              View Complete Course List
            </button>
            <p className="text-xs text-slate-500 mt-2">
              Browse curated courses for {result.predicted_field}
            </p>
          </div>
        )}
      </div>

      {/* Tips - Compact */}
      {result.tips?.length > 0 && (
        <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
          <h2 className="flex items-center gap-2 font-bold text-slate-900 mb-3 text-base">
            <span className="text-xl">💡</span>
            Tips to Improve Your Resume
          </h2>
          <ul className="space-y-2">
            {result.tips.map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed"
              >
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      </div>
    </div>

    {showCourses && (
      <CoursesModal
        field={selectedField}
        displayField={result.predicted_field}
        onClose={() => setShowCourses(false)}
      />
    )}
  </>
);
}

/* ---------- Helper Components ---------- */

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
      <h2 className="flex items-center gap-2 font-bold text-slate-900 mb-4">
        <span className="text-xl">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-slate-500">No data available</p>;
}
