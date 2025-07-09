import OpenAI from 'openai';
import { medicalResearchService } from './medicalResearch';

// OpenAI Configuration - Lazy initialization to handle missing API keys gracefully
let openai: OpenAI | null = null;

const getOpenAIClient = (): OpenAI => {
  if (!openai) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    // Enhanced debug logging
    console.log('🔧 [OpenAI Debug] Initializing OpenAI client...');
    console.log('🔧 [OpenAI Debug] Environment check:', {
      hasApiKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyPrefix: apiKey?.substring(0, 10) || 'none',
      keyIsPlaceholder: apiKey === 'sk-proj-PUT_YOUR_REAL_API_KEY_HERE',
      isDev: import.meta.env.DEV,
      mode: import.meta.env.MODE
    });
    
    if (!apiKey || apiKey === 'your_openai_api_key_here' || apiKey === 'sk-proj-PUT_YOUR_REAL_API_KEY_HERE') {
      console.warn('⚠️ [OpenAI Debug] API key not configured properly. Current value:', apiKey);
      console.warn('⚠️ [OpenAI Debug] Please replace the placeholder value in your .env file with a real OpenAI API key.');
      console.warn('⚠️ [OpenAI Debug] The app will run in development mode with mock responses.');
      
      // Return a dummy client that will fail gracefully
      openai = new OpenAI({
        apiKey: 'placeholder-key-use-firebase-functions',
        dangerouslyAllowBrowser: true
      });
      
      console.log('🔧 [OpenAI Debug] Created dummy client for development mode');
    } else {
      console.log('✅ [OpenAI Debug] Valid API key detected, creating real OpenAI client');
      openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
      });
      console.log('✅ [OpenAI Debug] Real OpenAI client created successfully');
    }
  }
  return openai;
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
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here' || apiKey === 'sk-proj-PUT_YOUR_REAL_API_KEY_HERE') {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
    }
  }

  /**
   * Get optimal model configuration based on analysis type
   */
  private getModelConfig(analysisType: 'quick' | 'deep' | 'reasoning'): ModelConfig {
    switch (analysisType) {
      case 'quick':
        return {
          model: 'gpt-4o',
          temperature: 0.3,
          maxTokens: 1500,
          responseFormat: 'json_object',
          reasoningEnabled: false
        };
      case 'deep':
        return {
          model: 'o1-mini',
          temperature: 1, // o1 models use temperature 1
          maxTokens: 4000,
          responseFormat: 'json_object',
          reasoningEnabled: true
        };
      case 'reasoning':
        return {
          model: 'o1',
          temperature: 1, // o1 models use temperature 1
          maxTokens: 6000,
          responseFormat: 'json_object',
          reasoningEnabled: true
        };
      default:
        return {
          model: 'gpt-4o',
          temperature: 0.3,
          maxTokens: 2000,
          responseFormat: 'json_object',
          reasoningEnabled: false
        };
    }
  }

  /**
   * Extract JSON from markdown text (handles O1 model responses)
   */
  private extractJsonFromMarkdown(text: string): string {
    // Remove markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      return jsonMatch[1];
    }
    
    // Try to find JSON object directly
    const directJsonMatch = text.match(/\{[\s\S]*\}/);
    if (directJsonMatch) {
      return directJsonMatch[0];
    }
    
    // If no JSON found, return the original text
    return text;
  }

  /**
   * Parse reasoning content from o1 model response
   */
  private parseReasoning(completion: any): ReasoningTrace {
    const sessionId = `reasoning-${Date.now()}`;
    const startTime = Date.now();
    
    // Extract reasoning from o1 model if available
    const reasoningContent = completion.choices[0]?.message?.reasoning || '';
    
    // Parse reasoning into steps (simplified for now)
    const steps: ReasoningStep[] = [];
    
    if (reasoningContent) {
      const reasoningLines = reasoningContent.split('\n').filter((line: string) => line.trim());
      let stepCount = 0;
      
      for (let i = 0; i < reasoningLines.length; i++) {
        const line: string = reasoningLines[i];
        
        // Identify reasoning steps (look for common patterns)
        if (line.match(/^(Step|Analysis|Considering|Evaluating|Conclusion|Let me|I need to|Looking at)/i)) {
          stepCount++;
          
          // Determine step type based on content
          let type: ReasoningStep['type'] = 'analysis';
          if (line.match(/research|literature|study|evidence/i)) type = 'research';
          if (line.match(/evaluat|assess|consider|weigh/i)) type = 'evaluation';
          if (line.match(/synthesis|combining|integrat/i)) type = 'synthesis';
          if (line.match(/decision|recommend|conclude/i)) type = 'decision';
          if (line.match(/validat|verify|check/i)) type = 'validation';
          
          steps.push({
            id: `step-${stepCount}`,
            timestamp: startTime + (i * 100), // Simulate timing
            type,
            title: line.substring(0, 100) + (line.length > 100 ? '...' : ''),
            content: line,
            confidence: 0.85 + (Math.random() * 0.15), // Simulate confidence
            evidence: [],
            considerations: []
          });
        }
      }
    }
    
    return {
      sessionId,
      totalSteps: steps.length,
      steps,
      startTime,
      endTime: Date.now(),
      model: completion.model || 'o1',
      reasoning: reasoningContent
    };
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
    const operation = 'REASONING_ANALYSIS';
    const startTime = Date.now();
    
    this.validateApiKey();
    
    try {
      const config = this.getModelConfig('reasoning');
      config.model = modelType;
      
      logGPTOperation.start(operation, config.model, {
        transcriptLength: transcript.length,
        hasPatientContext: !!patientContext,
        modelType
      });

      const systemPrompt = `You are an expert medical AI with advanced reasoning capabilities. Analyze this medical transcript with detailed step-by-step reasoning.

Show your thinking process clearly as you:
1. Analyze the patient's presentation
2. Consider differential diagnoses
3. Evaluate evidence and risk factors
4. Synthesize findings into clinical recommendations
5. Assess confidence and next steps

Provide comprehensive medical analysis in JSON format with detailed reasoning for each conclusion.

IMPORTANT: All confidence scores and probabilities must be 0-1 decimal values.

JSON structure:
{
  "symptoms": [{"name": "string", "severity": "mild|moderate|severe|critical", "confidence": 0-1, "duration": "string", "location": "string", "associatedFactors": ["string"], "sourceText": "string", "reasoning": "why this symptom is significant"}],
  "diagnoses": [{"condition": "string", "icd10Code": "string", "probability": 0-1, "severity": "low|medium|high|critical", "supportingEvidence": ["string"], "againstEvidence": ["string"], "additionalTestsNeeded": ["string"], "reasoning": "detailed reasoning for this diagnosis", "urgency": "routine|urgent|emergent"}],
  "treatments": [{"category": "medication|procedure|lifestyle|referral|monitoring", "recommendation": "string", "priority": "low|medium|high|urgent", "timeframe": "string", "contraindications": ["string"], "alternatives": ["string"], "expectedOutcome": "string", "evidenceLevel": "A|B|C|D", "reasoning": "why this treatment is recommended"}],
  "concerns": [{"type": "red_flag|drug_interaction|allergy|urgent_referral", "severity": "low|medium|high|critical", "message": "string", "recommendation": "string", "requiresImmediateAction": boolean, "reasoning": "why this is concerning"}],
  "confidenceScore": 0-1,
  "reasoning": "comprehensive reasoning summary",
  "nextSteps": ["string"],
  "clinicalReasoning": "detailed clinical reasoning process"
}`;

      const userPrompt = `Patient Context:
${patientContext ? `
Age: ${patientContext.age || 'Unknown'}
Gender: ${patientContext.gender || 'Unknown'}
Medical History: ${patientContext.medicalHistory || 'None provided'}
Current Medications: ${patientContext.medications || 'None provided'}
Known Allergies: ${patientContext.allergies || 'None provided'}
Family History: ${patientContext.familyHistory || 'None provided'}
Social History: ${patientContext.socialHistory || 'None provided'}
` : 'Limited patient context provided'}

Medical Transcript:
${transcript}

Please provide a comprehensive medical analysis with detailed reasoning for each conclusion.`;

      logGPTOperation.progress(operation, 'Preparing API call parameters');

      // O1 models use different parameters and message structure
      const isO1Model = config.model.startsWith('o1');
      const completionParams: any = {
        model: config.model
      };
      
      if (isO1Model) {
        // O1 models use max_completion_tokens, don't support temperature/response_format, and need combined messages
        completionParams.max_completion_tokens = config.maxTokens;
        completionParams.messages = [
          { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }
        ];
      } else {
        // GPT models use the traditional parameters and separate messages
        completionParams.temperature = config.temperature;
        completionParams.max_tokens = config.maxTokens;
        completionParams.response_format = { type: config.responseFormat as 'json_object' };
        completionParams.messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ];
      }

      logGPTOperation.progress(operation, 'Calling OpenAI API', { 
        model: config.model, 
        isO1Model,
        maxTokens: completionParams.max_completion_tokens || completionParams.max_tokens
      });

      const completion = await getOpenAIClient().chat.completions.create(completionParams);

      const processingTime = Date.now() - startTime;
      logGPTOperation.progress(operation, 'API call completed, processing response');

      const thinkingTime = Date.now() - startTime;
      const reasoningTrace = this.parseReasoning(completion);
      
      const analysisContent = completion.choices[0]?.message?.content;
      if (!analysisContent) {
        throw new Error('No analysis content received from OpenAI');
      }

      logGPTOperation.progress(operation, 'Parsing response content', {
        contentLength: analysisContent.length,
        hasReasoning: !!(completion.choices[0]?.message as any)?.reasoning
      });

      // Extract JSON from O1 model response (handles markdown formatting)
      const jsonContent = isO1Model ? this.extractJsonFromMarkdown(analysisContent) : analysisContent;
      
      let analysis;
      try {
        analysis = JSON.parse(jsonContent);
        logGPTOperation.progress(operation, 'JSON parsing successful');
              } catch (parseError: any) {
          logGPTOperation.error(operation, config.model, parseError, processingTime);
        console.error('JSON parsing failed:', parseError);
        console.error('Raw content:', analysisContent);
        console.error('Extracted JSON:', jsonContent);
        
        // Fallback: Create a basic analysis structure
        analysis = {
          symptoms: [],
          diagnoses: [{
            condition: "Analysis parsing failed",
            icd10Code: "Z99.9",
            probability: 0.1,
            severity: "low",
            supportingEvidence: ["System error during analysis"],
            againstEvidence: [],
            additionalTestsNeeded: ["Retry analysis"],
            reasoning: "Failed to parse AI response",
            urgency: "routine"
          }],
          treatments: [],
          concerns: [],
          confidenceScore: 0.1,
          reasoning: "Analysis failed due to response parsing error",
          nextSteps: ["Retry analysis with different parameters"],
          clinicalReasoning: "System error occurred during analysis"
        };
      }

      // Process and structure the result
      const result: O1AnalysisResult = {
        id: `o1-analysis-${Date.now()}`,
        symptoms: analysis.symptoms?.map((s: any, i: number) => ({
          id: `symptom-${i + 1}`,
          name: s.name || 'Unknown symptom',
          severity: s.severity || 'mild',
          confidence: this.normalizeConfidenceScore(s.confidence || 0.5),
          duration: s.duration || 'Unknown',
          location: s.location,
          quality: s.quality,
          associatedFactors: s.associatedFactors || [],
          sourceText: s.sourceText || ''
        })) || [],
        diagnoses: analysis.diagnoses?.map((d: any, i: number) => ({
          id: `diagnosis-${i + 1}`,
          condition: d.condition || 'Unknown',
          icd10Code: d.icd10Code || 'Z99.9',
          probability: this.normalizeConfidenceScore(d.probability || 0.5),
          severity: d.severity || 'low',
          supportingEvidence: d.supportingEvidence || [],
          againstEvidence: d.againstEvidence || [],
          additionalTestsNeeded: d.additionalTestsNeeded || [],
          reasoning: d.reasoning || '',
          urgency: d.urgency || 'routine'
        })) || [],
        treatments: analysis.treatments?.map((t: any, i: number) => ({
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
        concerns: analysis.concerns?.map((c: any, i: number) => ({
          id: `concern-${i + 1}`,
          type: c.type || 'urgent_referral',
          severity: c.severity || 'low',
          message: c.message || 'No specific concerns identified',
          recommendation: c.recommendation || 'Continue routine care',
          requiresImmediateAction: c.requiresImmediateAction || false
        })) || [],
        confidenceScore: this.normalizeConfidenceScore(analysis.confidenceScore || 0.8),
        reasoning: analysis.reasoning || analysis.clinicalReasoning || 'O1 analysis completed',
        nextSteps: analysis.nextSteps || ['Follow up as needed'],
        processingTime: processingTime,
        timestamp: new Date(),
        reasoningTrace,
        modelUsed: config.model as 'o1' | 'o1-mini' | 'gpt-4o',
        thinkingTime
      };

      logGPTOperation.success(operation, config.model, processingTime, {
        symptomsCount: result.symptoms.length,
        diagnosesCount: result.diagnoses.length,
        treatmentsCount: result.treatments.length,
        concernsCount: result.concerns.length,
        confidenceScore: result.confidenceScore,
        reasoningSteps: reasoningTrace.totalSteps
      });

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
    const operation = 'DEEP_REASONING_ANALYSIS';
    const startTime = Date.now();
    
    this.validateApiKey();
    
    try {
      logGPTOperation.start(operation, modelType, {
        transcriptLength: transcript.length,
        hasPatientContext: !!patientContext,
        modelType
      });
      
      // Step 1: Perform comprehensive medical research
      logGPTOperation.progress(operation, 'Performing medical research');
      const researchContext = await this.performMedicalResearch(transcript, patientContext);
      
      // Step 2: Use o1 model for deep analysis with research integration
      logGPTOperation.progress(operation, 'Configuring model for deep analysis');
      const config = this.getModelConfig('reasoning');
      config.model = modelType;
      
      const systemPrompt = `You are an expert medical AI with advanced reasoning capabilities and access to current medical research. 

Perform a comprehensive medical analysis that integrates research evidence with clinical reasoning.

Show your step-by-step thinking process as you:
1. Analyze the patient's clinical presentation
2. Review and synthesize research evidence
3. Consider differential diagnoses with evidence support
4. Evaluate treatment options based on current evidence
5. Assess risks and develop follow-up protocols
6. Provide confidence assessment with evidence quality analysis

IMPORTANT: All confidence scores and probabilities must be 0-1 decimal values.

JSON structure:
{
  "primaryDiagnosis": {
    "condition": "string",
    "icd10Code": "string", 
    "probability": 0-1,
    "severity": "low|medium|high|critical",
    "supportingEvidence": ["string"],
    "researchSupport": ["string"],
    "reasoning": "detailed reasoning with evidence integration",
    "urgency": "routine|urgent|emergent"
  },
  "differentialDiagnoses": [
    {
      "condition": "string",
      "icd10Code": "string",
      "probability": 0-1,
      "likelihood": "high|medium|low",
      "supportingEvidence": ["string"],
      "againstEvidence": ["string"],
      "additionalTestsNeeded": ["string"],
      "reasoning": "evidence-based reasoning for differential"
    }
  ],
  "researchEvidence": [
    {
      "source": "string",
      "type": "clinical_study|systematic_review|guideline|case_study|meta_analysis",
      "reliability": "high|medium|low",
      "yearPublished": number,
      "summary": "string",
      "relevanceScore": 0-1,
      "clinicalImplication": "string"
    }
  ],
  "clinicalRecommendations": [
    {
      "category": "medication|procedure|lifestyle|referral|monitoring",
      "recommendation": "string",
      "priority": "low|medium|high|urgent",
      "evidenceLevel": "A|B|C|D",
      "timeframe": "string",
      "expectedOutcome": "string",
      "contraindications": ["string"],
      "alternatives": ["string"],
      "reasoning": "evidence-based reasoning for recommendation"
    }
  ],
  "riskFactors": ["string"],
  "prognosticFactors": ["string"],
  "followUpProtocol": ["string"],
  "contraindications": ["string"],
  "emergencyFlags": [
    {
      "type": "red_flag|drug_interaction|allergy|urgent_referral",
      "severity": "low|medium|high|critical",
      "message": "string",
      "recommendation": "string",
      "requiresImmediateAction": boolean,
      "reasoning": "why this requires attention"
    }
  ],
  "confidenceAssessment": {
    "evidenceQuality": "high|medium|low",
    "consistencyScore": 0-1,
    "gaps": ["string"],
    "recommendations": ["string"],
    "reasoning": "assessment of evidence quality and consistency"
  },
  "clinicalReasoning": "comprehensive reasoning summary with evidence integration"
}`;

      const userPrompt = `Research Context:
${JSON.stringify(researchContext, null, 2)}

Patient Context:
${patientContext ? `
Age: ${patientContext.age || 'Unknown'}
Gender: ${patientContext.gender || 'Unknown'}
Medical History: ${patientContext.medicalHistory || 'None provided'}
Current Medications: ${patientContext.medications || 'None provided'}
Known Allergies: ${patientContext.allergies || 'None provided'}
Family History: ${patientContext.familyHistory || 'None provided'}
Social History: ${patientContext.socialHistory || 'None provided'}
` : 'Limited patient context provided'}

Clinical Presentation:
${transcript}

Please provide a comprehensive medical analysis integrating the research evidence with advanced clinical reasoning. Show your thinking process clearly.`;

      // O1 models use different parameters and message structure
      const isO1Model = config.model.startsWith('o1');
      const completionParams: any = {
        model: config.model
      };
      
      if (isO1Model) {
        // O1 models use max_completion_tokens, don't support temperature/response_format, and need combined messages
        completionParams.max_completion_tokens = config.maxTokens;
        completionParams.messages = [
          { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }
        ];
      } else {
        // GPT models use the traditional parameters and separate messages
        completionParams.temperature = config.temperature;
        completionParams.max_tokens = config.maxTokens;
        completionParams.response_format = { type: config.responseFormat as 'json_object' };
        completionParams.messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ];
      }

      logGPTOperation.progress(operation, 'Calling OpenAI API for deep analysis', {
        model: config.model,
        isO1Model,
        researchEvidenceCount: researchContext.evidence.length
      });

      const completion = await getOpenAIClient().chat.completions.create(completionParams);

      const apiCallTime = Date.now() - startTime;
      logGPTOperation.progress(operation, 'API call completed, processing deep analysis response');

      const thinkingTime = Date.now() - startTime;
      const reasoningTrace = this.parseReasoning(completion);
      
      const analysisContent = completion.choices[0]?.message?.content;
      if (!analysisContent) {
        throw new Error('No analysis content received from OpenAI');
      }

      logGPTOperation.progress(operation, 'Parsing deep analysis response', {
        contentLength: analysisContent.length,
        hasReasoning: !!(completion.choices[0]?.message as any)?.reasoning
      });

      // Extract JSON from O1 model response (handles markdown formatting)
      const jsonContent = isO1Model ? this.extractJsonFromMarkdown(analysisContent) : analysisContent;
      
      let analysisData;
      try {
        analysisData = JSON.parse(jsonContent);
        logGPTOperation.progress(operation, 'JSON parsing successful for deep analysis');
      } catch (parseError: any) {
        logGPTOperation.error(operation, config.model, parseError, apiCallTime);
        console.error('JSON parsing failed in deep analysis:', parseError);
        console.error('Raw content:', analysisContent);
        console.error('Extracted JSON:', jsonContent);
        
        // Fallback: Create a basic deep analysis structure
        analysisData = {
          primaryDiagnosis: {
            condition: "Analysis Error",
            icd10Code: "Z00.00",
            probability: 0.5,
            severity: "medium",
            supportingEvidence: ["Unable to parse AI response"],
            reasoning: "Response parsing failed - please try again",
            urgency: "routine"
          },
          differentialDiagnoses: [],
          researchEvidence: [],
          clinicalRecommendations: [],
          riskFactors: [],
          prognosticFactors: [],
          followUpProtocol: ["Retry analysis with O1 model"],
          contraindications: [],
          emergencyFlags: [],
          confidenceAssessment: {
            evidenceQuality: "low",
            consistencyScore: 0.1,
            gaps: ["Response parsing failed"],
            recommendations: ["Please try the analysis again"]
          },
          clinicalReasoning: analysisContent // Include raw content for debugging
        };
      }

      // Convert to deep analysis format
      const result: O1DeepAnalysisResult = {
        primaryDiagnosis: {
          id: `primary-diagnosis-${Date.now()}`,
          condition: analysisData.primaryDiagnosis?.condition || 'Unknown',
          icd10Code: analysisData.primaryDiagnosis?.icd10Code || '',
          probability: this.normalizeConfidenceScore(analysisData.primaryDiagnosis?.probability || 0.5),
          severity: analysisData.primaryDiagnosis?.severity || 'medium',
          supportingEvidence: analysisData.primaryDiagnosis?.supportingEvidence || [],
          againstEvidence: [],
          additionalTestsNeeded: [],
          reasoning: analysisData.primaryDiagnosis?.reasoning || '',
          urgency: analysisData.primaryDiagnosis?.urgency || 'routine'
        },
        differentialDiagnoses: analysisData.differentialDiagnoses.map((dx: any, index: number) => ({
          id: `differential-${index + 1}`,
          condition: dx.condition,
          icd10Code: dx.icd10Code,
          probability: this.normalizeConfidenceScore(dx.probability),
          severity: dx.likelihood === 'high' ? 'high' : dx.likelihood === 'medium' ? 'medium' : 'low',
          supportingEvidence: dx.supportingEvidence,
          againstEvidence: dx.againstEvidence,
          additionalTestsNeeded: dx.additionalTestsNeeded,
          reasoning: dx.reasoning,
          urgency: 'routine'
        })),
        researchEvidence: (analysisData.researchEvidence || []).map((evidence: any, index: number) => ({
          id: `research-evidence-${index + 1}`,
          source: evidence.source,
          type: evidence.type,
          reliability: evidence.reliability,
          yearPublished: evidence.yearPublished,
          summary: evidence.summary,
          relevanceScore: this.normalizeConfidenceScore(evidence.relevanceScore),
          url: evidence.url
        })),
        clinicalRecommendations: (analysisData.clinicalRecommendations || []).map((rec: any, index: number) => ({
          id: `recommendation-${index + 1}`,
          category: rec.category,
          recommendation: rec.recommendation,
          priority: rec.priority,
          timeframe: rec.timeframe,
          contraindications: rec.contraindications,
          alternatives: rec.alternatives,
          expectedOutcome: rec.expectedOutcome,
          evidenceLevel: rec.evidenceLevel
        })),
        riskFactors: analysisData.riskFactors || [],
        prognosticFactors: analysisData.prognosticFactors || [],
        followUpProtocol: analysisData.followUpProtocol || [],
        contraindications: analysisData.contraindications || [],
        emergencyFlags: (analysisData.emergencyFlags || []).map((flag: any, index: number) => ({
          id: `emergency-flag-${index + 1}`,
          type: flag.type,
          severity: flag.severity,
          message: flag.message,
          recommendation: flag.recommendation,
          requiresImmediateAction: flag.requiresImmediateAction || false
        })),
        confidenceAssessment: {
          evidenceQuality: analysisData.confidenceAssessment?.evidenceQuality || 'medium',
          consistencyScore: this.normalizeConfidenceScore(analysisData.confidenceAssessment?.consistencyScore || 0.7),
          gaps: analysisData.confidenceAssessment?.gaps || [],
          recommendations: analysisData.confidenceAssessment?.recommendations || []
        },
        reasoningTrace,
        modelUsed: config.model as 'o1' | 'o1-mini' | 'gpt-4o',
        thinkingTime
      };

      const finalProcessingTime = Date.now() - startTime;
      logGPTOperation.success(operation, config.model, finalProcessingTime, {
        primaryDiagnosis: result.primaryDiagnosis.condition,
        differentialDiagnosesCount: result.differentialDiagnoses.length,
        researchEvidenceCount: result.researchEvidence.length,
        recommendationsCount: result.clinicalRecommendations.length,
        emergencyFlagsCount: result.emergencyFlags.length,
        confidenceScore: result.confidenceAssessment.consistencyScore,
        evidenceQuality: result.confidenceAssessment.evidenceQuality,
        reasoningSteps: reasoningTrace.totalSteps
      });

      return result;
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      logGPTOperation.error(operation, modelType, error, processingTime);
      throw new Error(`Failed to perform deep analysis with reasoning: ${error.message}`);
    }
  }

  /**
   * Transcribe audio file using OpenAI Whisper
   */
  async transcribeAudio(audioFile: File): Promise<TranscriptionResult> {
    const operation = 'TRANSCRIPTION';
    const startTime = Date.now();
    
    this.validateApiKey();
    
    try {
      logGPTOperation.start(operation, 'whisper-1', {
        fileName: audioFile.name,
        fileSize: audioFile.size,
        fileType: audioFile.type
      });

      logGPTOperation.progress(operation, 'Uploading audio file to OpenAI');

      // Use OpenAI Whisper for transcription
      const transcription = await getOpenAIClient().audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['segment']
      });

      logGPTOperation.progress(operation, 'Processing transcription segments');

      // Process the transcription into our format
      const segments = transcription.segments?.map((segment, index) => ({
        id: `segment-${index + 1}`,
        speaker: this.identifySpeaker(segment.text, index),
        timestamp: segment.start,
        text: segment.text,
        confidence: this.normalizeConfidenceScore(segment.avg_logprob ? Math.exp(segment.avg_logprob) : 0.85),
        tags: this.extractTags(segment.text)
      })) || [];

      const result = {
        text: transcription.text,
        segments,
        confidence: this.normalizeConfidenceScore(segments.reduce((acc, seg) => acc + seg.confidence, 0) / segments.length || 0.85),
        duration: transcription.duration || 0
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
      throw new Error('Failed to transcribe audio. Please check your API key and try again.');
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
      
      const systemPrompt = `You are an expert medical AI analyzing patient transcripts. Provide comprehensive analysis in JSON format.

IMPORTANT: All confidence scores and probabilities must be 0-1 decimal values (e.g., 0.85 for 85%).

JSON structure:
{
  "symptoms": [{"name": "string", "severity": "mild|moderate|severe|critical", "confidence": 0-1, "duration": "string", "location": "string", "associatedFactors": ["string"], "sourceText": "string"}],
  "diagnoses": [{"condition": "string", "icd10Code": "string", "probability": 0-1, "severity": "low|medium|high|critical", "supportingEvidence": ["string"], "againstEvidence": ["string"], "additionalTestsNeeded": ["string"], "reasoning": "string", "urgency": "routine|urgent|emergent"}],
  "treatments": [{"category": "medication|procedure|lifestyle|referral|monitoring", "recommendation": "string", "priority": "low|medium|high|urgent", "timeframe": "string", "contraindications": ["string"], "alternatives": ["string"], "expectedOutcome": "string", "evidenceLevel": "A|B|C|D"}],
  "concerns": [{"type": "red_flag|drug_interaction|allergy|urgent_referral", "severity": "low|medium|high|critical", "message": "string", "recommendation": "string", "requiresImmediateAction": boolean}],
  "confidenceScore": 0-1,
  "reasoning": "string",
  "nextSteps": ["string"]
}

Be thorough but concise. Focus on most likely diagnoses and key clinical actions.`;

      const userPrompt = `Analyze this medical transcript:

      ${patientContext ? `Patient Context:
      Age: ${patientContext.age || 'Unknown'}
      Gender: ${patientContext.gender || 'Unknown'}
      Medical History: ${patientContext.medicalHistory || 'None provided'}
      Current Medications: ${patientContext.medications || 'None provided'}
      Known Allergies: ${patientContext.allergies || 'None provided'}
      Family History: ${patientContext.familyHistory || 'None provided'}
      Social History: ${patientContext.socialHistory || 'None provided'}
      
      ` : ''}Transcript:
      ${transcript}
      
      Please provide a comprehensive medical analysis in the requested JSON format.`;

      logGPTOperation.progress(operation, 'Calling OpenAI API with 30s timeout');

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Analysis timed out after 30 seconds')), 30000);
      });

      // Race between OpenAI call and timeout
      const completion = await Promise.race([
        getOpenAIClient().chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 3000,
          response_format: { type: 'json_object' }
        }),
        timeoutPromise
      ]) as any;

      const processingTime = Date.now() - startTime;
      logGPTOperation.progress(operation, 'API call completed, parsing response');

      const analysisContent = completion.choices[0]?.message?.content;

      if (!analysisContent) {
        throw new Error('No analysis content received from OpenAI');
      }

      const analysis = JSON.parse(analysisContent);
      logGPTOperation.progress(operation, 'JSON parsing successful, processing results');
      
      // Add IDs and ensure proper structure with normalized confidence scores
      const processedAnalysis: AnalysisResult = {
        id: `analysis-${Date.now()}`,
        symptoms: analysis.symptoms?.map((s: any, i: number) => ({
          id: `symptom-${i + 1}`,
          ...s,
          confidence: this.normalizeConfidenceScore(s.confidence || 0.8)
        })) || [],
        diagnoses: analysis.diagnoses?.map((d: any, i: number) => ({
          id: `diagnosis-${i + 1}`,
          ...d,
          probability: this.normalizeConfidenceScore(d.probability || 0.5)
        })) || [],
        treatments: analysis.treatments?.map((t: any, i: number) => ({
          id: `treatment-${i + 1}`,
          ...t
        })) || [],
        concerns: analysis.concerns?.map((c: any, i: number) => ({
          id: `concern-${i + 1}`,
          ...c
        })) || [],
        confidenceScore: this.normalizeConfidenceScore(analysis.confidenceScore || 0.8),
        reasoning: analysis.reasoning || 'Analysis completed using GPT-4 medical assessment.',
        nextSteps: analysis.nextSteps || ['Review findings with attending physician', 'Consider additional diagnostic tests'],
        processingTime,
        timestamp: new Date()
      };

      logGPTOperation.success(operation, useDeepResearch ? 'deep-research' : 'gpt-4o', processingTime, {
        symptomsCount: processedAnalysis.symptoms.length,
        diagnosesCount: processedAnalysis.diagnoses.length,
        treatmentsCount: processedAnalysis.treatments.length,
        concernsCount: processedAnalysis.concerns.length,
        confidenceScore: processedAnalysis.confidenceScore
      });

      return processedAnalysis;
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      logGPTOperation.error(operation, useDeepResearch ? 'deep-research' : 'gpt-4o', error, processingTime);
      throw new Error('Failed to analyze transcript. Please check your input and try again.');
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
      
      const systemPrompt = `You are a medical AI. Provide rapid analysis in JSON format.
      
      JSON structure:
      {
        "symptoms": [{"name": "string", "severity": "mild|moderate|severe|critical", "confidence": 0-1, "duration": "string", "sourceText": "string"}],
        "diagnoses": [{"condition": "string", "icd10Code": "string", "probability": 0-1, "severity": "low|medium|high|critical", "reasoning": "string", "urgency": "routine|urgent|emergent"}],
        "treatments": [{"recommendation": "string", "priority": "low|medium|high|urgent", "evidenceLevel": "A|B|C|D"}],
        "concerns": [{"type": "red_flag|urgent_referral", "severity": "low|medium|high|critical", "message": "string", "requiresImmediateAction": boolean}],
        "confidenceScore": 0-1,
        "reasoning": "string",
        "nextSteps": ["string"]
      }
      
      Focus on top 3 most likely diagnoses and immediate actions.`;

      const userPrompt = `Quick analysis of: ${transcript}`;

      logGPTOperation.progress(operation, 'Calling OpenAI API with 15s timeout');

      const completion = await Promise.race([
        getOpenAIClient().chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.4,
          max_tokens: 1500,
          response_format: { type: 'json_object' }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Quick analysis timed out after 15 seconds')), 15000)
        )
      ]) as any;

      const processingTime = Date.now() - startTime;
      logGPTOperation.progress(operation, 'API call completed, processing response');

      const analysisContent = completion.choices[0]?.message?.content;
      if (!analysisContent) {
        throw new Error('No analysis content received from OpenAI');
      }

      const analysis = JSON.parse(analysisContent);
      
      const result: AnalysisResult = {
        id: `quick-analysis-${Date.now()}`,
        symptoms: analysis.symptoms?.map((s: any, i: number) => ({
          id: `symptom-${i + 1}`,
          name: s.name || 'Unknown',
          severity: s.severity || 'mild',
          confidence: this.normalizeConfidenceScore(s.confidence || 0.7),
          duration: s.duration || 'Unknown',
          location: s.location || '',
          quality: s.quality || '',
          associatedFactors: s.associatedFactors || [],
          sourceText: s.sourceText || ''
        })) || [],
        diagnoses: analysis.diagnoses?.map((d: any, i: number) => ({
          id: `diagnosis-${i + 1}`,
          condition: d.condition || 'Unknown',
          icd10Code: d.icd10Code || 'Z99.9',
          probability: this.normalizeConfidenceScore(d.probability || 0.5),
          severity: d.severity || 'low',
          supportingEvidence: d.supportingEvidence || [],
          againstEvidence: d.againstEvidence || [],
          additionalTestsNeeded: d.additionalTestsNeeded || [],
          reasoning: d.reasoning || 'Quick analysis performed',
          urgency: d.urgency || 'routine'
        })) || [],
        treatments: analysis.treatments?.map((t: any, i: number) => ({
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
        concerns: analysis.concerns?.map((c: any, i: number) => ({
          id: `concern-${i + 1}`,
          type: c.type || 'urgent_referral',
          severity: c.severity || 'low',
          message: c.message || 'No immediate concerns',
          recommendation: c.recommendation || 'Continue routine care',
          requiresImmediateAction: c.requiresImmediateAction || false
        })) || [],
        confidenceScore: this.normalizeConfidenceScore(analysis.confidenceScore || 0.7),
        reasoning: analysis.reasoning || 'Quick analysis completed',
        nextSteps: analysis.nextSteps || ['Follow up as needed'],
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

      const completion = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a medical scribe creating concise, professional clinical summaries. 
            Focus on key medical information: chief complaint, history of present illness, 
            physical examination findings, assessment, and plan.`
          },
          {
            role: 'user',
            content: `Create a ${type} summary from this medical transcript:

            ${transcript}`
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      });

      const processingTime = Date.now() - startTime;
      const result = completion.choices[0]?.message?.content || 'Summary could not be generated.';

      logGPTOperation.success(operation, 'gpt-4o', processingTime, {
        summaryLength: result.length,
        summaryType: type
      });

      return result;
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

      const completion = await getOpenAIClient().chat.completions.create({
        model: actualModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500
      });

      const processingTime = Date.now() - startTime;
      const result = completion.choices[0]?.message?.content || 'Response could not be generated.';

      logGPTOperation.success(operation, actualModel, processingTime, {
        responseLength: result.length
      });

      return result;
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
    try {
      this.validateApiKey();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get service status and configuration info
   */
  getStatus(): { configured: boolean; hasApiKey: boolean; message: string } {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const hasApiKey = !!apiKey && apiKey !== 'your_openai_api_key_here' && apiKey !== 'sk-proj-PUT_YOUR_REAL_API_KEY_HERE';
    
    return {
      configured: hasApiKey,
      hasApiKey,
      message: hasApiKey 
        ? 'OpenAI service is configured and ready' 
        : 'OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.'
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
    this.validateApiKey();
    
    try {
      // const startTime = Date.now();
      
      // Step 1: Perform research on the patient's symptoms and conditions
      const researchContext = await this.performMedicalResearch(transcript, patientContext);
      
      // Step 2: Generate deep analysis with research context
      const systemPrompt = `You are an expert medical AI with access to current medical research and evidence-based medicine. 
      
Your task is to provide a comprehensive medical analysis that integrates:
1. Current medical evidence and research
2. Clinical reasoning and differential diagnosis
3. Evidence-based treatment recommendations
4. Risk stratification and prognosis
5. Quality assessment of available evidence

IMPORTANT: All confidence scores and probabilities must be 0-1 decimal values.

Use the provided research context to inform your analysis. Consider:
- Quality and consistency of evidence
- Potential contradictions in research
- Gaps in knowledge
- Clinical applicability of research findings
- Risk-benefit analysis based on evidence

JSON structure:
{
  "primaryDiagnosis": {
    "condition": "string",
    "icd10Code": "string", 
    "probability": 0-1,
    "severity": "low|medium|high|critical",
    "supportingEvidence": ["string"],
    "researchSupport": ["string"],
    "reasoning": "string",
    "urgency": "routine|urgent|emergent"
  },
  "differentialDiagnoses": [
    {
      "condition": "string",
      "icd10Code": "string",
      "probability": 0-1,
      "likelihood": "high|medium|low",
      "supportingEvidence": ["string"],
      "againstEvidence": ["string"],
      "additionalTestsNeeded": ["string"],
      "reasoning": "string"
    }
  ],
  "researchEvidence": [
    {
      "source": "string",
      "type": "clinical_study|systematic_review|guideline|case_study|meta_analysis",
      "reliability": "high|medium|low",
      "yearPublished": number,
      "summary": "string",
      "relevanceScore": 0-1,
      "clinicalImplication": "string"
    }
  ],
  "clinicalRecommendations": [
    {
      "category": "medication|procedure|lifestyle|referral|monitoring",
      "recommendation": "string",
      "priority": "low|medium|high|urgent",
      "evidenceLevel": "A|B|C|D",
      "timeframe": "string",
      "expectedOutcome": "string",
      "contraindications": ["string"],
      "alternatives": ["string"]
    }
  ],
  "riskFactors": ["string"],
  "prognosticFactors": ["string"],
  "followUpProtocol": ["string"],
  "contraindications": ["string"],
  "emergencyFlags": [
    {
      "type": "red_flag|drug_interaction|allergy|urgent_referral",
      "severity": "low|medium|high|critical",
      "message": "string",
      "recommendation": "string",
      "requiresImmediateAction": boolean
    }
  ],
  "confidenceAssessment": {
    "evidenceQuality": "high|medium|low",
    "consistencyScore": 0-1,
    "gaps": ["string"],
    "recommendations": ["string"]
  }
}`;

      const userPrompt = `Research Context:
      ${JSON.stringify(researchContext, null, 2)}
      
      Patient Context:
      ${patientContext ? `
      Age: ${patientContext.age || 'Unknown'}
      Gender: ${patientContext.gender || 'Unknown'}
      Medical History: ${patientContext.medicalHistory || 'None provided'}
      Current Medications: ${patientContext.medications || 'None provided'}
      Known Allergies: ${patientContext.allergies || 'None provided'}
      Family History: ${patientContext.familyHistory || 'None provided'}
      Social History: ${patientContext.socialHistory || 'None provided'}
      ` : 'Limited patient context provided'}
      
      Clinical Presentation:
      ${transcript}
      
      Please provide a comprehensive medical analysis integrating the research evidence with clinical reasoning. Focus on evidence-based medicine and current best practices.`;

      const completion = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2, // Lower temperature for more consistent medical analysis
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      });

      const analysisContent = completion.choices[0]?.message?.content;
      if (!analysisContent) {
        throw new Error('No analysis content received from OpenAI');
      }

      const analysisData = JSON.parse(analysisContent);
      
      // Convert to our interface format
      const deepAnalysis: DeepAnalysisResult = {
        primaryDiagnosis: {
          id: `dx-primary-${Date.now()}`,
          condition: analysisData.primaryDiagnosis.condition,
          icd10Code: analysisData.primaryDiagnosis.icd10Code,
          probability: analysisData.primaryDiagnosis.probability,
          severity: analysisData.primaryDiagnosis.severity,
          supportingEvidence: analysisData.primaryDiagnosis.supportingEvidence,
          againstEvidence: [],
          additionalTestsNeeded: [],
          reasoning: analysisData.primaryDiagnosis.reasoning,
          urgency: analysisData.primaryDiagnosis.urgency
        },
        differentialDiagnoses: analysisData.differentialDiagnoses.map((dx: any, index: number) => ({
          id: `dx-diff-${index}`,
          condition: dx.condition,
          icd10Code: dx.icd10Code,
          probability: dx.probability,
          severity: dx.likelihood === 'high' ? 'high' : dx.likelihood === 'medium' ? 'medium' : 'low',
          supportingEvidence: dx.supportingEvidence,
          againstEvidence: dx.againstEvidence,
          additionalTestsNeeded: dx.additionalTestsNeeded,
          reasoning: dx.reasoning,
          urgency: 'routine'
        })),
        researchEvidence: analysisData.researchEvidence.map((evidence: any, index: number) => ({
          id: `evidence-${index}`,
          source: evidence.source,
          type: evidence.type,
          reliability: evidence.reliability,
          yearPublished: evidence.yearPublished,
          summary: evidence.summary,
          relevanceScore: evidence.relevanceScore,
          url: evidence.url
        })),
        clinicalRecommendations: analysisData.clinicalRecommendations.map((rec: any, index: number) => ({
          id: `rec-${index}`,
          category: rec.category,
          recommendation: rec.recommendation,
          priority: rec.priority,
          timeframe: rec.timeframe,
          contraindications: rec.contraindications,
          alternatives: rec.alternatives,
          expectedOutcome: rec.expectedOutcome,
          evidenceLevel: rec.evidenceLevel
        })),
        riskFactors: analysisData.riskFactors,
        prognosticFactors: analysisData.prognosticFactors,
        followUpProtocol: analysisData.followUpProtocol,
        contraindications: analysisData.contraindications,
        emergencyFlags: analysisData.emergencyFlags.map((flag: any, index: number) => ({
          id: `flag-${index}`,
          type: flag.type,
          severity: flag.severity,
          message: flag.message,
          recommendation: flag.recommendation,
          requiresImmediateAction: flag.requiresImmediateAction
        })),
        confidenceAssessment: analysisData.confidenceAssessment
      };

      return deepAnalysis;
    } catch (error) {
      console.error('Error in deep medical analysis:', error);
      throw new Error('Failed to perform deep medical analysis. Please try again.');
    }
  }

  /**
   * Perform medical research using web search and knowledge base
   */
  private async performMedicalResearch(
    transcript: string,
    patientContext?: any
  ): Promise<ResearchContext> {
    // Extract key medical terms and conditions from transcript
    const researchQueries = await this.extractResearchQueries(transcript);
    
    // Extract potential diagnoses for more targeted research
    const potentialDiagnoses = await this.extractPotentialDiagnoses(transcript);
    
    // Use enhanced medical research service
    const researchContext = await medicalResearchService.performComprehensiveResearch(
      researchQueries,
      potentialDiagnoses,
      patientContext || {}
    );
    
    return researchContext;
  }

  /**
   * Extract relevant research queries from medical transcript
   */
  private async extractResearchQueries(transcript: string): Promise<string[]> {
    const systemPrompt = `You are a medical research assistant. Extract key medical concepts, symptoms, and conditions from the patient transcript that would benefit from current research evidence.

Return a JSON array of specific research queries that would help with diagnosis and treatment planning.

Format: {"queries": ["query1", "query2", "query3"]}

Focus on:
- Primary symptoms and their combinations
- Potential diagnoses mentioned
- Treatment considerations
- Risk factors
- Complications`;

    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Extract research queries from: ${transcript}` }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{"queries": []}');
    return result.queries || [];
  }

  /**
   * Extract potential diagnoses from medical transcript
   */
  private async extractPotentialDiagnoses(transcript: string): Promise<string[]> {
    const systemPrompt = `You are a medical diagnostic assistant. Extract potential diagnoses and medical conditions from the patient transcript that would benefit from research evidence.

Return a JSON array of potential diagnoses and conditions.

Format: {"diagnoses": ["diagnosis1", "diagnosis2", "diagnosis3"]}

Focus on:
- Most likely diagnoses based on symptoms
- Differential diagnoses to consider
- Medical conditions mentioned
- Related disease states`;

    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Extract potential diagnoses from: ${transcript}` }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{"diagnoses": []}');
    return result.diagnoses || [];
  }

  /**
   * Search medical literature (simulated with AI knowledge)
   */
  /* private async searchMedicalLiterature(query: string): Promise<MedicalEvidence[]> {
    const systemPrompt = `You are a medical literature search engine. For the given query, provide relevant medical evidence from recent research, guidelines, and clinical studies.

Return JSON array of evidence with the following structure:
[
  {
    "source": "Study/guideline title and authors",
    "type": "clinical_study|systematic_review|guideline|case_study|meta_analysis",
    "reliability": "high|medium|low",
    "yearPublished": number (2020-2024),
    "summary": "Brief summary of findings",
    "relevanceScore": 0-1,
    "clinicalImplication": "How this applies to clinical practice"
  }
]

Focus on:
- Recent evidence (2020-2024)
- High-quality studies
- Clinical applicability
- Guidelines from major medical organizations`;

    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Search for evidence on: ${query}` }
      ],
      temperature: 0.2,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{"evidence": []}');
    return (result.evidence || []).map((evidence: any, index: number) => ({
      id: `evidence-${query}-${index}`,
      ...evidence
    }));
  } */

  /**
   * Analyze evidence for contradictions and gaps
   */
  /* private async analyzeEvidence(evidence: MedicalEvidence[], transcript: string): Promise<{
    contradictions: string[];
    gaps: string[];
    recommendations: string[];
  }> {
    const systemPrompt = `You are a medical evidence analyst. Review the provided evidence and identify:
1. Contradictions between different studies
2. Gaps in the evidence
3. Recommendations for clinical practice

Return JSON with:
{
  "contradictions": ["description of contradictions"],
  "gaps": ["areas where evidence is lacking"],
  "recommendations": ["evidence-based recommendations"]
}`;

    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Evidence: ${JSON.stringify(evidence)}\n\nCase: ${transcript}` }
      ],
      temperature: 0.2,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{"contradictions": [], "gaps": [], "recommendations": []}');
    return result;
  } */

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
    const systemPrompt = `You are a medical protocol specialist. Create an evidence-based treatment protocol for the given diagnosis and patient context.

Return JSON with:
{
  "protocol": [
    {
      "step": number,
      "intervention": "string",
      "category": "medication|procedure|lifestyle|referral|monitoring",
      "priority": "low|medium|high|urgent",
      "timeframe": "string",
      "expectedOutcome": "string",
      "evidenceLevel": "A|B|C|D",
      "contraindications": ["string"],
      "alternatives": ["string"]
    }
  ],
  "monitoring": ["monitoring parameters"],
  "followUp": ["follow-up schedule and parameters"],
  "contraindications": ["absolute and relative contraindications"],
  "evidenceLevel": "Overall evidence quality assessment"
}`;

    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Diagnosis: ${diagnosis}\n\nPatient Context: ${JSON.stringify(patientContext)}` }
      ],
      temperature: 0.2,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return result;
  }
}

export const openAIService = new OpenAIService();
export default openAIService; 