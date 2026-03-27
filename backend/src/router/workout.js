import express from "express";
import { verifyToken, requireUserType } from "../middleware/authMiddleware.js";
import {
  saveWorkout,
  getWorkoutByDate,
  getWorkoutHistory,
  deleteWorkout,
  getCalendarData,
  getStreaksAndBadges,
} from "../controller/workout.js";
import {
  saveBodyLog,
  getBodyLogs,
  deleteBodyLog,
} from "../controller/bodylog.js";

const router = express.Router();

const memberOnly = [verifyToken, requireUserType("member")];

// Workouts
router.post("/", ...memberOnly, saveWorkout);
router.get("/history", ...memberOnly, getWorkoutHistory);
router.get("/calendar", ...memberOnly, getCalendarData);
router.get("/streaks", ...memberOnly, getStreaksAndBadges);
router.get("/:date", ...memberOnly, getWorkoutByDate);
router.delete("/:date", ...memberOnly, deleteWorkout);

// Body logs / BMI
router.post("/body", ...memberOnly, saveBodyLog);
router.get("/body/history", ...memberOnly, getBodyLogs);
router.delete("/body/:date", ...memberOnly, deleteBodyLog);

export default router;
