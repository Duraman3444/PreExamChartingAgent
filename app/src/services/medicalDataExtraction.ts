import { openAIService, AnalysisResult } from './openai';
import { Patient, PatientDemographics, BasicMedicalHistory } from '@/types';

// Extended medical data interfaces for extraction
export interface ExtractedMedicalData {
  patientInfo: ExtractedPatientInfo;
  medicalHistory: ExtractedMedicalHistory;
  currentVisit: ExtractedVisitInfo;
  clinicalFindings: ExtractedClinicalFindings;
  medications: ExtractedMedications;
  allergies: ExtractedAllergies;
  socialHistory: ExtractedSocialHistory;
  familyHistory: ExtractedFamilyHistory;
  vitalSigns: ExtractedVitalSigns;
  diagnosticTests: ExtractedDiagnosticTests;
  treatmentPlan: ExtractedTreatmentPlan;
  followUpInstructions: ExtractedFollowUp;
  extractionConfidence: number;
  extractionTimestamp: Date;
}

export interface ExtractedPatientInfo {
  firstName?: string;
  lastName?: string;
  age?: number;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  insuranceInfo?: {
    provider?: string;
    policyNumber?: string;
    groupNumber?: string;
  };
  confidence: number;
}

export interface ExtractedMedicalHistory {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string[];
  pastSurgicalHistory: string[];
  chronicConditions: string[];
  previousHospitalizations: string[];
  mentalHealthHistory: string[];
  confidence: number;
}

export interface ExtractedVisitInfo {
  visitType: 'consultation' | 'follow_up' | 'urgent_care' | 'telemedicine' | 'routine_checkup';
  visitDate: Date;
  department: string;
  attendingProvider: string;
  visitDuration: number;
  visitReason: string;
  patientConcerns: string[];
  confidence: number;
}

export interface ExtractedClinicalFindings {
  symptoms: Array<{
    name: string;
    severity: 'mild' | 'moderate' | 'severe' | 'critical';
    duration: string;
    onset: string;
    location?: string;
    quality?: string;
    aggravatingFactors?: string[];
    relievingFactors?: string[];
    associatedSymptoms?: string[];
    confidence: number;
  }>;
  physicalExamFindings: Array<{
    system: string;
    findings: string;
    normal: boolean;
    abnormalDetails?: string;
    confidence: number;
  }>;
  reviewOfSystems: {
    constitutional: string[];
    cardiovascular: string[];
    respiratory: string[];
    gastrointestinal: string[];
    genitourinary: string[];
    musculoskeletal: string[];
    neurological: string[];
    psychiatric: string[];
    endocrine: string[];
    dermatological: string[];
    hematological: string[];
  };
  confidence: number;
}

export interface ExtractedMedications {
  currentMedications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    route: string;
    startDate?: string;
    indication?: string;
    prescribedBy?: string;
    sideEffects?: string[];
    compliance?: 'good' | 'poor' | 'partial' | 'unknown';
    confidence: number;
  }>;
  recentChanges: Array<{
    action: 'started' | 'stopped' | 'dosage_changed' | 'frequency_changed';
    medication: string;
    previousValue?: string;
    newValue?: string;
    reason?: string;
    date?: string;
    confidence: number;
  }>;
  overTheCounterMedications: Array<{
    name: string;
    frequency: string;
    purpose: string;
    confidence: number;
  }>;
  supplements: Array<{
    name: string;
    dosage: string;
    frequency: string;
    confidence: number;
  }>;
  confidence: number;
}

export interface ExtractedAllergies {
  drugAllergies: Array<{
    allergen: string;
    reaction: string;
    severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
    reactionType: 'rash' | 'respiratory' | 'gastrointestinal' | 'cardiovascular' | 'other';
    firstOccurrence?: string;
    confidence: number;
  }>;
  foodAllergies: Array<{
    allergen: string;
    reaction: string;
    severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
    confidence: number;
  }>;
  environmentalAllergies: Array<{
    allergen: string;
    reaction: string;
    seasonal?: boolean;
    confidence: number;
  }>;
  confidence: number;
}

