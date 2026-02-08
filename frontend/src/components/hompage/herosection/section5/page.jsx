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
    <section className="py-24 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-white">Everything You Need to </span>
            <span className="text-[#DAFF00]">Scale</span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            SaaS-grade features built for real fitness businesses, not demos.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`bg-gradient-to-b ${feature.gradient} border ${feature.borderColor} rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group h-full`}
            >
              {/* Number Badge */}
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${feature.bgColor} border ${feature.borderColor} mb-4 group-hover:scale-110 transition-transform`}>
                <span className={`text-lg font-bold ${feature.color}`}>{feature.number}</span>
              </div>

              {/* Icon and Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className={`text-lg font-bold ${feature.color} leading-tight`}>
                  {feature.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-6">
                {feature.description}
              </p>

              {/* Feature Indicators */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800/50">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">SaaS-grade</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${feature.color} animate-pulse`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Platform Architecture */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Highlights */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-8">
                <span className="text-[#DAFF00]">Enterprise-Ready</span> Platform Architecture
              </h3>
              
              <div className="space-y-6">
                {highlightedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${feature.color.replace('text', 'bg')}/10 border ${feature.color.replace('text', 'border')}/30 flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Platform Stats */}
            <div className="bg-black/50 rounded-xl p-6 border border-gray-800">
              <h4 className="text-white font-bold text-lg mb-6 text-center">Platform Capabilities</h4>
              
              <div className="grid grid-cols-2 gap-6">
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
              <div className="space-y-4 mt-8">
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

        {/* CTA Section */}
        <div className="text-center">
          <div className="max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Scale Your Fitness Business?
            </h3>
            <p className="text-gray-400">
              Join hundreds of fitness businesses that trust Zelvoo to power their growth.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DAFF00] disabled:pointer-events-none disabled:opacity-50 shadow h-14 bg-[#DAFF00] text-black hover:bg-[#c5e600] rounded-xl font-semibold px-8 py-6 text-lg">
              Start Scaling Now
            </button>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DAFF00] disabled:pointer-events-none disabled:opacity-50 border shadow-sm h-14 border-gray-700 text-white hover:border-[#DAFF00] hover:text-[#DAFF00] hover:bg-[#DAFF00]/10 rounded-xl px-8 py-6 text-lg">
              Schedule Platform Demo
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
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