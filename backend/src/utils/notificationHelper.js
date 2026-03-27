import webpush from "web-push";
import { Notification } from "../model/Notification.js";
import { PushSubscription } from "../model/PushSubscription.js";

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || "mailto:admin@zelvoo.in",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Send push notification to all active subscriptions of a user.
 * Silently fails to avoid breaking main flows.
 */
const sendPushToUser = async (recipientId, { title, message, type, link }) => {
  try {
    const subscriptions = await PushSubscription.find({
      userId: recipientId,
      isActive: true,
    });

    if (subscriptions.length === 0) return;

    const payload = JSON.stringify({
      title,
      body: message,
      icon: "/icons/icon-192x192.svg",
      badge: "/icons/icon-72x72.svg",
      tag: type,
      data: { url: link || "/" },
    });

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(sub.subscription, payload)
      )
    );

    // Clean up expired/invalid subscriptions
    for (let i = 0; i < results.length; i++) {
      if (results[i].status === "rejected") {
        const statusCode = results[i].reason?.statusCode;
        // 410 Gone or 404 Not Found means subscription is no longer valid
        if (statusCode === 410 || statusCode === 404) {
          await PushSubscription.findByIdAndDelete(subscriptions[i]._id);
        }
      }
    }
  } catch (err) {
    console.error("sendPushToUser error:", err.message);
  }
};

/**
 * Create a notification. Silently fails to avoid breaking main flows.
 * Also sends a web push notification if the user has active subscriptions.
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

    // Fire-and-forget push notification
    sendPushToUser(recipientId, { title, message, type, link });
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
