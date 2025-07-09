// Browser console script to debug AI integration
// Run this in the browser console after opening the app

console.log('🔍 Starting AI Integration Debug...');

// Get the AI service and test utils from the window object
const { openAIService, validateAIIntegration } = window;

if (!openAIService || !validateAIIntegration) {
  console.error('❌ AI service or validation not available on window object');
  console.log('Available on window:', Object.keys(window).filter(k => k.toLowerCase().includes('ai')));
} else {
  console.log('✅ AI service and validation available');
}

// Test transcript
const testTranscript = `
Patient: Good morning, Doctor. I've been having severe chest pain for the past 3 days. It's a sharp, stabbing pain that gets worse when I breathe deeply or move around. It's mainly on the left side.

Doctor: Good morning. On a scale of 1 to 10, how would you rate the pain intensity?

Patient: I'd say it's about an 8 when it's at its worst, maybe a 6 when I'm resting. I've also been feeling short of breath, especially when I climb stairs.

Doctor: Any nausea, sweating, or radiation of the pain to your arm or jaw?

Patient: No nausea or sweating, but sometimes I feel a dull ache in my left arm.

Doctor: Do you have any history of heart problems or recent injuries?

Patient: No heart problems that I know of, but my father had a heart attack at 60. I haven't had any injuries recently.

Doctor: Based on your symptoms and family history, I'm concerned about possible cardiac causes. We need to rule out acute coronary syndrome. I'm ordering an EKG, chest X-ray, and cardiac enzymes immediately.
`;

// Debug function
async function debugAI() {
  try {
    console.log('🤖 Testing AI Analysis...');
    
    const analysis = await openAIService.quickAnalyzeTranscript(testTranscript);
    
    console.log('📋 Analysis Results:');
    console.log('- ID:', analysis.id);
    console.log('- Symptoms:', analysis.symptoms.length);
    console.log('- Diagnoses:', analysis.diagnoses.length);
    console.log('- Treatments:', analysis.treatments.length);
    console.log('- Concerns:', analysis.concerns.length);
    console.log('- Confidence Score:', analysis.confidenceScore);
    console.log('- Reasoning Length:', analysis.reasoning.length);
    
    // Check specific validation criteria
    console.log('\n🔍 Checking Real AI Validation Criteria:');
    
    // Check for mock indicators
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
    
    console.log('- All content length:', allContent.length);
    
    const foundMockIndicators = mockIndicators.filter(indicator => 
      allContent.includes(indicator)
    );
    
    console.log('- Found mock indicators:', foundMockIndicators);
    
    // Check detailed reasoning
    const hasDetailedReasoning = analysis.reasoning.length > 100;
    console.log('- Has detailed reasoning (>100 chars):', hasDetailedReasoning);
    console.log('- Reasoning preview:', analysis.reasoning.substring(0, 200) + '...');
    
    // Check specific symptoms with sourceText
    const hasSpecificSymptoms = analysis.symptoms.length > 0 && 
      analysis.symptoms.some(s => s.sourceText && s.sourceText.length > 20);
    console.log('- Has specific symptoms with sourceText:', hasSpecificSymptoms);
    
    if (analysis.symptoms.length > 0) {
      console.log('- First symptom sourceText:', analysis.symptoms[0].sourceText);
    }
    
    // Check valid ICD-10 codes
    const hasValidICD10 = analysis.diagnoses.some(d => 
      /^[A-Z]\d{2}/.test(d.icd10Code)
    );
    console.log('- Has valid ICD-10 codes:', hasValidICD10);
    
    if (analysis.diagnoses.length > 0) {
      console.log('- First diagnosis ICD-10:', analysis.diagnoses[0].icd10Code);
    }
    
    // Run full validation
    console.log('\n🧪 Running Full Validation...');
    const validationResult = await validateAIIntegration(testTranscript);
    
    console.log('📊 Validation Results:');
    console.log('- Is Working:', validationResult.isWorking);
    console.log('- Is Real AI:', validationResult.isRealAI);
    console.log('- Medical Accuracy:', validationResult.medicalAccuracy);
    console.log('- Issues:', validationResult.issues);
    console.log('- Suggestions:', validationResult.suggestions);
    
  } catch (error) {
    console.error('❌ Error during AI integration test:', error);
  }
}

// Make it available globally
window.debugAI = debugAI;

console.log('🎯 Debug function loaded. Run debugAI() to test.'); 