import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  addMember,
  createGym,
  deleteGym,
  getAllMembers,
  getGymById,
  getGymOwnerinfo,
  getOwnerGyms,
  updateGym,
  updateGymOwnerinfo,
  getPayments,
  markPaymentPaid,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  sendVerificationEmail,
  verifyEmail,
} from "../controller/gymOwner.js";

const router = express.Router();

router.get("/info", verifyToken, getGymOwnerinfo);
router.put("/updateinfo", verifyToken, updateGymOwnerinfo);
router.post("/addgyms", verifyToken, createGym);
router.get("/gyms", verifyToken, getOwnerGyms);
router.get("/gyms/:id", verifyToken, getGymById);
router.put("/gyms/:id", verifyToken, updateGym);
router.delete("/gyms/:id", verifyToken, deleteGym);
router.post("/addmembers", verifyToken, addMember);
router.get("/members", verifyToken, getAllMembers);
router.get("/payments", verifyToken, getPayments);
router.post("/payments/mark-paid/:paymentId", verifyToken, markPaymentPaid);
router.post("/subscription/create-order", verifyToken, createSubscriptionOrder);
router.post("/subscription/verify-payment", verifyToken, verifySubscriptionPayment);
router.post("/send-verification", verifyToken, sendVerificationEmail);
router.get("/verify-email", verifyEmail); // no auth — accessed via email link
export default router;
