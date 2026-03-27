'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Save,
  ArrowLeft,
  Building,
  Target,
  X,
  Plus,
  Loader2,
  AlertCircle,
  Crown,
  Clock,
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function EditMemberPage() {
  const router = useRouter();
  const { memberId } = useParams();
  const { token } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gym, setGym] = useState(null);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [gymShifts, setGymShifts] = useState([]);
  const [newGoal, setNewGoal] = useState('');

  const [form, setForm] = useState({
    status: 'pending',
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      emergencyContact: '',
      address: { street: '', city: '', state: '', zipCode: '', country: '' },
    },
    membership: { planId: '', planName: '', startDate: '', endDate: '', status: 'pending' },
    shift: { shiftId: '', shiftName: '', startTime: '', endTime: '' },
    healthMetrics: { height: '', weight: '', fitnessGoals: [] },
  });

  // Fetch member data + gym plans
  useEffect(() => {
    if (!token || !memberId) return;

    const fetchData = async () => {
      try {
        // Fetch all members and find ours (reuse existing endpoint)
        const res = await fetch(`${API}/api/gym-owner/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success) throw new Error('Failed to load');

        const member = data.members.find((m) => m._id === memberId);
        if (!member) {
          toast.error('Member not found');
          router.back();
          return;
        }

        // Set form from member data
        setForm({
          status: member.status || 'pending',
          profile: {
            firstName: member.profile?.firstName || '',
            lastName: member.profile?.lastName || '',
            phone: member.profile?.phone || '',
            dateOfBirth: member.profile?.dateOfBirth
              ? new Date(member.profile.dateOfBirth).toISOString().split('T')[0]
              : '',
            emergencyContact: member.profile?.emergencyContact || '',
            address: {
              street: member.profile?.address?.street || '',
              city: member.profile?.address?.city || '',
              state: member.profile?.address?.state || '',
              zipCode: member.profile?.address?.zipCode || '',
              country: member.profile?.address?.country || '',
            },
          },
          membership: {
            planId: member.membership?.planId || '',
            planName: member.membership?.planName || '',
            startDate: member.membership?.startDate
              ? new Date(member.membership.startDate).toISOString().split('T')[0]
              : '',
            endDate: member.membership?.endDate
              ? new Date(member.membership.endDate).toISOString().split('T')[0]
              : '',
            status: member.membership?.status || 'pending',
          },
          shift: {
            shiftId: member.shift?.shiftId || '',
            shiftName: member.shift?.shiftName || '',
            startTime: member.shift?.startTime || '',
            endTime: member.shift?.endTime || '',
          },
          healthMetrics: {
            height: member.healthMetrics?.height || '',
            weight: member.healthMetrics?.weight || '',
            fitnessGoals: member.healthMetrics?.fitnessGoals || [],
          },
        });

        // Fetch gym details for plans + shifts
        if (member.gymId) {
          const gymData = typeof member.gymId === 'object' ? member.gymId : null;
          if (gymData) {
            setGym(gymData);
            setMembershipPlans(gymData.membershipPlans || []);
            setGymShifts((gymData.shifts || []).filter(s => s.isActive));
          } else {
            const gymRes = await fetch(`${API}/api/gym-owner/gyms/${member.gymId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const gymJson = await gymRes.json();
            if (gymJson.success) {
              setGym(gymJson.gym);
              setMembershipPlans(gymJson.gym.membershipPlans || []);
              setGymShifts((gymJson.gym.shifts || []).filter(s => s.isActive));
            }
          }
        }
      } catch {
        toast.error('Failed to load member');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, memberId, router]);

  const handleChange = (section, field, value) => {
    if (section === 'root') {
      setForm((prev) => ({ ...prev, [field]: value }));
    } else if (section === 'address') {
      setForm((prev) => ({
        ...prev,
        profile: { ...prev.profile, address: { ...prev.profile.address, [field]: value } },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
    }
  };

  const handlePlanChange = (planId) => {
    const plan = membershipPlans.find((p) => p._id === planId);
    if (!plan) {
      handleChange('membership', 'planId', '');
      handleChange('membership', 'planName', '');
      return;
    }

    const startDate = form.membership.startDate || new Date().toISOString().split('T')[0];
    const end = new Date(startDate);
    end.setDate(end.getDate() + (plan.duration || 30));

    setForm((prev) => ({
      ...prev,
      membership: {
        ...prev.membership,
        planId: plan._id,
        planName: plan.name,
        startDate,
        endDate: end.toISOString().split('T')[0],
      },
    }));
  };

  const handleShiftSelect = (shiftId) => {
    const s = gymShifts.find((x) => x._id === shiftId);
    if (s) {
      setForm((prev) => ({
        ...prev,
        shift: { shiftId: s._id, shiftName: s.name, startTime: s.startTime, endTime: s.endTime },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        shift: { shiftId: '', shiftName: '', startTime: '', endTime: '' },
      }));
    }
  };

  const handleAddGoal = () => {
    const goal = newGoal.trim();
    if (goal && !form.healthMetrics.fitnessGoals.includes(goal)) {
      handleChange('healthMetrics', 'fitnessGoals', [
        ...form.healthMetrics.fitnessGoals,
        goal,
      ]);
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (idx) => {
    handleChange(
      'healthMetrics',
      'fitnessGoals',
      form.healthMetrics.fitnessGoals.filter((_, i) => i !== idx)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.profile.firstName || !form.profile.lastName || !form.profile.phone) {
      toast.error('Name and phone are required');
      return;
    }

    setSaving(true);
    try {
      const body = {
        status: form.status,
        profile: {
          firstName: form.profile.firstName,
          lastName: form.profile.lastName,
          phone: form.profile.phone,
          dateOfBirth: form.profile.dateOfBirth || undefined,
          emergencyContact: form.profile.emergencyContact || undefined,
          address: form.profile.address,
        },
        membership: {
          planId: form.membership.planId || undefined,
          planName: form.membership.planName || undefined,
          startDate: form.membership.startDate || undefined,
          endDate: form.membership.endDate || undefined,
          status: form.membership.status,
        },
        shift: form.shift.shiftId ? form.shift : undefined,
        healthMetrics: {
          height: form.healthMetrics.height ? parseFloat(form.healthMetrics.height) : undefined,
          weight: form.healthMetrics.weight ? parseFloat(form.healthMetrics.weight) : undefined,
          fitnessGoals: form.healthMetrics.fitnessGoals,
        },
      };

      const res = await fetch(`${API}/api/gym-owner/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Member updated');
        router.push('/dashboard/gymOwner/all_members');
      } else {
        toast.error(data.error || 'Update failed');
      }
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const InputField = ({ label, value, onChange, type = 'text', placeholder, required, icon: Icon }) => (
    <div>
      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5">
        {Icon && <Icon className="w-4 h-4 mr-2 text-gray-400 shrink-0" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent focus:outline-none flex-1 min-w-0 text-sm text-gray-900 dark:text-white placeholder-gray-400"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0 px-4">
            <h1 className="text-lg font-bold truncate">
              Edit <span className="text-accent">Member</span>
            </h1>
            <p className="text-xs text-gray-500 truncate">
              {form.profile.firstName} {form.profile.lastName}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-accent text-black font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 max-w-4xl mx-auto">
        <div className="space-y-6">

          {/* Section 1: Personal Info + Status */}
          <div className="bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-4 md:p-5">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-accent" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="First Name"
                required
                value={form.profile.firstName}
                onChange={(v) => handleChange('profile', 'firstName', v)}
                icon={User}
                placeholder="John"
              />
              <InputField
                label="Last Name"
                required
                value={form.profile.lastName}
                onChange={(v) => handleChange('profile', 'lastName', v)}
                placeholder="Doe"
              />
              <InputField
                label="Phone"
                required
                value={form.profile.phone}
                onChange={(v) => handleChange('profile', 'phone', v)}
                icon={Phone}
                placeholder="9876543210"
              />
              <InputField
                label="Date of Birth"
                type="date"
                value={form.profile.dateOfBirth}
                onChange={(v) => handleChange('profile', 'dateOfBirth', v)}
                icon={Calendar}
              />
              <InputField
                label="Emergency Contact"
                value={form.profile.emergencyContact}
                onChange={(v) => handleChange('profile', 'emergencyContact', v)}
                icon={Phone}
                placeholder="Emergency number"
              />
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Account Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => handleChange('root', 'status', e.target.value)}
                  className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Address */}
          <div className="bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-4 md:p-5">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <InputField
                  label="Street"
                  value={form.profile.address.street}
                  onChange={(v) => handleChange('address', 'street', v)}
                  placeholder="Street address"
                />
              </div>
              <InputField
                label="City"
                value={form.profile.address.city}
                onChange={(v) => handleChange('address', 'city', v)}
                placeholder="City"
              />
              <InputField
                label="State"
                value={form.profile.address.state}
                onChange={(v) => handleChange('address', 'state', v)}
                placeholder="State"
              />
              <InputField
                label="Zip Code"
                value={form.profile.address.zipCode}
                onChange={(v) => handleChange('address', 'zipCode', v)}
                placeholder="123456"
              />
              <InputField
                label="Country"
                value={form.profile.address.country}
                onChange={(v) => handleChange('address', 'country', v)}
                placeholder="India"
              />
            </div>
          </div>

          {/* Section 3: Membership */}
          <div className="bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-4 md:p-5">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Crown className="w-4 h-4 text-accent" />
              Membership
              {gym?.name && <span className="text-xs text-gray-400 font-normal ml-1">({gym.name})</span>}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Plan</label>
                <select
                  value={form.membership.planId}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                >
                  <option value="">No Plan</option>
                  {membershipPlans.filter((p) => p.isActive).map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} — Rs.{p.price} ({p.duration} days)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Membership Status</label>
                <select
                  value={form.membership.status}
                  onChange={(e) => handleChange('membership', 'status', e.target.value)}
                  className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <InputField
                label="Start Date"
                type="date"
                value={form.membership.startDate}
                onChange={(v) => handleChange('membership', 'startDate', v)}
                icon={Calendar}
              />
              <InputField
                label="End Date"
                type="date"
                value={form.membership.endDate}
                onChange={(v) => handleChange('membership', 'endDate', v)}
                icon={Calendar}
              />
            </div>
          </div>

          {/* Section: Shift Selection */}
          {gymShifts.length > 0 && (
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-4 md:p-5">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                Shift / Batch
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div
                  onClick={() => handleShiftSelect(null)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all text-center text-sm ${
                    !form.shift.shiftId
                      ? 'bg-accent/10 border-accent text-accent font-medium'
                      : 'bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  No Shift
                </div>
                {gymShifts.map((s) => (
                  <div
                    key={s._id}
                    onClick={() => handleShiftSelect(s._id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      form.shift.shiftId === s._id
                        ? 'bg-accent/10 border-accent'
                        : 'bg-white dark:bg-black border-gray-200 dark:border-white/10 hover:border-gray-400'
                    }`}
                  >
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.startTime} — {s.endTime}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Health Metrics */}
          <div className="bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-4 md:p-5">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" />
              Health Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Height (cm)"
                type="number"
                value={form.healthMetrics.height}
                onChange={(v) => handleChange('healthMetrics', 'height', v)}
                placeholder="170"
              />
              <InputField
                label="Weight (kg)"
                type="number"
                value={form.healthMetrics.weight}
                onChange={(v) => handleChange('healthMetrics', 'weight', v)}
                placeholder="70"
              />
            </div>

            {/* Fitness Goals */}
            <div className="mt-4">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Fitness Goals</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGoal())}
                  placeholder="e.g. Weight Loss, Muscle Gain"
                  className="flex-1 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={handleAddGoal}
                  className="px-3 py-2 bg-accent/10 text-accent rounded-lg border border-accent/30 hover:bg-accent/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.healthMetrics.fitnessGoals.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.healthMetrics.fitnessGoals.map((goal, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 border border-accent/30 rounded-full text-xs text-accent"
                    >
                      {goal}
                      <button type="button" onClick={() => handleRemoveGoal(idx)} className="hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit button (bottom for mobile) */}
          <div className="flex justify-end gap-3 pt-2 pb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-accent text-black font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
