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
    plan: {
      type: String,
      enum: ['basic', 'pro', 'enterprise'],
      default: 'basic'
    },
    amount: { type: Number, default: 500 }, // monthly fee in INR
    status: {
      type: String,
      enum: ['trial', 'active', 'expired', 'cancelled'],
      default: 'trial'
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'annual'],
      default: 'monthly'
    },
    startDate: Date,
    renewalDate: Date,      // next due date
    lastPaidAt: Date,       // timestamp of last successful payment
    lastPaidMonth: String,  // "YYYY-MM" e.g. "2025-03"
    paymentHistory: [
      {
        razorpayOrderId:   { type: String },
        razorpayPaymentId: { type: String },
        amount:  { type: Number },
        month:   { type: String }, // "YYYY-MM"
        paidAt:  { type: Date },
        status:  { type: String, enum: ['success', 'failed'], default: 'success' }
      }
    ]
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