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
  Save,
  Loader2,
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const daysOfWeek = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const emptyFormData = () => ({
  name: '',
  description: '',
  contact: {
    email: '',
    phone: '',
    website: '',
    socialMedia: { facebook: '', instagram: '', twitter: '' },
  },
  address: {
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    coordinates: { lat: '', lng: '' },
  },
  logo: '',
  coverImage: '',
  images: [],
  facilities: [],
  operatingHours: daysOfWeek.map((d) => ({
    day: d.value,
    open: '06:00',
    close: '22:00',
    isClosed: false,
  })),
  membershipPlans: [],
  settings: {
    allowWalkIns: true,
    requireBooking: false,
    maxCapacity: 100,
    autoCheckout: true,
  },
  status: 'active',
});

function gymToFormData(gym) {
  if (!gym) return emptyFormData();
  const fd = emptyFormData();
  fd.name = gym.name ?? '';
  fd.description = gym.description ?? '';
  fd.contact = {
    email: gym.contact?.email ?? '',
    phone: gym.contact?.phone ?? '',
    website: gym.contact?.website ?? '',
    socialMedia: {
      facebook: gym.contact?.socialMedia?.facebook ?? '',
      instagram: gym.contact?.socialMedia?.instagram ?? '',
      twitter: gym.contact?.socialMedia?.twitter ?? '',
    },
  };
  fd.address = {
    street: gym.address?.street ?? '',
    city: gym.address?.city ?? '',
    state: gym.address?.state ?? '',
    country: gym.address?.country ?? '',
    zipCode: gym.address?.zipCode ?? '',
    coordinates: {
      lat: gym.address?.coordinates?.lat ?? '',
      lng: gym.address?.coordinates?.lng ?? '',
    },
  };
  fd.logo = gym.logo ?? '';
  fd.coverImage = gym.coverImage ?? '';
  fd.images = Array.isArray(gym.images) ? gym.images : [];
  fd.facilities = Array.isArray(gym.facilities) && gym.facilities.length
    ? gym.facilities.map((f) => ({
        name: f.name ?? '',
        description: f.description ?? '',
        available: f.available !== false,
      }))
    : [];
  fd.operatingHours =
    Array.isArray(gym.operatingHours) && gym.operatingHours.length
      ? gym.operatingHours.map((h) => ({
          day: h.day,
          open: h.open ?? '06:00',
          close: h.close ?? '22:00',
          isClosed: !!h.isClosed,
        }))
      : daysOfWeek.map((d) => ({
          day: d.value,
          open: '06:00',
          close: '22:00',
          isClosed: false,
        }));
  fd.membershipPlans =
    Array.isArray(gym.membershipPlans) && gym.membershipPlans.length
      ? gym.membershipPlans.map((p) => ({
          name: p.name ?? '',
          description: p.description ?? '',
          price: typeof p.price === 'number' ? p.price : 0,
          duration: p.duration ?? 30,
          features: Array.isArray(p.features) ? p.features : [],
          isActive: p.isActive !== false,
        }))
      : [];
  fd.settings = {
    allowWalkIns: gym.settings?.allowWalkIns !== false,
    requireBooking: !!gym.settings?.requireBooking,
    maxCapacity: gym.settings?.maxCapacity ?? 100,
    autoCheckout: gym.settings?.autoCheckout !== false,
  };
  fd.status = gym.status ?? 'active';
  return fd;
}

