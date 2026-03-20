'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Pencil,
  X,
  Save,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtDateInput = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return date.toISOString().split('T')[0];
};

const formatAddress = (addr) => {
  if (!addr) return '—';
  const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
};

// ─── Reusable input ──────────────────────────────────────────────────────────
function Field({ label, icon: Icon, value, name, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-accent" />}
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder || label}
        className="w-full bg-black border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  );
}

// ─── Edit Profile Modal ──────────────────────────────────────────────────────
function EditProfileModal({ user, onClose, onSave }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    phone: user?.profile?.phone || '',
    dateOfBirth: fmtDateInput(user?.profile?.dateOfBirth) || '',
    emergencyContact: user?.profile?.emergencyContact || '',
    street: user?.profile?.address?.street || '',
    city: user?.profile?.address?.city || '',
    state: user?.profile?.address?.state || '',
    zipCode: user?.profile?.address?.zipCode || '',
    country: user?.profile?.address?.country || '',
    height: user?.healthMetrics?.height || '',
    weight: user?.healthMetrics?.weight || '',
    fitnessGoals: user?.healthMetrics?.fitnessGoals?.join(', ') || '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()) {
      return toast.error('Name and phone are required');
    }
    setSaving(true);
    try {
      await onSave({
        profile: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
          dateOfBirth: form.dateOfBirth || undefined,
          emergencyContact: form.emergencyContact.trim() || undefined,
          address: {
            street: form.street.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            zipCode: form.zipCode.trim(),
            country: form.country.trim(),
          },
        },
        healthMetrics: {
          height: form.height ? Number(form.height) : undefined,
          weight: form.weight ? Number(form.weight) : undefined,
          fitnessGoals: form.fitnessGoals
            ? form.fitnessGoals.split(',').map((g) => g.trim()).filter(Boolean)
            : [],
        },
      });
    } finally {
      setSaving(false);
    }
  };

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
        className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Pencil className="w-5 h-5 text-accent" />
            Edit Profile
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Personal Info */}
          <div>
            <p className="text-xs text-accent font-semibold uppercase tracking-wide mb-3">Personal Information</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name" icon={User} name="firstName" value={form.firstName} onChange={handleChange} />
              <Field label="Last Name" icon={User} name="lastName" value={form.lastName} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Field label="Phone" icon={Phone} name="phone" value={form.phone} onChange={handleChange} />
              <Field label="Date of Birth" icon={Calendar} name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} type="date" />
            </div>
            <div className="mt-3">
              <Field label="Emergency Contact" icon={AlertCircle} name="emergencyContact" value={form.emergencyContact} onChange={handleChange} placeholder="Name - Phone" />
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-xs text-accent font-semibold uppercase tracking-wide mb-3">Address</p>
            <div className="space-y-3">
              <Field label="Street" icon={MapPin} name="street" value={form.street} onChange={handleChange} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="City" name="city" value={form.city} onChange={handleChange} />
                <Field label="State" name="state" value={form.state} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="ZIP Code" name="zipCode" value={form.zipCode} onChange={handleChange} />
                <Field label="Country" name="country" value={form.country} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Health */}
          <div>
            <p className="text-xs text-accent font-semibold uppercase tracking-wide mb-3">Health & Fitness</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Height (cm)" icon={Target} name="height" value={form.height} onChange={handleChange} type="number" />
              <Field label="Weight (kg)" icon={Target} name="weight" value={form.weight} onChange={handleChange} type="number" />
            </div>
            <div className="mt-3">
              <Field label="Fitness Goals (comma separated)" icon={Target} name="fitnessGoals" value={form.fitnessGoals} onChange={handleChange} placeholder="Weight loss, Muscle gain, Cardio" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-white/10 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-white/20 rounded-xl text-gray-300 hover:bg-white/5 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 bg-accent text-black rounded-xl font-semibold hover:bg-accent-hover transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Change Password Modal ───────────────────────────────────────────────────
function ChangePasswordModal({ onClose, onSave }) {
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [form, setForm] = useState({ current: '', newPassword: '', confirm: '' });

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.current || !form.newPassword) return toast.error('Fill all fields');
    if (form.newPassword.length < 6) return toast.error('Minimum 6 characters');
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await onSave({ password: { current: form.current, newPassword: form.newPassword } });
    } finally {
      setSaving(false);
    }
  };

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
        className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent" />
            Change Password
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Current Password', name: 'current', key: 'current' },
            { label: 'New Password', name: 'newPassword', key: 'new' },
            { label: 'Confirm Password', name: 'confirm', key: 'confirm' },
          ].map((field) => (
            <div key={field.name}>
              <label className="text-xs text-gray-400 mb-1 block">{field.label}</label>
              <div className="relative">
                <input
                  type={show[field.key] ? 'text' : 'password'}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/20 rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent"
                  placeholder={field.label}
                />
                <button
                  type="button"
                  onClick={() => setShow((p) => ({ ...p, [field.key]: !p[field.key] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {show[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-3 border border-white/20 rounded-xl text-gray-300 hover:bg-white/5 text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 bg-accent text-black rounded-xl font-semibold hover:bg-accent-hover text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            Update
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function MemberProfilePage() {
  const { user, token, updateUser } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API}/api/auth/me`, {
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

  const handleSaveProfile = async (body) => {
    const res = await fetch(`${API}/api/member/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      updateUser(data.member);
      toast.success('Profile updated!');
      setShowEditProfile(false);
    } else {
      toast.error(data.error || 'Update failed');
    }
  };

  const handleChangePassword = async (body) => {
    const res = await fetch(`${API}/api/member/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success('Password updated!');
      setShowChangePassword(false);
    } else {
      toast.error(data.error || 'Update failed');
    }
  };

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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center">
                  <User className="w-5 h-5 mr-2 text-accent" />
                  Profile
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:border-accent/30 hover:text-accent transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Password
                  </button>
                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-lg text-xs text-accent hover:bg-accent/20 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              </div>

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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center">
                  <Target className="w-5 h-5 mr-2 text-accent" />
                  Health & Goals
                </h2>
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-lg text-xs text-accent hover:bg-accent/20 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
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

      {/* Modals */}
      <AnimatePresence>
        {showEditProfile && (
          <EditProfileModal
            user={user}
            onClose={() => setShowEditProfile(false)}
            onSave={handleSaveProfile}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChangePassword && (
          <ChangePasswordModal
            onClose={() => setShowChangePassword(false)}
            onSave={handleChangePassword}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
