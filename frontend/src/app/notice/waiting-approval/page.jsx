'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import useUserStore from '@/store/useUserStore'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Mail, 
  Phone, 
  User, 
  Building, 
  UserCheck,
  Shield,
  RefreshCw,
  LogOut,
  Dumbbell,
  Sparkles,
  Bell,
  FileText,
  Calendar,
  MapPin,
  Award,
  Star
} from 'lucide-react'
import { toast } from 'react-hot-toast'

// Move getNextSteps outside the component since it doesn't depend on component state
const getNextSteps = (userType) => {
  const steps = [
    {
      icon: <Bell className="w-5 h-5" />,
      title: 'Check your email',
      description: 'We\'ll send approval notifications to your registered email'
    }
  ]

  switch (userType) {
    case 'gym_owner':
      steps.push(
        {
          icon: <FileText className="w-5 h-5" />,
          title: 'Admin review',
          description: 'Our admin team is reviewing your gym registration details'
        },
        {
          icon: <Building className="w-5 h-5" />,
          title: 'Setup your gym',
          description: 'Once approved, you can set up your gym profile and services'
        }
      )
      break
    
    case 'trainer':
      steps.push(
        {
          icon: <Award className="w-5 h-5" />,
          title: 'Gym owner review',
          description: 'The gym owner is reviewing your trainer application'
        },
        {
          icon: <Star className="w-5 h-5" />,
          title: 'Profile verification',
          description: 'Your certifications and experience are being verified'
        }
      )
      break
    
    case 'member':
      steps.push(
        {
          icon: <UserCheck className="w-5 h-5" />,
          title: 'Gym approval',
          description: 'Your selected gym is reviewing your membership request'
        },
        {
          icon: <Calendar className="w-5 h-5" />,
          title: 'Membership setup',
          description: 'Once approved, you can choose membership plans and schedule'
        }
      )
      break
  }

  steps.push(
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Account security',
      description: 'Your account security settings are being configured'
    }
  )

  return steps
}

// Helper function to get initial data
const getInitialData = (user) => {
  const userType = user?.userType || 'member'
  const initialSteps = getNextSteps(userType)
  
  return {
    status: user?.status || 'pending',
    userType: userType,
    email: user?.email || '',
    name: user?.profile?.firstName ? 
      `${user.profile.firstName} ${user.profile.lastName || ''}`.trim() : 
      user?.email?.split('@')[0] || '',
    appliedDate: user?.createdAt || new Date().toISOString(),
    estimatedWaitTime: '24-48 hours',
    adminContact: 'ak676964@gmail.com',
    supportPhone: '7903983741',
    nextSteps: initialSteps,
    ...(user?.profile || {})
  }
}

