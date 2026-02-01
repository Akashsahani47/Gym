// /app/dashboard/gymOwner/customers/add/page.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  Save,
  ArrowLeft,
  Building,
  Target,
  AlertTriangle,
  Check,
  ChevronDown,
  X,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const AddCustomerPage = () => {
  const router = useRouter();
  const { token, hydrated } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [gyms, setGyms] = useState([]);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [loadingGyms, setLoadingGyms] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const scrollContainerRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    email: '',
    password: '',
    confirmPassword: '',
    
    // Profile
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      emergencyContact: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    },
    
    // Gym & Membership
    gymId: '',
    membership: {
      planId: '',
      planName: '',
      startDate: '',
      endDate: '',
      status: 'pending'
    },
    
    // Health Metrics
    healthMetrics: {
      height: '',
      weight: '',
      fitnessGoals: []
    },
    
    // Status
    status: 'pending',
    
    // Settings
    sendWelcomeEmail: true,
    autoGeneratePassword: false
  });

  const [newGoal, setNewGoal] = useState('');

  const tabs = [
    { id: 'basic', title: 'Basic', icon: <User className="w-4 h-4" /> },
    { id: 'profile', title: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'membership', title: 'Membership', icon: <Building className="w-4 h-4" /> },
    { id: 'health', title: 'Health', icon: <Target className="w-4 h-4" /> },
    { id: 'settings', title: 'Settings', icon: <Check className="w-4 h-4" /> }
  ];

  useEffect(() => {
    if (!token) {
      router.push('/loginPage');
    }
  }, [hydrated, token, router]);

  useEffect(() => {
    const fetchGyms = async () => {
      if (!token) return;
      
      try {
        setLoadingGyms(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/gyms`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const data = await response.json();
        
        if (response.ok) {
          setGyms(data.gyms || []);
        } else {
          toast.error(data.error || 'Failed to load gyms');
        }
      } catch (error) {
        toast.error('Failed to load gyms');
      } finally {
        setLoadingGyms(false);
      }
    };

    fetchGyms();
  }, [token]);

  useEffect(() => {
    const fetchMembershipPlans = async () => {
      if (!formData.gymId) {
        setMembershipPlans([]);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/gyms/${formData.gymId}/plans`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const data = await response.json();
        
        if (response.ok) {
          setMembershipPlans(data.plans || []);
        } else {
          toast.error(data.error || 'Failed to load membership plans');
        }
      } catch (error) {
        toast.error('Failed to load membership plans');
      }
    };

    fetchMembershipPlans();
  }, [formData.gymId, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('profile.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [field]: value
        }
      }));
    } else if (name.startsWith('profile.address.')) {
      const field = name.split('.')[2];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          address: {
            ...prev.profile.address,
            [field]: value
          }
        }
      }));
    } else if (name.startsWith('membership.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        membership: {
          ...prev.membership,
          [field]: value
        }
      }));
    } else if (name.startsWith('healthMetrics.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        healthMetrics: {
          ...prev.healthMetrics,
          [field]: field === 'height' || field === 'weight' ? (value ? parseFloat(value) : '') : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleMembershipPlanChange = (planId) => {
    const selectedPlan = membershipPlans.find(plan => plan._id === planId);
    if (!selectedPlan) return;

    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + selectedPlan.duration);
    const endDateStr = endDate.toISOString().split('T')[0];

    setFormData(prev => ({
      ...prev,
      membership: {
        ...prev.membership,
        planId: selectedPlan._id,
        planName: selectedPlan.name,
        startDate,
        endDate: endDateStr
      }
    }));
  };

  const handleAddGoal = () => {
    if (newGoal.trim() && !formData.healthMetrics.fitnessGoals.includes(newGoal.trim())) {
      setFormData(prev => ({
        ...prev,
        healthMetrics: {
          ...prev.healthMetrics,
          fitnessGoals: [...prev.healthMetrics.fitnessGoals, newGoal.trim()]
        }
      }));
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (index) => {
    setFormData(prev => ({
      ...prev,
      healthMetrics: {
        ...prev.healthMetrics,
        fitnessGoals: prev.healthMetrics.fitnessGoals.filter((_, i) => i !== index)
      }
    }));
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleAutoGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setFormData(prev => ({
      ...prev,
      password: newPassword,
      confirmPassword: newPassword,
      autoGeneratePassword: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("🔥 handleSubmit called");
console.log("Testing toast...");
  toast.success('Test toast message');
    // Validate required fields
    if (!formData.email || !formData.profile.firstName || !formData.profile.lastName || !formData.profile.phone || !formData.gymId) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!formData.password) {
      toast.error('Password is required');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    // Prepare data for API
    const submitData = {
      email: formData.email,
      password: formData.password,
      profile: {
        firstName: formData.profile.firstName,
        lastName: formData.profile.lastName,
        phone: formData.profile.phone,
        ...(formData.profile.dateOfBirth && { dateOfBirth: formData.profile.dateOfBirth }),
        ...(formData.profile.emergencyContact && { emergencyContact: formData.profile.emergencyContact }),
        address: {
          ...(formData.profile.address.street && { street: formData.profile.address.street }),
          ...(formData.profile.address.city && { city: formData.profile.address.city }),
          ...(formData.profile.address.state && { state: formData.profile.address.state }),
          ...(formData.profile.address.zipCode && { zipCode: formData.profile.address.zipCode }),
          ...(formData.profile.address.country && { country: formData.profile.address.country })
        }
      },
      gymId: formData.gymId,
      ...(formData.membership.planId && {
        membership: {
          planId: formData.membership.planId,
          planName: formData.membership.planName,
          ...(formData.membership.startDate && { startDate: formData.membership.startDate }),
          ...(formData.membership.endDate && { endDate: formData.membership.endDate }),
          status: formData.membership.status
        }
      }),
      ...((formData.healthMetrics.height || formData.healthMetrics.weight || formData.healthMetrics.fitnessGoals.length > 0) && {
        healthMetrics: {
          ...(formData.healthMetrics.height && { height: parseFloat(formData.healthMetrics.height) }),
          ...(formData.healthMetrics.weight && { weight: parseFloat(formData.healthMetrics.weight) }),
          ...(formData.healthMetrics.fitnessGoals.length > 0 && { fitnessGoals: formData.healthMetrics.fitnessGoals })
        }
      }),
      status: formData.status,
      sendWelcomeEmail: formData.sendWelcomeEmail
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/addmembers`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submitData)
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Member added successfully!');
        router.push('/dashboard/gymOwner/customers');
      } else {
        toast.error(data.error || 'Failed to add member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Error adding member');
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -150, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-transparent focus:outline-none flex-1"
                    placeholder="member@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-300">Password Settings</h4>
                <button
                  type="button"
                  onClick={handleAutoGeneratePassword}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Generate Random Password
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
                    <Lock className="w-4 h-4 mr-2 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="bg-transparent focus:outline-none flex-1"
                      placeholder="Enter password"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
                    <Lock className="w-4 h-4 mr-2 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="bg-transparent focus:outline-none flex-1"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="profile.firstName"
                  value={formData.profile.firstName}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                  placeholder="John"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="profile.lastName"
                  value={formData.profile.lastName}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                  placeholder="Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <input
                    type="tel"
                    name="profile.phone"
                    value={formData.profile.phone}
                    onChange={handleChange}
                    required
                    className="bg-transparent focus:outline-none flex-1"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Date of Birth</label>
                <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <input
                    type="date"
                    name="profile.dateOfBirth"
                    value={formData.profile.dateOfBirth}
                    onChange={handleChange}
                    className="bg-transparent focus:outline-none flex-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Emergency Contact</label>
                <input
                  type="text"
                  name="profile.emergencyContact"
                  value={formData.profile.emergencyContact}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                  placeholder="Emergency contact name & number"
                />
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Address (Optional)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-2">Street Address</label>
                  <input
                    type="text"
                    name="profile.address.street"
                    value={formData.profile.address.street}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                    placeholder="123 Main Street"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">City</label>
                  <input
                    type="text"
                    name="profile.address.city"
                    value={formData.profile.address.city}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                    placeholder="New York"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">State/Province</label>
                  <input
                    type="text"
                    name="profile.address.state"
                    value={formData.profile.address.state}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                    placeholder="NY"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">ZIP/Postal Code</label>
                  <input
                    type="text"
                    name="profile.address.zipCode"
                    value={formData.profile.address.zipCode}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                    placeholder="10001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Country</label>
                  <input
                    type="text"
                    name="profile.address.country"
                    value={formData.profile.address.country}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'membership':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Select Gym <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="gymId"
                    value={formData.gymId}
                    onChange={handleChange}
                    required
                    disabled={loadingGyms}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 appearance-none"
                  >
                    <option value="">Select a gym</option>
                    {gyms.map(gym => (
                      <option key={gym._id} value={gym._id}>
                        {gym.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {loadingGyms && (
                  <p className="text-xs text-yellow-400 mt-2">Loading gyms...</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Membership Status</label>
                <select
                  name="membership.status"
                  value={formData.membership.status}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {formData.gymId && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Membership Plan (Optional)
                  </label>
                  {membershipPlans.length === 0 ? (
                    <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
                      <p className="text-gray-400">No membership plans available for this gym</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {membershipPlans.map(plan => (
                        <div
                          key={plan._id}
                          onClick={() => handleMembershipPlanChange(plan._id)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            formData.membership.planId === plan._id
                              ? 'bg-red-600/10 border-red-500'
                              : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{plan.name}</h4>
                            {formData.membership.planId === plan._id && (
                              <Check className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{plan.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">${plan.price}</span>
                            <span className="text-sm text-gray-400">{plan.duration} days</span>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">
                              Monthly: ${((plan.price / plan.duration) * 30).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {(formData.membership.startDate || formData.membership.endDate) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                      <input
                        type="date"
                        name="membership.startDate"
                        value={formData.membership.startDate}
                        onChange={handleChange}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">End Date</label>
                      <input
                        type="date"
                        name="membership.endDate"
                        value={formData.membership.endDate}
                        onChange={handleChange}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'health':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  name="healthMetrics.height"
                  value={formData.healthMetrics.height}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                  placeholder="175"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="healthMetrics.weight"
                  value={formData.healthMetrics.weight}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                  placeholder="70"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Fitness Goals</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.healthMetrics.fitnessGoals.map((goal, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-800 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{goal}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddGoal();
                    }
                  }}
                  placeholder="Add a fitness goal..."
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-l-lg px-4 py-3 focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={handleAddGoal}
                  className="px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-r-lg hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700 cursor-pointer">
                <div className="pr-4">
                  <h4 className="font-semibold">Send Welcome Email</h4>
                  <p className="text-sm text-gray-400">Send welcome email with login credentials to member</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    name="sendWelcomeEmail"
                    checked={formData.sendWelcomeEmail}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    formData.sendWelcomeEmail ? 'bg-green-500' : 'bg-gray-700'
                  }`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                      formData.sendWelcomeEmail ? 'translate-x-5' : 'translate-x-1'
                    } mt-1`}></div>
                  </div>
                </div>
              </label>

              <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <h4 className="font-semibold">Important Notes</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1.5"></div>
                    <span>Member will receive an email with their login credentials</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1.5"></div>
                    <span>Make sure the email address is correct and accessible</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1.5"></div>
                    <span>Members can reset their password through the login page</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1.5"></div>
                    <span>You can update member details later from the dashboard</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 px-4">
            <h1 className="text-lg font-bold truncate">Add New Member</h1>
            <p className="text-xs text-gray-400 truncate">
              {tabs.find(t => t.id === activeTab)?.title}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6">
        {/* Desktop Header */}
        <div className="hidden lg:block mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Add New Member</h1>
              <p className="text-gray-400">Add a new member to your gym manually</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Horizontal Navigation Bar */}
          <div className="mb-6 lg:mb-8">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Add Member</h3>
                  <p className="text-xs text-gray-400">Complete all sections</p>
                </div>
              </div>
              
              <div className="relative">
                {/* Scroll Buttons for Mobile */}
                <button
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 bg-gray-900 border border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors lg:hidden"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <button
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 z-10 w-8 h-8 bg-gray-900 border border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors lg:hidden"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                {/* Horizontal Navigation */}
                <div 
                  ref={scrollContainerRef}
                  className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors whitespace-nowrap min-w-[70px] ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                          : 'bg-gray-900 hover:bg-gray-700'
                      }`}
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        {tab.icon}
                      </div>
                      <span className="text-xs font-medium text-center">{tab.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Content */}
          <div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 lg:p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-lg lg:text-xl font-bold capitalize">
                    {tabs.find(t => t.id === activeTab)?.title} Information
                  </h2>
                  <p className="text-gray-400 text-sm">Fill in the required information</p>
                </div>
                <div className="flex items-center space-x-2 self-end lg:self-auto">
                  {activeTab !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = tabs.findIndex(t => t.id === activeTab);
                        if (currentIndex > 0) {
                          setActiveTab(tabs[currentIndex - 1].id);
                        }
                      }}
                      className="px-3 lg:px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-sm lg:text-base"
                    >
                      Previous
                    </button>
                  )}
                  {activeTab !== 'settings' && (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = tabs.findIndex(t => t.id === activeTab);
                        if (currentIndex < tabs.length - 1) {
                          setActiveTab(tabs[currentIndex + 1].id);
                        }
                      }}
                      className="px-3 lg:px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg hover:opacity-90 transition-opacity text-sm lg:text-base"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>

              {renderTabContent()}
            </div>

            {/* Form Actions - Mobile Fixed Bottom */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-700">
              <div className="flex justify-between space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors flex-1 text-sm"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-1 text-sm"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Add Member
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Form Actions - Desktop */}
           {/* Form Actions - Desktop */}
<div className="hidden lg:flex justify-end space-x-4">
  <button
    type="button"
    onClick={() => router.back()}
    className="px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
  >
    Cancel
  </button>
  <motion.button
    type="submit"
    disabled={loading}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
  >
    {loading ? (
      <>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Adding Member...
      </>
    ) : (
      <>
        <Save className="w-4 h-4 mr-2" />
        Add Member
      </>
    )}
  </motion.button>
</div>
          </div>
        </form>
      </div>

      {/* Add padding bottom for mobile to account for fixed button */}
      <div className="h-20 lg:h-0"></div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div> 
  );
};

export default AddCustomerPage;