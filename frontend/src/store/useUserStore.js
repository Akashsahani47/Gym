import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hasHydrated: false,

      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      
      setHasHydrated: (state) => set({ hasHydrated: state }),
      
      updateUser: (updates) =>
        set((state) => ({
          user: { ...state.user, ...updates },
        })),
    }),
    {
      name: 'gym-user-store',
      onRehydrateStorage: () => {
        return (state) => {
          state?.setHasHydrated?.(true);
        };
      },
    }
  )
);

export default useUserStore;