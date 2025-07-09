// Firebase Functions endpoints for secure server-side OpenAI calls
const FIREBASE_FUNCTIONS_BASE_URL = 'https://us-central1-medicalchartingapp.cloudfunctions.net';

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

// Helper function to call Firebase Functions
const callFirebaseFunction = async (functionName: string, data: any): Promise<any> => {
  const token = await getAuthToken();
  
  const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`Firebase Function error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
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
  type: 'analysis' | 'research' | 'evaluation' | 'synthesis' | 'decision' | 'validation';
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
  private validateApiKey(): void {
    // Always use Firebase Functions - no API key validation needed
    console.log('✅ [OpenAI Debug] Using secure Firebase Functions proxy');
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

      // Route through Firebase Functions
      const response = await callFirebaseFunction('analyzeWithReasoning', {
        transcript,
        patientContext,
        modelType,
        analysisPrompt: undefined
      });

      const processingTime = Date.now() - startTime;
      logGPTOperation.success(operation, modelType, processingTime, response);

      // Convert response to O1AnalysisResult format
      const result: O1AnalysisResult = {
        id: response.id || `analysis-${Date.now()}`,
        symptoms: response.symptoms || [],
        diagnoses: response.diagnoses || [],
        treatments: response.treatments || [],
        concerns: response.concerns || [],
        confidenceScore: response.confidenceScore || 0.5,
        reasoning: response.reasoning || 'Analysis completed via Firebase Functions',
        nextSteps: response.nextSteps || [],
        processingTime,
        timestamp: new Date(),
        reasoningTrace: response.reasoningTrace || {
          sessionId: `session-${Date.now()}`,
          totalSteps: 1,
          steps: [],
          startTime: Date.now(),
          endTime: Date.now(),
          model: modelType,
          reasoning: response.reasoning || 'Analysis completed via Firebase Functions'
        },
        modelUsed: modelType,
        thinkingTime: processingTime
      };

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

      // Route through Firebase Functions
      const response = await callFirebaseFunction('analyzeWithReasoning', {
        transcript,
        patientContext,
        modelType,
        analysisPrompt: undefined
      });

      const processingTime = Date.now() - startTime;
      logGPTOperation.success(operation, modelType, processingTime, response);

      // Convert response to O1DeepAnalysisResult format
      const result: O1DeepAnalysisResult = {
        primaryDiagnosis: response.primaryDiagnosis || {
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
        },
        reasoningTrace: response.reasoningTrace || {
          sessionId: `session-${Date.now()}`,
          totalSteps: 1,
          steps: [],
          startTime: Date.now(),
          endTime: Date.now(),
          model: modelType,
          reasoning: response.reasoning || 'Analysis completed via Firebase Functions'
        },
        modelUsed: modelType,
        thinkingTime: processingTime
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

      // Route through Firebase Functions
      const response = await callFirebaseFunction('transcribeAudio', {
        audioData: fileData,
        fileName: audioFile.name,
        fileType: audioFile.type
      });

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

      // Call Firebase Function for secure server-side OpenAI analysis
      const response = await callFirebaseFunction('analyzeTranscript', {
        transcript,
        patientContext,
        useDeepResearch
      });

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

      // Route through Firebase Functions - use correct parameter format
      const response = await callFirebaseFunction('analyzeTranscript', {
        transcript,
        patientId: null,
        visitId: null
      });

      const processingTime = Date.now() - startTime;
      logGPTOperation.progress(operation, 'Firebase Function call completed, processing response');

      // The Firebase Function now returns a detailed structure
      // Parse the new comprehensive response format

      const differentialData = response.differential_diagnosis || response.differentialDiagnoses || response.diagnoses || [];

      const treatmentData = response.treatment_recommendations || response.treatments || [];

      const concernsData = response.flagged_concerns || response.concerns || [];

      const result: AnalysisResult = {
        id: response.id || `quick-analysis-${Date.now()}`,
        symptoms: response.symptoms?.map((s: any, i: number) => ({
          id: `symptom-${i + 1}`,
          name: s.name || s.symptom || s.description || 'Unknown',
          severity: s.severity || 'mild',
          confidence: this.normalizeConfidenceScore(s.confidence || 0.7),
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
          severity: d.severity || 'low',
          supportingEvidence: d.supportingEvidence || [],
          againstEvidence: d.againstEvidence || [],
          additionalTestsNeeded: d.additionalTestsNeeded || [],
          reasoning: d.reasoning || 'Quick analysis performed',
          urgency: d.urgency || 'routine'
        })) || [],
        treatments: treatmentData.map((t: any, i: number) => ({
          id: `treatment-${i + 1}`,
          category: t.category || 'monitoring',
          recommendation: t.recommendation || 'Continue monitoring',
          priority: t.priority || 'low',
          timeframe: t.timeframe || 'As needed',
          contraindications: t.contraindications || [],
          alternatives: t.alternatives || [],
          expectedOutcome: t.expectedOutcome || 'Unknown',
          evidenceLevel: t.evidenceLevel || 'D'
        })) || [],
        concerns: concernsData.map((c: any, i: number) => ({
          id: `concern-${i + 1}`,
          type: c.type || 'urgent_referral',
          severity: c.severity || 'low',
          message: c.message || 'No immediate concerns',
          recommendation: c.recommendation || 'Continue routine care',
          requiresImmediateAction: c.requiresImmediateAction || false
        })) || [],
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

      // Route through Firebase Functions
      const response = await callFirebaseFunction('generateSummary', {
        transcript,
        type
      });

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

      // Route through Firebase Functions
      const response = await callFirebaseFunction('generateText', {
        prompt,
        model: actualModel
      });

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

      // Route through Firebase Functions
      const response = await callFirebaseFunction('analyzeTranscript', {
        transcript,
        patientContext,
        analysisType: 'deep'
      });

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

      // Route through Firebase Functions
      const response = await callFirebaseFunction('generateTreatmentProtocol', {
        diagnosis,
        patientContext
      });

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