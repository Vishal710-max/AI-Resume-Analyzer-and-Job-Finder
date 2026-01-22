import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export default function HomePage({ isAuthenticated = false }) {
  const navigate = useNavigate(); 
  const goToAnalyzer = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isAuthenticated) {
      navigate('/analyze');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 relative">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Hero Content */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                <img src="/ai-resume-analyzer.png" alt="AI Resume Analyzer" className="w-5 h-5" />
                <span>AI-Powered Career Intelligence</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                AI Resume Analyzer
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Pro
                </span>
              </h1>
              
              <p className="text-base text-slate-600 leading-relaxed">
                Get instant resume feedback, career recommendations, and job matching powered by artificial intelligence
              </p>
              
              <div className="flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <button 
                    className="group px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm"
                    onClick={goToAnalyzer}
                    type="button"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">🚀</span>
                    Start Analyzing Now
                  </button>
                ) : (
                  <>
                    <button 
                      className="group px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/login');
                      }}
                      type="button"
                    >
                      <span className="text-base group-hover:scale-110 transition-transform">🔑</span>
                      Login to Start
                    </button>
                    <button 
                      className="group px-6 py-2.5 bg-white text-slate-900 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 border border-slate-200 text-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/register');
                      }}
                      type="button"
                    >
                      <span className="text-base group-hover:scale-110 transition-transform">📝</span>
                      Create Account
                    </button>
                  </>
                )}
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 pt-6">
                {[
                  { number: '1000+', label: 'Resumes' },
                  { number: '95%', label: 'Accuracy' },
                  { number: '50+', label: 'Fields' },
                  { number: '24/7', label: 'Support' }
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      {stat.number}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="relative hidden lg:block">
              <div className="space-y-3">
                {[
                  { icon: '📄', title: 'Upload Resume', desc: 'Get instant AI analysis' },
                  { icon: '📊', title: 'Get Scores', desc: 'Detailed feedback' },
                  { icon: '🎯', title: 'Job Match', desc: 'Find perfect jobs' }
                ].map((card, idx) => (
                  <div 
                    key={idx}
                    className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{card.icon}</div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">{card.title}</h3>
                        <p className="text-slate-600 text-xs mt-0.5">{card.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div id="about-section" className="space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              About AI Resume Analyzer
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              Revolutionizing resume analysis with artificial intelligence
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: '🔍',
                title: 'Smart Analysis',
                desc: 'AI-powered parsing of your resume to extract skills, experience, and qualifications',
                features: ['Skill extraction', 'Experience detection', 'Career prediction', 'Contact parsing']
              },
              {
                icon: '📊',
                title: 'Detailed Scoring',
                desc: 'Get comprehensive scores and actionable insights for improvement',
                features: ['Resume Score', 'ATS Compatibility', 'Tips & suggestions', 'PDF reports']
              },
              {
                icon: '🎯',
                title: 'Career Guidance',
                desc: 'Personalized recommendations based on your profile',
                features: ['Skills to learn', 'Course lists', 'Job insights', 'Job matching']
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="group bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-slate-100"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-xs mb-3">{feature.desc}</p>
                <ul className="space-y-1.5">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700 text-xs">
                      <span className="text-blue-600 text-sm mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          {/* Workflow Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-slate-900 text-center mb-6">How It Works</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { num: '1', title: 'Upload Resume', desc: 'Upload your PDF resume securely' },
                { num: '2', title: 'AI Processing', desc: 'Our AI analyzes your content' },
                { num: '3', title: 'Get Results', desc: 'Receive detailed analysis' },
                { num: '4', title: 'Take Action', desc: 'Improve and find jobs' }
              ].map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg flex items-center justify-center text-sm font-bold mb-3">
                      {step.num}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h4>
                    <p className="text-slate-600 text-xs">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Tech Stack */}
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Powered By Advanced Technology</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['FastAPI', 'React', 'Groq AI', 'PyMuPDF', 'spaCy NLP', 'ReportLab'].map((tech, idx) => (
                <span 
                  key={idx}
                  className="px-4 py-2 bg-white text-slate-700 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 border border-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white shadow-xl">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Get Started?</h3>
            <p className="text-sm text-blue-100 mb-6 max-w-2xl mx-auto">
              Upload your resume now and get instant AI-powered analysis
            </p>
            {isAuthenticated ? (
              <button 
                className="group px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 inline-flex items-center gap-2"
                onClick={goToAnalyzer}
                type="button"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">🚀</span>
                Start Free Analysis
              </button>
            ) : (
              <div className="flex flex-wrap justify-center gap-3">
                <button 
                  className="group px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 inline-flex items-center gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate('/login');
                  }}
                  type="button"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">🔑</span>
                  Login to Continue
                </button>
                <button 
                  className="group px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 inline-flex items-center gap-2 border-2 border-white"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate('/register');
                  }}
                  type="button"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">📝</span>
                  Create Free Account
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <img src="/ai-resume-analyzer.png" alt="AI Resume Analyzer" className="w-6 h-6" /> AI Resume Analyzer
              </h3>
              <p className="text-slate-400 text-sm">Empowering careers with AI-driven insights</p>
            </div>
            
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'API'] },
              { title: 'Company', links: ['About', 'Careers', 'Contact'] },
              { title: 'Resources', links: ['Documentation', 'Blog', 'Support'] }
            ].map((group, idx) => (
              <div key={idx}>
                <h4 className="font-bold text-white mb-3 text-sm">{group.title}</h4>
                <div className="space-y-2">
                  {group.links.map((link, i) => (
                    <a 
                      key={i}
                      href={`#${link.toLowerCase()}`}
                      className="block text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-slate-800 pt-6 text-center text-slate-400 text-xs">
            © 2025 AI Resume Analyzer Pro. All rights reserved. | Made with ❤️ for job seekers worldwide
          </div>
        </div>
      </footer>
    </div>
  );
}