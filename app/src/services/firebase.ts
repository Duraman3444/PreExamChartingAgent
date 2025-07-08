/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set auth persistence explicitly
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Failed to set auth persistence:', error);
});

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
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return await currentUser.getIdToken();
  }

  // Generic function to call Firebase Functions
  private async callFunction(functionName: string, data: any): Promise<any> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${this.functionsUrl}/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Function call failed');
    }

    return await response.json();
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
    return await this.callFunction('batchAnalyzeQuestions', {
      questions,
      analysisPrompt
    });
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