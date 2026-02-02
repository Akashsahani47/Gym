// /app/dashboard/gymOwner/customers/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Target,
  UserCheck,
  UserX,
  Clock,
  Edit,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  X,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const CustomersPage = () => {
  const router = useRouter();
  const { token } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedGym, setSelectedGym] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    suspended: 0
  });

  useEffect(() => {
    if (!token) {
      router.push('/loginPage');
      return;
    }
    fetchData();
  }, [token, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch gyms
      const gymsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/gyms`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const gymsData = await gymsResponse.json();
      if (gymsResponse.ok) {
        setGyms(gymsData.gyms || []);
      }
      
      // Fetch members
      const membersResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/members`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const membersData = await membersResponse.json();
      if (membersResponse.ok) {
        setMembers(membersData.members || []);
        setFilteredMembers(membersData.members || []);
        calculateStats(membersData.members || []);
      } else {
        toast.error(membersData.error || 'Failed to load members');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (membersList) => {
    const statsData = {
      total: membersList.length,
      active: membersList.filter(m => m.status === 'active').length,
      pending: membersList.filter(m => m.status === 'pending').length,
      inactive: membersList.filter(m => m.status === 'inactive').length,
      suspended: membersList.filter(m => m.status === 'suspended').length
    };
    setStats(statsData);
  };

  useEffect(() => {
    let filtered = [...members];
    
    // Filter by gym
    if (selectedGym !== 'all') {
      filtered = filtered.filter(member => member.gymId?._id === selectedGym);
    }
    
    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(member => member.status === selectedStatus);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member => 
        member.email.toLowerCase().includes(term) ||
        member.profile?.firstName?.toLowerCase().includes(term) ||
        member.profile?.lastName?.toLowerCase().includes(term) ||
        member.profile?.phone?.includes(term)
      );
    }
    
    // Sort members
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name-asc':
          return (a.profile?.firstName || '').localeCompare(b.profile?.firstName || '');
        case 'name-desc':
          return (b.profile?.firstName || '').localeCompare(a.profile?.firstName || '');
        case 'active-first':
          return (a.status === 'active' ? -1 : 1) - (b.status === 'active' ? -1 : 1);
        default:
          return 0;
      }
    });
    
    setFilteredMembers(filtered);
  }, [members, selectedGym, selectedStatus, searchTerm, sortBy]);

  const handleViewDetails = (member) => {
    setSelectedMember(member);
    setShowDetailsModal(true);
  };

  const handleEditMember = (memberId) => {
    router.push(`/dashboard/gymOwner/customers/edit/${memberId}`);
  };

  const handleDeleteMember = async (memberId) => {
    if (!confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/members/${memberId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Member deleted successfully');
        fetchData();
      } else {
        toast.error(data.error || 'Failed to delete member');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to delete member');
    }
  };

  const handleStatusChange = async (memberId, newStatus) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/members/${memberId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Member status updated to ${newStatus}`);
        fetchData();
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Gym', 'Status', 'Membership Status', 'Start Date', 'End Date', 'Height', 'Weight'];
    const csvContent = [
      headers.join(','),
      ...filteredMembers.map(member => [
        `${member.profile?.firstName || ''} ${member.profile?.lastName || ''}`,
        member.email,
        member.profile?.phone || '',
        member.gymId?.name || '',
        member.status,
        member.membership?.status || 'N/A',
        member.membership?.startDate ? new Date(member.membership.startDate).toLocaleDateString() : 'N/A',
        member.membership?.endDate ? new Date(member.membership.endDate).toLocaleDateString() : 'N/A',
        member.healthMetrics?.height || 'N/A',
        member.healthMetrics?.weight || 'N/A'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'suspended': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <UserCheck className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'inactive': return <UserX className="w-4 h-4" />;
      case 'suspended': return <XCircle className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getMembershipStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3 md:p-6">
      {/* Header - Mobile Optimized */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-bold">Member Management</h1>
            <p className="text-gray-400 text-sm md:text-base">Manage and view all your gym members</p>
          </div>
          <div className="flex items-center gap-2 mt-3 md:mt-0">
            <button
              onClick={exportToCSV}
              className="px-3 py-2 md:px-4 md:py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors flex items-center text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Export</span>
            </button>
            <button
              onClick={fetchData}
              className="px-3 py-2 md:px-4 md:py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors flex items-center text-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Total</p>
              <p className="text-lg md:text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="p-2 bg-red-600/20 rounded-lg">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Active</p>
              <p className="text-lg md:text-2xl font-bold text-green-400">{stats.active}</p>
            </div>
            <div className="p-2 bg-green-600/20 rounded-lg">
              <UserCheck className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Pending</p>
              <p className="text-lg md:text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <div className="p-2 bg-yellow-600/20 rounded-lg">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Inactive</p>
              <p className="text-lg md:text-2xl font-bold text-gray-400">{stats.inactive}</p>
            </div>
            <div className="p-2 bg-gray-600/20 rounded-lg">
              <UserX className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Suspended</p>
              <p className="text-lg md:text-2xl font-bold text-red-400">{stats.suspended}</p>
            </div>
            <div className="p-2 bg-red-600/20 rounded-lg">
              <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters - Mobile Optimized */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 mb-6">
        <div className="flex flex-col gap-3">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-10 md:pl-10 md:pr-10 py-2 md:py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-sm md:text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 md:top-3 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
            </div>
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 md:px-4 md:py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center text-sm"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-gray-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Gym Filter */}
              <div>
                <label className="block text-xs md:text-sm text-gray-400 mb-1 md:mb-2">Filter by Gym</label>
                <select
                  value={selectedGym}
                  onChange={(e) => setSelectedGym(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 md:px-4 md:py-3 focus:outline-none focus:border-red-500 text-sm md:text-base"
                >
                  <option value="all">All Gyms</option>
                  {gyms.map(gym => (
                    <option key={gym._id} value={gym._id}>
                      {gym.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Status Filter */}
              <div>
                <label className="block text-xs md:text-sm text-gray-400 mb-1 md:mb-2">Filter by Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 md:px-4 md:py-3 focus:outline-none focus:border-red-500 text-sm md:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              
              {/* Sort By */}
              <div>
                <label className="block text-xs md:text-sm text-gray-400 mb-1 md:mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 md:px-4 md:py-3 focus:outline-none focus:border-red-500 text-sm md:text-base"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="active-first">Active First</option>
                </select>
              </div>
            </div>
            
            {/* Filter Results Count */}
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-xs md:text-sm text-gray-400">
                Showing <span className="text-white font-semibold">{filteredMembers.length}</span> of <span className="text-white font-semibold">{members.length}</span> members
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Members List - Mobile Optimized */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="p-6 text-center">
            <Users className="w-10 h-10 md:w-12 md:h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">No members found</h3>
            <p className="text-gray-400 text-sm md:text-base">
              {searchTerm || selectedGym !== 'all' || selectedStatus !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'No members available'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {/* Mobile Card View */}
            <div className="md:hidden">
              {filteredMembers.map((member) => (
                <div 
                  key={member._id} 
                  className="p-4 hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {member.profile?.firstName} {member.profile?.lastName}
                        </p>
                        <p className="text-xs text-gray-400">ID: {member._id.slice(-6)}</p>
                      </div>
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full border ${getStatusColor(member.status)}`}>
                      {getStatusIcon(member.status)}
                      <span className="ml-1 text-xs font-medium capitalize">
                        {member.status.charAt(0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-sm">
                      <Mail className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                      <span>{member.profile?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Building className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{member.gymId?.name || 'Unknown Gym'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                    <div className="text-xs text-gray-400">
                      Joined: {new Date(member.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(member)}
                        className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditMember(member._id)}
                        className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-blue-400" />
                      </button>
                      <div className="relative group">
                        <button className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                          <div className="py-1">
                            <button
                              onClick={() => handleStatusChange(member._id, 'active')}
                              className="w-full text-left px-3 py-2 hover:bg-gray-700 text-xs flex items-center"
                            >
                              <UserCheck className="w-3 h-3 mr-2 text-green-400" />
                              Set Active
                            </button>
                            <button
                              onClick={() => handleStatusChange(member._id, 'inactive')}
                              className="w-full text-left px-3 py-2 hover:bg-gray-700 text-xs flex items-center"
                            >
                              <UserX className="w-3 h-3 mr-2 text-gray-400" />
                              Set Inactive
                            </button>
                            <button
                              onClick={() => handleStatusChange(member._id, 'suspended')}
                              className="w-full text-left px-3 py-2 hover:bg-gray-700 text-xs flex items-center"
                            >
                              <XCircle className="w-3 h-3 mr-2 text-red-400" />
                              Suspend
                            </button>
                            <div className="border-t border-gray-700 my-1"></div>
                            <button
                              onClick={() => handleDeleteMember(member._id)}
                              className="w-full text-left px-3 py-2 hover:bg-red-600/20 text-xs flex items-center text-red-400"
                            >
                              <Trash2 className="w-3 h-3 mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Member</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Contact</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Gym</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Membership</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Joined</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr 
                      key={member._id} 
                      className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {member.profile?.firstName} {member.profile?.lastName}
                            </p>
                            <p className="text-xs text-gray-400">ID: {member._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="w-3 h-3 mr-2 text-gray-400" />
                            {member.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="w-3 h-3 mr-2 text-gray-400" />
                            {member.profile?.phone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm">{member.gymId?.name || 'Unknown Gym'}</span>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full border ${getStatusColor(member.status)}`}>
                          {getStatusIcon(member.status)}
                          <span className="ml-2 text-xs font-medium capitalize">
                            {member.status}
                          </span>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        {member.membership?.planName ? (
                          <div>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full border ${getMembershipStatusColor(member.membership?.status)} mb-1`}>
                              <span className="text-xs font-medium capitalize">
                                {member.membership?.status || 'N/A'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">{member.membership.planName}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No Membership</span>
                        )}
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(member)}
                            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditMember(member._id)}
                            className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>
                          <div className="relative group">
                            <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                              <div className="py-1">
                                <button
                                  onClick={() => handleStatusChange(member._id, 'active')}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center"
                                >
                                  <UserCheck className="w-3 h-3 mr-2 text-green-400" />
                                  Set Active
                                </button>
                                <button
                                  onClick={() => handleStatusChange(member._id, 'inactive')}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center"
                                >
                                  <UserX className="w-3 h-3 mr-2 text-gray-400" />
                                  Set Inactive
                                </button>
                                <button
                                  onClick={() => handleStatusChange(member._id, 'suspended')}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center"
                                >
                                  <XCircle className="w-3 h-3 mr-2 text-red-400" />
                                  Suspend
                                </button>
                                <div className="border-t border-gray-700 my-1"></div>
                                <button
                                  onClick={() => handleDeleteMember(member._id)}
                                  className="w-full text-left px-4 py-2 hover:bg-red-600/20 text-sm flex items-center text-red-400"
                                >
                                  <Trash2 className="w-3 h-3 mr-2" />
                                  Delete Member
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Member Details Modal */}
      {showDetailsModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-800 rounded-lg md:rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 md:p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                  <h2 className="text-lg md:text-xl font-bold">Member Details</h2>
                  <p className="text-gray-400 text-sm">Complete information about the member</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4 md:space-y-6">
                  {/* Personal Information */}
                  <div className="bg-gray-900 rounded-lg border border-gray-700 p-3 md:p-4">
                    <h3 className="font-semibold mb-3 md:mb-4 flex items-center text-sm md:text-base">
                      <User className="w-4 h-4 md:w-5 md:h-5 mr-2 text-red-400" />
                      Personal Information
                    </h3>
                    <div className="space-y-2 md:space-y-3">
                      <div>
                        <label className="text-xs md:text-sm text-gray-400">Full Name</label>
                        <p className="font-semibold text-sm md:text-base">
                          {selectedMember.profile?.firstName} {selectedMember.profile?.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs md:text-sm text-gray-400">Email</label>
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 md:w-4 md:h-4 mr-2 text-gray-400" />
                          <p className="text-sm md:text-base">{selectedMember.email}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs md:text-sm text-gray-400">Phone</label>
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 md:w-4 md:h-4 mr-2 text-gray-400" />
                          <p className="text-sm md:text-base">{selectedMember.profile?.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs md:text-sm text-gray-400">Date of Birth</label>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-2 text-gray-400" />
                          <p className="text-sm md:text-base">
                            {selectedMember.profile?.dateOfBirth 
                              ? new Date(selectedMember.profile.dateOfBirth).toLocaleDateString()
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Health Metrics */}
                  {selectedMember.healthMetrics && (
                    <div className="bg-gray-900 rounded-lg border border-gray-700 p-3 md:p-4">
                      <h3 className="font-semibold mb-3 md:mb-4 flex items-center text-sm md:text-base">
                        <Target className="w-4 h-4 md:w-5 md:h-5 mr-2 text-red-400" />
                        Health Metrics
                      </h3>
                      <div className="space-y-2 md:space-y-3">
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                          <div>
                            <label className="text-xs md:text-sm text-gray-400">Height</label>
                            <p className="font-semibold text-sm md:text-base">
                              {selectedMember.healthMetrics.height 
                                ? `${selectedMember.healthMetrics.height} cm`
                                : 'N/A'
                              }
                            </p>
                          </div>
                          <div>
                            <label className="text-xs md:text-sm text-gray-400">Weight</label>
                            <p className="font-semibold text-sm md:text-base">
                              {selectedMember.healthMetrics.weight 
                                ? `${selectedMember.healthMetrics.weight} kg`
                                : 'N/A'
                              }
                            </p>
                          </div>
                        </div>
                        {selectedMember.healthMetrics.fitnessGoals?.length > 0 && (
                          <div>
                            <label className="text-xs md:text-sm text-gray-400">Fitness Goals</label>
                            <div className="flex flex-wrap gap-1 md:gap-2 mt-2">
                              {selectedMember.healthMetrics.fitnessGoals.map((goal, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-800 rounded-full text-xs"
                                >
                                  {goal}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Right Column - Membership Info */}
                <div className="space-y-4 md:space-y-6">
                  {/* Gym & Membership */}
                  <div className="bg-gray-900 rounded-lg border border-gray-700 p-3 md:p-4">
                    <h3 className="font-semibold mb-3 md:mb-4 flex items-center text-sm md:text-base">
                      <Building className="w-4 h-4 md:w-5 md:h-5 mr-2 text-red-400" />
                      Gym & Membership
                    </h3>
                    <div className="space-y-2 md:space-y-3">
                      <div>
                        <label className="text-xs md:text-sm text-gray-400">Gym</label>
                        <p className="font-semibold text-sm md:text-base">{selectedMember.gymId?.name || 'N/A'}</p>
                      </div>
                      {selectedMember.membership?.planName && (
                        <>
                          <div>
                            <label className="text-xs md:text-sm text-gray-400">Membership Plan</label>
                            <p className="font-semibold text-sm md:text-base">{selectedMember.membership.planName}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <div>
                              <label className="text-xs md:text-sm text-gray-400">Start Date</label>
                              <p className="text-sm md:text-base">
                                {selectedMember.membership.startDate 
                                  ? new Date(selectedMember.membership.startDate).toLocaleDateString()
                                  : 'N/A'
                                }
                              </p>
                            </div>
                            <div>
                              <label className="text-xs md:text-sm text-gray-400">End Date</label>
                              <p className="text-sm md:text-base">
                                {selectedMember.membership.endDate 
                                  ? new Date(selectedMember.membership.endDate).toLocaleDateString()
                                  : 'N/A'
                                }
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                      <div>
                        <label className="text-xs md:text-sm text-gray-400">Account Status</label>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full border ${getStatusColor(selectedMember.status)} mt-1`}>
                          {getStatusIcon(selectedMember.status)}
                          <span className="ml-2 text-xs font-medium capitalize">
                            {selectedMember.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Address */}
                  {selectedMember.profile?.address && (
                    <div className="bg-gray-900 rounded-lg border border-gray-700 p-3 md:p-4">
                      <h3 className="font-semibold mb-3 md:mb-4 flex items-center text-sm md:text-base">
                        <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2 text-red-400" />
                        Address
                      </h3>
                      <div className="space-y-1 md:space-y-2">
                        {selectedMember.profile.address.street && (
                          <p className="text-sm md:text-base">{selectedMember.profile.address.street}</p>
                        )}
                        <div className="flex flex-wrap gap-1 md:gap-2">
                          {selectedMember.profile.address.city && (
                            <span className="text-xs md:text-sm">{selectedMember.profile.address.city}</span>
                          )}
                          {selectedMember.profile.address.state && (
                            <span className="text-xs md:text-sm">{selectedMember.profile.address.state}</span>
                          )}
                          {selectedMember.profile.address.zipCode && (
                            <span className="text-xs md:text-sm">{selectedMember.profile.address.zipCode}</span>
                          )}
                        </div>
                        {selectedMember.profile.address.country && (
                          <p className="text-xs md:text-sm">{selectedMember.profile.address.country}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Emergency Contact */}
                  {selectedMember.profile?.emergencyContact && (
                    <div className="bg-gray-900 rounded-lg border border-gray-700 p-3 md:p-4">
                      <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Emergency Contact</h3>
                      <p className="text-sm md:text-base">{selectedMember.profile.emergencyContact}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-700 flex justify-end space-x-3 md:space-x-4">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 md:px-6 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-sm md:text-base"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleEditMember(selectedMember._id);
                    setShowDetailsModal(false);
                  }}
                  className="px-4 md:px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg hover:opacity-90 transition-opacity text-sm md:text-base"
                >
                  <Edit className="w-4 h-4 inline mr-2" />
                  Edit Member
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;