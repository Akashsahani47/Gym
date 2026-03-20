
import { GymOwner } from "../model/GymOwner.js";
import { Member } from "../model/Member.js";
import { Gym } from "../model/gym.js";
import { Payment } from "../model/Payment.js";
import bcrypt from "bcryptjs";
import Razorpay from "razorpay";
import crypto from "crypto";
import { BrevoClient } from "@getbrevo/brevo";
import { createNotification } from "../utils/notificationHelper.js";

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys not configured in environment");
  }
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const toMonthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;



import slugify from "slugify";





export const getOwnerGyms = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const gyms = await Gym.find({
      owner: ownerId,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      gyms
    });
  } catch (error) {
    console.error("Get Owner Gyms Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch gyms"
    });
  }
};

/**
 * @desc   Get single gym by ID (owner only)
 * @route  GET /api/gym-owner/gyms/:id
 * @access Private
 */
export const getGymById = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const gymId = req.params.id;

    const gym = await Gym.findOne({
      _id: gymId,
      owner: ownerId,
      isDeleted: false
    }).lean();

    if (!gym) {
      return res.status(404).json({
        success: false,
        error: "Gym not found"
      });
    }

    return res.status(200).json({
      success: true,
      gym
    });
  } catch (error) {
    console.error("Get Gym By ID Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch gym"
    });
  }
};

/**
 * @desc   Update gym by ID (owner only)
 * @route  PUT /api/gym-owner/gyms/:id
 * @access Private
 */
export const updateGym = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const gymId = req.params.id;
    const data = req.body;

    const gym = await Gym.findOne({
      _id: gymId,
      owner: ownerId,
      isDeleted: false
    });

    if (!gym) {
      return res.status(404).json({
        success: false,
        error: "Gym not found"
      });
    }

    const allowed = [
      "name", "description", "contact", "address", "logo", "coverImage", "images",
      "facilities", "operatingHours", "membershipPlans", "settings", "status"
    ];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        gym[key] = data[key];
      }
    }

    await gym.save();

    return res.status(200).json({
      success: true,
      message: "Gym updated successfully",
      gym
    });
  } catch (error) {
    console.error("Update Gym Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update gym"
    });
  }
};

/**
 * @desc   Soft delete gym
 * @route  DELETE /api/gym-owner/gyms/:id
 * @access Private
 */
export const deleteGym = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const gymId = req.params.id;

    const gym = await Gym.findOne({
      _id: gymId,
      owner: ownerId,
      isDeleted: false
    });

    if (!gym) {
      return res.status(404).json({
        success: false,
        error: "Gym not found"
      });
    }

    gym.isDeleted = true;
    gym.status = "inactive";
    await gym.save();

    return res.status(200).json({
      success: true,
      message: "Gym deleted successfully"
    });
  } catch (error) {
    console.error("Delete Gym Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete gym"
    });
  }
};

export const createGym = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const data = req.body;

    if (!data.name) {
      return res.status(400).json({
        success: false,
        error: "Gym name is required",
      });
    }

    const slug = slugify(data.name, {
      lower: true,
      strict: true,
    });

    const exists = await Gym.findOne({ slug, isDeleted: false });
    if (exists) {
      return res.status(409).json({
        success: false,
        error: "Gym with this name already exists",
      });
    }

    const gym = await Gym.create({
      ...data,
      slug,
      owner: ownerId,
      approval: {
        isApproved: false,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Gym created successfully",
      data: gym,
    });
  } catch (err) {
  return res.status(500).json({ error: err.message });
}

  }


