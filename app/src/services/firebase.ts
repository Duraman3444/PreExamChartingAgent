/// <reference types="vite/client" />
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Check if Firebase config is available
const isFirebaseConfigured = () => {
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  console.log('🔧 [Firebase Debug] Checking Firebase configuration...');
  
  const configStatus = requiredEnvVars.map(varName => {
    const value = import.meta.env[varName];
    const isConfigured = value && value !== 'your_firebase_api_key_here' && value !== 'your_firebase_auth_domain_here' && value !== 'your_firebase_project_id_here' && value !== 'your_firebase_storage_bucket_here' && value !== 'your_firebase_messaging_sender_id_here' && value !== 'your_firebase_app_id_here';
    return {
      variable: varName,
      hasValue: !!value,
      isConfigured,
      valuePrefix: value?.substring(0, 10) || 'none'
    };
  });
  
  console.log('🔧 [Firebase Debug] Configuration status:', configStatus);
  
  const allConfigured = requiredEnvVars.every(varName => {
    const value = import.meta.env[varName];
    return value && value !== 'your_firebase_api_key_here' && value !== 'your_firebase_auth_domain_here' && value !== 'your_firebase_project_id_here' && value !== 'your_firebase_storage_bucket_here' && value !== 'your_firebase_messaging_sender_id_here' && value !== 'your_firebase_app_id_here';
  });
  
  console.log('🔧 [Firebase Debug] All variables configured:', allConfigured);
  return allConfigured;
};

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

console.log('🔧 [Firebase Debug] Firebase config object created:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  projectId: firebaseConfig.projectId
});

// Initialize Firebase only if properly configured
let app: FirebaseApp | undefined;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (isFirebaseConfigured()) {
  try {
    console.log('✅ [Firebase Debug] Starting Firebase initialization...');
    app = initializeApp(firebaseConfig);
    console.log('✅ [Firebase Debug] Firebase app initialized');
    
    auth = getAuth(app);
    console.log('✅ [Firebase Debug] Firebase Auth initialized');
    
    db = getFirestore(app);
    console.log('✅ [Firebase Debug] Firestore initialized');
    
    storage = getStorage(app);
    console.log('✅ [Firebase Debug] Firebase Storage initialized');

    // Set auth persistence explicitly to ensure session survives refresh
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('✅ [Firebase Debug] Auth persistence set to local storage');
      })
      .catch((error) => {
        console.error('❌ [Firebase Debug] Failed to set auth persistence:', error);
      });
  } catch (error) {
    console.error('❌ [Firebase Debug] Firebase initialization failed:', error);
    // Create mock services for development
    app = undefined;
    auth = null as any;
    db = null as any;
    storage = null as any;
  }
} else {
  console.warn('⚠️ [Firebase Debug] Firebase configuration not found. Running in development mode without Firebase.');
  console.warn('⚠️ [Firebase Debug] To enable Firebase, create an .env file in the app directory with your Firebase config.');
  
  // Create mock services for development
  app = undefined;
  auth = null as any;
  db = null as any;
  storage = null as any;
}

export { auth, db, storage };
export default app;

// Firebase Functions service wrapper
export class FirebaseFunctionsService {
  private functionsUrl: string;
  private auth: Auth;

  constructor() {
    this.functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'https://us-central1-medicalchartingapp.cloudfunctions.net';
    this.auth = auth;
  }

  // Get auth token for Firebase Functions calls
  private async getAuthToken(): Promise<string> {
    if (!this.auth) {
      throw new Error('Firebase not configured');
    }
    
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    // Force-refresh the token to avoid using an expired one (tokens expire after ~1h)
    return await currentUser.getIdToken(true);
  }

  // Generic function to call Firebase Functions
  private async callFunction(functionName: string, data: any, timeoutMs: number = 60000): Promise<any> {
    if (!this.auth) {
      throw new Error('Firebase not configured. Please add Firebase environment variables to .env file.');
    }
    
    const token = await this.getAuthToken();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(`${this.functionsUrl}/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || `Function call failed with status ${response.status}`);
        } catch (e) {
          throw new Error(errorText || `Function call failed with status ${response.status}`);
        }
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Analyze transcript
  async analyzeTranscript(transcript: string, patientId?: string, visitId?: string): Promise<any> {
    return await this.callFunction('analyzeTranscript', {
      transcript,
      patientId,
      visitId
    });
  }

  // Generate summary
  async generateSummary(transcript: string, type: 'visit' | 'consultation' = 'visit'): Promise<{ summary: string }> {
    return await this.callFunction('generateSummary', {
      transcript,
      type
    });
  }

  // Evaluate question (for AI evaluation system)
  async evaluateQuestion(question: string, expectedAnswer: string, aiAnalysis: any, evaluationPrompt: string): Promise<any> {
    return await this.callFunction('evaluateQuestion', {
      question,
      expectedAnswer,
      aiAnalysis,
      evaluationPrompt
    });
  }

  // Batch analyze questions
  async batchAnalyzeQuestions(questions: string[], analysisPrompt: string): Promise<{ results: any[] }> {
    // Increased timeout for long-running batch process
    return await this.callFunction('batchAnalyzeQuestions', {
      questions,
      analysisPrompt
    }, 300000); // 5 minutes
  }

  // Analyze with reasoning (O1 model support)
  async analyzeWithReasoning(
    transcript: string, 
    patientContext?: any, 
    modelType: 'o1' | 'o1-mini' = 'o1-mini',
    analysisPrompt?: string
  ): Promise<any> {
    return await this.callFunction('analyzeWithReasoning', {
      transcript,
      patientContext,
      modelType,
      analysisPrompt
    });
  }

  // Get analysis history
  async getAnalysisHistory(patientId?: string, limit: number = 10): Promise<any> {
    return await this.callFunction('getAnalysisHistory', {
      patientId,
      limit
    });
  }

  // Check service status
  isConfigured(): boolean {
    return !!this.functionsUrl;
  }

  getStatus(): { configured: boolean; hasUrl: boolean; message: string } {
    const hasUrl = !!this.functionsUrl;
    return {
      configured: hasUrl,
      hasUrl,
      message: hasUrl ? 'Firebase Functions service configured' : 'Firebase Functions URL not configured'
    };
  }
}

export const firebaseFunctionsService = new FirebaseFunctionsService(); 