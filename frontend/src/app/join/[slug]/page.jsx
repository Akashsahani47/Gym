'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import {
  Dumbbell,
  MapPin,
  Clock,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
  Loader2,
  IndianRupee,
  Star,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

export default function JoinGymPage() {
  const { slug } = useParams();
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    async function fetchGym() {
      try {
        const res = await fetch(`${API}/api/public/gym/${slug}`);
        const data = await res.json();
        if (data.success) {
          setGym(data.gym);
        }
      } catch {
        // gym stays null
      } finally {
        setLoading(false);
      }
    }
    fetchGym();
  }, [slug]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.phone) {
      toast.error('Please fill all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/public/join/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          phone: form.phone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch {
      toast.error('Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <Toaster position="top-right" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-gray-200 dark:border-white/10 border-t-accent rounded-full"
        />
      </div>
    );
  }

  // Gym not found
  if (!gym) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
        <Toaster position="top-right" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Dumbbell size={64} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Gym Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">This gym does not exist or is not accepting registrations.</p>
          <Link href="/loginpage" className="text-accent hover:underline text-sm font-medium">
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
        <Toaster position="top-right" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-xl"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Registration Submitted!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Your request to join <span className="text-gray-900 dark:text-white font-medium">{gym.name}</span> has been submitted.
            You will be able to log in once the gym owner approves your registration.
          </p>
          <Link
            href="/loginpage"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-black text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <ArrowLeft size={16} />
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  // Sort operating hours
  const sortedHours = [...(gym.operatingHours || [])].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  );

  // Main page
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <Dumbbell size={28} className="text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Join {gym.name}
          </h1>
          {gym.description && (
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg mx-auto">{gym.description}</p>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Gym Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Address */}
            {(gym.address?.city || gym.address?.state) && (
              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={16} className="text-accent" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Location</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {[gym.address.street, gym.address.city, gym.address.state, gym.address.zipCode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            )}

            {/* Contact */}
            {(gym.contact?.phone || gym.contact?.email || gym.contact?.website) && (
              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Phone size={16} className="text-accent" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Contact</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {gym.contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-gray-400" />
                      <span>{gym.contact.phone}</span>
                    </div>
                  )}
                  {gym.contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-gray-400" />
                      <span>{gym.contact.email}</span>
                    </div>
                  )}
                  {gym.contact.website && (
                    <div className="flex items-center gap-2">
                      <Globe size={13} className="text-gray-400" />
                      <span>{gym.contact.website}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Operating Hours */}
            {sortedHours.length > 0 && (
              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={16} className="text-accent" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Operating Hours</h3>
                </div>
                <div className="space-y-1.5">
                  {sortedHours.map((h) => (
                    <div
                      key={h.day}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        {DAY_LABELS[h.day] || h.day}
                      </span>
                      {h.isClosed ? (
                        <span className="text-red-400 text-xs">Closed</span>
                      ) : (
                        <span className="text-gray-900 dark:text-white text-xs">
                          {h.open} - {h.close}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Membership Plans & Pricing */}
            {gym.membershipPlans?.length > 0 && (
              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <IndianRupee size={16} className="text-accent" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Membership Plans</h3>
                </div>
                <div className="space-y-2.5">
                  {gym.membershipPlans.map((plan) => (
                    <div
                      key={plan._id}
                      className="bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{plan.name}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          Rs.{plan.price}
                        </span>
                      </div>
                      {plan.duration && (
                        <p className="text-xs text-gray-400">{plan.duration} days</p>
                      )}
                      {plan.features?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {plan.features.map((f, i) => (
                            <span key={i} className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities */}
            {gym.facilities?.length > 0 && (
              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Star size={16} className="text-accent" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Facilities</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {gym.facilities.map((f, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/10"
                    >
                      {f.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Register</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Fill in your details to request membership
              </p>

              <div className="space-y-4">
                {/* Name Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:border-accent transition-colors"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:border-accent transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:border-accent transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:border-accent transition-colors"
                    placeholder="9876543210"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 pr-10 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:border-accent transition-colors"
                      placeholder="Min 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:border-accent transition-colors"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 px-4 py-3 rounded-lg bg-accent text-black text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Registration'
                )}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Already have an account?{' '}
                <Link href="/loginpage" className="text-accent hover:underline font-medium">
                  Login here
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