export interface ExtractedSocialHistory {
  smokingStatus: {
    status: 'never' | 'current' | 'former' | 'unknown';
    packYears?: number;
    quitDate?: string;
    confidence: number;
  };
  alcoholUse: {
    status: 'never' | 'current' | 'former' | 'unknown';
    frequency?: string;
    amount?: string;
    type?: string;
    confidence: number;
  };
  substanceUse: {
    currentUse?: string[];
    pastUse?: string[];
    treatmentHistory?: string[];
    confidence: number;
  };
  occupation: {
    current?: string;
    hazardousExposures?: string[];
    workRelatedIssues?: string[];
    confidence: number;
  };
  livingArrangements: {
    livingWith?: string;
    housingType?: string;
    safetyIssues?: string[];
    confidence: number;
  };
  functionalStatus: {
    adlIndependence?: string;
    mobilityAids?: string[];
    cognitiveStatus?: string;
    confidence: number;
  };
  confidence: number;
}

export interface ExtractedFamilyHistory {
  familyConditions: Array<{
    condition: string;
    relationship: string;
    ageOfOnset?: string;
    alive?: boolean;
    causeOfDeath?: string;
    confidence: number;
  }>;
  hereditaryConditions: string[];
  geneticRiskFactors: string[];
  consanguinity: boolean;
  confidence: number;
}

export interface ExtractedVitalSigns {
  bloodPressure?: {
    systolic: number;
    diastolic: number;
    position?: string;
    arm?: string;
    confidence: number;
  };
  heartRate?: {
    rate: number;
    rhythm: string;
    confidence: number;
  };
  temperature?: {
    value: number;
    unit: 'celsius' | 'fahrenheit';
    route: 'oral' | 'tympanic' | 'rectal' | 'axillary' | 'temporal';
    confidence: number;
  };
  respiratoryRate?: {
    rate: number;
    confidence: number;
  };
  oxygenSaturation?: {
    saturation: number;
    onRoomAir: boolean;
    oxygenSupport?: string;
    confidence: number;
  };
  weight?: {
    value: number;
    unit: 'kg' | 'lbs';
    confidence: number;
  };
  height?: {
    value: number;
    unit: 'cm' | 'feet_inches';
    confidence: number;
  };
  bmi?: {
    value: number;
    category: 'underweight' | 'normal' | 'overweight' | 'obese';
    confidence: number;
  };
  painScore?: {
    score: number;
    scale: '0-10' | '0-5' | 'faces';
    confidence: number;
  };
  confidence: number;
}

export interface ExtractedDiagnosticTests {
  orderedTests: Array<{
    testName: string;
    testType: 'lab' | 'imaging' | 'procedure' | 'other';
    indication: string;
    urgency: 'stat' | 'urgent' | 'routine';
    confidence: number;
  }>;
  completedTests: Array<{
    testName: string;
    testType: 'lab' | 'imaging' | 'procedure' | 'other';
    results: string;
    normalRange?: string;
    abnormal: boolean;
    clinicalSignificance?: string;
    confidence: number;
  }>;
  pendingTests: Array<{
    testName: string;
    scheduledDate?: string;
    instructions?: string;
    confidence: number;
  }>;
  confidence: number;
}

export interface ExtractedTreatmentPlan {
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    indication: string;
    instructions: string;
    confidence: number;
  }>;
  procedures: Array<{
    name: string;
    indication: string;
    urgency: 'immediate' | 'urgent' | 'elective';
    provider?: string;
    scheduledDate?: string;
    confidence: number;
  }>;
  referrals: Array<{
    specialty: string;
    reason: string;
    urgency: 'urgent' | 'routine';
    provider?: string;
    instructions?: string;
    confidence: number;
  }>;
  lifestyleModifications: Array<{
    category: 'diet' | 'exercise' | 'lifestyle' | 'other';
    recommendation: string;
    rationale: string;
    confidence: number;
  }>;
  patientEducation: Array<{
    topic: string;
    content: string;
    materials?: string[];
    confidence: number;
  }>;
  confidence: number;
}

export interface ExtractedFollowUp {
  nextAppointment: {
    timeframe: string;
    reason: string;
    provider?: string;
    specialty?: string;
    confidence: number;
  };
  returnPrecautions: Array<{
    condition: string;
    action: string;
    urgency: 'immediate' | 'urgent' | 'routine';
    confidence: number;
  }>;
  homeInstructions: Array<{
    category: 'medication' | 'activity' | 'diet' | 'monitoring' | 'other';
    instruction: string;
    duration?: string;
    confidence: number;
  }>;
  monitoringParameters: Array<{
    parameter: string;
    frequency: string;
    targetRange?: string;
    reportingInstructions: string;
    confidence: number;
  }>;
  confidence: number;
}

