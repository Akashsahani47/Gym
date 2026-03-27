import mongoose from "mongoose";

const PushSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userType: {
      type: String,
      enum: ["gym_owner", "member", "trainer"],
      required: true,
    },
    subscription: {
      endpoint: { type: String, required: true },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
      },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One subscription per endpoint per user
PushSubscriptionSchema.index(
  { userId: 1, "subscription.endpoint": 1 },
  { unique: true }
);

export const PushSubscription = mongoose.model(
  "PushSubscription",
  PushSubscriptionSchema
);
