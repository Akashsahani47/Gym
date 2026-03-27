import mongoose from "mongoose";

const BodyLogSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    weight: { type: Number }, // kg
    height: { type: Number }, // cm
    bodyFat: { type: Number }, // percentage
    bmi: { type: Number }, // auto-calculated
    notes: String,
  },
  { timestamps: true }
);

BodyLogSchema.index({ memberId: 1, date: -1 });
BodyLogSchema.index({ memberId: 1, date: 1 }, { unique: true });

// Auto-calculate BMI before save
BodyLogSchema.pre("save", function (next) {
  if (this.weight && this.height) {
    const heightM = this.height / 100;
    this.bmi = parseFloat((this.weight / (heightM * heightM)).toFixed(1));
  }
  next();
});

export const BodyLog = mongoose.model("BodyLog", BodyLogSchema);