const EditGymPage = () => {
  const router = useRouter();
  const params = useParams();
  const gymId = params?.gymId;
  const { token } = useUserStore();
  const [formData, setFormData] = useState(emptyFormData());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (response.ok && data.gym) {
        setFormData(gymToFormData(data.gym));
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        contact: { ...prev.contact, [field]: value },
      }));
    } else if (name.startsWith('contact.socialMedia.')) {
      const platform = name.split('.')[2];
      setFormData((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          socialMedia: { ...prev.contact.socialMedia, [platform]: value },
        },
      }));
    } else if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else if (name.startsWith('address.coordinates.')) {
      const coord = name.split('.')[2];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          coordinates: {
            ...prev.address.coordinates,
            [coord]: parseFloat(value) || '',
          },
        },
      }));
    } else if (name.startsWith('settings.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          [field]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleOperatingHoursChange = (index, field, value) => {
    const updated = [...formData.operatingHours];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, operatingHours: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        contact: formData.contact,
        address: formData.address,
        logo: formData.logo,
        coverImage: formData.coverImage,
        images: formData.images,
        facilities: formData.facilities,
        operatingHours: formData.operatingHours,
        membershipPlans: formData.membershipPlans,
        settings: formData.settings,
        status: formData.status,
      };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/gyms/${gymId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success('Gym updated successfully');
        router.push(`/dashboard/gymOwner/gymInfo/${gymId}`);
      } else {
        toast.error(data.error || 'Failed to update gym');
      }
    } catch (error) {
      console.error('Error updating gym:', error);
      toast.error('Failed to update gym');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent text-gray-900 dark:text-white placeholder-gray-500';
  const labelClass = 'block text-sm text-gray-500 mb-2';

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 dark:border-white/10 border-t-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href={`/dashboard/gymOwner/gymInfo/${gymId}`}
            className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-accent/10 hover:border-accent/30 text-gray-600 dark:text-gray-400 hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Edit <span className="text-accent">{formData.name || 'Gym'}</span>
            </h1>
            <p className="text-sm text-gray-500">Update gym information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-6"
          >
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-accent" />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Gym Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Gym name"
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                  placeholder="Describe your gym"
                />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="under_maintenance">Under Maintenance</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-6"
          >
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-accent" />
              Contact
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  name="contact.email"
                  value={formData.contact.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="gym@example.com"
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="+1 555 123 4567"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Website</label>
                <input
                  type="url"
                  name="contact.website"
                  value={formData.contact.website}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="https://yourgym.com"
                />
              </div>
            </div>
          </motion.div>

          {/* Address */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-6"
          >
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              Address
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Street</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Country</label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>ZIP</label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Operating Hours */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-6"
          >
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              Operating Hours
            </h2>
            <div className="space-y-3">
              {formData.operatingHours.map((h, index) => (
                <div
                  key={h.day}
                  className="flex flex-wrap items-center gap-2 py-2 border-b border-gray-200/50 dark:border-white/5 last:border-0"
                >
                  <span className="w-24 text-sm text-gray-600 dark:text-gray-400 capitalize">{h.day}</span>
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={h.isClosed}
                      onChange={(e) =>
                        handleOperatingHoursChange(index, 'isClosed', e.target.checked)
                      }
                      className="rounded border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-black text-accent focus:ring-accent"
                    />
                    Closed
                  </label>
                  {!h.isClosed && (
                    <>
                      <input
                        type="time"
                        value={h.open}
                        onChange={(e) =>
                          handleOperatingHoursChange(index, 'open', e.target.value)
                        }
                        className={inputClass + ' w-28'}
                      />
                      <span className="text-gray-500">–</span>
                      <input
                        type="time"
                        value={h.close}
                        onChange={(e) =>
                          handleOperatingHoursChange(index, 'close', e.target.value)
                        }
                        className={inputClass + ' w-28'}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-6"
          >
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent" />
              Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-400">Allow walk-ins</label>
                <input
                  type="checkbox"
                  name="settings.allowWalkIns"
                  checked={formData.settings.allowWalkIns}
                  onChange={handleChange}
                  className="rounded border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-black text-accent focus:ring-accent"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-400">Require booking</label>
                <input
                  type="checkbox"
                  name="settings.requireBooking"
                  checked={formData.settings.requireBooking}
                  onChange={handleChange}
                  className="rounded border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-black text-accent focus:ring-accent"
                />
              </div>
              <div>
                <label className={labelClass}>Max capacity</label>
                <input
                  type="number"
                  name="settings.maxCapacity"
                  value={formData.settings.maxCapacity}
                  onChange={handleChange}
                  min={1}
                  className={inputClass}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-400">Auto checkout</label>
                <input
                  type="checkbox"
                  name="settings.autoCheckout"
                  checked={formData.settings.autoCheckout}
                  onChange={handleChange}
                  className="rounded border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-black text-accent focus:ring-accent"
                />
              </div>
            </div>
          </motion.div>

          <div className="flex gap-3">
            <Link
              href={`/dashboard/gymOwner/gymInfo/${gymId}`}
              className="flex-1 py-3 border border-gray-200 dark:border-white/10 rounded-xl text-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:border-accent/30 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-accent text-black rounded-xl font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGymPage;
