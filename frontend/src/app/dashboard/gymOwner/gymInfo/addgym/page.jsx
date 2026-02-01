// /app/dashboard/gymOwner/gyms/add/page.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock,
  IndianRupee,
  Check,
  X,
  Upload,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Facebook,
  Instagram,
  Twitter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const daysOfWeek = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

const defaultFacilities = [
  { name: 'Cardio Equipment', description: 'Treadmills, ellipticals, stationary bikes', available: true },
  { name: 'Weight Training', description: 'Free weights, weight machines', available: true },
  { name: 'Group Classes', description: 'Yoga, Zumba, Spin classes', available: true },
  { name: 'Swimming Pool', description: 'Indoor/outdoor swimming pool', available: false },
  { name: 'Locker Rooms', description: 'Secure lockers and showers', available: true },
  { name: 'Personal Training', description: 'Certified personal trainers', available: true },
  { name: 'Sauna/Steam Room', description: 'Relaxation facilities', available: false },
  { name: 'Parking', description: 'Free parking available', available: true }
];

const sections = [
  {
    id: 'basic',
    title: 'Basic',
    icon: <Building className="w-4 h-4" />,
    fullTitle: 'Basic Information'
  },
  {
    id: 'contact',
    title: 'Contact',
    icon: <Phone className="w-4 h-4" />,
    fullTitle: 'Contact Details'
  },
  {
    id: 'location',
    title: 'Location',
    icon: <MapPin className="w-4 h-4" />,
    fullTitle: 'Location'
  },
  {
    id: 'facilities',
    title: 'Facilities',
    icon: <Check className="w-4 h-4" />,
    fullTitle: 'Facilities'
  },
  {
    id: 'hours',
    title: 'Hours',
    icon: <Clock className="w-4 h-4" />,
    fullTitle: 'Operating Hours'
  },
  {
    id: 'plans',
    title: 'Plans',
    icon: <IndianRupee className="w-4 h-4" />,
    fullTitle: 'Membership Plans'
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: <Globe className="w-4 h-4" />,
    fullTitle: 'Settings'
  }
];

