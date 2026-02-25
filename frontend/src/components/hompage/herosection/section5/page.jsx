// components/FeaturesSection.jsx
'use client';

import { 
  Shield, 
  Building2, 
  CreditCard, 
  BarChart3, 
  Calendar, 
  Target, 
  Bell, 
  Users,
  Lock,
  Cpu,
  Zap,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      number: "01",
      icon: Shield,
      title: "Secure Authentication & Role-Based Access",
      description: "Enterprise-grade security with granular permission controls for each user role.",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      gradient: "from-purple-500/10 via-purple-500/5 to-transparent"
    },
    {
      number: "02",
      icon: Building2,
      title: "Multi-Gym Management",
      description: "Manage multiple gym locations from a single centralized platform.",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent"
    },
    {
      number: "03",
      icon: CreditCard,
      title: "Membership & Payment Management",
      description: "Automated billing, subscription plans, and payment tracking.",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent"
    },
    {
      number: "04",
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Comprehensive insights into revenue, attendance, and member engagement.",
      color: "text-[#DAFF00]",
      bgColor: "bg-[#DAFF00]/10",
      borderColor: "border-[#DAFF00]/30",
      gradient: "from-[#DAFF00]/10 via-[#DAFF00]/5 to-transparent"
    },
    {
      number: "05",
      icon: Calendar,
      title: "Scheduling & Attendance",
      description: "Smart class scheduling with automated attendance tracking.",
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/30",
      gradient: "from-rose-500/10 via-rose-500/5 to-transparent"
    },
    {
      number: "06",
      icon: Target,
      title: "Progress & Health Tracking",
      description: "Track member progress, goals, and fitness metrics in real-time.",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      gradient: "from-cyan-500/10 via-cyan-500/5 to-transparent"
    },
    {
      number: "07",
      icon: Bell,
      title: "Notifications & Email Automation",
      description: "Automated reminders, updates, and communication workflows.",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent"
    },
    {
      number: "08",
      icon: Users,
      title: "Team Collaboration",
      description: "Seamless coordination between owners, trainers, and members.",
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/30",
      gradient: "from-violet-500/10 via-violet-500/5 to-transparent"
    }
  ];

  const highlightedFeatures = [
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Bank-level encryption & compliance",
      color: "text-purple-400"
    },
    {
      icon: Cpu,
      title: "Cloud Infrastructure",
      description: "99.9% uptime with global CDN",
      color: "text-blue-400"
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "Instant updates across all dashboards",
      color: "text-[#DAFF00]"
    },
    {
      icon: TrendingUp,
      title: "Scalable Architecture",
      description: "Grow from 1 to 1000+ gyms seamlessly",
      color: "text-emerald-400"
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
            <span className="text-white">Everything You Need to </span>
            <span className="text-[#DAFF00]">Scale</span>
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto px-2">
            SaaS-grade features built for real fitness businesses, not demos.
          </p>
        </div>

        {/* Features Grid - 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-20">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`bg-gradient-to-b ${feature.gradient} border ${feature.borderColor} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 transition-all duration-300 hover:scale-[1.01] lg:hover:scale-[1.02] hover:shadow-2xl group h-full`}
            >
              {/* Number Badge */}
              <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${feature.bgColor} border ${feature.borderColor} mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                <span className={`text-sm sm:text-lg font-bold ${feature.color}`}>{feature.number}</span>
              </div>

              {/* Icon and Title */}
              <div className="flex items-start gap-3 mb-3 sm:mb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center shrink-0`}>
                  <feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.color}`} />
                </div>
                <h3 className={`text-base sm:text-lg font-bold ${feature.color} leading-tight`}>
                  {feature.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
                {feature.description}
              </p>

              {/* Feature Indicators */}
              <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-800/50">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">SaaS-grade</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${feature.color} animate-pulse`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Platform Architecture - stack on mobile */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-950 border border-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 mb-10 sm:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-start">
            {/* Left Column - Highlights */}
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">
                <span className="text-[#DAFF00]">Enterprise-Ready</span> Platform Architecture
              </h3>
              
              <div className="space-y-4 sm:space-y-6">
                {highlightedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${feature.color.replace('text', 'bg')}/10 border ${feature.color.replace('text', 'border')}/30 flex items-center justify-center shrink-0`}>
                      <feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.color}`} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">{feature.title}</h4>
                      <p className="text-gray-400 text-xs sm:text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Platform Stats */}
            <div className="bg-black/50 rounded-xl p-4 sm:p-5 md:p-6 border border-gray-800">
              <h4 className="text-white font-bold text-base sm:text-lg mb-4 sm:mb-6 text-center">Platform Capabilities</h4>
              
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#DAFF00] mb-2">∞</div>
                  <p className="text-gray-400 text-sm">Scalable Users</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">99.9%</div>
                  <p className="text-gray-400 text-sm">Platform Uptime</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">1000+</div>
                  <p className="text-gray-400 text-sm">Gyms Supported</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">&lt;100ms</div>
                  <p className="text-gray-400 text-sm">Real-time Sync</p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3 sm:space-y-4 mt-6 sm:mt-8">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>System Reliability</span>
                    <span>99.9%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#DAFF00] rounded-full" style={{ width: '99.9%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Data Security</span>
                    <span>100%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full w-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>User Satisfaction</span>
                    <span>98%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section - mobile friendly */}
        <div className="text-center px-2">
          <div className="max-w-2xl mx-auto mb-8 sm:mb-10">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
              Ready to Scale Your Fitness Business?
            </h3>
            <p className="text-gray-400 text-sm sm:text-base">
              Join hundreds of fitness businesses that trust Zelvoo to power their growth.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DAFF00] disabled:pointer-events-none disabled:opacity-50 shadow min-h-[48px] sm:h-14 bg-[#DAFF00] text-black hover:bg-[#c5e600] active:opacity-90 rounded-xl font-semibold px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
              Start Scaling Now
            </button>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DAFF00] disabled:pointer-events-none disabled:opacity-50 border shadow-sm min-h-[48px] sm:h-14 border-gray-700 text-white hover:border-[#DAFF00] hover:text-[#DAFF00] hover:bg-[#DAFF00]/10 active:bg-[#DAFF00]/20 rounded-xl px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
              Schedule Platform Demo
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#DAFF00] animate-pulse"></div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>30-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span>Enterprise support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}