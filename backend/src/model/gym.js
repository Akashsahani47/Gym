// models/Gym.js
import mongoose from "mongoose";

const GymSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC INFO
    ========================== */
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true
    },

    description: {
      type: String,
      trim: true
    },

    /* =========================
       OWNER (AUTH USER)
    ========================== */
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // gym_owner
      required: true,
      index: true
    },

    /* =========================
       CONTACT INFO
    ========================== */
    contact: {
      email: {
        type: String,
        lowercase: true,
        trim: true
      },
      phone: String,
      website: String,
      socialMedia: {
        facebook: String,
        instagram: String,
        twitter: String
      }
    },

    /* =========================
       LOCATION
    ========================== */
    address: {
      street: String,
      city: {
        type: String,
        index: true
      },
      state: String,
      country: String,
      zipCode: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },

    /* =========================
       MEDIA
    ========================== */
    logo: String,
    coverImage: String,
    images: [String],

    /* =========================
       FACILITIES
    ========================== */
    facilities: [
      {
        name: String,
        description: String,
        available: {
          type: Boolean,
          default: true
        }
      }
    ],

    /* =========================
       OPERATING HOURS
    ========================== */
    operatingHours: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday"
          ],
          required: true
        },
        open: {
          type: String,
          match: /^([01]\d|2[0-3]):([0-5]\d)$/
        },
        close: {
          type: String,
          match: /^([01]\d|2[0-3]):([0-5]\d)$/
        },
        isClosed: {
          type: Boolean,
          default: false
        }
      }
    ],

    /* =========================
       MEMBERSHIP PLANS
    ========================== */
    membershipPlans: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true
        },
        name: String,
        description: String,
        price: Number,
        duration: {
          type: Number // days
        },
        features: [String],
        isActive: {
          type: Boolean,
          default: true
        }
      }
    ],

    /* =========================
       STATS (CACHE ONLY)
    ========================== */
    stats: {
      totalMembers: { type: Number, default: 0 },
      activeMembers: { type: Number, default: 0 },
      totalTrainers: { type: Number, default: 0 },
      monthlyRevenue: { type: Number, default: 0 }
    },

    /* =========================
       SETTINGS
    ========================== */
    settings: {
      allowWalkIns: {
        type: Boolean,
        default: true
      },
      requireBooking: {
        type: Boolean,
        default: false
      },
      maxCapacity: Number,
      autoCheckout: {
        type: Boolean,
        default: true
      }
    },

    /* =========================
       APPROVAL & STATUS
    ========================== */
    approval: {
      isApproved: {
        type: Boolean,
        default: false
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      approvedAt: Date
    },

    status: {
      type: String,
      enum: ["active", "inactive", "under_maintenance", "closed"],
      default: "active",
      index: true
    },

    /* =========================
       SOFT DELETE
    ========================== */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

/* =========================
   INDEXES
========================== */
GymSchema.index({ owner: 1 });
GymSchema.index({ status: 1 });
GymSchema.index({ "address.city": 1 });
GymSchema.index({ isDeleted: 1 });


export const Gym = mongoose.model('Gym', GymSchema);