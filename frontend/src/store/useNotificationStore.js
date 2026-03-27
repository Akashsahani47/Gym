import { create } from 'zustand';
import {
  isPushSupported,
  isPushSubscribed,
  subscribeToPush,
  unsubscribeFromPush,
  getNotificationPermission,
} from '@/utils/pushNotifications';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  pagination: { page: 1, limit: 20, total: 0 },

  // Push notification state
  pushSupported: false,
  pushSubscribed: false,
  pushPermission: 'default', // 'default' | 'granted' | 'denied' | 'unsupported'
  pushLoading: false,

  // Initialize push state
  initPushState: async () => {
    const supported = isPushSupported();
    set({ pushSupported: supported });

    if (!supported) {
      set({ pushPermission: 'unsupported' });
      return;
    }

    const permission = getNotificationPermission();
    const subscribed = await isPushSubscribed();
    set({ pushPermission: permission, pushSubscribed: subscribed });
  },

  // Toggle push subscription
  togglePush: async (token) => {
    const { pushSubscribed } = get();
    set({ pushLoading: true });

    try {
      if (pushSubscribed) {
        const success = await unsubscribeFromPush(token);
        if (success) set({ pushSubscribed: false });
      } else {
        const subscription = await subscribeToPush(token);
        if (subscription) {
          set({ pushSubscribed: true, pushPermission: 'granted' });
        } else {
          // Permission might have been denied
          const permission = getNotificationPermission();
          set({ pushPermission: permission });
        }
      }
    } finally {
      set({ pushLoading: false });
    }
  },

  fetchUnreadCount: async (token) => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) set({ unreadCount: data.count });
    } catch {}
  },

  fetchNotifications: async (token, page = 1) => {
    if (!token) return;
    set({ loading: true });
    try {
      const res = await fetch(`${API}/api/notifications?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        set({
          notifications: page === 1 ? data.notifications : [...get().notifications, ...data.notifications],
          pagination: data.pagination,
        });
      }
    } catch {} finally {
      set({ loading: false });
    }
  },

  markAsRead: async (token, id) => {
    if (!token) return;
    try {
      await fetch(`${API}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {}
  },

  markAllAsRead: async (token) => {
    if (!token) return;
    try {
      await fetch(`${API}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {}
  },

  deleteNotification: async (token, id) => {
    if (!token) return;
    try {
      await fetch(`${API}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== id),
        unreadCount: state.notifications.find((n) => n._id === id && !n.isRead)
          ? state.unreadCount - 1
          : state.unreadCount,
      }));
    } catch {}
  },
}));

export default useNotificationStore;