export const getGymOwnerinfo = async (req, res) => {
  try {
    const user = req.user;

    // Role check
    if (user.userType !== "gym_owner") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Fetch gyms
    const gyms = await Gym.find({
      owner: user._id,
      isDeleted: false
    }).lean();

    // Aggregate stats
    const stats = {
      totalGyms: gyms.length,
      totalMembers: gyms.reduce(
        (sum, g) => sum + (g.stats?.totalMembers || 0),
        0
      ),
      activeMembers: gyms.reduce(
        (sum, g) => sum + (g.stats?.activeMembers || 0),
        0
      ),
      monthlyRevenue: gyms.reduce(
        (sum, g) => sum + (g.stats?.monthlyRevenue || 0),
        0
      ),
      occupancyRate: gyms.length
        ? Math.round(
            gyms.reduce((a, g) => a + (g.stats?.activeMembers || 0), 0) /
            gyms.reduce((a, g) => a + (g.settings?.maxCapacity || 1), 0) * 100
          )
        : 0
    };

    return res.status(200).json({
      success: true,
      user,
      gyms,
      stats
    });

  } catch (error) {
    console.error("getGymOwnerinfo error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



export const updateGymOwnerinfo = async (req, res) => {
  try {
    const ownerId = req.user._id;
;
    const { profile, password } = req.body;

    const gymOwner = await GymOwner.findById(ownerId);
    if (!gymOwner) {
      return res.status(404).json({ message: "Gym owner not found" });
    }

    // Update profile
    if (profile) {
      gymOwner.profile.firstName = profile.firstName ?? gymOwner.profile.firstName;
      gymOwner.profile.lastName = profile.lastName ?? gymOwner.profile.lastName;
      gymOwner.profile.phone = profile.phone ?? gymOwner.profile.phone;
      gymOwner.profile.dateOfBirth = profile.dateOfBirth ?? gymOwner.profile.dateOfBirth;
    }

    // Update password
    if (password?.current && password?.new) {
      const isMatch = await bcrypt.compare(password.current, gymOwner.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      gymOwner.password = await bcrypt.hash(password.new, salt);
    }

    await gymOwner.save();

    const updatedOwner = await GymOwner.findById(ownerId)
      .select("-password")
      .populate("gyms");

    res.status(200).json({
      user: updatedOwner
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};






export const addMember = async (req, res) => {
  try {
    const gymOwnerId = req.user.id;

    const {
      email,
      password,
      profile,
      gymId,
      membership,
      healthMetrics,
      status,
      sendWelcomeEmail
    } = req.body;

    /* ---------- VALIDATION ---------- */
    if (!email || !password || !profile?.firstName || !profile?.lastName || !profile?.phone || !gymId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    /* ---------- CHECK GYM OWNERSHIP ---------- */
    const gym = await Gym.findOne({ _id: gymId, owner: gymOwnerId, isDeleted: false });
    if (!gym) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized gym access"
      });
    }

    /* ---------- CHECK MEMBER EXISTENCE (PER GYM) ---------- */
    const existingMember = await Member.findOne({ email, gymId });
    if (existingMember) {
      return res.status(409).json({
        success: false,
        error: "Member already exists in this gym"
      });
    }

    /* ---------- CREATE MEMBER ---------- */
    const hashedPassword = await bcrypt.hash(password, 10);

    const member = await Member.create({
      email,
      password: hashedPassword,
      status: status || "pending",
      profile,
      gymId,
      membership: membership || {},
      healthMetrics: healthMetrics || {},
      createdBy: gymOwnerId,
      assignedBy: gymOwnerId,
      assignedAt: new Date()
    });

    let welcomeEmailSent = false;
    if (sendWelcomeEmail && email && password) {
      try {
        const loginUrl = process.env.NEXT_FRONTEND_URL
          ? `${process.env.NEXT_FRONTEND_URL}/loginpage`
          : "#";
        const memberName = profile?.firstName && profile?.lastName
          ? `${profile.firstName} ${profile.lastName}`
          : "Member";
        const gymName = gym.name || "your gym";

        await getBrevoClient().transactionalEmails.sendTransacEmail({
          subject: "Welcome to " + gymName + " – Your login credentials",
          sender: {
            name: process.env.BREVO_SENDER_NAME || "Zelvoo",
            email: process.env.BREVO_SENDER_EMAIL,
          },
          to: [{ email: member.email, name: memberName }],
          htmlContent: `
            <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;">
              <h2 style="color:#1a1a1a;">Welcome to ${gymName}, ${memberName}!</h2>
              <p style="color:#555;">Your gym has added you as a member. Here are your login credentials to access the member dashboard:</p>
              <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin:20px 0;">
                <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${member.email}</p>
                <p style="margin:0;"><strong>Password:</strong> ${password}</p>
              </div>
              <p style="color:#555;">We recommend changing your password after your first login.</p>
              <a href="${loginUrl}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#DAFF00;color:#000;font-weight:700;border-radius:8px;text-decoration:none;">
                Log in to dashboard
              </a>
              <p style="color:#aaa;font-size:12px;">If you did not expect this email, please contact your gym.</p>
            </div>
          `,
        });
        welcomeEmailSent = true;
      } catch (err) {
        console.error("Welcome email send error:", err);
      }
    }

    // Notify gym owner: new member joined
    createNotification({
      recipientId: req.user._id,
      recipientType: "gym_owner",
      gymId: gym._id,
      type: "new_member_joined",
      title: "New Member Added",
      message: `${member.profile.firstName} ${member.profile.lastName} has been added to ${gym.name}.`,
      link: "/dashboard/gymOwner/all_members",
      metadata: { memberId: member._id },
    });

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      welcomeEmailSent,
      member: {
        id: member._id,
        email: member.email,
        name: `${member.profile.firstName} ${member.profile.lastName}`
      }
    });

  } catch (error) {
    console.error("Add Member Error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while adding member"
    });
  }
};



// Backend route example
// controllers/gymOwnerController.js

export const getAllMembers = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const members = await Member.find({
      createdBy: ownerId,
      isDeleted: false,
    })
      .populate("gymId", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      members,
    });

  } catch (error) {
    console.error("Get Members Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch members",
    });
  }
};

