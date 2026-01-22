// frontend/src/components/JobFinder.jsx

import { useState } from "react";
import axios from "axios";

export default function JobFinder({ resumeText, skills, onMatch }) {
  const [query, setQuery] = useState("software developer");
  const [location, setLocation] = useState("India");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [matchingJobId, setMatchingJobId] = useState(null); // Track which job is being matched
  const [error, setError] = useState("");

  // 🔍 Fetch Jobs From Backend
  const searchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("http://127.0.0.1:8000/job-search", {
        params: { query, location },
      });

      setJobs(res.data.jobs || res.data.data || []);
    } catch (err) {
      setError("Unable to fetch jobs. Check API Key or Internet.");
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Match Resume with Selected Job - UPDATED VERSION
const matchWithJob = async (jobDesc, jobIndex, jobTitle) => {
  try {
    setMatchingJobId(jobIndex);

    const requestData = {
      resume_text: resumeText || "",
      job_description: jobDesc || "",
      skills: Array.isArray(skills) ? skills : [],
    };

    console.log("Sending job match data for:", jobTitle);

    const res = await axios.post(
      "http://127.0.0.1:8000/job-match",
      requestData,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("Job match successful for:", jobTitle);
    
    // Send result to parent component WITH job title
    if (onMatch) {
      onMatch(res.data, jobTitle);
    }
    
  } catch (err) {
    console.error("Job match error:", err.response?.data || err.message);
    alert("Job match failed. Please try again.");
  } finally {
    setMatchingJobId(null);
  }
};

return (
  <div className="w-full">
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-slate-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-3xl">🔍</span>
        Real Job Finder
      </h2>

      {/* Search Inputs */}
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <input
          type="text"
          className="px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
          placeholder="Search job role (e.g., Java Developer)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <input
          type="text"
          className="px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
          placeholder="Location (e.g., India)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button 
          className={`px-6 py-3 rounded-lg font-semibold text-white shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
            loading
              ? 'bg-slate-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:-translate-y-0.5'
          }`}
          onClick={searchJobs} 
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Searching...</span>
            </>
          ) : (
            <>
              <span>🔍</span>
              <span>Find Jobs</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Job Results */}
      <div className="space-y-4 mt-6">
        {jobs.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg">No jobs found. Try another search.</p>
          </div>
        )}

        {jobs.map((job, idx) => (
          <div 
            key={idx} 
            className="bg-slate-700/50 rounded-xl p-5 border border-slate-600 hover:border-slate-500 transition-all duration-300 hover:shadow-xl"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              {job.job_title || "Untitled Job"}
            </h3>
            
            <p className="text-slate-300 font-medium mb-2">
              {job.employer_name}
            </p>
            
            <p className="text-sm text-slate-400 mb-3 flex items-center gap-2">
              <span>📍</span>
              <span>{job.job_city || "Unknown"}, {job.job_country}</span>
            </p>
            
            <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
              {job.job_description?.slice(0, 200)}...
            </p>

            <button
              className={`px-5 py-2.5 rounded-lg font-medium text-white shadow-md transition-all duration-200 flex items-center gap-2 ${
                matchingJobId === idx
                  ? 'bg-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:-translate-y-0.5'
              }`}
              onClick={() => matchWithJob(job.job_description, idx, job.job_title)}
              disabled={matchingJobId === idx}
            >
              {matchingJobId === idx ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Matching...</span>
                </>
              ) : (
                <>
                  <span>🎯</span>
                  <span>Match with Resume</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}