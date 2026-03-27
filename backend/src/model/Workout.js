import mongoose from "mongoose";

const SetSchema = new mongoose.Schema(
  {
    reps: { type: Number, default: 0 },
    weight: { type: Number, default: 0 }, // kg
    duration: { type: Number }, // seconds (for cardio/planks)
  },
  { _id: false }
);

const ExerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    muscleGroup: {
      type: String,
      enum: [
        "chest",
        "back",
        "shoulders",
        "biceps",
        "triceps",
        "legs",
        "core",
        "cardio",
        "full_body",
        "other",
      ],
      default: "other",
    },
    sets: [SetSchema],
    notes: String,
  },
  { _id: false }
);

const WorkoutSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    exercises: [ExerciseSchema],
    durationMinutes: { type: Number, default: 0 },
    notes: String,
    mood: {
      type: String,
      enum: ["great", "good", "okay", "tired", "bad"],
    },
  },
  { timestamps: true }
);

WorkoutSchema.index({ memberId: 1, date: -1 });
WorkoutSchema.index({ memberId: 1, date: 1 }, { unique: true });

export const Workout = mongoose.model("Workout", WorkoutSchema);
