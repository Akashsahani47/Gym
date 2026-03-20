import { Attendance } from "../model/Attendance.js";
import { Gym } from "../model/gym.js";
import { Member } from "../model/Member.js";
import crypto from "crypto";

// Helper: get today's date string in YYYY-MM-DD
const getToday = () => new Date().toISOString().split("T")[0];

// Helper: generate 6-digit PIN
const generatePin = () => {
  const num = crypto.randomInt(100000, 999999);
  return num.toString();
};

// ─── Gym Owner: Generate daily PIN ──────────────────────────────────────────
export const generateDailyPin = async (req, res) => {
  try {
    const { gymId } = req.body;
    if (!gymId) return res.status(400).json({ success: false, error: "gymId is required" });

    const gym = await Gym.findOne({ _id: gymId, owner: req.user._id, isDeleted: false });
    if (!gym) return res.status(404).json({ success: false, error: "Gym not found" });

    const today = getToday();
    const pin = generatePin();

    gym.settings = gym.settings || {};
    gym.settings.dailyPin = { pin, pinDate: today };
    await gym.save();

    return res.json({ success: true, pin, date: today });
  } catch (error) {
    console.error("generateDailyPin error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Gym Owner: Get today's PIN ─────────────────────────────────────────────
export const getTodayPin = async (req, res) => {
  try {
    const { gymId } = req.params;

    const gym = await Gym.findOne({ _id: gymId, owner: req.user._id, isDeleted: false });
    if (!gym) return res.status(404).json({ success: false, error: "Gym not found" });

    const today = getToday();
    const dailyPin = gym.settings?.dailyPin;

    if (dailyPin && dailyPin.pinDate === today) {
      return res.json({ success: true, pin: dailyPin.pin, date: today });
    }

    return res.json({ success: true, pin: null, date: today, message: "No PIN generated for today" });
  } catch (error) {
    console.error("getTodayPin error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Gym Owner: Get QR payload (for printing/displaying) ───────────────────
export const getQRPayload = async (req, res) => {
  try {
    const { gymId } = req.params;

    const gym = await Gym.findOne({ _id: gymId, owner: req.user._id, isDeleted: false });
    if (!gym) return res.status(404).json({ success: false, error: "Gym not found" });

    const today = getToday();
    let pin = gym.settings?.dailyPin?.pin;

    // Auto-generate if no PIN for today
    if (!pin || gym.settings?.dailyPin?.pinDate !== today) {
      pin = generatePin();
      gym.settings = gym.settings || {};
      gym.settings.dailyPin = { pin, pinDate: today };
      await gym.save();
    }

    const qrData = JSON.stringify({ gymId, pin, date: today, gymName: gym.name });
    return res.json({ success: true, qrData, pin, date: today });
  } catch (error) {
    console.error("getQRPayload error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Member: Check in with PIN ──────────────────────────────────────────────
export const checkInWithPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ success: false, error: "PIN is required" });

    const member = req.user;
    const gymId = member.gymId;

    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ success: false, error: "Gym not found" });

    const today = getToday();
    const dailyPin = gym.settings?.dailyPin;

    if (!dailyPin || dailyPin.pinDate !== today || dailyPin.pin !== pin) {
      return res.status(400).json({ success: false, error: "Invalid or expired PIN" });
    }

    // Check if already checked in today
    const existing = await Attendance.findOne({ memberId: member._id, date: today });
    if (existing) {
      return res.status(409).json({ success: false, error: "Already checked in today" });
    }

    const attendance = await Attendance.create({
      memberId: member._id,
      gymId: gym._id,
      gymOwnerId: gym.owner,
      date: today,
      checkInTime: new Date(),
      method: "pin",
      memberName: `${member.profile.firstName} ${member.profile.lastName}`,
      memberEmail: member.email,
      gymName: gym.name,
    });

    return res.json({ success: true, attendance });
  } catch (error) {
    console.error("checkInWithPin error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: "Already checked in today" });
    }
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Member: Check in with QR ───────────────────────────────────────────────
export const checkInWithQR = async (req, res) => {
  try {
    const { qrData } = req.body;
    if (!qrData) return res.status(400).json({ success: false, error: "QR data is required" });

    let parsed;
    try {
      parsed = JSON.parse(qrData);
    } catch {
      return res.status(400).json({ success: false, error: "Invalid QR code" });
    }

    const { gymId, pin, date } = parsed;
    if (!gymId || !pin || !date) {
      return res.status(400).json({ success: false, error: "Invalid QR code data" });
    }

    const member = req.user;
    const today = getToday();

    // QR must be for today
    if (date !== today) {
      return res.status(400).json({ success: false, error: "QR code has expired" });
    }

    // Member must belong to this gym
    if (member.gymId.toString() !== gymId) {
      return res.status(403).json({ success: false, error: "You are not a member of this gym" });
    }

    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ success: false, error: "Gym not found" });

    const dailyPin = gym.settings?.dailyPin;
    if (!dailyPin || dailyPin.pinDate !== today || dailyPin.pin !== pin) {
      return res.status(400).json({ success: false, error: "Invalid or expired QR code" });
    }

    const existing = await Attendance.findOne({ memberId: member._id, date: today });
    if (existing) {
      return res.status(409).json({ success: false, error: "Already checked in today" });
    }

    const attendance = await Attendance.create({
      memberId: member._id,
      gymId: gym._id,
      gymOwnerId: gym.owner,
      date: today,
      checkInTime: new Date(),
      method: "qr",
      memberName: `${member.profile.firstName} ${member.profile.lastName}`,
      memberEmail: member.email,
      gymName: gym.name,
    });

    return res.json({ success: true, attendance });
  } catch (error) {
    console.error("checkInWithQR error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: "Already checked in today" });
    }
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Member: Check out ──────────────────────────────────────────────────────
export const checkOut = async (req, res) => {
  try {
    const member = req.user;
    const today = getToday();

    const attendance = await Attendance.findOne({ memberId: member._id, date: today });
    if (!attendance) {
      return res.status(404).json({ success: false, error: "No check-in found for today" });
    }
    if (attendance.checkOutTime) {
      return res.status(400).json({ success: false, error: "Already checked out" });
    }

    attendance.checkOutTime = new Date();
    await attendance.save();

    return res.json({ success: true, attendance });
  } catch (error) {
    console.error("checkOut error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Member: Get my attendance history ──────────────────────────────────────
export const getMyAttendance = async (req, res) => {
  try {
    const member = req.user;
    const { month } = req.query; // YYYY-MM, optional

    const today = getToday();
    const currentMonth = month || today.slice(0, 7);

    const records = await Attendance.find({
      memberId: member._id,
      date: { $regex: `^${currentMonth}` },
    }).sort({ date: -1 });

    // Today's check-in
    const todayRecord = await Attendance.findOne({ memberId: member._id, date: today });

    // Calculate streak
    let streak = 0;
    const allRecords = await Attendance.find({ memberId: member._id }).sort({ date: -1 });
    for (let i = 0; i < allRecords.length; i++) {
      const expected = new Date();
      expected.setDate(expected.getDate() - i);
      const expectedDate = expected.toISOString().split("T")[0];
      if (allRecords.find((r) => r.date === expectedDate)) {
        streak++;
      } else {
        break;
      }
    }

    return res.json({
      success: true,
      records,
      todayRecord,
      stats: {
        totalThisMonth: records.length,
        streak,
        currentMonth,
      },
    });
  } catch (error) {
    console.error("getMyAttendance error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Gym Owner: Get gym attendance for a date ───────────────────────────────
export const getGymAttendance = async (req, res) => {
  try {
    const { gymId } = req.params;
    const { date } = req.query; // YYYY-MM-DD, optional

    const gym = await Gym.findOne({ _id: gymId, owner: req.user._id, isDeleted: false });
    if (!gym) return res.status(404).json({ success: false, error: "Gym not found" });

    const targetDate = date || getToday();

    const records = await Attendance.find({
      gymId,
      date: targetDate,
    }).sort({ checkInTime: -1 });

    const totalMembers = await Member.countDocuments({ gymId, isDeleted: false });

    return res.json({
      success: true,
      records,
      stats: {
        date: targetDate,
        present: records.length,
        totalMembers,
        checkedOut: records.filter((r) => r.checkOutTime).length,
        currentlyIn: records.filter((r) => !r.checkOutTime).length,
      },
    });
  } catch (error) {
    console.error("getGymAttendance error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Gym Owner: Get attendance stats for a month ────────────────────────────
export const getAttendanceStats = async (req, res) => {
  try {
    const { gymId } = req.params;
    const { month } = req.query; // YYYY-MM

    const gym = await Gym.findOne({ _id: gymId, owner: req.user._id, isDeleted: false });
    if (!gym) return res.status(404).json({ success: false, error: "Gym not found" });

    const currentMonth = month || getToday().slice(0, 7);

    const records = await Attendance.find({
      gymId,
      date: { $regex: `^${currentMonth}` },
    });

    const totalMembers = await Member.countDocuments({ gymId, isDeleted: false });
    const uniqueMembers = new Set(records.map((r) => r.memberId.toString())).size;

    // Daily breakdown
    const dailyMap = {};
    records.forEach((r) => {
      dailyMap[r.date] = (dailyMap[r.date] || 0) + 1;
    });
    const days = Object.keys(dailyMap);
    const dailyAvg = days.length > 0 ? Math.round(records.length / days.length) : 0;
    const peakDay = days.reduce((max, d) => (dailyMap[d] > (dailyMap[max] || 0) ? d : max), days[0] || "");

    return res.json({
      success: true,
      stats: {
        month: currentMonth,
        totalCheckIns: records.length,
        uniqueMembers,
        totalMembers,
        dailyAverage: dailyAvg,
        peakDay,
        peakDayCount: dailyMap[peakDay] || 0,
        dailyBreakdown: dailyMap,
      },
    });
  } catch (error) {
    console.error("getAttendanceStats error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
