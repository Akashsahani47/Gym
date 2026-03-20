'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, Banknote, Clock, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';
import { generateInvoice } from '@/utils/generateInvoice';

const monthLabel = (monthStr) => {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) return monthStr || '—';
  const [y, m] = monthStr.split('-');
  return new Date(+y, +m - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const methodLabel = (m) => {
  const map = { cash: 'Cash', online: 'Online', card: 'Card', bank_transfer: 'Bank Transfer' };
  return map[m] || m;
};

export default function MemberPaymentsPage() {
  const { token } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalPaid: 0, pendingAmount: 0, totalRecords: 0 });

  useEffect(() => {
    if (!token) return;
    const fetchPayments = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/member/payments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setPayments(data.payments || []);
          setSummary(data.summary || { totalPaid: 0, pendingAmount: 0, totalRecords: 0 });
        } else {
          toast.error(data.error || 'Failed to load payments');
        }
      } catch {
        toast.error('Could not load payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] bg-black">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          <span className="text-white">My </span>
          <span className="text-accent">Payments</span>
        </h1>
        <p className="text-gray-400 mb-8">View your payment history with the gym. You cannot mark payments as paid here.</p>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Total paid
            </div>
            <p className="text-xl font-bold text-emerald-400">₹{summary.totalPaid?.toLocaleString() ?? 0}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Clock className="w-4 h-4 text-yellow-400" />
              Pending
            </div>
            <p className="text-xl font-bold text-yellow-400">₹{summary.pendingAmount?.toLocaleString() ?? 0}</p>
          </div>
        </motion.div>

        {/* List */}
        <div className="space-y-4">
          {payments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-8 text-center"
            >
              <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No payment records yet.</p>
              <p className="text-gray-500 text-sm mt-1">Your gym will add payment entries as you pay.</p>
            </motion.div>
          ) : (
            payments.map((p, i) => (
              <motion.div
                key={p._id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 lg:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-accent" />
                      {monthLabel(p.month)}
                    </p>
                    {p.gymName && <p className="text-sm text-gray-400 mt-0.5">{p.gymName}</p>}
                    {p.planName && <p className="text-xs text-gray-500">{p.planName}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-accent">₹{Number(p.amount)?.toLocaleString() ?? 0}</p>
                    <span
                      className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs ${
                        p.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : p.status === 'overdue'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {p.status === 'paid' ? <CheckCircle className="w-3 h-3" /> : p.status === 'overdue' ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {p.status?.charAt(0).toUpperCase() + (p.status || '').slice(1)}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5" />
                    {methodLabel(p.method)}
                  </span>
                  {p.paidAt && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Paid on {fmtDate(p.paidAt)}
                    </span>
                  )}
                </div>
                {p.notes && <p className="text-xs text-gray-500 mt-2">Note: {p.notes}</p>}

                {p.status === 'paid' && (
                  <button
                    onClick={() => generateInvoice(p)}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-xl text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Invoice
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
