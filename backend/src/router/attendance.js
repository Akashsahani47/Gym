import express from "express";
import { verifyToken, requireUserType } from "../middleware/authMiddleware.js";
import {
  generateDailyPin,
  getTodayPin,
  getQRPayload,
  checkInWithPin,
  checkInWithQR,
  checkOut,
  getMyAttendance,
  getGymAttendance,
  getAttendanceStats,
} from "../controller/attendance.js";

const router = express.Router();

// ─── Gym Owner routes ───────────────────────────────────────────────────────
router.post("/generate-pin", verifyToken, requireUserType("gym_owner"), generateDailyPin);
router.get("/today-pin/:gymId", verifyToken, requireUserType("gym_owner"), getTodayPin);
router.get("/gym/:gymId", verifyToken, requireUserType("gym_owner"), getGymAttendance);
router.get("/gym/:gymId/stats", verifyToken, requireUserType("gym_owner"), getAttendanceStats);
router.get("/gym/:gymId/qr-payload", verifyToken, requireUserType("gym_owner"), getQRPayload);

// ─── Member routes ──────────────────────────────────────────────────────────
router.post("/check-in/pin", verifyToken, requireUserType("member"), checkInWithPin);
router.post("/check-in/qr", verifyToken, requireUserType("member"), checkInWithQR);
router.post("/check-out", verifyToken, requireUserType("member"), checkOut);
router.get("/my", verifyToken, requireUserType("member"), getMyAttendance);

export default router;
