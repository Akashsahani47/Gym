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
    <section className="py-24 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-white">Manage Your Complete </span>
            <span className="text-[#DAFF00]">Fitness Platform</span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            While other tools only serve gym owners, Zelvoo gives you complete control over your entire fitness platform ecosystem.
          </p>
        </div>

        {/* Comparison Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-24">
          {/* Traditional Platforms Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <X className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Traditional Gym Software</h3>
            </div>
            
            <div className="space-y-4 mb-8">
              {traditionalLimitations.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <p className="text-gray-300">{item}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <p className="text-gray-400 text-sm text-center">
                Built for <span className="text-purple-400">single gyms</span>, not platform owners
              </p>
            </div>
          </div>

          {/* Zelvoo Platform Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            {/* Accent Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DAFF00] via-green-500 to-emerald-500"></div>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#DAFF00]/10 border border-[#DAFF00]/30 flex items-center justify-center">
                <Check className="w-6 h-6 text-[#DAFF00]" />
              </div>
              <h3 className="text-2xl font-bold text-white">Zelvoo Platform</h3>
            </div>
            
            <div className="space-y-4 mb-8">
              {zelvooAdvantages.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#DAFF00]/10 border border-[#DAFF00]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#DAFF00]" />
                  </div>
                  <p className="text-gray-300">{item}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#DAFF00]/5 rounded-xl p-4 border border-[#DAFF00]/20">
              <p className="text-[#DAFF00] text-sm text-center font-medium">
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