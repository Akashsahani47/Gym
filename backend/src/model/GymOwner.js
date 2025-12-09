import mongoose from "mongoose";

const GymOwnerSchema = new mongoose.Schema({
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
    default: 'gym_owner',
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
    gymName: {
      type: String,
      required: true,
      trim: true
    },
    
    gymRegistration: {
      type: String,
      trim: true
    }
  },
  
  // Gym Owner Specific
  gyms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym'
  }],
  
  gymAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  subscription: {
    plan: String,
    status: { 
      type: String, 
      enum: ['active', 'expired', 'cancelled'], 
      default: 'active' 
    },
    renewalDate: Date
  },
  
  settings: {
    notifications: { type: Boolean, default: true },
    emailReports: { type: Boolean, default: true }
  },
  
  activationData: {
    activatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'GymOwner' 
    },
    activatedAt: Date,
    activationReason: String
  },
  
  lastLogin: Date,
  emailVerified: { 
    type: Boolean, 
    default: false 
  }
  
}, {
  timestamps: true
});

export const GymOwner = mongoose.model("GymOwner", GymOwnerSchema);