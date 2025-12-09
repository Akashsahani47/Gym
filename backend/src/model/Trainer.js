import mongoose from "mongoose";

const TrainerSchema = new mongoose.Schema({
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
    default: 'trainer',
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
    specialization: [String],
    certification: String,
    experience: {
      type: Number,
      default: 0
    },
    bio: String
  },
  
  // Trainer Specific
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
  },
  
  schedule: [{
    day: String,
    startTime: String,
    endTime: String,
    isAvailable: { type: Boolean, default: true }
  }],
  
  hourlyRate: Number,
  
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
  
  clients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  }],
  
  ratings: [{
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    date: { type: Date, default: Date.now }
  }],
  
  averageRating: {
    type: Number,
    default: 0
  },
  
  lastLogin: Date,
  emailVerified: { 
    type: Boolean, 
    default: false 
  }
  
}, {
  timestamps: true
});

export const Trainer = mongoose.model("Trainer", TrainerSchema);