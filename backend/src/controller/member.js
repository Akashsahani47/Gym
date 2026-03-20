import { Payment } from "../model/Payment.js";
import { Member } from "../model/Member.js";
import bcrypt from "bcryptjs";

/**
 * @desc   Update member profile (name, phone, address, health, password)
 * @route  PUT /api/member/profile
 * @access Private (member only)
 */
export const updateMemberProfile = async (req, res) => {
  try {
    const member = await Member.findById(req.userId).select("+password");
    if (!member) {
      return res.status(404).json({ success: false, error: "Member not found" });
    }

    const { profile, healthMetrics, password } = req.body;

    // Update profile fields (only allowed ones)
    if (profile) {
      if (profile.firstName) member.profile.firstName = profile.firstName.trim();
      if (profile.lastName) member.profile.lastName = profile.lastName.trim();
      if (profile.phone) member.profile.phone = profile.phone.trim();
      if (profile.dateOfBirth !== undefined) member.profile.dateOfBirth = profile.dateOfBirth;
      if (profile.emergencyContact !== undefined) member.profile.emergencyContact = profile.emergencyContact;
      if (profile.address) {
        member.profile.address = {
          ...member.profile.address,
          ...profile.address,
        };
      }
    }

    // Update health metrics
    if (healthMetrics) {
      if (healthMetrics.height !== undefined) member.healthMetrics.height = healthMetrics.height;
      if (healthMetrics.weight !== undefined) member.healthMetrics.weight = healthMetrics.weight;
      if (healthMetrics.fitnessGoals !== undefined) member.healthMetrics.fitnessGoals = healthMetrics.fitnessGoals;
    }

    // Update password
    if (password?.current && password?.newPassword) {
      if (!member.password) {
        return res.status(400).json({ success: false, error: "No password set. Use forgot password." });
      }
      const isMatch = await bcrypt.compare(password.current, member.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, error: "Current password is incorrect" });
      }
      if (password.newPassword.length < 6) {
        return res.status(400).json({ success: false, error: "New password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      member.password = await bcrypt.hash(password.newPassword, salt);
    }

    await member.save();

    // Return without password
    const updated = member.toObject();
    delete updated.password;

    return res.json({ success: true, member: updated });
  } catch (error) {
    console.error("updateMemberProfile error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * @desc   Get current member's payment history (read-only)
 * @route  GET /api/member/payments
 * @access Private (member only)
 */
export const getMyPayments = async (req, res) => {
  try {
    const memberId = req.userId;

    const payments = await Payment.find({ memberId })
      .sort({ month: -1, createdAt: -1 })
      .lean();

    const totalPaid = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = payments
      .filter((p) => p.status === "pending" || p.status === "overdue")
      .reduce((sum, p) => sum + p.amount, 0);

    return res.status(200).json({
      success: true,
      payments,
      summary: {
        totalPaid,
        pendingAmount,
        totalRecords: payments.length,
      },
    });
  } catch (error) {
    console.error("getMyPayments error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch payments",
    });
  }
};
