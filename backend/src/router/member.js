import express from "express";
import { verifyToken, requireUserType } from "../middleware/authMiddleware.js";
import { getMyPayments, updateMemberProfile } from "../controller/member.js";
import { getMyGymHolidays } from "../controller/holiday.js";

const router = express.Router();

router.get("/payments", verifyToken, requireUserType("member"), getMyPayments);
router.put("/profile", verifyToken, requireUserType("member"), updateMemberProfile);
router.get("/holidays", verifyToken, requireUserType("member"), getMyGymHolidays);

export default router;
