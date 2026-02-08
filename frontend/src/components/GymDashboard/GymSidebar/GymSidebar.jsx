'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Dumbbell, 
  Users, 
  Calendar, 
  BarChart, 
  Settings, 
  LogOut, 
  User,
  Target,
  Trophy,
  Heart,
  Flame,
  Bell,
  ChevronLeft,
  ChevronRight,
  Award,
  X,
  Menu
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import Link from 'next/link';

const GymSidebar = () => {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [ 
    { id: 'Dashboard', label: 'Dashboard', href: "/dashboard/gymOwner/profile", icon: <Home className="w-5 h-5" />, badge: null },
    { id: 'Gyms', label: 'Gyms', href: "/dashboard/gymOwner/gymInfo", icon: <Dumbbell className="w-5 h-5" />, badge: '3' },
    { id: 'Add members', label: 'Add members', href: "/dashboard/gymOwner/members", icon: <Users className="w-5 h-5" />, badge: null },
    { id: 'Members', label: 'All Members', href: "/dashboard/gymOwner/all_members", icon: <Users className="w-5 h-5" />, badge: null },
    { id: 'trainers', label: 'Trainers', href: "/dashboard/gymOwner/trainers", icon: <User className="w-5 h-5" />, badge: '5' },
    // { id: 'schedule', label: 'Schedule', href: "/dashboard/gymOwner/schedule", icon: <Calendar className="w-5 h-5" />, badge: null },
    // { id: 'progress', label: 'Progress', href: "/dashboard/gymOwner/progress", icon: <BarChart className="w-5 h-5" />, badge: 'New' },
    // { id: 'goals', label: 'Goals', href: "/dashboard/gymOwner/goals", icon: <Target className="w-5 h-5" />, badge: null },
    // { id: 'analytics', label: 'Analytics', href: "/dashboard/gymOwner/analytics", icon: <BarChart className="w-5 h-5" />, badge: null },
    // { id: 'achievements', label: 'Achievements', href: "/dashboard/gymOwner/achievements", icon: <Trophy className="w-5 h-5" />, badge: '2' },
  ];

  const quickStats = [
    { label: 'Active Now', value: '24', icon: <Flame className="w-4 h-4 text-orange-500" />, color: 'from-orange-500/20 to-orange-600/20' },
    { label: 'Calories Burned', value: '1.2k', icon: <Heart className="w-4 h-4 text-red-500" />, color: 'from-red-500/20 to-red-600/20' },
    { label: 'Workouts', value: '8', icon: <Award className="w-4 h-4 text-yellow-500" />, color: 'from-yellow-500/20 to-yellow-600/20' },
  ];

  const recentActivities = [
    { user: 'Alex Johnson', action: 'completed HIIT workout', time: '10m ago' },
    { user: 'Sarah Miller', action: 'joined spinning class', time: '25m ago' },
    { user: 'Mike Chen', action: 'achieved new PR', time: '1h ago' },
  ];

  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 80 }
  };

  const mobileSidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  };

  const itemVariants = {
    expanded: { 
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    collapsed: { 
      opacity: 0,
      x: -20
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        className="fixed top-4 right-4 z-50 lg:hidden p-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg text-white"
        onClick={() => setMobileOpen(true)}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="w-6 h-6" />
      </motion.button>

      {/* Desktop Sidebar */}
      <motion.div 
        className="hidden lg:flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 sticky left-0 top-0 z-40"
        animate={collapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        
        {/* Header with Logo */}
        <div className={`p-4 border-b border-gray-700 flex items-center justify-between ${
          collapsed ? 'flex-col space-y-2' : ''
        }`}>
          <div className={`flex items-center ${collapsed ? 'flex-col' : 'space-x-3'}`}>
            <motion.div 
              className="p-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg"
              animate={{ rotate: collapsed ? 0 : [0, 10, -10, 0] }}
              transition={{ repeat: collapsed ? 0 : 1, duration: 0.5 }}
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <Dumbbell className="w-6 h-6 text-white" />
            </motion.div>
            
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-xl font-bold text-white">
                    Fitness<span className="text-red-500">Hub</span>
                  </h1>
                  <p className="text-xs text-gray-400">Dashboard</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Collapse Button */}
          <motion.button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-600"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-300" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-300" />
            )}
          </motion.button>
        </div>

        {/* User Profile Section */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              className="p-4 border-b border-gray-700"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <User className="w-6 h-6 text-white" />
                  </motion.div>
                  <motion.div 
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  ></motion.div>
                </div>
                <div>
                  <h3 className="font-semibold text-white truncate">{user?.profile?.firstName || 'User'}</h3>
                  <p className="text-sm text-gray-400">Professional DashBoard</p>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      ></motion.div>
                    </div>
                    <span className="text-xs text-gray-400 ml-2">75%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats - Only show when expanded */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              className="px-4 py-3 border-b border-gray-700"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h4 className="text-xs uppercase text-gray-400 font-semibold mb-2">Today&apos;s Stats</h4>
              <div className="grid grid-cols-3 gap-2">
                {quickStats.map((stat, index) => (
                  <motion.div 
                    key={index}
                    className={`bg-gradient-to-br ${stat.color} backdrop-blur-sm rounded-lg p-2 text-center border border-gray-700`}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 0 15px rgba(239, 68, 68, 0.4)"
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-center mb-1">{stat.icon}</div>
                    <div className="text-white font-bold text-sm">{stat.value}</div>
                    <div className="text-xs text-gray-300">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <motion.nav 
            className="space-y-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {menuItems.map((item) => (
              <Link key={item.id} href={item.href} className="block">
                <motion.div
                  onClick={() => {
                    setActiveItem(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center ${
                    collapsed ? 'justify-center' : 'justify-between'
                  } p-3 rounded-lg transition-all duration-200 group ${
                    activeItem === item.id
                      ? 'bg-gradient-to-r from-red-600/30 to-orange-600/30 border border-red-500/30 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-1.5 rounded-md ${
                        activeItem === item.id
                          ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                          : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'
                      }`}
                    >
                      {item.icon}
                    </div>

                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-red-600 to-orange-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            ))}
          </motion.nav>

          {/* Recent Activities - Only show when expanded */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div 
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="text-xs uppercase text-gray-400 font-semibold mb-3 flex items-center">
                  <Bell className="w-3 h-3 mr-2" />
                  Recent Activities
                </h4>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <motion.div 
                      key={index}
                      className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-red-500/30 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex items-start space-x-2">
                        <motion.div 
                          className="w-2 h-2 mt-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2, delay: index * 0.3 }}
                        ></motion.div>
                        <div className="flex-1">
                          <p className="text-sm text-white">
                            <span className="font-semibold">{activity.user}</span> {activity.action}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Section */}
        <div className={`border-t border-gray-700 p-4 ${collapsed ? 'space-y-3' : ''}`}>
          <motion.button
            className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} w-full p-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors group`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <div className="p-1.5 rounded-md bg-gray-800 text-gray-400 group-hover:bg-gray-700">
                <Settings className="w-5 h-5" />
              </div>
              
              <AnimatePresence>
                {!collapsed && (
                  <motion.span 
                    className="font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            
            {/* Tooltip for collapsed state */}
            {collapsed && isHovered && (
              <motion.div 
                className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md whitespace-nowrap z-50"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                Settings
              </motion.div>
            )}
          </motion.button>
          
          <motion.button
            onClick={logout}
            className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} w-full p-3 rounded-lg bg-gradient-to-r from-red-600/20 to-orange-600/20 text-red-400 hover:text-white hover:from-red-600/30 hover:to-orange-600/30 transition-all group border border-red-500/20`}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <motion.div 
                className="p-1.5 rounded-md bg-gradient-to-r from-red-600 to-orange-600 text-white"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <LogOut className="w-5 h-5" />
              </motion.div>
              
              <AnimatePresence>
                {!collapsed && (
                  <motion.span 
                    className="font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            
            {/* Tooltip for collapsed state */}
            {collapsed && isHovered && (
              <motion.div 
                className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md whitespace-nowrap z-50"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                Logout
              </motion.div>
            )}
          </motion.button>
          
          {/* Version info - Only show when expanded */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div 
                className="mt-4 pt-4 border-t border-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">v2.1.4</span>
                  <div className="flex space-x-1">
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-green-500"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    ></motion.div>
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-yellow-500"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                    ></motion.div>
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-red-500"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Custom scrollbar styling */}
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(31, 41, 55, 0.3);
            border-radius: 10px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #ef4444, #f97316);
            border-radius: 10px;
          }
        `}</style>
      </motion.div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 lg:hidden overflow-y-auto"
              variants={mobileSidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Mobile Header */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">
                      Fitness<span className="text-red-500">Hub</span>
                    </h1>
                    <p className="text-xs text-gray-400">Dashboard</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-300" />
                </button>
              </div>

              {/* Mobile User Profile */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{user?.profile?.firstName || 'User'}</h3>
                    <p className="text-sm text-gray-400">Professional Dashboard</p>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="p-4">
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <Link key={item.id} href={item.href}>
                      <div
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                          activeItem === item.id
                            ? 'bg-gradient-to-r from-red-600/30 to-orange-600/30 border border-red-500/30 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-1.5 rounded-md ${
                              activeItem === item.id
                                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                                : 'bg-gray-800 text-gray-400'
                            }`}
                          >
                            {item.icon}
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-red-600 to-orange-600 text-white">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-gray-700 mt-auto">
                <button className="flex items-center justify-between w-full p-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-md bg-gray-800 text-gray-400">
                      <Settings className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Settings</span>
                  </div>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center justify-between w-full p-3 rounded-lg bg-gradient-to-r from-red-600/20 to-orange-600/20 text-red-400 hover:text-white hover:from-red-600/30 hover:to-orange-600/30 mt-2"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-md bg-gradient-to-r from-red-600 to-orange-600 text-white">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Logout</span>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default GymSidebar;