// frontend/src/components/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

// HomePage now only shows home content, no auth forms
export default function HomePage({ isAuthenticated = false }) {
  const navigate = useNavigate();

  const goToAnalyzer = () => {
    if (isAuthenticated) {
      navigate('/analyze');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-icon">🤖</span>
            AI Resume Analyzer Pro
          </h1>
          <p className="hero-subtitle">
            Get instant resume feedback, career recommendations, and job matching
            powered by artificial intelligence
          </p>
          
          <div className="hero-cta">
            {isAuthenticated ? (
              <button className="primary-cta" onClick={goToAnalyzer}>
                <span className="cta-icon">🚀</span>
                Start Analyzing Now
              </button>
            ) : (
              <>
                <button className="primary-cta" onClick={() => navigate('/login')}>
                  <span className="cta-icon">🔑</span>
                  Login to Start
                </button>
                <button className="secondary-cta" onClick={() => navigate('/register')}>
                  <span className="cta-icon">📝</span>
                  Create Account
                </button>
              </>
            )}
            <button className="secondary-cta" onClick={() => {
              document.getElementById('about-section').scrollIntoView({ behavior: 'smooth' });
            }}>
              <span className="cta-icon">📖</span>
              Learn More
            </button>
          </div>
          
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Resumes Analyzed</span>
            </div>
            <div className="stat">
              <span className="stat-number">95%</span>
              <span className="stat-label">Accuracy Rate</span>
            </div>
            <div className="stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Career Fields</span>
            </div>
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">AI Support</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-card">
            <div className="card-content">
              <div className="card-icon">📄</div>
              <h3>Upload Resume</h3>
              <p>Get instant AI analysis</p>
            </div>
          </div>
          <div className="floating-card card-2">
            <div className="card-content">
              <div className="card-icon">📊</div>
              <h3>Get Scores</h3>
              <p>Detailed feedback</p>
            </div>
          </div>
          <div className="floating-card card-3">
            <div className="card-content">
              <div className="card-icon">🎯</div>
              <h3>Job Match</h3>
              <p>Find perfect jobs</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <div id="about-section" className="about-section">
          <div className="section-header">
            <h2>About AI Resume Analyzer</h2>
            <p>Revolutionizing resume analysis with artificial intelligence</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Smart Analysis</h3>
              <p>AI-powered parsing of your resume to extract skills, experience, and qualifications</p>
              <ul className="feature-list">
                <li>Automated skill extraction</li>
                <li>Experience level detection</li>
                <li>Career field prediction</li>
                <li>Contact information parsing</li>
              </ul>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Detailed Scoring</h3>
              <p>Get comprehensive scores and actionable insights for improvement</p>
              <ul className="feature-list">
                <li>Resume Score (0-100)</li>
                <li>ATS Compatibility Score</li>
                <li>Improvement tips & suggestions</li>
                <li>PDF report generation</li>
              </ul>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Career Guidance</h3>
              <p>Personalized recommendations based on your profile</p>
              <ul className="feature-list">
                <li>Recommended skills to learn</li>
                <li>Curated course lists with direct links</li>
                <li>Job market insights</li>
                <li>AI-powered job matching</li>
              </ul>
            </div>
          </div>
          
          <div className="workflow-section">
            <h3>How It Works</h3>
            <div className="workflow-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Upload Resume</h4>
                  <p>Upload your PDF resume through our secure portal</p>
                </div>
              </div>
              <div className="step-arrow">→</div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>AI Processing</h4>
                  <p>Our AI analyzes skills, experience, and qualifications</p>
                </div>
              </div>
              <div className="step-arrow">→</div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Get Results</h4>
                  <p>Receive detailed analysis and personalized recommendations</p>
                </div>
              </div>
              <div className="step-arrow">→</div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Take Action</h4>
                  <p>Use insights to improve resume and find matching jobs</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="tech-stack">
            <h3>Powered By Advanced Technology</h3>
            <div className="tech-icons">
              <span className="tech-item">FastAPI</span>
              <span className="tech-item">React</span>
              <span className="tech-item">Groq AI</span>
              <span className="tech-item">PyMuPDF</span>
              <span className="tech-item">spaCy NLP</span>
              <span className="tech-item">ReportLab</span>
            </div>
          </div>
          
          <div className="quick-start">
            <h3>Ready to Get Started?</h3>
            <p>Upload your resume now and get instant AI-powered analysis</p>
            {isAuthenticated ? (
              <button className="start-button" onClick={goToAnalyzer}>
                <span className="button-icon">🚀</span>
                Start Free Analysis
              </button>
            ) : (
              <div className="auth-buttons">
                <button className="start-button" onClick={() => navigate('/login')}>
                  <span className="button-icon">🔑</span>
                  Login to Continue
                </button>
                <button className="secondary-start-button" onClick={() => navigate('/register')}>
                  <span className="button-icon">📝</span>
                  Create Free Account
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>🤖 AI Resume Analyzer</h3>
            <p>Empowering careers with AI-driven insights</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#api">API</a>
            </div>
            <div className="link-group">
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#careers">Careers</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="link-group">
              <h4>Resources</h4>
              <a href="#docs">Documentation</a>
              <a href="#blog">Blog</a>
              <a href="#support">Support</a>
            </div>
          </div>
        </div>
        <div className="footer-copyright">
          © 2025 AI Resume Analyzer Pro. All rights reserved. | Made with ❤️ for job seekers worldwide
        </div>
      </footer>
    </div>
  );
}