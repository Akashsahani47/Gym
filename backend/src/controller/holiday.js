import { Gym } from "../model/gym.js";
import { Member } from "../model/Member.js";
import { createNotification } from "../utils/notificationHelper.js";

// ─── Add Holiday (gym owner) ─────────────────────────────────────────────────
export const addHoliday = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { gymId, date, reason } = req.body;

    if (!gymId || !date) {
      return res.status(400).json({ success: false, error: "Gym and date are required" });
    }

    const gym = await Gym.findOne({ _id: gymId, owner: ownerId, isDeleted: false });
    if (!gym) {
      return res.status(403).json({ success: false, error: "Gym not found or unauthorized" });
    }

    // Check duplicate date
    const exists = gym.holidays.some((h) => h.date === date);
    if (exists) {
      return res.status(409).json({ success: false, error: "Holiday already exists for this date" });
    }

    gym.holidays.push({ date, reason: reason || "Gym Closed" });
    await gym.save();

    const holiday = gym.holidays[gym.holidays.length - 1];

    // Notify all active members of this gym
    const members = await Member.find({
      gymId: gym._id,
      isDeleted: false,
      status: "active",
    }).select("_id profile.firstName");

    const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    for (const member of members) {
      createNotification({
        recipientId: member._id,
        recipientType: "member",
        gymId: gym._id,
        type: "system",
        title: "Gym Closed - Holiday",
        message: `${gym.name} will be closed on ${formattedDate}. Reason: ${reason || "Gym Closed"}`,
        link: "/dashboard/member/holidays",
        metadata: { holidayId: holiday._id, date },
      });
    }

    return res.status(201).json({
      success: true,
      holiday,
      notifiedMembers: members.length,
    });
  } catch (error) {
    console.error("addHoliday error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Delete Holiday (gym owner) ──────────────────────────────────────────────
export const deleteHoliday = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { gymId, holidayId } = req.params;

    const gym = await Gym.findOne({ _id: gymId, owner: ownerId, isDeleted: false });
    if (!gym) {
      return res.status(403).json({ success: false, error: "Gym not found or unauthorized" });
    }

    const idx = gym.holidays.findIndex((h) => h._id.toString() === holidayId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Holiday not found" });
    }

    gym.holidays.splice(idx, 1);
    await gym.save();

    return res.json({ success: true, message: "Holiday removed" });
  } catch (error) {
    console.error("deleteHoliday error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Get Holidays for a gym (gym owner) ──────────────────────────────────────
export const getGymHolidays = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { gymId } = req.params;

    const gym = await Gym.findOne({ _id: gymId, owner: ownerId, isDeleted: false }).select("holidays name");
    if (!gym) {
      return res.status(403).json({ success: false, error: "Gym not found or unauthorized" });
    }

    const sorted = [...gym.holidays].sort((a, b) => a.date.localeCompare(b.date));

    return res.json({ success: true, holidays: sorted, gymName: gym.name });
  } catch (error) {
    console.error("getGymHolidays error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Get Holidays for member's gym ───────────────────────────────────────────
export const getMyGymHolidays = async (req, res) => {
  try {
    const member = req.user;
    if (!member.gymId) {
      return res.json({ success: true, holidays: [], gymName: null });
    }

    const gym = await Gym.findOne({ _id: member.gymId, isDeleted: false }).select("holidays name");
    if (!gym) {
      return res.json({ success: true, holidays: [], gymName: null });
    }

    // Return only today and future holidays
    const today = new Date().toISOString().split("T")[0];
    const upcoming = gym.holidays
      .filter((h) => h.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.json({ success: true, holidays: upcoming, gymName: gym.name });
  } catch (error) {
    console.error("getMyGymHolidays error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