const AddGymPage = () => {
  const router = useRouter();
  const { token, hydrated } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const scrollContainerRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    description: '',
    
    // Contact Info
    contact: {
      email: '',
      phone: '',
      website: '',
      socialMedia: {
        facebook: '',
        instagram: '',
        twitter: ''
      }
    },
    
    // Location
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      coordinates: {
        lat: '',
        lng: ''
      }
    },
    
    // Media
    logo: '',
    coverImage: '',
    images: [],
    
    // Facilities
    facilities: defaultFacilities.map(f => ({ ...f })),
    
    // Operating Hours
    operatingHours: daysOfWeek.map(day => ({
      day: day.value,
      open: '06:00',
      close: '22:00',
      isClosed: false
    })),
    
    // Membership Plans
    membershipPlans: [
      {
        name: 'Basic',
        description: 'Access to basic equipment',
        price: 29.99,
        duration: 30,
        features: ['Cardio Equipment', 'Weight Training', 'Locker Room'],
        isActive: true
      },
      {
        name: 'Premium',
        description: 'All facilities + group classes',
        price: 49.99,
        duration: 30,
        features: ['All Facilities', 'Group Classes', 'Personal Training Discount'],
        isActive: true
      },
      {
        name: 'Annual',
        description: 'Best value - yearly membership',
        price: 499.99,
        duration: 365,
        features: ['All Facilities', 'Free Guest Passes', 'No Commitment'],
        isActive: true
      }
    ],
    
    // Settings
    settings: {
      allowWalkIns: true,
      requireBooking: false,
      maxCapacity: 100,
      autoCheckout: true
    },
    
    // Status
    status: 'active'
  });

  useEffect(() => {
    if (!token) {
      router.push('/loginPage');
    }
  }, [hydrated, token, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value
        }
      }));
    } else if (name.startsWith('contact.socialMedia.')) {
      const platform = name.split('.')[2];
      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          socialMedia: {
            ...prev.contact.socialMedia,
            [platform]: value
          }
        }
      }));
    } else if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else if (name.startsWith('address.coordinates.')) {
      const coord = name.split('.')[2];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          coordinates: {
            ...prev.address.coordinates,
            [coord]: parseFloat(value) || ''
          }
        }
      }));
    } else if (name.startsWith('settings.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleOperatingHoursChange = (index, field, value) => {
    const updatedHours = [...formData.operatingHours];
    updatedHours[index][field] = value;
    setFormData(prev => ({
      ...prev,
      operatingHours: updatedHours
    }));
  };

  const handleFacilityToggle = (index) => {
    const updatedFacilities = [...formData.facilities];
    updatedFacilities[index].available = !updatedFacilities[index].available;
    setFormData(prev => ({
      ...prev,
      facilities: updatedFacilities
    }));
  };

  const handleMembershipPlanChange = (index, field, value) => {
    const updatedPlans = [...formData.membershipPlans];
    updatedPlans[index][field] = field === 'price' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({
      ...prev,
      membershipPlans: updatedPlans
    }));
  };

  const handleMembershipPlanToggle = (index) => {
    const updatedPlans = [...formData.membershipPlans];
    updatedPlans[index].isActive = !updatedPlans[index].isActive;
    setFormData(prev => ({
      ...prev,
      membershipPlans: updatedPlans
    }));
  };

  const handleAddMembershipPlan = () => {
    setFormData(prev => ({
      ...prev,
      membershipPlans: [
        ...prev.membershipPlans,
        {
          name: '',
          description: '',
          price: 0,
          duration: 30,
          features: [],
          isActive: true
        }
      ]
    }));
  };

  const handleRemoveMembershipPlan = (index) => {
    const updatedPlans = formData.membershipPlans.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      membershipPlans: updatedPlans
    }));
  };

  const handleAddFeature = (planIndex, feature) => {
    const updatedPlans = [...formData.membershipPlans];
    if (feature.trim() && !updatedPlans[planIndex].features.includes(feature.trim())) {
      updatedPlans[planIndex].features.push(feature.trim());
      setFormData(prev => ({
        ...prev,
        membershipPlans: updatedPlans
      }));
    }
  };

  const handleRemoveFeature = (planIndex, featureIndex) => {
    const updatedPlans = [...formData.membershipPlans];
    updatedPlans[planIndex].features = updatedPlans[planIndex].features.filter((_, i) => i !== featureIndex);
    setFormData(prev => ({
      ...prev,
      membershipPlans: updatedPlans
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/upload/logo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          logo: data.url
        }));
        toast.success('Logo uploaded successfully!');
      } else {
        toast.error(data.error || 'Failed to upload logo');
      }
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/addgyms`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Gym created successfully!');
        router.push('/dashboard/gymOwner/gymInfo');
      } else {
        toast.error(data.error || 'Failed to create gym');
      }
    } catch (error) {
      console.error('Error creating gym:', error);
      toast.error('Error creating gym');
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Gym Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                placeholder="Enter gym name"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                placeholder="Describe your gym..."
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Gym Logo</label>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center overflow-hidden">
                    {formData.logo ? (
                      <img 
                        src={formData.logo} 
                        alt="Gym Logo" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-gray-900 rounded-full cursor-pointer border border-gray-700 hover:bg-gray-800 transition-colors">
                    <Upload className="w-3 h-3" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm text-gray-300">Upload gym logo</p>
                  <p className="text-xs text-gray-500">Recommended: 500x500px, PNG or JPG</p>
                  {uploadingLogo && (
                    <p className="text-xs text-yellow-400 mt-1">Uploading...</p>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="under_maintenance">Under Maintenance</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <input
                    type="email"
                    name="contact.email"
                    value={formData.contact.email}
                    onChange={handleChange}
                    className="bg-transparent focus:outline-none flex-1"
                    placeholder="gym@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Phone</label>
                <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <input
                    type="tel"
                    name="contact.phone"
                    value={formData.contact.phone}
                    onChange={handleChange}
                    className="bg-transparent focus:outline-none flex-1"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Website</label>
                <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
                  <Globe className="w-4 h-4 mr-2 text-gray-400" />
                  <input
                    type="url"
                    name="contact.website"
                    value={formData.contact.website}
                    onChange={handleChange}
                    className="bg-transparent focus:outline-none flex-1"
                    placeholder="https://yourgym.com"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">Social Media</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2 flex items-center">
                    <Facebook className="w-3 h-3 mr-2" />
                    Facebook
                  </label>
                  <input
                    type="url"
                    name="contact.socialMedia.facebook"
                    value={formData.contact.socialMedia.facebook}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                    placeholder="https://facebook.com/yourgym"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2 flex items-center">
                    <Instagram className="w-3 h-3 mr-2" />
                    Instagram
                  </label>
                  <input
                    type="url"
                    name="contact.socialMedia.instagram"
                    value={formData.contact.socialMedia.instagram}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                    placeholder="https://instagram.com/yourgym"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2 flex items-center">
                    <Twitter className="w-3 h-3 mr-2" />
                    Twitter
                  </label>
                  <input
                    type="url"
                    name="contact.socialMedia.twitter"
                    value={formData.contact.socialMedia.twitter}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                    placeholder="https://twitter.com/yourgym"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Street Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                  placeholder="123 Main Street"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                  placeholder="New York"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">State/Province</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                  placeholder="NY"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Country</label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                  placeholder="United States"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">ZIP/Postal Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                  placeholder="10001"
                />
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">Coordinates (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    name="address.coordinates.lat"
                    value={formData.address.coordinates.lat}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                    placeholder="40.7128"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    name="address.coordinates.lng"
                    value={formData.address.coordinates.lng}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                    placeholder="-74.0060"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'facilities':
        return (
          <div className="space-y-6">
            <p className="text-gray-400 mb-4">Select the facilities available at your gym:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.facilities.map((facility, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    facility.available
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-gray-900 border-gray-700'
                  }`}
                  onClick={() => handleFacilityToggle(index)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{facility.name}</h4>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      facility.available
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700'
                    }`}>
                      {facility.available ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{facility.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'hours':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {formData.operatingHours.map((hours, index) => (
                <div key={index} className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold capitalize">{hours.day}</h4>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <span className="text-sm text-gray-400">Closed</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={hours.isClosed}
                          onChange={(e) => handleOperatingHoursChange(index, 'isClosed', e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${
                          hours.isClosed ? 'bg-red-500' : 'bg-gray-700'
                        }`}>
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                            hours.isClosed ? 'translate-x-5' : 'translate-x-1'
                          } mt-1`}></div>
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  {!hours.isClosed && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Open Time</label>
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleOperatingHoursChange(index, 'open', e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Close Time</label>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleOperatingHoursChange(index, 'close', e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'plans':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-semibold">Membership Plans</h3>
              <button
                type="button"
                onClick={handleAddMembershipPlan}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg hover:opacity-90 transition-opacity w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Plan</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.membershipPlans.map((plan, index) => (
                <div key={index} className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => handleMembershipPlanChange(index, 'name', e.target.value)}
                          className="bg-transparent text-lg font-semibold focus:outline-none focus:text-red-400 w-full mb-1"
                          placeholder="Plan Name"
                        />
                        <input
                          type="text"
                          value={plan.description}
                          onChange={(e) => handleMembershipPlanChange(index, 'description', e.target.value)}
                          className="bg-transparent text-sm text-gray-400 focus:outline-none focus:text-gray-300 w-full"
                          placeholder="Plan description"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end space-x-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <span className="text-sm text-gray-400">Active</span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={plan.isActive}
                            onChange={() => handleMembershipPlanToggle(index)}
                            className="sr-only"
                          />
                          <div className={`w-10 h-6 rounded-full transition-colors ${
                            plan.isActive ? 'bg-green-500' : 'bg-gray-700'
                          }`}>
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                              plan.isActive ? 'translate-x-5' : 'translate-x-1'
                            } mt-1`}></div>
                          </div>
                        </div>
                      </label>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveMembershipPlan(index)}
                        className="p-2 hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={plan.price}
                        onChange={(e) => handleMembershipPlanChange(index, 'price', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Duration (days)</label>
                      <input
                        type="number"
                        min="1"
                        value={plan.duration}
                        onChange={(e) => handleMembershipPlanChange(index, 'duration', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Monthly Rate</label>
                      <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
                        <span className="font-semibold">
                          ${((plan.price / plan.duration) * 30).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-400 ml-2">/month</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Features</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {plan.features.map((feature, featureIndex) => (
                        <span
                          key={featureIndex}
                          className="px-3 py-1 bg-gray-800 rounded-full text-sm flex items-center space-x-2"
                        >
                          <span>{feature}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(index, featureIndex)}
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
                        placeholder="Add a feature..."
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-2 focus:outline-none focus:border-red-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddFeature(index, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          handleAddFeature(index, input.value);
                          input.value = '';
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-r-lg hover:opacity-90 transition-opacity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700 cursor-pointer">
                <div className="pr-4">
                  <h4 className="font-semibold">Allow Walk-ins</h4>
                  <p className="text-sm text-gray-400">Allow members to walk in without prior booking</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    name="settings.allowWalkIns"
                    checked={formData.settings.allowWalkIns}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    formData.settings.allowWalkIns ? 'bg-green-500' : 'bg-gray-700'
                  }`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                      formData.settings.allowWalkIns ? 'translate-x-5' : 'translate-x-1'
                    } mt-1`}></div>
                  </div>
                </div>
              </label>
              
              <label className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700 cursor-pointer">
                <div className="pr-4">
                  <h4 className="font-semibold">Require Booking</h4>
                  <p className="text-sm text-gray-400">Require members to book slots in advance</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    name="settings.requireBooking"
                    checked={formData.settings.requireBooking}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    formData.settings.requireBooking ? 'bg-blue-500' : 'bg-gray-700'
                  }`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                      formData.settings.requireBooking ? 'translate-x-5' : 'translate-x-1'
                    } mt-1`}></div>
                  </div>
                </div>
              </label>
              
              <label className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700 cursor-pointer">
                <div className="pr-4">
                  <h4 className="font-semibold">Auto Checkout</h4>
                  <p className="text-sm text-gray-400">Automatically check out members after session time</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    name="settings.autoCheckout"
                    checked={formData.settings.autoCheckout}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    formData.settings.autoCheckout ? 'bg-green-500' : 'bg-gray-700'
                  }`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                      formData.settings.autoCheckout ? 'translate-x-5' : 'translate-x-1'
                    } mt-1`}></div>
                  </div>
                </div>
              </label>
              
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                <h4 className="font-semibold mb-2">Maximum Capacity</h4>
                <p className="text-sm text-gray-400 mb-3">Maximum number of people allowed in the gym at once</p>
                <input
                  type="number"
                  name="settings.maxCapacity"
                  value={formData.settings.maxCapacity}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
                />
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
            <h1 className="text-lg font-bold truncate">Add New Gym</h1>
            <p className="text-xs text-gray-400 truncate">
              {sections.find(s => s.id === activeSection)?.fullTitle}
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
              <h1 className="text-2xl lg:text-3xl font-bold">Add New Gym</h1>
              <p className="text-gray-400">Fill in the details for your new gym location</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Horizontal Navigation Bar */}
          <div className="mb-6 lg:mb-8">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <h3 className="font-semibold mb-4 hidden lg:block">Setup Sections</h3>
              
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
  className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
