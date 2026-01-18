import React from "react";

export default function MatchResultDisplay({ result, title = "Job Match Analysis" }) {
  if (!result) return null;

  // ✅ PROCESS RESULT CONSISTENTLY - UPDATED FUNCTION
  const processResult = (result) => {
    console.log("Processing result in MatchResultDisplay:", result);
    
    // If result is already processed (has Job Match Score key)
    if (result["Job Match Score"] !== undefined || result.score !== undefined) {
      return result;
    }
    
    // If result has "result" key (from backend API)
    if (result.result) {
      // If result.result is already the analysis data
      if (result.result["Job Match Score"] !== undefined || result.result.score !== undefined) {
        return result.result;
      }
      // If result.result has analysis field (old format)
      else if (result.result.analysis) {
        try {
          const analysisText = result.result.analysis;
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.error("Failed to parse analysis:", e);
          return { 
            error: "Failed to parse analysis", 
            raw: result.result.analysis?.substring(0, 200) 
          };
        }
      }
      // Return whatever is in result.result
      return result.result;
    }
    
    // If result has analysis field directly (old format)
    if (result.analysis) {
      try {
        const analysisText = result.analysis;
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error("Failed to parse analysis:", e);
        return { 
          error: "Failed to parse analysis", 
          raw: result.analysis?.substring(0, 200) 
        };
      }
    }
    
    // Fallback: return as-is
    return result;
  };

  const processedResult = processResult(result);
  console.log("Processed result:", processedResult);
  
  // If error in processed result
  if (processedResult.error) {
    return (
      <div className="match-result">
        <h3 className="text-xl mb-6">{title}</h3>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h4>Error Processing Result</h4>
          <p>{processedResult.error}</p>
          {processedResult.raw && (
            <div className="raw-error">
              <p><strong>Raw response:</strong></p>
              <pre className="error-pre">{processedResult.raw}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Extract data from processed result
  const matchScore = processedResult["Job Match Score"] || processedResult.score || processedResult.matchScore || 0;
  const matchedKeywords = processedResult["Matched Keywords"] || processedResult.matchedKeywords || [];
  const missingKeywords = processedResult["Missing Important Keywords"] || processedResult.missingKeywords || [];
  const strengths = processedResult.Strengths || processedResult.strengths || [];
  const weaknesses = processedResult.Weaknesses || processedResult.weaknesses || [];
  const recommendation = processedResult["Final Recommendation"] || processedResult.recommendation || processedResult.finalRecommendation || "";

  const getScoreDescription = (score) => {
    if (score >= 90) return "Excellent match! Highly recommended to apply.";
    if (score >= 80) return "Strong match. Good candidate for this position.";
    if (score >= 70) return "Good match. Consider applying with some improvements.";
    if (score >= 60) return "Fair match. Needs significant improvements.";
    return "Poor match. Consider other opportunities or major resume revisions.";
  };

  // If no data found
  if (matchScore === 0 && matchedKeywords.length === 0 && missingKeywords.length === 0) {
    return (
      <div className="match-result">
        <h3 className="text-xl mb-6">{title}</h3>
        <div className="no-data-message">
          <p>No match data available. Please try again.</p>
          <pre className="debug-pre">
            {JSON.stringify(processedResult, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="match-result">
      <h3 className="text-xl mb-6">{title}</h3>
      
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
          <h4><span className="emoji">✅</span> Matched Keywords ({matchedKeywords.length})</h4>
          <div className="keywords-list">
            {matchedKeywords.map((keyword, index) => (
              <span key={index} className="keyword-tag matched" title={keyword}>
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Keywords */}
      {missingKeywords.length > 0 && (
        <div className="result-section">
          <h4><span className="emoji">❌</span> Missing Important Keywords ({missingKeywords.length})</h4>
          <div className="keywords-list">
            {missingKeywords.map((keyword, index) => (
              <span key={index} className="keyword-tag missing" title={keyword}>
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

      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-section">
          <details>
            <summary>Debug Info</summary>
            <pre className="debug-pre">
              {JSON.stringify({
                processedResult,
                extractedData: {
                  matchScore,
                  matchedKeywordsCount: matchedKeywords.length,
                  missingKeywordsCount: missingKeywords.length,
                  strengthsCount: strengths.length,
                  weaknessesCount: weaknesses.length,
                  hasRecommendation: !!recommendation
                }
              }, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Add inline styles for new classes */}
      <style>{`
        .match-result {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin-top: 20px;
          position: relative;
        }
        
        .text-xl {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a202c;
        }
        
        .score-section {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          margin: 0 auto 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .score-value {
          font-size: 36px;
          font-weight: bold;
          line-height: 1;
        }
        
        .score-label {
          font-size: 14px;
          opacity: 0.9;
          margin-top: 5px;
        }
        
        .score-description {
          color: #4b5563;
          font-style: italic;
          margin-top: 10px;
          font-size: 14px;
        }
        
        .result-section {
          margin-bottom: 25px;
        }
        
        .result-section h4 {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .keywords-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .keyword-tag {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: default;
        }
        
        .keyword-tag.matched {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        
        .keyword-tag.missing {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        
        .list-container {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .list-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 10px;
          color: #4b5563;
        }
        
        .list-item .bullet {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          margin-top: 2px;
        }
        
        .strength-item .bullet {
          background: #d1fae5;
          color: #059669;
        }
        
        .weakness-item .bullet {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .text-content {
          flex: 1;
          color: #475569;
        }
        
        .recommendation {
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
          padding: 16px;
          border-radius: 8px;
        }
        
        .recommendation-text {
          color: #1f2937;
          line-height: 1.6;
          margin: 0;
        }
        
        .error-container {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 16px;
          color: #991b1b;
        }
        
        .error-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }
        
        .raw-error {
          margin-top: 10px;
          padding: 10px;
          background: #f8fafc;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .error-pre {
          white-space: pre-wrap;
          word-break: break-all;
          font-size: 11px;
          margin: 5px 0 0 0;
        }
        
        .no-data-message {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }
        
        .debug-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px dashed #d1d5db;
        }
        
        .debug-section details {
          font-size: 12px;
          color: #6b7280;
        }
        
        .debug-pre {
          background: #1f2937;
          color: #e5e7eb;
          padding: 10px;
          border-radius: 6px;
          font-size: 10px;
          max-height: 200px;
          overflow: auto;
          white-space: pre-wrap;
          word-break: break-all;
          margin-top: 10px;
        }
        
        .emoji {
          font-size: 1.1em;
        }
      `}</style>
    </div>
  );
}