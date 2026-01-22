import { useState, useEffect, useRef } from "react";
import { jobMatch } from "../api";

export default function JobMatch({ 
  resumeText, 
  skills, 
  externalResult = null,
  onMatchComplete = null,
  onClear = null
}) {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const prevExternalResultRef = useRef(null); // Track previous external result

  // ✅ FIXED: Sync external result properly
  useEffect(() => {
    console.log("External result changed:", externalResult);
    
    // Only update if externalResult actually changed and is not null
    if (externalResult && externalResult !== prevExternalResultRef.current) {
      console.log("Processing external result:", externalResult);
      
      // Process the external result
      const processedResult = processApiResponse(externalResult);
      console.log("Processed external result:", processedResult);
      
      // Update state
      setResult(processedResult);
      
      // Clear the textarea when external result comes
      setJd("");
      
      // Store the current external result for comparison
      prevExternalResultRef.current = externalResult;
    }
    
    // If externalResult becomes null (cleared), clear our internal result too
    if (externalResult === null && result !== null) {
      console.log("Clearing result because externalResult is null");
      setResult(null);
      prevExternalResultRef.current = null;
    }
  }, [externalResult]); // Run only when externalResult changes

  // ✅ IMPROVED: Process API response - handle all formats
  const processApiResponse = (apiResponse) => {
    console.log("Processing API response:", apiResponse);
    
    // Case 1: Already has the expected structure
    if (apiResponse["Job Match Score"] !== undefined || 
        apiResponse.score !== undefined ||
        apiResponse.error) {
      return apiResponse;
    }
    
    // Case 2: Has "result" key
    if (apiResponse.result) {
      const resultData = apiResponse.result;
      
      // If resultData has analysis field (old format)
      if (resultData.analysis) {
        try {
          const analysisText = resultData.analysis;
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.error("Failed to parse analysis:", e);
          return { 
            error: "Failed to parse analysis", 
            raw: resultData.analysis?.substring(0, 200) 
          };
        }
      }
      
      // If resultData is already the match data
      if (resultData["Job Match Score"] !== undefined || resultData.score !== undefined) {
        return resultData;
      }
      
      return resultData;
    }
    
    // Case 3: Direct string that might be JSON
    if (typeof apiResponse === 'string') {
      try {
        // Remove markdown code blocks
        const cleanJson = apiResponse.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (e) {
        return { error: "Invalid JSON response", raw: apiResponse };
      }
    }
    
    // Case 4: Return as-is (fallback)
    return apiResponse;
  };

  const submitMatch = async () => {
    if (!jd.trim()) {
      alert("Please paste a job description first!");
      return;
    }

    setLoading(true);
    try {
      const safeSkills = Array.isArray(skills) ? skills : [];
      const apiResponse = await jobMatch(resumeText || "", jd, safeSkills);
      
      console.log("Manual match API response:", apiResponse);
      
      // Process the response
      const processedResult = processApiResponse(apiResponse);
      console.log("Manual match processed result:", processedResult);
      
      // Update local state
      setResult(processedResult);
      
      // Notify parent component
      if (onMatchComplete) {
        console.log("Calling onMatchComplete callback");
        onMatchComplete(processedResult);
      }
      
    } catch (error) {
      console.error("Job match error:", error);
      setResult({ 
        error: "An error occurred while analyzing the job match.",
        details: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    console.log("Clearing JobMatch result");
    setResult(null);
    setJd("");
    
    // Notify parent component
    if (onClear) {
      console.log("Calling onClear callback");
      onClear();
    }
  };

  // Function to render the result beautifully
  const renderResult = () => {
    if (!result) return null;

    // If error
    if (result.error) {
      return (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h4>Error</h4>
          <p>{result.error}</p>
          {result.details && <p className="error-details">{result.details}</p>}
          {result.raw && (
            <div className="raw-error">
              <p><strong>Raw response:</strong></p>
              <pre className="error-pre">
                {typeof result.raw === 'string' ? result.raw : JSON.stringify(result.raw, null, 2)}
              </pre>
            </div>
          )}
        </div>
      );
    }

    // If raw text response (fallback)
    if (typeof result === 'string') {
      return (
        <div className="result-container">
          <h3 className="result-title">Match Analysis Result</h3>
          <div className="result-content">
            <pre>{result}</pre>
          </div>
        </div>
      );
    }

    // Extract data from possible nested structures
    const matchScore = result["Job Match Score"] || result.score || result.matchScore || 0;
    const matchedKeywords = result["Matched Keywords"] || result.matchedKeywords || [];
    const missingKeywords = result["Missing Important Keywords"] || result.missingKeywords || [];
    const strengths = result.Strengths || result.strengths || [];
    const weaknesses = result.Weaknesses || result.weaknesses || [];
    const recommendation = result["Final Recommendation"] || result.recommendation || result.finalRecommendation || "";

    // If JSON object with proper structure
    return (
      <div className="match-result">
        {/* Score Circle */}
        <div className="score-section">
          <div className="score-circle">
            <div className="score-value">{matchScore}</div>
            <div className="score-label">Match Score</div>
          </div>
          <div className="score-description">
            {getScoreDescription(matchScore)}
          </div>
        </div>

        {/* Matched Keywords */}
        {matchedKeywords.length > 0 && (
          <div className="result-section">
            <h4><span className="emoji">✅</span> Matched Keywords</h4>
            <div className="keywords-list">
              {matchedKeywords.map((keyword, index) => (
                <span key={index} className="keyword-tag matched">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Keywords */}
        {missingKeywords.length > 0 && (
          <div className="result-section">
            <h4><span className="emoji">❌</span> Missing Important Keywords</h4>
            <div className="keywords-list">
              {missingKeywords.map((keyword, index) => (
                <span key={index} className="keyword-tag missing">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="result-section">
            <h4><span className="emoji">💪</span> Strengths</h4>
            <ul className="list-container">
              {strengths.map((strength, index) => (
                <li key={index} className="list-item strength-item">
                  <span className="bullet">✓</span>
                  <span className="text-content">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <div className="result-section">
            <h4><span className="emoji">📉</span> Areas for Improvement</h4>
            <ul className="list-container">
              {weaknesses.map((weakness, index) => (
                <li key={index} className="list-item weakness-item">
                  <span className="bullet">!</span>
                  <span className="text-content">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Final Recommendation */}
        {recommendation && (
          <div className="result-section recommendation">
            <h4><span className="emoji">🎯</span> Recommendation</h4>
            <p className="recommendation-text">{recommendation}</p>
          </div>
        )}
      </div>
    );
  };

  const getScoreDescription = (score) => {
    if (score >= 90) return "Excellent match! Highly recommended to apply.";
    if (score >= 80) return "Strong match. Good candidate for this position.";
    if (score >= 70) return "Good match. Consider applying with some improvements.";
    if (score >= 60) return "Fair match. Needs significant improvements.";
    return "Poor match. Consider other opportunities or major resume revisions.";
  };

return (
  <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
      <span className="text-2xl">🎯</span>
      AI Job Match Score
    </h2>
    
    <div className="mb-5">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Paste Job Description
      </label>
      <textarea
        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 text-slate-900 placeholder-slate-400 resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
        placeholder="Paste the job description here to analyze how well your resume matches..."
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        disabled={loading}
        rows={6}
      />
    </div>

    <div className="flex gap-3 mb-6">
      <button
        onClick={submitMatch}
        className={`px-6 py-3 rounded-lg font-semibold text-white shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
          loading || !jd.trim()
            ? 'bg-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:-translate-y-0.5'
        }`}
        disabled={loading || !jd.trim()}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Analyzing Match...</span>
          </>
        ) : (
          <>
            <span>🔍</span>
            <span>Check Job Match</span>
          </>
        )}
      </button>
      
      {(result || externalResult) && (
        <button
          onClick={clearResult}
          className="px-6 py-3 bg-white text-slate-700 hover:text-slate-900 rounded-lg font-medium border border-slate-300 hover:border-slate-400 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          Clear Result
        </button>
      )}
    </div>

    {/* Debug info for external result */}
    {process.env.NODE_ENV === 'development' && externalResult && (
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <strong className="text-yellow-800 text-sm font-semibold">Debug: External Result Detected</strong>
        <div className="mt-2 text-xs text-yellow-700 space-y-1">
          <div>Type: {typeof externalResult}</div>
          <div>Has result key: {!!externalResult.result}</div>
          <div className="break-all">
            Content: {JSON.stringify(externalResult).substring(0, 100)}...
          </div>
        </div>
      </div>
    )}

    {/* Show results - both from manual match and external */}
    {(result || externalResult) && (
      <div className="mt-6">
        {result && result.error ? (
          // Error Display
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h4 className="text-lg font-bold text-red-800 mb-2">Error</h4>
                <p className="text-red-700">{result.error}</p>
                {result.details && (
                  <p className="text-sm text-red-600 mt-2">{result.details}</p>
                )}
              </div>
            </div>
            {result.raw && (
              <div className="mt-4 p-3 bg-red-100 rounded-lg">
                <p className="text-sm font-semibold text-red-800 mb-2">Raw response:</p>
                <pre className="text-xs text-red-700 overflow-auto max-h-40">
                  {typeof result.raw === 'string' ? result.raw : JSON.stringify(result.raw, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : typeof result === 'string' ? (
          // String Response
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>📊</span>
              Match Analysis Result
            </h3>
            <pre className="text-sm text-slate-700 whitespace-pre-wrap overflow-auto max-h-96 bg-white p-4 rounded-lg border border-slate-200">
              {result}
            </pre>
          </div>
        ) : (
          // Structured Result Display
          <div className="space-y-6">
            {/* Score Circle */}
            {(() => {
              const matchScore = result?.["Job Match Score"] || result?.score || result?.matchScore || 0;
              const matchedKeywords = result?.["Matched Keywords"] || result?.matchedKeywords || [];
              const missingKeywords = result?.["Missing Important Keywords"] || result?.missingKeywords || [];
              const strengths = result?.Strengths || result?.strengths || [];
              const weaknesses = result?.Weaknesses || result?.weaknesses || [];
              const recommendation = result?.["Final Recommendation"] || result?.recommendation || result?.finalRecommendation || "";

              return (
                <>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center border border-blue-200">
                    <div className="inline-flex flex-col items-center">
                      <div className="relative">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#e2e8f0"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${(matchScore / 100) * 351.86} 351.86`}
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div>
                            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                              {matchScore}
                            </div>
                            <div className="text-xs text-slate-600 font-medium">Match Score</div>
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 text-slate-700 font-medium max-w-md">
                        {matchScore >= 90 ? "Excellent match! Highly recommended to apply." :
                         matchScore >= 80 ? "Strong match. Good candidate for this position." :
                         matchScore >= 70 ? "Good match. Consider applying with some improvements." :
                         matchScore >= 60 ? "Fair match. Needs significant improvements." :
                         "Poor match. Consider other opportunities or major resume revisions."}
                      </p>
                    </div>
                  </div>

                  {/* Matched Keywords */}
                  {matchedKeywords.length > 0 && (
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                      <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">✅</span>
                        Matched Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {matchedKeywords.map((keyword, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium border border-green-200"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Keywords */}
                  {missingKeywords.length > 0 && (
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                      <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">❌</span>
                        Missing Important Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {missingKeywords.map((keyword, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium border border-red-200"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths */}
                  {strengths.length > 0 && (
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                      <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">💪</span>
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-3 text-slate-700">
                            <span className="text-green-600 font-bold mt-0.5">✓</span>
                            <span className="flex-1">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {weaknesses.length > 0 && (
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                      <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">📉</span>
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-2">
                        {weaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-start gap-3 text-slate-700">
                            <span className="text-orange-600 font-bold mt-0.5">!</span>
                            <span className="flex-1">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Final Recommendation */}
                  {recommendation && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="text-xl">🎯</span>
                        Recommendation
                      </h4>
                      <p className="text-slate-700 leading-relaxed">{recommendation}</p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    )}
  </div>
);
}