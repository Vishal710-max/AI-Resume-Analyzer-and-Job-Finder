import { useState } from "react"
import {
  Check,
  X,
  AlertCircle,
  Loader2,
  Sparkles,
  Shield,
  Zap,
  TrendingUp,
  Eye,
  EyeOff,
  CreditCard,
  Users,
  Target,
  BarChart,
  Menu,
  Home,
  LogIn,
  UserPlus,
} from "lucide-react"

const API_BASE_URL = "http://localhost:8000"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const validateName = (name) => {
    if (!name.trim()) return "Full name is required"
    if (name.length < 2) return "Name must be at least 2 characters"
    if (name.length > 50) return "Name is too long"
    if (!/^[a-zA-Z\s.'-]+$/.test(name)) return "Please enter a valid name"
    return ""
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return "Email is required"
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    if (email.length > 100) return "Email is too long"
    return ""
  }

  const validatePassword = (password) => {
    if (!password) return "Password is required"
    if (password.length < 8) return "Password must be at least 8 characters"
    if (password.length > 50) return "Password is too long"
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      return "Password must contain at least one letter and one number"
    }
    return ""
  }

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return "Please confirm your password"
    if (password !== confirmPassword) return "Passwords do not match"
    return ""
  }

  const validateForm = () => {
    const newErrors = {}

    const nameError = validateName(formData.name)
    if (nameError) newErrors.name = nameError

    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError

    const passwordError = validatePassword(formData.password)
    if (passwordError) newErrors.password = passwordError

    const confirmError = validateConfirmPassword(formData.password, formData.confirmPassword)
    if (confirmError) newErrors.confirmPassword = confirmError

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Registration successful! Welcome to ResumeIQ.")
      } else {
        let errorMessage = data.detail || "Registration failed. Please try again."
        if (errorMessage.toLowerCase().includes("already") || response.status === 409) {
          errorMessage = "This email is already registered. Please use a different email or try logging in."
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error.message,
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = () => {
    const pwd = formData.password
    if (!pwd) return { strength: 0, text: "", color: "" }

    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++

    if (strength <= 2) return { strength: 33, text: "Weak", color: "bg-red-500" }
    if (strength <= 3) return { strength: 66, text: "Medium", color: "bg-yellow-500" }
    return { strength: 100, text: "Strong", color: "bg-green-500" }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ResumeIQ</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="/"
                className="text-white/90 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Home className="w-4 h-4" />
                Home
              </a>
              <a
                href="/login"
                className="text-white/90 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                Login
              </a>
              <a
                href="/register"
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition-all flex items-center gap-2 text-sm shadow-lg"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col gap-3">
                <a
                  href="/"
                  className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
                >
                  <Home className="w-4 h-4" />
                  Home
                </a>
                <a
                  href="/login"
                  className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </a>
                <a
                  href="/register"
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition-all flex items-center gap-2 text-sm justify-center shadow-lg"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full py-8 lg:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Column - Register Form */}
            <div className="w-full">
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100/50">
                {/* Form Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-balance">Create Your Account</h1>
                      <p className="text-gray-600 mt-1 text-sm sm:text-base">
                        Join thousands accelerating their careers
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">{errors.submit}</p>
                      </div>
                    </div>
                  )}

                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.name
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                      } focus:outline-none focus:ring-4 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed placeholder-gray-400 text-gray-900`}
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <X className="w-4 h-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.email
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                      } focus:outline-none focus:ring-4 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed placeholder-gray-400 text-gray-900`}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <X className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          errors.password
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                            : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                        } focus:outline-none focus:ring-4 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed placeholder-gray-400 pr-12 text-gray-900`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">
                            Strength:{" "}
                            <span
                              className={
                                passwordStrength.text === "Strong"
                                  ? "text-green-600"
                                  : passwordStrength.text === "Medium"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }
                            >
                              {passwordStrength.text}
                            </span>
                          </span>
                          <span className="text-xs text-gray-500">{formData.password.length}/50</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${passwordStrength.color} transition-all duration-500 rounded-full`}
                            style={{ width: `${passwordStrength.strength}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <X className="w-4 h-4" />
                        {errors.password}
                      </p>
                    )}
                    {!errors.password && (
                      <p className="mt-2 text-xs text-gray-500">At least 8 characters with letters and numbers</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          errors.confirmPassword
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                            : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                        } focus:outline-none focus:ring-4 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed placeholder-gray-400 pr-12 text-gray-900`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <X className="w-4 h-4" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Terms Checkbox */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="relative flex items-center pt-0.5">
                        <input
                          id="agreeTerms"
                          type="checkbox"
                          name="agreeTerms"
                          checked={formData.agreeTerms}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="w-5 h-5 rounded-md border-2 border-gray-300 text-indigo-600 focus:ring-4 focus:ring-indigo-500/20 cursor-pointer transition-colors disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-gray-600 leading-relaxed">
                          I agree to the{" "}
                          <a
                            href="/terms"
                            className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
                          >
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a
                            href="/privacy"
                            className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
                          >
                            Privacy Policy
                          </a>
                        </span>
                      </div>
                    </label>
                    {errors.agreeTerms && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-2 ml-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <X className="w-4 h-4" />
                        {errors.agreeTerms}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-base hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <Sparkles className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  {/* Sign In Link */}
                  <div className="text-center pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      Already have an account?{" "}
                      <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
                        Sign in
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full space-y-6">
              {/* Pricing Header */}
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Free Tier */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-200 hover:border-indigo-200 transition-all duration-300 hover:shadow-lg flex flex-col">
                    <div className="flex flex-col mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Free Tier</h3>
                      <p className="text-sm text-gray-500 mt-1 mb-4">Perfect for starters</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900">$0</span>
                        <span className="text-sm text-gray-500">/month</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6 flex-1">
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed">5 Resume analyses/month</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed">Basic AI recommendations</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed">PDF report generation</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed">Course suggestions</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed">Basic job matching</span>
                      </li>
                    </ul>

                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                      <p className="text-sm text-indigo-700 font-medium text-center">🎓 Great for students</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex flex-col border-2 border-indigo-400">
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-400 text-indigo-900 text-xs font-bold px-4 py-1.5 rounded-bl-2xl shadow-lg">
                      ⭐ MOST POPULAR
                    </div>
                    <div className="flex flex-col mb-6 mt-2">
                      <h3 className="text-lg font-bold">Pro Tier</h3>
                      <p className="text-sm text-white/90 mt-1 mb-4">For serious career growth</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">$9.99</span>
                        <span className="text-sm text-white/80">/month</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6 flex-1">
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm leading-relaxed">Unlimited resume analyses</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm leading-relaxed">Advanced AI recommendations</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm leading-relaxed">Premium PDF reports</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm leading-relaxed">Personalized course roadmaps</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm leading-relaxed">Advanced job matching</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm leading-relaxed">Analytics dashboard</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm leading-relaxed">Priority 24/7 support</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm leading-relaxed">Resume history tracking</span>
                      </li>
                    </ul>

                    <button
                      disabled={isLoading}
                      className="w-full bg-white text-indigo-600 py-3.5 px-4 rounded-xl font-bold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Secure</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Bank-level encryption</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Fast</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Instant analysis</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Growth</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Career boost</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 border border-indigo-100 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Why Choose ResumeIQ?</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                      98%
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-2 font-medium">User Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                      50K+
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-2 font-medium">Resumes Analyzed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                      2.5x
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-2 font-medium">More Interviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                      24/7
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-2 font-medium">Support Available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
