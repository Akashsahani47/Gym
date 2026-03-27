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
  Upload,
  Check,
  X,
  Plus,
  Trash2,
  IndianRupee,
  Facebook,
  Instagram,
  Twitter,
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

const defaultFacilities = [
  { name: 'Cardio Equipment', description: 'Treadmills, ellipticals, stationary bikes', available: true },
  { name: 'Weight Training', description: 'Free weights, weight machines', available: true },
  { name: 'Group Classes', description: 'Yoga, Zumba, Spin classes', available: true },
  { name: 'Swimming Pool', description: 'Indoor/outdoor swimming pool', available: false },
  { name: 'Locker Rooms', description: 'Secure lockers and showers', available: true },
  { name: 'Personal Training', description: 'Certified personal trainers', available: true },
  { name: 'Sauna/Steam Room', description: 'Relaxation facilities', available: false },
  { name: 'Parking', description: 'Free parking available', available: true },
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
  shifts: [],
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
    : defaultFacilities.map((f) => ({ ...f }));
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
  fd.shifts =
    Array.isArray(gym.shifts) && gym.shifts.length
      ? gym.shifts.map((s) => ({
          name: s.name ?? '',
          startTime: s.startTime ?? '08:00',
          endTime: s.endTime ?? '12:00',
          isActive: s.isActive !== false,
        }))
      : [];
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
  const [uploadingLogo, setUploadingLogo] = useState(false);

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

  const handleFacilityToggle = (index) => {
    const updated = [...formData.facilities];
    updated[index] = { ...updated[index], available: !updated[index].available };
    setFormData((prev) => ({ ...prev, facilities: updated }));
  };

  // ─── Shift Handlers ───
  const handleShiftChange = (index, field, value) => {
    const updated = [...formData.shifts];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, shifts: updated }));
  };
  const handleShiftToggle = (index) => {
    const updated = [...formData.shifts];
    updated[index] = { ...updated[index], isActive: !updated[index].isActive };
    setFormData((prev) => ({ ...prev, shifts: updated }));
  };
  const handleAddShift = () => {
    setFormData((prev) => ({
      ...prev,
      shifts: [...prev.shifts, { name: '', startTime: '08:00', endTime: '12:00', isActive: true }],
    }));
  };
  const handleRemoveShift = (index) => {
    setFormData((prev) => ({ ...prev, shifts: prev.shifts.filter((_, i) => i !== index) }));
  };

  const handleMembershipPlanChange = (index, field, value) => {
    const updated = [...formData.membershipPlans];
    updated[index] = { ...updated[index], [field]: field === 'price' ? parseFloat(value) || 0 : value };
    setFormData((prev) => ({ ...prev, membershipPlans: updated }));
  };

  const handleMembershipPlanToggle = (index) => {
    const updated = [...formData.membershipPlans];
    updated[index] = { ...updated[index], isActive: !updated[index].isActive };
    setFormData((prev) => ({ ...prev, membershipPlans: updated }));
  };

  const handleAddMembershipPlan = () => {
    setFormData((prev) => ({
      ...prev,
      membershipPlans: [
        ...prev.membershipPlans,
        { name: '', description: '', price: 0, duration: 30, features: [], isActive: true },
      ],
    }));
  };

  const handleRemoveMembershipPlan = (index) => {
    setFormData((prev) => ({
      ...prev,
      membershipPlans: prev.membershipPlans.filter((_, i) => i !== index),
    }));
  };

  const handleAddFeature = (planIndex, feature) => {
    const trimmed = feature.trim();
    if (!trimmed) return;
    const updated = [...formData.membershipPlans];
    if (updated[planIndex].features.includes(trimmed)) return;
    updated[planIndex] = { ...updated[planIndex], features: [...updated[planIndex].features, trimmed] };
    setFormData((prev) => ({ ...prev, membershipPlans: updated }));
  };

  const handleRemoveFeature = (planIndex, featureIndex) => {
    const updated = [...formData.membershipPlans];
    updated[planIndex] = {
      ...updated[planIndex],
      features: updated[planIndex].features.filter((_, i) => i !== featureIndex),
    };
    setFormData((prev) => ({ ...prev, membershipPlans: updated }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    const fd = new FormData();
    fd.append('logo', file);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/upload/logo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, logo: data.url }));
        toast.success('Logo uploaded');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingLogo(false);
    }
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
        shifts: formData.shifts,
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
                <label className={labelClass}>Gym Logo</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-lg bg-white/10 dark:bg-black border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building className="w-10 h-10 text-gray-400" />
                    )}
                    <label className="absolute bottom-0 right-0 p-1.5 bg-accent/20 rounded-full cursor-pointer border border-accent/30 hover:bg-accent/30">
                      <Upload className="w-3 h-3 text-accent" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Upload gym logo. Recommended: 500x500px</p>
                    {uploadingLogo && <p className="text-xs text-accent mt-1">Uploading...</p>}
                  </div>
                </div>
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
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Social Media</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={`${labelClass} flex items-center gap-2`}>
                    <Facebook className="w-3 h-3" /> Facebook
                  </label>
                  <input
                    type="url"
                    name="contact.socialMedia.facebook"
                    value={formData.contact.socialMedia.facebook}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://facebook.com/yourgym"
                  />
                </div>
                <div>
                  <label className={`${labelClass} flex items-center gap-2`}>
                    <Instagram className="w-3 h-3" /> Instagram
                  </label>
                  <input
                    type="url"
                    name="contact.socialMedia.instagram"
                    value={formData.contact.socialMedia.instagram}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://instagram.com/yourgym"
                  />
                </div>
                <div>
                  <label className={`${labelClass} flex items-center gap-2`}>
                    <Twitter className="w-3 h-3" /> Twitter
                  </label>
                  <input
                    type="url"
                    name="contact.socialMedia.twitter"
                    value={formData.contact.socialMedia.twitter}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://twitter.com/yourgym"
                  />
                </div>
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
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Coordinates (optional)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      name="address.coordinates.lat"
                      value={formData.address.coordinates.lat}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. 40.7128"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      name="address.coordinates.lng"
                      value={formData.address.coordinates.lng}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. -74.0060"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Facilities */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-6"
          >
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Check className="w-4 h-4 text-accent" />
              Facilities
            </h2>
            <p className="text-sm text-gray-500 mb-4">Toggle the facilities available at your gym.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.facilities.map((facility, index) => (
                <div
                  key={index}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleFacilityToggle(index)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFacilityToggle(index)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    facility.available
                      ? 'bg-green-500/10 border-green-500/30 dark:bg-green-500/10 dark:border-green-500/30'
                      : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{facility.name}</h4>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        facility.available ? 'bg-green-500 text-white' : 'bg-gray-400 dark:bg-gray-600'
                      }`}
                    >
                      {facility.available ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{facility.description}</p>
                </div>
              ))}
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

          {/* Shifts */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.17 }}
            className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Shifts / Batches
                </h2>
                <p className="text-sm text-gray-500 mt-1">Define time slots members can choose from</p>
              </div>
              <button
                type="button"
                onClick={handleAddShift}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-black font-semibold rounded-lg hover:opacity-90 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Shift
              </button>
            </div>

            {formData.shifts.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No shifts added. Click &quot;Add Shift&quot; to create one.
              </div>
            )}

            <div className="space-y-3">
              {formData.shifts.map((shift, index) => (
                <div key={index} className="bg-white dark:bg-black rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-accent" />
                      </div>
                      <input
                        type="text"
                        value={shift.name}
                        onChange={(e) => handleShiftChange(index, 'name', e.target.value)}
                        className="bg-transparent font-semibold focus:outline-none focus:text-accent flex-1 min-w-0"
                        placeholder="e.g. Morning, Afternoon, Night"
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <span className="text-xs text-gray-500">Active</span>
                        <div className="relative">
                          <input type="checkbox" checked={shift.isActive} onChange={() => handleShiftToggle(index)} className="sr-only" />
                          <div className={`w-9 h-5 rounded-full transition-colors ${shift.isActive ? 'bg-green-500' : 'bg-gray-700'}`}>
                            <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform transform ${shift.isActive ? 'translate-x-[18px]' : 'translate-x-1'} mt-[3px]`} />
                          </div>
                        </div>
                      </label>
                      <button type="button" onClick={() => handleRemoveShift(index)} className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={shift.startTime}
                        onChange={(e) => handleShiftChange(index, 'startTime', e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Time</label>
                      <input
                        type="time"
                        value={shift.endTime}
                        onChange={(e) => handleShiftChange(index, 'endTime', e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Membership Plans */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-accent" />
                Membership Plans
              </h2>
              <button
                type="button"
                onClick={handleAddMembershipPlan}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-black font-semibold rounded-xl hover:bg-accent-hover transition-colors w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                Add Plan
              </button>
            </div>
            <div className="space-y-4">
              {formData.membershipPlans.map((plan, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-black rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-white/10"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center shrink-0">
                        <IndianRupee className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => handleMembershipPlanChange(index, 'name', e.target.value)}
                          className="bg-transparent text-lg font-semibold focus:outline-none focus:text-accent w-full mb-1 placeholder-gray-500"
                          placeholder="Plan name"
                        />
                        <input
                          type="text"
                          value={plan.description}
                          onChange={(e) => handleMembershipPlanChange(index, 'description', e.target.value)}
                          className="bg-transparent text-sm text-gray-500 focus:outline-none w-full placeholder-gray-500"
                          placeholder="Plan description"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-sm text-gray-500">Active</span>
                        <input
                          type="checkbox"
                          checked={plan.isActive}
                          onChange={() => handleMembershipPlanToggle(index)}
                          className="rounded border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-black text-accent focus:ring-accent"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveMembershipPlan(index)}
                        className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                        aria-label="Remove plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className={labelClass}>Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={plan.price}
                        onChange={(e) => handleMembershipPlanChange(index, 'price', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Duration (days)</label>
                      <input
                        type="number"
                        min={1}
                        value={plan.duration}
                        onChange={(e) => handleMembershipPlanChange(index, 'duration', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Monthly rate</label>
                      <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ₹{plan.duration ? ((plan.price / plan.duration) * 30).toFixed(2) : '0.00'}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">/month</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Features</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {plan.features.map((feat, fi) => (
                        <span
                          key={fi}
                          className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-sm flex items-center gap-2"
                        >
                          {feat}
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(index, fi)}
                            className="text-red-400 hover:text-red-300"
                            aria-label="Remove feature"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a feature..."
                        className={`flex-1 ${inputClass}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.target.value;
                            handleAddFeature(index, val);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling;
                          if (input && input.value !== undefined) {
                            handleAddFeature(index, input.value);
                            input.value = '';
                          }
                        }}
                        className="px-4 py-3 bg-accent text-black font-semibold rounded-xl hover:bg-accent-hover transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {formData.membershipPlans.length === 0 && (
                <p className="text-gray-500 text-sm py-4">No plans yet. Click &quot;Add Plan&quot; to add one.</p>
              )}
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
