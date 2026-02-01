import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },

  password: {
    type: String,
    select: false
  },

  userType: {
    type: String,
    default: 'member',
    immutable: true
  },

  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'suspended'],
    default: 'pending'
  },

  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    dateOfBirth: Date,
    emergencyContact: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },

  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true,
    index: true
  },

  membership: {
    planId: mongoose.Schema.Types.ObjectId,
    planName: String,
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'cancelled'],
      default: 'pending'
    }
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  assignedAt: Date,

  healthMetrics: {
    height: Number,
    weight: Number,
    fitnessGoals: [String]
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  lastLogin: Date,
  emailVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

MemberSchema.index({ email: 1, gymId: 1 }, { unique: true });

export const Member = mongoose.model("Member", MemberSchema);
