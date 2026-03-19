// /app/dashboard/gymOwner/profile/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  CreditCard,
  Shield,
  Bell,
  Save,
  Edit2,
  Upload,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Key,
  Globe,
  Star,
  TrendingUp,
  Users,
  IndianRupee,
  Activity,
  Menu,
  ChevronLeft,
  Zap,
  Clock,
  History,
  RefreshCw,
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// ── Razorpay loader ──────────────────────────────────────────────────────────
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ── helpers ──────────────────────────────────────────────────────────────────
const toMonthKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const monthLabel = (ym) => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  return new Date(+y, +m - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const ProfilePage = () => {
  const { user, updateUser } = useUserStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [gyms, setGyms] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    monthlyRevenue: 0,
    occupancyRate: 0
  });
  const [subPaying, setSubPaying] = useState(false);
  const [showPayHistory, setShowPayHistory] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      bio: ''
    },
    gymOwnerData: {
      companyName: '',
      taxId: '',
      businessRegistration: ''
    },
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Initialize form data
 const hydrated = useUserStore((state) => state.hydrated);
const token = useUserStore((s) => s.token);


  useEffect(() => {
    // Wait for Zustand to hydrate
    if (!token) return;

    const loadDashboard = async () => {
      try {
        console.log('Fetching dashboard data...');
        console.log('Token:', token ? 'Present' : 'Missing');
        console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/info`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Response status:', res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error('API Error:', errorText);
          throw new Error(`Failed to fetch: ${res.status} ${errorText}`);
        }

        const data = await res.json();
        console.log('API Response data:', data);

        // Update form data from API response
        setFormData(prev => ({
          ...prev,
          profile: {
            firstName: data.user?.profile?.firstName || '',
            lastName: data.user?.profile?.lastName || '',
            phone: data.user?.profile?.phone || '',
            dateOfBirth: data.user?.profile?.dateOfBirth
              ? new Date(data.user.profile.dateOfBirth).toISOString().split('T')[0]
              : '',
            bio: data.user?.profile?.bio || ''
          },
          gymOwnerData: {
            companyName: data.user?.gymOwnerData?.companyName || '',
            taxId: data.user?.gymOwnerData?.taxId || '',
            businessRegistration: data.user?.gymOwnerData?.businessRegistration || ''
          },
          email: data.user?.email || ''
        }));

        // Set gyms and stats from API response
        setGyms(data.gyms || []);
        setStats(data.stats || {
          totalMembers: 0,
          activeMembers: 0,
          monthlyRevenue: 0,
          occupancyRate: 0
        });

      } catch (err) {
        console.error('Error loading dashboard:', err);
        toast.error('Failed to load profile data');
      }
    };

    loadDashboard();
  }, [hydrated, token]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate password change
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        profile: formData.profile,
        gymOwnerData: formData.gymOwnerData
      };

      // Add password update if provided
      if (formData.currentPassword && formData.newPassword) {
        updateData.password = {
          current: formData.currentPassword,
          new: formData.newPassword
        };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/updateinfo`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',

        },
        body: JSON.stringify(updateData)
      });
      console.log(token)
      const data = await response.json();

      if (response.ok) {
        // Update local store
        updateUser(data);

        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);

        // Reset password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));

        toast.success('Profile updated successfully!');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('profile.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [field]: value
        }
      }));
    } else if (name.startsWith('gymOwnerData.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        gymOwnerData: {
          ...prev.gymOwnerData,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/gym-owners/avatar', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        updateUser({ profile: { avatar: data.avatarUrl } });
        toast.success('Avatar updated successfully!');
      } else {
        toast.error(data.error || 'Failed to upload avatar');
      }
    } catch (error) {
      toast.error('Failed to upload avatar');
    }
  };

  // ── Email verification ────────────────────────────────────────────────────
  const handleSendVerification = async () => {
    setVerifyingEmail(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/send-verification`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) {
        setEmailSent(true);
        toast.success('Verification email sent! Check your inbox.');
      } else {
        toast.error(data.error || 'Failed to send verification email');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setVerifyingEmail(false);
    }
  };

  // ── Razorpay subscription payment ────────────────────────────────────────
  const handleSubscriptionPay = async () => {
    setSubPaying(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Check your connection.');
        setSubPaying(false);
        return;
      }

      // 1. Create order on server
      const orderRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/subscription/create-order`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        toast.error(orderData.error || 'Could not create order');
        setSubPaying(false);
        return;
      }

      // 2. Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'Zelvoo Platform',
        description: `Dashboard subscription — ${monthLabel(orderData.month)}`,
        order_id: orderData.order.id,
        prefill: {
          name:  orderData.ownerName,
          email: orderData.ownerEmail,
          contact: orderData.ownerPhone,
        },
        theme: { color: '#DAFF00' },
        handler: async (response) => {
          // 3. Verify on server
          const verifyRes = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/subscription/verify-payment`,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            }
          );
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            toast.success('Subscription activated!');
            // Patch user in store with fresh subscription
            updateUser({ gymOwnerData: { ...user.gymOwnerData, subscription: verifyData.subscription } });
          } else {
            toast.error(verifyData.error || 'Payment verification failed');
          }
          setSubPaying(false);
        },
        modal: { ondismiss: () => setSubPaying(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error('Something went wrong');
      setSubPaying(false);
    }
  };

  const statCards = [
    {
      label: 'Total Members',
      value: stats.totalMembers.toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      change: '+12%',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400'
    },
    {
      label: 'Active Members',
      value: stats.activeMembers.toLocaleString(),
      icon: <Activity className="w-5 h-5" />,
      change: '+8%',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400'
    },
    {
      label: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: <IndianRupee className="w-5 h-5" />,
      change: '+15%',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400'
    },
    {
      label: 'Occupancy Rate',
      value: `${stats.occupancyRate}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      change: '+3%',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/30',
      iconColor: 'text-accent'
    }
  ];

  const recentActivities = [
    { type: 'gym', action: 'New gym added', time: '2 hours ago', icon: <Building className="w-4 h-4" /> },
    { type: 'member', action: '5 new members joined', time: '1 day ago', icon: <Users className="w-4 h-4" /> },
    { type: 'payment', action: 'Subscription renewed', time: '2 days ago', icon: <CreditCard className="w-4 h-4" /> },
    { type: 'update', action: 'Gym schedule updated', time: '3 days ago', icon: <Calendar className="w-4 h-4" /> }
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white p-4 lg:p-6">
      {/* Mobile Header */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl ml-40 font-bold">Profile</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Header */}
      <div className="hidden lg:flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="text-gray-900 dark:text-white">Gym Owner </span>
            <span className="text-accent">Profile</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account and business information</p>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 px-4 py-2 bg-accent text-black font-semibold rounded-lg hover:bg-accent-hover transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
          </motion.button>
        </div>
      </div>

      {/* Mobile Edit Button */}
      <div className="lg:hidden mb-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(!isEditing)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-accent text-black font-semibold rounded-lg hover:bg-accent-hover transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white dark:bg-gray-900 shadow-sm dark:shadow-none rounded-xl p-4 lg:p-6 border ${stat.borderColor}`}
          >
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <div className={`p-2 lg:p-3 rounded-lg ${stat.bgColor} border ${stat.borderColor}`}>
                <span className={stat.iconColor}>{stat.icon}</span>
              </div>
              <span className="text-accent text-sm font-medium">{stat.change}</span>
            </div>
            <h3 className="text-lg lg:text-2xl font-bold mb-1">{stat.value}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Profile Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6 lg:space-y-8"
        >
          {/* Personal Information Card */}
          <div className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-none rounded-xl p-4 lg:p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg lg:text-xl font-bold flex items-center">
                <User className="w-5 h-5 mr-2 text-accent" />
                Personal Information
              </h2>
              <div className="hidden lg:flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  user.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  user.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                </span>
              </div>
            </div>

            {/* Mobile Status */}
            <div className="lg:hidden mb-4">
              <span className={`px-3 py-1 rounded-full text-xs ${
                user.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                user.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
              </span>
            </div>

            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success' ?
                  'bg-emerald-500/10 border border-emerald-500/30' :
                  'bg-red-500/10 border border-red-500/30'
                }`}
              >
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 mr-2 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                  )}
                  <span className="text-sm lg:text-base">{message.text}</span>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Avatar Upload */}
              <div className="flex items-center mb-6 lg:mb-8">
                <div className="relative group">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center">
                    {user.profile?.avatar ? (
                      <img
                        src={user.profile.avatar}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 lg:w-12 lg:h-12 text-purple-400" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 p-2 bg-white dark:bg-black rounded-full cursor-pointer border border-gray-300 dark:border-gray-700 group-hover:border-accent transition-colors">
                      <Upload className="w-3 h-3 lg:w-4 lg:h-4 text-accent" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  )}
                </div>
                <div className="ml-4 lg:ml-6">
                  <h3 className="text-base lg:text-lg font-semibold">
                    {user.profile?.firstName} {user.profile?.lastName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">Gym Owner</p>
                  <p className="text-xs lg:text-sm text-gray-500 mt-1">Click edit to update profile photo</p>
                </div>
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="profile.firstName"
                    value={formData.profile.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-sm lg:text-base focus:outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="profile.lastName"
                    value={formData.profile.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-sm lg:text-base focus:outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Email</label>
                  <div className="flex items-center bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3">
                    <Mail className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm lg:text-base">{user.email}</span>
                    {user.emailVerified ? (
                      <span className="ml-auto text-emerald-400 text-xs lg:text-sm flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendVerification}
                        disabled={verifyingEmail || emailSent}
                        className="ml-auto text-accent text-xs lg:text-sm hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {verifyingEmail ? 'Sending…' : emailSent ? 'Email Sent ✓' : 'Verify'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Phone</label>
                  <div className="flex items-center">
                    <div className="flex items-center bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 flex-1">
                      <Phone className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                      <input
                        type="tel"
                        name="profile.phone"
                        value={formData.profile.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="bg-transparent focus:outline-none flex-1 text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Date of Birth</label>
                  <div className="flex items-center bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3">
                    <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                    <input
                      type="date"
                      name="profile.dateOfBirth"
                      value={formData.profile.dateOfBirth}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="bg-transparent focus:outline-none flex-1 text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Bio</label>
                  <textarea
                    name="profile.bio"
                    value={formData.profile.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows="3"
                    className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-sm lg:text-base focus:outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              {/* Business Information */}
              <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-accent" />
                  Business Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Company Name</label>
                    <div className="flex items-center bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3">
                      <Building className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                      <input
                        type="text"
                        name="gymOwnerData.companyName"
                        value={formData.gymOwnerData.companyName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="bg-transparent focus:outline-none flex-1 text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Tax ID</label>
                    <div className="flex items-center bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3">
                      <FileText className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                      <input
                        type="text"
                        name="gymOwnerData.taxId"
                        value={formData.gymOwnerData.taxId}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="bg-transparent focus:outline-none flex-1 text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Business Registration Number</label>
                    <div className="flex items-center bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3">
                      <FileText className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                      <input
                        type="text"
                        name="gymOwnerData.businessRegistration"
                        value={formData.gymOwnerData.businessRegistration}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="bg-transparent focus:outline-none flex-1 text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Change Section */}
              {isEditing && (
                <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                    <Key className="w-5 h-5 mr-2 text-accent" />
                    Change Password
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-sm lg:text-base focus:outline-none focus:border-accent"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-600 dark:text-gray-400 hover:text-accent transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-sm lg:text-base focus:outline-none focus:border-accent"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Confirm Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-sm lg:text-base focus:outline-none focus:border-accent"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col-reverse lg:flex-row justify-end space-y-4 lg:space-y-0 space-y-reverse lg:space-x-4 mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-gray-200 dark:border-gray-800"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setMessage({ type: '', text: '' });
                    }}
                    className="w-full lg:w-auto px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-sm lg:text-base"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full lg:w-auto px-6 py-3 bg-accent text-black font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm lg:text-base"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </form>
          </div>

          {/* My Gyms Section */}
          {gyms.length > 0 && (
            <div className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-none rounded-xl p-4 lg:p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
                <h2 className="text-lg lg:text-xl font-bold flex items-center">
                  <Building className="w-5 h-5 mr-2 text-accent" />
                  My Gyms
                </h2>
                <button className="w-full lg:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-accent text-black font-semibold rounded-lg hover:bg-accent-hover transition-colors text-sm lg:text-base">
                  <Building className="w-4 h-4" />
                  <span>Add New Gym</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {gyms.map((gym) => (
                  <div key={gym._id} className="bg-white dark:bg-black rounded-lg p-4 border border-gray-200 dark:border-gray-800 hover:border-accent/30 transition-colors group">
                    <div className="flex items-center space-x-3 mb-4">
                      {gym.logo ? (
                        <img src={gym.logo} alt={gym.name} className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                          <Building className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm lg:text-base group-hover:text-accent transition-colors truncate">{gym.name}</h3>
                        <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 truncate">{gym.address?.city || 'No location'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs lg:text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        gym.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        gym.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                        'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {gym.status?.replace('_', ' ')}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">{gym.stats?.totalMembers || 0} members</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Subscription Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-none rounded-xl p-4 lg:p-6 border border-gray-200 dark:border-gray-800"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-accent" />
              Subscription Status
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">Current Plan</span>
                <span className="px-3 py-1 bg-accent/10 border border-accent/30 text-accent rounded-full text-xs lg:text-sm font-medium">
                  {user.gymOwnerData?.subscription?.plan || 'Basic'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs lg:text-sm ${
                  user.gymOwnerData?.subscription?.status === 'active' ?
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                  'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}>
                  {user.gymOwnerData?.subscription?.status || 'Active'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">Billing Cycle</span>
                <span className="font-medium text-sm lg:text-base">{user.gymOwnerData?.subscription?.billingCycle || 'Monthly'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">Monthly Fee</span>
                <span className="font-semibold text-sm lg:text-base">₹{user.gymOwnerData?.subscription?.amount || 500}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">Last Paid</span>
                <span className="text-sm lg:text-base">
                  {user.gymOwnerData?.subscription?.lastPaidMonth
                    ? monthLabel(user.gymOwnerData.subscription.lastPaidMonth)
                    : <span className="text-red-400">Not paid</span>}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">Renewal Date</span>
                <span className="text-sm lg:text-base">
                  {user.gymOwnerData?.subscription?.renewalDate
                    ? fmtDate(user.gymOwnerData.subscription.renewalDate)
                    : '—'}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                {/* Pay for This Month button */}
                {(() => {
                  const sub = user.gymOwnerData?.subscription;
                  const alreadyPaid = sub?.lastPaidMonth === toMonthKey();
                  return alreadyPaid ? (
                    <div className="w-full py-3 flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium">
                      <Zap className="w-4 h-4" />
                      Paid for {monthLabel(sub.lastPaidMonth)}
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubscriptionPay}
                      disabled={subPaying}
                      className="w-full py-3 bg-accent text-black font-semibold rounded-lg hover:bg-accent-hover transition-colors text-sm lg:text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {subPaying ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Pay ₹500 for {monthLabel(toMonthKey())}
                        </>
                      )}
                    </motion.button>
                  );
                })()}

                {/* Toggle payment history */}
                {(user.gymOwnerData?.subscription?.paymentHistory?.length > 0) && (
                  <button
                    onClick={() => setShowPayHistory(p => !p)}
                    className="w-full py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-sm flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400"
                  >
                    <History className="w-4 h-4" />
                    {showPayHistory ? 'Hide' : 'View'} Payment History
                  </button>
                )}

                {/* Payment history list */}
                {showPayHistory && (
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                    {[...user.gymOwnerData.subscription.paymentHistory].reverse().map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-900/60 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">{monthLabel(p.month)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 dark:text-white font-medium">₹{p.amount}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            p.status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}>{p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-none rounded-xl p-4 lg:p-6 border border-gray-200 dark:border-gray-800"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-accent" />
              Recent Activities
            </h3>

            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg border ${
                    activity.type === 'gym' ? 'bg-blue-500/10 border-blue-500/30' :
                    activity.type === 'member' ? 'bg-emerald-500/10 border-emerald-500/30' :
                    activity.type === 'payment' ? 'bg-purple-500/10 border-purple-500/30' :
                    'bg-accent/10 border-accent/30'
                  }`}>
                    <span className={
                      activity.type === 'gym' ? 'text-blue-400' :
                      activity.type === 'member' ? 'text-emerald-400' :
                      activity.type === 'payment' ? 'text-purple-400' :
                      'text-accent'
                    }>{activity.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.action}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-none rounded-xl p-4 lg:p-6 border border-gray-200 dark:border-gray-800"
          >
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 lg:p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:border-blue-400 transition-colors flex flex-col items-center justify-center">
                <Globe className="w-4 h-4 lg:w-5 lg:h-5 mb-1 lg:mb-2 text-blue-400" />
                <span className="text-xs lg:text-sm">Website</span>
              </button>

              <button className="p-3 lg:p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:border-emerald-400 transition-colors flex flex-col items-center justify-center">
                <FileText className="w-4 h-4 lg:w-5 lg:h-5 mb-1 lg:mb-2 text-emerald-400" />
                <span className="text-xs lg:text-sm">Reports</span>
              </button>

              <button className="p-3 lg:p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:border-purple-400 transition-colors flex flex-col items-center justify-center">
                <Star className="w-4 h-4 lg:w-5 lg:h-5 mb-1 lg:mb-2 text-purple-400" />
                <span className="text-xs lg:text-sm">Reviews</span>
              </button>

              <button className="p-3 lg:p-4 bg-accent/10 border border-accent/30 rounded-lg hover:border-accent transition-colors flex flex-col items-center justify-center">
                <Bell className="w-4 h-4 lg:w-5 lg:h-5 mb-1 lg:mb-2 text-accent" />
                <span className="text-xs lg:text-sm">Alerts</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
