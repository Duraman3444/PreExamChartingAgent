import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/services/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
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

// Global auth state listener to prevent duplicate setup
let authListenerSetup = false;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isInitialized: false,

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
    // Prevent duplicate initialization
    if (get().isInitialized) {
      console.log('🔐 [Auth Debug] Auth already initialized, skipping...');
      return;
    }

    console.log('🔐 [Auth Debug] Starting auth initialization...');
    set({ isLoading: true, error: null });
    
    try {
      // Set up auth state listener FIRST before checking current user
      if (!authListenerSetup) {
        console.log('🔐 [Auth Debug] Setting up auth state listener...');
        authListenerSetup = true;
        
        authService.onAuthStateChanged(async (user) => {
          const currentState = get();
          console.log('🔐 [Auth Debug] Auth state changed:', {
            hasUser: !!user,
            userId: user?.id,
            currentStateInitialized: currentState.isInitialized
          });
          
          // Only update state if it's actually changed to prevent unnecessary re-renders
          if (user && (!currentState.user || currentState.user.id !== user.id)) {
            console.log('🔐 [Auth Debug] Setting authenticated user');
            set({ user, isAuthenticated: true, isInitialized: true, isLoading: false });
          } else if (!user && currentState.user) {
            console.log('🔐 [Auth Debug] Clearing authenticated user');
            set({ user: null, isAuthenticated: false, isInitialized: true, isLoading: false });
          } else if (!currentState.isInitialized) {
            // First time initialization with no user
            console.log('🔐 [Auth Debug] First time initialization - no user');
            set({ user: null, isAuthenticated: false, isInitialized: true, isLoading: false });
          }
        });
      }

      // Wait for Firebase auth to initialize and potentially restore session
      console.log('🔐 [Auth Debug] Waiting for auth initialization...');
      await authService.waitForAuthInit();
      
      // Get current user state (this will be handled by the listener above)
      const currentUser = await authService.getCurrentUser();
      console.log('🔐 [Auth Debug] Current user after init:', !!currentUser);
      
      // If listener hasn't fired yet, manually set initial state
      if (!get().isInitialized) {
        console.log('🔐 [Auth Debug] Manually setting initial state...');
        if (currentUser) {
          const user = await authService.getUserProfile(currentUser.uid);
          console.log('🔐 [Auth Debug] Setting user from profile');
          set({ user, isAuthenticated: true, isInitialized: true, isLoading: false });
        } else {
          console.log('🔐 [Auth Debug] No user found, setting unauthenticated state');
          set({ user: null, isAuthenticated: false, isInitialized: true, isLoading: false });
        }
      }
    } catch (error: any) {
      console.error('❌ [Auth Debug] Firebase auth initialization failed:', error);
      set({ 
        error: error.message, 
        isLoading: false, 
        user: null, 
        isAuthenticated: false,
        isInitialized: true 
      });
    }
  },
})); 