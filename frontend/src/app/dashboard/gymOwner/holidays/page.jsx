'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarOff,
  Plus,
  Trash2,
  Building,
  Calendar,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function HolidaysPage() {
  const { token } = useUserStore();
  const [gyms, setGyms] = useState([]);
  const [selectedGym, setSelectedGym] = useState('');
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  // Fetch gyms on mount
  useEffect(() => {
    if (!token) return;
    const fetchGyms = async () => {
      try {
        const res = await fetch(`${API}/api/gym-owner/gyms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.gyms?.length > 0) {
          setGyms(data.gyms);
          setSelectedGym(data.gyms[0]._id);
        }
      } catch {
        toast.error('Failed to load gyms');
      } finally {
        setLoading(false);
      }
    };
    fetchGyms();
  }, [token]);

  // Fetch holidays when gym changes
  useEffect(() => {
    if (!token || !selectedGym) return;
    const fetchHolidays = async () => {
      try {
        const res = await fetch(`${API}/api/gym-owner/holidays/${selectedGym}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setHolidays(data.holidays || []);
      } catch {
        // silent
      }
    };
    fetchHolidays();
  }, [token, selectedGym]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    setAdding(true);
    try {
      const res = await fetch(`${API}/api/gym-owner/holidays`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gymId: selectedGym, date, reason }),
      });
      const data = await res.json();
      if (data.success) {
        setHolidays((prev) => [...prev, data.holiday].sort((a, b) => a.date.localeCompare(b.date)));
        setDate('');
        setReason('');
        toast.success(`Holiday added! ${data.notifiedMembers} members notified`);
      } else {
        toast.error(data.error || 'Failed to add holiday');
      }
    } catch {
      toast.error('Failed to add holiday');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (holidayId) => {
    try {
      const res = await fetch(`${API}/api/gym-owner/holidays/${selectedGym}/${holidayId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setHolidays((prev) => prev.filter((h) => h._id !== holidayId));
        toast.success('Holiday removed');
      } else {
        toast.error(data.error || 'Failed to remove');
      }
    } catch {
      toast.error('Failed to remove');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const today = new Date().toISOString().split('T')[0];
  const upcomingHolidays = holidays.filter((h) => h.date >= today);
  const pastHolidays = holidays.filter((h) => h.date < today);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold">
          <span className="text-gray-900 dark:text-white">Gym </span>
          <span className="text-accent">Holidays</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Schedule closures and notify all members automatically
        </p>
      </div>

      {/* Gym Selector */}
      {gyms.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Select Gym</label>
          <select
            value={selectedGym}
            onChange={(e) => setSelectedGym(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-accent"
          >
            {gyms.map((g) => (
              <option key={g._id} value={g._id}>{g.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Add Holiday Form */}
        <motion.form
          onSubmit={handleAdd}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 lg:p-6 h-fit lg:sticky lg:top-6"
        >
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <Plus className="w-4 h-4 text-accent" />
            Add Holiday
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                className="w-full px-4 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Reason</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. National Holiday, Maintenance"
                className="w-full px-4 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-accent"
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="w-full px-6 py-2.5 bg-accent text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Holiday
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            All active members will be notified via bell + push notification
          </p>
        </motion.form>

        {/* Right: Holiday Lists */}
        <div>
          {/* Upcoming Holidays */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
              Upcoming Holidays ({upcomingHolidays.length})
            </h2>
            {upcomingHolidays.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl">
                <CalendarOff className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No upcoming holidays</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {upcomingHolidays.map((h) => (
                    <motion.div
                      key={h._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10, height: 0 }}
                      className="flex items-center justify-between bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-5 py-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(h.date)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{h.reason}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(h._id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Past Holidays */}
          {pastHolidays.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                Past Holidays ({pastHolidays.length})
              </h2>
              <div className="space-y-2 opacity-60">
                {pastHolidays.map((h) => (
                  <div
                    key={h._id}
                    className="flex items-center justify-between bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-5 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{formatDate(h.date)}</p>
                        <p className="text-xs text-gray-500">{h.reason}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(h._id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
