import express from "express";
import { verifyToken, requireUserType } from "../middleware/authMiddleware.js";
import { getMyPayments, updateMemberProfile } from "../controller/member.js";

const router = express.Router();

router.get("/payments", verifyToken, requireUserType("member"), getMyPayments);
router.put("/profile", verifyToken, requireUserType("member"), updateMemberProfile);

export default router;
