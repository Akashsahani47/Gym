'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, CheckCircle, LogOut, Calendar, Flame, Clock, QrCode, X } from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

const fmtDate = (d) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '';

export default function MemberAttendancePage() {
  const { token } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [stats, setStats] = useState({ totalThisMonth: 0, streak: 0 });
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const fetchAttendance = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/attendance/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setRecords(data.records || []);
        setTodayRecord(data.todayRecord || null);
        setStats(data.stats || { totalThisMonth: 0, streak: 0 });
      }
    } catch {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const handlePinCheckIn = async () => {
    if (pin.length !== 6) return toast.error('Enter the 6-digit PIN');
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/attendance/check-in/pin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Checked in successfully!');
        setPin('');
        fetchAttendance();
      } else {
        toast.error(data.error || 'Check-in failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQRCheckIn = async (qrData) => {
    setShowScanner(false);
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/attendance/check-in/qr`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Checked in via QR!');
        fetchAttendance();
      } else {
        toast.error(data.error || 'QR check-in failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/attendance/check-out`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Checked out!');
        fetchAttendance();
      } else {
        toast.error(data.error || 'Check-out failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] bg-black">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  // Build calendar dots for this month
  const presentDates = new Set(records.map((r) => r.date));
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1);
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          <span className="text-white">My </span>
          <span className="text-accent">Attendance</span>
        </h1>
        <p className="text-gray-400 mb-8">Mark your daily attendance</p>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'This Month', value: stats.totalThisMonth, icon: <Calendar className="w-4 h-4" />, color: 'accent' },
            { label: 'Streak', value: `${stats.streak} days`, icon: <Flame className="w-4 h-4" />, color: 'orange-400' },
            { label: 'Status', value: todayRecord ? 'Present' : 'Absent', icon: <CheckCircle className="w-4 h-4" />, color: todayRecord ? 'emerald-400' : 'red-400' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
            >
              <div className={`inline-flex p-1.5 rounded-lg bg-${s.color}/20 text-${s.color} mb-2`}>
                {s.icon}
              </div>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Today's Status */}
        {todayRecord ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-emerald-400">Checked In Today</h2>
                <p className="text-sm text-gray-400">
                  at {fmtTime(todayRecord.checkInTime)}
                  {todayRecord.checkOutTime && ` — out at ${fmtTime(todayRecord.checkOutTime)}`}
                </p>
              </div>
            </div>

            {!todayRecord.checkOutTime && (
              <button
                onClick={handleCheckOut}
                disabled={submitting}
                className="w-full py-3 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/15 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                Check Out
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6"
          >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-accent" />
              Enter Today's PIN
            </h2>

            <div className="flex gap-3 mb-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit PIN"
                className="flex-1 bg-black border border-white/20 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em] font-mono placeholder:text-gray-600 placeholder:text-base placeholder:tracking-normal focus:outline-none focus:border-accent"
              />
            </div>

            <button
              onClick={handlePinCheckIn}
              disabled={submitting || pin.length !== 6}
              className="w-full py-3 bg-accent text-black rounded-xl font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              Check In
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-black text-gray-500 text-xs">OR</span>
              </div>
            </div>

            <button
              onClick={() => setShowScanner(true)}
              className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5 text-accent" />
              Scan QR Code
            </button>
          </motion.div>
        )}

        {/* Monthly Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
          </h3>

          <div className="grid grid-cols-7 gap-2 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <span key={i} className="text-xs text-gray-500 font-medium py-1">{d}</span>
            ))}

            {/* Empty slots for first day offset */}
            {Array.from({ length: new Date(year, month, 1).getDay() }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {calendarDays.map((date) => {
              const day = new Date(date + 'T00:00:00').getDate();
              const isPresent = presentDates.has(date);
              const isToday = date === new Date().toISOString().split('T')[0];
              const isFuture = new Date(date) > new Date();

              return (
                <div
                  key={date}
                  className={`relative w-9 h-9 mx-auto rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    isPresent
                      ? 'bg-accent/20 text-accent border border-accent/30'
                      : isToday
                      ? 'bg-white/10 text-white border border-white/20'
                      : isFuture
                      ? 'text-gray-700'
                      : 'text-gray-500'
                  }`}
                >
                  {day}
                  {isPresent && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Records */}
        {records.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-white/5 border border-white/10 rounded-xl overflow-hidden"
          >
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-semibold text-gray-400">Recent Check-ins</h3>
            </div>
            <div className="divide-y divide-white/5">
              {records.slice(0, 10).map((r) => (
                <div key={r._id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{fmtDate(r.date)}</p>
                      <p className="text-xs text-gray-500">via {r.method.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {fmtTime(r.checkInTime)}
                    </p>
                    {r.checkOutTime && (
                      <p className="text-xs text-gray-500">Out: {fmtTime(r.checkOutTime)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <QRScannerModal
            onScan={handleQRCheckIn}
            onClose={() => setShowScanner(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── QR Scanner Modal ────────────────────────────────────────────────────────
function QRScannerModal({ onScan, onClose }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    let scanner;
    const initScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        scanner = new Html5Qrcode('qr-reader');
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            scanner.stop().catch(() => {});
            onScan(decodedText);
          },
          () => {} // ignore scan failures
        );
      } catch (err) {
        setError('Camera access denied or not available');
      }
    };

    initScanner();

    return () => {
      if (scanner) {
        scanner.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-accent" />
            Scan QR Code
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error ? (
          <div className="text-center py-10">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-white/10 rounded-xl text-white text-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <div id="qr-reader" className="rounded-xl overflow-hidden" />
        )}

        <p className="text-xs text-gray-500 text-center mt-4">
          Point your camera at the QR code displayed at the gym
        </p>
      </motion.div>
    </motion.div>
  );
}
