import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema({
  // Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  
  // User Type & Status
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
  
  // Profile Information
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date
    },
    emergencyContact: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  
  // Member Specific
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
  },
  
  membership: {
    planId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'MembershipPlan' 
    },
    planName: String,
    startDate: Date,
    endDate: Date,
    status: { 
      type: String, 
      enum: ['pending', 'active', 'expired', 'cancelled'], 
      default: 'pending' 
    }
  },
  
  assignedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'GymOwner' 
  },
  assignedAt: Date,
  
  activationData: {
    activatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'GymOwner' 
    },
    activatedAt: Date,
    activationReason: String
  },
  
  healthMetrics: {
    height: Number,
    weight: Number,
    fitnessGoals: [String]
  },
  
  lastLogin: Date,
  emailVerified: { 
    type: Boolean, 
    default: false 
  }
  
}, {
  timestamps: true
});

export const Member = mongoose.model("Member", MemberSchema);