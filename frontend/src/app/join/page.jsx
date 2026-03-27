'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Users,
  Dumbbell,
  ArrowRight,
  Loader2,
  X,
  Crown,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function JoinPage() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchGyms = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('q', debouncedSearch);

      const res = await fetch(`${API}/api/public/gyms?${params}`);
      const data = await res.json();
      if (data.success) {
        setGyms(data.gyms || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchGyms();
  }, [fetchGyms]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Hero / Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-emerald-500/5" />
        <div className="relative max-w-5xl mx-auto px-4 pt-12 pb-8 sm:pt-16 sm:pb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-5">
              <Dumbbell size={28} className="text-accent" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Find Your Gym
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-lg mx-auto mb-8">
              Browse gyms near you, compare plans and pricing, and register as a member
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by gym name, city, or state..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all shadow-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading
              ? 'Searching...'
              : `${gyms.length} ${gyms.length === 1 ? 'gym' : 'gyms'} found`}
          </p>
          <Link
            href="/loginpage"
            className="text-sm text-accent hover:underline font-medium"
          >
            Already a member? Login
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-2 border-gray-200 dark:border-white/10 border-t-accent rounded-full"
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && gyms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Dumbbell size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No gyms found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {search
                ? 'Try a different search term or browse all gyms'
                : 'No gyms are currently accepting registrations'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-sm text-accent hover:underline font-medium"
              >
                Clear search
              </button>
            )}
          </motion.div>
        )}

        {/* Gym Cards Grid */}
        {!loading && gyms.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {gyms.map((gym, idx) => (
                <motion.div
                  key={gym.slug}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                >
                  <Link href={`/join/${gym.slug}`} className="block group">
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                          <Dumbbell size={20} className="text-accent" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-accent transition-colors">
                            {gym.name}
                          </h3>
                          {(gym.address?.city || gym.address?.state) && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin size={12} className="text-gray-400 shrink-0" />
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {[gym.address.city, gym.address.state]
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {gym.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                          {gym.description}
                        </p>
                      )}

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Users size={13} className="text-gray-400" />
                          <span>{gym.totalMembers} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Crown size={13} className="text-gray-400" />
                          <span>{gym.plansCount} plans</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                        {gym.startingPrice > 0 ? (
                          <p className="text-sm">
                            <span className="text-gray-400 text-xs">from </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              Rs.{gym.startingPrice}
                            </span>
                            <span className="text-gray-400 text-xs">/month</span>
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">Contact for pricing</p>
                        )}
                        <span className="flex items-center gap-1 text-xs font-medium text-accent group-hover:gap-2 transition-all">
                          Join
                          <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
