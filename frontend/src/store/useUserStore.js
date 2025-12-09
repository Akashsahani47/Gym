import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      
      // Actions
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      
      // Getters
      getUserType: () => get().user?.userType || null,
      isAuthenticated: () => !!get().user && !!get().token,
      isActive: () => get().user?.status || inactive,
      // Optional: Update user profile
      updateUser: (updates) => 
        set((state) => ({ 
          user: { ...state.user, ...updates } 
        })),
    }),
    {
      name: "gym-user-store"
    }
  )
);

export default useUserStore;