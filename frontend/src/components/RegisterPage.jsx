// frontend/src/components/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AuthPage.css';

// Vite uses import.meta.env, not process.env
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function RegisterPage({ onRegister, isAuthenticated }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'Full name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (name.length > 50) return 'Name is too long';
    // Allow letters, spaces, and common name characters
    if (!/^[a-zA-Z\s.'-]+$/.test(name)) return 'Please enter a valid name';
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (email.length > 100) return 'Email is too long';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password.length > 50) return 'Password is too long';
    // Check for at least one letter and one number
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one letter and one number';
    }
    return '';
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    
    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    const confirmError = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmError) newErrors.confirmPassword = confirmError;
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Save tokens and user data
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call parent callback
        onRegister?.(data.user);
        
        // Show success message and navigate
        alert('Registration successful! Welcome to ResumeIQ.');
        navigate('/analyze');
      } else {
        // Handle specific API errors
        let errorMessage = data.detail || 'Registration failed. Please try again.';
        
        // Check for duplicate email error
        if (errorMessage.toLowerCase().includes('already') || response.status === 409) {
          errorMessage = 'This email is already registered. Please use a different email or try logging in.';
        }
        
        throw new Error(errorMessage);
      }
      
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.message
      }));
      console.error('Registration error:', error);
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
            <h1>Create Account</h1>
            <p>Start your journey to better career opportunities</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {errors.submit && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {errors.submit}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            
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
              <div className="password-hint">
                Must be at least 8 characters with letters and numbers
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>
            
            <div className="form-options">
              <label className={`checkbox-label ${errors.agreeTerms ? 'error' : ''}`}>
                <input 
                  type="checkbox" 
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span>
                  I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                </span>
              </label>
              {errors.agreeTerms && (
                <span className="error-text">{errors.agreeTerms}</span>
              )}
            </div>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
            
            <p className="auth-footer">
              Already have an account?{' '}
              <Link to="/login" className="switch-link">
                Sign in here
              </Link>
            </p>
          </form>
        </div>
        
        <div className="auth-right">
          <div className="auth-features">
            <h2>What You'll Get</h2>
            
            <div className="tier-card free">
              <div className="tier-header">
                <h3>Free Tier</h3>
                <div className="price">$0/month</div>
              </div>
              <ul className="tier-features">
                <li className="feature-included">✓ 5 Resume Analyses per month</li>
                <li className="feature-included">✓ Basic AI Recommendations</li>
                <li className="feature-included">✓ PDF Report Generation</li>
                <li className="feature-included">✓ Course Suggestions</li>
                <li className="feature-included">✓ Job Matching</li>
                <li className="feature-excluded">✗ Advanced Analytics</li>
                <li className="feature-excluded">✗ Unlimited Resumes</li>
                <li className="feature-excluded">✗ Priority Support</li>
              </ul>
              <p className="tier-note">
                Perfect for students and job seekers starting their career
              </p>
            </div>
            
            <div className="tier-card pro">
              <div className="tier-header">
                <h3>Pro Tier</h3>
                <div className="price">$9.99/month</div>
              </div>
              <ul className="tier-features">
                <li className="feature-included">✓ Unlimited Resume Analyses</li>
                <li className="feature-included">✓ Advanced AI Recommendations</li>
                <li className="feature-included">✓ Premium PDF Reports</li>
                <li className="feature-included">✓ Personalized Course Roadmaps</li>
                <li className="feature-included">✓ Advanced Job Matching</li>
                <li className="feature-included">✓ Detailed Analytics Dashboard</li>
                <li className="feature-included">✓ Priority Support</li>
                <li className="feature-included">✓ Resume History Tracking</li>
              </ul>
              <button className="upgrade-btn" disabled={isLoading}>
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