// Medical Data Extraction Service
class MedicalDataExtractionService {
  
  /**
   * Extract comprehensive medical data from a transcription
   */
  async extractMedicalData(
    transcriptionText: string,
    existingPatientData?: Patient,
    analysisResult?: AnalysisResult
  ): Promise<ExtractedMedicalData> {
    
    console.log('🔍 [Medical Extraction] Starting comprehensive medical data extraction...');
    
    try {
      // Use OpenAI service for structured extraction
      const extractionPrompt = this.buildExtractionPrompt(transcriptionText, existingPatientData);
      
      const extractionResult = await openAIService.generateText(extractionPrompt, 'gpt-4');
      
      // Parse the structured response
      const parsedData = this.parseExtractionResult(extractionResult, analysisResult);
      
      // Validate and enhance with existing patient data
      const enhancedData = this.enhanceWithExistingData(parsedData, existingPatientData);
      
      console.log('✅ [Medical Extraction] Medical data extraction completed successfully');
      
      return enhancedData;
      
    } catch (error) {
      console.error('❌ [Medical Extraction] Error extracting medical data:', error);
      throw new Error('Failed to extract medical data from transcription');
    }
  }
  
  /**
   * Build the extraction prompt for structured medical data
   */
  private buildExtractionPrompt(transcriptionText: string, existingPatientData?: Patient): string {
    return `
As an expert medical information extraction AI, analyze the following medical transcript and extract comprehensive structured medical data. 

TRANSCRIPT:
${transcriptionText}

${existingPatientData ? `EXISTING PATIENT DATA:
Name: ${existingPatientData.demographics.firstName} ${existingPatientData.demographics.lastName}
DOB: ${existingPatientData.demographics.dateOfBirth}
Gender: ${existingPatientData.demographics.gender}
Known Conditions: ${existingPatientData.basicHistory.knownConditions.join(', ')}
Current Medications: ${existingPatientData.basicHistory.currentMedications.join(', ')}
Known Allergies: ${existingPatientData.basicHistory.knownAllergies.join(', ')}
` : ''}

Please extract the following information in a structured JSON format:

1. PATIENT INFORMATION:
   - Demographics (name, age, gender, contact info if mentioned)
   - Insurance information if discussed
   - Emergency contact if mentioned

2. MEDICAL HISTORY:
   - Chief complaint
   - History of present illness
   - Past medical history
   - Past surgical history
   - Chronic conditions
   - Previous hospitalizations

3. CURRENT VISIT:
   - Visit type and reason
   - Patient concerns
   - Visit duration and department

4. CLINICAL FINDINGS:
   - Symptoms with severity, duration, location, quality
   - Physical examination findings
   - Review of systems

5. MEDICATIONS:
   - Current medications with dosage, frequency, compliance
   - Recent medication changes
   - Over-the-counter medications and supplements

6. ALLERGIES:
   - Drug allergies with reactions and severity
   - Food allergies
   - Environmental allergies

7. SOCIAL HISTORY:
   - Smoking status
   - Alcohol use
   - Substance use
   - Occupation and exposures
   - Living arrangements
   - Functional status

8. FAMILY HISTORY:
   - Family medical conditions
   - Hereditary conditions
   - Genetic risk factors

9. VITAL SIGNS:
   - Blood pressure, heart rate, temperature
   - Respiratory rate, oxygen saturation
   - Weight, height, BMI
   - Pain score

10. DIAGNOSTIC TESTS:
    - Tests ordered
    - Test results discussed
    - Pending tests

11. TREATMENT PLAN:
    - New medications prescribed
    - Procedures planned
    - Referrals made
    - Lifestyle modifications
    - Patient education provided

12. FOLLOW-UP:
    - Next appointment scheduled
    - Return precautions
    - Home instructions
    - Monitoring parameters

For each extracted item, include a confidence score (0-1) indicating how certain you are about the extracted information.

Return the data in valid JSON format following the ExtractedMedicalData interface structure.
`;
  }
  
