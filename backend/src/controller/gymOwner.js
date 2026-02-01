
import { GymOwner } from "../model/GymOwner.js";
import { Gym } from "../model/gym.js";
import bcrypt from "bcryptjs";



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
  } catch (error) {
    console.error("Create Gym Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create gym",
    });
  }
};

export const getGymOwnerinfo = async (req, res) => {
  try {
    const user = req.user; // ✅ now exists

    if (user.userType !== "gym_owner") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const gyms = await Gym.find({ owner: user._id });

    const stats = {
      totalMembers: gyms.reduce((sum, g) => sum + (g.stats?.totalMembers || 0), 0),
      activeMembers: gyms.reduce((sum, g) => sum + (g.stats?.activeMembers || 0), 0),
      monthlyRevenue: gyms.reduce((sum, g) => sum + (g.stats?.monthlyRevenue || 0), 0),
      occupancyRate: gyms.length ? Math.round(
        gyms.reduce((a, g) => a + (g.stats?.activeMembers || 0), 0) /
        gyms.reduce((a, g) => a + (g.settings?.maxCapacity || 1), 0) * 100
      ) : 0
    };

    res.status(200).json({
      success: true,
      user,
      gyms,
      stats
    });

  } catch (error) {
    console.error("getGymOwnerInfo error:", error);
    res.status(500).json({
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



