import { PushSubscription } from "../model/PushSubscription.js";

// ─── Subscribe to push notifications ─────────────────────────────────────────
export const subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ success: false, error: "Invalid subscription object" });
    }

    // Upsert: update if same endpoint exists, create otherwise
    await PushSubscription.findOneAndUpdate(
      { userId: req.user._id, "subscription.endpoint": subscription.endpoint },
      {
        userId: req.user._id,
        userType: req.user.userType,
        subscription,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    return res.json({ success: true, message: "Push subscription saved" });
  } catch (error) {
    console.error("push subscribe error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Unsubscribe from push notifications ─────────────────────────────────────
export const unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ success: false, error: "Endpoint required" });
    }

    await PushSubscription.findOneAndDelete({
      userId: req.user._id,
      "subscription.endpoint": endpoint,
    });

    return res.json({ success: true, message: "Push subscription removed" });
  } catch (error) {
    console.error("push unsubscribe error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Get push subscription status ────────────────────────────────────────────
export const getStatus = async (req, res) => {
  try {
    const count = await PushSubscription.countDocuments({
      userId: req.user._id,
      isActive: true,
    });

    return res.json({ success: true, isSubscribed: count > 0 });
  } catch (error) {
    console.error("push status error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
