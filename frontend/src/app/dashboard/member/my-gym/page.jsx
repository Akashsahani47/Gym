'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, MapPin, Dumbbell } from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';

const formatAddress = (addr) => {
  if (!addr) return '—';
  if (typeof addr === 'string') return addr;
  const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
};

export default function MyGymPage() {
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
        toast.error('Could not load gym info');
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

  const gym = user?.gymId || {};

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          <span className="text-white">My </span>
          <span className="text-accent">Gym</span>
        </h1>
        <p className="text-gray-400 mb-8">Your registered gym details</p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6 lg:p-8"
        >
          {gym.name ? (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <Dumbbell className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{gym.name}</h2>
                  <p className="text-gray-400 text-sm">Your home gym</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-400 text-sm mb-1">Address</p>
                  <p className="text-white">{formatAddress(gym.address)}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Building className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No gym assigned yet.</p>
              <p className="text-gray-500 text-sm mt-1">Contact your gym to get linked to your account.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
