import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '@/types';

export class AuthService {
  private authInitialized = false;
  private authInitPromise: Promise<void> | null = null;

  // Check if Firebase is configured
  private isFirebaseConfigured(): boolean {
    return auth !== null && db !== null;
  }

  // Wait for Firebase Auth to initialize and restore state
  async waitForAuthInit(): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      this.authInitialized = true;
      return;
    }

    if (this.authInitialized) {
      return;
    }

    if (!this.authInitPromise) {
      this.authInitPromise = new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, () => {
          this.authInitialized = true;
          unsubscribe();
          resolve();
        });
      });
    }

    return this.authInitPromise;
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User> {
    if (!this.isFirebaseConfigured()) {
      // Return mock user for development
      return this.getMockUser(email);
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user = await this.getUserProfile(credential.user.uid);
      return user;
    } catch (error) {
      throw new Error('Invalid email or password');
    }
  }

  // Sign up with email and password
  async signUp(email: string, password: string, name: string, role: User['role']): Promise<User> {
    if (!this.isFirebaseConfigured()) {
      // Return mock user for development
      return this.getMockUser(email, name, role);
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      await updateProfile(credential.user, {
        displayName: name,
      });

      // Create user document in Firestore
      const userData: User = {
        id: credential.user.uid,
        email,
        displayName: name,
        role,
        department: role === 'doctor' ? 'General Medicine' : role === 'nurse' ? 'General Ward' : 'Administration',
        licenseNumber: '',
        isActive: true,
        lastLogin: new Date(),
        preferences: {
          theme: 'light',
          language: 'en',
          autoSave: true,
          notificationsEnabled: true,
          aiAssistanceLevel: 'comprehensive',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', credential.user.uid), userData);
      
      return userData;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      return;
    }
    await signOut(auth);
  }

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<User> {
    if (!this.isFirebaseConfigured()) {
      return this.getMockUser('dev@example.com');
    }

    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }
    return userDoc.data() as User;
  }

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      return;
    }
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: new Date(),
    });
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    if (!this.isFirebaseConfigured()) {
      // For development, immediately call callback with mock user
      setTimeout(() => callback(this.getMockUser('dev@example.com')), 100);
      return () => {}; // Return empty unsubscribe function
    }

    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const user = await this.getUserProfile(firebaseUser.uid);
          callback(user);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Get current user (waits for auth initialization)
  async getCurrentUser(): Promise<FirebaseUser | null> {
    if (!this.isFirebaseConfigured()) {
      return null;
    }
    await this.waitForAuthInit();
    return auth.currentUser;
  }

  // Check if user is authenticated (waits for auth initialization)
  async isAuthenticated(): Promise<boolean> {
    if (!this.isFirebaseConfigured()) {
      return true; // Always authenticated in development mode
    }
    await this.waitForAuthInit();
    return !!auth.currentUser;
  }

  // Synchronous methods for when auth is already initialized
  getCurrentUserSync(): FirebaseUser | null {
    if (!this.isFirebaseConfigured()) {
      return null;
    }
    return auth.currentUser;
  }

  isAuthenticatedSync(): boolean {
    if (!this.isFirebaseConfigured()) {
      return true; // Always authenticated in development mode
    }
    return !!auth.currentUser;
  }

  // Mock user for development
  private getMockUser(email: string, name?: string, role?: User['role']): User {
    return {
      id: 'mock-user-id',
      email,
      displayName: name || 'Development User',
      role: role || 'doctor',
      department: 'Development',
      licenseNumber: 'DEV-001',
      isActive: true,
      lastLogin: new Date(),
      preferences: {
        theme: 'light',
        language: 'en',
        autoSave: true,
        notificationsEnabled: true,
        aiAssistanceLevel: 'comprehensive',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export const authService = new AuthService(); 