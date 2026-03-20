import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
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

    date: { type: String, required: true }, // YYYY-MM-DD
    checkInTime: { type: Date, required: true },
    checkOutTime: { type: Date, default: null },

    method: {
      type: String,
      enum: ["pin", "qr"],
      required: true,
    },

    // Denormalised for fast display
    memberName: { type: String },
    memberEmail: { type: String },
    gymName: { type: String },
  },
  { timestamps: true }
);

// One check-in per member per day
AttendanceSchema.index({ memberId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ gymId: 1, date: 1 });

export const Attendance = mongoose.model("Attendance", AttendanceSchema);
