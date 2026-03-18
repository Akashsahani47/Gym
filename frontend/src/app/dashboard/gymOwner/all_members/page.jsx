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
  XCircle,
  User
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

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

  const exportToExcel = () => {
    if (members.length === 0) {
      toast.error('No members to export');
      return;
    }
    const headers = ['Name', 'Email', 'Phone', 'Gym', 'Status', 'Membership Status', 'Plan Name', 'Start Date', 'End Date', 'Height', 'Weight', 'Joined Date'];
    const rows = members.map(member => [
      `${member.profile?.firstName || ''} ${member.profile?.lastName || ''}`.trim() || 'N/A',
      member.email || 'N/A',
      member.profile?.phone || 'N/A',
      member.gymId?.name || 'N/A',
      member.status || 'N/A',
      member.membership?.status || 'N/A',
      member.membership?.planName || 'N/A',
      member.membership?.startDate ? new Date(member.membership.startDate).toLocaleDateString() : 'N/A',
      member.membership?.endDate ? new Date(member.membership.endDate).toLocaleDateString() : 'N/A',
      member.healthMetrics?.height ?? 'N/A',
      member.healthMetrics?.weight ?? 'N/A',
      member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'
    ]);
    const sheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
    const fileName = `members-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success(`Exported ${members.length} member(s) to ${fileName}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-accent/20 text-accent border-accent/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'inactive': return 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10';
      case 'suspended': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10';
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
      case 'active': return 'bg-accent/20 text-accent border-accent/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled': return 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10';
      default: return 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 dark:border-white/10 border-t-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white p-3 md:p-6">
      {/* Header - Mobile Optimized */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-bold">
              <span className="text-gray-900 dark:text-white">Member </span><span className="text-accent">Management</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Manage and view all your gym members</p>
          </div>
          <div className="flex items-center gap-2 mt-3 md:mt-0">
            <button
              onClick={exportToExcel}
              className="px-3 py-2 md:px-4 md:py-2 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-accent/10 hover:border-accent/30 transition-colors flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-accent"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Export</span>
            </button>
            <button
              onClick={fetchData}
              className="px-3 py-2 md:px-4 md:py-2 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-accent/10 hover:border-accent/30 transition-colors flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-accent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-3 hover:border-accent/20 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs md:text-sm">Total</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="p-2 bg-accent/20 rounded-xl border border-accent/30">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-accent" />
            </div>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-3 hover:border-accent/20 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs md:text-sm">Active</p>
              <p className="text-lg md:text-2xl font-bold text-accent">{stats.active}</p>
            </div>
            <div className="p-2 bg-accent/20 rounded-xl border border-accent/30">
              <UserCheck className="w-5 h-5 md:w-6 md:h-6 text-accent" />
            </div>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-3 hover:border-accent/20 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs md:text-sm">Pending</p>
              <p className="text-lg md:text-2xl font-bold text-amber-400">{stats.pending}</p>
            </div>
            <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-3 hover:border-accent/20 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs md:text-sm">Inactive</p>
              <p className="text-lg md:text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.inactive}</p>
            </div>
            <div className="p-2 bg-gray-200 dark:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10">
              <UserX className="w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-3 col-span-2 sm:col-span-1 hover:border-accent/20 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs md:text-sm">Suspended</p>
              <p className="text-lg md:text-2xl font-bold text-red-400">{stats.suspended}</p>
            </div>
            <div className="p-2 bg-red-500/20 rounded-xl border border-red-500/30">
              <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters - Mobile Optimized */}
      <div className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-3 mb-6">
        <div className="flex flex-col gap-3">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 md:w-5 md:h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-10 md:pl-10 md:pr-10 py-2 md:py-3 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 text-sm md:text-base placeholder-gray-500 text-gray-900 dark:text-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 md:top-3 text-gray-600 dark:text-gray-400 hover:text-accent"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 md:px-4 md:py-3 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-accent/10 hover:border-accent/30 transition-colors flex items-center justify-center text-sm text-gray-700 dark:text-gray-300 hover:text-accent"
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
            className="mt-3 pt-3 border-t border-gray-300 dark:border-white/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Gym Filter */}
              <div>
                <label className="block text-xs md:text-sm text-gray-500 mb-1 md:mb-2">Filter by Gym</label>
                <select
                  value={selectedGym}
                  onChange={(e) => setSelectedGym(e.target.value)}
                  className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 md:px-4 md:py-3 focus:outline-none focus:border-accent text-sm md:text-base"
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
                <label className="block text-xs md:text-sm text-gray-500 mb-1 md:mb-2">Filter by Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 md:px-4 md:py-3 focus:outline-none focus:border-accent text-sm md:text-base"
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
                <label className="block text-xs md:text-sm text-gray-500 mb-1 md:mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 md:px-4 md:py-3 focus:outline-none focus:border-accent text-sm md:text-base"
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
            <div className="mt-3 pt-3 border-t border-gray-300 dark:border-white/10">
              <p className="text-xs md:text-sm text-gray-500">
                Showing <span className="text-accent font-semibold">{filteredMembers.length}</span> of <span className="text-gray-900 dark:text-white font-semibold">{members.length}</span> members
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Members List - Mobile Optimized */}
      <div className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="p-6 text-center">
            <Users className="w-10 h-10 md:w-12 md:h-12 text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900 dark:text-white">No members found</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
              {searchTerm || selectedGym !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'No members available'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-300 dark:divide-white/10">
            {/* Mobile Card View */}
            <div className="md:hidden">
              {filteredMembers.map((member) => (
                <div
                  key={member._id}
                  className="p-4 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {member.profile?.firstName} {member.profile?.lastName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">ID: {member._id.slice(-6)}</p>
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
                      <Mail className="w-3 h-3 mr-2 text-gray-600 dark:text-gray-400 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="w-3 h-3 mr-2 text-gray-600 dark:text-gray-400 shrink-0" />
                      <span>{member.profile?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Building className="w-3 h-3 mr-2 text-gray-600 dark:text-gray-400 shrink-0" />
                      <span className="truncate">{member.gymId?.name || 'Unknown Gym'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-300 dark:border-white/10">
                    <div className="text-xs text-gray-500">
                      Joined: {new Date(member.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(member)}
                        className="p-1.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-accent/10 border border-gray-200 dark:border-white/10 hover:border-accent/30 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-700 dark:text-gray-300 hover:text-accent" />
                      </button>
                      <button
                        onClick={() => handleEditMember(member._id)}
                        className="p-1.5 rounded-xl bg-accent/10 hover:bg-accent/20 border border-accent/30 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-accent" />
                      </button>
                      <div className="relative group">
                        <button className="p-1.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-accent/10 border border-gray-200 dark:border-white/10 hover:border-accent/30 transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-700 dark:text-gray-300 hover:text-accent" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                          <div className="py-1">
                            <button
                              onClick={() => handleStatusChange(member._id, 'active')}
                              className="w-full text-left px-3 py-2 hover:bg-accent/10 text-xs flex items-center text-gray-700 dark:text-gray-300 hover:text-accent"
                            >
                              <UserCheck className="w-3 h-3 mr-2 text-accent" />
                              Set Active
                            </button>
                            <button
                              onClick={() => handleStatusChange(member._id, 'inactive')}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/5 text-xs flex items-center text-gray-700 dark:text-gray-300"
                            >
                              <UserX className="w-3 h-3 mr-2 text-gray-600 dark:text-gray-400" />
                              Set Inactive
                            </button>
                            <button
                              onClick={() => handleStatusChange(member._id, 'suspended')}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/5 text-xs flex items-center text-gray-700 dark:text-gray-300"
                            >
                              <XCircle className="w-3 h-3 mr-2 text-red-400" />
                              Suspend
                            </button>
                            <div className="border-t border-gray-200 dark:border-white/10 my-1"></div>
                            <button
                              onClick={() => handleDeleteMember(member._id)}
                              className="w-full text-left px-3 py-2 hover:bg-red-500/20 text-xs flex items-center text-red-400"
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
                  <tr className="border-b border-gray-300 dark:border-white/10">
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Member</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Contact</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Gym</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Membership</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Joined</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr
                      key={member._id}
                      className="border-b border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {member.profile?.firstName} {member.profile?.lastName}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">ID: {member._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="w-3 h-3 mr-2 text-gray-600 dark:text-gray-400" />
                            {member.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="w-3 h-3 mr-2 text-gray-600 dark:text-gray-400" />
                            {member.profile?.phone || 'N/A'}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
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
                            <p className="text-xs text-gray-600 dark:text-gray-400">{member.membership.planName}</p>
                          </div>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400 text-sm">No Membership</span>
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
                            className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-accent/10 border border-gray-200 dark:border-white/10 hover:border-accent/30 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-700 dark:text-gray-300 hover:text-accent" />
                          </button>
                          <button
                            onClick={() => handleEditMember(member._id)}
                            className="p-2 rounded-xl bg-accent/10 hover:bg-accent/20 border border-accent/30 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-accent" />
                          </button>
                          <div className="relative group">
                            <button className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-accent/10 border border-gray-200 dark:border-white/10 hover:border-accent/30 transition-colors">
                              <MoreVertical className="w-4 h-4 text-gray-700 dark:text-gray-300 hover:text-accent" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                              <div className="py-1">
                                <button
                                  onClick={() => handleStatusChange(member._id, 'active')}
                                  className="w-full text-left px-4 py-2 hover:bg-accent/10 text-sm flex items-center text-gray-700 dark:text-gray-300 hover:text-accent"
                                >
                                  <UserCheck className="w-3 h-3 mr-2 text-accent" />
                                  Set Active
                                </button>
                                <button
                                  onClick={() => handleStatusChange(member._id, 'inactive')}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 text-sm flex items-center text-gray-700 dark:text-gray-300"
                                >
                                  <UserX className="w-3 h-3 mr-2 text-gray-600 dark:text-gray-400" />
                                  Set Inactive
                                </button>
                                <button
                                  onClick={() => handleStatusChange(member._id, 'suspended')}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 text-sm flex items-center text-gray-700 dark:text-gray-300"
                                >
                                  <XCircle className="w-3 h-3 mr-2 text-red-400" />
                                  Suspend
                                </button>
                                <div className="border-t border-gray-200 dark:border-white/10 my-1"></div>
                                <button
                                  onClick={() => handleDeleteMember(member._id)}
                                  className="w-full text-left px-4 py-2 hover:bg-red-500/20 text-sm flex items-center text-red-400"
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3 md:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-50 dark:bg-[#0f0f0f] rounded-xl border border-gray-200 dark:border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-4 md:p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Member <span className="text-accent">Details</span></h2>
                  <p className="text-gray-500 text-sm">Complete information about the member</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 hover:border-accent/30 border border-transparent transition-colors text-gray-600 dark:text-gray-400 hover:text-accent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4 md:space-y-6">
                  {/* Personal Information */}
                  <div className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-3 md:p-4">
                    <h3 className="font-semibold mb-3 md:mb-4 flex items-center text-sm md:text-base text-gray-900 dark:text-white">
                      <User className="w-4 h-4 md:w-5 md:h-5 mr-2 text-accent" />
                      Personal Information
                    </h3>
                    <div className="space-y-2 md:space-y-3">
                      <div>
                        <label className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Full Name</label>
                        <p className="font-semibold text-sm md:text-base">
                          {selectedMember.profile?.firstName} {selectedMember.profile?.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Email</label>
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 md:w-4 md:h-4 mr-2 text-gray-600 dark:text-gray-400" />
                          <p className="text-sm md:text-base">{selectedMember.email}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Phone</label>
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 md:w-4 md:h-4 mr-2 text-gray-600 dark:text-gray-400" />
                          <p className="text-sm md:text-base">{selectedMember.profile?.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Date of Birth</label>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-2 text-gray-600 dark:text-gray-400" />
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
                    <div className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-3 md:p-4">
                      <h3 className="font-semibold mb-3 md:mb-4 flex items-center text-sm md:text-base text-gray-900 dark:text-white">
                        <Target className="w-4 h-4 md:w-5 md:h-5 mr-2 text-accent" />
                        Health Metrics
                      </h3>
                      <div className="space-y-2 md:space-y-3">
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                          <div>
                            <label className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Height</label>
                            <p className="font-semibold text-sm md:text-base">
                              {selectedMember.healthMetrics.height
                                ? `${selectedMember.healthMetrics.height} cm`
                                : 'N/A'
                              }
                            </p>
                          </div>
                          <div>
                            <label className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Weight</label>
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
                            <label className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Fitness Goals</label>
                            <div className="flex flex-wrap gap-1 md:gap-2 mt-2">
                              {selectedMember.healthMetrics.fitnessGoals.map((goal, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-accent/10 border border-accent/30 rounded-full text-xs text-accent"
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
                  <div className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-3 md:p-4">
                    <h3 className="font-semibold mb-3 md:mb-4 flex items-center text-sm md:text-base text-gray-900 dark:text-white">
                      <Building className="w-4 h-4 md:w-5 md:h-5 mr-2 text-accent" />
                      Gym & Membership
                    </h3>
                    <div className="space-y-2 md:space-y-3">
                      <div>
                        <label className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Gym</label>
                        <p className="font-semibold text-sm md:text-base">{selectedMember.gymId?.name || 'N/A'}</p>
                      </div>
                      {selectedMember.membership?.planName && (
                        <>
                          <div>
                            <label className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Membership Plan</label>
                            <p className="font-semibold text-sm md:text-base">{selectedMember.membership.planName}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <div>
                              <label className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Start Date</label>
                              <p className="text-sm md:text-base">
                                {selectedMember.membership.startDate
                                  ? new Date(selectedMember.membership.startDate).toLocaleDateString()
                                  : 'N/A'
                                }
                              </p>
                            </div>
                            <div>
                              <label className="text-xs md:text-sm text-gray-600 dark:text-gray-400">End Date</label>
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
                        <label className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Account Status</label>
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
                    <div className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-3 md:p-4">
                      <h3 className="font-semibold mb-3 md:mb-4 flex items-center text-sm md:text-base text-gray-900 dark:text-white">
                        <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2 text-accent" />
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
                    <div className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-3 md:p-4">
                      <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base text-gray-900 dark:text-white">Emergency Contact</h3>
                      <p className="text-sm md:text-base">{selectedMember.profile.emergencyContact}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-300 dark:border-white/10 flex justify-end space-x-3 md:space-x-4">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 md:px-6 py-2 border border-gray-300 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 hover:border-accent/30 text-gray-700 dark:text-gray-300 hover:text-accent transition-colors text-sm md:text-base"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleEditMember(selectedMember._id);
                    setShowDetailsModal(false);
                  }}
                  className="px-4 md:px-6 py-2 bg-accent text-black rounded-xl font-semibold hover:bg-accent-hover transition-colors text-sm md:text-base"
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
