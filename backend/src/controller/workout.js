import { Workout } from "../model/Workout.js";
import { Attendance } from "../model/Attendance.js";

// ─── Log / Update today's workout ────────────────────────────────────────────
export const saveWorkout = async (req, res) => {
  try {
    const memberId = req.user._id;
    const { date, exercises, durationMinutes, notes, mood } = req.body;

    const workoutDate = date || new Date().toISOString().split("T")[0];

    const workout = await Workout.findOneAndUpdate(
      { memberId, date: workoutDate },
      {
        memberId,
        gymId: req.user.gymId,
        date: workoutDate,
        exercises: exercises || [],
        durationMinutes: durationMinutes || 0,
        notes,
        mood,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ success: true, workout });
  } catch (error) {
    console.error("saveWorkout error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: "Workout for this date already exists" });
    }
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Get workout for a specific date ─────────────────────────────────────────
export const getWorkoutByDate = async (req, res) => {
  try {
    const memberId = req.user._id;
    const { date } = req.params;

    const workout = await Workout.findOne({ memberId, date }).lean();

    return res.json({ success: true, workout });
  } catch (error) {
    console.error("getWorkoutByDate error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Get workout history (paginated) ─────────────────────────────────────────
export const getWorkoutHistory = async (req, res) => {
  try {
    const memberId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;

    const [workouts, total] = await Promise.all([
      Workout.find({ memberId })
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Workout.countDocuments({ memberId }),
    ]);

    return res.json({ success: true, workouts, total });
  } catch (error) {
    console.error("getWorkoutHistory error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Delete workout ──────────────────────────────────────────────────────────
export const deleteWorkout = async (req, res) => {
  try {
    const memberId = req.user._id;
    const { date } = req.params;

    await Workout.findOneAndDelete({ memberId, date });

    return res.json({ success: true });
  } catch (error) {
    console.error("deleteWorkout error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Calendar heatmap data (last N months) ───────────────────────────────────
export const getCalendarData = async (req, res) => {
  try {
    const memberId = req.user._id;
    const months = parseInt(req.query.months) || 6;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    const startStr = startDate.toISOString().split("T")[0];

    const workouts = await Workout.find({
      memberId,
      date: { $gte: startStr },
    })
      .select("date exercises durationMinutes mood")
      .sort({ date: 1 })
      .lean();

    // Build a map: date -> { exerciseCount, totalSets, duration, mood }
    const calendar = {};
    for (const w of workouts) {
      const totalSets = w.exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);
      calendar[w.date] = {
        exerciseCount: w.exercises.length,
        totalSets,
        duration: w.durationMinutes,
        mood: w.mood,
      };
    }

    return res.json({ success: true, calendar, totalWorkouts: workouts.length });
  } catch (error) {
    console.error("getCalendarData error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Streaks & Badges ────────────────────────────────────────────────────────
export const getStreaksAndBadges = async (req, res) => {
  try {
    const memberId = req.user._id;

    // Get all workout dates sorted
    const workouts = await Workout.find({ memberId })
      .select("date")
      .sort({ date: -1 })
      .lean();

    const totalWorkouts = workouts.length;
    if (totalWorkouts === 0) {
      return res.json({
        success: true,
        currentStreak: 0,
        longestStreak: 0,
        totalWorkouts: 0,
        thisWeek: 0,
        thisMonth: 0,
        badges: [],
      });
    }

    const dates = workouts.map((w) => w.date);
    const dateSet = new Set(dates);

    // Calculate current streak (consecutive days ending today or yesterday)
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    let currentStreak = 0;
    let checkDate = dateSet.has(today) ? today : dateSet.has(yesterday) ? yesterday : null;

    if (checkDate) {
      let d = new Date(checkDate + "T00:00:00");
      while (dateSet.has(d.toISOString().split("T")[0])) {
        currentStreak++;
        d.setDate(d.getDate() - 1);
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let streak = 1;
    const sortedDates = [...dateSet].sort();
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1] + "T00:00:00");
      const curr = new Date(sortedDates[i] + "T00:00:00");
      const diffDays = (curr - prev) / 86400000;
      if (diffDays === 1) {
        streak++;
      } else {
        longestStreak = Math.max(longestStreak, streak);
        streak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, streak);

    // This week / this month counts
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekStartStr = weekStart.toISOString().split("T")[0];
    const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    const thisWeek = dates.filter((d) => d >= weekStartStr).length;
    const thisMonth = dates.filter((d) => d >= monthStartStr).length;

    // Generate badges
    const badges = [];

    if (totalWorkouts >= 1) badges.push({ id: "first", name: "First Workout", icon: "zap", earned: true });
    if (totalWorkouts >= 10) badges.push({ id: "ten", name: "10 Workouts", icon: "flame", earned: true });
    if (totalWorkouts >= 25) badges.push({ id: "twentyfive", name: "25 Workouts", icon: "award", earned: true });
    if (totalWorkouts >= 50) badges.push({ id: "fifty", name: "50 Workouts", icon: "trophy", earned: true });
    if (totalWorkouts >= 100) badges.push({ id: "hundred", name: "Century Club", icon: "crown", earned: true });
    if (totalWorkouts >= 200) badges.push({ id: "twohundred", name: "200 Workouts", icon: "star", earned: true });
    if (totalWorkouts >= 365) badges.push({ id: "yearly", name: "365 Workouts", icon: "sun", earned: true });

    if (currentStreak >= 3) badges.push({ id: "streak3", name: "3-Day Streak", icon: "flame", earned: true });
    if (currentStreak >= 7) badges.push({ id: "streak7", name: "Week Warrior", icon: "flame", earned: true });
    if (currentStreak >= 14) badges.push({ id: "streak14", name: "2-Week Beast", icon: "flame", earned: true });
    if (currentStreak >= 30) badges.push({ id: "streak30", name: "30-Day Legend", icon: "crown", earned: true });

    if (thisWeek >= 5) badges.push({ id: "week5", name: "5-Day Week", icon: "target", earned: true });
    if (thisMonth >= 20) badges.push({ id: "month20", name: "20 This Month", icon: "calendar", earned: true });

    // Add upcoming badges (next milestone)
    const nextMilestones = [10, 25, 50, 100, 200, 365];
    const nextMilestone = nextMilestones.find((m) => m > totalWorkouts);
    if (nextMilestone) {
      badges.push({
        id: `next_${nextMilestone}`,
        name: `${nextMilestone} Workouts`,
        icon: "lock",
        earned: false,
        progress: totalWorkouts,
        target: nextMilestone,
      });
    }

    return res.json({
      success: true,
      currentStreak,
      longestStreak,
      totalWorkouts,
      thisWeek,
      thisMonth,
      badges,
    });
  } catch (error) {
    console.error("getStreaksAndBadges error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
