// frontend/src/components/ResumeUpload.jsx
import React, { useState } from 'react';
import { analyzeResume } from '../api';
import AnalysisResult from './AnalysisResult';

export default function ResumeUpload({ onResult, onFileUpload }) {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      setFile(selectedFile);
      setError(null);
      onFileUpload?.(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const analysisResult = await analyzeResume(file);
      if (analysisResult.error) throw new Error(analysisResult.error);
      setResult(analysisResult);
      onResult?.(analysisResult);
    } catch (err) {
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const handleDragOver = (e) => {
  e.preventDefault();
  setIsDragging(true);
};

const handleDragLeave = (e) => {
  e.preventDefault();
  setIsDragging(false);
};

const handleDrop = (e) => {
  e.preventDefault();
  setIsDragging(false);

  const droppedFile = e.dataTransfer.files[0];
  if (!droppedFile) return;

  if (droppedFile.type !== 'application/pdf') {
    setError('Please upload a PDF file');
    return;
  }

  setFile(droppedFile);
  setError(null);
  onFileUpload?.(droppedFile);
};


  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
      {!result ? (
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-8">

          {/* Header */}
          <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
            <span className="text-3xl">📄</span>
            Upload Your Resume
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Upload your PDF resume for AI-powered analysis. Get instant feedback on skills,
            career level, and improvement suggestions.
          </p>

          {/* Upload Box */}
          <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-8 border-2 border-dashed rounded-xl p-8 text-center transition
                  ${isDragging
                    ? 'border-indigo-500 bg-indigo-100'
                    : 'border-indigo-300 bg-gradient-to-br from-slate-50 to-indigo-50'
                  }`}
              >
            <h3 className="font-semibold text-slate-900">Drag & Drop or Click to Upload</h3>
            <p className="text-xs text-slate-500 mt-1">Supported format: PDF only</p>

            <input
              type="file"
              id="resume-upload"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isLoading}
              className="hidden"
            />

            <label
              htmlFor="resume-upload"
              className="inline-block mt-4 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition cursor-pointer"
            >
              {isLoading ? 'Processing...' : 'Choose PDF File'}
            </label>
          </div>

          {/* File Preview */}
          {file && (
            <div className="mt-4 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">📄</span>
                <div>
                  <p className="text-sm font-medium text-slate-900 truncate max-w-[220px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                disabled={isLoading}
                className="text-red-500 hover:text-red-700 text-lg"
              >
                ✕
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
              ⚠️ {error}
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <img src="/ai-resume-analyzer.png" alt="AI Resume Analyzer" className="w-5 h-5" />
                  Start AI Analysis
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            >
              Reset
            </button>
          </div>

          {/* Tips */}
          <div className="mt-10 bg-slate-100 rounded-xl p-6">
            <h4 className="font-semibold text-slate-900 mb-3">💡 Tips for best results</h4>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>Use a clean, well-formatted PDF resume</li>
              <li>Ensure text is selectable (not scanned images)</li>
              <li>Include your contact information</li>
              <li>Clearly list skills and experience</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Analysis Complete</h2>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 transition"
            >
              🔄 Analyze Another Resume
            </button>
          </div>
          <AnalysisResult result={result} />
        </div>
      )}
      </div>
    </div>
  );
}
