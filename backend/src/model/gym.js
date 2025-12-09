import mongoose from "mongoose";

const GymSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GymOwner',
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contact: {
    phone: String,
    email: String
  },
  facilities: [String],
  operatingHours: {
    opening: String,
    closing: String,
    days: [String]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'under_maintenance'],
    default: 'active'
  },
  isAcceptingRegistrations: {
    type: Boolean,
    default: true
  },
  membershipPlans: [{
    name: String,
    price: Number,
    duration: Number,
    features: [String]
  }]
}, {
  timestamps: true
});

export const Gym = mongoose.model('Gym', GymSchema);