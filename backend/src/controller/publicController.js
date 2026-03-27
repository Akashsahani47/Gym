import { Gym } from "../model/gym.js";
import { Member } from "../model/Member.js";
import { GymOwner } from "../model/GymOwner.js";
import bcrypt from "bcryptjs";
import { createNotification } from "../utils/notificationHelper.js";

// ─── Search Gyms (public) ────────────────────────────────────────────────────
export const searchGyms = async (req, res) => {
  try {
    const { q, city } = req.query;

    const filter = { isDeleted: false, status: "active" };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { "address.city": { $regex: q, $options: "i" } },
        { "address.state": { $regex: q, $options: "i" } },
      ];
    }

    if (city) {
      filter["address.city"] = { $regex: city, $options: "i" };
    }

    const gyms = await Gym.find(filter)
      .select("name slug description address facilities membershipPlans operatingHours stats")
      .sort({ "stats.totalMembers": -1 })
      .limit(50)
      .lean();

    const results = gyms.map((gym) => {
      const activePlans = (gym.membershipPlans || []).filter((p) => p.isActive);
      const minPrice = activePlans.length > 0 ? Math.min(...activePlans.map((p) => p.price)) : 0;
      return {
        name: gym.name,
        slug: gym.slug,
        description: gym.description,
        address: gym.address,
        totalMembers: gym.stats?.totalMembers || 0,
        activeMembers: gym.stats?.activeMembers || 0,
        facilitiesCount: (gym.facilities || []).filter((f) => f.available).length,
        plansCount: activePlans.length,
        startingPrice: minPrice,
      };
    });

    return res.json({ success: true, gyms: results });
  } catch (error) {
    console.error("searchGyms error:", error);
    return res.status(500).json({ success: false, error: "Failed to search gyms" });
  }
};

// ─── Get Gym Info by Slug (public) ───────────────────────────────────────────
export const getGymBySlug = async (req, res) => {
  try {
    const gym = await Gym.findOne({
      slug: req.params.slug,
      isDeleted: false,
      status: "active",
    }).select("name slug description address contact facilities membershipPlans operatingHours");

    if (!gym) {
      return res.status(404).json({ success: false, error: "Gym not found" });
    }

    const activePlans = (gym.membershipPlans || []).filter((p) => p.isActive);

    return res.json({
      success: true,
      gym: {
        name: gym.name,
        slug: gym.slug,
        description: gym.description,
        address: gym.address,
        contact: gym.contact,
        facilities: (gym.facilities || []).filter((f) => f.available).map((f) => ({
          name: f.name,
          description: f.description,
        })),
        membershipPlans: activePlans.map((p) => ({
          _id: p._id,
          name: p.name,
          description: p.description,
          price: p.price,
          duration: p.duration,
          features: p.features,
        })),
        operatingHours: gym.operatingHours,
      },
    });
  } catch (error) {
    console.error("getGymBySlug error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch gym" });
  }
};

// ─── Self-Register for a Gym (public) ────────────────────────────────────────
export const selfRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, error: "First name, last name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
    }
    if (!phone) {
      return res.status(400).json({ success: false, error: "Phone number is required" });
    }

    const gym = await Gym.findOne({
      slug: req.params.slug,
      isDeleted: false,
      status: "active",
    });
    if (!gym) {
      return res.status(404).json({ success: false, error: "Gym not found" });
    }

    // Check for duplicate email in this gym
    const exists = await Member.findOne({ email: email.toLowerCase(), gymId: gym._id, isDeleted: false });
    if (exists) {
      return res.status(409).json({ success: false, error: "This email is already registered in this gym" });
    }

    // Prevent gym owner from registering as a member
    const ownerExists = await GymOwner.findOne({ email: email.toLowerCase() });
    if (ownerExists) {
      return res.status(409).json({ success: false, error: "This email belongs to a gym owner and cannot be used to register as a member" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await Member.create({
      email: email.toLowerCase(),
      password: hashed,
      status: "pending",
      profile: {
        firstName,
        lastName,
        phone,
      },
      gymId: gym._id,
      membership: { status: "pending" },
      createdBy: gym.owner,
    });

    // Update gym stats
    await Gym.findByIdAndUpdate(gym._id, {
      $inc: { "stats.totalMembers": 1 },
    });

    // Notify the gym owner
    createNotification({
      recipientId: gym.owner,
      recipientType: "gym_owner",
      gymId: gym._id,
      type: "new_member_joined",
      title: "New Join Request",
      message: `${firstName} ${lastName} has requested to join ${gym.name}`,
      link: "/dashboard/gymOwner/all_members",
    });

    return res.status(201).json({
      success: true,
      message: "Registration submitted! You will be notified once the gym owner approves your request.",
    });
  } catch (error) {
    console.error("selfRegister error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: "This email is already registered in this gym" });
    }
    return res.status(500).json({ success: false, error: "Registration failed" });
  }
};
