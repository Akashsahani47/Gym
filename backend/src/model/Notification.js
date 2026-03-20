import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    recipientType: {
      type: String,
      enum: ["gym_owner", "member"],
      required: true,
    },
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      index: true,
    },
    type: {
      type: String,
      enum: [
        "payment_due",
        "payment_received",
        "membership_expiring",
        "membership_expired",
        "new_member_joined",
        "attendance_streak",
        "attendance_checkin",
        "system",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, type: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", NotificationSchema);
