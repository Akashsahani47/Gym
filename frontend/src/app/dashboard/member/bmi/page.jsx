'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Scale,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Activity,
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

const BMI_RANGES = [
  { label: 'Underweight', min: 0, max: 18.5, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { label: 'Normal', min: 18.5, max: 25, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
  { label: 'Overweight', min: 25, max: 30, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { label: 'Obese', min: 30, max: 100, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
];

const getBmiRange = (bmi) => BMI_RANGES.find((r) => bmi >= r.min && bmi < r.max) || BMI_RANGES[3];

export default function BMIPage() {
  const { token } = useUserStore();
  const [logs, setLogs] = useState([]);
  const [latest, setLatest] = useState(null);
  const [bmiCategory, setBmiCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');

  useEffect(() => {
    if (!token) return;
    fetchLogs();
  }, [token]);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API}/api/workouts/body/history?months=12`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setLatest(data.latest);
        setBmiCategory(data.bmiCategory);
        if (data.latest) {
          setHeight(data.latest.height || '');
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!weight) {
      toast.error('Weight is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/workouts/body`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          weight: parseFloat(weight),
          height: height ? parseFloat(height) : undefined,
          bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Body log saved!');
        setWeight('');
        setBodyFat('');
        fetchLogs();
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (date) => {
    try {
      await fetch(`${API}/api/workouts/body/${date}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLogs();
      toast.success('Entry deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  // Calculate live BMI
  const liveBmi =
    weight && height
      ? parseFloat((parseFloat(weight) / ((parseFloat(height) / 100) ** 2)).toFixed(1))
      : null;

  const liveRange = liveBmi ? getBmiRange(liveBmi) : null;

  // Weight trend
  const weightChange =
    logs.length >= 2
      ? (logs[logs.length - 1].weight - logs[logs.length - 2].weight).toFixed(1)
      : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold">
            <span className="text-white">BMI & </span>
            <span className="text-accent">Body Tracker</span>
          </h1>
          <p className="text-gray-400 text-sm">Track your weight, BMI, and body composition over time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input + Current BMI */}
          <div className="space-y-4">
            {/* Current BMI Card */}
            {latest?.bmi && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${getBmiRange(latest.bmi).bg} border ${getBmiRange(latest.bmi).border} rounded-2xl p-6 text-center`}
              >
                <Activity className={`w-8 h-8 ${getBmiRange(latest.bmi).color} mx-auto mb-2`} />
                <p className="text-4xl font-bold text-white mb-1">{latest.bmi}</p>
                <p className={`text-sm font-medium ${getBmiRange(latest.bmi).color}`}>{bmiCategory}</p>
                <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-400">
                  <span>{latest.weight} kg</span>
                  <span>{latest.height} cm</span>
                  {latest.bodyFat && <span>{latest.bodyFat}% fat</span>}
                </div>
                {weightChange && (
                  <div className="flex items-center justify-center gap-1 mt-2 text-xs">
                    {parseFloat(weightChange) > 0 ? (
                      <TrendingUp className="w-3 h-3 text-red-400" />
                    ) : parseFloat(weightChange) < 0 ? (
                      <TrendingDown className="w-3 h-3 text-accent" />
                    ) : (
                      <Minus className="w-3 h-3 text-gray-500" />
                    )}
                    <span className={parseFloat(weightChange) > 0 ? 'text-red-400' : parseFloat(weightChange) < 0 ? 'text-accent' : 'text-gray-500'}>
                      {weightChange > 0 ? '+' : ''}{weightChange} kg from last entry
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* BMI Scale */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">BMI Scale</p>
              <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-2">
                <div className="flex-1 bg-blue-500/40" />
                <div className="flex-[1.5] bg-accent/40" />
                <div className="flex-1 bg-orange-500/40" />
                <div className="flex-1 bg-red-500/40" />
              </div>
              <div className="flex text-[10px] text-gray-500">
                <span className="flex-1">{'<18.5'}</span>
                <span className="flex-[1.5] text-center">18.5-25</span>
                <span className="flex-1 text-center">25-30</span>
                <span className="flex-1 text-right">{'30+'}</span>
              </div>
              <div className="flex text-[10px] text-gray-600 mt-0.5">
                <span className="flex-1">Under</span>
                <span className="flex-[1.5] text-center text-accent">Normal</span>
                <span className="flex-1 text-center">Over</span>
                <span className="flex-1 text-right">Obese</span>
              </div>
            </div>

            {/* Log New Entry */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-accent" />
                Log Today
              </h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Weight (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="70"
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="170"
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Body Fat % (optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    placeholder="15"
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Live BMI preview */}
                {liveBmi && (
                  <div className={`text-center py-2 rounded-lg ${liveRange.bg} border ${liveRange.border}`}>
                    <span className="text-sm">BMI: <strong className={liveRange.color}>{liveBmi}</strong></span>
                    <span className={`text-xs ml-2 ${liveRange.color}`}>({liveRange.label})</span>
                  </div>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving || !weight}
                  className="w-full py-2.5 bg-accent text-black font-semibold rounded-lg hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
                  Save Entry
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right: History */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              History ({logs.length} entries)
            </h2>
            {logs.length === 0 ? (
              <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                <Scale className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No entries yet. Log your first measurement!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {[...logs].reverse().map((log) => {
                  const range = log.bmi ? getBmiRange(log.bmi) : null;
                  return (
                    <div
                      key={log.date}
                      className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${range ? range.bg : 'bg-white/5'} ${range ? range.border : 'border-white/10'} border flex items-center justify-center`}>
                          <Scale className={`w-4 h-4 ${range ? range.color : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{log.weight} kg</span>
                            {log.bmi && (
                              <span className={`text-xs ${range?.color}`}>BMI {log.bmi}</span>
                            )}
                            {log.bodyFat && (
                              <span className="text-xs text-gray-500">{log.bodyFat}% fat</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">
                            {new Date(log.date + 'T00:00:00').toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(log.date)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
