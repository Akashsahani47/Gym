// components/WhyDifferent.jsx
'use client';

import { Check, X, Shield, Building, Users, User, Settings, BarChart3, FileCheck, Globe, Cpu, Database } from 'lucide-react';

export default function WhyDifferent() {
  const traditionalLimitations = [
    "Only gym owner dashboards",
    "No platform-level control",
    "Limited gym verification system",
    "Disconnected ecosystem",
    "Manual onboarding processes"
  ];

  const zelvooAdvantages = [
    "Central platform management dashboard",
    "Automated gym verification & approval",
    "Complete user hierarchy control",
    "Unified billing & subscription system",
    "Real-time platform analytics"
  ];

  const whatYouManage = [
    {
      icon: FileCheck,
      title: "Gym Onboarding",
      description: "Review, verify, and approve gym applications automatically",
      color: "text-[#DAFF00]",
      bgColor: "bg-[#DAFF00]/10",
      borderColor: "border-[#DAFF00]/30"
    },
    {
      icon: Users,
      title: "User Management",
      description: "Manage all gym owners, trainers, and members across platform",
      color: "text-[#DAFF00]",
      bgColor: "bg-[#DAFF00]/10",
      borderColor: "border-[#DAFF00]/30"
    },
    {
      icon: BarChart3,
      title: "Platform Analytics",
      description: "Monitor revenue, growth, and performance across all gyms",
      color: "text-[#DAFF00]",
      bgColor: "bg-[#DAFF00]/10",
      borderColor: "border-[#DAFF00]/30"
    },
    {
      icon: Settings,
      title: "System Control",
      description: "Configure subscription plans, permissions, and settings",
      color: "text-[#DAFF00]",
      bgColor: "bg-[#DAFF00]/10",
      borderColor: "border-[#DAFF00]/30"
    }
  ];

  const ecosystemFlow = [
    {
      step: "1",
      title: "Gym Owners Sign Up",
      description: "Gym owners register on your platform",
      icon: Building,
      color: "text-purple-400"
    },
    {
      step: "2",
      title: "You Verify & Approve",
      description: "You review and approve gym applications",
      icon: Shield,
      color: "text-[#DAFF00]"
    },
    {
      step: "3",
      title: "Owners Add Teams",
      description: "Approved gyms add their trainers and members",
      icon: Users,
      color: "text-blue-400"
    },
    {
      step: "4",
      title: "Everyone Gets Dashboards",
      description: "Each role gets their dedicated interface",
      icon: Cpu,
      color: "text-emerald-400"
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
            <span className="text-white">Manage Your Complete </span>
            <span className="text-[#DAFF00]">Fitness Platform</span>
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto px-2">
            While other tools only serve gym owners, Zelvoo gives you complete control over your entire fitness platform ecosystem.
          </p>
        </div>

        {/* Comparison Section - flex row on all screens, compact on mobile */}
        <div className="flex flex-row gap-2 sm:gap-6 lg:gap-8 mb-16 sm:mb-24">
          {/* Traditional Platforms Card */}
          <div className="flex-1 min-w-0 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-lg sm:rounded-xl lg:rounded-2xl p-2.5 sm:p-6 md:p-8 shadow-2xl">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-8">
              <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                <X className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-red-400" />
              </div>
              <h3 className="text-xs sm:text-xl md:text-2xl font-bold text-white leading-tight">Traditional Gym Software</h3>
            </div>
            
            <div className="space-y-1.5 sm:space-y-4 mb-3 sm:mb-8">
              {traditionalLimitations.map((item, index) => (
                <div key={index} className="flex items-start gap-2 sm:gap-3">
                  <div className="w-3.5 h-3.5 sm:w-6 sm:h-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-2 h-2 sm:w-3.5 sm:h-3.5 text-red-400" />
                  </div>
                  <p className="text-gray-300 text-xs sm:text-base leading-tight">{item}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-900/50 rounded-lg sm:rounded-xl p-2 sm:p-4 border border-gray-800">
              <p className="text-gray-400 text-xs sm:text-sm text-center leading-tight">
                Built for <span className="text-purple-400">single gyms</span>, not platform owners
              </p>
            </div>
          </div>

          {/* Zelvoo Platform Card */}
          <div className="flex-1 min-w-0 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-lg sm:rounded-xl lg:rounded-2xl p-2.5 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Accent Border */}
            <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-[#DAFF00] via-green-500 to-emerald-500"></div>
            
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-8">
              <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#DAFF00]/10 border border-[#DAFF00]/30 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-[#DAFF00]" />
              </div>
              <h3 className="text-xs sm:text-xl md:text-2xl font-bold text-white leading-tight">Zelvoo Platform</h3>
            </div>
            
            <div className="space-y-1.5 sm:space-y-4 mb-3 sm:mb-8">
              {zelvooAdvantages.map((item, index) => (
                <div key={index} className="flex items-start gap-2 sm:gap-3">
                  <div className="w-3.5 h-3.5 sm:w-6 sm:h-6 rounded-full bg-[#DAFF00]/10 border border-[#DAFF00]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2 h-2 sm:w-3.5 sm:h-3.5 text-[#DAFF00]" />
                  </div>
                  <p className="text-gray-300 text-xs sm:text-base leading-tight">{item}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#DAFF00]/5 rounded-lg sm:rounded-xl p-2 sm:p-4 border border-[#DAFF00]/20">
              <p className="text-[#DAFF00] text-xs sm:text-sm text-center font-medium leading-tight">
                Built for <span className="font-bold">platform owners</span> who manage multiple gyms
              </p>
            </div>
          </div>
        </div>

       
       

        {/* Final CTA */}
       
      </div>
    </section>
  );
}