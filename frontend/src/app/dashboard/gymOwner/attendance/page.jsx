'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  QrCode,
  KeyRound,
  Copy,
  LogIn,
  LogOut,
  BarChart,
  ChevronDown,
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

export default function AttendancePage() {
  const { token } = useUserStore();

  const [gyms, setGyms] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null);
  const [pin, setPin] = useState(null);
  const [pinDate, setPinDate] = useState(null);
  const [records, setRecords] = useState([]);
  const [dayStats, setDayStats] = useState(null);
  const [monthStats, setMonthStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState('');
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch gyms
  useEffect(() => {
    if (!token) return;
    const fetchGyms = async () => {
      try {
        const res = await fetch(`${API}/api/gym-owner/gyms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.gyms?.length) {
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

  // Fetch attendance + PIN when gym changes
  const fetchAll = useCallback(async () => {
    if (!token || !selectedGym) return;
    try {
      const [pinRes, attRes, statsRes] = await Promise.all([
        fetch(`${API}/api/attendance/today-pin/${selectedGym}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/api/attendance/gym/${selectedGym}?date=${viewDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/api/attendance/gym/${selectedGym}/stats?month=${viewDate.slice(0, 7)}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const pinData = await pinRes.json();
      const attData = await attRes.json();
      const statsData = await statsRes.json();

      if (pinRes.ok) {
        setPin(pinData.pin);
        setPinDate(pinData.date);
      }
      if (attRes.ok) {
        setRecords(attData.records || []);
        setDayStats(attData.stats || null);
      }
      if (statsRes.ok) {
        setMonthStats(statsData.stats || null);
      }
    } catch {
      toast.error('Failed to load data');
    }
  }, [token, selectedGym, viewDate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleGeneratePin = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API}/api/attendance/generate-pin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymId: selectedGym }),
      });
      const data = await res.json();
      if (res.ok) {
        setPin(data.pin);
        setPinDate(data.date);
        toast.success('New PIN generated!');
      } else {
        toast.error(data.error || 'Failed to generate PIN');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setGenerating(false);
    }
  };

  const handleShowQR = async () => {
    try {
      const res = await fetch(`${API}/api/attendance/gym/${selectedGym}/qr-payload`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setQrData(data.qrData);
        setPin(data.pin);
        setPinDate(data.date);
        setShowQR(true);
      }
    } catch {
      toast.error('Failed to generate QR');
    }
  };

  const copyPin = () => {
    if (pin) {
      navigator.clipboard.writeText(pin);
      toast.success('PIN copied!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 dark:border-gray-800 border-t-accent" />
      </div>
    );
  }

  if (!gyms.length) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">Add a gym first to manage attendance</p>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">
            <span className="text-gray-900 dark:text-white">Attendance </span>
            <span className="text-accent">Management</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Generate PINs and track member attendance</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Gym selector */}
          {gyms.length > 1 && (
            <div className="relative">
              <select
                value={selectedGym || ''}
                onChange={(e) => setSelectedGym(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-8 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:border-accent"
              >
                {gyms.map((g) => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          )}

          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:border-accent/30 hover:text-accent transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* PIN Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Today's PIN Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-accent" />
              Today's PIN
            </h2>
            <span className="text-xs text-gray-500">{today}</span>
          </div>

          {pin && pinDate === today ? (
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-accent/5 border border-accent/20 rounded-xl p-6 text-center">
                <p className="text-5xl lg:text-6xl font-mono font-bold text-accent tracking-[0.3em]">
                  {pin}
                </p>
                <p className="text-xs text-gray-500 mt-3">Write this on the board at your gym entrance</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={copyPin}
                  className="p-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-accent/30 transition-colors"
                  title="Copy PIN"
                >
                  <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={handleShowQR}
                  className="p-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-accent/30 transition-colors"
                  title="Show QR"
                >
                  <QrCode className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <KeyRound className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No PIN generated for today</p>
            </div>
          )}

          <button
            onClick={handleGeneratePin}
            disabled={generating}
            className="mt-4 w-full py-3 bg-accent text-black rounded-xl font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {pin && pinDate === today ? 'Regenerate PIN' : 'Generate PIN'}
          </button>
        </motion.div>

        {/* Monthly Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6"
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-accent" />
            Monthly Stats
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Total Check-ins', value: monthStats?.totalCheckIns ?? 0, color: 'text-accent' },
              { label: 'Unique Members', value: monthStats?.uniqueMembers ?? 0, color: 'text-blue-400' },
              { label: 'Daily Average', value: monthStats?.dailyAverage ?? 0, color: 'text-purple-400' },
              { label: 'Total Members', value: monthStats?.totalMembers ?? 0, color: 'text-gray-400' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{s.label}</span>
                <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
          {monthStats?.peakDay && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500">Peak Day</p>
              <p className="text-sm font-medium text-accent">
                {new Date(monthStats.peakDay + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                {' — '}{monthStats.peakDayCount} check-ins
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Date Picker + Day Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">Attendance Records</h2>
          <input
            type="date"
            value={viewDate}
            onChange={(e) => setViewDate(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>

        {dayStats && (
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-accent">
              <LogIn className="w-4 h-4" /> {dayStats.present} present
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <Clock className="w-4 h-4" /> {dayStats.currentlyIn} currently in
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <Users className="w-4 h-4" /> {dayStats.totalMembers} total
            </span>
          </div>
        )}
      </div>

      {/* Records Table */}
      {records.length === 0 ? (
        <div className="text-center py-16 bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No attendance records for this date</p>
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Member</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Check In</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Check Out</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id} className="border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-white/2">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{r.memberName}</p>
                        <p className="text-xs text-gray-500">{r.memberEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                        <LogIn className="w-3.5 h-3.5 text-accent" />
                        {fmtTime(r.checkInTime)}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                        <LogOut className="w-3.5 h-3.5" />
                        {r.checkOutTime ? fmtTime(r.checkOutTime) : '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-accent/10 border border-accent/30 text-accent">
                        {r.method === 'qr' ? <QrCode className="w-3 h-3" /> : <KeyRound className="w-3 h-3" />}
                        {r.method.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.checkOutTime ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 border border-gray-500/30 text-gray-400">
                          <CheckCircle className="w-3 h-3" /> Left
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> In Gym
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {records.length} check-ins · {records.filter((r) => !r.checkOutTime).length} currently in gym
            </span>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowQR(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Attendance QR Code</h3>
            <p className="text-sm text-gray-500 mb-6">Print this or display at the entrance</p>

            <div className="bg-white rounded-xl p-6 inline-block mb-4">
              <QRCodeSVG value={qrData} size={200} level="H" />
            </div>

            <p className="text-xs text-gray-500 mb-2">PIN: <span className="text-accent font-mono font-bold text-lg">{pin}</span></p>
            <p className="text-xs text-gray-500">Valid for today only</p>

            <button
              onClick={() => setShowQR(false)}
              className="mt-6 w-full py-3 bg-accent text-black rounded-xl font-semibold hover:bg-accent-hover transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
