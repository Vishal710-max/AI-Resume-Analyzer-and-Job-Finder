import { useState } from "react";
import AnalysisResult from "./AnalysisResult";
import ResumeRewrite from "./ResumeRewrite";
import MatchResultDisplay from "./MatchResultDisplay";
import JobFinder from "./JobFinder";
import JobMatch from "./JobMatch";
import { downloadReport } from "../api";

export default function Tabs({ result, onReset }) {
  const [activeTab, setActiveTab] = useState("analysis");
  const [matchResult, setMatchResult] = useState(null);
  const [manualMatchResult, setManualMatchResult] = useState(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState(""); // Removed unused jobDescription

  // PDF Download Handler
  const handleDownload = async () => {
    try {
      await downloadReport(result);
      console.log("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF download failed:", error);
    }
  };

  // Handle match result from JobFinder
  const handleJobFinderMatch = (data, jobTitle) => {
    console.log("Match result from JobFinder:", data);
    setMatchResult(data);
    setManualMatchResult(null);
    setSelectedJobTitle(jobTitle || "Selected Job");
  };

  // Handle manual job match
  const handleManualMatch = (data) => {
    console.log("Manual match result:", data);
    setManualMatchResult(data);
    setMatchResult(null);
  };

  // Clear all match results
  const clearAllMatchResults = () => {
    setMatchResult(null);
    setManualMatchResult(null);
    setSelectedJobTitle("");
  };

  // Clear only manual match
  const clearManualMatch = () => {
    setManualMatchResult(null);
  };

  return (
    <div className="tabs-container">

      {/* ---------------- TAB NAVIGATION ---------------- */}
      <div className="tabs-navigation">
        <button
          onClick={() => {
            setActiveTab("analysis");
            clearAllMatchResults();
          }}
          className={`tab-button ${activeTab === "analysis" ? "active" : ""}`}
        >
          <span className="tab-icon">📊</span>
          Resume Analysis
        </button>

        <button
          onClick={() => {
            setActiveTab("rewrite");
            clearAllMatchResults();
          }}
          className={`tab-button ${activeTab === "rewrite" ? "active" : ""}`}
        >
          <span className="tab-icon">✨</span>
          AI Rewrite
        </button>

        <button
          onClick={() => setActiveTab("match")}
          className={`tab-button ${activeTab === "match" ? "active" : ""}`}
        >
          <span className="tab-icon">🎯</span>
          Job Match
        </button>
      </div>

      {/* ---------------- TAB CONTENT ---------------- */}
      <div className="tab-content">
        {activeTab === "analysis" && (
          <AnalysisResult result={result} />
        )}

        {activeTab === "rewrite" && (
          <ResumeRewrite />
        )}

        {activeTab === "match" && (
          <div>
            {/* JobFinder component */}
            <JobFinder
              resumeText={result.raw_text}
              skills={result.skills}
              onMatch={handleJobFinderMatch}
            />

            {/* JobFinder Results */}
            {matchResult && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    🎯 Match Analysis: {selectedJobTitle}
                  </h3>
                  <button
                    onClick={() => setMatchResult(null)}
                    className="btn-secondary text-sm"
                  >
                    ✕ Clear
                  </button>
                </div>
                <MatchResultDisplay 
                  result={matchResult}
                  title=""
                />
              </div>
            )}

            {/* Manual Job Match */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  📝 Manual Job Match
                </h3>
                {manualMatchResult && (
                  <button
                    onClick={clearManualMatch}
                    className="btn-secondary text-sm"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
              <JobMatch 
                resumeText={result.raw_text} 
                skills={result.skills}
                externalResult={manualMatchResult}
                onMatchComplete={handleManualMatch}
                onClear={clearManualMatch}
              />
            </div>

            {/* Clear All Button */}
            {(matchResult || manualMatchResult) && (
              <div className="mt-6 text-center">
                <button
                  onClick={clearAllMatchResults}
                  className="btn-secondary"
                >
                  🗑️ Clear All Results
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------------- ACTION BUTTONS ---------------- */}
      {activeTab === "analysis" && (
        <div className="action-buttons">
          <button className="btn-secondary" onClick={onReset}>
            ↻ Analyze Another Resume
          </button>
          <button className="btn-primary" onClick={handleDownload}>
            📄 Download Full Report
          </button>
        </div>
      )}
    </div>
  );
}