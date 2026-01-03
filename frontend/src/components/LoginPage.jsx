// frontend/src/components/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AuthPage.css';

// Vite uses import.meta.env, not process.env
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function LoginPage({ onLogin, isAuthenticated }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (email.length > 100) return 'Email is too long';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password.length > 50) return 'Password is too long';
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // REAL API CALL
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Save tokens and user data
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call parent callback
        onLogin?.(data.user);
        
        // Navigate to analyze page
        navigate('/analyze');
      } else {
        // Handle API errors
        throw new Error(data.detail || 'Login failed');
      }
      
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Invalid email or password. Please try again.'
      }));
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-header">
            <button className="back-home" onClick={() => navigate('/')}>
              ← Back to Home
            </button>
            <div className="brand-logo">
              <span className="logo-icon">🤖</span>
              <span className="logo-text">ResumeIQ</span>
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to access your resume analysis dashboard</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {errors.submit && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {errors.submit}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            
            <div className="form-options">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="remember"
                  disabled={isLoading}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
            
            <div className="divider">
              <span>Or continue with</span>
            </div>
            
            <div className="social-login">
              <button 
                type="button" 
                className="social-btn google"
                disabled={isLoading}
              >
                <span className="social-icon">G</span>
                Google
              </button>
              <button 
                type="button" 
                className="social-btn github"
                disabled={isLoading}
              >
                <span className="social-icon">Git</span>
                GitHub
              </button>
            </div>
            
            <p className="auth-footer">
              Don't have an account?{' '}
              <Link to="/register" className="switch-link">
                Create one now
              </Link>
            </p>
          </form>
        </div>
        
        <div className="auth-right">
          <div className="auth-features">
            <h2>Why Sign In?</h2>
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">📁</div>
                <div>
                  <h4>Save & Manage Resumes</h4>
                  <p>Store multiple resumes and track changes over time</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">📈</div>
                <div>
                  <h4>Track Progress</h4>
                  <p>Monitor your resume improvement journey</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">💼</div>
                <div>
                  <h4>Job Recommendations</h4>
                  <p>Get personalized job matches based on your profile</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <div>
                  <h4>Advanced Analytics</h4>
                  <p>Access detailed insights and improvement suggestions</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial">
              <p>"This tool helped me improve my resume score from 65 to 92! Landed 3 interviews in 2 weeks."</p>
              <div className="testimonial-author">
                <span className="author-name">Sarah Johnson</span>
                <span className="author-role">Software Engineer at Google</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}