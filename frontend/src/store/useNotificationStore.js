import { create } from 'zustand';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  pagination: { page: 1, limit: 20, total: 0 },

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
