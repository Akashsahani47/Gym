'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  IndianRupee,
  Dumbbell,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);

const monthLabel = (ym) => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  return new Date(+y, +m - 1, 1).toLocaleString('en-IN', { month: 'short' });
};

const ACCENT = '#DAFF00';
const CHART_BG = 'rgba(218, 255, 0, 0.15)';

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color || ACCENT }}>
          {formatter ? formatter(p.value, p.name) : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Heatmap Grid ────────────────────────────────────────────────────────────
function AttendanceHeatmap({ data, maxCount }) {
  if (!data?.length) {
    return <p className="text-gray-500 text-center py-8">No attendance data yet</p>;
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dateMap = {};
  data.forEach((d) => { dateMap[d.date] = d.count; });

  // Build grid: fill in all dates from first to last
  const firstDate = new Date(data[0].date + 'T00:00:00');
  const lastDate = new Date(data[data.length - 1].date + 'T00:00:00');
  const allDates = [];
  for (let d = new Date(firstDate); d <= lastDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    allDates.push({ date: dateStr, dayOfWeek: d.getDay(), count: dateMap[dateStr] || 0 });
  }

  // Group by weeks
  const weeks = [];
  let currentWeek = [];
  allDates.forEach((d) => {
    if (d.dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(d);
  });
  if (currentWeek.length) weeks.push(currentWeek);

  const getColor = (count) => {
    if (count === 0) return 'bg-white/5';
    const intensity = Math.min(count / (maxCount || 1), 1);
    if (intensity < 0.25) return 'bg-accent/20';
    if (intensity < 0.5) return 'bg-accent/40';
    if (intensity < 0.75) return 'bg-accent/60';
    return 'bg-accent/90';
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {dayLabels.map((d, i) => (
            <div key={i} className="w-8 h-4 flex items-center">
              <span className="text-[10px] text-gray-500">{i % 2 === 1 ? d : ''}</span>
            </div>
          ))}
        </div>
        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {Array.from({ length: 7 }, (_, di) => {
              const cell = week.find((d) => d.dayOfWeek === di);
              return (
                <div
                  key={di}
                  className={`w-4 h-4 rounded-sm ${cell ? getColor(cell.count) : 'bg-transparent'} transition-colors`}
                  title={cell ? `${cell.date}: ${cell.count} check-ins` : ''}
                />
              );
            })}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] text-gray-500">Less</span>
        {['bg-white/5', 'bg-accent/20', 'bg-accent/40', 'bg-accent/60', 'bg-accent/90'].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span className="text-[10px] text-gray-500">More</span>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { token } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [growth, setGrowth] = useState([]);
  const [heatmap, setHeatmap] = useState({ data: [], maxCount: 0 });
  const [retention, setRetention] = useState([]);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [ovRes, revRes, growRes, heatRes, retRes] = await Promise.all([
        fetch(`${API}/api/gym-owner/analytics/overview`, { headers }),
        fetch(`${API}/api/gym-owner/analytics/revenue`, { headers }),
        fetch(`${API}/api/gym-owner/analytics/member-growth`, { headers }),
        fetch(`${API}/api/gym-owner/analytics/attendance-heatmap`, { headers }),
        fetch(`${API}/api/gym-owner/analytics/retention`, { headers }),
      ]);

      const [ovData, revData, growData, heatData, retData] = await Promise.all([
        ovRes.json(), revRes.json(), growRes.json(), heatRes.json(), retRes.json(),
      ]);

      if (ovRes.ok) setOverview(ovData.data);
      if (revRes.ok) setRevenue(revData.data || []);
      if (growRes.ok) setGrowth(growData.data || []);
      if (heatRes.ok) setHeatmap({ data: heatData.data || [], maxCount: heatData.maxCount || 0 });
      if (retRes.ok) setRetention(retData.data || []);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 dark:border-gray-800 border-t-accent" />
      </div>
    );
  }

  const ov = overview || {};

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">
            <span className="text-gray-900 dark:text-white">Gym </span>
            <span className="text-accent">Analytics</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Track your gym's performance</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchAll(); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:border-accent/30 hover:text-accent transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Members',
            value: ov.totalMembers ?? 0,
            sub: `${ov.activeMembers ?? 0} active`,
            icon: <Users className="w-5 h-5" />,
            color: 'accent',
          },
          {
            label: 'This Month Revenue',
            value: fmt(ov.thisMonthRevenue),
            sub: ov.revenueGrowth > 0
              ? `+${ov.revenueGrowth}% vs last month`
              : ov.revenueGrowth < 0
              ? `${ov.revenueGrowth}% vs last month`
              : 'Same as last month',
            icon: <IndianRupee className="w-5 h-5" />,
            color: 'emerald-400',
            trend: ov.revenueGrowth,
          },
          {
            label: 'Today Attendance',
            value: ov.todayAttendance ?? 0,
            sub: 'Check-ins today',
            icon: <Calendar className="w-5 h-5" />,
            color: 'blue-400',
          },
          {
            label: 'Total Gyms',
            value: ov.totalGyms ?? 0,
            sub: 'Active locations',
            icon: <Dumbbell className="w-5 h-5" />,
            color: 'purple-400',
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 lg:p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-${card.color}/10 border border-${card.color}/30`}>
                <span className={`text-${card.color}`}>{card.icon}</span>
              </div>
              {card.trend !== undefined && (
                card.trend >= 0
                  ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                  : <TrendingDown className="w-4 h-4 text-red-400" />
              )}
            </div>
            <p className={`text-xl lg:text-2xl font-bold mb-1 text-${card.color}`}>{card.value}</p>
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className="text-xs text-gray-600 mt-0.5">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5"
        >
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            Revenue (Monthly)
          </h3>
          {revenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenue.map((d) => ({ ...d, label: monthLabel(d.month) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip content={<CustomTooltip formatter={(v) => fmt(v)} />} />
                <Bar dataKey="totalRevenue" fill={ACCENT} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-16">No revenue data yet</p>
          )}
        </motion.div>

        {/* Member Growth */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5"
        >
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            Member Growth
          </h3>
          {growth.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={growth.map((d) => ({ ...d, label: monthLabel(d.month) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="totalMembers" stroke={ACCENT} fill={CHART_BG} strokeWidth={2} />
                <Area type="monotone" dataKey="newMembers" stroke="#60a5fa" fill="rgba(96,165,250,0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-16">No member data yet</p>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5"
        >
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            Attendance Heatmap
          </h3>
          <AttendanceHeatmap data={heatmap.data} maxCount={heatmap.maxCount} />
        </motion.div>

        {/* Retention Rate */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5"
        >
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            Retention Rate
          </h3>
          {retention.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={retention.map((d) => ({ ...d, label: monthLabel(d.month) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#888' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip formatter={(v, name) => name === 'retentionRate' ? `${v}%` : v} />} />
                <Line type="monotone" dataKey="retentionRate" stroke={ACCENT} strokeWidth={2.5} dot={{ fill: ACCENT, r: 4 }} />
                <Line type="monotone" dataKey="activeCount" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-16">No retention data yet</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
