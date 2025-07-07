import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
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
        
        // Try to initialize auth service, fallback to mock user for development
        try {
          authService.onAuthStateChanged((user) => {
            set({ user, isAuthenticated: !!user, isLoading: false });
          });
        } catch (error) {
          console.log('Auth service not available, using mock user for development');
          
          // Create a mock user for development
          const mockUser: User = {
            id: 'dev-user-1',
            email: 'dev@example.com',
            displayName: 'Dr. Dev User',
            role: 'doctor',
            department: 'Development',
            licenseNumber: 'DEV123456',
            isActive: true,
            lastLogin: new Date(),
            preferences: {
              theme: 'dark',
              language: 'en',
              autoSave: true,
              notificationsEnabled: true,
              aiAssistanceLevel: 'comprehensive',
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set({ user: mockUser, isAuthenticated: true, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
); 