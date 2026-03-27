import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { subscribe, unsubscribe, getStatus } from "../controller/push.js";

const router = express.Router();

router.post("/subscribe", verifyToken, subscribe);
router.post("/unsubscribe", verifyToken, unsubscribe);
router.get("/status", verifyToken, getStatus);

// Public endpoint to get the VAPID public key
router.get("/vapid-public-key", (req, res) => {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    return res.status(500).json({ success: false, error: "VAPID keys not configured" });
  }
  return res.json({ success: true, publicKey: vapidPublicKey });
});

export default router;
