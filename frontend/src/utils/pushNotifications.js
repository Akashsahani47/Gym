const API = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Check if push notifications are supported in this browser
 */
export const isPushSupported = () => {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
};

/**
 * Register the service worker
 */
export const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    console.log("SW registered:", registration.scope);
    return registration;
  } catch (err) {
    console.error("SW registration failed:", err);
    return null;
  }
};

/**
 * Get the VAPID public key from the backend
 */
const getVapidPublicKey = async () => {
  const res = await fetch(`${API}/api/push/vapid-public-key`);
  const data = await res.json();
  if (!data.success) throw new Error("Failed to get VAPID key");
  return data.publicKey;
};

/**
 * Convert a base64 string to a Uint8Array (needed for applicationServerKey)
 */
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Subscribe to push notifications
 * Returns the subscription object if successful, null otherwise
 */
export const subscribeToPush = async (token) => {
  if (!isPushSupported()) return null;

  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    // Get SW registration
    const registration = await navigator.serviceWorker.ready;

    // Get VAPID key
    const vapidPublicKey = await getVapidPublicKey();
    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey,
    });

    // Send subscription to backend
    const res = await fetch(`${API}/api/push/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ subscription: subscription.toJSON() }),
    });

    const data = await res.json();
    if (!data.success) throw new Error("Backend subscription failed");

    return subscription;
  } catch (err) {
    console.error("Push subscription error:", err);
    return null;
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPush = async (token) => {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) return true;

    // Unsubscribe from browser
    await subscription.unsubscribe();

    // Remove from backend
    await fetch(`${API}/api/push/unsubscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    return true;
  } catch (err) {
    console.error("Push unsubscribe error:", err);
    return false;
  }
};

/**
 * Check if the user is currently subscribed to push
 */
export const isPushSubscribed = async () => {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
};

/**
 * Get the current notification permission status
 */
export const getNotificationPermission = () => {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission; // "granted", "denied", or "default"
};
