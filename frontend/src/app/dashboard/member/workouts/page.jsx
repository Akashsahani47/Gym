'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  Plus,
  Trash2,
  Save,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  X,
  Loader2,
  SmilePlus,
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { toast } from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

const MUSCLE_GROUPS = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'legs', label: 'Legs' },
  { value: 'core', label: 'Core' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'other', label: 'Other' },
];

const MOODS = [
  { value: 'great', label: 'Great', emoji: '🔥' },
  { value: 'good', label: 'Good', emoji: '💪' },
  { value: 'okay', label: 'Okay', emoji: '👍' },
  { value: 'tired', label: 'Tired', emoji: '😮‍💨' },
  { value: 'bad', label: 'Bad', emoji: '😞' },
];

export default function WorkoutsPage() {
  const { token } = useUserStore();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState([]);
  const [durationMinutes, setDurationMinutes] = useState('');
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  // Fetch workout for current date
  useEffect(() => {
    if (!token) return;
    const fetchWorkout = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/workouts/${date}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.workout) {
          setExercises(data.workout.exercises || []);
          setDurationMinutes(data.workout.durationMinutes || '');
          setMood(data.workout.mood || '');
          setNotes(data.workout.notes || '');
          setHasExisting(true);
        } else {
          setExercises([]);
          setDurationMinutes('');
          setMood('');
          setNotes('');
          setHasExisting(false);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchWorkout();
  }, [token, date]);

  const changeDate = (offset) => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    const newDate = d.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    if (newDate <= today) setDate(newDate);
  };

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      { name: '', muscleGroup: 'other', sets: [{ reps: 0, weight: 0 }], notes: '' },
    ]);
  };

  const removeExercise = (idx) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateExercise = (idx, field, value) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex))
    );
  };

  const addSet = (exIdx) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx ? { ...ex, sets: [...ex.sets, { reps: 0, weight: 0 }] } : ex
      )
    );
  };

  const removeSet = (exIdx, setIdx) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) } : ex
      )
    );
  };

  const updateSet = (exIdx, setIdx, field, value) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? {
              ...ex,
              sets: ex.sets.map((s, si) =>
                si === setIdx ? { ...s, [field]: parseFloat(value) || 0 } : s
              ),
            }
          : ex
      )
    );
  };

  const handleSave = async () => {
    if (exercises.length === 0) {
      toast.error('Add at least one exercise');
      return;
    }

    const validExercises = exercises.filter((ex) => ex.name.trim());
    if (validExercises.length === 0) {
      toast.error('Enter exercise names');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date,
          exercises: validExercises,
          durationMinutes: parseInt(durationMinutes) || 0,
          mood: mood || undefined,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(hasExisting ? 'Workout updated!' : 'Workout logged!');
        setHasExisting(true);
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const isToday = date === today;

  const formatDate = (d) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalVolume = exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0),
    0
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold">
            <span className="text-white">Workout </span>
            <span className="text-accent">Logger</span>
          </h1>
          <p className="text-gray-400 text-sm">Track your exercises, sets, and reps</p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6">
          <button onClick={() => changeDate(-1)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-sm font-medium">{isToday ? "Today" : formatDate(date)}</p>
            {isToday && <p className="text-xs text-gray-500">{formatDate(date)}</p>}
          </div>
          <button
            onClick={() => changeDate(1)}
            disabled={isToday}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-accent" />
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            {exercises.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <Dumbbell className="w-4 h-4 text-accent mx-auto mb-1" />
                  <p className="text-lg font-bold">{exercises.length}</p>
                  <p className="text-xs text-gray-500">Exercises</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                  <p className="text-lg font-bold">{totalSets}</p>
                  <p className="text-xs text-gray-500">Sets</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <p className="text-lg font-bold">{totalVolume > 0 ? `${(totalVolume / 1000).toFixed(1)}k` : '0'}</p>
                  <p className="text-xs text-gray-500">Volume (kg)</p>
                </div>
              </div>
            )}

            {/* Exercises */}
            <div className="space-y-4 mb-6">
              <AnimatePresence>
                {exercises.map((ex, exIdx) => (
                  <motion.div
                    key={exIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    {/* Exercise Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={ex.name}
                          onChange={(e) => updateExercise(exIdx, 'name', e.target.value)}
                          placeholder="Exercise name (e.g. Bench Press)"
                          className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-accent"
                        />
                        <select
                          value={ex.muscleGroup}
                          onChange={(e) => updateExercise(exIdx, 'muscleGroup', e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                        >
                          {MUSCLE_GROUPS.map((mg) => (
                            <option key={mg.value} value={mg.value}>{mg.label}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => removeExercise(exIdx)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sets */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 text-xs text-gray-500 px-1">
                        <span>Set</span>
                        <span>Reps</span>
                        <span>Weight (kg)</span>
                        <span></span>
                      </div>
                      {ex.sets.map((set, setIdx) => (
                        <div key={setIdx} className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 items-center">
                          <span className="text-xs text-gray-500 text-center">{setIdx + 1}</span>
                          <input
                            type="number"
                            min="0"
                            value={set.reps || ''}
                            onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                            placeholder="0"
                            className="bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-center focus:outline-none focus:border-accent"
                          />
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={set.weight || ''}
                            onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                            placeholder="0"
                            className="bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-center focus:outline-none focus:border-accent"
                          />
                          <button
                            onClick={() => removeSet(exIdx, setIdx)}
                            className="p-1 rounded hover:bg-white/10 text-gray-600 hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addSet(exIdx)}
                        className="w-full py-1.5 text-xs text-accent hover:bg-accent/5 border border-dashed border-white/10 rounded-lg transition-colors"
                      >
                        + Add Set
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add Exercise Button */}
            <button
              onClick={addExercise}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent/10 hover:bg-accent/15 border border-accent/20 rounded-xl text-accent text-sm font-medium transition-colors mb-6"
            >
              <Plus className="w-4 h-4" />
              Add Exercise
            </button>

            {/* Duration + Mood + Notes */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    placeholder="45"
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">How did it feel?</label>
                  <div className="flex gap-1.5">
                    {MOODS.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setMood(mood === m.value ? '' : m.value)}
                        className={`flex-1 py-1.5 rounded-lg text-center text-base transition-colors ${
                          mood === m.value
                            ? 'bg-accent/20 border border-accent/40'
                            : 'bg-black border border-white/10 hover:border-white/20'
                        }`}
                        title={m.label}
                      >
                        {m.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Felt strong today, increased weight on bench"
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving || exercises.length === 0}
              className="w-full py-3 bg-accent text-black font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2 transition-opacity"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {hasExisting ? 'Update Workout' : 'Log Workout'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
