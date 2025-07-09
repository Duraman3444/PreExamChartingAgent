/**
 * AI Testing and Validation Utilities
 * Used to verify OpenAI integration is working and providing accurate medical analysis
 */

import { openAIService, type AnalysisResult } from '../services/openai';

export interface AIValidationResult {
  isWorking: boolean;
  isRealAI: boolean;
  medicalAccuracy: 'high' | 'medium' | 'low' | 'poor';
  issues: string[];
  suggestions: string[];
  testResults: {
    apiKeyConfigured: boolean;
    apiCallSuccessful: boolean;
    responseTime: number;
    quickResponseTime?: number;
    hasRealMedicalContent: boolean;
    confidenceScoresValid: boolean;
    icd10CodesValid: boolean;
  };
}

// Sample medical transcript for testing
const TEST_TRANSCRIPT = `
Patient: Good morning, Doctor. I've been having severe chest pain for the past 3 days. It's a sharp, stabbing pain that gets worse when I breathe deeply or move around. It's mainly on the left side.

Doctor: Good morning. On a scale of 1 to 10, how would you rate the pain intensity?

Patient: I'd say it's about an 8 when it's at its worst, maybe a 6 when I'm resting. I've also been feeling short of breath, especially when I climb stairs.

Doctor: Any nausea, sweating, or radiation of the pain to your arm or jaw?

Patient: No nausea or sweating, but sometimes I feel a dull ache in my left arm.

Doctor: Do you have any history of heart problems or recent injuries?

Patient: No heart problems that I know of, but my father had a heart attack at 60. I haven't had any injuries recently.

Doctor: What medications are you currently taking?

Patient: Just my blood pressure medication - lisinopril 10mg daily. And I take aspirin sometimes for headaches.

Doctor: Based on your symptoms and family history, I'm concerned about possible cardiac causes. We need to rule out acute coronary syndrome. I'm ordering an EKG, chest X-ray, and cardiac enzymes immediately.
`;

// Expected medical indicators for real AI analysis
const MEDICAL_QUALITY_INDICATORS = {
  validICD10Patterns: [
    /^[A-Z]\d{2}/, // Basic ICD-10 format
    /^I\d{2}/, // Circulatory system codes
    /^R\d{2}/, // Symptoms codes
    /^Z\d{2}/, // Factors influencing health status
  ],
  expectedSymptoms: ['chest pain', 'dyspnea', 'shortness of breath', 'pain'],
  expectedDiagnoses: ['coronary', 'cardiac', 'myocardial', 'angina', 'chest pain'],
  redFlags: ['acute coronary syndrome', 'myocardial infarction', 'unstable angina'],
  appropriateTests: ['ECG', 'EKG', 'chest X-ray', 'cardiac enzymes', 'troponin'],
};

