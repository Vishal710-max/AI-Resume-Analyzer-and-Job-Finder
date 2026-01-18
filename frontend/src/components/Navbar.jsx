// frontend/src/components/Navbar.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ isAuthenticated, onLogout, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // FIXED: When clicking Home, navigate to clean URL without query params
  const handleHomeClick = () => {
    navigate('/'); // Navigate to clean home URL
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout?.();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand" onClick={handleHomeClick}>
          <span className="brand-icon">🤖</span>
          <span className="brand-text">ResumeIQ</span>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links">
          {/* FIXED: Use handleHomeClick instead of handleNavigate('/') */}
          <button 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={handleHomeClick}
          >
            <span className="nav-icon">🏠</span>
            Home
          </button>
          
          {isAuthenticated ? (
            <>
              <button 
                className={`nav-link ${location.pathname === '/analyze' ? 'active' : ''}`}
                onClick={() => handleNavigate('/analyze')}
              >
                <span className="nav-icon">📊</span>
                Analyze Resume
              </button>
              
              <button 
                className="nav-link"
                onClick={() => handleNavigate('/profile')}
              >
                <span className="nav-icon">👤</span>
                {user?.name || 'Profile'}
              </button>
              
              <button 
                className="nav-link logout-btn"
                onClick={handleLogout}
              >
                <span className="nav-icon">🚪</span>
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                onClick={() => handleNavigate('/login')}
              >
                <span className="nav-icon">🔑</span>
                Login
              </button>
              
              <button 
                className={`nav-link register-btn ${location.pathname === '/register' ? 'active' : ''}`}
                onClick={() => handleNavigate('/register')}
              >
                <span className="nav-icon">📝</span>
                Register
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            {/* FIXED: Use handleHomeClick for mobile too */}
            <button 
              className={`mobile-link ${location.pathname === '/' ? 'active' : ''}`}
              onClick={handleHomeClick}
            >
              <span className="nav-icon">🏠</span>
              Home
            </button>
            
            {isAuthenticated ? (
              <>
                <button 
                  className={`mobile-link ${location.pathname === '/analyze' ? 'active' : ''}`}
                  onClick={() => handleNavigate('/analyze')}
                >
                  <span className="nav-icon">📊</span>
                  Analyze Resume
                </button>
                
                <button 
                  className="mobile-link"
                  onClick={() => handleNavigate('/profile')}
                >
                  <span className="nav-icon">👤</span>
                  Profile
                </button>
                
                <button 
                  className="mobile-link logout-btn"
                  onClick={handleLogout}
                >
                  <span className="nav-icon">🚪</span>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  className={`mobile-link ${location.pathname === '/login' ? 'active' : ''}`}
                  onClick={() => handleNavigate('/login')}
                >
                  <span className="nav-icon">🔑</span>
                  Login
                </button>
                
                <button 
                  className={`mobile-link register-btn ${location.pathname === '/register' ? 'active' : ''}`}
                  onClick={() => handleNavigate('/register')}
                >
                  <span className="nav-icon">📝</span>
                  Register
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}