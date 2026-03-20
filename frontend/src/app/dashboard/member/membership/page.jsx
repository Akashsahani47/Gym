'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, CheckCircle, XCircle } from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function MembershipPage() {
  const { user, token, updateUser } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchMe = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.user) updateUser(data.user);
      } catch {
        toast.error('Could not load membership');
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token, updateUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] bg-black">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const m = user?.membership || {};

  const statusConfig = {
    active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle },
    expired: { label: 'Expired', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
    pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: CreditCard },
  };
  const status = statusConfig[m.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          <span className="text-white">My </span>
          <span className="text-accent">Membership</span>
        </h1>
        <p className="text-gray-400 mb-8">Plan and validity</p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6 lg:p-8"
        >
          {m.planName || m.startDate || m.endDate ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{m.planName || 'Membership'}</h2>
                    <span className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded text-xs border ${status.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    Start date
                  </span>
                  <span className="text-white">{fmtDate(m.startDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    End date
                  </span>
                  <span className="text-white">{fmtDate(m.endDate)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No membership details yet.</p>
              <p className="text-gray-500 text-sm mt-1">Your gym will assign a plan to your account.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
