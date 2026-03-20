'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  CreditCard,
  Target,
  AlertCircle,
  Shield,
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const formatAddress = (addr) => {
  if (!addr) return '—';
  const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
};

export default function MemberProfilePage() {
  const { user, token, updateUser } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    const fetchMe = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Failed to load profile');
          return;
        }
        if (data.user) updateUser(data.user);
        setError(null);
      } catch (e) {
        setError('Network error');
        toast.error('Could not load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token, updateUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white mb-2">{error || 'User not found'}</p>
          <p className="text-gray-400 text-sm">Please log in again.</p>
        </div>
      </div>
    );
  }

  const profile = user.profile || {};
  const membership = user.membership || {};
  const health = user.healthMetrics || {};
  const gym = user.gymId || {};

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold">
            <span className="text-white">Member </span>
            <span className="text-accent">Dashboard</span>
          </h1>
          <p className="text-gray-400 mt-1">Your profile and membership at a glance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile + Health */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <h2 className="text-lg font-bold flex items-center mb-4">
                <User className="w-5 h-5 mr-2 text-accent" />
                Profile
              </h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <User className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {profile.firstName} {profile.lastName}
                  </h3>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                      user.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : user.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {user.status?.charAt(0).toUpperCase() + (user.status || '').slice(1)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-4 h-4 text-accent shrink-0" />
                  <span>{user.email || '—'}</span>
                  {user.emailVerified && (
                    <span className="flex items-center text-emerald-400 text-xs">
                      <Shield className="w-3 h-3 mr-1" /> Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-4 h-4 text-accent shrink-0" />
                  <span>{profile.phone || '—'}</span>
                </div>
                <div className="flex items-start gap-3 text-gray-300 sm:col-span-2">
                  <Calendar className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>DOB: {fmtDate(profile.dateOfBirth)}</span>
                </div>
                {profile.emergencyContact && (
                  <div className="flex items-center gap-3 text-gray-300 sm:col-span-2">
                    <AlertCircle className="w-4 h-4 text-accent shrink-0" />
                    <span>Emergency: {profile.emergencyContact}</span>
                  </div>
                )}
                <div className="flex items-start gap-3 text-gray-300 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Address: {formatAddress(profile.address)}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <h2 className="text-lg font-bold flex items-center mb-4">
                <Target className="w-5 h-5 mr-2 text-accent" />
                Health & Goals
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Height</p>
                  <p className="text-white font-medium">{health.height ? `${health.height} cm` : '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Weight</p>
                  <p className="text-white font-medium">{health.weight ? `${health.weight} kg` : '—'}</p>
                </div>
              </div>
              {health.fitnessGoals?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {health.fitnessGoals.map((goal, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No fitness goals set yet.</p>
              )}
            </motion.div>
          </div>

          {/* Right: Gym + Membership */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <h2 className="text-lg font-bold flex items-center mb-4">
                <Building className="w-5 h-5 mr-2 text-accent" />
                My Gym
              </h2>
              {gym.name ? (
                <>
                  <p className="text-white font-semibold">{gym.name}</p>
                  <p className="text-gray-400 text-sm mt-1 flex items-start gap-2">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                    {typeof gym.address === 'object'
                      ? formatAddress(gym.address)
                      : gym.address || '—'}
                  </p>
                </>
              ) : (
                <p className="text-gray-500">No gym assigned.</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <h2 className="text-lg font-bold flex items-center mb-4">
                <CreditCard className="w-5 h-5 mr-2 text-accent" />
                Membership
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan</span>
                  <span className="text-accent font-medium">{membership.planName || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      membership.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : membership.status === 'expired'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}
                  >
                    {membership.status?.charAt(0).toUpperCase() + (membership.status || '').slice(1) || '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Start</span>
                  <span className="text-white">{fmtDate(membership.startDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">End</span>
                  <span className="text-white">{fmtDate(membership.endDate)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