// ─────────────────────────────────────────────
// MEMBER STATUS & DELETE
// ─────────────────────────────────────────────

export const updateMemberStatus = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { memberId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const member = await Member.findOne({ _id: memberId, createdBy: ownerId, isDeleted: false });
    if (!member) {
      return res.status(404).json({ success: false, error: "Member not found" });
    }

    member.status = status;
    await member.save();

    return res.status(200).json({ success: true, message: `Member status updated to ${status}` });
  } catch (error) {
    console.error("Update Member Status Error:", error);
    return res.status(500).json({ success: false, error: "Failed to update status" });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { memberId } = req.params;

    const member = await Member.findOne({ _id: memberId, createdBy: ownerId, isDeleted: false });
    if (!member) {
      return res.status(404).json({ success: false, error: "Member not found" });
    }

    member.isDeleted = true;
    member.status = 'inactive';
    await member.save();

    return res.status(200).json({ success: true, message: "Member deleted successfully" });
  } catch (error) {
    console.error("Delete Member Error:", error);
    return res.status(500).json({ success: false, error: "Failed to delete member" });
  }
};

// ─────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────

/**
 * Helper: get "YYYY-MM" string for a given Date
 */
const toMonthStr = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/**
 * @desc   Get all payments + summary stats for the gym owner
 * @route  GET /api/gym-owner/payments
 * @access Private
 */
export const getPayments = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const now = new Date();
    const currentMonth = toMonthStr(now);
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonth = toMonthStr(nextMonthDate);

    // ── 1. Ensure every active member has a payment record for current month ──
    const members = await Member.find({
      createdBy: ownerId,
      isDeleted: false,
    })
      .populate("gymId", "name membershipPlans")
      .lean();

    for (const member of members) {
      const existing = await Payment.findOne({
        memberId: member._id,
        month: currentMonth,
      });

      if (!existing) {
        // Resolve plan price
        const plan = member.gymId?.membershipPlans?.find(
          (p) => p._id?.toString() === member.membership?.planId?.toString()
        );
        const amount = plan?.price ?? 0;

        // Determine status
        const membershipEnd = member.membership?.endDate
          ? new Date(member.membership.endDate)
          : null;
        const isOverdue =
          membershipEnd && membershipEnd < now && toMonthStr(membershipEnd) !== currentMonth;

        await Payment.create({
          memberId: member._id,
          gymId: member.gymId._id,
          gymOwnerId: ownerId,
          month: currentMonth,
          year: now.getFullYear(),
          amount,
          status: isOverdue ? "overdue" : "pending",
          memberName: `${member.profile.firstName} ${member.profile.lastName}`,
          memberEmail: member.email,
          gymName: member.gymId?.name || "",
          planName: member.membership?.planName || plan?.name || "",
        });
      }
    }

    // ── 2. Fetch all payments for this owner ──
    const allPayments = await Payment.find({ gymOwnerId: ownerId })
      .sort({ createdAt: -1 })
      .lean();

    // ── 3. Calculate summary stats ──
    const thisMonthPayments = allPayments.filter((p) => p.month === currentMonth);
    const thisMonthIncome = thisMonthPayments
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + p.amount, 0);

    const thisMonthPending = thisMonthPayments
      .filter((p) => p.status === "pending" || p.status === "overdue")
      .reduce((s, p) => s + p.amount, 0);

    const totalIncome = allPayments
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + p.amount, 0);

    // Next-month expected = sum of plan prices for currently active members
    const nextMonthExpected = members
      .filter((m) => m.membership?.status === "active")
      .reduce((s, m) => {
        const plan = m.gymId?.membershipPlans?.find(
          (p) => p._id?.toString() === m.membership?.planId?.toString()
        );
        return s + (plan?.price ?? 0);
      }, 0);

    const paidThisMonth = thisMonthPayments.filter((p) => p.status === "paid").length;
    const pendingThisMonth = thisMonthPayments.filter(
      (p) => p.status === "pending" || p.status === "overdue"
    ).length;

    return res.status(200).json({
      success: true,
      payments: allPayments,
      stats: {
        thisMonthIncome,
        thisMonthPending,
        nextMonthExpected,
        totalIncome,
        paidThisMonth,
        pendingThisMonth,
        currentMonth,
        nextMonth,
      },
    });
  } catch (error) {
    console.error("getPayments error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch payments" });
  }
};

