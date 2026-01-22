import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ isAuthenticated = false, onLogout, user }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const navigate = useNavigate();

  const handleHomeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/');
  };

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onLogout?.();
    navigate('/');
  };



return (
  <>
    {/* Spacer */}
    <div style={{ height: '64px' }} />

    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgb(226,232,240)',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.06)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* TOP BAR */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
          }}
        >
          {/* Brand */}
          <button
            onClick={handleHomeClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            <img src="/ai-resume-analyzer.png" alt="AI Resume Analyzer" style={{ width: '1.8rem', height: '1.8rem' }} />
            <span
              style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                backgroundImage:
                  'linear-gradient(90deg, rgb(37,99,235), rgb(79,70,229))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              ResumeIQ
            </span>
          </button>

          {/* Desktop Nav */}
          <div
            className="desktop-nav"
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <NavButton icon="🏠" label="Home" onClick={handleHomeClick} />

            {isAuthenticated ? (
              <>
                <NavButton
                  icon="📊"
                  label="Analyze Resume"
                  onClick={() => navigate('/analyze')}
                />
                <NavButton
                  icon="👤"
                  label={user?.name || 'Profile'}
                  onClick={() => navigate('/profile')}
                />
              </>
            ) : (
              <>
                <NavButton
                  icon="🔑"
                  label="Login"
                  onClick={() => navigate('/login')}
                />
                <NavButton
                  icon="📝"
                  label="Register"
                  onClick={() => navigate('/register')}
                  variant="primary"
                />
              </>
            )}

            {isAuthenticated && (
              <NavButton
                icon="🚪"
                label="Logout"
                onClick={handleLogout}
                variant="danger"
              />
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'transparent',
              color: 'rgb(100,116,139)',
              cursor: 'pointer',
            }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(255,255,255,0.95)',
              boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            <MobileNavButton icon="🏠" label="Home" onClick={handleHomeClick} />

            {isAuthenticated ? (
              <>
                <MobileNavButton icon="📊" label="Analyze Resume" onClick={() => navigate('/analyze')} />
                <MobileNavButton icon="👤" label="Profile" onClick={() => navigate('/profile')} />
                <MobileNavButton icon="🚪" label="Logout" onClick={handleLogout} variant="danger" />
              </>
            ) : (
              <>
                <MobileNavButton icon="🔑" label="Login" onClick={() => navigate('/login')} />
                <MobileNavButton icon="📝" label="Register" onClick={() => navigate('/register')} variant="primary" />
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none; }
          .mobile-menu-button { display: block; }
        }
      `}</style>
    </nav>
  </>
);


/* ---------- Desktop Button ---------- */
function NavButton({ icon, label, onClick, isActive, variant = 'default' }) {
  const [hover, setHover] = useState(false);

  const base = {
    padding: '0.45rem 0.9rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontWeight: 500,
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  };

  let style = { ...base };

  if (variant === 'primary') {
    style = {
      ...style,
      background: 'linear-gradient(to right, rgb(37,99,235), rgb(79,70,229))',
      color: 'white',
      boxShadow: hover ? '0 8px 15px rgb(0 0 0 / 0.12)' : '0 4px 6px rgb(0 0 0 / 0.1)',
      transform: hover ? 'translateY(-1px)' : 'none',
    };
  } else if (variant === 'danger') {
    style = {
      ...style,
      color: 'rgb(220,38,38)',
      backgroundColor: hover ? 'rgb(254,242,242)' : 'transparent',
    };
  } else {
    style = {
      ...style,
      backgroundColor: isActive
        ? 'rgb(239,246,255)'
        : hover
        ? 'rgb(241,245,249)'
        : 'transparent',
      color: isActive ? 'rgb(37,99,235)' : hover ? 'rgb(15,23,42)' : 'rgb(100,116,139)',
    };
  }

  return (
    <button
      onClick={onClick}
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span style={{ fontSize: '1.05rem' }}>{icon}</span>
      {label}
    </button>
  );
}

/* ---------- Mobile Button ---------- */
function MobileNavButton({ icon, label, onClick, variant = 'default' }) {
  const [hover, setHover] = useState(false);

  let style = {
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontWeight: 500,
    width: '100%',
    backgroundColor: hover ? 'rgb(241,245,249)' : 'transparent',
    color: 'rgb(71,85,105)',
    transition: 'all 0.2s',
  };

  if (variant === 'primary') {
    style = {
      ...style,
      background: 'linear-gradient(to right, rgb(37,99,235), rgb(79,70,229))',
      color: 'white',
    };
  }

  if (variant === 'danger') {
    style = {
      ...style,
      color: 'rgb(220,38,38)',
      backgroundColor: hover ? 'rgb(254,242,242)' : 'transparent',
    };
  }

  return (
    <button
      onClick={onClick}
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      {label}
    </button>
  );
}
}
