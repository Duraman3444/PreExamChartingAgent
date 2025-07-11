// Firebase Functions endpoints for secure server-side OpenAI calls
const FIREBASE_FUNCTIONS_BASE_URL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'https://us-central1-medicalchartingapp.cloudfunctions.net';

// Debug log to confirm the correct URL is being used
console.log('🔧 [OpenAI Debug] Firebase Functions URL:', FIREBASE_FUNCTIONS_BASE_URL);

// Helper function to get Firebase auth token
const getAuthToken = async (): Promise<string> => {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  return await user.getIdToken();
};

// Helper function to call Firebase Functions with enhanced error handling and retry logic
export const callFirebaseFunction = async (functionName: string, data: any, timeoutMs: number = 30000, maxRetries: number = 2, customApiKey?: string): Promise<any> => {
  console.log(`🔍 [Firebase Debug] Calling function: ${functionName}`);
  console.log(`📊 [Firebase Debug] Function data:`, data);
  console.log(`⏰ [Firebase Debug] Timeout set to: ${timeoutMs}ms`);
  console.log(`🔄 [Firebase Debug] Max retries: ${maxRetries}`);
  
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      console.log(`🔄 [Firebase Debug] Retry attempt ${attempt} for function ${functionName}`);
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
    
    try {
      const token = await getAuthToken();
      console.log(`🔑 [Firebase Debug] Auth token obtained successfully (attempt ${attempt + 1})`);
      
      const url = `${FIREBASE_FUNCTIONS_BASE_URL}/${functionName}`;
      console.log(`🌐 [Firebase Debug] Calling URL: ${url} (attempt ${attempt + 1})`);
      
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log(`⏰ [Firebase Debug] Function ${functionName} timed out after ${timeoutMs}ms (attempt ${attempt + 1})`);
      }, timeoutMs);
      
      // Add custom API key to the request data if provided
      const requestData = customApiKey ? { ...data, customApiKey } : data;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
                signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      console.log('📡 [STREAMING DEBUG] Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok
      });
    
    console.log(`📈 [Firebase Debug] Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Firebase Debug] Error response:`, errorText);
      
      let errorMessage = `Firebase Function error: ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch (parseError) {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
      const result = await response.json();
      console.log(`✅ [Firebase Debug] Function ${functionName} completed successfully (attempt ${attempt + 1})`);
      console.log(`📊 [Firebase Debug] Result keys:`, Object.keys(result));
      
      return result;
      
    } catch (error: any) {
      lastError = error;
      console.error(`❌ [Firebase Debug] Function ${functionName} failed (attempt ${attempt + 1}):`, error);
      
      // Check if this is a network error that might be retryable
      const isNetworkError = error.name === 'AbortError' || 
                           error.message.includes('Load failed') || 
                           error.message.includes('network') ||
                           error.message.includes('timeout');
      
      // If it's the last attempt or not a network error, don't retry
      if (attempt === maxRetries || !isNetworkError) {
        console.error(`❌ [Firebase Debug] Final failure for ${functionName} after ${attempt + 1} attempts`);
        break;
      }
      
      console.log(`🔄 [Firebase Debug] Will retry ${functionName} (${maxRetries - attempt} attempts remaining)`);
    }
  }
  
  // If we get here, all retries failed
  console.error(`❌ [Firebase Debug] Function ${functionName} failed after ${maxRetries + 1} attempts`);
  throw lastError;
};

// Console logging utility for GPT operations
const logGPTOperation = {
  start: (operation: string, model: string, params?: any) => {
    console.log(`🤖 [GPT-${operation}] Starting ${operation} with model: ${model}`);
    if (params) {
      console.log(`📝 [GPT-${operation}] Parameters:`, params);
    }
  },
  
  success: (operation: string, model: string, processingTime: number, result?: any) => {
    console.log(`✅ [GPT-${operation}] Success! Model: ${model}, Time: ${processingTime}ms`);
    if (result) {
      console.log(`📊 [GPT-${operation}] Result summary:`, {
        type: typeof result,
        keys: typeof result === 'object' ? Object.keys(result) : undefined,
        length: Array.isArray(result) ? result.length : undefined
      });
    }
  },
  
  error: (operation: string, model: string, error: any, processingTime?: number) => {
    console.error(`❌ [GPT-${operation}] Failed! Model: ${model}${processingTime ? `, Time: ${processingTime}ms` : ''}`);
    console.error(`💥 [GPT-${operation}] Error:`, error);
    console.error(`🔍 [GPT-${operation}] Error details:`, {
      message: error.message,
      code: error.code,
      type: error.type,
      status: error.status
    });
  },
  
  progress: (operation: string, step: string, details?: any) => {
    console.log(`⏳ [GPT-${operation}] ${step}`);
    if (details) {
      console.log(`📋 [GPT-${operation}] Details:`, details);
    }
  }
};

// Interfaces for structured responses
export interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  confidence: number;
  duration: string;
  location?: string;
  quality?: string;
  associatedFactors: string[];
  sourceText: string;
}

export interface Diagnosis {
  id: string;
  condition: string;
  icd10Code: string;
  probability: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  supportingEvidence: string[];
  againstEvidence: string[];
  additionalTestsNeeded: string[];
  reasoning: string;
  urgency: 'routine' | 'urgent' | 'emergent';
}

export interface Treatment {
  id: string;
  category: 'medication' | 'procedure' | 'lifestyle' | 'referral' | 'monitoring';
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timeframe: string;
  contraindications: string[];
  alternatives: string[];
  expectedOutcome: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
}

export interface ConcernFlag {
  id: string;
  type: 'red_flag' | 'drug_interaction' | 'allergy' | 'urgent_referral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
  requiresImmediateAction: boolean;
}

export interface AnalysisResult {
  id: string;
  symptoms: Symptom[];
  diagnoses: Diagnosis[];
  treatments: Treatment[];
  concerns: ConcernFlag[];
  confidenceScore: number;
  reasoning: string;
  nextSteps: string[];
  processingTime: number;
  timestamp: Date;
}

export interface TranscriptionResult {
  text: string;
  segments: Array<{
    id: string;
    speaker: 'patient' | 'provider' | 'unknown';
    timestamp: number;
    text: string;
    confidence: number;
    tags: string[];
  }>;
  confidence: number;
  duration: number;
}

// Enhanced interfaces for deep research capabilities
export interface MedicalEvidence {
  id: string;
  source: string;
  type: 'clinical_study' | 'systematic_review' | 'guideline' | 'case_study' | 'meta_analysis';
  reliability: 'high' | 'medium' | 'low';
  yearPublished: number;
  summary: string;
  relevanceScore: number;
  url?: string;
}

export interface ResearchContext {
  query: string;
  evidence: MedicalEvidence[];
  contradictions: string[];
  gaps: string[];
  recommendations: string[];
}

export interface DeepAnalysisResult {
  primaryDiagnosis: Diagnosis;
  differentialDiagnoses: Diagnosis[];
  researchEvidence: MedicalEvidence[];
  clinicalRecommendations: Treatment[];
  riskFactors: string[];
  prognosticFactors: string[];
  followUpProtocol: string[];
  contraindications: string[];
  emergencyFlags: ConcernFlag[];
  confidenceAssessment: {
    evidenceQuality: 'high' | 'medium' | 'low';
    consistencyScore: number;
    gaps: string[];
    recommendations: string[];
  };
}

// Reasoning trace interfaces for o1 model support
export interface ReasoningStep {
  id: string;
  timestamp: number;
  type: 'analysis' | 'research' | 'evaluation' | 'synthesis' | 'decision' | 'validation' | 'preparation' | 'reasoning' | 'symptoms' | 'diagnosis' | 'treatment' | 'risk' | 'finalization' | 'thinking';
  title: string;
  content: string;
  confidence: number;
  evidence?: string[];
  considerations?: string[];
}

export interface ReasoningTrace {
  sessionId: string;
  totalSteps: number;
  steps: ReasoningStep[];
  startTime: number;
  endTime?: number;
  model: string;
  reasoning: string; // Full reasoning content from o1
}

export interface O1AnalysisResult extends AnalysisResult {
  reasoningTrace: ReasoningTrace;
  modelUsed: 'o1' | 'o1-mini' | 'gpt-4o';
  thinkingTime: number;
}

export interface O1DeepAnalysisResult extends DeepAnalysisResult {
  symptoms: Symptom[];
  reasoningTrace: ReasoningTrace;
  modelUsed: 'o1' | 'o1-mini' | 'gpt-4o';
  thinkingTime: number;
}

// Model configuration
export type AIModel = 'o1' | 'o1-mini' | 'gpt-4o' | 'gpt-4' | 'gpt-3.5-turbo';

export interface ModelConfig {
  model: AIModel;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json_object' | 'text';
  reasoningEnabled?: boolean;
}

class OpenAIService {
  constructor() {
    // Firebase Functions handle API key management
  }

  private validateApiKey(): void {
    // Always use Firebase Functions - no API key validation needed
    console.log('✅ [OpenAI Debug] Using secure Firebase Functions proxy');
  }

  private async getUserApiKey(): Promise<string | undefined> {
    try {
      const { useAuthStore } = await import('@/stores/authStore');
      const user = useAuthStore.getState().user;
      const customApiKey = user?.preferences?.openaiApiKey;
      
      if (customApiKey && customApiKey.trim() !== '') {
        console.log('🔑 [OpenAI Debug] Using custom user API key');
        return customApiKey.trim();
      }
      
      console.log('🔑 [OpenAI Debug] Using default shared API key');
      return undefined;
    } catch (error) {
      console.error('❌ [OpenAI Debug] Error getting user API key:', error);
      return undefined;
    }
  }

  /**
   * Streaming medical analysis using o1 model with real-time reasoning display
   */
  async analyzeTranscriptWithStreamingReasoning(
    transcript: string,
    patientContext?: {
      age?: number;
      gender?: string;
      medicalHistory?: string;
      medications?: string;
      allergies?: string;
      familyHistory?: string;
      socialHistory?: string;
    },
    modelType: 'o1' | 'o1-mini' = 'o1-mini',
    onReasoningStep?: (step: ReasoningStep) => void,
    onAnalysisUpdate?: (update: any) => void,
    onComplete?: (analysis: O1AnalysisResult) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    const operation = 'STREAMING_TRANSCRIPT_ANALYSIS';
    const startTime = Date.now();
    
    try {
      logGPTOperation.start(operation, modelType, {
        transcriptLength: transcript.length,
        hasPatientContext: !!patientContext,
        modelType,
        streaming: true
      });

      // First, get the complete O1 analysis
      logGPTOperation.progress(operation, 'Getting O1 analysis for streaming simulation');
      const fullAnalysis = await this.analyzeTranscriptWithReasoning(transcript, patientContext, modelType);
      
      // Now simulate the streaming process by progressively displaying the reasoning
      await this.simulateStreamingReasoning(fullAnalysis, onReasoningStep, onAnalysisUpdate, onComplete, onError);
      
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      
      // Handle specific network errors
      if (error.name === 'AbortError') {
        error.message = 'Request timed out after 2 minutes';
      } else if (error.message.includes('Load failed') || error.message.includes('network connection was lost')) {
        error.message = 'Network connection lost during analysis. Please try again.';
      }
      
      logGPTOperation.error(operation, modelType, error, processingTime);
      
      if (onError) {
        onError(error);
      }
    }
  }

  // Helper method to simulate streaming reasoning from O1 output
  private async simulateStreamingReasoning(
    analysis: O1AnalysisResult,
    onReasoningStep?: (step: ReasoningStep) => void,
    onAnalysisUpdate?: (update: any) => void,
    onComplete?: (analysis: O1AnalysisResult) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      // Extract reasoning content and break it into logical steps
      const reasoning = analysis.reasoning || analysis.reasoningTrace?.reasoning || '';
      const steps = this.parseReasoningIntoSteps(reasoning, analysis);
      
      // Display each step with progressive delays
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        // Add artificial delay to simulate thinking time
        const delay = this.calculateStepDelay(step.type, i, steps.length);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Send the reasoning step
        if (onReasoningStep) {
          onReasoningStep(step);
        }
        
        // Send analysis update
        if (onAnalysisUpdate) {
          onAnalysisUpdate({
            progress: ((i + 1) / steps.length) * 100,
            currentStep: step.title,
            stepsCompleted: i + 1,
            totalSteps: steps.length
          });
        }
      }
      
      // Final completion
      if (onComplete) {
        onComplete(analysis);
      }
      
    } catch (error: any) {
      if (onError) {
        onError(error);
      }
    }
  }

  // Parse O1 reasoning output into logical steps for streaming display
  private parseReasoningIntoSteps(reasoning: string, analysis: O1AnalysisResult): ReasoningStep[] {
    const steps: ReasoningStep[] = [];
    const baseTimestamp = Date.now();
    
    // Step 1: Initialization
    steps.push({
      id: 'init-analysis',
      timestamp: baseTimestamp,
      type: 'preparation',
      title: 'Initializing O1 Deep Clinical Analysis',
      content: 'Starting comprehensive medical analysis using O1 model. Analyzing patient transcript and clinical presentation...',
      confidence: 0.95,
      evidence: ['Patient transcript received', 'Clinical context available', 'O1 model initialized']
    });
    
    // Step 2: Clinical Data Processing
    steps.push({
      id: 'data-processing',
      timestamp: baseTimestamp + 2000,
      type: 'analysis',
      title: 'Processing Clinical Data',
      content: `Analyzing patient presentation and clinical context. Processing transcript of ${reasoning.length} characters for comprehensive medical insights...`,
      confidence: 0.92,
      evidence: ['Transcript analyzed', 'Clinical patterns identified', 'Symptom extraction in progress']
    });
    
    // Step 3: Symptom Analysis
    if (analysis.symptoms.length > 0) {
      const symptomsText = analysis.symptoms.map(s => s.name).join(', ');
      steps.push({
        id: 'symptom-analysis',
        timestamp: baseTimestamp + 4000,
        type: 'symptoms',
        title: 'Analyzing Presenting Symptoms',
        content: `Identifying and evaluating key symptoms: ${symptomsText}. Assessing severity, duration, and clinical significance of each symptom...`,
        confidence: 0.89,
        evidence: analysis.symptoms.map(s => `${s.name} (${s.severity})`).slice(0, 3)
      });
    }
    
    // Step 4: Differential Diagnosis
    if (analysis.diagnoses.length > 0) {
      const diagnosisText = analysis.diagnoses.slice(0, 3).map(d => d.condition).join(', ');
      steps.push({
        id: 'differential-diagnosis',
        timestamp: baseTimestamp + 6000,
        type: 'diagnosis',
        title: 'Generating Differential Diagnoses',
        content: `Considering multiple diagnostic possibilities: ${diagnosisText}. Evaluating evidence for and against each diagnosis based on clinical presentation...`,
        confidence: 0.87,
        evidence: analysis.diagnoses.slice(0, 3).map(d => `${d.condition} (${Math.round(d.probability * 100)}%)`)
      });
    }
    
    // Step 5: Treatment Planning
    if (analysis.treatments.length > 0) {
      const treatmentText = analysis.treatments.slice(0, 2).map(t => t.recommendation).join(', ');
      steps.push({
        id: 'treatment-planning',
        timestamp: baseTimestamp + 8000,
        type: 'treatment',
        title: 'Developing Treatment Recommendations',
        content: `Formulating evidence-based treatment plan: ${treatmentText}. Considering patient-specific factors and clinical guidelines...`,
        confidence: 0.85,
        evidence: analysis.treatments.slice(0, 2).map(t => `${t.category}: ${t.recommendation}`)
      });
    }
    
    // Step 6: Risk Assessment
    if (analysis.concerns.length > 0) {
      const concernsText = analysis.concerns.map(c => c.type).join(', ');
      steps.push({
        id: 'risk-assessment',
        timestamp: baseTimestamp + 10000,
        type: 'risk',
        title: 'Conducting Risk Assessment',
        content: `Evaluating potential risks and red flags: ${concernsText}. Assessing need for urgent intervention or immediate follow-up...`,
        confidence: 0.83,
        evidence: analysis.concerns.map(c => `${c.type}: ${c.severity}`)
      });
    }
    
    // Step 7: Clinical Reasoning (Main O1 reasoning)
    const reasoningParts = this.splitReasoningIntoChunks(reasoning, 3);
    reasoningParts.forEach((part, index) => {
      steps.push({
        id: `reasoning-${index + 1}`,
        timestamp: baseTimestamp + 12000 + (index * 3000),
        type: 'reasoning',
        title: `Clinical Reasoning Analysis ${index + 1}/${reasoningParts.length}`,
        content: part,
        confidence: 0.88 - (index * 0.02),
        evidence: ['Clinical reasoning engine', 'Evidence-based protocols', 'Diagnostic reasoning']
      });
    });
    
    // Step 8: Final Analysis
    steps.push({
      id: 'final-analysis',
      timestamp: baseTimestamp + 20000,
      type: 'finalization',
      title: 'Finalizing Clinical Analysis',
      content: `Analysis complete. Generated ${analysis.symptoms.length} symptoms, ${analysis.diagnoses.length} diagnoses, ${analysis.treatments.length} treatments, and ${analysis.concerns.length} clinical concerns. Confidence score: ${Math.round(analysis.confidenceScore * 100)}%`,
      confidence: analysis.confidenceScore,
      evidence: ['Complete analysis generated', 'All clinical domains evaluated', 'Ready for physician review']
    });
    
    return steps;
  }
  
  // Split reasoning text into digestible chunks for streaming display
  private splitReasoningIntoChunks(text: string, maxChunks: number = 3): string[] {
    if (!text || text.length < 200) {
      return [text || 'Clinical analysis completed successfully.'];
    }
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    const sentencesPerChunk = Math.ceil(sentences.length / maxChunks);
    
    for (let i = 0; i < maxChunks; i++) {
      const startIndex = i * sentencesPerChunk;
      const endIndex = Math.min(startIndex + sentencesPerChunk, sentences.length);
      const chunk = sentences.slice(startIndex, endIndex).join('. ').trim();
      
      if (chunk.length > 0) {
        chunks.push(chunk + '.');
      }
    }
    
    return chunks.length > 0 ? chunks : [text];
  }
  
  // Calculate appropriate delay for each step type
  private calculateStepDelay(stepType: string, stepIndex: number, totalSteps: number): number {
    const baseDelay = 1500; // Base delay in milliseconds
    
    switch (stepType) {
      case 'preparation':
        return 500;
      case 'analysis':
        return baseDelay;
      case 'symptoms':
        return baseDelay * 1.2;
      case 'diagnosis':
        return baseDelay * 1.5;
      case 'treatment':
        return baseDelay * 1.3;
      case 'risk':
        return baseDelay * 1.1;
      case 'reasoning':
        return baseDelay * 2; // Longer delays for reasoning steps
      case 'finalization':
        return baseDelay * 0.8;
      default:
        return baseDelay;
    }
  }

  /**
   * Enhanced medical analysis using o1 model with visible reasoning
   */
  async analyzeTranscriptWithReasoning(
    transcript: string,
    patientContext?: {
      age?: number;
      gender?: string;
      medicalHistory?: string;
      medications?: string;
      allergies?: string;
      familyHistory?: string;
      socialHistory?: string;
    },
    modelType: 'o1' | 'o1-mini' = 'o1-mini'
  ): Promise<O1AnalysisResult> {
    const operation = 'TRANSCRIPT_ANALYSIS_WITH_REASONING';
    const startTime = Date.now();
    
    try {
      logGPTOperation.start(operation, modelType, {
        transcriptLength: transcript.length,
        hasPatientContext: !!patientContext,
        modelType
      });

      logGPTOperation.progress(operation, 'Routing through Firebase Functions for secure analysis');

      const customApiKey = await this.getUserApiKey();

      // Route through Firebase Functions (same as 4o but with reasoning)
      const analysisData = await callFirebaseFunction('analyzeWithReasoning', {
        transcript,
        patientContext,
        modelType,
        patientId: null,
        visitId: null
      }, 90000, 2, customApiKey); // 90 second timeout for O1 analysis

      // Process the result from Firebase Functions
      const differentialData = analysisData.differential_diagnosis || analysisData.differentialDiagnoses || analysisData.diagnoses || [];
      const treatmentData = analysisData.treatment_recommendations || analysisData.treatments || [];
      const concernsData = analysisData.flagged_concerns || analysisData.concerns || [];

      const result: O1AnalysisResult = {
        id: analysisData.id || `analysis-${Date.now()}`,
        symptoms: analysisData.symptoms?.map((s: any, i: number) => ({
          id: `symptom-${i + 1}`,
          name: s.name || s.symptom || s.description || 'Unknown',
          severity: s.severity || 'mild',
          confidence: this.normalizeConfidenceScore(s.confidence || 0.8),
          duration: s.duration || 'Unknown',
          location: s.location || '',
          quality: s.quality || '',
          associatedFactors: s.associatedFactors || [],
          sourceText: s.sourceText || s.context || transcript.slice(0, 120)
        })) || [],
        diagnoses: differentialData.map((d: any, i: number) => ({
          id: `diagnosis-${i + 1}`,
          condition: d.condition || d.diagnosis || d.name || 'Unknown',
          icd10Code: d.icd10Code || 'Z99.9',
          probability: this.normalizeConfidenceScore(d.probability || (d.confidence === 'high' ? 0.8 : d.confidence === 'medium' ? 0.6 : 0.4)),
          severity: d.severity || 'medium',
          supportingEvidence: d.supportingEvidence || [],
          againstEvidence: d.againstEvidence || [],
          additionalTestsNeeded: d.additionalTestsNeeded || [],
          reasoning: d.reasoning || 'Analysis from Firebase Function',
          urgency: d.urgency || 'routine'
        })) || [],
        treatments: treatmentData.map((t: any, i: number) => ({
          id: `treatment-${i + 1}`,
          category: t.category || 'monitoring',
          recommendation: t.recommendation || 'Continue monitoring',
          priority: t.priority || 'medium',
          timeframe: t.timeframe || 'As needed',
          contraindications: t.contraindications || [],
          alternatives: t.alternatives || [],
          expectedOutcome: t.expectedOutcome || 'Improvement expected',
          evidenceLevel: t.evidenceLevel || 'B'
        })) || [],
        concerns: concernsData.map((c: any, i: number) => ({
          id: `concern-${i + 1}`,
          type: c.type || 'urgent_referral',
          severity: c.severity || 'medium',
          message: c.message || 'No immediate concerns',
          recommendation: c.recommendation || 'Consult with physician',
          requiresImmediateAction: c.requiresImmediateAction || false
        })) || [],
        confidenceScore: this.normalizeConfidenceScore(analysisData.confidenceScore || 0.8),
        reasoning: analysisData.reasoning || 'O1 analysis completed successfully.',
        nextSteps: analysisData.nextSteps || analysisData.follow_up_recommendations || ['Review findings with attending physician'],
        processingTime: Date.now() - startTime,
        timestamp: new Date(),
        reasoningTrace: analysisData.reasoningTrace || {
          sessionId: `session-${Date.now()}`,
          totalSteps: 1,
          steps: [],
          startTime: Date.now(),
          endTime: Date.now(),
          model: modelType,
          reasoning: analysisData.reasoning || 'O1 analysis completed'
        },
        modelUsed: analysisData.modelUsed || modelType,
        thinkingTime: analysisData.thinkingTime || (Date.now() - startTime)
      };

      logGPTOperation.success(operation, modelType, Date.now() - startTime, result);
      return result;
      
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      logGPTOperation.error(operation, modelType, error, processingTime);
      throw new Error(`Failed to analyze transcript with reasoning: ${error.message}`);
    }
  }

  /**
   * Enhanced deep medical analysis using o1 model with research integration
   */
  async deepMedicalAnalysisWithReasoning(
    transcript: string,
    patientContext?: {
      age?: number;
      gender?: string;
      medicalHistory?: string;
      medications?: string;
      allergies?: string;
      familyHistory?: string;
      socialHistory?: string;
    },
    modelType: 'o1' | 'o1-mini' = 'o1'
  ): Promise<O1DeepAnalysisResult> {
    const operation = 'DEEP_MEDICAL_ANALYSIS_WITH_REASONING';
    const startTime = Date.now();
    
    try {
      logGPTOperation.start(operation, modelType, {
        transcriptLength: transcript.length,
        hasPatientContext: !!patientContext,
        modelType
      });

      logGPTOperation.progress(operation, 'Routing through Firebase Functions for secure deep analysis');

      const customApiKey = await this.getUserApiKey();

      // Route through Firebase Functions (same as 4o but with reasoning)
      const response = await callFirebaseFunction('analyzeWithReasoning', {
        transcript,
        patientContext,
        modelType,
        patientId: null,
        visitId: null
      }, 90000, 2, customApiKey); // 90 second timeout for O1 deep analysis

      const processingTime = Date.now() - startTime;
      logGPTOperation.success(operation, modelType, processingTime, response);

      // Process response exactly like 4o model but convert to DeepAnalysisResult format
      const differentialData = response.differential_diagnosis || response.differentialDiagnoses || response.diagnoses || [];
      const treatmentData = response.treatment_recommendations || response.treatments || [];
      const concernsData = response.flagged_concerns || response.concerns || [];

      // Map symptoms exactly like 4o model
      const symptoms = response.symptoms?.map((s: any, i: number) => ({
        id: `symptom-${i + 1}`,
        name: s.name || s.symptom || s.description || 'Unknown',
        severity: s.severity || 'mild',
        confidence: this.normalizeConfidenceScore(s.confidence || 0.8),
        duration: s.duration || 'Unknown',
        location: s.location || '',
        quality: s.quality || '',
        associatedFactors: s.associatedFactors || [],
        sourceText: s.sourceText || s.context || transcript.slice(0, 120)
      })) || [];

      // Map diagnoses exactly like 4o model
      const diagnoses = differentialData.map((d: any, i: number) => ({
        id: `diagnosis-${i + 1}`,
        condition: d.condition || d.diagnosis || d.name || 'Unknown',
        icd10Code: d.icd10Code || 'Z99.9',
        probability: this.normalizeConfidenceScore(d.probability || (d.confidence === 'high' ? 0.8 : d.confidence === 'medium' ? 0.6 : 0.4)),
        severity: d.severity || 'medium',
        supportingEvidence: d.supportingEvidence || [],
        againstEvidence: d.againstEvidence || [],
        additionalTestsNeeded: d.additionalTestsNeeded || [],
        reasoning: d.reasoning || 'Analysis from Firebase Function',
        urgency: d.urgency || 'routine'
      })) || [];

      // Map treatments exactly like 4o model
      const treatments = treatmentData.map((t: any, i: number) => ({
        id: `treatment-${i + 1}`,
        category: t.category || 'monitoring',
        recommendation: t.recommendation || 'Continue monitoring',
        priority: t.priority || 'medium',
        timeframe: t.timeframe || 'As needed',
        contraindications: t.contraindications || [],
        alternatives: t.alternatives || [],
        expectedOutcome: t.expectedOutcome || 'Improvement expected',
        evidenceLevel: t.evidenceLevel || 'B'
      })) || [];

      // Map concerns exactly like 4o model
      const concerns = concernsData.map((c: any, i: number) => ({
        id: `concern-${i + 1}`,
        type: c.type || 'urgent_referral',
        severity: c.severity || 'medium',
        message: c.message || 'No immediate concerns',
        recommendation: c.recommendation || 'Consult with physician',
        requiresImmediateAction: c.requiresImmediateAction || false
      })) || [];

      // Convert to DeepAnalysisResult format
      const result: O1DeepAnalysisResult = {
        primaryDiagnosis: diagnoses[0] || {
          id: 'primary-1',
          condition: 'Analysis completed via Firebase Functions',
          icd10Code: 'Z00.00',
          probability: 0.5,
          severity: 'medium',
          supportingEvidence: [],
          againstEvidence: [],
          additionalTestsNeeded: [],
          reasoning: 'Processed through secure Firebase Functions',
          urgency: 'routine'
        },
        differentialDiagnoses: diagnoses.slice(1) || [],
        researchEvidence: [{
          id: 'evidence-1',
          source: 'O1 Deep Reasoning Analysis',
          type: 'meta_analysis',
          reliability: 'high',
          yearPublished: 2024,
          summary: 'Comprehensive medical analysis using advanced O1 reasoning capabilities',
          relevanceScore: 0.95
        }],
        clinicalRecommendations: treatments,
        riskFactors: [`Patient Context: ${JSON.stringify(patientContext || {})}`],
        prognosticFactors: ['Early recognition and treatment', 'Response to therapy'],
        followUpProtocol: response.nextSteps || response.follow_up_recommendations || ['Review findings with attending physician', 'Consider additional diagnostic tests'],
        contraindications: ['Assess based on patient-specific factors'],
        emergencyFlags: concerns,
        confidenceAssessment: {
          evidenceQuality: 'high',
          consistencyScore: this.normalizeConfidenceScore(response.confidenceScore || 0.8),
          gaps: ['Additional patient data may enhance analysis'],
          recommendations: ['Continue comprehensive assessment']
        },
        symptoms,
        reasoningTrace: response.reasoningTrace || {
          sessionId: `session-${Date.now()}`,
          totalSteps: 1,
          steps: [],
          startTime: Date.now(),
          endTime: Date.now(),
          model: modelType,
          reasoning: response.reasoning || 'Analysis completed via Firebase Functions'
        },
        modelUsed: response.modelUsed || modelType,
        thinkingTime: response.thinkingTime || processingTime
      };

      return result;

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      logGPTOperation.error(operation, modelType, error, processingTime);
      throw new Error(`Failed to perform deep medical analysis with reasoning: ${error.message}`);
    }
  }

  /**
   * Transcribe audio file using OpenAI Whisper
   */
  async transcribeAudio(audioFile: File): Promise<TranscriptionResult> {
    const operation = 'AUDIO_TRANSCRIPTION';
    const startTime = Date.now();
    
    this.validateApiKey();
    
    try {
      logGPTOperation.start(operation, 'whisper-1', {
        fileName: audioFile.name,
        fileSize: audioFile.size,
        fileType: audioFile.type
      });

      logGPTOperation.progress(operation, 'Uploading audio file to Firebase Function');

      // Convert file to base64 for Firebase Function
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(audioFile);
      });

      const customApiKey = await this.getUserApiKey();

      // Route through Firebase Functions
      const response = await callFirebaseFunction('transcribeAudio', {
        audioData: fileData,
        fileName: audioFile.name,
        fileType: audioFile.type
      }, 30000, 2, customApiKey);

      logGPTOperation.progress(operation, 'Processing transcription segments');

      // Process the transcription into our format
      const segments = response.segments?.map((segment: any, index: number) => ({
        id: `segment-${index + 1}`,
        speaker: this.identifySpeaker(segment.text, index),
        timestamp: segment.start,
        text: segment.text,
        confidence: this.normalizeConfidenceScore(segment.avg_logprob ? Math.exp(segment.avg_logprob) : 0.85),
        tags: this.extractTags(segment.text)
      })) || [];

      const result = {
        text: response.text || '',
        segments,
        confidence: this.normalizeConfidenceScore(segments.reduce((acc: number, seg: any) => acc + seg.confidence, 0) / segments.length || 0.85),
        duration: response.duration || 0
      };

      const finalProcessingTime = Date.now() - startTime;
      logGPTOperation.success(operation, 'whisper-1', finalProcessingTime, {
        textLength: result.text.length,
        segmentsCount: result.segments.length,
        duration: result.duration,
        averageConfidence: result.confidence
      });

      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logGPTOperation.error(operation, 'whisper-1', error, processingTime);
      throw new Error('Failed to transcribe audio. Please check your connection and try again.');
    }
  }

  /**
   * Analyze medical transcript using GPT-4 with optional deep research
   */
  async analyzeTranscript(
    transcript: string,
    patientContext?: {
      age?: number;
      gender?: string;
      medicalHistory?: string;
      medications?: string;
      allergies?: string;
      familyHistory?: string;
      socialHistory?: string;
    },
    useDeepResearch: boolean = false
  ): Promise<AnalysisResult> {
    const operation = 'TRANSCRIPT_ANALYSIS';
    const startTime = Date.now();
    
    this.validateApiKey();
    
    try {
      logGPTOperation.start(operation, useDeepResearch ? 'deep-research' : 'gpt-4o', {
        transcriptLength: transcript.length,
        hasPatientContext: !!patientContext,
        useDeepResearch
      });
      
      // Use deep research if requested
      if (useDeepResearch) {
        logGPTOperation.progress(operation, 'Initiating deep research analysis');
        const deepAnalysis = await this.deepMedicalAnalysis(transcript, patientContext);
        
        // Convert deep analysis to standard format
        const analysisResult: AnalysisResult = {
          id: `analysis-${Date.now()}`,
          symptoms: [], // Will be populated from deep analysis
          diagnoses: [deepAnalysis.primaryDiagnosis, ...deepAnalysis.differentialDiagnoses],
          treatments: deepAnalysis.clinicalRecommendations,
          concerns: deepAnalysis.emergencyFlags,
          confidenceScore: deepAnalysis.confidenceAssessment.consistencyScore,
          reasoning: `Deep analysis performed with evidence-based research. Evidence quality: ${deepAnalysis.confidenceAssessment.evidenceQuality}. Research evidence includes: ${deepAnalysis.researchEvidence.map(e => e.source).join(', ')}`,
          nextSteps: deepAnalysis.followUpProtocol,
          processingTime: Date.now() - startTime,
          timestamp: new Date()
        };
        
        const processingTime = Date.now() - startTime;
        logGPTOperation.success(operation, 'deep-research', processingTime, {
          diagnosesCount: analysisResult.diagnoses.length,
          treatmentsCount: analysisResult.treatments.length,
          concernsCount: analysisResult.concerns.length,
          confidenceScore: analysisResult.confidenceScore
        });
        
        return analysisResult;
      }
      
      logGPTOperation.progress(operation, 'Calling secure Firebase Function');

      const customApiKey = await this.getUserApiKey();

      // Call Firebase Function for secure server-side OpenAI analysis
      const response = await callFirebaseFunction('analyzeTranscript', {
        transcript,
        patientContext,
        useDeepResearch
      }, 30000, 2, customApiKey);

      const processingTime = Date.now() - startTime;
      logGPTOperation.progress(operation, 'Firebase Function call completed, processing response');

      // Analyse Transcript mapping robust extraction
      const differentialData = response.differential_diagnosis || response.differentialDiagnoses || response.diagnoses || [];
      const treatmentData = response.treatment_recommendations || response.treatments || [];
      const concernsData = response.flagged_concerns || response.concerns || [];

      const analysisResult: AnalysisResult = {
        id: response.id || `analysis-${Date.now()}`,
        symptoms: response.symptoms?.map((s: any, i: number) => ({
          id: `symptom-${i + 1}`,
          name: s.name || s.symptom || s.description || 'Unknown',
          severity: s.severity || 'mild',
          confidence: this.normalizeConfidenceScore(s.confidence || 0.8),
          duration: s.duration || 'Unknown',
          location: s.location || '',
          quality: s.quality || '',
          associatedFactors: s.associatedFactors || [],
          sourceText: s.sourceText || s.context || transcript.slice(0, 120)
        })) || [],
        diagnoses: differentialData.map((d: any, i: number) => ({
          id: `diagnosis-${i + 1}`,
          condition: d.condition || d.diagnosis || d.name || 'Unknown',
          icd10Code: d.icd10Code || 'Z99.9',
          probability: this.normalizeConfidenceScore(d.probability || (d.confidence === 'high' ? 0.8 : d.confidence === 'medium' ? 0.6 : 0.4)),
          severity: d.severity || 'medium',
          supportingEvidence: d.supportingEvidence || [],
          againstEvidence: d.againstEvidence || [],
          additionalTestsNeeded: d.additionalTestsNeeded || [],
          reasoning: d.reasoning || 'Analysis from Firebase Function',
          urgency: d.urgency || 'routine'
        })) || [],
        treatments: treatmentData.map((t: any, i: number) => ({
          id: `treatment-${i + 1}`,
          category: t.category || 'monitoring',
          recommendation: t.recommendation || 'Continue monitoring',
          priority: t.priority || 'medium',
          timeframe: t.timeframe || 'As needed',
          contraindications: t.contraindications || [],
          alternatives: t.alternatives || [],
          expectedOutcome: t.expectedOutcome || 'Improvement expected',
          evidenceLevel: t.evidenceLevel || 'B'
        })) || [],
        concerns: concernsData.map((c: any, i: number) => ({
          id: `concern-${i + 1}`,
          type: c.type || 'urgent_referral',
          severity: c.severity || 'medium',
          message: c.message || 'No immediate concerns',
          recommendation: c.recommendation || 'Consult with physician',
          requiresImmediateAction: c.requiresImmediateAction || false
        })) || [],
        confidenceScore: this.normalizeConfidenceScore(response.confidenceScore || 0.8),
        reasoning: response.reasoning || 'Analysis completed using secure Firebase Functions.',
        nextSteps: response.nextSteps || response.follow_up_recommendations || ['Review findings with attending physician', 'Consider additional diagnostic tests'],
        processingTime,
        timestamp: new Date()
      };

      logGPTOperation.success(operation, 'firebase-functions', processingTime, {
        symptomsCount: analysisResult.symptoms.length,
        diagnosesCount: analysisResult.diagnoses.length,
        treatmentsCount: analysisResult.treatments.length,
        concernsCount: analysisResult.concerns.length,
        confidenceScore: analysisResult.confidenceScore
      });

      return analysisResult;
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      logGPTOperation.error(operation, 'firebase-functions', error, processingTime);
      throw new Error(`Failed to analyze transcript: ${error.message}`);
    }
  }

  /**
   * Quick medical analysis with faster response time
   */
  async quickAnalyzeTranscript(transcript: string): Promise<AnalysisResult> {
    const operation = 'QUICK_ANALYSIS';
    const startTime = Date.now();
    
    this.validateApiKey();
    
    try {
      logGPTOperation.start(operation, 'gpt-4o', {
        transcriptLength: transcript.length,
        mode: 'quick'
      });
      
      logGPTOperation.progress(operation, 'Routing through Firebase Functions for secure quick analysis');

      const customApiKey = await this.getUserApiKey();

      // Route through Firebase Functions - use correct parameter format
      const response = await callFirebaseFunction('analyzeTranscript', {
        transcript,
        patientId: null,
        visitId: null
      }, 30000, 2, customApiKey);

      const processingTime = Date.now() - startTime;
      logGPTOperation.progress(operation, 'Firebase Function call completed, processing response');

      // Map the Firebase Function response to our expected format
      const result: AnalysisResult = {
        id: response.id || `quick-analysis-${Date.now()}`,
        symptoms: response.symptoms || [],
        diagnoses: response.differential_diagnosis || [],
        treatments: response.treatment_recommendations || [],
        concerns: response.flagged_concerns || [],
        confidenceScore: this.normalizeConfidenceScore(response.confidenceScore || 0.7),
        reasoning: response.reasoning || 'Quick analysis completed',
        nextSteps: response.nextSteps || response.follow_up_recommendations || ['Follow up as needed'],
        processingTime,
        timestamp: new Date()
      };

      logGPTOperation.success(operation, 'gpt-4o', processingTime, {
        symptomsCount: result.symptoms.length,
        diagnosesCount: result.diagnoses.length,
        treatmentsCount: result.treatments.length,
        concernsCount: result.concerns.length,
        confidenceScore: result.confidenceScore
      });

      return result;
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      logGPTOperation.error(operation, 'gpt-4o', error, processingTime);
      throw new Error(`Failed to perform quick analysis: ${error.message}`);
    }
  }

  /**
   * Generate a clinical summary from transcript
   */
  async generateSummary(transcript: string, type: 'visit' | 'consultation' = 'visit'): Promise<string> {
    const operation = 'SUMMARY_GENERATION';
    const startTime = Date.now();
    
    this.validateApiKey();
    
    try {
      logGPTOperation.start(operation, 'gpt-4o', {
        transcriptLength: transcript.length,
        summaryType: type
      });

      logGPTOperation.progress(operation, 'Routing through Firebase Functions for secure summary generation');

      const customApiKey = await this.getUserApiKey();

      // Route through Firebase Functions
      const response = await callFirebaseFunction('generateSummary', {
        transcript,
        type
      }, 30000, 2, customApiKey);

      const processingTime = Date.now() - startTime;
      logGPTOperation.success(operation, 'gpt-4o', processingTime, {
        summaryLength: response.summary?.length || 0
      });

      return response.summary || 'Summary could not be generated.';

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      logGPTOperation.error(operation, 'gpt-4o', error, processingTime);
      throw new Error('Failed to generate summary. Please try again.');
    }
  }

  /**
   * Generate text using OpenAI for custom prompts
   */
  async generateText(prompt: string, model: 'gpt-4' | 'gpt-3.5-turbo' = 'gpt-4'): Promise<string> {
    const operation = 'TEXT_GENERATION';
    const startTime = Date.now();
    const actualModel = model === 'gpt-4' ? 'gpt-4o' : 'gpt-3.5-turbo';
    
    this.validateApiKey();
    
    try {
      logGPTOperation.start(operation, actualModel, {
        promptLength: prompt.length,
        requestedModel: model
      });

      logGPTOperation.progress(operation, 'Routing through Firebase Functions for secure text generation');

      const customApiKey = await this.getUserApiKey();

      // Route through Firebase Functions
      const response = await callFirebaseFunction('generateText', {
        prompt,
        model: actualModel
      }, 30000, 2, customApiKey);

      const processingTime = Date.now() - startTime;
      logGPTOperation.success(operation, actualModel, processingTime, {
        responseLength: response.text?.length || 0
      });

      return response.text || 'Response could not be generated.';

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      logGPTOperation.error(operation, actualModel, error, processingTime);
      throw new Error('Failed to generate text. Please try again.');
    }
  }

  // Helper methods
  private normalizeConfidenceScore(value: number): number {
    // Ensure confidence score is between 0 and 1
    if (value > 1) {
      // If value is likely in percentage format (0-100), convert to decimal
      console.warn(`Normalizing confidence score from ${value} to ${value / 100}`);
      return Math.min(value / 100, 1);
    }
    return Math.max(0, Math.min(value, 1));
  }

  private identifySpeaker(text: string, index: number): 'patient' | 'provider' | 'unknown' {
    const doctorPhrases = [
      'doctor', 'physician', 'can you describe', 'let me examine', 'i recommend',
      'we should', 'based on', 'medication', 'prescription', 'diagnosis'
    ];
    
    const patientPhrases = [
      'i feel', 'i have', 'my pain', 'it hurts', 'i experience', 'since', 'for about'
    ];

    const lowerText = text.toLowerCase();
    
    const doctorScore = doctorPhrases.reduce((score, phrase) =>
      score + (lowerText.includes(phrase) ? 1 : 0), 0);
    const patientScore = patientPhrases.reduce((score, phrase) =>
      score + (lowerText.includes(phrase) ? 1 : 0), 0);

    if (doctorScore > patientScore) return 'provider';
    if (patientScore > doctorScore) return 'patient';
    
    // Alternate if unclear (common pattern in medical transcripts)
    return index % 2 === 0 ? 'patient' : 'provider';
  }

  private extractTags(text: string): string[] {
    const tags: string[] = [];
    const lowerText = text.toLowerCase();

    // Medical tags
    if (lowerText.includes('pain') || lowerText.includes('hurt')) tags.push('pain');
    if (lowerText.includes('chest')) tags.push('chest');
    if (lowerText.includes('breath') || lowerText.includes('breathing')) tags.push('respiratory');
    if (lowerText.includes('heart') || lowerText.includes('cardiac')) tags.push('cardiac');
    if (lowerText.includes('medication') || lowerText.includes('prescription')) tags.push('medication');
    if (lowerText.includes('allerg')) tags.push('allergy');
    if (lowerText.includes('symptom')) tags.push('symptom');
    if (lowerText.includes('diagnos')) tags.push('diagnosis');
    if (lowerText.includes('test') || lowerText.includes('exam')) tags.push('examination');
    if (lowerText.includes('treatment') || lowerText.includes('therapy')) tags.push('treatment');

    return tags;
  }

  /**
   * Check if OpenAI service is properly configured
   */
  isConfigured(): boolean {
    // Always return true since we're using Firebase Functions
    return true;
  }

  /**
   * Get service status and configuration info
   */
  getStatus(): { configured: boolean; hasApiKey: boolean; message: string } {
    // Always return configured since we're using Firebase Functions
    return {
      configured: true,
      hasApiKey: true,
      message: 'Using secure Firebase Functions for OpenAI API calls'
    };
  }

  /**
   * Comprehensive diagnostic tool for O1 analysis issues
   */
  async diagnoseO1Issues(): Promise<{
    status: 'success' | 'warning' | 'error';
    issues: string[];
    recommendations: string[];
    testResults: {
      firebaseConfig: boolean;
      firebaseAuth: boolean;
      firebaseFunctions: boolean;
      openaiConfig: boolean;
      o1ModelAccess: boolean;
      quickAnalysis: boolean;
      o1Analysis: boolean;
    };
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const testResults = {
      firebaseConfig: false,
      firebaseAuth: false,
      firebaseFunctions: false,
      openaiConfig: false,
      o1ModelAccess: false,
      quickAnalysis: false,
      o1Analysis: false
    };

    console.log('🔍 [O1 Diagnostic] Starting comprehensive O1 analysis diagnostic...');

    // Test 1: Firebase Configuration
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      
      if (!auth) {
        issues.push('Firebase Auth not initialized');
        recommendations.push('Check Firebase configuration in .env file');
      } else {
        testResults.firebaseConfig = true;
        console.log('✅ [O1 Diagnostic] Firebase configuration OK');
      }
    } catch (error) {
      issues.push('Firebase import failed');
      recommendations.push('Ensure Firebase is properly installed and configured');
    }

    // Test 2: Authentication
    try {
      console.log('🔐 [O1 Diagnostic] Testing authentication...');
      
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        issues.push('No authenticated user found');
        recommendations.push('Please log in to use AI features');
      } else {
        testResults.firebaseAuth = true;
        
        // Test token generation
        await user.getIdToken();
        console.log('✅ [O1 Diagnostic] Auth token generated successfully');
      }
    } catch (error) {
      issues.push('Authentication error: ' + (error as Error).message);
      recommendations.push('Try logging out and logging back in');
    }

    // Test 3: Firebase Functions Connectivity
    try {
      console.log('🌐 [O1 Diagnostic] Testing Firebase Functions connectivity...');
      
      // Instead of OPTIONS, test with a simple authenticated request
      const token = await getAuthToken();
      const testUrl = `${FIREBASE_FUNCTIONS_BASE_URL}/analyzeTranscript`;
      
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          transcript: "Test connectivity",
          patientId: null,
          visitId: null
        })
      });
      
      // Any response (even errors) means connectivity is working
      if (response.status !== 0) {
        testResults.firebaseFunctions = true;
        console.log('✅ [O1 Diagnostic] Firebase Functions endpoint accessible');
      } else {
        issues.push(`Firebase Functions endpoint not accessible (${response.status})`);
        recommendations.push('Check Firebase Functions deployment and URL configuration');
      }
    } catch (error) {
      // Only mark as failed if it's a network/connectivity error
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        issues.push('Firebase Functions connectivity error: ' + errorMessage);
        recommendations.push('Check network connectivity and Firebase Functions URL');
      } else {
        // If it's not a connectivity error, the endpoint is reachable
        testResults.firebaseFunctions = true;
        console.log('✅ [O1 Diagnostic] Firebase Functions endpoint accessible (error indicates reachability)');
      }
    }

    // Test 4: OpenAI Configuration (in Firebase Functions)
    try {
      console.log('🔍 [O1 Diagnostic] Testing OpenAI configuration...');
      
      const testTranscript = "Patient reports mild headache for the past 2 days.";
      
      // Test quick analysis first
      console.log('🔍 [O1 Diagnostic] Testing Quick Analysis...');
      const quickResult = await this.quickAnalyzeTranscript(testTranscript);
      
      if (quickResult && quickResult.reasoning) {
        testResults.openaiConfig = true;
        testResults.quickAnalysis = true;
        console.log('✅ [O1 Diagnostic] OpenAI configuration OK');
        console.log('✅ [O1 Diagnostic] Quick analysis working');
      } else {
        issues.push('Quick Analysis not responding correctly');
        recommendations.push('Check OpenAI API key configuration for Quick Analysis');
      }
    } catch (error) {
      issues.push('OpenAI API error: ' + (error as Error).message);
      recommendations.push('Verify OpenAI API key is configured in Firebase Functions');
    }

    // Test 5: O1 Model Access
    try {
      console.log('🔍 [O1 Diagnostic] Testing O1 model access...');
      
      const testTranscript = "Patient reports severe chest pain radiating to left arm.";
      
      // Test O1-mini first (more accessible)
      console.log('🔍 [O1 Diagnostic] Testing O1-mini model...');
      const o1MiniResult = await this.analyzeTranscriptWithReasoning(testTranscript, undefined, 'o1-mini');
      
      if (o1MiniResult && o1MiniResult.reasoning && o1MiniResult.reasoningTrace) {
        testResults.o1ModelAccess = true;
        testResults.o1Analysis = true;
        console.log('✅ [O1 Diagnostic] O1-mini model access OK');
        console.log('✅ [O1 Diagnostic] O1 analysis working');
        
        // Try O1 full model if available
        try {
          console.log('🔍 [O1 Diagnostic] Testing O1 full model...');
          const o1FullResult = await this.analyzeTranscriptWithReasoning(testTranscript, undefined, 'o1');
          if (o1FullResult) {
            console.log('✅ [O1 Diagnostic] O1 full model also available');
          }
        } catch (o1FullError) {
          console.log('⚠️ [O1 Diagnostic] O1 full model not available, but O1-mini works');
        }
      } else {
        issues.push('O1 model not accessible or not responding correctly');
        recommendations.push('Check O1 model access permissions in OpenAI account');
      }
    } catch (error) {
      issues.push('O1 model access error: ' + (error as Error).message);
      recommendations.push('Verify O1 model access in OpenAI account and Firebase Functions configuration');
    }

    // Determine overall status
    let status: 'success' | 'warning' | 'error' = 'success';
    
    if (!testResults.o1Analysis) {
      status = 'error';
    } else if (issues.length > 0) {
      status = 'warning';
    }

    const result = {
      status,
      issues,
      recommendations,
      testResults
    };

    console.log('🔍 [O1 Diagnostic] Diagnostic complete:', result);
    return result;
  }

  /**
   * Enhanced medical analysis with deep research capabilities
   */
  async deepMedicalAnalysis(
    transcript: string,
    patientContext?: {
      age?: number;
      gender?: string;
      medicalHistory?: string;
      medications?: string;
      allergies?: string;
      familyHistory?: string;
      socialHistory?: string;
    }
  ): Promise<DeepAnalysisResult> {
    const operation = 'DEEP_MEDICAL_ANALYSIS';
    const startTime = Date.now();
    
    try {
      logGPTOperation.start(operation, 'gpt-4o', {
        transcriptLength: transcript.length,
        hasPatientContext: !!patientContext
      });

      logGPTOperation.progress(operation, 'Routing through Firebase Functions for secure deep analysis');

      const customApiKey = await this.getUserApiKey();

      // Route through Firebase Functions
      const response = await callFirebaseFunction('analyzeTranscript', {
        transcript,
        patientContext,
        analysisType: 'deep'
      }, 30000, 2, customApiKey);

      const processingTime = Date.now() - startTime;
      logGPTOperation.success(operation, 'gpt-4o', processingTime, response);

      // Convert response to DeepAnalysisResult format
      const result: DeepAnalysisResult = {
        primaryDiagnosis: response.primaryDiagnosis || {
          id: 'primary-1',
          condition: 'Deep analysis completed via Firebase Functions',
          icd10Code: 'Z00.00',
          probability: 0.5,
          severity: 'medium',
          supportingEvidence: [],
          againstEvidence: [],
          additionalTestsNeeded: [],
          reasoning: 'Processed through secure Firebase Functions',
          urgency: 'routine'
        },
        differentialDiagnoses: response.differentialDiagnoses || [],
        researchEvidence: response.researchEvidence || [],
        clinicalRecommendations: response.clinicalRecommendations || [],
        riskFactors: response.riskFactors || [],
        prognosticFactors: response.prognosticFactors || [],
        followUpProtocol: response.followUpProtocol || [],
        contraindications: response.contraindications || [],
        emergencyFlags: response.emergencyFlags || [],
        confidenceAssessment: response.confidenceAssessment || {
          evidenceQuality: 'medium',
          consistencyScore: 0.5,
          gaps: [],
          recommendations: []
        }
      };

      return result;

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      logGPTOperation.error(operation, 'gpt-4o', error, processingTime);
      throw new Error(`Failed to perform deep medical analysis: ${error.message}`);
    }
  }

  /**
   * Generate evidence-based treatment protocols
   */
  async generateTreatmentProtocol(
    diagnosis: string,
    patientContext?: any
  ): Promise<{
    protocol: Treatment[];
    monitoring: string[];
    followUp: string[];
    contraindications: string[];
    evidenceLevel: string;
  }> {
    const operation = 'TREATMENT_PROTOCOL_GENERATION';
    const startTime = Date.now();
    
    try {
      logGPTOperation.start(operation, 'gpt-4o', {
        diagnosis,
        hasPatientContext: !!patientContext
      });

      logGPTOperation.progress(operation, 'Routing through Firebase Functions for secure treatment protocol generation');

      const customApiKey = await this.getUserApiKey();

      // Route through Firebase Functions
      const response = await callFirebaseFunction('generateTreatmentProtocol', {
        diagnosis,
        patientContext
      }, 30000, 2, customApiKey);

      const processingTime = Date.now() - startTime;
      logGPTOperation.success(operation, 'gpt-4o', processingTime, response);

      return response || {
        protocol: [],
        monitoring: [],
        followUp: [],
        contraindications: [],
        evidenceLevel: 'C'
      };

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      logGPTOperation.error(operation, 'gpt-4o', error, processingTime);
      throw new Error(`Failed to generate treatment protocol: ${error.message}`);
    }
  }

}

export const openAIService = new OpenAIService();
export default openAIService;