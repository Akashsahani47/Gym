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
  Menu,
  Zap
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import useThemeStore from '@/store/useThemeStore';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';
import Link from 'next/link';

const GymSidebar = () => {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const { isDark, toggleTheme } = useThemeStore();
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', href: "/dashboard/gymOwner/profile", icon: <Home className="w-5 h-5" />, badge: null },
    { id: 'Gyms', label: 'Gyms', href: "/dashboard/gymOwner/gymInfo", icon: <Dumbbell className="w-5 h-5" />, badge: null },
    { id: 'Add members', label: 'Add members', href: "/dashboard/gymOwner/members", icon: <Users className="w-5 h-5" />, badge: null },
    { id: 'Members', label: 'All Members', href: "/dashboard/gymOwner/all_members", icon: <Users className="w-5 h-5" />, badge: null },
    //{ id: 'trainers', label: 'Trainers', href: "/dashboard/gymOwner/trainers", icon: <User className="w-5 h-5" />, badge: '5' },
    { id: 'payments', label: "Payments", href: "/dashboard/gymOwner/payments", icon: <Zap className="w-5 h-5" />},
    { id: 'attendance', label: 'Attendance', href: "/dashboard/gymOwner/attendance", icon: <Calendar className="w-5 h-5" />, badge: null },
    { id: 'holidays', label: 'Holidays', href: "/dashboard/gymOwner/holidays", icon: <Heart className="w-5 h-5" />, badge: null },
    { id: 'analytics', label: 'Analytics', href: "/dashboard/gymOwner/analytics", icon: <BarChart className="w-5 h-5" />, badge: null },
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
        className="fixed top-4 right-4 z-50 lg:hidden p-2 bg-accent text-black rounded-xl font-semibold shadow hover:bg-accent-hover focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
        onClick={() => setMobileOpen(true)}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="w-6 h-6" />
      </motion.button>

      {/* Desktop Sidebar */}
      <motion.div
        className="hidden lg:flex flex-col h-screen bg-white dark:bg-black border-r border-gray-200 dark:border-white/10 sticky left-0 top-0 z-40"
        animate={collapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >

        {/* Header with Logo */}
        <div className={`p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between ${
          collapsed ? 'flex-col space-y-2' : ''
        }`}>
          <div className={`flex items-center ${collapsed ? 'flex-col' : 'space-x-3'}`}>
            <motion.div
              className="p-2 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/30"
              animate={{ rotate: collapsed ? 0 : [0, 10, -10, 0] }}
              transition={{ repeat: collapsed ? 0 : 1, duration: 0.5 }}
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <Dumbbell className="w-6 h-6 text-accent" />
            </motion.div>

            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Zelvoo<span className="text-accent"></span>
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Dashboard</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle + Collapse Button */}
          <div className={`flex items-center gap-2 ${collapsed ? 'flex-col' : ''}`}>
            {!collapsed && <ThemeToggle isDark={isDark} onToggle={toggleTheme} />}

            {/* Collapse Button */}
            <motion.button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-accent/10 transition-colors border border-gray-200 dark:border-white/10 hover:border-accent/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-accent" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-accent" />
              )}
            </motion.button>
          </div>
        </div>

        {/* User Profile Section */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              className="p-4 border-b border-gray-200 dark:border-white/10"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <motion.div
                    className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30"
                    whileHover={{ scale: 1.05 }}
                  >
                    <User className="w-6 h-6 text-accent" />
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-white dark:border-black animate-pulse"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  ></motion.div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{user?.profile?.firstName || 'User'}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Professional DashBoard</p>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-accent to-accent/60 h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      ></motion.div>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">75%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats - Only show when expanded */}
       

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
                  } p-3 rounded-xl transition-all duration-200 group ${
                    activeItem === item.id
                      ? 'bg-accent/10 border border-accent/30 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 hover:border-accent/20 border border-transparent'
                  }`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-1.5 rounded-lg ${
                        activeItem === item.id
                          ? 'bg-accent/20 text-accent border border-accent/30'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 group-hover:bg-accent/10 group-hover:text-accent border border-gray-200 dark:border-white/5'
                      }`}
                    >
                      {item.icon}
                    </div>

                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent border border-accent/30">
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            ))}
          </motion.nav>

          
          
        </div>

        {/* Footer Section */}
        <div className={`border-t border-gray-200 dark:border-white/10 p-4 ${collapsed ? 'space-y-3' : ''}`}>
          <motion.button
            className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} w-full p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 hover:border-accent/20 border border-transparent transition-colors group`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* <div className="flex items-center space-x-3">
              <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 group-hover:bg-accent/10 group-hover:text-accent">
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
            </div> */}

            {/* Tooltip for collapsed state */}
            {collapsed && isHovered && (
              <motion.div
                className="absolute left-full ml-2 px-2 py-1 bg-white dark:bg-[#1a1a1a] shadow-lg text-gray-900 dark:text-white text-sm rounded-lg border border-accent/30 whitespace-nowrap z-50"
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
            className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} w-full p-3 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 hover:text-black transition-all group border border-accent/30`}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 20px rgba(218, 255, 0, 0.2)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <motion.div
                className="p-1.5 rounded-lg bg-accent text-black"
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
                className="absolute left-full ml-2 px-2 py-1 bg-white dark:bg-[#1a1a1a] shadow-lg text-gray-900 dark:text-white text-sm rounded-lg border border-accent/30 whitespace-nowrap z-50"
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
                className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">v2.1.4</span>
                  <div className="flex space-x-1">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-accent"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    ></motion.div>
                    <motion.div
                      className="w-2 h-2 rounded-full bg-accent/70"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                    ></motion.div>
                    <motion.div
                      className="w-2 h-2 rounded-full bg-accent/40"
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
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #DAFF00;
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
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-white/10 lg:hidden overflow-y-auto"
              variants={mobileSidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Mobile Header */}
              <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-accent/20 rounded-xl border border-accent/30">
                    <Dumbbell className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      <span className="text-accent">Zelvoo</span>
                    </h1>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Dashboard</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-accent/10 border border-gray-200 dark:border-white/10 text-accent transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile User Profile */}
              <div className="p-4 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                      <User className="w-6 h-6 text-accent" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-white dark:border-black animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{user?.profile?.firstName || 'User'}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Professional Dashboard</p>
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
                        className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 border ${
                          activeItem === item.id
                            ? 'bg-accent/10 border-accent/30 text-gray-900 dark:text-white'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 hover:border-accent/20'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-1.5 rounded-lg ${
                              activeItem === item.id
                                ? 'bg-accent/20 text-accent border border-accent/30'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5'
                            }`}
                          >
                            {item.icon}
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent border border-accent/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-white/10 mt-auto">
                {/* <button className="flex items-center justify-between w-full p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent hover:border-accent/20">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                      <Settings className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Settings</span>
                  </div>
                </button> */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                  </span>
                  <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
                </div>
                <button
                  onClick={logout}
                  className="flex items-center justify-between w-full p-3 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 hover:text-black border border-accent/30 mt-2"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-lg bg-accent text-black">
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
