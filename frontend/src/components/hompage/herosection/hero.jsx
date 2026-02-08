// components/Hero.jsx
'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, Target, CheckCircle, Activity, Users, Clock, Award, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section className="min-h-screen pt-32 px-6 bg-black max-w-8xl mx-auto">
      <div className="flex flex-col px-13 lg:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* Left Column - Text Content */}
        <div className="lg:w-1/2 text-left">
          {/* Badge */}
          <div className="inline-flex items-center border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#DAFF00] focus:ring-offset-2 shadow hover:bg-[#DAFF00]/90 mb-6 bg-[#DAFF00]/10 text-[#DAFF00] border-[#DAFF00]/30 rounded-full px-4 py-1.5">
            Complete Gym Management Ecosystem
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
            <span className="text-white"> One Platform. </span>
            <span className="text-[#DAFF00]">Every Role.</span>
            <span className="text-white"> Complete Gym Management.</span>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            Zelvoo powers gym owners, trainers, and members with dedicated dashboards — all connected in one intelligent fitness platform.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DAFF00] disabled:pointer-events-none disabled:opacity-50 shadow h-14 bg-[#DAFF00] text-black hover:bg-[#c5e600] rounded-xl font-semibold px-8 py-6 text-lg">
              Get Started
            </button>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DAFF00] disabled:pointer-events-none disabled:opacity-50 border shadow-sm h-14 border-gray-700 text-white hover:border-[#DAFF00] hover:text-[#DAFF00] hover:bg-[#DAFF00]/10 rounded-xl px-8 py-6 text-lg">
              View Dashboards
            </button>
          </div>
        </div>

        {/* Right Column - Premium Glassmorphic Illustration */}
        <div className="lg:w-1/2 relative h-[700px]">
          {/* Grain texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }} />

          {/* Ambient glow effects */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#DAFF00] rounded-full blur-[100px] pointer-events-none"
          />

          <div className="relative h-full flex items-center justify-center">
            
            {/* Central Main Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative z-20 w-full max-w-[480px]"
            >
              <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-white/20 via-white/10 to-transparent shadow-2xl backdrop-blur-xl">
                <div className="rounded-3xl bg-gradient-to-br from-[#1a1a1a]/90 to-[#0f0f0f]/90 backdrop-blur-2xl p-6 border border-white/10">
                  
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-xs font-medium text-gray-500 tracking-wider mb-1">ANALYTICS OVERVIEW</div>
                      <div className="text-xl font-bold text-white">Gym Performance</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#DAFF00] animate-pulse" />
                      <span className="text-xs text-gray-400">Live</span>
                    </div>
                  </div>

                  {/* Revenue Chart */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="text-3xl font-bold text-white">₹8.4L</span>
                      <span className="text-sm text-[#DAFF00] flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        +24.5%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">Monthly Revenue</div>
                    
                    {/* Mini bar chart */}
                    <div className="flex items-end gap-1.5 h-24">
                      {[40, 65, 45, 80, 60, 90, 75, 95, 70, 85, 100, 88].map((height, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + i * 0.05 }}
                          className="flex-1 bg-gradient-to-t from-[#DAFF00]/80 to-[#DAFF00]/20 rounded-t-sm relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-[#DAFF00]/40 to-transparent rounded-t-sm" />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="text-xl font-bold text-white mb-1">342</div>
                      <div className="text-xs text-gray-500">Active Members</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="text-xl font-bold text-white mb-1">28</div>
                      <div className="text-xs text-gray-500">Live Sessions</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="text-xl font-bold text-white mb-1">94%</div>
                      <div className="text-xs text-gray-500">Attendance</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glass reflection effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
            </motion.div>

            {/* Trainer Schedule Card - Top Left */}
            <motion.div
              initial={{ opacity: 0, x: -30, y: 30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute top-8 left-0 w-[260px] z-10"
            >
              <div className="rounded-2xl p-[1px] bg-gradient-to-br from-white/15 via-white/5 to-transparent shadow-xl backdrop-blur-xl">
                <div className="rounded-2xl bg-[#141414]/80 backdrop-blur-2xl p-5 border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#DAFF00]/20 to-[#DAFF00]/5 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-[#DAFF00]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Trainer Schedule</div>
                      <div className="text-xs text-gray-500">Todayapos;s Sessions</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { time: '09:00', trainer: 'Sarah K.', clients: 12, status: 'active' },
                      { time: '11:00', trainer: 'Mike R.', clients: 8, status: 'upcoming' },
                      { time: '14:00', trainer: 'Alex M.', clients: 15, status: 'upcoming' },
                    ].map((session, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                        className="flex items-center gap-2 bg-white/5 rounded-lg p-2.5 border border-white/5"
                      >
                        <div className="text-xs font-mono text-gray-400 w-10">{session.time}</div>
                        <div className="flex-1">
                          <div className="text-xs font-medium text-white">{session.trainer}</div>
                          <div className="text-xs text-gray-500">{session.clients} clients</div>
                        </div>
                        {session.status === 'active' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#DAFF00] animate-pulse" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Member Fitness Tracking - Bottom Left */}
            <motion.div
              initial={{ opacity: 0, x: -30, y: -30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute bottom-8 left-4 w-[240px] z-10"
            >
              <div className="rounded-2xl p-[1px] bg-gradient-to-br from-white/15 via-white/5 to-transparent shadow-xl backdrop-blur-xl">
                <div className="rounded-2xl bg-[#141414]/80 backdrop-blur-2xl p-5 border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#DAFF00]/20 to-[#DAFF00]/5 flex items-center justify-center">
                      <Target className="w-4 h-4 text-[#DAFF00]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Member Goals</div>
                      <div className="text-xs text-gray-500">Progress Tracking</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'Weight Loss', progress: 78, value: '7.8 kg' },
                      { label: 'Muscle Gain', progress: 45, value: '4.5 kg' },
                      { label: 'Endurance', progress: 92, value: '92%' },
                    ].map((goal, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 + i * 0.1 }}
                      >
                        <div className="flex justify-between mb-1.5">
                          <span className="text-xs text-gray-400">{goal.label}</span>
                          <span className="text-xs font-semibold text-white">{goal.value}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${goal.progress}%` }}
                            transition={{ duration: 1, delay: 1.2 + i * 0.1 }}
                            className="h-full bg-gradient-to-r from-[#DAFF00] to-[#DAFF00]/60 rounded-full"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Admin Controls - Top Right */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: 30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="absolute top-12 right-0 w-[250px] z-10"
            >
              <div className="rounded-2xl p-[1px] bg-gradient-to-br from-white/15 via-white/5 to-transparent shadow-xl backdrop-blur-xl">
                <div className="rounded-2xl bg-[#141414]/80 backdrop-blur-2xl p-5 border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#DAFF00]/20 to-[#DAFF00]/5 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-[#DAFF00]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Admin Approvals</div>
                      <div className="text-xs text-gray-500">Pending Actions</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { type: 'Gym Verification', count: 3, urgent: true },
                      { type: 'Trainer Apps', count: 7, urgent: false },
                      { type: 'Member Requests', count: 12, urgent: false },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + i * 0.1 }}
                        className="flex items-center justify-between bg-white/5 rounded-lg p-2.5 border border-white/5"
                      >
                        <div>
                          <div className="text-xs font-medium text-white mb-0.5">{item.type}</div>
                          <div className="text-xs text-gray-500">{item.count} pending</div>
                        </div>
                        {item.urgent && (
                          <div className="w-5 h-5 rounded-lg bg-[#DAFF00]/20 flex items-center justify-center">
                            <Zap className="w-3 h-3 text-[#DAFF00]" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Activity Stats - Bottom Right */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: -30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute bottom-12 right-8 w-[220px] z-10"
            >
              <div className="rounded-2xl p-[1px] bg-gradient-to-br from-white/15 via-white/5 to-transparent shadow-xl backdrop-blur-xl">
                <div className="rounded-2xl bg-[#141414]/80 backdrop-blur-2xl p-5 border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#DAFF00]/20 to-[#DAFF00]/5 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-[#DAFF00]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Live Activity</div>
                      <div className="text-xs text-gray-500">Real-time</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Users, value: '156', label: 'Check-ins' },
                      { icon: Clock, value: '2.4h', label: 'Avg Time' },
                      { icon: Award, value: '23', label: 'Goals' },
                      { icon: BarChart3, value: '89%', label: 'Satisfaction' },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.4 + i * 0.1 }}
                        className="bg-white/5 rounded-lg p-2.5 border border-white/5"
                      >
                        <stat.icon className="w-3.5 h-3.5 text-[#DAFF00] mb-1.5" />
                        <div className="text-base font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#DAFF00]/30 rounded-full"
                style={{
                  left: `${0.1 * 100}%`,
                  top: `${0.6 * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3 + 0.3 * 2,
                  repeat: Infinity,
                  delay: 0.2 * 2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}