/**
 * @desc   Mark a member's current-month payment as paid (cash)
 * @route  POST /api/gym-owner/payments/mark-paid/:paymentId
 * @access Private
 */
export const markPaymentPaid = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { paymentId } = req.params;
    const { method = "cash", notes = "" } = req.body;

    const payment = await Payment.findOne({ _id: paymentId, gymOwnerId: ownerId });
    if (!payment) {
      return res.status(404).json({ success: false, error: "Payment record not found" });
    }

    if (payment.status === "paid") {
      return res.status(400).json({ success: false, error: "Already marked as paid" });
    }

    payment.status = "paid";
    payment.method = method;
    payment.paidAt = new Date();
    payment.markedBy = ownerId;
    payment.notes = notes;
    await payment.save();

    // Update gym monthly revenue cache
    await Gym.findByIdAndUpdate(payment.gymId, {
      $inc: { "stats.monthlyRevenue": payment.amount },
    });

    // Notify member: payment confirmed
    createNotification({
      recipientId: payment.memberId,
      recipientType: "member",
      gymId: payment.gymId,
      type: "payment_received",
      title: "Payment Confirmed",
      message: `Your payment of ₹${payment.amount} for ${payment.month} has been confirmed.`,
      link: "/dashboard/member/payments",
      metadata: { paymentId: payment._id },
    });

    // Send receipt/invoice email to member (Brevo)
    let receiptEmailSent = false;
    const memberEmail = payment.memberEmail;
    if (memberEmail) {
      try {
        const [y, m] = (payment.month || "").split("-");
        const monthLabel =
          y && m
            ? new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1).toLocaleString(
                "en-IN",
                { month: "long", year: "numeric" }
              )
            : payment.month;
        const methodLabel = {
          cash: "Cash",
          online: "Online",
          card: "Card",
          bank_transfer: "Bank Transfer",
        }[payment.method] || payment.method;
        const paidAtStr = payment.paidAt
          ? new Date(payment.paidAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";

        await getBrevoClient().transactionalEmails.sendTransacEmail({
          subject: `Payment receipt – ${payment.gymName || "Gym"} (${monthLabel})`,
          sender: {
            name: process.env.BREVO_SENDER_NAME || "Zelvoo",
            email: process.env.BREVO_SENDER_EMAIL,
          },
          to: [
            {
              email: memberEmail,
              name: payment.memberName || "Member",
            },
          ],
          htmlContent: `
            <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;">
              <h2 style="color:#1a1a1a;">Payment Receipt</h2>
              <p style="color:#555;">Hi ${payment.memberName || "Member"},</p>
              <p style="color:#555;">Thank you for your payment. Here are the details of your receipt.</p>
              <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin:20px 0;">
                <p style="margin:0 0 8px 0;"><strong>Gym:</strong> ${payment.gymName || "—"}</p>
                <p style="margin:0 0 8px 0;"><strong>Plan:</strong> ${payment.planName || "—"}</p>
                <p style="margin:0 0 8px 0;"><strong>Period:</strong> ${monthLabel}</p>
                <p style="margin:0 0 8px 0;"><strong>Amount paid:</strong> ₹${(payment.amount ?? 0).toLocaleString("en-IN")}</p>
                <p style="margin:0 0 8px 0;"><strong>Payment method:</strong> ${methodLabel}</p>
                <p style="margin:0;"><strong>Date paid:</strong> ${paidAtStr}</p>
              </div>
              <p style="color:#555;">Thank you for your payment. Keep up the great work!</p>
              <p style="color:#aaa;font-size:12px;">This is an automated receipt from your gym.</p>
            </div>
          `,
        });
        receiptEmailSent = true;
      } catch (err) {
        console.error("Receipt email failed for", memberEmail, err);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment marked as paid",
      payment,
      receiptEmailSent,
    });
  } catch (error) {
    console.error("markPaymentPaid error:", error);
    return res.status(500).json({ success: false, error: "Failed to mark payment" });
  }
};

