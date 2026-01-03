import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ResumeUpload from './components/ResumeUpload';
import Tabs from './components/Tabs';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          setIsAuthenticated(true);
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing user data:', e);
          localStorage.clear();
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Optional: Set up token refresh interval
    const refreshInterval = setInterval(() => {
      refreshToken();
    }, 30 * 60 * 1000); // Refresh every 30 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  // Function to refresh token
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken || !isAuthenticated) return;

    try {
      const response = await fetch('http://localhost:8000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        console.log('Token refreshed successfully');
      } else {
        // If refresh fails, logout
        handleLogout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    console.log('User logged in:', userData);
  };

  const handleRegister = (userData) => {
    // After registration, automatically login
    setIsAuthenticated(true);
    setUser(userData);
    console.log('User registered and logged in:', userData);
  };

  const handleLogout = () => {
    // Call logout API
    const token = localStorage.getItem('access_token');
    if (token) {
      fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).catch(console.error);
    }

    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Reset state
    setIsAuthenticated(false);
    setUser(null);
    setAnalysisResult(null);
    
    console.log('User logged out');
  };

  const handleAnalysisComplete = (result) => {
    console.log('Analysis complete:', result);
    setAnalysisResult(result);
  };

  const handleReset = () => {
    setAnalysisResult(null);
  };

  // Get user from localStorage if needed
  const getUserData = () => {
    if (user) return user;
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const currentUser = getUserData();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading ResumeIQ...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {/* Navbar on all pages */}
        <Navbar 
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          user={currentUser}
        />
        
        <Routes>
          {/* Home Page Route */}
          <Route 
            path="/" 
            element={
              <HomePage 
                isAuthenticated={isAuthenticated}
                user={currentUser}
              />
            } 
          />
          
          {/* Login Page Route */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/analyze" />
              ) : (
                <LoginPage 
                  onLogin={handleLogin}
                  isAuthenticated={isAuthenticated}
                />
              )
            } 
          />
          
          {/* Register Page Route */}
          <Route 
            path="/register" 
            element={
              isAuthenticated ? (
                <Navigate to="/analyze" />
              ) : (
                <RegisterPage 
                  onRegister={handleRegister}
                  isAuthenticated={isAuthenticated}
                />
              )
            } 
          />
          
          {/* Protected Analyze Route */}
          <Route 
            path="/analyze" 
            element={
              isAuthenticated ? (
                <>
                  {!analysisResult ? (
                    <ResumeUpload onResult={handleAnalysisComplete} />
                  ) : (
                    <div className="analysis-container">
                      <Tabs 
                        result={analysisResult} 
                        onReset={handleReset}
                      />
                    </div>
                  )}
                </>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          {/* Profile Page */}
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? (
                <div className="profile-container">
                  <div className="profile-header">
                    <h1>👤 Profile</h1>
                    <p>Manage your account and settings</p>
                  </div>
                  <div className="profile-content">
                    <div className="profile-card">
                      <div className="profile-info">
                        <div className="avatar">
                          {currentUser?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="user-details">
                          <h2>{currentUser?.name || 'User Name'}</h2>
                          <p className="user-email">{currentUser?.email || 'user@example.com'}</p>
                          <p className="user-role">Premium Member</p>
                        </div>
                      </div>
                      
                      <div className="profile-stats">
                        <div className="stat">
                          <span className="stat-number">
                            {currentUser?.resume_count || '0'}
                          </span>
                          <span className="stat-label">Resumes Analyzed</span>
                        </div>
                        <div className="stat">
                          <span className="stat-number">
                            {currentUser?.subscription_tier === 'pro' ? 'Pro' : 'Free'}
                          </span>
                          <span className="stat-label">Plan</span>
                        </div>
                        <div className="stat">
                          <span className="stat-number">
                            {currentUser?.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="stat-label">Status</span>
                        </div>
                      </div>
                      
                      <div className="profile-actions">
                        <button className="profile-btn">
                          <span className="btn-icon">📝</span>
                          Edit Profile
                        </button>
                        <button className="profile-btn">
                          <span className="btn-icon">🔒</span>
                          Change Password
                        </button>
                        <button className="profile-btn">
                          <span className="btn-icon">📊</span>
                          View Analytics
                        </button>
                        <button className="profile-btn danger" onClick={handleLogout}>
                          <span className="btn-icon">🚪</span>
                          Logout
                        </button>
                      </div>
                    </div>
                    
                    <div className="profile-sections">
                      <div className="section">
                        <h3>📄 Resume History</h3>
                        <div className="resume-list">
                          {/* This would be populated from API */}
                          <div className="resume-item">
                            <span className="resume-name">No resume history yet</span>
                            <span className="resume-score">Upload a resume!</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="section">
                        <h3>🎯 Recommended Courses</h3>
                        <div className="courses-list">
                          <div className="course-item">
                            <span className="course-name">Advanced Resume Writing</span>
                            <span className="course-status">Recommended</span>
                          </div>
                          <div className="course-item">
                            <span className="course-name">Interview Preparation</span>
                            <span className="course-status">Recommended</span>
                          </div>
                          <div className="course-item">
                            <span className="course-name">Career Development</span>
                            <span className="course-status">Recommended</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="section">
                        <h3>⚙️ Account Settings</h3>
                        <div className="settings-list">
                          <div className="setting-item">
                            <span>Email Notifications</span>
                            <label className="toggle-switch">
                              <input type="checkbox" defaultChecked />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                          <div className="setting-item">
                            <span>Dark Mode</span>
                            <label className="toggle-switch">
                              <input type="checkbox" />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                          <div className="setting-item">
                            <span>Auto-save Analysis</span>
                            <label className="toggle-switch">
                              <input type="checkbox" defaultChecked />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          {/* Redirect any other route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;