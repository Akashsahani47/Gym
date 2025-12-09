// app/(auth)/signup/page.js
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, Calendar, 
  Dumbbell, UserCheck, LogIn, Trophy, Heart, Flame,
  Award, Target, Shield, ChevronRight, Sparkles,
  Building, MapPin, Search, X, Loader2, Briefcase,
  DollarSign, Star, Clock
} from 'lucide-react'
import useUserStore from '@/store/useUserStore'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const SignupPage = () => {
  const router = useRouter()
  const login = useUserStore((state) => state.login)
  
  // State for toggling between login/signup
  const [isLoginMode, setIsLoginMode] = useState(false)
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  
  // Signup form state - SIMPLIFIED FOR NEW SEPARATE SCHEMAS
  const [signupData, setSignupData] = useState({
    // Common fields for all user types
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'member',
    
    // Profile fields - all directly in profile object
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: ''
    },
    
    // Gym ID for members and trainers
    gymId: '', // REQUIRED for members and trainers
    
    // Gym owner specific fields - directly in main object
    gymName: '',
    
    gymRegistration: '',
    
    // Trainer specific fields
    specialization: '',
    certification: '',
    experience: '',
    hourlyRate: '',
    
    // Additional fields (will be handled in backend)
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
  const [activeFloatingIcon, setActiveFloatingIcon] = useState(0)

  // Handle login form changes
  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle signup form changes - SIMPLIFIED
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
      // Validate inputs
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

      // Store user data in Zustand
      login(data.user, data.token)

      // Save to localStorage if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', loginData.email)
      } else { 
        localStorage.removeItem('rememberedEmail')
      }

      // Check if user is active
      if (data.user.status !== 'active') {
        const message = getUserStatusMessage(data.user)
        toast.warning(message)
        
        // Redirect to waiting page for pending users
        setTimeout(() => {
          router.push('/waiting-approval')
        }, 2000)
        return
      }

      toast.success('Login successful! Welcome back! 💪')
      
      // Redirect based on user type and status
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
          router.push('/waiting-approval')
        }
      }, 1000)
      
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Helper function for user status messages
  const getUserStatusMessage = (user) => {
    switch(user.status) {
      case 'pending':
        switch(user.userType) {
          case 'gym_owner':
            return 'Your account is pending admin approval. You will be notified when activated.'
          case 'member':
            return 'Your membership is pending gym owner approval. You will be notified when activated.'
          case 'trainer':
            return 'Your trainer account is pending gym owner approval. You will be notified when activated.'
          default:
            return 'Your account is pending approval.'
        }
      case 'inactive':
        return 'Your account is inactive. Please contact support.'
      case 'suspended':
        return 'Your account has been suspended. Please contact support.'
      default:
        return 'Welcome back!'
    }
  }

  // Handle signup submission - UPDATED FOR NEW SEPARATE SCHEMAS
  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate passwords match
      if (signupData.password !== signupData.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }

      // Validate required fields
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

      // Gym ID validation for members and trainers
      if ((signupData.userType === 'member' || signupData.userType === 'trainer') && !signupData.gymId) {
        toast.error('Please select a gym')
        return
      }

      // Business name validation for gym owners
      if (signupData.userType === 'gym_owner' && !signupData.gymName) {
        toast.error('gym name is required for gym owners')
        return
      }

      // Check terms agreement
      if (!agreeToTerms) {
        toast.error('You must agree to the Terms of Service and Privacy Policy')
        return
      }

      // Prepare data for API - SIMPLE STRUCTURE
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

      // Add gymId for members and trainers
      if (signupData.userType === 'member' || signupData.userType === 'trainer') {
        requestData.gymId = signupData.gymId;
      }

      // Add gym owner specific fields
      if (signupData.userType === 'gym_owner') {
        requestData.profile.gymName = signupData.gymName;
       
      }

      // Add trainer specific fields
      if (signupData.userType === 'trainer') {
        if (signupData.specialization) requestData.profile.specialization = signupData.specialization;
        if (signupData.certification) requestData.profile.certification = signupData.certification;
        if (signupData.experience) requestData.profile.experience = parseInt(signupData.experience);
        if (signupData.hourlyRate) requestData.hourlyRate = parseFloat(signupData.hourlyRate);
      }

      console.log('Sending signup data:', requestData); // For debugging

      // API call
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

      console.log('Signup response:', data); // For debugging

      // Store user data in Zustand
      if (data.user && data.token) {
        login(data.user, data.token);
      }

      // Show appropriate message based on user type
      const signupMessage = getSignupSuccessMessage(signupData.userType)
      toast.success(signupMessage)
      
      // Redirect to waiting approval page for all users
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

  // Helper function for signup success messages
  const getSignupSuccessMessage = (userType) => {
    switch(userType) {
      case 'gym_owner':
        return 'Gym owner registration successful! Your account is pending admin approval. You will receive an email when activated.'
      case 'member':
        return 'Member registration successful! Your membership is pending gym owner approval. You will be notified when activated.'
      case 'trainer':
        return 'Trainer registration successful! Your account is pending gym owner approval. You will be notified when activated.'
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

  // Floating gym icons for background
  const floatingIcons = [
    { icon: <Dumbbell className="w-6 h-6 md:w-8 md:h-8 text-red-500/20" />, delay: '0s' },
    { icon: <Flame className="w-5 h-5 md:w-7 md:h-7 text-orange-500/20" />, delay: '2s' },
    { icon: <Trophy className="w-7 h-7 md:w-9 md:h-9 text-yellow-500/15" />, delay: '1s' },
  ]

  // Cycle through floating icons
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFloatingIcon((prev) => (prev + 1) % floatingIcons.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Check for remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      setLoginData(prev => ({ ...prev, email: rememberedEmail }))
      setRememberMe(true)
    }
  }, [])

  // Fetch gyms when user type changes to member or trainer
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
          <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-md">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center">
                <Building className="w-5 h-5 mr-2 text-red-400" />
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
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {isSearchingGyms ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-red-400" />
                  </div>
                ) : gyms.length > 0 ? (
                  gyms.map((gym) => (
                    <button
                      key={gym._id}
                      onClick={() => handleGymSelect(gym)}
                      className="w-full text-left p-3 hover:bg-gray-800 rounded-lg mb-2 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-800 rounded-lg mr-3">
                          <Building className="w-5 h-5 text-red-400" />
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

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center p-4 md:p-8 overflow-hidden relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="hidden md:block absolute top-10 left-10 opacity-5">
            <Dumbbell className="w-16 h-16 md:w-24 md:h-24" />
          </div>
          <div className="hidden md:block absolute bottom-10 right-10 opacity-5">
            <Dumbbell className="w-20 h-20 md:w-32 md:h-32" />
          </div>
          
          {floatingIcons.map((item, index) => (
            <div
              key={index}
              className={`absolute ${index === 0 ? 'top-1/4' : index === 1 ? 'top-2/3' : 'top-1/3'} 
                ${index % 2 === 0 ? 'left-4 md:left-10' : 'right-4 md:right-10'} 
                animate-float hidden sm:block`}
              style={{
                animationDelay: item.delay,
                opacity: activeFloatingIcon === index ? 0.2 : 0.05,
                transition: 'opacity 1s ease-in-out'
              }}
            >
              {item.icon}
            </div>
          ))}
        </div>

        {/* Mobile Header */}
        <div className="md:hidden absolute top-6 left-1/2 transform -translate-x-1/2 text-center z-20 w-full px-4">
          <div className="flex items-center justify-center space-x-2 animate-pulse">
            <Flame className="w-4 h-4 text-red-500" />
            <span className="text-xs text-gray-300 font-semibold">UNLEASH YOUR POTENTIAL</span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
        </div>

        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 relative z-10 mt-12 md:mt-0">
          {/* Left side - Motivational Section */}
          <div className="bg-gradient-to-br hidden md:block from-red-900/20 to-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-red-900/30 shadow-2xl">
            <div className="h-full flex flex-col justify-center">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl">
                    <Dumbbell className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-white">
                    Fitness<span className="text-red-500">Hub</span>
                  </h1>
                </div>
                <p className="text-gray-300 text-lg mb-6">
                  Join the fitness revolution. Select your gym and start your journey today.
                </p>
              </div>

              {/* Activation Info */}
              <div className="bg-gradient-to-r from-gray-900/50 to-gray-900/20 rounded-xl p-4 border-l-4 border-blue-500 mb-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="text-white font-semibold mb-1">Activation Process</h3>
                    <p className="text-gray-300 text-sm">
                      <span className="text-red-400 font-semibold">Gym Owners:</span> Admin approval required<br/>
                      <span className="text-green-400 font-semibold">Members/Trainers:</span> Gym owner approval required
                    </p>
                  </div>
                </div>
              </div>

              {/* User Type Benefits */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3 p-3 bg-gray-900/30 rounded-lg">
                  <div className="p-2 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-lg">
                    <Building className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Gym Owners</h4>
                    <p className="text-gray-400 text-xs">Manage your gym, members, and trainers</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-900/30 rounded-lg">
                  <div className="p-2 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg">
                    <User className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Members</h4>
                    <p className="text-gray-400 text-xs">Track workouts, join classes, achieve goals</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-900/30 rounded-lg">
                  <div className="p-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg">
                    <UserCheck className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Trainers</h4>
                    <p className="text-gray-400 text-xs">Manage clients, schedule sessions, grow business</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-900/50 rounded-xl">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-xs text-gray-400">Verified Gyms</div>
                </div>
                <div className="text-center p-4 bg-gray-900/50 rounded-xl">
                  <div className="text-2xl font-bold text-white">50K+</div>
                  <div className="text-xs text-gray-400">Active Members</div>
                </div>
                <div className="text-center p-4 bg-gray-900/50 rounded-xl">
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-xs text-gray-400">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Forms */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-gray-700 shadow-2xl">
            {/* Compact Header for Mobile */}
            <div className="lg:hidden mb-4">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="p-1.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">
                  Fitness<span className="text-red-500">Hub</span>
                </h1>
              </div>
              <p className="text-gray-300 text-sm text-center mb-2">
                {isLoginMode ? 'Welcome back!' : 'Join our fitness community'}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="mb-4 md:mb-6">
              <div className="flex rounded-lg md:rounded-xl bg-gray-900/60 p-0.5 md:p-1 border border-gray-700">
                <button
                  onClick={() => setIsLoginMode(false)}
                  className={`flex-1 py-2.5 md:py-3 rounded-md font-semibold transition-all duration-300 flex items-center justify-center text-sm md:text-base ${
                    !isLoginMode
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <User className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                  Sign Up
                </button>
                <button
                  onClick={() => setIsLoginMode(true)}
                  className={`flex-1 py-2.5 md:py-3 rounded-md font-semibold transition-all duration-300 flex items-center justify-center text-sm md:text-base ${
                    isLoginMode
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <LogIn className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                  Login
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-1">
                  {isLoginMode ? 'Welcome Back!' : 'Start Your Journey'}
                </h2>
                <p className="text-gray-300 text-xs md:text-sm">
                  {isLoginMode 
                    ? 'Get back to your fitness goals' 
                    : 'Join thousands transforming lives'}
                </p>
              </div>
            </div>

            {/* Login Form */}
            {isLoginMode ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4 md:space-y-5">
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="Email address"
                      className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 bg-gray-900/70 border border-gray-700 rounded-lg text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Password"
                      className="w-full pl-9 md:pl-10 pr-10 md:pr-12 py-2.5 md:py-3 bg-gray-900/70 border border-gray-700 rounded-lg text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 md:w-5 md:h-5" />
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
                      <div className={`w-4 h-4 rounded border ${rememberMe ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-500' : 'border-gray-600 bg-gray-900'}`}>
                        {rememberMe && (
                          <ChevronRight className="w-3 h-3 text-white transform rotate-90" />
                        )}
                      </div>
                    </div>
                    <span className="ml-2 text-xs md:text-sm text-gray-300">Remember me</span>
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs md:text-sm text-green-400 hover:text-green-300 transition flex items-center"
                  >
                    <Shield className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Forgot?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-2.5 md:py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-800 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-green-500 focus:ring-offset-1 md:focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                      Sign In
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Signup Form - SIMPLIFIED FOR NEW SCHEMAS */
              <form onSubmit={handleSignupSubmit} className="space-y-4 md:space-y-5">
                {/* User Type Selection */}
                <div className="mb-4 md:mb-5">
                  <label className="block text-gray-300 text-xs md:text-sm font-medium mb-2 flex items-center">
                    <Target className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-red-400" />
                    Choose Your Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['member', 'gym_owner', 'trainer'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setSignupData(prev => ({ 
                            ...prev, 
                            userType: type,
                            // Reset gym selection when changing user type
                            ...(type === 'gym_owner' && { gymId: '' })
                          }))
                          setSelectedGymDetails(null)
                        }}
                        className={`p-2 rounded-lg border transition-all duration-300 flex flex-col items-center justify-center ${
                          signupData.userType === type
                            ? 'bg-gradient-to-r from-red-600 to-orange-600 border-red-500 text-white'
                            : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white hover:bg-gray-800/60'
                        }`}
                      >
                        <div className={`p-1 rounded mb-1 ${
                          signupData.userType === type 
                            ? 'bg-white/20' 
                            : 'bg-gray-800/50'
                        }`}>
                          {userTypeIcons[type]}
                        </div>
                        <span className="font-medium text-xs">{userTypeLabels[type]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gym Selection for Members/Trainers */}
                {(signupData.userType === 'member' || signupData.userType === 'trainer') && (
                  <div className="mb-4">
                    <label className="block text-gray-300 text-xs md:text-sm font-medium mb-2 flex items-center justify-between">
                      <span className="flex items-center">
                        <Building className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-red-400" />
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
                      <div className="p-3 bg-gray-900/60 border border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">{selectedGymDetails.name}</div>
                            <div className="text-gray-400 text-sm flex items-center mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {selectedGymDetails.address?.city}, {selectedGymDetails.address?.state}
                            </div>
                          </div>
                          <Building className="w-5 h-5 text-red-400" />
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowGymSearch(true)}
                        className="w-full p-3 bg-gray-900/60 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors flex items-center justify-center"
                      >
                        <Search className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-300">Search for a gym</span>
                      </button>
                    )}
                    
                    {!signupData.gymId && (
                      <p className="text-xs text-red-400 mt-1">
                        * Gym selection is required for {signupData.userType === 'member' ? 'members' : 'trainers'}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {/* Basic Information */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                    <input
                      type="email"
                      name="email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      placeholder="Email address *"
                      className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 bg-gray-900/70 border border-gray-700 rounded-lg text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                      <input
                        type="text"
                        name="profile.firstName"
                        value={signupData.profile.firstName}
                        onChange={handleSignupChange}
                        placeholder="First name *"
                        className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 bg-gray-900/70 border border-gray-700 rounded-lg text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                        required
                      />
                    </div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                      <input
                        type="text"
                        name="profile.lastName"
                        value={signupData.profile.lastName}
                        onChange={handleSignupChange}
                        placeholder="Last name *"
                        className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 bg-gray-900/70 border border-gray-700 rounded-lg text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                    <input
                      type="tel"
                      name="profile.phone"
                      value={signupData.profile.phone}
                      onChange={handleSignupChange}
                      placeholder="Phone number *"
                      className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 bg-gray-900/70 border border-gray-700 rounded-lg text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                    <input
                      type="date"
                      name="profile.dateOfBirth"
                      value={signupData.profile.dateOfBirth}
                      onChange={handleSignupChange}
                      className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 bg-gray-900/70 border border-gray-700 rounded-lg text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Gym Owner Specific Fields */}
                  {signupData.userType === 'gym_owner' && (
                    <>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                        <input
                          type="text"
                          name="gymName"
                          value={signupData.gymName}
                          onChange={handleSignupChange}
                          placeholder="Gym Name *"
                          className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 bg-gray-900/70 border border-gray-700 rounded-lg text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                          required
                        />
                      </div>
                      
                        
                        <div className="relative">
                          <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                          <input
                            type="text"
                            name="gymRegistration"
                            value={signupData.gymRegistration}
                            onChange={handleSignupChange}
                            placeholder="Registration Number"
                            className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 bg-gray-900/70 border border-gray-700 rounded-lg text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                          />
                        </div>
                      
                    </>
                  )}

                  {/* Trainer Specific Fields */}
                  {signupData.userType === 'trainer' && (
                    <>
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <div className="relative">
                          <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                          <input
                            type="text"
                            name="specialization"
                            value={signupData.specialization}
                            onChange={handleSignupChange}
                            placeholder="Specialization"
                            className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 bg-gray-900/70 border border-gray-700 rounded-lg text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                          />
                        </div>
                        <div className="relative">
                          <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                          <input
                            type="text"
                            name="certification"
                            value={signupData.certification}
                            onChange={handleSignupChange}
                            placeholder="Certification"
                            className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 bg-gray-900/70 border border-gray-700 rounded-lg text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                          <input
                            type="number"
                            name="experience"
                            value={signupData.experience}
                            onChange={handleSignupChange}
                            placeholder="Experience (years)"
                            className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 bg-gray-900/70 border border-gray-700 rounded-lg text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                          />
                        </div>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                          <input
                            type="number"
                            name="hourlyRate"
                            value={signupData.hourlyRate}
                            onChange={handleSignupChange}
                            placeholder="Hourly Rate ($)"
                            className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 bg-gray-900/70 border border-gray-700 rounded-lg text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Password Fields */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={signupData.password}
                        onChange={handleSignupChange}
                        placeholder="Password *"
                        className="w-full pl-9 md:pl-10 pr-10 md:pr-12 py-2.5 md:py-3 bg-gray-900/70 border border-gray-700 rounded-lg text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                      </button>
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={signupData.confirmPassword}
                        onChange={handleSignupChange}
                        placeholder="Confirm password *"
                        className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 bg-gray-900/70 border border-gray-700 rounded-lg text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
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
                      className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${
                        agreeToTerms 
                          ? 'bg-gradient-to-r from-red-600 to-orange-600 border-red-500' 
                          : 'border-gray-600 bg-gray-900'
                      }`}
                    >
                      {agreeToTerms && <ChevronRight className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <label htmlFor="terms" className="ml-2 text-xs md:text-sm text-gray-300 cursor-pointer">
                    I agree to{' '}
                    <Link href="/terms" className="text-red-400 hover:text-red-300 font-medium">
                      Terms
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-red-400 hover:text-red-300 font-medium">
                      Privacy
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || ((signupData.userType === 'member' || signupData.userType === 'trainer') && !signupData.gymId)}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-2.5 md:py-3 rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-red-500 focus:ring-offset-1 md:focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                      {signupData.userType === 'gym_owner' ? 'Register Gym' : 'Start Journey'}
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Footer Links */}
            <div className="text-center pt-4 mt-4 border-t border-gray-700">
              <p className="text-gray-400 text-xs">
                {isLoginMode 
                  ? "New to FitnessHub? " 
                  : "Already have an account? "
                }
                <button
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-gradient bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent font-semibold hover:from-red-400 hover:to-orange-400 transition-all text-xs md:text-sm"
                >
                  {isLoginMode ? "Join now" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .text-gradient {
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        @media (max-width: 768px) {
          button, input, [role="button"] {
            min-height: 44px;
          }
        }
      `}</style>
    </>
  )
}

export default SignupPage