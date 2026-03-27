'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Trophy,
  Target,
  Calendar,
  Zap,
  Award,
  Crown,
  Star,
  Sun,
  Lock,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

const BADGE_ICONS = {
  zap: Zap, flame: Flame, award: Award, trophy: Trophy,
  crown: Crown, star: Star, sun: Sun, target: Target,
  calendar: Calendar, lock: Lock,
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const intensityColors = {
  0: 'bg-white/5',
  1: 'bg-accent/20',
  2: 'bg-accent/40',
  3: 'bg-accent/60',
  4: 'bg-accent/80',
};

export default function StreaksCalendarPage() {
  const { token } = useUserStore();
  const [streakData, setStreakData] = useState(null);
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!token) return;

    const fetchAll = async () => {
      try {
        const [streakRes, calRes] = await Promise.all([
          fetch(`${API}/api/workouts/streaks`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/workouts/calendar?months=12`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const [streakJson, calJson] = await Promise.all([streakRes.json(), calRes.json()]);

        if (streakJson.success) setStreakData(streakJson);
        if (calJson.success) setCalendarData(calJson.calendar || {});
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  // ─── Calendar logic ────────────────────────────────────────────────────────
  const changeMonth = (offset) => {
    let m = currentMonth + offset;
    let y = currentYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    const now = new Date();
    if (y > now.getFullYear() || (y === now.getFullYear() && m > now.getMonth())) return;
    setCurrentMonth(m);
    setCurrentYear(y);
  };

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const getDateStr = (day) => {
    if (!day) return null;
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getIntensity = (data) => {
    if (!data) return 0;
    const sets = data.totalSets || 0;
    if (sets >= 20) return 4;
    if (sets >= 12) return 3;
    if (sets >= 6) return 2;
    return 1;
  };

  const monthWorkouts = Object.keys(calendarData).filter((d) =>
    d.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)
  ).length;

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-accent" />
      </div>
    );
  }

  const earnedBadges = streakData?.badges?.filter((b) => b.earned) || [];
  const lockedBadges = streakData?.badges?.filter((b) => !b.earned) || [];

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold">
            <span className="text-white">Streaks & </span>
            <span className="text-accent">Calendar</span>
          </h1>
          <p className="text-gray-400 text-sm">Your consistency is your superpower</p>
        </div>

        {/* ─── Streak Hero + Stats ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Streak Hero */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 bg-gradient-to-br from-accent/10 to-orange-500/5 border border-accent/20 rounded-2xl p-6 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center mx-auto mb-2">
              <Flame className="w-7 h-7 text-accent" />
            </div>
            <p className="text-4xl font-bold text-accent">{streakData?.currentStreak || 0}</p>
            <p className="text-gray-400 text-sm">Day Streak</p>
            {streakData?.currentStreak > 0 && streakData?.currentStreak >= streakData?.longestStreak && (
              <p className="text-xs text-accent mt-1">Your best ever!</p>
            )}
          </motion.div>

          {/* Stats Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Trophy, color: 'text-yellow-400', value: streakData?.longestStreak || 0, label: 'Best Streak' },
              { icon: Dumbbell, color: 'text-accent', value: streakData?.totalWorkouts || 0, label: 'Total' },
              { icon: Calendar, color: 'text-blue-400', value: streakData?.thisWeek || 0, label: 'This Week' },
              { icon: Target, color: 'text-purple-400', value: streakData?.thisMonth || 0, label: 'This Month' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-center"
              >
                <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-[10px] text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── Calendar + Badges side by side on desktop ───────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Calendar (3 cols) */}
          <div className="lg:col-span-3">
            {/* Month Navigator */}
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-3">
              <button onClick={() => changeMonth(-1)} className="p-1 rounded-lg hover:bg-white/10">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-sm font-semibold">
                {MONTH_NAMES[currentMonth]} {currentYear}
                <span className="text-xs text-gray-500 ml-2">({monthWorkouts} workouts)</span>
              </h2>
              <button
                onClick={() => changeMonth(1)}
                className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30"
                disabled={currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Grid */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="grid grid-cols-7 gap-1 mb-1.5">
                {DAY_LABELS.map((d) => (
                  <div key={d} className="text-center text-[10px] text-gray-600 py-0.5">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                  if (!day) return <div key={`e-${idx}`} />;
                  const dateStr = getDateStr(day);
                  const data = calendarData[dateStr];
                  const intensity = getIntensity(data);
                  const isFuture = dateStr > today;
                  const isCurrentDay = dateStr === today;

                  return (
                    <div
                      key={dateStr}
                      className={`aspect-square rounded-md flex flex-col items-center justify-center text-xs transition-colors ${
                        isFuture
                          ? 'bg-white/[0.02] text-gray-700'
                          : data
                          ? `${intensityColors[intensity]} text-white`
                          : 'bg-white/5 text-gray-500'
                      } ${isCurrentDay ? 'ring-1 ring-accent' : ''}`}
                      title={data ? `${data.exerciseCount} exercises, ${data.totalSets} sets` : ''}
                    >
                      <span className={`font-medium ${data ? 'text-white' : ''}`}>{day}</span>
                      {data && <div className="w-1 h-1 rounded-full bg-white mt-0.5" />}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-gray-600">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${intensityColors[i]} border border-white/5`} />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Badges (2 cols) */}
          <div className="lg:col-span-2">
            {/* Earned */}
            {earnedBadges.length > 0 && (
              <div className="mb-5">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Badges ({earnedBadges.length})
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {earnedBadges.map((badge, idx) => {
                    const Icon = BADGE_ICONS[badge.icon] || Award;
                    return (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        className="bg-accent/5 border border-accent/20 rounded-xl p-3 text-center"
                      >
                        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center mx-auto mb-1.5">
                          <Icon className="w-4 h-4 text-accent" />
                        </div>
                        <p className="text-xs font-medium text-white leading-tight">{badge.name}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Next Goal */}
            {lockedBadges.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Next Goal</h2>
                {lockedBadges.map((badge) => {
                  const progress = badge.progress || 0;
                  const target = badge.target || 1;
                  const pct = Math.min((progress / target) * 100, 100);
                  return (
                    <div key={badge.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <Lock className="w-3.5 h-3.5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-400">{badge.name}</p>
                            <p className="text-[10px] text-gray-600">{progress} / {target}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-500">{Math.round(pct)}%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="bg-accent h-1.5 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {(streakData?.totalWorkouts || 0) === 0 && (
              <div className="text-center py-10 bg-white/5 border border-white/10 rounded-xl">
                <Dumbbell className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <h3 className="text-sm font-medium text-white mb-1">No Workouts Yet</h3>
                <p className="text-gray-500 text-xs">Log your first workout to start earning streaks!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
