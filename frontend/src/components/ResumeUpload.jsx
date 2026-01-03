// frontend/src/components/ResumeUpload.jsx
import React, { useState } from 'react';
import { analyzeResume } from '../api';
import AnalysisResult from './AnalysisResult';

export default function ResumeUpload({ onResult, onFileUpload }) {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

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
      console.log('API Response:', analysisResult);
      
      if (analysisResult.error) {
        throw new Error(analysisResult.error);
      }
      
      setResult(analysisResult);
      onResult?.(analysisResult);
    } catch (err) {
      console.error('Upload error:', err);
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

  return (
    <div className="upload-container">
      {!result ? (
        <div className="upload-card">
          <h2 className="upload-title">
            <span className="upload-icon">📄</span>
            Upload Your Resume
          </h2>
          
          <p className="upload-description">
            Upload your PDF resume for AI-powered analysis. Get instant feedback on your skills, 
            career level, and improvement suggestions.
          </p>

          <div className="upload-area">
            <div className="upload-box">
              <div className="upload-icon-large">📤</div>
              <h3>Drag & Drop or Click to Upload</h3>
              <p>Supported format: PDF only</p>
              <input
                type="file"
                id="resume-upload"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isLoading}
                className="file-input"
              />
              <label htmlFor="resume-upload" className="upload-btn">
                {isLoading ? 'Processing...' : 'Choose PDF File'}
              </label>
            </div>

            {file && (
              <div className="file-preview">
                <div className="file-info">
                  <span className="file-icon">📄</span>
                  <div className="file-details">
                    <p className="file-name" title={file.name}>
                      {file.name.length > 30 ? `${file.name.substring(0, 30)}...` : file.name}
                    </p>
                    <p className="file-size">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => setFile(null)}
                  disabled={isLoading}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="upload-actions">
            <button
              className="analyze-btn"
              onClick={handleUpload}
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span className="btn-icon">🤖</span>
                  Start AI Analysis
                </>
              )}
            </button>
            
            <button
              className="reset-btn"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </button>
          </div>

          <div className="upload-tips">
            <h4>💡 Tips for best results:</h4>
            <ul>
              <li>Use a clean, well-formatted PDF resume</li>
              <li>Ensure text is selectable (not scanned image)</li>
              <li>Include your contact information</li>
              <li>List your skills and experience clearly</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="result-display">
          <div className="result-header">
            <h2>Analysis Complete!</h2>
            <button className="new-analysis-btn" onClick={handleReset}>
              <span className="btn-icon">🔄</span>
              Analyze Another Resume
            </button>
          </div>
          <AnalysisResult result={result} />
        </div>
      )}
    </div>
  );
}