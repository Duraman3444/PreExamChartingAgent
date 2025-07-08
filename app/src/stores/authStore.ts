import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/services/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: User['role']) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // State
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const user = await authService.signIn(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, name: string, role: User['role']) => {
    try {
      set({ isLoading: true, error: null });
      const user = await authService.signUp(email, password, name, role);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      await authService.signOut();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  initialize: async () => {
    set({ isLoading: true });
    
    try {
      // Wait for Firebase auth to initialize and restore state
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        // User is already signed in, get their profile
        const user = await authService.getUserProfile(currentUser.uid);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        // No current user
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
      
      // Set up auth state change listener for future changes
      authService.onAuthStateChanged((user) => {
        set({ user, isAuthenticated: !!user });
      });
    } catch (error: any) {
      console.error('Firebase auth initialization failed:', error);
      set({ error: error.message, isLoading: false, user: null, isAuthenticated: false });
    }
  },
})); 