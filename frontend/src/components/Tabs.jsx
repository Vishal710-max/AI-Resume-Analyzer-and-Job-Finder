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
  <div className="min-h-screen bg-slate-50">
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
    {/* Tab Navigation */}
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-2 mb-6">
      <div className="flex gap-4">
        <button
          onClick={() => {
            setActiveTab("analysis");
            clearAllMatchResults();
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
            activeTab === "analysis"
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span className="text-lg">📊</span>
          <span>Resume Analysis</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("rewrite");
            clearAllMatchResults();
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
            activeTab === "rewrite"
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span className="text-lg">✨</span>
          <span>AI Rewrite</span>
        </button>

        <button
          onClick={() => setActiveTab("match")}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
            activeTab === "match"
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span className="text-lg">🎯</span>
          <span>Job Match</span>
        </button>
      </div>
    </div>

    {/* Tab Content */}
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
      {activeTab === "analysis" && (
        <div>
          <AnalysisResult result={result} />
        </div>
      )}

      {activeTab === "rewrite" && (
        <div>
          <ResumeRewrite />
        </div>
      )}

      {activeTab === "match" && (
        <div className="space-y-6">
          {/* JobFinder component */}
          <div>
            <JobFinder
              resumeText={result.raw_text}
              skills={result.skills}
              onMatch={handleJobFinderMatch}
            />
          </div>

          {/* JobFinder Results */}
          {matchResult && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  Match Analysis: {selectedJobTitle}
                </h3>
                <button
                  onClick={() => setMatchResult(null)}
                  className="px-4 py-2 bg-white text-slate-600 hover:text-slate-900 rounded-lg text-sm font-medium border border-slate-200 hover:border-slate-300 transition-all duration-200 flex items-center gap-2"
                >
                  <span>✕</span>
                  Clear
                </button>
              </div>
              <MatchResultDisplay 
                result={matchResult}
                title=""
              />
            </div>
          )}

          {/* Manual Job Match */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="text-xl">📝</span>
                Manual Job Match
              </h3>
              {manualMatchResult && (
                <button
                  onClick={clearManualMatch}
                  className="px-4 py-2 bg-white text-slate-600 hover:text-slate-900 rounded-lg text-sm font-medium border border-slate-200 hover:border-slate-300 transition-all duration-200 flex items-center gap-2"
                >
                  <span>✕</span>
                  Clear
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
            <div className="text-center pt-4">
              <button
                onClick={clearAllMatchResults}
                className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium border border-red-200 hover:border-red-300 transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <span className="text-lg">🗑️</span>
                Clear All Results
              </button>
            </div>
          )}
        </div>
      )}
    </div>

    {/* Action Buttons */}
    {activeTab === "analysis" && (
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        <button 
          className="px-6 py-3 bg-white text-slate-700 hover:text-slate-900 rounded-lg font-medium border border-slate-300 hover:border-slate-400 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
          onClick={onReset}
        >
          <span className="text-lg">↻</span>
          Analyze Another Resume
        </button>
        <button 
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          onClick={handleDownload}
        >
          <span className="text-lg">📄</span>
          Download Full Report
        </button>
      </div>
    )}
    </div>
  </div>
);
}