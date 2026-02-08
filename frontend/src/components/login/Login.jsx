'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, Calendar, 
  Dumbbell, UserCheck, LogIn, Shield, ChevronRight, Sparkles,
  Building, MapPin, Search, X, Loader2, Briefcase,
  DollarSign, Star, Clock, Award, Target, Heart, Cpu, BarChart3
} from 'lucide-react'
import useUserStore from '@/store/useUserStore'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const AuthPage = () => {
  const router = useRouter()
  const login = useUserStore((state) => state.login)
  
  // State for toggling between login/signup
  const [isLoginMode, setIsLoginMode] = useState(false)
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'member',
    
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: ''
    },
    
    gymId: '',
    gymName: '',
    gymRegistration: '',
    
    specialization: '',
    certification: '',
    experience: '',
    hourlyRate: '',
    
    additionalData: {}
  })
  
  // Gym search state
  const [gyms, setGyms] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchingGyms, setIsSearchingGyms] = useState(false)
  const [showGymSearch, setShowGymSearch] = useState(false)
  const [selectedGymDetails, setSelectedGymDetails] = useState(null)
  
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: Cpu,
      title: "Complete Ecosystem",
      description: "Four dedicated dashboards working in perfect sync",
      color: "text-[#DAFF00]"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption & role-based access control",
      color: "text-purple-400"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Monitor performance across all roles instantly",
      color: "text-blue-400"
    }
  ];

  // Handle login form changes
  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle signup form changes
  const handleSignupChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('profile.')) {
      const field = name.split('.')[1]
      setSignupData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [field]: value
        }
      }))
    } else {
      setSignupData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Search for gyms
  const searchGyms = async (query) => {
    if (!query.trim()) return
    
    setIsSearchingGyms(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym/allgym?search=${encodeURIComponent(query)}`
      )
      const data = await response.json()
      
      if (data.success) {
        setGyms(data.gyms || [])
      } else {
        toast.error(data.message || 'Failed to search gyms')
      }
    } catch (error) {
      toast.error('Error searching gyms')
    } finally {
      setIsSearchingGyms(false)
    }
  }

  // Get gyms for registration
  const getGymsForRegistration = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym/allgym/for-registration`
      ) 
      const data = await response.json()
      
      if (data.success) {
        setGyms(data.gyms || [])
      }
    } catch (error) {
      console.error('Error fetching gyms:', error)
    }
  }

  // Handle gym selection
  const handleGymSelect = (gym) => {
    setSignupData(prev => ({
      ...prev,
      gymId: gym._id
    }))
    setSelectedGymDetails(gym)
    setShowGymSearch(false)
    toast.success(`Selected: ${gym.name}`)
  }

  // Clear selected gym
  const clearGymSelection = () => {
    setSignupData(prev => ({
      ...prev,
      gymId: ''
    }))
    setSelectedGymDetails(null)
  }

  // Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!loginData.email || !loginData.password) {
        toast.error('Please fill in all fields')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      login(data.user, data.token)

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', loginData.email)
      } else { 
        localStorage.removeItem('rememberedEmail')
      }

      toast.success('Login successful! Welcome back! 💪')
      
      setTimeout(() => {
        if (data.user.status === 'active') {
          switch (data.user.userType) {
            case 'gym_owner':
              router.push('/dashboard/gymOwner')
              break
            case 'trainer':
              router.push('/dashboard/trainer')
              break
            default:
              router.push('/dashboard/member')
          }
        } else {
          router.push('/notice/waiting-approval')
        }
      }, 1000)
      
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle signup submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (signupData.password !== signupData.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }

      const requiredFields = [
        'email', 'password', 
        'profile.firstName', 'profile.lastName', 'profile.phone'
      ]
      
      for (const field of requiredFields) {
        const value = field.includes('.') 
          ? signupData.profile[field.split('.')[1]]
          : signupData[field]
        
        if (!value) {
          toast.error('Please fill in all required fields')
          return
        }
      }

      if ((signupData.userType === 'member' || signupData.userType === 'trainer') && !signupData.gymId) {
        toast.error('Please select a gym')
        return
      }

      if (signupData.userType === 'gym_owner' && !signupData.gymName) {
        toast.error('Gym name is required for gym owners')
        return
      }

      if (!agreeToTerms) {
        toast.error('You must agree to the Terms of Service and Privacy Policy')
        return
      }

      const requestData = {
        email: signupData.email,
        password: signupData.password,
        userType: signupData.userType,
        profile: {
          firstName: signupData.profile.firstName,
          lastName: signupData.profile.lastName,
          phone: signupData.profile.phone,
          dateOfBirth: signupData.profile.dateOfBirth || null,
        }
      }

      if (signupData.userType === 'member' || signupData.userType === 'trainer') {
        requestData.gymId = signupData.gymId;
      }

      if (signupData.userType === 'gym_owner') {
        requestData.profile.gymName = signupData.gymName;
      }

      if (signupData.userType === 'trainer') {
        if (signupData.specialization) requestData.profile.specialization = signupData.specialization;
        if (signupData.certification) requestData.profile.certification = signupData.certification;
        if (signupData.experience) requestData.profile.experience = parseInt(signupData.experience);
        if (signupData.hourlyRate) requestData.hourlyRate = parseFloat(signupData.hourlyRate);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed')
      }

      if (data.user && data.token) {
        login(data.user, data.token);
      }

      const signupMessage = getSignupSuccessMessage(signupData.userType)
      toast.success(signupMessage)
      
      setTimeout(() => {
        router.push('/waiting-approval')
      }, 2000)
      
    } catch (err) {
      console.error('Signup error:', err);
      toast.error(err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getSignupSuccessMessage = (userType) => {
    switch(userType) {
      case 'gym_owner':
        return 'Gym owner registration successful! Your account is pending admin approval.'
      case 'member':
        return 'Member registration successful! Your membership is pending gym owner approval.'
      case 'trainer':
        return 'Trainer registration successful! Your account is pending gym owner approval.'
      default:
        return 'Registration successful!'
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const userTypeIcons = {
    member: <User className="w-5 h-5" />,
    gym_owner: <Building className="w-5 h-5" />,
    trainer: <UserCheck className="w-5 h-5" />
  }

  const userTypeLabels = {
    member: 'Member',
    gym_owner: 'Gym Owner',
    trainer: 'Trainer'
  }

  const roleColors = {
    member: 'emerald',
    gym_owner: 'purple',
    trainer: 'blue'
  }

  // Cycle through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Check for remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      setLoginData(prev => ({ ...prev, email: rememberedEmail }))
      setRememberMe(true)
    }
  }, [])

  // Fetch gyms when user type changes
  useEffect(() => {
    if (signupData.userType === 'member' || signupData.userType === 'trainer') {
      getGymsForRegistration()
    }
  }, [signupData.userType])

  // Handle search input with debounce
  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        searchGyms(searchQuery)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [searchQuery])

  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      {/* Gym Search Modal */}
      {showGymSearch && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center">
                <Building className="w-5 h-5 mr-2 text-[#DAFF00]" />
                Select a Gym
              </h3>
              <button
                onClick={() => setShowGymSearch(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gyms by name or location..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DAFF00] transition"
                />
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {isSearchingGyms ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#DAFF00]" />
                  </div>
                ) : gyms.length > 0 ? (
                  gyms.map((gym) => (
                    <button
                      key={gym._id}
                      onClick={() => handleGymSelect(gym)}
                      className="w-full text-left p-3 hover:bg-gray-800/50 rounded-lg mb-2 transition-colors border border-transparent hover:border-gray-700"
                    >
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-800/50 rounded-lg mr-3">
                          <Building className="w-5 h-5 text-[#DAFF00]" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{gym.name}</div>
                          <div className="text-gray-400 text-sm flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {gym.address?.city}, {gym.address?.state}
                          </div>
                          {gym.owner?.businessName && (
                            <div className="text-gray-500 text-xs mt-1">
                              {gym.owner.businessName}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Building className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No gyms found</p>
                    <p className="text-sm mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-black flex items-center justify-center p-4 md:p-8 overflow-hidden relative">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-[#DAFF00]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
          
          {/* Animated dashboard previews */}
          <div className="absolute top-1/4 left-10 hidden lg:block">
            <div className="relative">
              <div className="w-20 h-16 bg-gradient-to-br from-[#DAFF00]/10 to-transparent border border-[#DAFF00]/20 rounded-xl transform rotate-6 animate-pulse"></div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#DAFF00] rounded-full"></div>
            </div>
          </div>
          
          <div className="absolute bottom-1/4 right-10 hidden lg:block">
            <div className="relative">
              <div className="w-24 h-20 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl transform -rotate-6 animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 relative z-10">
          {/* Left side - Zelvoo Introduction */}
          <div className="hidden lg:block bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 shadow-2xl">
            <div className="h-full flex flex-col justify-center">
              {/* Logo */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-[#DAFF00] to-[#c5e600] rounded-xl">
                    <Shield className="w-8 h-8 text-black" />
                  </div>
                  <h1 className="text-4xl font-bold">
                    <span className="text-white">Zel</span>
                    <span className="text-[#DAFF00]">voo</span>
                  </h1>
                </div>
                
                <div className="inline-flex items-center border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:ring-offset-2 shadow hover:bg-[#DAFF00]/90 mb-6 bg-[#DAFF00]/10 text-[#DAFF00] border-[#DAFF00]/30 rounded-full px-4 py-1.5">
                  Complete Gym Management Ecosystem
                </div>
                
                <p className="text-gray-300 text-lg mb-6">
                  One platform. Every role. Complete gym management.
                </p>
              </div>

              {/* Rotating Features */}
              <div className="bg-gradient-to-r from-gray-900/50 to-gray-900/20 rounded-xl p-6 border border-gray-800 mb-8">
                <div className="h-32 transition-all duration-500">
                  {features.map((feature, index) => (
                    <div 
                      key={index}
                      className={`transition-all duration-500 ${
                        activeFeature === index ? 'opacity-100 translate-y-0' : 'opacity-0 absolute translate-y-4'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-xl ${feature.color.replace('text', 'bg')}/10 border ${feature.color.replace('text', 'border')}/30`}>
                          <feature.icon className={`w-6 h-6 ${feature.color}`} />
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold ${feature.color} mb-2`}>
                            {feature.title}
                          </h3>
                          <p className="text-gray-400">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Feature indicators */}
                <div className="flex justify-center space-x-2 mt-6">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveFeature(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        activeFeature === index 
                          ? 'bg-[#DAFF00] w-8' 
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Role Badges */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3 p-4 bg-gray-900/30 rounded-xl border border-gray-800">
                  <div className="p-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg">
                    <Building className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Gym Owners</h4>
                    <p className="text-gray-400 text-sm">Manage multiple gyms, revenue, and teams</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-gray-900/30 rounded-xl border border-gray-800">
                  <div className="p-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg">
                    <UserCheck className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Trainers</h4>
                    <p className="text-gray-400 text-sm">Schedule workouts & track client progress</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-gray-900/30 rounded-xl border border-gray-800">
                  <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-lg">
                    <User className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Members</h4>
                    <p className="text-gray-400 text-sm">Book classes, track workouts, see results</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                  <div className="text-2xl font-bold text-[#DAFF00]">500+</div>
                  <div className="text-xs text-gray-400">Verified Gyms</div>
                </div>
                <div className="text-center p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                  <div className="text-2xl font-bold text-purple-400">50K+</div>
                  <div className="text-xs text-gray-400">Active Users</div>
                </div>
                <div className="text-center p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                  <div className="text-2xl font-bold text-blue-400">98%</div>
                  <div className="text-xs text-gray-400">Uptime</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Forms */}
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-900/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-gray-800 shadow-2xl">
            {/* Mobile Header */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-[#DAFF00] to-[#c5e600] rounded-lg">
                  <Shield className="w-5 h-5 text-black" />
                </div>
                <h1 className="text-2xl font-bold">
                  <span className="text-white">Zel</span>
                  <span className="text-[#DAFF00]">voo</span>
                </h1>
              </div>
              <p className="text-gray-300 text-sm text-center">
                {isLoginMode ? 'Welcome back to the ecosystem!' : 'Join the complete gym management platform'}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="mb-6 md:mb-8">
              <div className="flex rounded-lg bg-gray-900/60 p-1 border border-gray-800">
                <button
                  onClick={() => setIsLoginMode(false)}
                  className={`flex-1 py-3 rounded-md font-semibold transition-all duration-300 flex items-center justify-center ${
                    !isLoginMode
                      ? 'bg-gradient-to-r from-[#DAFF00] to-[#c5e600] text-black shadow'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <User className="w-5 h-5 mr-2" />
                  Sign Up
                </button>
                <button
                  onClick={() => setIsLoginMode(true)}
                  className={`flex-1 py-3 rounded-md font-semibold transition-all duration-300 flex items-center justify-center ${
                    isLoginMode
                      ? 'bg-gradient-to-r from-[#DAFF00] to-[#c5e600] text-black shadow'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Login
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                  {isLoginMode ? 'Welcome Back!' : 'Join the Ecosystem'}
                </h2>
                <p className="text-gray-300 text-sm">
                  {isLoginMode 
                    ? 'Access your dedicated dashboard' 
                    : 'Get your role-based dashboard today'}
                </p>
              </div>
            </div>

            {/* Login Form */}
            {isLoginMode ? (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="Email address"
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:border-transparent transition"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Password"
                      className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:border-transparent transition"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${rememberMe ? 'bg-[#DAFF00] border-[#DAFF00]' : 'border-gray-600 bg-gray-800/50'}`}>
                        {rememberMe && <ChevronRight className="w-4 h-4 text-black" />}
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-gray-300">Remember me</span>
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-[#DAFF00] hover:text-[#c5e600] transition flex items-center"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#DAFF00] to-[#c5e600] text-black py-3 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In to Dashboard
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Signup Form */
              <form onSubmit={handleSignupSubmit} className="space-y-5">
                {/* User Type Selection */}
                <div className="mb-5">
                  <label className="block text-gray-300 text-sm font-medium mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-[#DAFF00]" />
                    Choose Your Role
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['member', 'gym_owner', 'trainer'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setSignupData(prev => ({ 
                            ...prev, 
                            userType: type,
                            ...(type === 'gym_owner' && { gymId: '' })
                          }))
                          setSelectedGymDetails(null)
                        }}
                        className={`p-3 rounded-lg border transition-all duration-300 flex flex-col items-center justify-center ${
                          signupData.userType === type
                            ? `bg-gradient-to-r from-${roleColors[type]}-500/20 to-${roleColors[type]}-600/20 border-${roleColors[type]}-500/50 text-white`
                            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white hover:bg-gray-800/60'
                        }`}
                      >
                        <div className={`p-2 rounded-lg mb-2 ${signupData.userType === type ? 'bg-white/20' : 'bg-gray-800/50'}`}>
                          {userTypeIcons[type]}
                        </div>
                        <span className="font-medium text-sm">{userTypeLabels[type]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gym Selection for Members/Trainers */}
                {(signupData.userType === 'member' || signupData.userType === 'trainer') && (
                  <div className="mb-5">
                    <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center justify-between">
                      <span className="flex items-center">
                        <Building className="w-4 h-4 mr-2 text-[#DAFF00]" />
                        Select Your Gym *
                      </span>
                      {selectedGymDetails && (
                        <button
                          type="button"
                          onClick={clearGymSelection}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Change
                        </button>
                      )}
                    </label>
                    
                    {selectedGymDetails ? (
                      <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">{selectedGymDetails.name}</div>
                            <div className="text-gray-400 text-sm flex items-center mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {selectedGymDetails.address?.city}, {selectedGymDetails.address?.state}
                            </div>
                          </div>
                          <Building className="w-5 h-5 text-[#DAFF00]" />
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowGymSearch(true)}
                        className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors flex items-center justify-center"
                      >
                        <Search className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-300">Search for a gym</span>
                      </button>
                    )}
                    
                    {!signupData.gymId && (
                      <p className="text-xs text-red-400 mt-2">
                        * Gym selection is required for {signupData.userType === 'member' ? 'members' : 'trainers'}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Basic Information */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      placeholder="Email address *"
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="profile.firstName"
                        value={signupData.profile.firstName}
                        onChange={handleSignupChange}
                        placeholder="First name *"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:border-transparent transition"
                        required
                      />
                    </div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="profile.lastName"
                        value={signupData.profile.lastName}
                        onChange={handleSignupChange}
                        placeholder="Last name *"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:border-transparent transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="profile.phone"
                      value={signupData.profile.phone}
                      onChange={handleSignupChange}
                      placeholder="Phone number *"
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="profile.dateOfBirth"
                      value={signupData.profile.dateOfBirth}
                      onChange={handleSignupChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:border-transparent transition"
                    />
                  </div>

                  {/* Gym Owner Specific Fields */}
                  {signupData.userType === 'gym_owner' && (
                    <>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="gymName"
                          value={signupData.gymName}
                          onChange={handleSignupChange}
                          placeholder="Gym Name *"
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:border-transparent transition"
                          required
                        />
                      </div>
                      
                      <div className="relative">
                        <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="gymRegistration"
                          value={signupData.gymRegistration}
                          onChange={handleSignupChange}
                          placeholder="Registration Number"
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:border-transparent transition"
                        />
                      </div>
                    </>
                  )}

                  {/* Trainer Specific Fields */}
                  {signupData.userType === 'trainer' && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="specialization"
                            value={signupData.specialization}
                            onChange={handleSignupChange}
                            placeholder="Specialization"
                            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:border-transparent transition"
                          />
                        </div>
                        <div className="relative">
                          <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="certification"
                            value={signupData.certification}
                            onChange={handleSignupChange}
                            placeholder="Certification"
                            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:border-transparent transition"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="number"
                            name="experience"
                            value={signupData.experience}
                            onChange={handleSignupChange}
                            placeholder="Experience (years)"
                            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:border-transparent transition"
                          />
                        </div>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="number"
                            name="hourlyRate"
                            value={signupData.hourlyRate}
                            onChange={handleSignupChange}
                            placeholder="Hourly Rate ($)"
                            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:border-transparent transition"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Password Fields */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={signupData.password}
                        onChange={handleSignupChange}
                        placeholder="Password *"
                        className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:border-transparent transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={signupData.confirmPassword}
                        onChange={handleSignupChange}
                        placeholder="Confirm password *"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:border-transparent transition"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="sr-only"
                    />
                    <div 
                      onClick={() => setAgreeToTerms(!agreeToTerms)}
                      className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${
                        agreeToTerms 
                          ? 'bg-[#DAFF00] border-[#DAFF00]' 
                          : 'border-gray-600 bg-gray-800/50'
                      }`}
                    >
                      {agreeToTerms && <ChevronRight className="w-4 h-4 text-black" />}
                    </div>
                  </div>
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-300 cursor-pointer">
                    I agree to{' '}
                    <Link href="/terms" className="text-[#DAFF00] hover:text-[#c5e600] font-medium">
                      Terms
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-[#DAFF00] hover:text-[#c5e600] font-medium">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || ((signupData.userType === 'member' || signupData.userType === 'trainer') && !signupData.gymId)}
                  className="w-full bg-gradient-to-r from-[#DAFF00] to-[#c5e600] text-black py-3 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      {signupData.userType === 'gym_owner' ? 'Register Gym' : 'Join Ecosystem'}
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Footer Links */}
            <div className="text-center pt-5 mt-5 border-t border-gray-800">
              <p className="text-gray-400 text-sm">
                {isLoginMode 
                  ? "New to Zelvoo? " 
                  : "Already have an account? "
                }
                <button
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-[#DAFF00] font-semibold hover:text-[#c5e600] transition-all"
                >
                  {isLoginMode ? "Join the ecosystem" : "Sign in to dashboard"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AuthPage