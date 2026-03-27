'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarOff, Calendar, Dumbbell } from 'lucide-react';
import useUserStore from '@/store/useUserStore';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function MemberHolidaysPage() {
  const { token } = useUserStore();
  const [holidays, setHolidays] = useState([]);
  const [gymName, setGymName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchHolidays = async () => {
      try {
        const res = await fetch(`${API}/api/member/holidays`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setHolidays(data.holidays || []);
          setGymName(data.gymName || '');
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
  }, [token]);

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const today = new Date().toISOString().split('T')[0];

  const isToday = (dateStr) => dateStr === today;
  const isTomorrow = (dateStr) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dateStr === tomorrow.toISOString().split('T')[0];
  };

  const getDaysUntil = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr + 'T00:00:00') - new Date(today + 'T00:00:00')) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `In ${diff} days`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] bg-black">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          <span className="text-white">Upcoming </span>
          <span className="text-accent">Holidays</span>
        </h1>
        <p className="text-gray-400 mb-8">
          {gymName ? `Scheduled closures for ${gymName}` : 'Days when your gym will be closed'}
        </p>

        {holidays.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white/5 border border-white/10 rounded-xl"
          >
            <CalendarOff className="w-14 h-14 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-1">No Upcoming Holidays</h3>
            <p className="text-gray-500 text-sm">Your gym has no scheduled closures. Keep training!</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {holidays.map((h, idx) => {
              const urgent = isToday(h.date) || isTomorrow(h.date);
              return (
                <motion.div
                  key={h._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${
                    urgent
                      ? 'bg-red-500/5 border-red-500/20'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      urgent
                        ? 'bg-red-500/15 border border-red-500/30'
                        : 'bg-accent/10 border border-accent/20'
                    }`}
                  >
                    <Calendar className={`w-6 h-6 ${urgent ? 'text-red-400' : 'text-accent'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{formatDate(h.date)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{h.reason}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                      urgent
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}
                  >
                    {getDaysUntil(h.date)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