const WaitingApprovalPage = () => {
  const router = useRouter()
  const { user, token, logout } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [statusData, setStatusData] = useState(() => getInitialData(user))
  const hasCheckedInitialStatus = useRef(false)
  
  // 1️⃣ Declare handleActiveStatus FIRST
  const handleActiveStatus = useCallback((userData) => {
    toast.success(`🎉 Account activated! Welcome to FitnessHub!`)

    setTimeout(() => {
      switch (userData.userType) {
        case 'gym_owner':
          router.push('/dashboard/gymOwner')
          break
        case 'trainer':
          router.push('/dashboard/trainer')
          break
        case 'member':
          router.push('/dashboard/member')
          break
        default:
          router.push('/')
      }
    }, 100)
  }, [router])

  // 2️⃣ Then declare checkUserStatus
  const checkUserStatus = useCallback(async () => {
    if (!token) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()

        if (data.user) {
          const newStatus = data.user.status

          setStatusData(prev => ({
            ...prev,
            status: newStatus,
            ...data.user,
          }))

          if (newStatus === 'active') {
            handleActiveStatus(data.user)
          }
        }
      }
    } catch (err) {
      console.error('❌ Error checking status:', err)
    }
  }, [token, handleActiveStatus])

  // Handle authentication redirect
  useEffect(() => {
    if (!user || !token) {
      router.push('/signup')
      return
    }
  }, [user, token, router])

  // Set up periodic status check - EVERY 5 SECONDS
  useEffect(() => {
    if (!token) return

    // Initial check (only once)
    if (!hasCheckedInitialStatus.current) {
      console.log('🚀 Initial status check...')
      
      hasCheckedInitialStatus.current = true
    }

    console.log('🔄 Starting periodic status checks...')
    const checkInterval = setInterval(() => {
      console.log('🔄 Auto-checking status...')
      checkUserStatus()
    }, 5000) // Check every 5 seconds

    return () => {
      console.log('🧹 Cleaning up interval...')
      clearInterval(checkInterval)
    }
  }, [token, checkUserStatus])

  const handleRefreshStatus = async () => {
    setLoading(true)
    await checkUserStatus()
    toast.success('Status refreshed')
    setLoading(false)
  }

  const handleLogout = () => {
    logout()
    router.push('/loginpage')
  }

  const handleContactSupport = () => {
    const subject = encodeURIComponent(`Account Approval - ${statusData.name} (${statusData.userType})`)
    const body = encodeURIComponent(
      `Hello Support Team,\n\nI am writing regarding my account approval status.\n\n` +
      `Name: ${statusData.name}\n` +
      `Email: ${statusData.email}\n` +
      `User Type: ${statusData.userType}\n` +
      `Status: ${statusData.status}\n` +
      `Applied Date: ${new Date(statusData.appliedDate).toLocaleDateString()}\n\n` +
      `Please let me know if you need any additional information.\n\nThank you,\n${statusData.name}`
    )
    window.location.href = `mailto:${statusData.adminContact}?subject=${subject}&body=${body}`
  }

  const getUserTypeInfo = () => {
    switch (statusData.userType) {
      case 'gym_owner':
        return {
          title: 'Gym Owner Registration',
          subtitle: 'Your gym is under review',
          icon: <Building className="w-12 h-12 text-red-500" />,
          color: 'from-red-500 to-orange-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          description: 'Our admin team is reviewing your gym registration. This usually takes 24-48 hours.'
        }
      case 'trainer':
        return {
          title: 'Trainer Application',
          subtitle: 'Your profile is being reviewed',
          icon: <UserCheck className="w-12 h-12 text-blue-500" />,
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          description: 'The gym owner is reviewing your trainer application. You\'ll be notified once approved.'
        }
      default:
        return {
          title: 'Membership Application',
          subtitle: 'Your membership is pending',
          icon: <User className="w-12 h-12 text-green-500" />,
          color: 'from-green-500 to-emerald-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          description: 'Your selected gym is reviewing your membership request. This usually takes 24 hours.'
        }
    }
  }

  const getStatusIcon = () => {
    switch (statusData.status) {
      case 'active':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'rejected':
      case 'suspended':
        return <XCircle className="w-6 h-6 text-red-500" />
      default:
        return <Clock className="w-6 h-6 text-yellow-500" />
    }
  }

  const getStatusMessage = () => {
    const userTypeInfo = getUserTypeInfo()
    
    switch (statusData.status) {
      case 'pending':
        return {
          title: `Your ${userTypeInfo.title.toLowerCase()} is pending`,
          message: `Your application is currently under review. ${userTypeInfo.description}`,
          icon: <Clock className="w-8 h-8 text-yellow-500" />,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20'
        }
      case 'active':
        return {
          title: '🎉 Account Activated!',
          message: 'Your account has been approved. You will be redirected to your dashboard shortly.',
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20'
        }
      case 'rejected':
        return {
          title: 'Application Rejected',
          message: 'Your application has been rejected. Please contact support for more information.',
          icon: <XCircle className="w-8 h-8 text-red-500" />,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20'
        }
      case 'inactive':
        return {
          title: 'Account Inactive',
          message: 'Your account has been marked as inactive. Please contact support to reactivate.',
          icon: <AlertCircle className="w-8 h-8 text-gray-500" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20'
        }
      default:
        return {
          title: 'Pending Review',
          message: 'Your application is being processed.',
          icon: <Clock className="w-8 h-8 text-yellow-500" />,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20'
        }
    }
  }

  // Add debug panel to see what's happening
  const userTypeInfo = getUserTypeInfo()
  const statusMessage = getStatusMessage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="p-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl">
              <Dumbbell className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Fitness<span className="text-red-500">Hub</span>
              </h1>
              <p className="text-gray-400 text-sm">Account Activation Status</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefreshStatus}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg transition-colors flex items-center text-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Now
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-lg transition-colors flex items-center text-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Rest of the JSX remains the same... */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Status Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border ${statusMessage.borderColor} shadow-xl`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${statusMessage.bgColor}`}>
                    {statusMessage.icon}
                  </div>
                  <div>
                    <h2 className={`text-xl md:text-2xl font-bold ${statusMessage.color}`}>
                      {statusMessage.title}
                    </h2>
                    <p className="text-gray-300 mt-1">{statusMessage.message}</p>
                    {statusData.status === 'active' && (
                      <div className="mt-2 text-sm text-green-400 animate-pulse">
                        🚀 Redirecting to dashboard...
                      </div>
                    )}
                  </div>
                </div>
                <div className={`p-2 rounded-lg ${statusMessage.bgColor}`}>
                  {getStatusIcon()}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>Application Progress</span>
                  <span>{statusData.status === 'active' ? '100%' : '75%'}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${userTypeInfo.color} transition-all duration-1000`}
                    style={{ width: statusData.status === 'active' ? '100%' : '75%' }}
                  ></div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="grid grid-cols-3 gap-4">
                <div className={`text-center p-3 rounded-lg ${statusData.status === 'pending' ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30' : 'bg-gray-800/50'}`}>
                  <div className="text-lg font-bold">1</div>
                  <div className="text-xs text-gray-300 mt-1">Applied</div>
                  <div className="text-xs text-gray-500">
                    {new Date(statusData.appliedDate).toLocaleDateString()}
                  </div>
                </div>
                <div className={`text-center p-3 rounded-lg ${statusData.status === 'pending' ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30' : 'bg-gray-800/50'}`}>
                  <div className="text-lg font-bold">2</div>
                  <div className="text-xs text-gray-300 mt-1">Review</div>
                  <div className="text-xs text-gray-500">In Progress</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${statusData.status === 'active' ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30' : 'bg-gray-800/50'}`}>
                  <div className="text-lg font-bold">3</div>
                  <div className="text-xs text-gray-300 mt-1">Approved</div>
                  <div className="text-xs text-gray-500">
                    {statusData.status === 'active' ? 'Completed' : 'Pending'}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 shadow-xl">
              <h3 className="text-lg md:text-xl font-bold mb-6 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                Next Steps
              </h3>
              
              <div className="space-y-4">
                {statusData.nextSteps.map((step, index) => (
                  <div 
                    key={index} 
                    className="flex items-start space-x-4 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${userTypeInfo.color} bg-opacity-20 mt-1`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{step.title}</h4>
                      <p className="text-gray-400 text-sm mt-1">{step.description}</p>
                    </div>
                    <div className="text-gray-500 text-xs">
                      Step {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 shadow-xl">
              <h3 className="text-lg md:text-xl font-bold mb-6 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-500" />
                Contact & Support
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Email Support</h4>
                      <p className="text-gray-400 text-sm">For account inquiries</p>
                    </div>
                  </div>
                  <button
                    onClick={handleContactSupport}
                    className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-blue-400 transition-colors text-sm"
                  >
                    Email Support Team
                  </button>
                </div>
                
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Phone className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Phone Support</h4>
                      <p className="text-gray-400 text-sm">Available 9AM-6PM EST</p>
                    </div>
                  </div>
                  <a 
                    href={`tel:${statusData.supportPhone}`}
                    className="block w-full py-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg text-green-400 transition-colors text-sm text-center"
                  >
                    Call: {statusData.supportPhone}
                  </a>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">Need Help Urgently?</h4>
                    <p className="text-gray-300 text-sm mt-1">
                      For urgent matters, please mention &apos;Urgent&apos; in your email subject and include your account details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - User Information */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 shadow-xl">
              <div className="text-center mb-6">
                <div className="inline-block p-4 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 mb-3">
                  {userTypeInfo.icon}
                </div>
                <h3 className="text-xl font-bold">{statusData.name}</h3>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 bg-gradient-to-r ${userTypeInfo.color} bg-opacity-20`}>
                  {userTypeInfo.title}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-300">Email</span>
                  </div>
                  <span className="text-sm font-medium truncate ml-2">{statusData.email}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-300">Applied</span>
                  </div>
                  <span className="text-sm">
                    {new Date(statusData.appliedDate).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-300">Wait Time</span>
                  </div>
                  <span className="text-sm">{statusData.estimatedWaitTime}</span>
                </div>
                
                {statusData.userType === 'gym_owner' && statusData.gymName && (
                  <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-gray-300">Gym Name</span>
                    </div>
                    <span className="text-sm font-medium">{statusData.gymName}</span>
                  </div>
                )}
                
                {statusData.address && (
                  <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-gray-300">Location</span>
                    </div>
                    <span className="text-sm text-right">
                      {statusData.address.city}, {statusData.address.state}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 shadow-xl">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleContactSupport}
                  className="w-full p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg flex items-center justify-center text-blue-400 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </button>
                
                <button
                  onClick={() => router.push('')}
                  className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-300 transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View FAQ
                </button>
                
                <button
                  onClick={() => router.push('/loginpage')}
                  className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-300 transition-colors"
                >
                  <User className="w-4 h-4 mr-2" />
                  Update Profile
                </button>
              </div>
            </div>

            {/* Estimated Timeline */}
            <div className={`bg-gradient-to-br ${userTypeInfo.bgColor} backdrop-blur-xl rounded-2xl p-6 border ${userTypeInfo.borderColor} shadow-xl`}>
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Estimated Timeline
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Application Review</span>
                  <span className="font-medium">24-48 hours</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Verification Process</span>
                  <span className="font-medium">1-2 business days</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Account Activation</span>
                  <span className="font-medium">Immediate after approval</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Timeline may vary based on verification requirements
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>
            Need immediate assistance? Call our support line: {statusData.supportPhone} | 
            Email: {statusData.adminContact}
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} FitnessHub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default WaitingApprovalPage