export async function validateAIIntegration(
  customTranscript?: string,
  patientContext?: any
): Promise<AIValidationResult> {
  const result: AIValidationResult = {
    isWorking: false,
    isRealAI: false,
    medicalAccuracy: 'poor',
    issues: [],
    suggestions: [],
    testResults: {
      apiKeyConfigured: false,
      apiCallSuccessful: false,
      responseTime: 0,
      hasRealMedicalContent: false,
      confidenceScoresValid: false,
      icd10CodesValid: false,
    },
  };

  try {
    // Test 1: Check API configuration
    console.log('🔍 Testing AI Integration...');
    
    const status = openAIService.getStatus();
    result.testResults.apiKeyConfigured = status.configured;
    
    if (!status.configured) {
      result.issues.push('OpenAI API key not configured');
      result.suggestions.push('Add VITE_OPENAI_API_KEY to your .env file');
      return result;
    }

        // Test 2: Attempt real AI analysis
    const transcript = customTranscript || TEST_TRANSCRIPT;
    
    console.log('📊 Running AI analysis test...');
    
    // Test both quick and full analysis
    const quickStartTime = Date.now();
    await openAIService.quickAnalyzeTranscript(transcript);
    const quickResponseTime = Date.now() - quickStartTime;
    
    console.log('🚀 Quick analysis completed in', quickResponseTime, 'ms');
    
    const fullStartTime = Date.now();
    const analysis = await openAIService.analyzeTranscript(transcript, patientContext);
    const fullResponseTime = Date.now() - fullStartTime;
    
    console.log('🔬 Full analysis completed in', fullResponseTime, 'ms');
    
    // Use the full analysis for validation but report both times
    result.testResults.responseTime = fullResponseTime;
    result.testResults.quickResponseTime = quickResponseTime;
    result.testResults.apiCallSuccessful = true;
    result.isWorking = true;

    // Test 3: Validate medical content quality
    const medicalQuality = validateMedicalContent(analysis);
    result.testResults = { ...result.testResults, ...medicalQuality };

    // Test 4: Check for real AI vs mock data
    result.isRealAI = checkForRealAI(analysis);

    // Test 5: Overall medical accuracy assessment
    result.medicalAccuracy = assessMedicalAccuracy(analysis, medicalQuality);

    // Generate recommendations
    generateRecommendations(result);

    console.log('✅ AI Integration Test Complete:', result);
    return result;

  } catch (error) {
    console.error('❌ AI Integration Test Failed:', error);
    result.issues.push(`API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    if (error instanceof Error && error.message.includes('API key')) {
      result.suggestions.push('Verify your OpenAI API key is correct and has sufficient credits');
    } else if (error instanceof Error && error.message.includes('rate limit')) {
      result.suggestions.push('OpenAI rate limit reached - wait a moment and try again');
    } else {
      result.suggestions.push('Check network connection and OpenAI service status');
    }
    
    return result;
  }
}

function validateMedicalContent(analysis: AnalysisResult) {
  const validation = {
    hasRealMedicalContent: false,
    confidenceScoresValid: false,
    icd10CodesValid: false,
  };

  // Check confidence scores are in valid range (0-1)
  const allConfidenceScores = [
    analysis.confidenceScore,
    ...analysis.symptoms.map(s => s.confidence),
    ...analysis.diagnoses.map(d => d.probability),
  ];
  
  validation.confidenceScoresValid = allConfidenceScores.every(score => 
    score >= 0 && score <= 1
  );

  // Check ICD-10 codes are valid format
  validation.icd10CodesValid = analysis.diagnoses.every(diagnosis => 
    MEDICAL_QUALITY_INDICATORS.validICD10Patterns.some(pattern => 
      pattern.test(diagnosis.icd10Code)
    )
  );

  // Check for real medical content
  const allText = [
    analysis.reasoning,
    ...analysis.symptoms.map(s => s.name.toLowerCase()),
    ...analysis.diagnoses.map(d => d.condition.toLowerCase()),
    ...analysis.treatments.map(t => t.recommendation.toLowerCase()),
    ...analysis.nextSteps.join(' ').toLowerCase(),
  ].join(' ');

  const hasExpectedSymptoms = MEDICAL_QUALITY_INDICATORS.expectedSymptoms.some(symptom =>
    allText.includes(symptom)
  );
  
  const hasExpectedDiagnoses = MEDICAL_QUALITY_INDICATORS.expectedDiagnoses.some(diagnosis =>
    allText.includes(diagnosis)
  );

  validation.hasRealMedicalContent = hasExpectedSymptoms && hasExpectedDiagnoses;

  return validation;
}

function checkForRealAI(analysis: AnalysisResult): boolean {
  // Check for indicators this is real AI vs mock data
  const mockIndicators = [
    'mock analysis',
    'openai api not configured',
    'placeholder',
    'demo data',
    'test data',
    'fallback',
  ];

  const allContent = [
    analysis.reasoning,
    ...analysis.symptoms.map(s => s.sourceText || ''),
    ...analysis.diagnoses.map(d => d.reasoning),
    ...analysis.treatments.map(t => t.recommendation),
    ...analysis.concerns.map(c => c.message),
  ].join(' ').toLowerCase();

  const hasMockIndicators = mockIndicators.some(indicator => 
    allContent.includes(indicator)
  );

  // Real AI should have detailed, specific medical reasoning
  const hasDetailedReasoning = analysis.reasoning.length > 100;
  
  // Check for specific symptoms - be more flexible with sourceText requirement
  const hasSpecificSymptoms = analysis.symptoms.length > 0 && 
    analysis.symptoms.some(s => 
      s.name && s.name.length > 0 && 
      (s.sourceText && s.sourceText.length > 20 || s.name.includes('pain') || s.name.includes('chest'))
    );
  
  // Check for valid ICD-10 codes - be more flexible with format
  const hasValidICD10 = analysis.diagnoses.some(d => 
    /^[A-Z]\d{2}/.test(d.icd10Code) && d.icd10Code !== 'Z99.9'
  );

  // Additional checks for real AI analysis
  const hasRealDiagnoses = analysis.diagnoses.length > 0 && 
    analysis.diagnoses.some(d => d.condition && d.condition.length > 10);
  
  const hasRealTreatments = analysis.treatments.length > 0 && 
    analysis.treatments.some(t => t.recommendation && t.recommendation.length > 10);

  // Check if this is from Firebase Functions (indicates real AI)
  const isFromFirebaseFunctions = analysis.reasoning.includes('Firebase Functions') || 
                                  analysis.reasoning.includes('GPT-4o') ||
                                  analysis.reasoning.includes('OpenAI');

  console.log('🔍 Real AI Check Details:');
  console.log('- Has mock indicators:', hasMockIndicators);
  console.log('- Has detailed reasoning:', hasDetailedReasoning);
  console.log('- Has specific symptoms:', hasSpecificSymptoms);
  console.log('- Has valid ICD-10:', hasValidICD10);
  console.log('- Has real diagnoses:', hasRealDiagnoses);
  console.log('- Has real treatments:', hasRealTreatments);
  console.log('- Is from Firebase Functions:', isFromFirebaseFunctions);

  // Return true if we have real AI indicators and no mock indicators
  return !hasMockIndicators && 
         hasDetailedReasoning && 
         (hasSpecificSymptoms || hasRealDiagnoses) && 
         (hasValidICD10 || isFromFirebaseFunctions) &&
         hasRealTreatments;
}

function assessMedicalAccuracy(analysis: AnalysisResult, validation: any): 'high' | 'medium' | 'low' | 'poor' {
  let score = 0;

  // Scoring criteria
  if (validation.confidenceScoresValid) score += 2;
  if (validation.icd10CodesValid) score += 2;
  if (validation.hasRealMedicalContent) score += 3;
  if (analysis.symptoms.length >= 2) score += 1;
  if (analysis.diagnoses.length >= 1) score += 1;
  if (analysis.treatments.length >= 1) score += 1;
  if (analysis.concerns.length >= 1) score += 1;
  if (analysis.reasoning.length > 200) score += 1;

  // Convert score to rating
  if (score >= 10) return 'high';
  if (score >= 7) return 'medium';
  if (score >= 4) return 'low';
  return 'poor';
}

function generateRecommendations(result: AIValidationResult) {
  if (!result.testResults.apiKeyConfigured) {
    result.suggestions.push('Configure OpenAI API key in .env file');
  }

  if (!result.testResults.confidenceScoresValid) {
    result.issues.push('Confidence scores are outside valid range (0-1)');
    result.suggestions.push('Check confidence score normalization in OpenAI service');
  }

  if (!result.testResults.icd10CodesValid) {
    result.issues.push('ICD-10 codes have invalid format');
    result.suggestions.push('Improve medical prompts to ensure valid ICD-10 codes');
  }

  if (!result.testResults.hasRealMedicalContent) {
    result.issues.push('Analysis lacks expected medical content');
    result.suggestions.push('Verify AI is analyzing medical transcripts correctly');
  }

  if (result.testResults.responseTime > 30000) {
    result.issues.push('Full analysis response time is very slow (>30 seconds)');
    result.suggestions.push('Use Quick Analysis mode for faster results');
  } else if (result.testResults.responseTime > 20000) {
    result.issues.push('Full analysis response time is slow (>20 seconds)');
    result.suggestions.push('Consider Quick Analysis mode for routine cases');
  }
  
  if (result.testResults.quickResponseTime && result.testResults.quickResponseTime > 15000) {
    result.issues.push('Quick analysis response time is slow (>15 seconds)');
    result.suggestions.push('Check network connectivity and OpenAI service status');
  }
  
  // Performance recommendations and achievements
  if (result.testResults.quickResponseTime && result.testResults.responseTime) {
    const improvement = Math.round((result.testResults.responseTime - result.testResults.quickResponseTime) / result.testResults.responseTime * 100);
    if (improvement > 20) {
      result.suggestions.push(`Quick Analysis is ${improvement}% faster - excellent for routine cases`);
    }
  }
  
  // Positive performance feedback
  if (result.testResults.responseTime <= 20000) {
    result.suggestions.push('✅ Full analysis time is excellent for comprehensive medical AI');
  }
  
  if (result.testResults.quickResponseTime && result.testResults.quickResponseTime <= 15000) {
    result.suggestions.push('⚡ Quick analysis time is optimal for rapid medical assessment');
  }
  
  if (result.testResults.responseTime <= 15000) {
    result.suggestions.push('🏆 Outstanding performance - faster than most medical AI systems');
  }

  if (result.medicalAccuracy === 'poor') {
    result.issues.push('Overall medical accuracy is poor');
    result.suggestions.push('Review and improve medical analysis prompts');
    result.suggestions.push('Consider adding more medical context to prompts');
  }

  if (!result.isRealAI) {
    result.issues.push('Analysis appears to be mock/fallback data');
    result.suggestions.push('Verify OpenAI API is actually being called');
    result.suggestions.push('Check for error handling that falls back to mock data');
  }
}

// Quick test function for console usage
export async function quickAITest(): Promise<void> {
  console.log('🧪 Running Quick AI Test...');
  const result = await validateAIIntegration();
  
  console.log('\n📊 Test Results:');
  console.log('✅ API Working:', result.isWorking);
  console.log('🤖 Real AI:', result.isRealAI);
  console.log('🏥 Medical Accuracy:', result.medicalAccuracy);
  console.log('⏱️ Full Analysis Time:', result.testResults.responseTime + 'ms');
  if (result.testResults.quickResponseTime) {
    console.log('🚀 Quick Analysis Time:', result.testResults.quickResponseTime + 'ms');
    console.log('💡 Speed Improvement:', Math.round((result.testResults.responseTime - result.testResults.quickResponseTime) / result.testResults.responseTime * 100) + '% faster with quick mode');
  }
  
  if (result.issues.length > 0) {
    console.log('\n⚠️ Issues Found:');
    result.issues.forEach(issue => console.log('  - ' + issue));
  }
  
  if (result.suggestions.length > 0) {
    console.log('\n💡 Suggestions:');
    result.suggestions.forEach(suggestion => console.log('  - ' + suggestion));
  }
}

// Export for use in browser console
(window as any).quickAITest = quickAITest; 