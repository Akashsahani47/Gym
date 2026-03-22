// components/DashboardsSection.jsx
'use client';

import { Building, Users, User, CheckCircle, IndianRupee, Target, Heart, Calendar, Clock, MessageSquare, Zap } from 'lucide-react';

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
      accentIcon: IndianRupee,
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
        "Assigned members overview",
        "Client progress tracking & analytics",
        "Attendance monitoring",
        "Availability & time slot control",
        "Personalized fitness goal tracking",
        "Trainer profile & certifications",
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
      tagline: "Personal Fitness "
    }
  ];

  return (
    <section className="px-4 sm:px-6 py-10 sm:py-16 lg:py-20 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header - compact on mobile */}
        <div className="text-center mb-6 sm:mb-14 lg:mb-16">
          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-6 px-2">
            <span className="text-white">Three Dashboards. </span>
            <span className="text-[#DAFF00]">One Seamless Platform.</span>
          </h2>
          
          <p className="text-sm sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto px-2">
            Every role gets a dedicated interface designed specifically for their needs, all connected in one intelligent platform.
          </p>
        </div>

        {/* Three Dashboard Cards - Triangle: 2 on top (flex), 1 centered below */}
        <div className="mb-8 sm:mb-20">
          {/* Top row - first 2 cards side by side */}
          <div className="flex flex-row gap-4 sm:gap-8 justify-center mb-4 sm:mb-8">
            {dashboards.slice(0, 2).map((dashboard, index) => (
              <div
                key={index}
                className={`flex-1 min-w-0 max-w-md bg-gradient-to-b ${dashboard.gradient} border ${dashboard.borderColor} rounded-lg sm:rounded-xl lg:rounded-2xl p-3.5 sm:p-6 md:p-8 shadow-2xl transition-all duration-300 hover:scale-[1.01] lg:hover:scale-[1.02] hover:shadow-3xl flex flex-col h-full`}
              >
                <div className="mb-3 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                    <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${dashboard.bgColor} border ${dashboard.borderColor} flex items-center justify-center shrink-0`}>
                      <dashboard.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${dashboard.color}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className={`text-sm sm:text-xl font-bold ${dashboard.color} mb-0.5 leading-tight`}>{dashboard.title}</h3>
                      <p className="text-gray-500 text-[10px] sm:text-sm truncate leading-tight">{dashboard.tagline}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 sm:space-y-3 flex-1">
                  {dashboard.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-2 sm:gap-3">
                      <div className={`w-3 h-3 sm:w-5 sm:h-5 rounded-full ${dashboard.bgColor} border ${dashboard.borderColor} flex items-center justify-center shrink-0 mt-0.5`}>
                        <CheckCircle className={`w-1.5 h-1.5 sm:w-3 sm:h-3 ${dashboard.color}`} />
                      </div>
                      <p className="text-gray-300 text-xs sm:text-sm leading-tight">{feature}</p>
                    </div>
                  ))}
                </div>
                <div className={`mt-4 sm:mt-8 pt-3 sm:pt-6 border-t ${dashboard.borderColor} border-opacity-30`}>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${dashboard.color}`}></div>
                      <span className="text-gray-400 text-[10px] sm:text-xs leading-tight">Live Preview</span>
                    </div>
                    <div className="flex gap-0.5 sm:gap-1">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-700"></div>
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-700"></div>
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-700"></div>
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex gap-1.5 sm:gap-2">
                      <div className={`h-1 sm:h-1.5 ${dashboard.bgColor} rounded flex-1`}></div>
                      <div className={`h-1 sm:h-1.5 ${dashboard.bgColor} rounded w-1/3`}></div>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      <div className={`h-1 sm:h-1.5 ${dashboard.bgColor} rounded w-2/3`}></div>
                      <div className={`h-1 sm:h-1.5 ${dashboard.bgColor} rounded flex-1`}></div>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      <div className={`h-1 sm:h-1.5 ${dashboard.bgColor} rounded w-1/4`}></div>
                      <div className={`h-1 sm:h-1.5 ${dashboard.bgColor} rounded w-1/2`}></div>
                      <div className={`h-1 sm:h-1.5 ${dashboard.bgColor} rounded w-1/4`}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Bottom row - 3rd card centered (triangle tip) */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              {(() => {
                const dashboard = dashboards[2];
                return (
                  <div
                    className={`bg-gradient-to-b ${dashboard.gradient} border ${dashboard.borderColor} rounded-lg sm:rounded-xl items-center justify-center lg:rounded-2xl p-3.5 sm:p-6 md:p-8 shadow-2xl transition-all duration-300 hover:scale-[1.01] lg:hover:scale-[1.02] hover:shadow-3xl flex flex-col h-full`}
                  >
                    <div className="mb-3 sm:mb-6">
                      <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                        <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${dashboard.bgColor} border ${dashboard.borderColor} flex items-center justify-center shrink-0`}>
                          <dashboard.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${dashboard.color}`} />
                        </div>
                        <div className="min-w-0">
                          <h3 className={`text-sm sm:text-xl font-bold ${dashboard.color} mb-0.5 leading-tight`}>{dashboard.title}</h3>
                          <p className="text-gray-500 text-[10px] sm:text-sm truncate leading-tight">{dashboard.tagline}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5 sm:space-y-3 flex-1">
                      {dashboard.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-2 sm:gap-3">
                          <div className={`w-3 h-3 sm:w-5 sm:h-5 rounded-full ${dashboard.bgColor} border ${dashboard.borderColor} flex items-center justify-center shrink-0 mt-0.5`}>
                            <CheckCircle className={`w-1.5 h-1.5 sm:w-3 sm:h-3 ${dashboard.color}`} />
                          </div>
                          <p className="text-gray-300 text-xs sm:text-sm leading-tight">{feature}</p>
                        </div>
                      ))}
                    </div>
                    <div className={`mt-4 sm:mt-8 pt-3 sm:pt-6 border-t ${dashboard.borderColor} border-opacity-30`}>
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${dashboard.color}`}></div>
                          <span className="text-gray-400 text-[10px] sm:text-xs leading-tight">Live Preview</span>
                        </div>
                        <div className="flex gap-0.5 sm:gap-1">
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-700"></div>
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-700"></div>
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-700"></div>
                        </div>
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex gap-1.5 sm:gap-2">
                          <div className={`h-1 sm:h-1.5 ${dashboard.bgColor} rounded flex-1`}></div>
                          <div className={`h-1 sm:h-1.5 ${dashboard.bgColor} rounded w-1/3`}></div>
                        </div>
                        <div className="flex gap-1.5 sm:gap-2">
                          <div className={`h-1 sm:h-1.5 ${dashboard.bgColor} rounded w-2/3`}></div>
                          <div className={`h-1 sm:h-1.5 ${dashboard.bgColor} rounded flex-1`}></div>
                        </div>
                        <div className="flex gap-1.5 sm:gap-2">
                          <div className={`h-1 sm:h-1.5 ${dashboard.bgColor} rounded w-1/4`}></div>
                          <div className={`h-1 sm:h-1.5 ${dashboard.bgColor} rounded w-1/2`}></div>
                          <div className={`h-1 sm:h-1.5 ${dashboard.bgColor} rounded w-1/4`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* How They Connect - compact on mobile */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-950 border border-gray-800 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-16">
          <div className="text-center mb-6 sm:mb-10">
            <div className="inline-flex items-center justify-center gap-2 mb-2 sm:mb-4 flex-wrap">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#DAFF00] shrink-0" />
              <h3 className="text-base sm:text-2xl font-bold text-white">How They Work Together</h3>
            </div>
            <p className="text-gray-400 text-xs sm:text-base max-w-2xl mx-auto px-2">
              All three dashboards sync in real-time, creating a seamless workflow for your entire fitness business.
            </p>
          </div>

          {/* Connection Flow - stacked on mobile, compact */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Building className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                </div>
                <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 hidden lg:block">
                  <div className="w-8 h-0.5 bg-gray-800">
                    <div className="absolute right-0 top-1/2 w-2 h-2 border-r-2 border-b-2 border-gray-600 transform rotate-45 translate-y-1/2"></div>
                  </div>
                </div>
              </div>
              <h4 className="text-purple-400 font-bold mb-1 sm:mb-2 text-sm sm:text-base">Owner Creates</h4>
              <p className="text-gray-400 text-xs sm:text-sm">Sets up gym, adds trainers & creates plans</p>
            </div>

            <div className="text-center">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
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
              <h4 className="text-blue-400 font-bold mb-1 sm:mb-2 text-sm sm:text-base">Trainer Manages</h4>
              <p className="text-gray-400 text-xs sm:text-sm">Schedules workouts & tracks member progress</p>
            </div>

            <div className="text-center">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                </div>
                <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 hidden lg:block">
                  <div className="w-8 h-0.5 bg-gray-800"></div>
                </div>
              </div>
              <h4 className="text-emerald-400 font-bold mb-1 sm:mb-2 text-sm sm:text-base">Member Engages</h4>
              <p className="text-gray-400 text-xs sm:text-sm">Books classes, tracks workouts & sees progress</p>
            </div>
          </div>

          {/* Real-time Benefits - compact on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mt-6 sm:mt-12">
            <div className="bg-gray-900/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-800">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
                <h4 className="text-white font-semibold text-sm sm:text-base">Scheduling Sync</h4>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">Bookings update instantly across all dashboards</p>
            </div>

            <div className="bg-gray-900/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-800">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
                <h4 className="text-white font-semibold text-sm sm:text-base">Real-time Progress</h4>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">Workout data syncs immediately for all stakeholders</p>
            </div>

            <div className="bg-gray-900/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-800">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                <h4 className="text-white font-semibold text-sm sm:text-base">Direct Communication</h4>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">Messaging built into the platform ecosystem</p>
            </div>
          </div>
        </div>

        {/* Final CTA - compact on mobile */}
        <div className="text-center px-2">
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DAFF00] disabled:pointer-events-none disabled:opacity-50 shadow min-h-[44px] sm:h-14 bg-[#DAFF00] text-black hover:bg-[#c5e600] active:opacity-90 rounded-lg sm:rounded-xl font-semibold px-4 py-2.5 sm:px-8 sm:py-4 text-sm sm:text-lg w-full sm:w-auto mb-2 sm:mb-4">
            View All Dashboard Demos
          </button>
          <p className="text-gray-500 text-xs sm:text-sm">
            See how each dashboard is tailored for its specific role
          </p>
        </div>
      </div>
    </section>
  );
}