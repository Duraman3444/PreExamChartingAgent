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
  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User> {
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
          theme: 'dark',
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
    await signOut(auth);
  }

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<User> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }
    return userDoc.data() as User;
  }

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: new Date(),
    });
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
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

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }
}

export const authService = new AuthService(); 