'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellRing,
  BellOff,
  X,
  CheckCheck,
  Trash2,
  IndianRupee,
  UserPlus,
  Clock,
  AlertTriangle,
  Calendar,
  Zap,
  ChevronDown,
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import useNotificationStore from '@/store/useNotificationStore';
import { useRouter } from 'next/navigation';

const ICON_MAP = {
  payment_due: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  payment_received: { icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  membership_expiring: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  membership_expired: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
  new_member_joined: { icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  attendance_streak: { icon: Zap, color: 'text-accent', bg: 'bg-accent/10' },
  attendance_checkin: { icon: Calendar, color: 'text-accent', bg: 'bg-accent/10' },
  system: { icon: Bell, color: 'text-gray-400', bg: 'bg-gray-500/10' },
};

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export default function NotificationBell() {
  const { token } = useUserStore();
  const {
    notifications,
    unreadCount,
    loading,
    pagination,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    // Push state
    pushSupported,
    pushSubscribed,
    pushPermission,
    pushLoading,
    initPushState,
    togglePush,
  } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Init push state on mount
  useEffect(() => {
    initPushState();
  }, [initPushState]);

  // Poll unread count every 60s
  useEffect(() => {
    if (!token) return;
    fetchUnreadCount(token);
    const interval = setInterval(() => fetchUnreadCount(token), 60000);
    return () => clearInterval(interval);
  }, [token, fetchUnreadCount]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (open && token) fetchNotifications(token, 1);
  }, [open, token, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNotificationClick = (n) => {
    if (!n.isRead) markAsRead(token, n._id);
    if (n.link) {
      router.push(n.link);
      setOpen(false);
    }
  };

  const getPushLabel = () => {
    if (!pushSupported) return null;
    if (pushPermission === 'denied') return 'Blocked';
    if (pushLoading) return 'Loading...';
    return pushSubscribed ? 'Push On' : 'Push Off';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl bg-white/5 hover:bg-accent/10 border border-white/10 hover:border-accent/30 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-400 hover:text-accent transition-colors" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-black text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 sm:w-96 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {/* Push Toggle */}
                {pushSupported && (
                  <button
                    onClick={() => togglePush(token)}
                    disabled={pushLoading || pushPermission === 'denied'}
                    className={`text-xs flex items-center gap-1 px-2 py-1 rounded-lg border transition-colors ${
                      pushPermission === 'denied'
                        ? 'text-red-400 border-red-500/20 bg-red-500/5 cursor-not-allowed'
                        : pushSubscribed
                        ? 'text-accent border-accent/20 bg-accent/5 hover:bg-accent/10'
                        : 'text-gray-400 border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                    title={
                      pushPermission === 'denied'
                        ? 'Notifications blocked in browser settings'
                        : pushSubscribed
                        ? 'Disable push notifications'
                        : 'Enable push notifications'
                    }
                  >
                    {pushSubscribed ? (
                      <BellRing className="w-3 h-3" />
                    ) : (
                      <BellOff className="w-3 h-3" />
                    )}
                    {getPushLabel()}
                  </button>
                )}
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead(token)}
                    className="text-xs text-accent hover:text-accent/80 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/10 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 && !loading ? (
                <div className="text-center py-10">
                  <Bell className="w-10 h-10 text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const config = ICON_MAP[n.type] || ICON_MAP.system;
                  const Icon = config.icon;
                  return (
                    <div
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${
                        !n.isRead ? 'bg-accent/5' : ''
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${config.bg} shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${n.isRead ? 'text-gray-400' : 'text-white'} line-clamp-1`}>
                            {n.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(token, n._id);
                            }}
                            className="p-1 rounded hover:bg-white/10 text-gray-600 hover:text-red-400 shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className={`text-xs ${n.isRead ? 'text-gray-600' : 'text-gray-400'} line-clamp-2 mt-0.5`}>
                          {n.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-600">{timeAgo(n.createdAt)}</span>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {loading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-700 border-t-accent" />
                </div>
              )}

              {/* Load more */}
              {pagination.page < pagination.pages && !loading && (
                <button
                  onClick={() => fetchNotifications(token, pagination.page + 1)}
                  className="w-full py-3 text-xs text-accent hover:bg-white/5 flex items-center justify-center gap-1"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  Load more
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
