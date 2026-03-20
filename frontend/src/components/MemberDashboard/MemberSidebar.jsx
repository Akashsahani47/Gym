'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Dumbbell,
  CreditCard,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  ClipboardCheck,
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import useThemeStore from '@/store/useThemeStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { id: 'profile', label: 'Dashboard', href: '/dashboard/member/profile', icon: <Home className="w-5 h-5" /> },
  { id: 'my-gym', label: 'My Gym', href: '/dashboard/member/my-gym', icon: <Dumbbell className="w-5 h-5" /> },
  { id: 'membership', label: 'Membership', href: '/dashboard/member/membership', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'attendance', label: 'Attendance', href: '/dashboard/member/attendance', icon: <ClipboardCheck className="w-5 h-5" /> },
  { id: 'payments', label: 'Payments', href: '/dashboard/member/payments', icon: <CreditCard className="w-5 h-5" /> },
];

const sidebarVariants = {
  expanded: { width: 256 },
  collapsed: { width: 80 },
};

const mobileSidebarVariants = {
  open: { x: 0 },
  closed: { x: '-100%' },
};

export default function MemberSidebar() {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const { isDark, toggleTheme } = useThemeStore();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = menuItems.find((i) => pathname?.startsWith(i.href))?.id || 'profile';

  return (
    <>
      <motion.button
        className="fixed top-4 right-4 z-50 lg:hidden p-2 bg-accent text-black rounded-xl font-semibold shadow hover:bg-accent-hover focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
        onClick={() => setMobileOpen(true)}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="w-6 h-6" />
      </motion.button>

      <motion.div
        className="hidden lg:flex flex-col h-screen bg-black border-r border-white/10 sticky left-0 top-0 z-40"
        animate={collapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`p-4 border-b border-white/10 flex items-center justify-between ${collapsed ? 'flex-col space-y-2' : ''}`}>
          <div className={`flex items-center ${collapsed ? 'flex-col' : 'space-x-3'}`}>
            <motion.div className="p-2 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/30">
              <Dumbbell className="w-6 h-6 text-accent" />
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h1 className="text-xl font-bold text-white">Zelvoo<span className="text-accent">.</span></h1>
                  <p className="text-xs text-gray-400">Member</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className={`flex items-center gap-1 ${collapsed ? 'flex-col' : ''}`}>
            <motion.button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-accent/10 border border-white/10 hover:border-accent/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDark ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-gray-400" />}
            </motion.button>
            <motion.button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-accent/10 border border-white/10 hover:border-accent/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {collapsed ? <ChevronRight className="w-4 h-4 text-accent" /> : <ChevronLeft className="w-4 h-4 text-accent" />}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              className="p-4 border-b border-white/10"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                  <User className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-white truncate">
                    {user?.profile?.firstName} {user?.profile?.lastName}
                  </h3>
                  <p className="text-sm text-gray-400">Member</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link key={item.id} href={item.href}>
                <motion.div
                  className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} p-3 rounded-xl transition-all border ${
                    activeItem === item.id
                      ? 'bg-accent/10 border-accent/30 text-white'
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5 hover:border-accent/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`p-1.5 rounded-lg ${activeItem === item.id ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-white/5 text-gray-400'}`}>
                    {item.icon}
                  </div>
                  {!collapsed && <span className="font-medium ml-3">{item.label}</span>}
                </motion.div>
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/10 p-4 space-y-2">
          <motion.button
            onClick={logout}
            className={`flex items-center ${collapsed ? 'justify-center' : ''} w-full p-3 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 hover:text-black border border-accent/30 transition-colors`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="font-medium ml-3">Logout</span>}
          </motion.button>
        </div>
      </motion.div>

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
              className="fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-white/10 lg:hidden overflow-y-auto"
              variants={mobileSidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-accent/20 rounded-xl border border-accent/30">
                    <Dumbbell className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Zelvoo<span className="text-accent">.</span></h1>
                    <p className="text-xs text-gray-400">Member</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-accent/10 border border-white/10 text-accent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                    <User className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {user?.profile?.firstName} {user?.profile?.lastName}
                    </h3>
                    <p className="text-sm text-gray-400">Member</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <Link key={item.id} href={item.href}>
                      <div
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center p-3 rounded-xl border ${
                          activeItem === item.id
                            ? 'bg-accent/10 border-accent/30 text-white'
                            : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${activeItem === item.id ? 'bg-accent/20 text-accent' : 'bg-white/5 text-gray-400'}`}>
                          {item.icon}
                        </div>
                        <span className="font-medium ml-3">{item.label}</span>
                      </div>
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={() => { toggleTheme(); setMobileOpen(false); }}
                  className="flex items-center w-full p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 mb-2"
                >
                  {isDark ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5" />}
                  <span className="font-medium ml-3">{isDark ? 'Light' : 'Dark'}</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center w-full p-3 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 border border-accent/30"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium ml-3">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
