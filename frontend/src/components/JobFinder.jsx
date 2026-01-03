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
    <div className="job-finder-container">
      <h2 className="title">🔍 Real Job Finder</h2>

      {/* Search Inputs */}
      <div className="job-search-box">
        <input
          type="text"
          className="input"
          placeholder="Search job role (e.g., Java Developer)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <input
          type="text"
          className="input"
          placeholder="Location (e.g., India)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button className="search-btn" onClick={searchJobs} disabled={loading}>
          {loading ? "Searching..." : "Find Jobs"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {/* JOB RESULTS */}
      <div className="jobs-list">
        {jobs.length === 0 && !loading && (
          <p className="no-jobs">No jobs found. Try another search.</p>
        )}

        {jobs.map((job, idx) => (
          <div key={idx} className="job-card">
            <h3>{job.job_title || "Untitled Job"}</h3>
            <p className="company">{job.employer_name}</p>
            <p className="location">
              📍 {job.job_city || "Unknown"}, {job.job_country}
            </p>
            <p className="desc">{job.job_description?.slice(0, 200)}...</p>

            <button
                className="match-btn"
                onClick={() => matchWithJob(job.job_description, idx, job.job_title)}
                disabled={matchingJobId === idx}
                >
                {matchingJobId === idx ? "Matching..." : "🎯 Match with Resume"}
            </button>
          </div>
        ))}
      </div>

      {/* Styling */}
      <style>{`
        .job-finder-container {
          background: #101827;
          padding: 20px;
          border-radius: 10px;
          margin-top: 20px;
        }
        .title {
          color: #fff;
          font-size: 22px;
          margin-bottom: 10px;
        }
        .job-search-box {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        .input {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          background: #1f2937;
          color: #fff;
          border: 1px solid #374151;
        }
        .search-btn {
          background: #6366f1;
          color: white;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }
        .search-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .jobs-list {
          margin-top: 20px;
        }
        .job-card {
          background: #1f2937;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 15px;
          border: 1px solid #374151;
        }
        .job-card h3 {
          color: #fff;
          margin-top: 0;
          margin-bottom: 5px;
          font-size: 18px;
        }
        .company {
          font-size: 14px;
          color: #9ca3af;
          margin: 5px 0;
        }
        .location {
          margin: 5px 0;
          font-size: 14px;
          color: #9ca3af;
        }
        .desc {
          color: #d1d5db;
          margin: 10px 0;
          font-size: 14px;
          line-height: 1.5;
        }
        .match-btn {
          background: #22c55e;
          color: #fff;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 10px;
        }
        .match-btn:hover:not(:disabled) {
          background: #16a34a;
        }
        .match-btn:disabled {
          background: #6b7280;
          cursor: not-allowed;
        }
        .no-jobs {
          color: #9ca3af;
          margin-top: 10px;
          text-align: center;
          padding: 20px;
        }
        .error {
          color: #f87171;
          padding: 10px;
          background: rgba(248, 113, 113, 0.1);
          border-radius: 5px;
          margin-bottom: 15px;
        }
      `}</style>
    </div>
  );
}