  /**
   * Parse the AI extraction result into structured data
   */
  private parseExtractionResult(
    extractionResult: string, 
    analysisResult?: AnalysisResult
  ): ExtractedMedicalData {
    
    try {
      // Try to parse as JSON first
      const jsonMatch = extractionResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedJson = JSON.parse(jsonMatch[0]);
        return this.mapToExtractedData(parsedJson, analysisResult);
      }
      
      // If not JSON, parse structured text
      return this.parseStructuredText(extractionResult, analysisResult);
      
    } catch (error) {
      console.error('❌ [Medical Extraction] Error parsing extraction result:', error);
      
      // Fallback: create basic structure from analysis result
      return this.createFallbackExtraction(extractionResult, analysisResult);
    }
  }
  
  /**
   * Map parsed JSON to ExtractedMedicalData structure
   */
  private mapToExtractedData(
    parsedJson: any, 
    analysisResult?: AnalysisResult
  ): ExtractedMedicalData {
    
    const defaultConfidence = 0.7;
    
    return {
      patientInfo: {
        firstName: parsedJson.patientInfo?.firstName,
        lastName: parsedJson.patientInfo?.lastName,
        age: parsedJson.patientInfo?.age,
        dateOfBirth: parsedJson.patientInfo?.dateOfBirth,
        gender: parsedJson.patientInfo?.gender,
        contactInfo: parsedJson.patientInfo?.contactInfo,
        emergencyContact: parsedJson.patientInfo?.emergencyContact,
        insuranceInfo: parsedJson.patientInfo?.insuranceInfo,
        confidence: parsedJson.patientInfo?.confidence || defaultConfidence,
      },
      medicalHistory: {
        chiefComplaint: parsedJson.medicalHistory?.chiefComplaint || '',
        historyOfPresentIllness: parsedJson.medicalHistory?.historyOfPresentIllness || '',
        pastMedicalHistory: parsedJson.medicalHistory?.pastMedicalHistory || [],
        pastSurgicalHistory: parsedJson.medicalHistory?.pastSurgicalHistory || [],
        chronicConditions: parsedJson.medicalHistory?.chronicConditions || [],
        previousHospitalizations: parsedJson.medicalHistory?.previousHospitalizations || [],
        mentalHealthHistory: parsedJson.medicalHistory?.mentalHealthHistory || [],
        confidence: parsedJson.medicalHistory?.confidence || defaultConfidence,
      },
      currentVisit: {
        visitType: parsedJson.currentVisit?.visitType || 'consultation',
        visitDate: new Date(),
        department: parsedJson.currentVisit?.department || 'General Medicine',
        attendingProvider: parsedJson.currentVisit?.attendingProvider || 'Unknown',
        visitDuration: parsedJson.currentVisit?.visitDuration || 0,
        visitReason: parsedJson.currentVisit?.visitReason || '',
        patientConcerns: parsedJson.currentVisit?.patientConcerns || [],
        confidence: parsedJson.currentVisit?.confidence || defaultConfidence,
      },
      clinicalFindings: {
        symptoms: this.mapSymptoms(parsedJson.clinicalFindings?.symptoms || [], analysisResult),
        physicalExamFindings: parsedJson.clinicalFindings?.physicalExamFindings || [],
        reviewOfSystems: parsedJson.clinicalFindings?.reviewOfSystems || {
          constitutional: [], cardiovascular: [], respiratory: [], gastrointestinal: [],
          genitourinary: [], musculoskeletal: [], neurological: [], psychiatric: [],
          endocrine: [], dermatological: [], hematological: []
        },
        confidence: parsedJson.clinicalFindings?.confidence || defaultConfidence,
      },
      medications: {
        currentMedications: parsedJson.medications?.currentMedications || [],
        recentChanges: parsedJson.medications?.recentChanges || [],
        overTheCounterMedications: parsedJson.medications?.overTheCounterMedications || [],
        supplements: parsedJson.medications?.supplements || [],
        confidence: parsedJson.medications?.confidence || defaultConfidence,
      },
      allergies: {
        drugAllergies: parsedJson.allergies?.drugAllergies || [],
        foodAllergies: parsedJson.allergies?.foodAllergies || [],
        environmentalAllergies: parsedJson.allergies?.environmentalAllergies || [],
        confidence: parsedJson.allergies?.confidence || defaultConfidence,
      },
      socialHistory: {
        smokingStatus: parsedJson.socialHistory?.smokingStatus || { status: 'unknown', confidence: 0.5 },
        alcoholUse: parsedJson.socialHistory?.alcoholUse || { status: 'unknown', confidence: 0.5 },
        substanceUse: parsedJson.socialHistory?.substanceUse || { confidence: 0.5 },
        occupation: parsedJson.socialHistory?.occupation || { confidence: 0.5 },
        livingArrangements: parsedJson.socialHistory?.livingArrangements || { confidence: 0.5 },
        functionalStatus: parsedJson.socialHistory?.functionalStatus || { confidence: 0.5 },
        confidence: parsedJson.socialHistory?.confidence || defaultConfidence,
      },
      familyHistory: {
        familyConditions: parsedJson.familyHistory?.familyConditions || [],
        hereditaryConditions: parsedJson.familyHistory?.hereditaryConditions || [],
        geneticRiskFactors: parsedJson.familyHistory?.geneticRiskFactors || [],
        consanguinity: parsedJson.familyHistory?.consanguinity || false,
        confidence: parsedJson.familyHistory?.confidence || defaultConfidence,
      },
      vitalSigns: {
        bloodPressure: parsedJson.vitalSigns?.bloodPressure,
        heartRate: parsedJson.vitalSigns?.heartRate,
        temperature: parsedJson.vitalSigns?.temperature,
        respiratoryRate: parsedJson.vitalSigns?.respiratoryRate,
        oxygenSaturation: parsedJson.vitalSigns?.oxygenSaturation,
        weight: parsedJson.vitalSigns?.weight,
        height: parsedJson.vitalSigns?.height,
        bmi: parsedJson.vitalSigns?.bmi,
        painScore: parsedJson.vitalSigns?.painScore,
        confidence: parsedJson.vitalSigns?.confidence || defaultConfidence,
      },
      diagnosticTests: {
        orderedTests: parsedJson.diagnosticTests?.orderedTests || [],
        completedTests: parsedJson.diagnosticTests?.completedTests || [],
        pendingTests: parsedJson.diagnosticTests?.pendingTests || [],
        confidence: parsedJson.diagnosticTests?.confidence || defaultConfidence,
      },
      treatmentPlan: {
        medications: parsedJson.treatmentPlan?.medications || [],
        procedures: parsedJson.treatmentPlan?.procedures || [],
        referrals: parsedJson.treatmentPlan?.referrals || [],
        lifestyleModifications: parsedJson.treatmentPlan?.lifestyleModifications || [],
        patientEducation: parsedJson.treatmentPlan?.patientEducation || [],
        confidence: parsedJson.treatmentPlan?.confidence || defaultConfidence,
      },
      followUpInstructions: {
        nextAppointment: parsedJson.followUpInstructions?.nextAppointment || { timeframe: '', reason: '', confidence: 0.5 },
        returnPrecautions: parsedJson.followUpInstructions?.returnPrecautions || [],
        homeInstructions: parsedJson.followUpInstructions?.homeInstructions || [],
        monitoringParameters: parsedJson.followUpInstructions?.monitoringParameters || [],
        confidence: parsedJson.followUpInstructions?.confidence || defaultConfidence,
      },
      extractionConfidence: parsedJson.extractionConfidence || defaultConfidence,
      extractionTimestamp: new Date(),
    };
  }
  
  /**
   * Map symptoms from analysis result to extraction format
   */
  private mapSymptoms(extractedSymptoms: any[], analysisResult?: AnalysisResult): any[] {
    if (analysisResult?.symptoms) {
      return analysisResult.symptoms.map(symptom => ({
        name: symptom.name,
        severity: symptom.severity,
        duration: symptom.duration,
        onset: 'Unknown',
        location: symptom.location,
        quality: symptom.quality,
        aggravatingFactors: [],
        relievingFactors: [],
        associatedSymptoms: symptom.associatedFactors,
        confidence: symptom.confidence,
      }));
    }
    return extractedSymptoms;
  }
  
  /**
   * Parse structured text format as fallback
   */
  private parseStructuredText(text: string, analysisResult?: AnalysisResult): ExtractedMedicalData {
    // Implementation for parsing structured text format
    // This would extract information from formatted text blocks
    return this.createFallbackExtraction(text, analysisResult);
  }
  
  /**
   * Create fallback extraction from analysis result
   */
  private createFallbackExtraction(text: string, analysisResult?: AnalysisResult): ExtractedMedicalData {
    const defaultConfidence = 0.6;
    
    return {
      patientInfo: {
        confidence: defaultConfidence,
      },
      medicalHistory: {
        chiefComplaint: this.extractChiefComplaint(text),
        historyOfPresentIllness: this.extractHPI(text),
        pastMedicalHistory: [],
        pastSurgicalHistory: [],
        chronicConditions: [],
        previousHospitalizations: [],
        mentalHealthHistory: [],
        confidence: defaultConfidence,
      },
      currentVisit: {
        visitType: 'consultation',
        visitDate: new Date(),
        department: 'General Medicine',
        attendingProvider: 'Unknown',
        visitDuration: 0,
        visitReason: this.extractVisitReason(text),
        patientConcerns: [],
        confidence: defaultConfidence,
      },
      clinicalFindings: {
        symptoms: analysisResult?.symptoms.map(s => ({
          name: s.name,
          severity: s.severity,
          duration: s.duration,
          onset: 'Unknown',
          location: s.location,
          quality: s.quality,
          confidence: s.confidence,
        })) || [],
        physicalExamFindings: [],
        reviewOfSystems: {
          constitutional: [], cardiovascular: [], respiratory: [], gastrointestinal: [],
          genitourinary: [], musculoskeletal: [], neurological: [], psychiatric: [],
          endocrine: [], dermatological: [], hematological: []
        },
        confidence: defaultConfidence,
      },
      medications: {
        currentMedications: [],
        recentChanges: [],
        overTheCounterMedications: [],
        supplements: [],
        confidence: defaultConfidence,
      },
      allergies: {
        drugAllergies: [],
        foodAllergies: [],
        environmentalAllergies: [],
        confidence: defaultConfidence,
      },
      socialHistory: {
        smokingStatus: { status: 'unknown', confidence: 0.5 },
        alcoholUse: { status: 'unknown', confidence: 0.5 },
        substanceUse: { confidence: 0.5 },
        occupation: { confidence: 0.5 },
        livingArrangements: { confidence: 0.5 },
        functionalStatus: { confidence: 0.5 },
        confidence: defaultConfidence,
      },
      familyHistory: {
        familyConditions: [],
        hereditaryConditions: [],
        geneticRiskFactors: [],
        consanguinity: false,
        confidence: defaultConfidence,
      },
      vitalSigns: {
        confidence: defaultConfidence,
      },
      diagnosticTests: {
        orderedTests: [],
        completedTests: [],
        pendingTests: [],
        confidence: defaultConfidence,
      },
      treatmentPlan: {
        medications: analysisResult?.treatments.filter(t => t.category === 'medication').map(t => ({
          name: t.recommendation.split(' ')[0],
          dosage: 'As prescribed',
          frequency: 'As directed',
          duration: t.timeframe,
          indication: t.recommendation,
          instructions: t.recommendation,
          confidence: 0.7,
        })) || [],
        procedures: analysisResult?.treatments.filter(t => t.category === 'procedure').map(t => ({
          name: t.recommendation,
          indication: t.recommendation,
          urgency: t.priority === 'urgent' ? 'urgent' : 'elective',
          confidence: 0.7,
        })) || [],
        referrals: analysisResult?.treatments.filter(t => t.category === 'referral').map(t => ({
          specialty: t.recommendation,
          reason: t.recommendation,
          urgency: t.priority === 'urgent' ? 'urgent' : 'routine',
          confidence: 0.7,
        })) || [],
        lifestyleModifications: analysisResult?.treatments.filter(t => t.category === 'lifestyle').map(t => ({
          category: 'lifestyle',
          recommendation: t.recommendation,
          rationale: t.expectedOutcome,
          confidence: 0.7,
        })) || [],
        patientEducation: [],
        confidence: defaultConfidence,
      },
      followUpInstructions: {
        nextAppointment: { timeframe: '', reason: '', confidence: 0.5 },
        returnPrecautions: [],
        homeInstructions: [],
        monitoringParameters: [],
        confidence: defaultConfidence,
      },
      extractionConfidence: defaultConfidence,
      extractionTimestamp: new Date(),
    };
  }
  
  /**
   * Extract chief complaint from text
   */
  private extractChiefComplaint(text: string): string {
    const ccPatterns = [
      /chief complaint[:\s]+(.*?)(?:\n|$)/i,
      /cc[:\s]+(.*?)(?:\n|$)/i,
      /patient presents with[:\s]+(.*?)(?:\n|$)/i,
      /complains of[:\s]+(.*?)(?:\n|$)/i,
    ];
    
    for (const pattern of ccPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return '';
  }
  
  /**
   * Extract history of present illness
   */
  private extractHPI(text: string): string {
    const hpiPatterns = [
      /history of present illness[:\s]+(.*?)(?:\n\n|$)/i,
      /hpi[:\s]+(.*?)(?:\n\n|$)/i,
      /present illness[:\s]+(.*?)(?:\n\n|$)/i,
    ];
    
    for (const pattern of hpiPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return '';
  }
  
  /**
   * Extract visit reason from text
   */
  private extractVisitReason(text: string): string {
    const reasonPatterns = [
      /reason for visit[:\s]+(.*?)(?:\n|$)/i,
      /visit reason[:\s]+(.*?)(?:\n|$)/i,
      /here for[:\s]+(.*?)(?:\n|$)/i,
    ];
    
    for (const pattern of reasonPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return '';
  }
  
  /**
   * Enhance extracted data with existing patient information
   */
  private enhanceWithExistingData(
    extractedData: ExtractedMedicalData,
    existingPatientData?: Patient
  ): ExtractedMedicalData {
    
    if (!existingPatientData) {
      return extractedData;
    }
    
    // Merge patient demographics
    if (!extractedData.patientInfo.firstName && existingPatientData.demographics.firstName) {
      extractedData.patientInfo.firstName = existingPatientData.demographics.firstName;
    }
    if (!extractedData.patientInfo.lastName && existingPatientData.demographics.lastName) {
      extractedData.patientInfo.lastName = existingPatientData.demographics.lastName;
    }
    if (!extractedData.patientInfo.gender && existingPatientData.demographics.gender) {
      extractedData.patientInfo.gender = existingPatientData.demographics.gender;
    }
    if (!extractedData.patientInfo.dateOfBirth && existingPatientData.demographics.dateOfBirth) {
      extractedData.patientInfo.dateOfBirth = existingPatientData.demographics.dateOfBirth.toISOString();
    }
    
    // Merge medical history
    const existingConditions = existingPatientData.basicHistory.knownConditions;
    const newConditions = extractedData.medicalHistory.chronicConditions.filter(
      condition => !existingConditions.includes(condition)
    );
    extractedData.medicalHistory.chronicConditions = [...existingConditions, ...newConditions];
    
    // Merge medications
    const existingMedications = existingPatientData.basicHistory.currentMedications;
    const extractedMedNames = extractedData.medications.currentMedications.map(med => med.name);
    const newMedications = extractedMedNames.filter(
      medName => !existingMedications.includes(medName)
    );
    
    // Merge allergies
    const existingAllergies = existingPatientData.basicHistory.knownAllergies;
    const extractedAllergies = [
      ...extractedData.allergies.drugAllergies.map(a => a.allergen),
      ...extractedData.allergies.foodAllergies.map(a => a.allergen),
      ...extractedData.allergies.environmentalAllergies.map(a => a.allergen),
    ];
    const newAllergies = extractedAllergies.filter(
      allergy => !existingAllergies.includes(allergy)
    );
    
    return extractedData;
  }
  
  /**
   * Convert extracted data to patient profile updates
   */
  async convertToPatientProfileUpdates(
    extractedData: ExtractedMedicalData,
    existingPatient?: Patient
  ): Promise<Partial<Patient>> {
    
    const updates: Partial<Patient> = {};
    
    // Update demographics if new information found
    if (extractedData.patientInfo.firstName || extractedData.patientInfo.lastName || 
        extractedData.patientInfo.gender || extractedData.patientInfo.dateOfBirth) {
      
      updates.demographics = {
        firstName: extractedData.patientInfo.firstName || existingPatient?.demographics.firstName || '',
        lastName: extractedData.patientInfo.lastName || existingPatient?.demographics.lastName || '',
        dateOfBirth: extractedData.patientInfo.dateOfBirth 
          ? new Date(extractedData.patientInfo.dateOfBirth)
          : existingPatient?.demographics.dateOfBirth || new Date(),
        gender: extractedData.patientInfo.gender || existingPatient?.demographics.gender || 'prefer-not-to-say',
        phone: extractedData.patientInfo.contactInfo?.phone || existingPatient?.demographics.phone,
        preferredLanguage: existingPatient?.demographics.preferredLanguage,
      };
    }
    
    // Update basic medical history
    const existingHistory = existingPatient?.basicHistory;
    const newConditions = extractedData.medicalHistory.chronicConditions.filter(
      condition => !existingHistory?.knownConditions.includes(condition)
    );
    const newMedications = extractedData.medications.currentMedications
      .map(med => `${med.name} ${med.dosage} ${med.frequency}`)
      .filter(medString => !existingHistory?.currentMedications.some(existing => 
        existing.includes(medString.split(' ')[0])
      ));
    const newAllergies = [
      ...extractedData.allergies.drugAllergies.map(a => `${a.allergen} (${a.reaction})`),
      ...extractedData.allergies.foodAllergies.map(a => `${a.allergen} (${a.reaction})`),
      ...extractedData.allergies.environmentalAllergies.map(a => `${a.allergen} (${a.reaction})`),
    ].filter(allergy => !existingHistory?.knownAllergies.some(existing => 
      existing.includes(allergy.split(' ')[0])
    ));
    
    updates.basicHistory = {
      knownAllergies: [
        ...(existingHistory?.knownAllergies || []),
        ...newAllergies,
      ],
      currentMedications: [
        ...(existingHistory?.currentMedications || []),
        ...newMedications,
      ],
      knownConditions: [
        ...(existingHistory?.knownConditions || []),
        ...newConditions,
      ],
      notes: [
        existingHistory?.notes || '',
        `Visit ${extractedData.extractionTimestamp.toLocaleDateString()}: ${extractedData.medicalHistory.chiefComplaint}`,
      ].join('\n\n').trim(),
    };
    
    // Update timestamps
    updates.updatedAt = new Date();
    
    return updates;
  }
  
  /**
   * Generate a summary of extracted data for review
   */
  generateExtractionSummary(extractedData: ExtractedMedicalData): string {
    const summary = [];
    
    summary.push(`MEDICAL DATA EXTRACTION SUMMARY`);
    summary.push(`Extraction Date: ${extractedData.extractionTimestamp.toLocaleDateString()}`);
    summary.push(`Overall Confidence: ${Math.round(extractedData.extractionConfidence * 100)}%`);
    summary.push('');
    
    if (extractedData.patientInfo.firstName || extractedData.patientInfo.lastName) {
      summary.push(`Patient: ${extractedData.patientInfo.firstName} ${extractedData.patientInfo.lastName}`);
    }
    
    if (extractedData.medicalHistory.chiefComplaint) {
      summary.push(`Chief Complaint: ${extractedData.medicalHistory.chiefComplaint}`);
    }
    
    if (extractedData.clinicalFindings.symptoms.length > 0) {
      summary.push(`Key Symptoms: ${extractedData.clinicalFindings.symptoms.map(s => s.name).join(', ')}`);
    }
    
    if (extractedData.medications.currentMedications.length > 0) {
      summary.push(`Current Medications: ${extractedData.medications.currentMedications.map(m => m.name).join(', ')}`);
    }
    
    if (extractedData.allergies.drugAllergies.length > 0) {
      summary.push(`Drug Allergies: ${extractedData.allergies.drugAllergies.map(a => a.allergen).join(', ')}`);
    }
    
    if (extractedData.treatmentPlan.medications.length > 0) {
      summary.push(`New Medications: ${extractedData.treatmentPlan.medications.map(m => m.name).join(', ')}`);
    }
    
    if (extractedData.treatmentPlan.referrals.length > 0) {
      summary.push(`Referrals: ${extractedData.treatmentPlan.referrals.map(r => r.specialty).join(', ')}`);
    }
    
    return summary.join('\n');
  }
}

// Export singleton instance
export const medicalDataExtractionService = new MedicalDataExtractionService();
export default medicalDataExtractionService; 