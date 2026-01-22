import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';
const API_BASE_URL = 'http://localhost:8000';

export default function RegisterPage({ onRegister, isAuthenticated = false }) {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

   const navigate = useNavigate(); 

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'Full name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s.'-]+$/.test(name)) return 'Please enter a valid name';
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) return 'Must contain letter and number';
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
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must accept the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOAuthRegister = (provider) => {
  window.location.href = `http://localhost:8000/api/auth/${provider}`;
};


    const handleSubmit = async () => {
      if (!validateForm()) return;
      setIsLoading(true);

      try {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword
        });
        // ✅ After successful registration → go to LOGIN
        navigate('/login');

      } catch (error) {
        setErrors(prev => ({
          ...prev,
          submit: error.message || 'Registration failed'
        }));
      } finally {
        setIsLoading(false);
      }
    };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid lg:grid-cols-2">
          {/* Left Side - Form */}
          <div className="p-8 lg:p-12">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/');
              }}
              type="button"
              className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors duration-200 group"
            >
              <span className="text-xl group-hover:-translate-x-1 transition-transform duration-200">←</span>
              <span className="font-medium">Back to Home</span>
            </button>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <img src="/ai-resume-analyzer.png" alt="AI Resume Analyzer" className="w-12 h-12" />
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  ResumeIQ
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Create Account</h1>
              <p className="text-slate-600">Join thousands of professionals optimizing their resumes</p>
            </div>
            
            <div className="space-y-5">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-shake">
                  <span className="text-2xl">⚠️</span>
                  <span className="text-red-700 text-sm">{errors.submit}</span>
                </div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`w-full px-4 py-3 rounded-xl border text-slate-900 placeholder:text-gray-500 ${
                    errors.name 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  } focus:ring-2 focus:outline-none transition-all duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed`}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                {errors.name && (
                  <span className="text-red-600 text-sm mt-1 block">{errors.name}</span>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`w-full px-4 py-3 rounded-xl border text-slate-900 placeholder:text-gray-500 ${
                    errors.email 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  } focus:ring-2 focus:outline-none transition-all duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed`}
                  placeholder="Enter the Email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                {errors.email && (
                  <span className="text-red-600 text-sm mt-1 block">{errors.email}</span>
                )}
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={`w-full px-4 py-3 rounded-xl border text-slate-900 placeholder:text-gray-500 ${
                      errors.password 
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                    } focus:ring-2 focus:outline-none transition-all duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed`}
                    placeholder="Enter the Password"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <span className="text-red-600 text-sm mt-1 block">{errors.password}</span>
                  )}
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`w-full px-4 py-3 rounded-xl border text-slate-900 placeholder:text-gray-500 ${
                      errors.confirmPassword 
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                    } focus:ring-2 focus:outline-none transition-all duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed`}
                    placeholder="Confirm the Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <span className="text-red-600 text-sm mt-1 block">{errors.confirmPassword}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <input 
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  disabled={isLoading}
                />
                <label htmlFor="agreeTerms" className="text-sm text-slate-600">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/terms');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/privacy');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
              {errors.agreeTerms && (
                <span className="text-red-600 text-sm block -mt-2">{errors.agreeTerms}</span>
              )}
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit();
                }}
                type="button"
                className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Create My Account</span>
                  </>
                )}
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500">Or continue with</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => handleOAuthRegister("google")}
                    className="py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    <span>Google</span>
                  </button>

                <button
                  type="button"
                  onClick={() => handleOAuthRegister("github")}
                  className="py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  <span>GitHub</span>
                </button>
              </div>
              
              <p className="text-center text-slate-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate('/login');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
          
          {/* Right Side - Features */}
          <div className="hidden lg:block bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white">
            <div className="h-full flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-8">Why Join ResumeIQ?</h2>
              
              <div className="space-y-6 mb-12">
                {[
                  {
                    icon: '✨',
                    title: 'AI-Powered Analysis',
                    desc: 'Get instant, detailed feedback on your resume with cutting-edge AI'
                  },
                  {
                    icon: '📊',
                    title: 'ATS Optimization',
                    desc: 'Ensure your resume passes Applicant Tracking Systems'
                  },
                  {
                    icon: '🎯',
                    title: 'Job Matching',
                    desc: 'Find opportunities that perfectly match your skills and experience'
                  },
                  {
                    icon: '📈',
                    title: 'Track Progress',
                    desc: 'Monitor improvements and see your resume score increase over time'
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
                      <p className="text-blue-100 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-lg mb-4 italic">
                  "ResumeIQ transformed my job search. Within a week of optimizing my resume, I had three interview calls!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                    👨
                  </div>
                  <div>
                    <div className="font-bold">Michael Chen</div>
                    <div className="text-sm text-blue-100">Product Manager at Microsoft</div>
                  </div>
                </div>
              </div>
            </div>
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