import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api'; 
const API_BASE_URL = 'http://localhost:8000';

export default function LoginPage({ onLogin, isAuthenticated = false }) {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

const navigate = useNavigate();

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
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleOAuthLogin = (provider) => {
  window.location.href = `http://localhost:8000/api/auth/${provider}`;
};


const handleSubmit = async () => {
  if (!validateForm()) return;

  setIsLoading(true);
  try {
    const data = await login(formData.email, formData.password);
    onLogin?.(data.user);
    navigate('/analyze');
  } catch (error) {
    setErrors(prev => ({
      ...prev,
      submit: error.message || 'Login failed'
    }));
  } finally {
    setIsLoading(false);
  }
};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      {/* Back Button */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          navigate('/');
        }}
        type="button"
        className="mb-8 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors duration-200 group"
      >
        <span className="text-xl group-hover:-translate-x-1 transition-transform duration-200">←</span>
        <span className="font-medium">Back to Home</span>
      </button>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Logo and Title - Centered */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/ai-resume-analyzer.png" alt="AI Resume Analyzer" className="w-10 h-10" />
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              ResumeIQ
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-sm text-slate-600">Sign in to access your resume analysis dashboard</p>
        </div>
        
        {/* Form */}
        <div className="space-y-4">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-shake">
              <span className="text-2xl">⚠️</span>
              <span className="text-red-700 text-sm">{errors.submit}</span>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`w-full px-4 py-3 rounded-xl border text-slate-900 placeholder:text-gray-400 ${
                errors.email 
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
              } focus:ring-2 focus:outline-none transition-all duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed`}
              placeholder="Enter Your Email"
              value={formData.email}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            {errors.email && (
              <span className="text-red-600 text-sm mt-1 block">{errors.email}</span>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`w-full px-4 py-3 rounded-xl border text-slate-900 placeholder:text-gray-400 ${
                errors.password 
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
              } focus:ring-2 focus:outline-none transition-all duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed`}
              placeholder="Enter Your Password"
              value={formData.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            {errors.password && (
              <span className="text-red-600 text-sm mt-1 block">{errors.password}</span>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                disabled={isLoading}
              />
              <span className="text-slate-600 group-hover:text-slate-900">Remember me</span>
            </label>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/forgot-password');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot password?
            </button>
          </div>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit();
            }}
            type="button"
            className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => handleOAuthLogin("google")}
              className="w-12 h-12 rounded-full border border-slate-300 bg-white hover:bg-slate-50 transition-all duration-200 flex items-center justify-center text-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              title="Sign in with Google"
            >
              G
            </button>
            <button
              type="button"
              onClick={() => handleOAuthLogin("github")}
              className="w-12 h-12 rounded-full border border-slate-300 bg-white hover:bg-slate-50 transition-all duration-200 flex items-center justify-center text-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              title="Sign in with GitHub"
            >
              Git
            </button>
          </div>
          
          <p className="text-center text-sm text-slate-600 pt-4">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/register');
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Create one now
            </button>
          </p>
        </div>
      </div>
    </div>

    <style>{`
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      
      .animate-shake {
        animation: shake 0.3s ease-in-out;
      }
    `}</style>
  </div>
);
}