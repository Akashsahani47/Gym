import { Notification } from "../model/Notification.js";

/**
 * Create a notification. Silently fails to avoid breaking main flows.
 */
export const createNotification = async ({
  recipientId,
  recipientType,
  gymId,
  type,
  title,
  message,
  link,
  metadata,
}) => {
  try {
    await Notification.create({
      recipientId,
      recipientType,
      gymId,
      type,
      title,
      message,
      link,
      metadata,
    });
  } catch (err) {
    console.error("createNotification error:", err.message);
  }
};

/**
 * Prevent duplicate notifications: check if one already exists for this recipient + type + today
 */
export const notificationExistsToday = async (recipientId, type, metadata = {}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const query = { recipientId, type, createdAt: { $gte: today } };
  if (metadata.memberId) query["metadata.memberId"] = metadata.memberId;
  if (metadata.paymentId) query["metadata.paymentId"] = metadata.paymentId;
  const existing = await Notification.findOne(query);
  return !!existing;
};
