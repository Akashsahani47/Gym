import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
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
  userType: {
    type: String,
    required: true,
    enum: ['member', 'gym_owner', 'trainer', 'admin'], 
    default: 'member'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'suspended'],
    default: 'pending'
  },
  emailVerified: { 
    type: Boolean, 
    default: false 
  },
  activationData: {
    activatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'
    },
    activatedAt: { 
      type: Date 
    },
    activationReason: String
  },
  lastLogin: {
    type: Date
  },
  // Reference to type-specific document
  profileRef: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userType'
  }
}, {
  timestamps: true
});

export const User = mongoose.model("User", UserSchema);