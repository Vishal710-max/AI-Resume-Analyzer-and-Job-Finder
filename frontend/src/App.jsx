import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ResumeUpload from './components/ResumeUpload';
import Tabs from './components/Tabs';
import Navbar from './components/Navbar';
import { updateProfile } from './api';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    location: '',
    timezone: '',
    profile_picture: ''
  });
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');



// 1️⃣ Check auth on app load
useEffect(() => {
  const token = localStorage.getItem('access_token');
  const storedUser = localStorage.getItem('user');

  if (token && storedUser) {
    try {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
      setLoading(false);
    } catch (e) {
      console.error('Error parsing user data:', e);
      localStorage.clear();
      setLoading(false);
    }
  } else if (token) {
    // Token exists but user not stored (OAuth users case)
    // Fetch user profile from backend
    fetch('http://localhost:8000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch user');
      })
      .then(userData => {
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      })
      .catch(err => {
        console.error('Failed to fetch user profile:', err);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      })
      .finally(() => setLoading(false));
  } else {
    setLoading(false);
  }
}, []);


// 2️⃣ Handle OAuth redirect token
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    localStorage.setItem("access_token", token);
    
    // Fetch user profile from /me endpoint
    fetch('http://localhost:8000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch user');
      })
      .then(userData => {
        // Only set authenticated after /me succeeds
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      })
      .catch(err => {
        console.error('Failed to fetch user profile after OAuth:', err);
        // Clear token if we can't fetch user
        localStorage.removeItem('access_token');
      });
    
    window.history.replaceState({}, document.title, "/analyze");
  }
}, []);


// 3️⃣ Refresh token interval
useEffect(() => {
  if (!isAuthenticated) return;

  const refreshInterval = setInterval(() => {
    refreshToken();
  }, 30 * 60 * 1000);

  return () => clearInterval(refreshInterval);
}, [isAuthenticated]);


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

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };

const SettingToggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 transition-all">
    <span className="text-slate-800 font-medium">
      {label}
    </span>

    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-slate-300 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
    </label>
  </div>
);


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

  // Open edit profile modal with current user data
  const handleEditProfileClick = () => {
    setEditFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location || '',
      timezone: user?.timezone || '',
      profile_picture: user?.profile_picture || ''
    });
    setProfileImagePreview(user?.profile_picture || '');
    setEditError('');
    setShowEditProfileModal(true);
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setEditError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setEditError('Image size must be less than 5MB');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        setProfileImagePreview(base64String);
        setEditFormData(prev => ({
          ...prev,
          profile_picture: base64String
        }));
        setEditError('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit edit profile form
  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');

    try {
      // Filter out empty fields
      const updateData = {};
      Object.keys(editFormData).forEach(key => {
        if (editFormData[key]) {
          updateData[key] = editFormData[key];
        }
      });

      // Call API to update profile
      const updatedUser = await updateProfile(updateData);
      
      // Update state and localStorage
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Close modal and reset preview
      setShowEditProfileModal(false);
      setProfileImagePreview('');
      alert('✅ Profile updated successfully!');
      
    } catch (error) {
      setEditError(error.message || 'Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setEditLoading(false);
    }
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
      <div className="App min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300">
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
              <div className="max-w-7xl mx-auto">
                {/* Profile Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                    <span className="text-4xl">👤</span>
                    Profile
                  </h1>
                  <p className="text-slate-600">Manage your account and settings</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Main Profile Card */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                      {/* Profile Info */}
                      <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg overflow-hidden">
                          {currentUser?.profile_picture ? (
                            <img src={currentUser.profile_picture} alt={currentUser?.name} className="w-full h-full object-cover" />
                          ) : (
                            currentUser?.name?.charAt(0) || 'U'
                          )}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">
                          {currentUser?.name || 'User Name'}
                        </h2>
                        <p className="text-slate-600 text-sm mb-2">
                          {currentUser?.email || 'user@example.com'}
                        </p>
                        <span className="px-4 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-medium">
                          Premium Member
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-1 gap-4 mb-6 pb-6 border-b border-slate-200">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 text-center border border-blue-200">
                          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            {currentUser?.resume_count || '0'}
                          </div>
                          <div className="text-sm text-slate-600 font-medium mt-1">
                            Resumes Analyzed
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 text-center border border-blue-200">
                          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            {currentUser?.subscription_tier === 'pro' ? 'Pro' : 'Free'}
                          </div>
                          <div className="text-sm text-slate-600 font-medium mt-1">
                            Plan
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 text-center border border-green-200">
                          <div className="text-2xl font-bold text-green-600">
                            {currentUser?.is_active ? 'Active' : 'Inactive'}
                          </div>
                          <div className="text-sm text-slate-600 font-medium mt-1">
                            Status
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <button 
                          onClick={handleEditProfileClick}
                          className="w-full px-4 py-3 bg-white text-slate-700 hover:text-slate-900 rounded-lg font-medium border border-slate-300 hover:border-slate-400 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2">
                          <span className="text-lg">✏️</span>
                          <span>Edit Profile</span>
                        </button>
                        <button 
                          onClick={handleUpgradeClick}
                          className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
                          <span className="text-lg">⭐</span>
                          <span>Upgrade to Pro</span>
                        </button>
                        <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
                          <span className="text-lg">📈</span>
                          <span>View Analytics</span>
                        </button>
                        <button 
                          className="w-full px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium border border-red-200 hover:border-red-300 transition-all duration-200 flex items-center justify-center gap-2"
                          onClick={handleLogout}
                        >
                          <span className="text-lg">🚪</span>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Sections */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Resume History */}
                    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">💼</span>
                        Resume History
                      </h3>
                      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 text-center">
                        <div className="text-slate-600 mb-2">Resume history is available on the Pro plan</div>
                        <div className="text-sm text-slate-500">Upgrade to Pro to unlock full resume history & insights.</div>
                        <button className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200">
                          Upload Resume
                        </button>
                      </div>
                    </div>

                    {/* Recommended Courses */}
                    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">🎓</span>
                        Recommended Courses
                      </h3>
                      <div className="space-y-3">
                        {[
                          { name: 'Advanced Resume Writing', status: 'Recommended' },
                          { name: 'Interview Preparation', status: 'Recommended' },
                          { name: 'Career Development', status: 'Recommended' }
                        ].map((course, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-200"
                          >
                            <span className="text-slate-800 font-medium">{course.name}</span>
                            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                              {course.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Account Settings */}
                  <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="text-2xl">⚙️</span>
                      Account Settings
                    </h3>

                    <div className="space-y-4">
                      {/* Email Notifications */}
                      <SettingToggle 
                        label="Email Notifications" 
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                      />

                      {/* Auto-save Analysis */}
                      <SettingToggle 
                        label="Auto-save Analysis" 
                        checked={autoSave}
                        onChange={(e) => setAutoSave(e.target.checked)}
                      />
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

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
              <div className="text-center">
                <div className="text-5xl mb-4">⭐</div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Pro Features Coming Soon</h2>
                <p className="text-slate-600 mb-6">
                  We're working on exciting premium features to take your resume to the next level!
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-slate-700">
                  <p className="font-semibold mb-2">What's Coming:</p>
                  <ul className="space-y-1 text-left">
                    <li>✓ Unlimited resume history</li>
                    <li>✓ Advanced analytics & insights</li>
                    <li>✓ Priority job matching</li>
                  </ul>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Got It!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {showEditProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-2xl">✏️</span>
                  Edit Profile
                </h2>
                <button
                  onClick={() => setShowEditProfileModal(false)}
                  className="text-slate-500 hover:text-slate-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {editError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {editError}
                </div>
              )}

              <form onSubmit={handleEditProfileSubmit} className="space-y-5">
                
                {/* Profile Picture Upload */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <label className="block text-sm font-medium text-slate-700 mb-4">
                    Profile Picture
                  </label>
                  
                  <div className="flex gap-6 items-start">
                    {/* Current/Preview Image */}
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-blue-300 flex items-center justify-center bg-white shadow-md mb-3">
                        {profileImagePreview ? (
                          <img src={profileImagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <div className="text-4xl mb-2">
                              {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="text-xs text-slate-500">No image</div>
                          </div>
                        )}
                      </div>
                      {profileImagePreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileImagePreview('');
                            setEditFormData(prev => ({
                              ...prev,
                              profile_picture: ''
                            }));
                          }}
                          className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    {/* Upload Section */}
                    <div className="flex-1">
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:bg-blue-100 transition">
                          <div className="text-3xl mb-2">📸</div>
                          <p className="text-sm font-medium text-slate-700">Click to upload</p>
                          <p className="text-xs text-slate-500 mt-1">or drag and drop</p>
                          <p className="text-xs text-slate-400 mt-2">PNG, JPG, GIF (Max 5MB)</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    minLength="2"
                    maxLength="100"
                  />
                </div>

                {/* Email Field - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email (Cannot be changed)
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email is used for login and cannot be modified</p>
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditInputChange}
                    placeholder="e.g., +1234567890"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">Format: +1234567890 or 1234567890</p>
                </div>

                {/* Bio/Professional Summary */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Professional Summary / Bio
                  </label>
                  <textarea
                    name="bio"
                    value={editFormData.bio}
                    onChange={handleEditInputChange}
                    placeholder="Write a brief professional summary (max 500 characters)"
                    rows="4"
                    maxLength="500"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  ></textarea>
                  <p className="text-xs text-slate-500 mt-1">{editFormData.bio?.length || 0}/500 characters</p>
                </div>

                {/* Location Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={editFormData.location}
                    onChange={handleEditInputChange}
                    placeholder="e.g., New York, USA"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength="100"
                  />
                </div>

                {/* Timezone Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={editFormData.timezone}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">-- Select Timezone --</option>
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="GMT">GMT (Greenwich Mean Time)</option>
                    <option value="EST">EST (Eastern Standard Time - UTC-5)</option>
                    <option value="CST">CST (Central Standard Time - UTC-6)</option>
                    <option value="MST">MST (Mountain Standard Time - UTC-7)</option>
                    <option value="PST">PST (Pacific Standard Time - UTC-8)</option>
                    <option value="IST">IST (Indian Standard Time - UTC+5:30)</option>
                    <option value="JST">JST (Japan Standard Time - UTC+9)</option>
                    <option value="AEST">AEST (Australian Eastern Standard Time - UTC+10)</option>
                    <option value="UTC+1">UTC+1</option>
                    <option value="UTC+2">UTC+2</option>
                    <option value="UTC+3">UTC+3</option>
                    <option value="UTC+4">UTC+4</option>
                    <option value="UTC+5">UTC+5</option>
                    <option value="UTC+6">UTC+6</option>
                    <option value="UTC+7">UTC+7</option>
                    <option value="UTC+8">UTC+8</option>
                    <option value="UTC-5">UTC-5</option>
                    <option value="UTC-6">UTC-6</option>
                    <option value="UTC-7">UTC-7</option>
                    <option value="UTC-8">UTC-8</option>
                  </select>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {editLoading ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditProfileModal(false)}
                    disabled={editLoading}
                    className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-all duration-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;