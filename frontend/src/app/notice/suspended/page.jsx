'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import useUserStore from '@/store/useUserStore'
import { 
  AlertTriangle, 
  ShieldAlert, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  Clock, 
  FileText,
  RefreshCw,
  LogOut,
  Dumbbell,
  AlertCircle,
  Shield,
  XCircle,
  ChevronRight,
  ExternalLink,
  HelpCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const SuspendedAccountPage = () => {
  const router = useRouter()
  const { user, token, logout } = useUserStore()
  const [loading, setLoading] = useState(false)
  
  // Initialize all data directly in the initial state - NO useEffect needed
  const [suspensionData] = useState(() => {
    const now = Date.now()
    
    const violations = [
      {
        id: 1,
        type: 'Terms Violation',
        description: 'Multiple fake or misleading profile entries',
        
      },
      {
        id: 2,
        type: 'Content Policy',
        description: 'Inappropriate content posted',
        
      }
    ]

    const stepsToReinstate = [
      { title: 'Review Violations', status: 'pending' },
      { title: 'Submit Appeal', status: 'pending' },
      { title: 'Await Review', status: 'pending' }
    ]
    
    return {
      status: 'suspended',
      reason: 'Violation of Terms of Service',
      suspensionDate: new Date(now).toISOString(),
      reviewDate: new Date(now + 7 * 86400000).toISOString(),
      appealDeadline: new Date(now + 3 * 86400000).toISOString(),
      adminContact: 'ak676964@gmail.com',
      supportPhone: '7903983741',
      caseId: `CASE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      violations,
      stepsToReinstate
    }
  })

  const checkAccountStatus = useCallback(async () => {
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
          
          if (newStatus === 'active') {
            toast.success('🎉 Your account has been reinstated!')
            setTimeout(() => {
              switch (data.user.userType) {
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
          }
        }
      }
    } catch (err) {
      console.error('❌ Error checking status:', err)
    }
  }, [token, router])

  const handleRefreshStatus = async () => {
    setLoading(true)
    await checkAccountStatus()
    toast.success('Status refreshed')
    setLoading(false)
  }

  const handleLogout = () => {
    logout()
    router.push('/loginpage')
  }

  const handleSubmitAppeal = () => {
    const subject = encodeURIComponent(`Account Suspension Appeal - Case ${suspensionData.caseId}`)
    const body = encodeURIComponent(
      `Hello Support Team,\n\nI am writing to appeal my account suspension.\n\n` +
      `Case ID: ${suspensionData.caseId}\n` +
      `Name: ${user?.email?.split('@')[0] || 'User'}\n` +
      `Email: ${user?.email || ''}\n` +
      `User Type: ${user?.userType || 'member'}\n` +
      `Suspension Date: ${new Date(suspensionData.suspensionDate).toLocaleDateString()}\n` +
      `Reason: ${suspensionData.reason}\n\n` +
      `My Appeal:\n` +
      `[Please explain your situation and why you believe the suspension should be lifted. Provide any relevant information or context.]\n\n` +
      `I understand the importance of following FitnessHub's terms of service and community guidelines. ` +
      `I assure you that I will comply with all policies moving forward.\n\n` +
      `Thank you for reviewing my appeal.\n\nSincerely,\n${user?.email?.split('@')[0] || 'User'}`
    )
    window.location.href = `mailto:${suspensionData.adminContact}?subject=${subject}&body=${body}`
  }

  const handleContactSupport = () => {
    const subject = encodeURIComponent(`Suspended Account Inquiry - ${suspensionData.caseId}`)
    const body = encodeURIComponent(
      `Hello Support Team,\n\nI have questions about my suspended account.\n\n` +
      `Case ID: ${suspensionData.caseId}\n` +
      `Name: ${user?.email?.split('@')[0] || 'User'}\n` +
      `Email: ${user?.email || ''}\n` +
      `Suspension Date: ${new Date(suspensionData.suspensionDate).toLocaleDateString()}\n\n` +
      `My Question:\n` +
      `[Please describe your question or concern here]\n\n` +
      `Thank you,\n${user?.email?.split('@')[0] || 'User'}`
    )
    window.location.href = `mailto:${suspensionData.adminContact}?subject=${subject}&body=${body}`
  }

  const handleViewTerms = () => {
    toast('Redirecting to Terms of Service...', {
      icon: '📄',
    })
    // In a real app, this would navigate to your terms page
    window.open('/terms', '_blank')
  }

  const handleViewGuidelines = () => {
    toast('Redirecting to Community Guidelines...', {
      icon: '📋',
    })
    // In a real app, this would navigate to your guidelines page
    window.open('/guidelines', '_blank')
  }

  // Auto-check status periodically
  useEffect(() => {
    if (!token) return

    const checkInterval = setInterval(() => {
      checkAccountStatus()
    }, 5000) 

    return () => clearInterval(checkInterval)
  }, [token, checkAccountStatus])

  
  useEffect(() => {
    if (user && user.status == 'active') {
      router.push('/dashboard/gymOwner')
    }
  }, [user, router])

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
              <p className="text-gray-400 text-sm">Account Suspension Center</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefreshStatus}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg transition-colors flex items-center text-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Status
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Suspension Alert Card */}
            <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30 shadow-xl">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-red-500/20">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-red-400">
                      Account Suspended
                    </h2>
                    <p className="text-gray-300 mt-1">
                      Your FitnessHub account has been suspended due to violations of our terms of service.
                    </p>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Lock className="w-6 h-6 text-red-400" />
                </div>
              </div>

              {/* Critical Information */}
              <div className="space-y-4">
                <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/20">
                  <h3 className="font-bold text-red-300 mb-2 flex items-center">
                    <XCircle className="w-4 h-4 mr-2" />
                    Suspension Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-400 text-sm">Reason</p>
                      <p className="font-medium">{suspensionData.reason}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Case ID</p>
                      <p className="font-medium font-mono">{suspensionData.caseId}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Suspended On</p>
                      <p className="font-medium">
                        {new Date(suspensionData.suspensionDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Appeal Deadline</p>
                      <p className="font-medium text-yellow-400">
                        {new Date(suspensionData.appealDeadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Immediate Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleSubmitAppeal}
                    className="p-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-lg transition-all flex items-center justify-center group"
                  >
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 mr-3" />
                      <span className="font-semibold">Submit Appeal</span>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  
                  <button
                    onClick={handleContactSupport}
                    className="p-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg transition-all flex items-center justify-center group"
                  >
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 mr-3" />
                      <span className="font-semibold">Contact Support</span>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
            </div>

            {/* Violations List */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 shadow-xl">
              <h3 className="text-lg md:text-xl font-bold mb-6 flex items-center">
                <ShieldAlert className="w-5 h-5 mr-2 text-red-500" />
                Policy Violations
              </h3>
              
              <div className="space-y-3">
                {suspensionData.violations.map((violation) => (
                  <div 
                    key={violation.id} 
                    className="p-4 bg-red-900/10 hover:bg-red-900/20 rounded-lg border border-red-500/20 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                          <span className="font-semibold text-red-400">{violation.type}</span>
                         
                        </div>
                        <p className="text-gray-300 mt-2 ml-4">{violation.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  These violations were detected by our automated systems or reported by community members.
                </p>
              </div>
            </div>

            {/* Reinstatement Process */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 shadow-xl">
              <h3 className="text-lg md:text-xl font-bold mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-yellow-500" />
                Reinstatement Process
              </h3>
              
              <div className="space-y-4">
                {suspensionData.stepsToReinstate.map((step, index) => (
                  <div 
                    key={index} 
                    className="flex items-start space-x-4 p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white">{step.title}</h4>
                        <span className="text-yellow-400 text-xs font-medium px-2 py-1 bg-yellow-500/10 rounded">
                          {step.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-500 text-lg font-bold">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30 shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Account Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-300">Account Status</span>
                  </div>
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold">
                    SUSPENDED
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-300">Email</span>
                  </div>
                  <span className="text-sm font-medium truncate">{user?.email || 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-300">Next Review</span>
                  </div>
                  <span className="text-sm">
                    {new Date(suspensionData.reviewDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Important Links */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-blue-500" />
                Important Links
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleViewTerms}
                  className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-between text-gray-300 transition-colors group"
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-3" />
                    <span>Terms of Service</span>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                
                <button
                  onClick={handleViewGuidelines}
                  className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-between text-gray-300 transition-colors group"
                >
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-3" />
                    <span>Community Guidelines</span>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                
                <button
                  onClick={() => router.push('/faq')}
                  className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-between text-gray-300 transition-colors group"
                >
                  <div className="flex items-center">
                    <HelpCircle className="w-4 h-4 mr-3" />
                    <span>FAQs</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30 shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Contact Support
              </h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Mail className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Email</h4>
                      <p className="text-gray-400 text-sm">{suspensionData.adminContact}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Phone className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Phone</h4>
                      <p className="text-gray-400 text-sm">{suspensionData.supportPhone}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-200 text-sm">
                    <strong>Note:</strong> Appeal responses may take 3-5 business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Appeal Tips */}
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-800/10 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20 shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-green-400" />
                Appeal Tips
              </h3>
              
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-300 text-sm">Be honest and specific in your explanation</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-300 text-sm">Include any relevant evidence or context</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-300 text-sm">Acknowledge any mistakes made</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-300 text-sm">Explain how youapos;ll prevent future violations</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-300 text-sm">Submit your appeal before the deadline</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>
            For immediate assistance, contact our support team at {suspensionData.supportPhone} or email {suspensionData.adminContact}
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} FitnessHub. All rights reserved. We take community safety seriously.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SuspendedAccountPage