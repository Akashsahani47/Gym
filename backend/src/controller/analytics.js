import mongoose from "mongoose";
import { Payment } from "../model/Payment.js";
import { Member } from "../model/Member.js";
import { Attendance } from "../model/Attendance.js";
import { Gym } from "../model/gym.js";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

// ─── Revenue Chart (month by month) ─────────────────────────────────────────
export const getRevenueAnalytics = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const months = parseInt(req.query.months) || 12;

    const data = await Payment.aggregate([
      { $match: { gymOwnerId: toObjectId(ownerId), status: "paid" } },
      {
        $group: {
          _id: "$month",
          totalRevenue: { $sum: "$amount" },
          paymentCount: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: months },
      { $sort: { _id: 1 } },
    ]);

    const result = data.map((d) => ({
      month: d._id,
      totalRevenue: d.totalRevenue,
      paymentCount: d.paymentCount,
    }));

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error("getRevenueAnalytics error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Member Growth (cumulative over time) ────────────────────────────────────
export const getMemberGrowthAnalytics = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const months = parseInt(req.query.months) || 12;

    const data = await Member.aggregate([
      { $match: { createdBy: toObjectId(ownerId), isDeleted: false } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          newMembers: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: months },
      { $sort: { _id: 1 } },
    ]);

    // Compute cumulative total
    let cumulative = 0;
    // Count members before the window
    const firstMonth = data.length > 0 ? data[0]._id : null;
    if (firstMonth) {
      const beforeDate = new Date(firstMonth + "-01");
      cumulative = await Member.countDocuments({
        createdBy: ownerId,
        isDeleted: false,
        createdAt: { $lt: beforeDate },
      });
    }

    const result = data.map((d) => {
      cumulative += d.newMembers;
      return {
        month: d._id,
        newMembers: d.newMembers,
        totalMembers: cumulative,
      };
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error("getMemberGrowthAnalytics error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Attendance Heatmap (daily counts for last N weeks) ──────────────────────
export const getAttendanceHeatmap = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const weeks = parseInt(req.query.weeks) || 12;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);
    const startDateStr = startDate.toISOString().split("T")[0];

    const data = await Attendance.aggregate([
      {
        $match: {
          gymOwnerId: toObjectId(ownerId),
          date: { $gte: startDateStr },
        },
      },
      {
        $group: {
          _id: "$date",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Transform into heatmap grid
    let maxCount = 0;
    const heatmapData = data.map((d) => {
      const dateObj = new Date(d._id + "T00:00:00");
      if (d.count > maxCount) maxCount = d.count;
      return {
        date: d._id,
        dayOfWeek: dateObj.getDay(),
        count: d.count,
      };
    });

    return res.json({ success: true, data: heatmapData, maxCount });
  } catch (error) {
    console.error("getAttendanceHeatmap error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Retention Rate ──────────────────────────────────────────────────────────
export const getRetentionAnalytics = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const months = parseInt(req.query.months) || 6;

    // Get gyms owned by this user
    const gyms = await Gym.find({ owner: ownerId, isDeleted: false }).select("_id");
    const gymIds = gyms.map((g) => g._id);

    const result = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthStr = monthStart.toISOString().slice(0, 7);

      // Members active during this month
      const activeCount = await Member.countDocuments({
        gymId: { $in: gymIds },
        isDeleted: false,
        "membership.startDate": { $lte: monthEnd },
        "membership.endDate": { $gte: monthStart },
      });

      // Members whose membership expired this month
      const expiredCount = await Member.countDocuments({
        gymId: { $in: gymIds },
        isDeleted: false,
        "membership.endDate": { $gte: monthStart, $lte: monthEnd },
        "membership.status": { $in: ["expired", "cancelled"] },
      });

      const totalMembers = await Member.countDocuments({
        gymId: { $in: gymIds },
        isDeleted: false,
        createdAt: { $lte: monthEnd },
      });

      const retentionRate = totalMembers > 0
        ? Math.round(((totalMembers - expiredCount) / totalMembers) * 100)
        : 100;

      result.push({
        month: monthStr,
        activeCount,
        expiredCount,
        totalMembers,
        retentionRate: Math.min(retentionRate, 100),
      });
    }

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error("getRetentionAnalytics error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Overview stats (quick summary) ──────────────────────────────────────────
export const getAnalyticsOverview = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const gyms = await Gym.find({ owner: ownerId, isDeleted: false }).select("_id");
    const gymIds = gyms.map((g) => g._id);

    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);
    const today = now.toISOString().split("T")[0];

    const [
      totalMembers,
      activeMembers,
      currentRevenue,
      lastRevenue,
      todayAttendance,
      totalGyms,
    ] = await Promise.all([
      Member.countDocuments({ gymId: { $in: gymIds }, isDeleted: false }),
      Member.countDocuments({ gymId: { $in: gymIds }, isDeleted: false, "membership.status": "active" }),
      Payment.aggregate([
        { $match: { gymOwnerId: toObjectId(ownerId), status: "paid", month: currentMonth } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $match: { gymOwnerId: toObjectId(ownerId), status: "paid", month: lastMonth } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Attendance.countDocuments({ gymOwnerId: ownerId, date: today }),
      gyms.length,
    ]);

    const thisMonthRev = currentRevenue[0]?.total || 0;
    const lastMonthRev = lastRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthRev > 0
      ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100)
      : thisMonthRev > 0 ? 100 : 0;

    return res.json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        totalGyms,
        thisMonthRevenue: thisMonthRev,
        lastMonthRevenue: lastMonthRev,
        revenueGrowth,
        todayAttendance,
      },
    });
  } catch (error) {
    console.error("getAnalyticsOverview error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
