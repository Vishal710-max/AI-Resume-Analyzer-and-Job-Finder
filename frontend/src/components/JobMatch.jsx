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
    <div className="card">
      <h2 className="text-xl">AI Job Match Score</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paste Job Description
        </label>
        <textarea
          className="textarea"
          placeholder="Paste the job description here to analyze how well your resume matches..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          disabled={loading}
          rows={6}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={submitMatch}
          className="btn-primary"
          disabled={loading || !jd.trim()}
        >
          {loading ? (
            <span className="loading">
              <span className="loading-spinner"></span>
              Analyzing Match...
            </span>
          ) : (
            "Check Job Match"
          )}
        </button>
        
        {(result || externalResult) && (
          <button
            onClick={clearResult}
            className="btn-secondary"
            disabled={loading}
          >
            Clear Result
          </button>
        )}
      </div>

      {/* Debug info for external result */}
      {process.env.NODE_ENV === 'development' && externalResult && (
        <div className="debug-info mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <strong>Debug: External Result Detected</strong>
          <div className="mt-1">Type: {typeof externalResult}</div>
          <div className="mt-1">Has result key: {!!externalResult.result}</div>
          <div className="mt-1">
            Content: {JSON.stringify(externalResult).substring(0, 100)}...
          </div>
        </div>
      )}

      {/* Show results - both from manual match and external */}
      {(result || externalResult) && (
        <div className="mt-6">
          {renderResult()}
        </div>
      )}
    </div>
  );
}