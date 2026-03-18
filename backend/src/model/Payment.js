import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
      index: true,
    },
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
      index: true,
    },
    gymOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GymOwner",
      required: true,
      index: true,
    },

    // Billing period  e.g. "2025-03"
    month: { type: String, required: true }, // YYYY-MM
    year:  { type: Number, required: true },

    amount: { type: Number, required: true, min: 0 },

    method: {
      type: String,
      enum: ["cash", "online", "card", "bank_transfer"],
      default: "cash",
    },

    status: {
      type: String,
      enum: ["paid", "pending", "overdue"],
      default: "pending",
      index: true,
    },

    paidAt: { type: Date },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GymOwner",
    },

    notes: { type: String, trim: true },

    // Denormalised for fast display
    memberName:  { type: String },
    memberEmail: { type: String },
    gymName:     { type: String },
    planName:    { type: String },
  },
  { timestamps: true }
);

// Prevent duplicate payment record per member per month
PaymentSchema.index({ memberId: 1, month: 1 }, { unique: true });

export const Payment = mongoose.model("Payment", PaymentSchema);
