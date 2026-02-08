// components/DashboardsSection.jsx
'use client';

import { Building, Users, User, CheckCircle, DollarSign, Target, Heart, Calendar, Clock, MessageSquare, Zap } from 'lucide-react';

export default function DashboardsSection() {
  const dashboards = [
    {
      icon: Building,
      title: "Gym Owner Dashboard",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      gradient: "from-purple-500/10 to-gray-900",
      features: [
        "Manage multiple gyms",
        "Add trainers & members",
        "Create membership plans",
        "Track revenue & attendance",
        "Gym analytics & reports",
        "Billing & subscriptions"
      ],
      accentIcon: DollarSign,
      tagline: "Business Control Center"
    },
    {
      icon: Users,
      title: "Trainer Dashboard",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      gradient: "from-blue-500/10 to-gray-900",
      features: [
        "Assigned members",
        "Workout plans & schedules",
        "Progress tracking",
        "Availability management",
        "Trainer profile & certifications"
      ],
      accentIcon: Target,
      tagline: "Training Command Center"
    },
    {
      icon: User,
      title: "Member Dashboard",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      gradient: "from-emerald-500/10 to-gray-900",
      features: [
        "Workout plans",
        "Class bookings",
        "Progress tracking",
        "Nutrition & meal plans",
        "Trainer communication",
        "Membership details"
      ],
      accentIcon: Heart,
      tagline: "Personal Fitness Hub"
    }
  ];

  return (
    <section className=" px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
         
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-white">Three Dashboards. </span>
            <span className="text-[#DAFF00]">One Seamless Platform.</span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Every role gets a dedicated interface designed specifically for their needs, all connected in one intelligent platform.
          </p>
        </div>

        {/* Three Dashboard Cards - Horizontal Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {dashboards.map((dashboard, index) => (
            <div 
              key={index} 
              className={`bg-gradient-to-b ${dashboard.gradient} border ${dashboard.borderColor} rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl flex flex-col h-full`}
            >
              {/* Card Header */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${dashboard.bgColor} border ${dashboard.borderColor} flex items-center justify-center flex-shrink-0`}>
                    <dashboard.icon className={`w-6 h-6 ${dashboard.color}`} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${dashboard.color} mb-1`}>
                      {dashboard.title}
                    </h3>
                    <p className="text-gray-500 text-sm">{dashboard.tagline}</p>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 flex-1">
                {dashboard.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full ${dashboard.bgColor} border ${dashboard.borderColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <CheckCircle className={`w-3 h-3 ${dashboard.color}`} />
                    </div>
                    <p className="text-gray-300 text-sm">{feature}</p>
                  </div>
                ))}
              </div>

              {/* Dashboard Preview */}
              <div className={`mt-8 pt-6 border-t ${dashboard.borderColor} border-opacity-30`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${dashboard.color}`}></div>
                    <span className="text-gray-400 text-xs">Live Preview</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className={`h-1.5 ${dashboard.bgColor} rounded flex-1`}></div>
                    <div className={`h-1.5 ${dashboard.bgColor} rounded w-1/3`}></div>
                  </div>
                  <div className="flex gap-2">
                    <div className={`h-1.5 ${dashboard.bgColor} rounded w-2/3`}></div>
                    <div className={`h-1.5 ${dashboard.bgColor} rounded flex-1`}></div>
                  </div>
                  <div className="flex gap-2">
                    <div className={`h-1.5 ${dashboard.bgColor} rounded w-1/4`}></div>
                    <div className={`h-1.5 ${dashboard.bgColor} rounded w-1/2`}></div>
                    <div className={`h-1.5 ${dashboard.bgColor} rounded w-1/4`}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How They Connect */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 mb-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-[#DAFF00]" />
              <h3 className="text-2xl font-bold text-white">How They Work Together</h3>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              All three dashboards sync in real-time, creating a seamless workflow for your entire fitness business.
            </p>
          </div>

          {/* Connection Flow */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-3">
                  <Building className="w-8 h-8 text-purple-400" />
                </div>
                <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 hidden lg:block">
                  <div className="w-8 h-0.5 bg-gray-800">
                    <div className="absolute right-0 top-1/2 w-2 h-2 border-r-2 border-b-2 border-gray-600 transform rotate-45 translate-y-1/2"></div>
                  </div>
                </div>
              </div>
              <h4 className="text-purple-400 font-bold mb-2">Owner Creates</h4>
              <p className="text-gray-400 text-sm">Sets up gym, adds trainers & creates plans</p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 hidden lg:block">
                  <div className="w-8 h-0.5 bg-gray-800"></div>
                </div>
                <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 hidden lg:block">
                  <div className="w-8 h-0.5 bg-gray-800">
                    <div className="absolute right-0 top-1/2 w-2 h-2 border-r-2 border-b-2 border-gray-600 transform rotate-45 translate-y-1/2"></div>
                  </div>
                </div>
              </div>
              <h4 className="text-blue-400 font-bold mb-2">Trainer Manages</h4>
              <p className="text-gray-400 text-sm">Schedules workouts & tracks member progress</p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 hidden lg:block">
                  <div className="w-8 h-0.5 bg-gray-800"></div>
                </div>
              </div>
              <h4 className="text-emerald-400 font-bold mb-2">Member Engages</h4>
              <p className="text-gray-400 text-sm">Books classes, tracks workouts & sees progress</p>
            </div>
          </div>

          {/* Real-time Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-purple-400" />
                <h4 className="text-white font-semibold">Scheduling Sync</h4>
              </div>
              <p className="text-gray-400 text-sm">Bookings update instantly across all dashboards</p>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <h4 className="text-white font-semibold">Real-time Progress</h4>
              </div>
              <p className="text-gray-400 text-sm">Workout data syncs immediately for all stakeholders</p>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h4 className="text-white font-semibold">Direct Communication</h4>
              </div>
              <p className="text-gray-400 text-sm">Messaging built into the platform ecosystem</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DAFF00] disabled:pointer-events-none disabled:opacity-50 shadow h-14 bg-[#DAFF00] text-black hover:bg-[#c5e600] rounded-xl font-semibold px-8 py-6 text-lg mb-4">
            View All Dashboard Demos
          </button>
          <p className="text-gray-500 text-sm">
            See how each dashboard is tailored for its specific role
          </p>
        </div>
      </div>
    </section>
  );
}