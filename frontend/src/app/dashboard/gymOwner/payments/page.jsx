'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Search,
  Building,
  User,
  Calendar,
  CreditCard,
  Banknote,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const monthLabel = (ym) => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  return new Date(+y, +m - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
};

const STATUS_CONFIG = {
  paid:    { label: 'Paid',    bg: 'bg-accent/10', border: 'border-accent/30', text: 'text-accent',    dot: 'bg-accent' },
  pending: { label: 'Pending', bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  text: 'text-amber-400',   dot: 'bg-amber-400' },
  overdue: { label: 'Overdue', bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-400',     dot: 'bg-red-400' },
};

const METHOD_ICONS = {
  cash:          <Banknote className="w-3.5 h-3.5" />,
  online:        <CreditCard className="w-3.5 h-3.5" />,
  card:          <CreditCard className="w-3.5 h-3.5" />,
  bank_transfer: <ArrowUpRight className="w-3.5 h-3.5" />,
};

// ─── Mark-Paid Modal ─────────────────────────────────────────────────────────
function MarkPaidModal({ payment, onClose, onConfirm, loading }) {
  const [method, setMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mark as Paid</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {payment.memberName} · {monthLabel(payment.month)}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount */}
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-5 flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
          <span className="text-2xl font-bold text-accent">{fmt(payment.amount)}</span>
        </div>

        {/* Method */}
        <div className="mb-4">
          <label className="block text-sm text-gray-500 mb-2">Payment Method</label>
          <div className="grid grid-cols-2 gap-2">
            {['cash', 'online', 'card', 'bank_transfer'].map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors capitalize ${
                  method === m
                    ? 'bg-accent/10 border-accent/40 text-accent'
                    : 'bg-white dark:bg-black border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                {METHOD_ICONS[m]}
                {m.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-2">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Add a note..."
            className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-600 focus:outline-none focus:border-accent resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(method, notes)}
            disabled={loading}
            className="flex-1 py-3 bg-accent text-black rounded-xl font-semibold hover:bg-accent-hover transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Confirm Payment
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Payment Row ─────────────────────────────────────────────────────────────
function PaymentRow({ payment, onMarkPaid, isExpanded, onToggle }) {
  const cfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.pending;

  return (
    <>
      <tr
        className="border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-white/2 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        {/* Member */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{payment.memberName}</p>
              <p className="text-xs text-gray-500 truncate">{payment.memberEmail}</p>
            </div>
          </div>
        </td>

        {/* Gym */}
        <td className="px-4 py-3 hidden md:table-cell">
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <Building className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[120px]">{payment.gymName}</span>
          </div>
        </td>

        {/* Plan */}
        <td className="px-4 py-3 hidden lg:table-cell">
          <span className="text-sm text-gray-600 dark:text-gray-400">{payment.planName || '—'}</span>
        </td>

        {/* Month */}
        <td className="px-4 py-3 hidden sm:table-cell">
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            {monthLabel(payment.month)}
          </div>
        </td>

        {/* Amount */}
        <td className="px-4 py-3">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{fmt(payment.amount)}</span>
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </td>

        {/* Action */}
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            {payment.status !== 'paid' && (
              <button
                onClick={(e) => { e.stopPropagation(); onMarkPaid(payment); }}
                className="px-3 py-1.5 bg-accent text-black text-xs font-semibold rounded-lg hover:bg-accent-hover transition-colors whitespace-nowrap"
              >
                Mark Paid
              </button>
            )}
            {payment.status === 'paid' && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {METHOD_ICONS[payment.method] ?? METHOD_ICONS.cash}
                <span className="capitalize">{payment.method?.replace('_', ' ')}</span>
              </div>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </td>
      </tr>

      {/* Expanded detail row */}
      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={7} className="px-4 pb-4 bg-gray-100/30 dark:bg-white/1">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Paid On</p>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{payment.paidAt ? fmtDate(payment.paidAt) : '—'}</p>
                  </div>
                  <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Method</p>
                    <p className="text-sm text-gray-900 dark:text-white font-medium capitalize">{payment.method?.replace('_', ' ') || '—'}</p>
                  </div>
                  <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Amount</p>
                    <p className="text-sm text-accent font-bold">{fmt(payment.amount)}</p>
                  </div>
                  <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{payment.notes || '—'}</p>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const { token } = useUserStore();

  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGym, setFilterGym] = useState('all');
  const [filterMonth, setFilterMonth] = useState('current');

  // UI
  const [expandedRow, setExpandedRow] = useState(null);
  const [markPaidTarget, setMarkPaidTarget] = useState(null);
  const [markingPaid, setMarkingPaid] = useState(false);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchPayments = async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPayments(data.payments);
        setStats(data.stats);
      } else {
        toast.error(data.error || 'Failed to load payments');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [token]);

  // ── mark paid ──────────────────────────────────────────────────────────────
  const handleMarkPaid = async (method, notes) => {
    if (!markPaidTarget) return;
    setMarkingPaid(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/payments/mark-paid/${markPaidTarget._id}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ method, notes }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success('Payment marked as paid!');
        setMarkPaidTarget(null);
        setPayments((prev) =>
          prev.map((p) => (p._id === data.payment._id ? data.payment : p))
        );
        // Update stats locally
        setStats((prev) =>
          prev
            ? {
                ...prev,
                thisMonthIncome: prev.thisMonthIncome + (data.payment.amount ?? 0),
                thisMonthPending: Math.max(0, prev.thisMonthPending - (data.payment.amount ?? 0)),
                totalIncome: prev.totalIncome + (data.payment.amount ?? 0),
                paidThisMonth: prev.paidThisMonth + 1,
                pendingThisMonth: Math.max(0, prev.pendingThisMonth - 1),
              }
            : prev
        );
      } else {
        toast.error(data.error || 'Failed to mark as paid');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setMarkingPaid(false);
    }
  };

  // ── derive gym list for filter ─────────────────────────────────────────────
  const gymOptions = useMemo(() => {
    const seen = new Map();
    payments.forEach((p) => { if (p.gymId && p.gymName) seen.set(p.gymId, p.gymName); });
    return [...seen.entries()];
  }, [payments]);

  // ── derive month options ───────────────────────────────────────────────────
  const monthOptions = useMemo(() => {
    const seen = new Set(payments.map((p) => p.month));
    return [...seen].sort().reverse();
  }, [payments]);

  // ── filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      if (filterGym !== 'all' && p.gymId !== filterGym) return false;
      if (filterMonth === 'current' && p.month !== stats?.currentMonth) return false;
      if (filterMonth !== 'all' && filterMonth !== 'current' && p.month !== filterMonth) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          p.memberName?.toLowerCase().includes(q) ||
          p.memberEmail?.toLowerCase().includes(q) ||
          p.gymName?.toLowerCase().includes(q) ||
          p.planName?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [payments, filterStatus, filterGym, filterMonth, searchTerm, stats]);

  // ── loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 dark:border-gray-800 border-t-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white p-4 lg:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">
            <span className="text-gray-900 dark:text-white">Payments & </span>
            <span className="text-accent">Revenue</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {stats?.currentMonth ? `Viewing ${monthLabel(stats.currentMonth)}` : 'All payment records'}
          </p>
        </div>
        <button
          onClick={() => fetchPayments(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:border-accent/30 hover:text-accent transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'This Month Income',
            value: fmt(stats?.thisMonthIncome),
            sub: `${stats?.paidThisMonth ?? 0} payments received`,
            icon: <CheckCircle className="w-5 h-5" />,
            bg: 'bg-accent/10',
            border: 'border-accent/30',
            iconColor: 'text-accent',
            valueColor: 'text-accent',
          },
          {
            label: 'Pending This Month',
            value: fmt(stats?.thisMonthPending),
            sub: `${stats?.pendingThisMonth ?? 0} members unpaid`,
            icon: <Clock className="w-5 h-5" />,
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/30',
            iconColor: 'text-amber-400',
            valueColor: 'text-amber-400',
          },
          {
            label: 'Next Month Expected',
            value: fmt(stats?.nextMonthExpected),
            sub: monthLabel(stats?.nextMonth),
            icon: <TrendingUp className="w-5 h-5" />,
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
            iconColor: 'text-blue-400',
            valueColor: 'text-blue-400',
          },
          {
            label: 'Total Revenue',
            value: fmt(stats?.totalIncome),
            sub: 'All time',
            icon: <Zap className="w-5 h-5" />,
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/30',
            iconColor: 'text-purple-400',
            valueColor: 'text-purple-400',
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-white dark:bg-gray-900 shadow-sm dark:shadow-none rounded-xl p-4 lg:p-5 border ${card.border}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${card.bg} border ${card.border}`}>
                <span className={card.iconColor}>{card.icon}</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-700" />
            </div>
            <p className={`text-xl lg:text-2xl font-bold mb-1 ${card.valueColor}`}>{card.value}</p>
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className="text-xs text-gray-600 mt-0.5">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[180px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search member, gym, plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-accent placeholder-gray-600"
            />
          </div>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-accent"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>

          {/* Gym */}
          {gymOptions.length > 1 && (
            <select
              value={filterGym}
              onChange={(e) => setFilterGym(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-accent"
            >
              <option value="all">All Gyms</option>
              {gymOptions.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          )}

          {/* Month */}
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-accent"
          >
            <option value="current">This Month</option>
            <option value="all">All Months</option>
            {monthOptions.map((m) => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
        </div>

        {/* Active filter summary */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs text-gray-500">
            Showing <span className="text-gray-900 dark:text-white font-semibold">{filtered.length}</span> of{' '}
            {payments.length} records
          </span>
          {filterStatus !== 'all' && (
            <button
              onClick={() => setFilterStatus('all')}
              className="flex items-center gap-1 text-xs bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-gray-700 rounded-full px-2 py-0.5 text-gray-600 dark:text-gray-400 hover:border-red-500/40 hover:text-red-400"
            >
              {filterStatus} <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <DollarSign className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No payment records found</p>
          <p className="text-xs text-gray-600 mt-1">Try changing your filters or add members</p>
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Member</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Gym</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Month</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((payment) => (
                  <PaymentRow
                    key={payment._id}
                    payment={payment}
                    onMarkPaid={setMarkPaidTarget}
                    isExpanded={expandedRow === payment._id}
                    onToggle={() =>
                      setExpandedRow((prev) => (prev === payment._id ? null : payment._id))
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer summary */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-gray-500">
              {filtered.filter((p) => p.status === 'paid').length} paid ·{' '}
              {filtered.filter((p) => p.status === 'pending').length} pending ·{' '}
              {filtered.filter((p) => p.status === 'overdue').length} overdue
            </span>
            <span className="text-sm font-semibold text-accent">
              Collected:{' '}
              {fmt(filtered.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0))}
            </span>
          </div>
        </div>
      )}

      {/* ── Mark Paid Modal ── */}
      <AnimatePresence>
        {markPaidTarget && (
          <MarkPaidModal
            payment={markPaidTarget}
            loading={markingPaid}
            onClose={() => !markingPaid && setMarkPaidTarget(null)}
            onConfirm={handleMarkPaid}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
