'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ArrowLeft,
  Edit2,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  Calendar,
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const ViewGymPage = () => {
  const router = useRouter();
  const params = useParams();
  const gymId = params?.gymId;
  const { token } = useUserStore();
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/loginPage');
      return;
    }
    if (!gymId) return;
    fetchGym();
  }, [token, gymId, router]);

  const fetchGym = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/gyms/${gymId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok && data.gym) {
        setGym(data.gym);
      } else {
        toast.error(data.error || 'Gym not found');
        router.push('/dashboard/gymOwner/gymInfo');
      }
    } catch (error) {
      console.error('Error fetching gym:', error);
      toast.error('Failed to load gym');
      router.push('/dashboard/gymOwner/gymInfo');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/10 border-t-[#DAFF00]" />
      </div>
    );
  }

  if (!gym) return null;

  const today = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
  const todayHours = gym.operatingHours?.find((h) => h.day === today);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/gymOwner/gymInfo"
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-[#DAFF00]/10 hover:border-[#DAFF00]/30 text-gray-400 hover:text-[#DAFF00] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              {gym.name}
            </h1>
            <p className="text-sm text-gray-500">Gym details</p>
          </div>
        </div>
        <Link href={`/dashboard/gymOwner/gymInfo/${gymId}/edit`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-[#DAFF00] text-black rounded-xl font-semibold hover:bg-[#c5e600] transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Gym
          </motion.button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main card - Basic & contact */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-start gap-4 mb-6">
              {gym.logo ? (
                <img
                  src={gym.logo}
                  alt={gym.name}
                  className="w-20 h-20 rounded-xl object-cover border border-white/10"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-[#DAFF00]/20 border border-[#DAFF00]/30 flex items-center justify-center">
                  <Building className="w-10 h-10 text-[#DAFF00]" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white mb-1">{gym.name}</h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    gym.status === 'active'
                      ? 'bg-[#DAFF00]/20 text-[#DAFF00] border-[#DAFF00]/30'
                      : gym.status === 'inactive'
                      ? 'bg-white/10 text-gray-400 border-white/10'
                      : gym.status === 'under_maintenance'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}
                >
                  {gym.status?.replace('_', ' ')}
                </span>
                {gym.approval?.isApproved ? (
                  <div className="flex items-center gap-1 mt-2 text-xs text-[#DAFF00]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approved
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-2 text-xs text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    Pending approval
                  </div>
                )}
              </div>
            </div>
            {gym.description && (
              <p className="text-gray-400 text-sm mb-4">{gym.description}</p>
            )}
            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              {gym.contact?.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-[#DAFF00]" />
                  <span>{gym.contact.email}</span>
                </div>
              )}
              {gym.contact?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-[#DAFF00]" />
                  <span>{gym.contact.phone}</span>
                </div>
              )}
              {gym.contact?.website && (
                <div className="flex items-center gap-2 text-sm sm:col-span-2">
                  <Globe className="w-4 h-4 text-[#DAFF00]" />
                  <a
                    href={gym.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#DAFF00] hover:underline"
                  >
                    {gym.contact.website}
                  </a>
                </div>
              )}
            </div>
          </motion.div>

          {/* Address */}
          {gym.address && (gym.address.city || gym.address.street) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white/5 rounded-xl border border-white/10 p-6"
            >
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#DAFF00]" />
                Location
              </h3>
              <div className="text-sm text-gray-400 space-y-1">
                {gym.address.street && <p>{gym.address.street}</p>}
                <p>
                  {[gym.address.city, gym.address.state, gym.address.zipCode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {gym.address.country && <p>{gym.address.country}</p>}
              </div>
            </motion.div>
          )}

          {/* Operating hours */}
          {gym.operatingHours && gym.operatingHours.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 rounded-xl border border-white/10 p-6"
            >
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#DAFF00]" />
                Operating Hours
              </h3>
              <p className="text-sm text-gray-500 mb-3">Today: {todayHours?.isClosed ? 'Closed' : todayHours ? `${todayHours.open} - ${todayHours.close}` : '—'}</p>
              <div className="space-y-2">
                {gym.operatingHours.map((h) => (
                  <div
                    key={h.day}
                    className="flex justify-between text-sm py-1 border-b border-white/5 last:border-0"
                  >
                    <span className="text-gray-400 capitalize">{h.day}</span>
                    <span className="text-white">
                      {h.isClosed ? 'Closed' : `${h.open || '—'} - ${h.close || '—'}`}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar - Stats & quick info */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-xl border border-white/10 p-6"
          >
            <h3 className="font-semibold text-white mb-4">Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#DAFF00]" />
                  Members
                </span>
                <span className="font-semibold text-white">{gym.stats?.totalMembers ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Trainers</span>
                <span className="font-semibold text-white">{gym.stats?.totalTrainers ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#DAFF00]" />
                  Monthly revenue
                </span>
                <span className="font-semibold text-white">${gym.stats?.monthlyRevenue ?? 0}</span>
              </div>
            </div>
          </motion.div>

          {/* Membership plans */}
          {gym.membershipPlans && gym.membershipPlans.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white/5 rounded-xl border border-white/10 p-6"
            >
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#DAFF00]" />
                Membership Plans
              </h3>
              <div className="space-y-2">
                {gym.membershipPlans.map((plan, i) => (
                  <div
                    key={plan._id || i}
                    className="p-3 rounded-lg bg-black/30 border border-white/5"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-white">{plan.name}</span>
                      <span className="text-[#DAFF00] font-semibold">${plan.price}</span>
                    </div>
                    {plan.duration && (
                      <p className="text-xs text-gray-500 mt-1">{plan.duration} days</p>
                    )}
                    {!plan.isActive && (
                      <span className="text-xs text-gray-500">Inactive</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Facilities */}
          {gym.facilities && gym.facilities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 rounded-xl border border-white/10 p-6"
            >
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#DAFF00]" />
                Facilities
              </h3>
              <ul className="space-y-2">
                {gym.facilities.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    {f.available ? (
                      <CheckCircle className="w-4 h-4 text-[#DAFF00] shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-500 shrink-0" />
                    )}
                    <span className={f.available ? 'text-gray-300' : 'text-gray-500'}>
                      {f.name}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewGymPage;
