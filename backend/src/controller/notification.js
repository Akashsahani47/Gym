import { Notification } from "../model/Notification.js";
import { Member } from "../model/Member.js";
import { Gym } from "../model/gym.js";
import { createNotification, notificationExistsToday } from "../utils/notificationHelper.js";

// ─── Get notifications for current user ─────────────────────────────────────
export const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ recipientId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipientId: req.user._id }),
    ]);

    return res.json({
      success: true,
      notifications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("getNotifications error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Get unread count ────────────────────────────────────────────────────────
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false,
    });
    return res.json({ success: true, count });
  } catch (error) {
    console.error("getUnreadCount error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Mark one as read ────────────────────────────────────────────────────────
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, error: "Notification not found" });
    }
    return res.json({ success: true, notification });
  } catch (error) {
    console.error("markAsRead error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Mark all as read ────────────────────────────────────────────────────────
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return res.json({ success: true });
  } catch (error) {
    console.error("markAllAsRead error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Delete one ──────────────────────────────────────────────────────────────
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipientId: req.user._id,
    });
    if (!notification) {
      return res.status(404).json({ success: false, error: "Notification not found" });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error("deleteNotification error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Auto-generate expiring membership notifications ─────────────────────────
export const generateExpiringNotifications = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const gyms = await Gym.find({ owner: ownerId, isDeleted: false }).select("_id name");
    const gymIds = gyms.map((g) => g._id);

    const now = new Date();
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    // Members expiring in next 7 days
    const expiringMembers = await Member.find({
      gymId: { $in: gymIds },
      isDeleted: false,
      "membership.status": "active",
      "membership.endDate": { $gte: now, $lte: in7Days },
    });

    let created = 0;

    for (const member of expiringMembers) {
      const gym = gyms.find((g) => g._id.toString() === member.gymId.toString());
      const daysLeft = Math.ceil((new Date(member.membership.endDate) - now) / (1000 * 60 * 60 * 24));

      // Notify member
      const memberExists = await notificationExistsToday(member._id, "membership_expiring");
      if (!memberExists) {
        await createNotification({
          recipientId: member._id,
          recipientType: "member",
          gymId: member.gymId,
          type: "membership_expiring",
          title: "Membership Expiring Soon",
          message: `Your membership at ${gym?.name || "your gym"} expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Contact your gym to renew.`,
          link: "/dashboard/member/membership",
          metadata: { memberId: member._id, daysLeft },
        });
        created++;
      }

      // Notify gym owner
      const ownerExists = await notificationExistsToday(ownerId, "membership_expiring", { memberId: member._id });
      if (!ownerExists) {
        await createNotification({
          recipientId: ownerId,
          recipientType: "gym_owner",
          gymId: member.gymId,
          type: "membership_expiring",
          title: "Member Expiring Soon",
          message: `${member.profile.firstName} ${member.profile.lastName}'s membership expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`,
          link: "/dashboard/gymOwner/all_members",
          metadata: { memberId: member._id, daysLeft },
        });
        created++;
      }
    }

    // Also check already expired
    const expiredMembers = await Member.find({
      gymId: { $in: gymIds },
      isDeleted: false,
      "membership.status": "active",
      "membership.endDate": { $lt: now },
    });

    for (const member of expiredMembers) {
      const ownerExists = await notificationExistsToday(ownerId, "membership_expired", { memberId: member._id });
      if (!ownerExists) {
        await createNotification({
          recipientId: ownerId,
          recipientType: "gym_owner",
          gymId: member.gymId,
          type: "membership_expired",
          title: "Membership Expired",
          message: `${member.profile.firstName} ${member.profile.lastName}'s membership has expired.`,
          link: "/dashboard/gymOwner/all_members",
          metadata: { memberId: member._id },
        });
        created++;
      }
    }

    return res.json({ success: true, created });
  } catch (error) {
    console.error("generateExpiringNotifications error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
