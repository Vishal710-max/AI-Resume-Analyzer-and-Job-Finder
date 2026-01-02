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
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mt-6 animate-fadeIn">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-sm">⚠️</span>
          </div>
          {title}
        </h3>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-inner">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">⚠️</div>
            <h4 className="text-lg font-semibold text-red-800">Error Processing Result</h4>
          </div>
          <p className="text-red-700 mb-4">{processedResult.error}</p>
          {processedResult.raw && (
            <div className="bg-white rounded-lg p-4 border border-red-100">
              <p className="font-medium text-red-800 mb-2">Raw response:</p>
              <pre className="text-xs text-red-600 whitespace-pre-wrap break-words bg-red-25 p-3 rounded border overflow-auto max-h-32">
                {processedResult.raw}
              </pre>
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

  const getScoreColor = (score) => {
    if (score >= 90) return "from-emerald-400 to-green-500";
    if (score >= 80) return "from-blue-400 to-indigo-500";
    if (score >= 70) return "from-yellow-400 to-orange-500";
    if (score >= 60) return "from-orange-400 to-red-500";
    return "from-red-400 to-red-600";
  };

  const getScoreTextColor = (score) => {
    if (score >= 90) return "text-emerald-700";
    if (score >= 80) return "text-blue-700";
    if (score >= 70) return "text-yellow-700";
    if (score >= 60) return "text-orange-700";
    return "text-red-700";
  };

  // If no data found
  if (matchScore === 0 && matchedKeywords.length === 0 && missingKeywords.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mt-6 animate-fadeIn">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center">
            <span className="text-white text-sm">❓</span>
          </div>
          {title}
        </h3>
        <div className="bg-gray-50 rounded-xl p-8 text-center shadow-inner">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600 mb-4 text-lg">No match data available. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mt-6 animate-fadeIn hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-sm">🎯</span>
          </div>
          {title}
        </h3>
      </div>
      
      {/* Score Section */}
      <div className="text-center mb-10">
        <div className="relative inline-block">
          <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreColor(matchScore)} shadow-2xl flex flex-col items-center justify-center text-white transform hover:scale-105 transition-transform duration-300`}>
            <div className="text-4xl font-bold leading-none">{matchScore}</div>
            <div className="text-sm opacity-90 font-medium">Match Score</div>
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-white opacity-20 animate-ping"></div>
        </div>
        <div className={`mt-4 text-base font-medium ${getScoreTextColor(matchScore)} max-w-md mx-auto px-4`}>
          {getScoreDescription(matchScore)}
        </div>
      </div>

      {/* Content Grid - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Left Column */}
        <div className="space-y-6">
          {/* Matched Keywords */}
          {matchedKeywords.length > 0 && (
            <div className="animate-slideInUp" style={{ animationDelay: '0.1s' }}>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <span className="text-xl">✅</span>
                <span>Matched Keywords</span>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  {matchedKeywords.length}
                </span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {matchedKeywords.map((keyword, index) => (
                  <span 
                    key={index} 
                    className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 px-3 py-2 rounded-full text-sm font-medium border border-green-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default"
                    title={keyword}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {strengths.length > 0 && (
            <div className="animate-slideInUp" style={{ animationDelay: '0.3s' }}>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <span className="text-xl">💪</span>
                <span>Strengths</span>
              </h4>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100 shadow-inner">
                <ul className="space-y-3">
                  {strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3 group">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5 group-hover:bg-green-200 transition-colors">
                        <span className="text-green-600 text-sm font-bold">✓</span>
                      </div>
                      <span className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors text-sm">
                        {strength}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Missing Keywords */}
          {missingKeywords.length > 0 && (
            <div className="animate-slideInUp" style={{ animationDelay: '0.2s' }}>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <span className="text-xl">❌</span>
                <span>Missing Keywords</span>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  {missingKeywords.length}
                </span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {missingKeywords.map((keyword, index) => (
                  <span 
                    key={index} 
                    className="bg-gradient-to-r from-red-50 to-pink-50 text-red-800 px-3 py-2 rounded-full text-sm font-medium border border-red-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default"
                    title={keyword}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Weaknesses */}
          {weaknesses.length > 0 && (
            <div className="animate-slideInUp" style={{ animationDelay: '0.4s' }}>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <span className="text-xl">📉</span>
                <span>Areas for Improvement</span>
              </h4>
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-5 border border-orange-100 shadow-inner">
                <ul className="space-y-3">
                  {weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-3 group">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5 group-hover:bg-orange-200 transition-colors">
                        <span className="text-orange-600 text-sm font-bold">!</span>
                      </div>
                      <span className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors text-sm">
                        {weakness}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Final Recommendation - Full Width */}
      {recommendation && (
        <div className="animate-slideInUp mb-6" style={{ animationDelay: '0.5s' }}>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
            <span className="text-xl">🎯</span>
            <span>Recommendation</span>
          </h4>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-400 shadow-inner">
            <p className="text-gray-800 leading-relaxed font-medium">
              {recommendation}
            </p>
          </div>
        </div>
      )}

      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <details className="group">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium flex items-center gap-2">
              <span className="transform group-open:rotate-90 transition-transform">▶</span>
              Debug Info
            </summary>
            <div className="mt-3 bg-gray-900 text-gray-100 p-4 rounded-lg shadow-inner max-h-64 overflow-auto">
              <pre className="text-xs whitespace-pre-wrap break-words">
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
            </div>
          </details>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
}
