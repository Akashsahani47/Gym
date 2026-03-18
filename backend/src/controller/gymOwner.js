
import { GymOwner } from "../model/GymOwner.js";
import { Member } from "../model/Member.js";
import { Gym } from "../model/gym.js";
import { Payment } from "../model/Payment.js";
import bcrypt from "bcryptjs";
import Razorpay from "razorpay";
import crypto from "crypto";

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
      gymId,                     // ✅ FIXED
      membership: membership || {},
      healthMetrics: healthMetrics || {},
      createdBy: gymOwnerId,
      assignedBy: gymOwnerId,     // ✅ IMPROVED
      assignedAt: new Date()      // ✅ IMPROVED
    });

    if (sendWelcomeEmail) {
      console.log("📧 Send welcome email to:", email);
    }

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
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

    return res.status(200).json({
      success: true,
      message: "Payment marked as paid",
      payment,
    });
  } catch (error) {
    console.error("markPaymentPaid error:", error);
    return res.status(500).json({ success: false, error: "Failed to mark payment" });
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