>
  {sections.map((section) => (
    <button
      key={section.id}
      type="button"
      onClick={() => setActiveSection(section.id)}
      className={`flex-shrink-0 flex items-center justify-center gap-2 px-3 py-3 rounded-lg transition-colors min-w-[80px]
        ${
          activeSection === section.id
            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
            : 'bg-gray-900 hover:bg-gray-700'
        }
      `}
    >
      <span className="flex items-center justify-center w-5 h-5">
        {section.icon}
      </span>
      <span className="text-xs font-medium whitespace-nowrap">
        {section.title}
      </span>
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
                  <h2 className="text-xl font-bold">
                    {sections.find(s => s.id === activeSection)?.fullTitle}
                  </h2>
                  <p className="text-gray-400">Fill in the required information</p>
                </div>
                <div className="flex items-center space-x-2 self-end lg:self-auto">
                  {activeSection !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = sections.findIndex(s => s.id === activeSection);
                        if (currentIndex > 0) {
                          setActiveSection(sections[currentIndex - 1].id);
                        }
                      }}
                      className="px-3 lg:px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-sm lg:text-base"
                    >
                      Previous
                    </button>
                  )}
                  {activeSection !== 'settings' && (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = sections.findIndex(s => s.id === activeSection);
                        if (currentIndex < sections.length - 1) {
                          setActiveSection(sections[currentIndex + 1].id);
                        }
                      }}
                      className="px-3 lg:px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg hover:opacity-90 transition-opacity text-sm lg:text-base"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>

              {renderSection()}
            </div>

            {/* Form Actions - Mobile Fixed Bottom */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-700">
              <div className="flex justify-between space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors flex-1"
                >. 
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-1"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Gym
                    </>
                  )}
                </motion.button>
              </div>
            </div>

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
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Gym
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </div>

      {/* Add padding bottom for mobile to account for fixed button */}
     <div className="h-140 lg:h-0"></div>


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

export default AddGymPage;