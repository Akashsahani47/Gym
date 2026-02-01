// /app/dashboard/gymOwner/profile/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
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
  DollarSign,
  Activity,
  Menu,
  ChevronLeft
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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

  const statCards = [
    { 
      label: 'Total Members', 
      value: stats.totalMembers.toLocaleString(), 
      icon: <Users className="w-5 h-5" />, 
      change: '+12%', 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/20'
    },
    { 
      label: 'Active Members', 
      value: stats.activeMembers.toLocaleString(), 
      icon: <Activity className="w-5 h-5" />, 
      change: '+8%', 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/20'
    },
    { 
      label: 'Monthly Revenue', 
      value: `$${stats.monthlyRevenue.toLocaleString()}`, 
      icon: <DollarSign className="w-5 h-5" />, 
      change: '+15%', 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/20'
    },
    { 
      label: 'Occupancy Rate', 
      value: `${stats.occupancyRate}%`, 
      icon: <TrendingUp className="w-5 h-5" />, 
      change: '+3%', 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/20'
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
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 lg:p-6">
      {/* Mobile Header */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Profile</h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Header */}
      <div className="hidden lg:flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gym Owner Profile</h1>
          <p className="text-gray-400">Manage your account and business information</p>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg hover:opacity-90 transition-opacity"
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
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg hover:opacity-90 transition-opacity"
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
            className="bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <div className={`p-2 lg:p-3 rounded-lg ${stat.bgColor}`}>
                {stat.icon}
              </div>
              <span className="text-green-400 text-sm font-medium">{stat.change}</span>
            </div>
            <h3 className="text-lg lg:text-2xl font-bold mb-1">{stat.value}</h3>
            <p className="text-gray-400 text-sm lg:text-base">{stat.label}</p>
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
          <div className="bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg lg:text-xl font-bold flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h2>
              <div className="hidden lg:flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  user.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                  user.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                </span>
              </div>
            </div>

            {/* Mobile Status */}
            <div className="lg:hidden mb-4">
              <span className={`px-3 py-1 rounded-full text-xs ${
                user.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                user.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
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
                  'bg-green-500/20 border border-green-500/30' : 
                  'bg-red-500/20 border border-red-500/30'
                }`}
              >
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
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
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
                    {user.profile?.avatar ? (
                      <img 
                        src={user.profile.avatar} 
                        alt="Avatar" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 p-2 bg-gray-900 rounded-full cursor-pointer border border-gray-700 group-hover:bg-gray-800 transition-colors">
                      <Upload className="w-3 h-3 lg:w-4 lg:h-4" />
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
                  <p className="text-gray-400 text-sm lg:text-base">Gym Owner</p>
                  <p className="text-xs lg:text-sm text-gray-500 mt-1">Click edit to update profile photo</p>
                </div>
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-sm text-gray-400 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="profile.firstName"
                    value={formData.profile.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm lg:text-base focus:outline-none focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-sm text-gray-400 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="profile.lastName"
                    value={formData.profile.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm lg:text-base focus:outline-none focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-300 text-sm lg:text-base">{user.email}</span>
                    {user.emailVerified ? (
                      <span className="ml-auto text-green-400 text-xs lg:text-sm flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <button type="button" className="ml-auto text-red-400 text-xs lg:text-sm hover:underline">
                        Verify
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-2">Phone</label>
                  <div className="flex items-center">
                    <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 flex-1">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
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
                  <label className="block text-sm text-gray-400 mb-2">Date of Birth</label>
                  <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
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
                  <label className="block text-sm text-gray-400 mb-2">Bio</label>
                  <textarea
                    name="profile.bio"
                    value={formData.profile.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows="3"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm lg:text-base focus:outline-none focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              {/* Business Information */}
              <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Business Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-sm text-gray-400 mb-2">Company Name</label>
                    <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
                      <Building className="w-4 h-4 mr-2 text-gray-400" />
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
                    <label className="block text-sm text-gray-400 mb-2">Tax ID</label>
                    <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
                      <FileText className="w-4 h-4 mr-2 text-gray-400" />
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
                    <label className="block text-sm text-gray-400 mb-2">Business Registration Number</label>
                    <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
                      <FileText className="w-4 h-4 mr-2 text-gray-400" />
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
                <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    Change Password
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm lg:text-base focus:outline-none focus:border-red-500"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm lg:text-base focus:outline-none focus:border-red-500"
                          placeholder="Enter new password"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm lg:text-base focus:outline-none focus:border-red-500"
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
                  className="flex flex-col-reverse lg:flex-row justify-end space-y-4 lg:space-y-0 space-y-reverse lg:space-x-4 mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-gray-700"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setMessage({ type: '', text: '' });
                    }}
                    className="w-full lg:w-auto px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-sm lg:text-base"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm lg:text-base"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
            <div className="bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
                <h2 className="text-lg lg:text-xl font-bold flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  My Gyms
                </h2>
                <button className="w-full lg:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg hover:opacity-90 transition-opacity text-sm lg:text-base">
                  <Building className="w-4 h-4" />
                  <span>Add New Gym</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {gyms.map((gym) => (
                  <div key={gym._id} className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-red-500/30 transition-colors group">
                    <div className="flex items-center space-x-3 mb-4">
                      {gym.logo ? (
                        <img src={gym.logo} alt={gym.name} className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
                          <Building className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm lg:text-base group-hover:text-red-400 transition-colors truncate">{gym.name}</h3>
                        <p className="text-xs lg:text-sm text-gray-400 truncate">{gym.address?.city || 'No location'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs lg:text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        gym.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        gym.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {gym.status?.replace('_', ' ')}
                      </span>
                      <span className="text-gray-400">{gym.stats?.totalMembers || 0} members</span>
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
            className="bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Subscription Status
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm lg:text-base">Current Plan</span>
                <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-full text-xs lg:text-sm font-medium">
                  {user.gymOwnerData?.subscription?.plan || 'Basic'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm lg:text-base">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs lg:text-sm ${
                  user.gymOwnerData?.subscription?.status === 'active' ? 
                  'bg-green-500/20 text-green-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {user.gymOwnerData?.subscription?.status || 'Active'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm lg:text-base">Billing Cycle</span>
                <span className="font-medium text-sm lg:text-base">{user.gymOwnerData?.subscription?.billingCycle || 'Monthly'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm lg:text-base">Renewal Date</span>
                <span className="text-sm lg:text-base">
                  {user.gymOwnerData?.subscription?.renewalDate 
                    ? new Date(user.gymOwnerData.subscription.renewalDate).toLocaleDateString()
                    : 'Not set'}
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-700 space-y-2">
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:opacity-90 transition-opacity text-sm lg:text-base">
                  Upgrade Plan
                </button>
                <button className="w-full py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-sm lg:text-base">
                  View Billing History
                </button>
              </div>
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Recent Activities
            </h3>
            
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'gym' ? 'bg-blue-500/20' :
                    activity.type === 'member' ? 'bg-green-500/20' :
                    activity.type === 'payment' ? 'bg-purple-500/20' :
                    'bg-orange-500/20'
                  }`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.action}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
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
            className="bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700"
          >
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 lg:p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg hover:border-blue-400 transition-colors flex flex-col items-center justify-center">
                <Globe className="w-4 h-4 lg:w-5 lg:h-5 mb-1 lg:mb-2" />
                <span className="text-xs lg:text-sm">Website</span>
              </button>
              
              <button className="p-3 lg:p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg hover:border-green-400 transition-colors flex flex-col items-center justify-center">
                <FileText className="w-4 h-4 lg:w-5 lg:h-5 mb-1 lg:mb-2" />
                <span className="text-xs lg:text-sm">Reports</span>
              </button>
              
              <button className="p-3 lg:p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg hover:border-purple-400 transition-colors flex flex-col items-center justify-center">
                <Star className="w-4 h-4 lg:w-5 lg:h-5 mb-1 lg:mb-2" />
                <span className="text-xs lg:text-sm">Reviews</span>
              </button>
              
              <button className="p-3 lg:p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg hover:border-orange-400 transition-colors flex flex-col items-center justify-center">
                <Bell className="w-4 h-4 lg:w-5 lg:h-5 mb-1 lg:mb-2" />
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