/**
 * @desc   Send payment reminder email to all members who have NOT paid for the current month
 * @route  POST /api/gym-owner/payments/send-reminders
 * @access Private
 */
export const sendPaymentReminders = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const now = new Date();
    const currentMonth = toMonthStr(now);
    const monthLabelStr =
      now.toLocaleString("en-IN", { month: "long", year: "numeric" });

    const unpaidPayments = await Payment.find({
      gymOwnerId: ownerId,
      month: currentMonth,
      status: { $in: ["pending", "overdue"] },
    })
      .lean();

    if (unpaidPayments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No unpaid members for this month",
        sentCount: 0,
      });
    }

    const brevo = getBrevoClient();
    const loginUrl = process.env.NEXT_FRONTEND_URL
      ? `${process.env.NEXT_FRONTEND_URL}/dashboard/member/payments`
      : "#";
    let sentCount = 0;

    for (const p of unpaidPayments) {
      const email = p.memberEmail;
      if (!email) continue;

      const memberName = p.memberName || "Member";
      const gymName = p.gymName || "your gym";
      const planName = p.planName || "—";
      const amount = p.amount ?? 0;

      try {
        await brevo.transactionalEmails.sendTransacEmail({
          subject: `Payment reminder: ${monthLabelStr} membership at ${gymName}`,
          sender: {
            name: process.env.BREVO_SENDER_NAME || "Zelvoo",
            email: process.env.BREVO_SENDER_EMAIL,
          },
          to: [{ email, name: memberName }],
          htmlContent: `
            <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;">
              <h2 style="color:#1a1a1a;">Hi ${memberName},</h2>
              <p style="color:#555;">This is a friendly reminder to pay your <strong>${monthLabelStr}</strong> membership fee at <strong>${gymName}</strong> to continue using the gym.</p>
              <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin:20px 0;">
                <p style="margin:0 0 8px 0;"><strong>Gym:</strong> ${gymName}</p>
                <p style="margin:0 0 8px 0;"><strong>Plan:</strong> ${planName}</p>
                <p style="margin:0 0 8px 0;"><strong>Period:</strong> ${monthLabelStr}</p>
                <p style="margin:0;"><strong>Amount due:</strong> ₹${amount.toLocaleString("en-IN")}</p>
              </div>
              <p style="color:#555;">Please pay at the gym or contact your gym for payment options. Members who have already paid for this month do not receive this email.</p>
              <a href="${loginUrl}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#DAFF00;color:#000;font-weight:700;border-radius:8px;text-decoration:none;">
                View my payments
              </a>
              <p style="color:#aaa;font-size:12px;">If you have already paid, please ignore this email.</p>
            </div>
          `,
        });
        sentCount += 1;
      } catch (err) {
        console.error("Reminder email failed for", email, err);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Reminder sent to ${sentCount} member(s)`,
      sentCount,
    });
  } catch (error) {
    console.error("sendPaymentReminders error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send reminders",
    });
  }
};

// ─────────────────────────────────────────────
// SUBSCRIPTION (PLATFORM FEE via Razorpay)
// ─────────────────────────────────────────────

/**
 * @desc   Create Razorpay order for monthly platform subscription
 * @route  POST /api/gym-owner/subscription/create-order
 * @access Private
 */
export const createSubscriptionOrder = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const owner = await GymOwner.findById(ownerId);
    if (!owner) return res.status(404).json({ success: false, error: "Owner not found" });

    const currentMonth = toMonthKey();
    const alreadyPaid = owner.subscription?.lastPaidMonth === currentMonth;
    if (alreadyPaid) {
      return res.status(400).json({ success: false, error: "Already paid for this month" });
    }

    const amount = owner.subscription?.amount ?? 500; // INR

    const order = await getRazorpay().orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `sub_${ownerId}_${currentMonth}`,
      notes: {
        gymOwnerId: ownerId.toString(),
        month: currentMonth,
        type: "platform_subscription",
      },
    });

    return res.status(200).json({
      success: true,
      order,
      amount,
      month: currentMonth,
      keyId: process.env.RAZORPAY_KEY_ID,
      ownerName: `${owner.profile.firstName} ${owner.profile.lastName}`,
      ownerEmail: owner.email,
      ownerPhone: owner.profile.phone || "",
    });
  } catch (error) {
    console.error("createSubscriptionOrder error:", error);
    return res.status(500).json({ success: false, error: "Failed to create order" });
  }
};

/**
 * @desc   Verify Razorpay payment & activate subscription for this month
 * @route  POST /api/gym-owner/subscription/verify-payment
 * @access Private
 */
export const verifySubscriptionPayment = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "Missing payment fields" });
    }

    // Verify signature
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ success: false, error: "Invalid payment signature" });
    }

    const owner = await GymOwner.findById(ownerId);
    if (!owner) return res.status(404).json({ success: false, error: "Owner not found" });

    const now = new Date();
    const currentMonth = toMonthKey(now);

    // Set renewal date to 1st of next month
    const renewalDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    owner.subscription.status      = "active";
    owner.subscription.lastPaidAt  = now;
    owner.subscription.lastPaidMonth = currentMonth;
    owner.subscription.renewalDate = renewalDate;
    if (!owner.subscription.startDate) owner.subscription.startDate = now;

    owner.subscription.paymentHistory.push({
      razorpayOrderId:   razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount:  owner.subscription.amount ?? 500,
      month:   currentMonth,
      paidAt:  now,
      status:  "success",
    });

    await owner.save();

    return res.status(200).json({
      success: true,
      message: "Subscription activated for " + currentMonth,
      subscription: owner.subscription,
    });
  } catch (error) {
    console.error("verifySubscriptionPayment error:", error);
    return res.status(500).json({ success: false, error: "Failed to verify payment" });
  }
};

// ─── Email Verification ───────────────────────────────────────────────────────

const getBrevoClient = () =>
  new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

export const sendVerificationEmail = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    const owner = await GymOwner.findById(ownerId);
    if (!owner) return res.status(404).json({ success: false, error: "Owner not found" });

    if (owner.emailVerified) {
      return res.status(400).json({ success: false, error: "Email is already verified" });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    owner.emailVerificationToken = token;
    owner.emailVerificationExpiry = expiry;
    await owner.save();

    const verifyUrl = `${process.env.NEXT_FRONTEND_URL}/verify-email?token=${token}`;
    const name = owner.profile?.firstName || "there";

    await getBrevoClient().transactionalEmails.sendTransacEmail({
      subject: "Verify your GymPro email",
      sender: {
        name: process.env.BREVO_SENDER_NAME || "GymPro",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email: owner.email, name }],
      htmlContent: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
          <h2 style="color:#1a1a1a;">Hey ${name}, verify your email</h2>
          <p style="color:#555;">Click the button below to confirm your email address. This link expires in <strong>1 hour</strong>.</p>
          <a href="${verifyUrl}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#9EDC00;color:#000;font-weight:700;border-radius:8px;text-decoration:none;">
            Verify Email
          </a>
          <p style="color:#aaa;font-size:12px;">If you didn't request this, you can safely ignore it.</p>
        </div>
      `,
    });

    return res.json({ success: true, message: "Verification email sent" });
  } catch (error) {
    console.error("sendVerificationEmail error:", error);
    return res.status(500).json({ success: false, error: "Failed to send verification email" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, error: "Token required" });

    const owner = await GymOwner.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: new Date() },
    });

    if (!owner) {
      return res.status(400).json({ success: false, error: "Invalid or expired token" });
    }

    owner.emailVerified = true;
    owner.emailVerificationToken = undefined;
    owner.emailVerificationExpiry = undefined;
    await owner.save();

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("verifyEmail error:", error);
    return res.status(500).json({ success: false, error: "Verification failed" });
  }
};
