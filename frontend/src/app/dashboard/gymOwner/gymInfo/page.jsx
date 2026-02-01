// /app/dashboard/gymOwner/gyms/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Plus, 
  MapPin, 
  Users, 
  DollarSign, 
  Activity,
  Edit2, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const GymsPage = () => {
  const router = useRouter();
  const { user, token, hydrated } = useUserStore();
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteModal, setDeleteModal] = useState(null);
  const [stats, setStats] = useState({
    totalGyms: 0,
    activeGyms: 0,
    totalMembers: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    if ( !token) return;

    const fetchGyms = async () => {
      try {
       
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/gyms`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setGyms(data.gyms || []);
          
          // Calculate stats
          const totalGyms = data.gyms?.length || 0;
          const activeGyms = data.gyms?.filter(g => g.status === 'active').length || 0;
          const totalMembers = data.gyms?.reduce((sum, gym) => sum + (gym.stats?.totalMembers || 0), 0) || 0;
          const monthlyRevenue = data.gyms?.reduce((sum, gym) => sum + (gym.stats?.monthlyRevenue || 0), 0) || 0;
          
          setStats({
            totalGyms,
            activeGyms,
            totalMembers,
            monthlyRevenue
          });
        } else {
          toast.error('Failed to fetch gyms');
        }
      } catch (error) {
        console.error('Error fetching gyms:', error);
        toast.error('Error loading gyms');
      } finally {
       
      }
    };

    fetchGyms();
  }, [hydrated, token]);

  const handleDeleteGym = async (gymId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/gyms/${gymId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        setGyms(gyms.filter(gym => gym._id !== gymId));
        toast.success('Gym deleted successfully');
        setDeleteModal(null);
      } else {
        toast.error('Failed to delete gym');
      }
    } catch (error) {
      console.error('Error deleting gym:', error);
      toast.error('Error deleting gym');
    }
  };

  const filteredGyms = gyms.filter(gym => {
    const matchesSearch = gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gym.address?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || gym.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const statCards = [
    {
      label: 'Total Gyms',
      value: stats.totalGyms,
      icon: <Building className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600',
      change: '+2'
    },
    {
      label: 'Active Gyms',
      value: stats.activeGyms,
      icon: <Activity className="w-5 h-5" />,
      color: 'from-green-500 to-green-600',
      change: '+1'
    },
    {
      label: 'Total Members',
      value: stats.totalMembers.toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600',
      change: '+12%'
    },
    {
      label: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'from-orange-500 to-orange-600',
      change: '+15%'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">My Gyms</h1>
          <p className="text-gray-400">Manage all your gym locations and members</p>
        </div>
        <Link href="/dashboard/gymOwner/gymInfo/addgym">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Gym</span>
          </motion.button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-green-400 text-sm font-medium">{stat.change}</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
            <p className="text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search gyms by name or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="under_maintenance">Maintenance</option>
              <option value="closed">Closed</option>
            </select>
            <button className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Gyms List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGyms.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Building className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Gyms Found</h3>
            <p className="text-gray-400 mb-6">Get started by adding your first gym</p>
            <Link href="/dashboard/gymOwner/gymInfo/addgym">
              <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg hover:opacity-90 transition-opacity">
                Add Your First Gym
              </button>
            </Link>
          </div>
        ) : (
          filteredGyms.map((gym, index) => (
            <motion.div
              key={gym._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-red-500/30 transition-all group"
            >
              {/* Gym Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {gym.logo ? (
                      <img
                        src={gym.logo}
                        alt={gym.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
                        <Building className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-red-400 transition-colors">
                        {gym.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {gym.address?.city || 'Location not set'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="p-2 hover:bg-gray-700 rounded-lg">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    gym.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    gym.status === 'inactive' ? 'bg-yellow-500/20 text-yellow-400' :
                    gym.status === 'under_maintenance' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {gym.status?.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-400">
                    {gym.stats?.totalMembers || 0} members
                  </span>
                </div>
              </div>

              {/* Gym Details */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Members</p>
                    <p className="font-semibold">{gym.stats?.totalMembers || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Trainers</p>
                    <p className="font-semibold">{gym.stats?.totalTrainers || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Revenue</p>
                    <p className="font-semibold">${gym.stats?.monthlyRevenue || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Approval</p>
                    <p className={`font-semibold ${
                      gym.approval?.isApproved ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {gym.approval?.isApproved ? 'Approved' : 'Pending'}
                    </p>
                  </div>
                </div>

                {/* Operating Hours */}
                {gym.operatingHours && gym.operatingHours.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Todayas Hours</p>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {(() => {
                          const today = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
                          const hours = gym.operatingHours.find(h => h.day === today);
                          return hours && !hours.isClosed 
                            ? `${hours.open} - ${hours.close}`
                            : 'Closed Today';
                        })()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Link href={`/dashboard/gymOwner/gyms/${gym._id}`} className="flex-1">
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </Link>
                  <Link href={`/dashboard/gymOwner/gyms/${gym._id}/edit`} className="flex-1">
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </Link>
                  <button
                    onClick={() => setDeleteModal(gym._id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Gym</h3>
              <p className="text-gray-400">
                Are you sure you want to delete this gym? This action cannot be undone and all associated data will be lost.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteGym(deleteModal)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg hover:opacity-90 transition-opacity"
              >
                Delete Gym
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GymsPage;