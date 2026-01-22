import axios from "axios";

// Vite uses import.meta.env
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: false, // Important for CORS with auth
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or sessionStorage
     const token = localStorage.getItem('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn("Authentication expired, redirecting to login...");
      // Clear tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------
// 1) Resume Analysis API - UPDATED
// ---------------------------------------------
export async function analyzeResume(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/resume/analyze", formData, {
    headers: { 
      "Content-Type": "multipart/form-data" 
    },
  });

  return response.data;
}

// ---------------------------------------------
// 2) Job Match API - UPDATED
// ---------------------------------------------
export async function jobMatch(resumeText, jobDescription, skills) {
  const safeSkills = Array.isArray(skills) ? skills : [];
  
  console.log("Sending job match request with skills:", safeSkills);
  
  try {
    const response = await api.post(
      "/job-match",
      { 
        resume_text: resumeText || "", 
        job_description: jobDescription || "", 
        skills: safeSkills 
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 45000
      }
    );

    console.log("Job match API response:", response.data);
    
    // ✅ HANDLE BOTH FORMATS:
    if (response.data && response.data.result) {
      return response.data;
    } else if (response.data) {
      return { result: response.data };
    } else {
      throw new Error("Empty response from server");
    }
    
  } catch (error) {
    console.error("Job match API error:", error);
    
    let errorMessage = "Failed to analyze job match";
    
    if (error.response) {
      if (error.response.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response.data?.result?.error) {
        errorMessage = error.response.data.result.error;
      } else {
        errorMessage = `Server error: ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage = "No response from server. Please check if backend is running.";
    } else {
      errorMessage = error.message;
    }
    
    return { result: { error: errorMessage } };
  }
} 

// ---------------------------------------------
// 3) Job Search API - UPDATED
// ---------------------------------------------
export async function searchJobs(query, location) {
  const response = await api.get("/job-search", {
    params: { query, location }
  });
  return response.data;
}

// ---------------------------------------------
// 4) Download Full PDF Report - UPDATED
// ---------------------------------------------
export async function downloadReport(resultData) {
  try {
    console.log("Starting download with data:", resultData);
    
    const response = await api.post(
      "/download-report",
      resultData,
      { 
        responseType: "blob",
        timeout: 30000
      }
    );

    if (!response.data || response.data.size === 0) {
      throw new Error("Empty response from server");
    }

    // Create download link
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume_report.pdf";
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

    console.log("Download initiated successfully");
    
  } catch (error) {
    console.error("Download error details:", error);
    
    if (error.response) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error("No response from server. Please check if backend is running.");
    } else {
      throw new Error(`Download failed: ${error.message}`);
    }
  }
}

// ---------------------------------------------
// 5) Auth APIs - ADD THESE
// ---------------------------------------------
export async function login(email, password) {
  try {
    const response = await api.post("/api/auth/login", {
      email,
      password
    });
    
    // Store token if received
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } 
    return response.data;
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Invalid email or password');
    }
    if (error.response?.status === 400) {
      throw new Error(error.response.data.detail || 'Invalid credentials');
    }
    if (error.response?.status === 429) {
      throw new Error('Too many login attempts. Please try again later.');
    }
    throw new Error(error.response?.data?.detail || 'Login failed. Please try again.');
  }
}

export async function register(userData) {
  try {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 400) {
      const detail = error.response.data.detail;
      if (detail && detail.includes('already')) {
        throw new Error('Email already registered. Please login or use a different email.');
      }
      throw new Error(detail || 'Registration failed. Please check your information.');
    }
    if (error.response?.status === 422) {
      throw new Error('Invalid input. Please check all fields and try again.');
    }
    throw new Error(error.response?.data?.detail || 'Registration failed. Please try again.');
  }
}

export async function getCurrentUser() {
  const response = await api.get("/api/auth/me");
  return response.data;
}

export async function updateProfile(profileData) {
  try {
    const response = await api.put("/api/auth/me", profileData);
    // Update localStorage with new user data
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data.detail || 'Invalid profile data');
    }
    if (error.response?.status === 422) {
      throw new Error('Please check your input data and try again');
    }
    throw new Error(error.response?.data?.detail || 'Failed to update profile');
  }
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  return api.post("/api/auth/logout");
}

// ---------------------------------------------
// 6) Resume History APIs - ADD THESE
// ---------------------------------------------
export async function getResumeHistory(page = 1, limit = 10) {
  const response = await api.get("/resume/history", {
    params: { page, limit }
  });
  return response.data;
}

export async function getAnalysisById(id) {
  const response = await api.get(`/resume/${id}`);
  return response.data;
}

export default api;