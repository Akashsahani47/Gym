// components/Navbar.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Menu, X, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useUserStore from '@/store/useUserStore';

export default function Navbar() {
  const { user, token, logout } = useUserStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
   
  // Determine dashboard link based on user type
  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    
    switch(user.userType) {
      case 'gym_owner':
        return '/dashboard/gymOwner';
      case 'trainer':
        return '/dashboard/trainer';
      default:
        return '/dashboard/member';
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "Dashboard";
    if (user.profile?.firstName) return user.profile.firstName;
    return "Dashboard";
  };

  // Get user role display
  const getUserRole = () => {
    if (!user) return "";
    
    switch(user.userType) {
      case 'gym_owner':
        return "Gym Owner";
      case 'trainer':
        return "Trainer";
      default:
        return "Member";
    }
  };

  // Get role badge color
  const getRoleBadgeColor = () => {
    switch(user?.userType) {
      case 'gym_owner':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'trainer':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/10' 
          : 'bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#DAFF00] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#DAFF00] to-[#c5e600] flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-black" />
              </div>
            </div>
            <span className="text-2xl font-bold">
              <span className="text-white">Zel</span>
              <span className="bg-gradient-to-r from-[#DAFF00] to-[#c5e600] bg-clip-text text-transparent">voo</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* Not logged in */}
            {!token && (
              <div className="flex items-center gap-3">
                <Link href="/loginpage">
                  <button className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                    Login
                  </button>
                </Link>

                <Link href="/loginpage">
                  <button className="inline-flex items-center justify-center h-10 px-6 bg-gradient-to-r from-[#DAFF00] to-[#c5e600] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#DAFF00]/20 transition-all transform hover:scale-105">
                    Get Started
                  </button>
                </Link>
              </div>
            )}

            {/* Logged in with user */}
            {token && user && (
              <div className="flex items-center gap-4">
                
                {/* Dashboard Button */}
                <Link href={getDashboardLink()}>
                  <button className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-white/5 text-white font-medium rounded-xl border border-white/10 hover:bg-white/10 hover:border-[#DAFF00]/50 transition-all group">
                    <LayoutDashboard className="w-4 h-4 text-gray-400 group-hover:text-[#DAFF00] transition-colors" />
                    Dashboard
                  </button>
                </Link>

                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 h-10 pl-4 pr-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#DAFF00]/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#DAFF00] to-[#c5e600] flex items-center justify-center">
                        <span className="text-xs font-bold text-black">
                          {getUserDisplayName().charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      {/* User Info */}
                      <div className="text-left">
                        <p className="text-sm font-medium text-white leading-none">{getUserDisplayName()}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{getUserRole()}</p>
                      </div>
                    </div>
                    
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                      >
                        <div className="p-3 border-b border-white/10">
                          <p className="text-sm font-medium text-white">{getUserDisplayName()}</p>
                          <p className="text-xs text-gray-400 mt-1">{user.email}</p>
                          <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-md border text-xs font-medium ${getRoleBadgeColor()}`}>
                            {getUserRole()}
                          </div>
                        </div>
                        
                        <div className="p-2">
                          <Link href={getDashboardLink()}>
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                              <LayoutDashboard className="w-4 h-4" />
                              Dashboard
                            </button>
                          </Link>
                          
                          <button
                            onClick={() => {
                              logout();
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Token but no user (error state) */}
            {token && !user && (
              <div className="flex items-center gap-3">
                <Link href="/loginpage">
                  <button className="inline-flex items-center justify-center h-10 px-5 bg-gradient-to-r from-[#DAFF00] to-[#c5e600] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#DAFF00]/20 transition-all">
                    Login Again
                  </button>
                </Link>
                
                <button
                  onClick={logout}
                  className="inline-flex items-center justify-center h-10 px-5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-6 space-y-4 border-t border-white/10 mt-4">
                
                {/* Not logged in - Mobile */}
                {!token && (
                  <>
                    <Link href="/loginpage" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full h-11 px-5 text-white font-medium border border-white/10 hover:bg-white/5 rounded-xl transition-colors">
                        Login
                      </button>
                    </Link>

                    <Link href="/loginpage" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full h-11 px-5 bg-gradient-to-r from-[#DAFF00] to-[#c5e600] text-black font-semibold rounded-xl">
                        Get Started
                      </button>
                    </Link>
                  </>
                )}

                {/* Logged in - Mobile */}
                {token && user && (
                  <>
                    <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#DAFF00] to-[#c5e600] flex items-center justify-center">
                          <span className="text-sm font-bold text-black">
                            {getUserDisplayName().charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{getUserDisplayName()}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${getRoleBadgeColor()}`}>
                        {getUserRole()}
                      </div>
                    </div>

                    <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full flex items-center justify-center gap-2 h-11 px-5 bg-white/5 text-white font-medium border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </button>
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 h-11 px-5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                )}

                {/* Token but no user - Mobile */}
                {token && !user && (
                  <>
                    <Link href="/loginpage" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full h-11 px-5 bg-gradient-to-r from-[#DAFF00] to-[#c5e600] text-black font-semibold rounded-xl">
                        Login Again
                      </button>
                    </Link>
                    
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full h-11 px-5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-colors"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}