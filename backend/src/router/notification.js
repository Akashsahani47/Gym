import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  generateExpiringNotifications,
} from "../controller/notification.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.get("/unread-count", verifyToken, getUnreadCount);
router.patch("/:id/read", verifyToken, markAsRead);
router.patch("/read-all", verifyToken, markAllAsRead);
router.delete("/:id", verifyToken, deleteNotification);
router.post("/generate-expiring", verifyToken, generateExpiringNotifications);

export default router;
