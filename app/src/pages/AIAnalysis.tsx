import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Stack,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  Warning as WarningIcon,
  AutoAwesome as AutoAwesomeIcon,
  RecordVoiceOver as TranscriptionIcon,
  Comment as CommentIcon,
  ExpandMore as ExpandMoreIcon,
  LocalHospital as HospitalIcon,
  MedicalServices as MedicalServicesIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ThumbUp as ThumbUpIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  HealthAndSafety as HealthAndSafetyIcon,
} from '@mui/icons-material';
import { openAIService } from '@/services/openai';
import { ROUTES } from '@/constants';
import { mockVisits as visitData } from '@/data/mockData';
import { MockDataStore } from '@/data/mockData';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

interface Symptom {
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

interface Diagnosis {
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

interface Treatment {
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

interface ConcernFlag {
  id: string;
  type: 'red_flag' | 'drug_interaction' | 'allergy' | 'urgent_referral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
  requiresImmediateAction: boolean;
}

interface PrescriptionSuggestion {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  contraindications: string[];
  interactions: string[];
  confidence: number;
  reasoning: string;
  category: 'first-line' | 'second-line' | 'alternative';
}

interface CustomPrescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  notes: string;
}

// Function to generate patient-specific analysis data
const generatePatientAnalysisData = (visitId: string) => {
  // First try to get the actual visit data from MockDataStore
  const actualVisit = MockDataStore.getVisitById(visitId);
  
  if (actualVisit) {
    // For new visits, use a simplified approach that just updates patient context
    // while keeping the existing analysis structure for compatibility
    const existingAnalysis = generatePatientAnalysisData_Original(visitId);
    
    // If we have existing analysis, use it but update patient context
    if (existingAnalysis) {
      return {
        ...existingAnalysis,
        patientContext: {
          age: actualVisit.patientAge,
          gender: actualVisit.patientGender,
          primaryLanguage: 'English',
          chiefComplaint: actualVisit.chiefComplaint || 'Not specified',
        },
      };
    }
    
    // For completely new visits, return a basic analysis with real patient data
    return {
      id: `analysis-${visitId}`,
      status: 'completed',
      confidenceScore: 0.75,
      processingTime: 2.5,
      aiModel: 'GPT-4 Medical',
      analysisDate: new Date(),
      reviewStatus: 'pending',
      patientContext: {
        age: actualVisit.patientAge,
        gender: actualVisit.patientGender,
        primaryLanguage: 'English',
        chiefComplaint: actualVisit.chiefComplaint || 'Not specified',
      },
      symptoms: [
        { id: 'sym-1', name: 'Reported symptoms', severity: 'mild' as const, confidence: 0.80, duration: 'Recent', location: 'As reported', quality: 'Patient reported', associatedFactors: ['Clinical consultation'], sourceText: `Patient ${actualVisit.patientName} reported symptoms during visit: ${actualVisit.chiefComplaint || 'General consultation'}` },
      ],
      diagnoses: [
        { id: 'dx-1', condition: 'Clinical Assessment', icd10Code: 'Z00.00', probability: 0.70, severity: 'low' as const, supportingEvidence: ['Patient history', 'Clinical presentation'], againstEvidence: [], additionalTestsNeeded: ['Clinical examination'], reasoning: 'Clinical assessment based on patient visit', urgency: 'routine' as const },
      ],
      treatments: [
        { id: 'tx-1', category: 'monitoring' as const, recommendation: 'Follow-up as needed', priority: 'medium' as const, timeframe: 'as indicated', contraindications: [], alternatives: [], expectedOutcome: 'Continued care', evidenceLevel: 'B' as const },
      ],
      concerns: [],
      metrics: {
        totalSymptoms: 1,
        highConfidenceFindings: 1,
        criticalConcerns: 0,
        recommendedTests: 1,
        urgentActions: 0,
      },
    };
  }
  
  // Fall back to original method for existing mock visits
  return generatePatientAnalysisData_Original(visitId);
};

// Rename the original function to avoid conflicts
const generatePatientAnalysisData_Original = (visitId: string) => {
  // Original hardcoded logic for existing mock visits
  const visit = visitData.find(v => v.id === visitId);
  if (!visit) return null;

  const analysisConfigurations = {
    'V001': { // John Doe - Chest pain and shortness of breath
      symptoms: [
        { id: 'sym-1', name: 'Chest pain', severity: 'moderate' as const, confidence: 0.95, duration: '2 hours', location: 'substernal', quality: 'pressure-like', associatedFactors: ['exertion', 'anxiety'], sourceText: 'Patient reports pressure-like chest pain that started 2 hours ago during stair climbing' },
        { id: 'sym-2', name: 'Shortness of breath', severity: 'mild' as const, confidence: 0.87, duration: '1 hour', location: 'bilateral', quality: 'difficulty breathing', associatedFactors: ['chest pain', 'exertion'], sourceText: 'Patient mentions some difficulty breathing associated with chest discomfort' },
        { id: 'sym-3', name: 'Anxiety', severity: 'moderate' as const, confidence: 0.78, duration: 'ongoing', associatedFactors: ['chest pain', 'fear of heart attack'], sourceText: 'Patient appears anxious and worried about potential cardiac event' },
      ] as Symptom[],
      diagnoses: [
        { id: 'dx-1', condition: 'Acute Coronary Syndrome', icd10Code: 'I24.9', probability: 0.75, severity: 'high' as const, supportingEvidence: ['chest pain', 'male gender', 'age >40', 'exertional trigger'], againstEvidence: ['normal ECG', 'short duration', 'anxiety component'], additionalTestsNeeded: ['troponin levels', 'stress test', 'echocardiogram'], reasoning: 'Classic presentation of chest pain in middle-aged male with cardiac risk factors', urgency: 'urgent' as const },
        { id: 'dx-2', condition: 'Anxiety Disorder with Panic Attack', icd10Code: 'F41.0', probability: 0.65, severity: 'medium' as const, supportingEvidence: ['anxiety symptoms', 'pressure sensation', 'situational trigger'], againstEvidence: ['physical exertion trigger', 'duration'], additionalTestsNeeded: ['anxiety assessment', 'psychiatric evaluation'], reasoning: 'Anxiety can manifest with chest discomfort and breathing difficulties', urgency: 'routine' as const },
      ] as Diagnosis[],
      treatments: [
        { id: 'tx-1', category: 'medication' as const, recommendation: 'Aspirin 325mg if no contraindications', priority: 'high' as const, timeframe: 'immediate', contraindications: ['active bleeding', 'aspirin allergy'], alternatives: ['clopidogrel 75mg if aspirin contraindicated'], expectedOutcome: 'Reduced platelet aggregation and cardiovascular risk', evidenceLevel: 'A' as const },
        { id: 'tx-2', category: 'referral' as const, recommendation: 'Urgent cardiology consultation', priority: 'high' as const, timeframe: 'within 24 hours', contraindications: [], alternatives: ['emergency department if symptoms worsen'], expectedOutcome: 'Expert cardiac evaluation and risk stratification', evidenceLevel: 'A' as const },
      ] as Treatment[],
      concerns: [
        { id: 'flag-1', type: 'red_flag' as const, severity: 'high' as const, message: 'Chest pain in middle-aged male with potential cardiac risk factors', recommendation: 'Immediate cardiac evaluation with ECG and troponin', requiresImmediateAction: true },
      ] as ConcernFlag[],
      confidenceScore: 0.87,
    },
    'V002': { // Jane Smith - Palpitations and fatigue
      symptoms: [
        { id: 'sym-1', name: 'Palpitations', severity: 'moderate' as const, confidence: 0.92, duration: '3 days', location: 'cardiac', quality: 'irregular heartbeat', associatedFactors: ['fatigue', 'stress'], sourceText: 'Patient reports irregular heartbeat sensations over the past 3 days' },
        { id: 'sym-2', name: 'Fatigue', severity: 'moderate' as const, confidence: 0.88, duration: '1 week', quality: 'generalized weakness', associatedFactors: ['palpitations', 'sleep disturbance'], sourceText: 'Patient describes feeling tired and weak for the past week' },
        { id: 'sym-3', name: 'Irregular pulse', severity: 'mild' as const, confidence: 0.95, duration: 'intermittent', associatedFactors: ['palpitations'], sourceText: 'Physical examination reveals irregular pulse rhythm' },
      ] as Symptom[],
      diagnoses: [
        { id: 'dx-1', condition: 'Atrial Fibrillation', icd10Code: 'I48.91', probability: 0.85, severity: 'high' as const, supportingEvidence: ['irregular pulse', 'palpitations', 'age >60', 'female gender'], againstEvidence: ['no chest pain', 'no syncope'], additionalTestsNeeded: ['ECG', 'echocardiogram', 'thyroid function'], reasoning: 'Irregular pulse with palpitations in elderly female suggests atrial fibrillation', urgency: 'urgent' as const },
        { id: 'dx-2', condition: 'Thyroid dysfunction', icd10Code: 'E07.9', probability: 0.45, severity: 'medium' as const, supportingEvidence: ['palpitations', 'fatigue', 'female gender'], againstEvidence: ['no weight changes', 'no heat intolerance'], additionalTestsNeeded: ['TSH', 'T3', 'T4'], reasoning: 'Thyroid disorders can cause palpitations and fatigue', urgency: 'routine' as const },
      ] as Diagnosis[],
      treatments: [
        { id: 'tx-1', category: 'medication' as const, recommendation: 'Anticoagulation therapy (warfarin or DOAC)', priority: 'high' as const, timeframe: 'within 24 hours', contraindications: ['active bleeding', 'severe liver disease'], alternatives: ['aspirin if anticoagulation contraindicated'], expectedOutcome: 'Reduced stroke risk', evidenceLevel: 'A' as const },
        { id: 'tx-2', category: 'referral' as const, recommendation: 'Cardiology consultation for rhythm management', priority: 'high' as const, timeframe: 'within 48 hours', contraindications: [], alternatives: ['emergency department if symptoms worsen'], expectedOutcome: 'Optimal rhythm and rate control', evidenceLevel: 'A' as const },
      ] as Treatment[],
      concerns: [
        { id: 'flag-1', type: 'red_flag' as const, severity: 'high' as const, message: 'New onset atrial fibrillation requires immediate anticoagulation assessment', recommendation: 'Urgent cardiology consultation and anticoagulation initiation', requiresImmediateAction: true },
      ] as ConcernFlag[],
      confidenceScore: 0.92,
    },
    'V003': { // Michael Brown - Fatigue and gastrointestinal symptoms
      symptoms: [
        { id: 'sym-1', name: 'Fatigue', severity: 'moderate' as const, confidence: 0.90, duration: '2 weeks', quality: 'generalized weakness', associatedFactors: ['weight loss', 'appetite changes'], sourceText: 'Patient reports persistent fatigue and weakness for 2 weeks' },
        { id: 'sym-2', name: 'Epigastric pain', severity: 'moderate' as const, confidence: 0.85, duration: '1 week', location: 'upper abdomen', quality: 'burning sensation', associatedFactors: ['eating', 'nausea'], sourceText: 'Patient describes burning pain in upper abdomen, worse after meals' },
        { id: 'sym-3', name: 'Weight loss', severity: 'mild' as const, confidence: 0.78, duration: '3 weeks', quality: 'unintentional', associatedFactors: ['poor appetite', 'abdominal pain'], sourceText: 'Patient reports unintentional weight loss of 8 pounds over 3 weeks' },
      ] as Symptom[],
      diagnoses: [
        { id: 'dx-1', condition: 'Peptic Ulcer Disease', icd10Code: 'K27.9', probability: 0.70, severity: 'medium' as const, supportingEvidence: ['epigastric pain', 'weight loss', 'male gender'], againstEvidence: ['no melena', 'no vomiting'], additionalTestsNeeded: ['upper endoscopy', 'H. pylori testing', 'CBC'], reasoning: 'Epigastric pain with weight loss suggests peptic ulcer disease', urgency: 'urgent' as const },
        { id: 'dx-2', condition: 'Gastric malignancy', icd10Code: 'C16.9', probability: 0.35, severity: 'high' as const, supportingEvidence: ['weight loss', 'fatigue', 'age >30'], againstEvidence: ['young age', 'no family history'], additionalTestsNeeded: ['upper endoscopy with biopsy', 'CT abdomen'], reasoning: 'Weight loss and fatigue warrant evaluation for gastric malignancy', urgency: 'urgent' as const },
      ] as Diagnosis[],
      treatments: [
        { id: 'tx-1', category: 'medication' as const, recommendation: 'Proton pump inhibitor (omeprazole 40mg daily)', priority: 'high' as const, timeframe: 'immediate', contraindications: ['hypersensitivity'], alternatives: ['H2 blockers if PPI contraindicated'], expectedOutcome: 'Reduced gastric acid production and symptom relief', evidenceLevel: 'A' as const },
        { id: 'tx-2', category: 'procedure' as const, recommendation: 'Upper endoscopy', priority: 'high' as const, timeframe: 'within 1 week', contraindications: ['severe coagulopathy'], alternatives: ['upper GI series if endoscopy not available'], expectedOutcome: 'Direct visualization and tissue sampling', evidenceLevel: 'A' as const },
      ] as Treatment[],
      concerns: [
        { id: 'flag-1', type: 'red_flag' as const, severity: 'high' as const, message: 'Weight loss and epigastric pain require urgent evaluation to rule out malignancy', recommendation: 'Urgent upper endoscopy within 1 week', requiresImmediateAction: true },
      ] as ConcernFlag[],
      confidenceScore: 0.85,
    },
    'V004': { // Sarah Wilson - Severe headache with vision changes
      symptoms: [
        { id: 'sym-1', name: 'Severe headache', severity: 'severe' as const, confidence: 0.95, duration: '4 hours', location: 'unilateral', quality: 'throbbing', associatedFactors: ['photophobia', 'nausea'], sourceText: 'Patient reports severe throbbing headache on right side' },
        { id: 'sym-2', name: 'Vision changes', severity: 'moderate' as const, confidence: 0.88, duration: '2 hours', location: 'bilateral', quality: 'visual aura', associatedFactors: ['headache', 'flashing lights'], sourceText: 'Patient describes seeing flashing lights and zigzag patterns' },
        { id: 'sym-3', name: 'Photophobia', severity: 'moderate' as const, confidence: 0.82, duration: '3 hours', associatedFactors: ['headache', 'nausea'], sourceText: 'Patient reports sensitivity to light with headache' },
      ] as Symptom[],
      diagnoses: [
        { id: 'dx-1', condition: 'Migraine with Aura', icd10Code: 'G43.109', probability: 0.90, severity: 'medium' as const, supportingEvidence: ['unilateral headache', 'visual aura', 'photophobia', 'young female'], againstEvidence: ['no fever', 'no neck stiffness'], additionalTestsNeeded: ['neurological exam', 'consider MRI if atypical'], reasoning: 'Classic presentation of migraine with visual aura in young female', urgency: 'routine' as const },
        { id: 'dx-2', condition: 'Tension headache', icd10Code: 'G44.209', probability: 0.25, severity: 'low' as const, supportingEvidence: ['headache', 'stress'], againstEvidence: ['unilateral pain', 'visual symptoms'], additionalTestsNeeded: ['headache diary'], reasoning: 'Less likely given unilateral nature and visual symptoms', urgency: 'routine' as const },
      ] as Diagnosis[],
      treatments: [
        { id: 'tx-1', category: 'medication' as const, recommendation: 'Sumatriptan 50mg for acute treatment', priority: 'high' as const, timeframe: 'immediate', contraindications: ['coronary artery disease', 'uncontrolled hypertension'], alternatives: ['NSAIDs if triptans contraindicated'], expectedOutcome: 'Rapid headache relief', evidenceLevel: 'A' as const },
        { id: 'tx-2', category: 'lifestyle' as const, recommendation: 'Identify and avoid migraine triggers', priority: 'medium' as const, timeframe: 'ongoing', contraindications: [], alternatives: ['prophylactic medications if frequent'], expectedOutcome: 'Reduced frequency of migraine episodes', evidenceLevel: 'B' as const },
      ] as Treatment[],
      concerns: [
        { id: 'flag-1', type: 'urgent_referral' as const, severity: 'medium' as const, message: 'New onset severe headache with visual symptoms requires neurological evaluation', recommendation: 'Neurology consultation if symptoms persist or worsen', requiresImmediateAction: false },
      ] as ConcernFlag[],
      confidenceScore: 0.91,
    },
    'V005': { // Robert Johnson - Knee pain and swelling
      symptoms: [
        { id: 'sym-1', name: 'Knee pain', severity: 'moderate' as const, confidence: 0.92, duration: '5 days', location: 'bilateral knees', quality: 'aching', associatedFactors: ['swelling', 'stiffness'], sourceText: 'Patient reports aching pain in both knees for 5 days' },
        { id: 'sym-2', name: 'Knee swelling', severity: 'mild' as const, confidence: 0.85, duration: '3 days', location: 'bilateral', quality: 'joint effusion', associatedFactors: ['pain', 'limited mobility'], sourceText: 'Patient notes swelling in both knees with decreased range of motion' },
        { id: 'sym-3', name: 'Morning stiffness', severity: 'mild' as const, confidence: 0.78, duration: '1 week', quality: 'joint stiffness', associatedFactors: ['pain', 'improved with movement'], sourceText: 'Patient reports morning stiffness lasting 30 minutes' },
      ] as Symptom[],
      diagnoses: [
        { id: 'dx-1', condition: 'Osteoarthritis with acute flare', icd10Code: 'M19.90', probability: 0.80, severity: 'medium' as const, supportingEvidence: ['age >50', 'joint pain', 'stiffness', 'male gender'], againstEvidence: ['no joint deformity', 'acute onset'], additionalTestsNeeded: ['X-ray knees', 'joint aspiration if effusion'], reasoning: 'Classic presentation of osteoarthritis flare in middle-aged male', urgency: 'routine' as const },
        { id: 'dx-2', condition: 'Rheumatoid arthritis', icd10Code: 'M06.9', probability: 0.25, severity: 'high' as const, supportingEvidence: ['bilateral joint involvement', 'morning stiffness'], againstEvidence: ['age >50', 'male gender'], additionalTestsNeeded: ['RF', 'anti-CCP', 'ESR', 'CRP'], reasoning: 'Bilateral joint involvement warrants evaluation for inflammatory arthritis', urgency: 'routine' as const },
      ] as Diagnosis[],
      treatments: [
        { id: 'tx-1', category: 'medication' as const, recommendation: 'NSAIDs (ibuprofen 600mg TID)', priority: 'high' as const, timeframe: 'immediate', contraindications: ['peptic ulcer disease', 'kidney disease'], alternatives: ['acetaminophen if NSAIDs contraindicated'], expectedOutcome: 'Reduced pain and inflammation', evidenceLevel: 'A' as const },
        { id: 'tx-2', category: 'referral' as const, recommendation: 'Physical therapy evaluation', priority: 'medium' as const, timeframe: 'within 2 weeks', contraindications: [], alternatives: ['home exercise program'], expectedOutcome: 'Improved joint function and mobility', evidenceLevel: 'B' as const },
      ] as Treatment[],
      concerns: [
        { id: 'flag-1', type: 'urgent_referral' as const, severity: 'low' as const, message: 'Bilateral joint involvement may require rheumatology evaluation', recommendation: 'Rheumatology consultation if symptoms persist despite treatment', requiresImmediateAction: false },
      ] as ConcernFlag[],
      confidenceScore: 0.78,
    },
    'V006': { // Emily Davis - Fever and cough
      symptoms: [
        { id: 'sym-1', name: 'Fever', severity: 'moderate' as const, confidence: 0.90, duration: '2 days', quality: 'intermittent', associatedFactors: ['cough', 'fatigue'], sourceText: 'Patient has fever up to 101.5°F for 2 days' },
        { id: 'sym-2', name: 'Cough', severity: 'mild' as const, confidence: 0.85, duration: '3 days', quality: 'dry cough', associatedFactors: ['fever', 'throat irritation'], sourceText: 'Patient has dry cough for 3 days' },
        { id: 'sym-3', name: 'Fatigue', severity: 'mild' as const, confidence: 0.78, duration: '2 days', quality: 'tiredness', associatedFactors: ['fever', 'poor sleep'], sourceText: 'Patient appears tired and less active than usual' },
      ] as Symptom[],
      diagnoses: [
        { id: 'dx-1', condition: 'Viral Upper Respiratory Infection', icd10Code: 'J06.9', probability: 0.85, severity: 'low' as const, supportingEvidence: ['fever', 'cough', 'pediatric age', 'seasonal pattern'], againstEvidence: ['no sore throat', 'no runny nose'], additionalTestsNeeded: ['supportive care', 'consider rapid strep if throat symptoms develop'], reasoning: 'Typical viral URI presentation in pediatric patient', urgency: 'routine' as const },
        { id: 'dx-2', condition: 'Bacterial pneumonia', icd10Code: 'J15.9', probability: 0.20, severity: 'medium' as const, supportingEvidence: ['fever', 'cough'], againstEvidence: ['no shortness of breath', 'no chest pain'], additionalTestsNeeded: ['chest X-ray', 'CBC if concerns'], reasoning: 'Less likely without respiratory distress', urgency: 'routine' as const },
      ] as Diagnosis[],
      treatments: [
        { id: 'tx-1', category: 'medication' as const, recommendation: 'Acetaminophen for fever and comfort', priority: 'medium' as const, timeframe: 'as needed', contraindications: ['liver disease'], alternatives: ['ibuprofen if >6 months old'], expectedOutcome: 'Symptom relief and comfort', evidenceLevel: 'A' as const },
        { id: 'tx-2', category: 'lifestyle' as const, recommendation: 'Supportive care: rest, fluids, humidified air', priority: 'medium' as const, timeframe: 'ongoing', contraindications: [], alternatives: ['honey for cough if >1 year old'], expectedOutcome: 'Faster recovery and symptom relief', evidenceLevel: 'B' as const },
      ] as Treatment[],
      concerns: [
        { id: 'flag-1', type: 'urgent_referral' as const, severity: 'low' as const, message: 'Monitor for signs of bacterial superinfection', recommendation: 'Return if fever persists >3 days or respiratory symptoms worsen', requiresImmediateAction: false },
      ] as ConcernFlag[],
      confidenceScore: 0.82,
    },
    'V007': { // David Anderson - Severe abdominal pain
      symptoms: [
        { id: 'sym-1', name: 'Severe abdominal pain', severity: 'severe', confidence: 0.95, duration: '6 hours', location: 'right lower quadrant', quality: 'sharp, constant', associatedFactors: ['nausea', 'vomiting'], sourceText: 'Patient reports severe, constant pain in right lower abdomen' },
        { id: 'sym-2', name: 'Nausea and vomiting', severity: 'moderate', confidence: 0.88, duration: '4 hours', associatedFactors: ['abdominal pain', 'anorexia'], sourceText: 'Patient has been vomiting and feels nauseous' },
        { id: 'sym-3', name: 'Fever', severity: 'mild', confidence: 0.82, duration: '3 hours', quality: 'low-grade', associatedFactors: ['abdominal pain', 'malaise'], sourceText: 'Patient has low-grade fever of 100.8°F' },
      ],
      diagnoses: [
        { id: 'dx-1', condition: 'Acute Appendicitis', icd10Code: 'K35.9', probability: 0.90, severity: 'high', supportingEvidence: ['RLQ pain', 'nausea/vomiting', 'fever', 'male gender'], againstEvidence: ['no rebound tenderness noted'], additionalTestsNeeded: ['CT abdomen', 'CBC with differential', 'urinalysis'], reasoning: 'Classic presentation of acute appendicitis with RLQ pain and systemic symptoms', urgency: 'emergent' },
        { id: 'dx-2', condition: 'Inflammatory bowel disease flare', icd10Code: 'K50.9', probability: 0.15, severity: 'medium', supportingEvidence: ['abdominal pain', 'male gender'], againstEvidence: ['no diarrhea', 'no blood in stool'], additionalTestsNeeded: ['colonoscopy', 'inflammatory markers'], reasoning: 'Less likely without typical IBD symptoms', urgency: 'routine' },
      ],
      treatments: [
        { id: 'tx-1', category: 'procedure', recommendation: 'Emergency appendectomy', priority: 'urgent', timeframe: 'within 6 hours', contraindications: ['severe comorbidities precluding surgery'], alternatives: ['antibiotics if surgery contraindicated'], expectedOutcome: 'Removal of inflamed appendix, prevent rupture', evidenceLevel: 'A' },
        { id: 'tx-2', category: 'medication', recommendation: 'IV antibiotics perioperatively', priority: 'high', timeframe: 'immediate', contraindications: ['severe antibiotic allergy'], alternatives: ['alternative antibiotic regimen'], expectedOutcome: 'Prevent postoperative infection', evidenceLevel: 'A' },
      ],
      concerns: [
        { id: 'flag-1', type: 'red_flag', severity: 'critical', message: 'Acute appendicitis requires immediate surgical intervention', recommendation: 'Emergency surgery within 6 hours to prevent rupture', requiresImmediateAction: true },
      ],
      confidenceScore: 0.94,
    },
    'V008': { // Lisa Martinez - Decreased fetal movement at 32 weeks
      symptoms: [
        { id: 'sym-1', name: 'Decreased fetal movement', severity: 'moderate', confidence: 0.90, duration: '24 hours', location: 'uterine', quality: 'reduced kick count', associatedFactors: ['maternal anxiety'], sourceText: 'Patient reports decreased fetal movement over past 24 hours' },
        { id: 'sym-2', name: 'Maternal anxiety', severity: 'moderate', confidence: 0.85, duration: '12 hours', quality: 'worried about baby', associatedFactors: ['decreased fetal movement'], sourceText: 'Patient expresses concern about baby\'s wellbeing' },
      ],
      diagnoses: [
        { id: 'dx-1', condition: 'Decreased fetal movement (normal variant)', icd10Code: 'O36.8190', probability: 0.75, severity: 'low', supportingEvidence: ['gestational age 32 weeks', 'no other symptoms'], againstEvidence: ['maternal concern'], additionalTestsNeeded: ['fetal monitoring', 'biophysical profile'], reasoning: 'Most cases of decreased fetal movement are normal variants', urgency: 'routine' },
        { id: 'dx-2', condition: 'Fetal compromise', icd10Code: 'O36.9990', probability: 0.25, severity: 'high', supportingEvidence: ['decreased movement'], againstEvidence: ['no bleeding', 'no contractions'], additionalTestsNeeded: ['continuous fetal monitoring', 'ultrasound'], reasoning: 'Must rule out fetal compromise with decreased movement', urgency: 'urgent' },
      ],
      treatments: [
        { id: 'tx-1', category: 'monitoring', recommendation: 'Fetal monitoring and biophysical profile', priority: 'high', timeframe: 'immediate', contraindications: [], alternatives: ['kick count instructions'], expectedOutcome: 'Reassurance of fetal wellbeing', evidenceLevel: 'A' },
        { id: 'tx-2', category: 'lifestyle', recommendation: 'Kick count monitoring instructions', priority: 'medium', timeframe: 'ongoing', contraindications: [], alternatives: ['more frequent monitoring'], expectedOutcome: 'Early detection of fetal compromise', evidenceLevel: 'B' },
      ],
      concerns: [
        { id: 'flag-1', type: 'urgent_referral', severity: 'medium', message: 'Decreased fetal movement requires immediate assessment', recommendation: 'Immediate fetal monitoring and obstetric evaluation', requiresImmediateAction: true },
      ],
      confidenceScore: 0.88,
    },
    'V009': { // James Taylor - Depression and anxiety symptoms
      symptoms: [
        { id: 'sym-1', name: 'Depression', severity: 'moderate', confidence: 0.92, duration: '3 weeks', quality: 'persistent low mood', associatedFactors: ['anxiety', 'sleep disturbance'], sourceText: 'Patient reports persistent low mood and loss of interest for 3 weeks' },
        { id: 'sym-2', name: 'Anxiety', severity: 'moderate', confidence: 0.88, duration: '2 weeks', quality: 'excessive worry', associatedFactors: ['depression', 'physical symptoms'], sourceText: 'Patient describes excessive worry and physical symptoms of anxiety' },
        { id: 'sym-3', name: 'Sleep disturbance', severity: 'mild', confidence: 0.85, duration: '2 weeks', quality: 'insomnia', associatedFactors: ['depression', 'anxiety'], sourceText: 'Patient reports difficulty falling asleep and staying asleep' },
      ] as Symptom[],
      diagnoses: [
        { id: 'dx-1', condition: 'Major Depressive Disorder', icd10Code: 'F33.1', probability: 0.80, severity: 'high', supportingEvidence: ['persistent low mood', 'loss of interest', 'sleep disturbance', 'duration >2 weeks'], againstEvidence: ['no psychotic features', 'no suicidal ideation'], additionalTestsNeeded: ['PHQ-9', 'suicide risk assessment'], reasoning: 'Meets criteria for major depressive disorder with moderate severity', urgency: 'urgent' },
        { id: 'dx-2', condition: 'Generalized Anxiety Disorder', icd10Code: 'F41.1', probability: 0.70, severity: 'medium', supportingEvidence: ['excessive worry', 'physical symptoms', 'duration >2 weeks'], againstEvidence: ['no panic attacks'], additionalTestsNeeded: ['GAD-7', 'anxiety assessment'], reasoning: 'Comorbid anxiety disorder commonly occurs with depression', urgency: 'routine' },
      ] as Diagnosis[],
      treatments: [
        { id: 'tx-1', category: 'medication', recommendation: 'Sertraline 50mg daily', priority: 'high', timeframe: 'immediate', contraindications: ['MAOI use', 'severe liver disease'], alternatives: ['other SSRIs or SNRIs'], expectedOutcome: 'Improved mood and reduced anxiety', evidenceLevel: 'A' },
        { id: 'tx-2', category: 'referral', recommendation: 'Cognitive behavioral therapy', priority: 'high', timeframe: 'within 2 weeks', contraindications: [], alternatives: ['other psychotherapy modalities'], expectedOutcome: 'Improved coping skills and mood regulation', evidenceLevel: 'A' },
      ] as Treatment[],
      concerns: [
        { id: 'flag-1', type: 'urgent_referral', severity: 'high', message: 'Major depression requires immediate treatment and suicide risk assessment', recommendation: 'Immediate psychiatric evaluation and safety assessment', requiresImmediateAction: true },
      ] as ConcernFlag[],
      confidenceScore: 0.87,
    },
    'V010': { // Maria Gonzalez - Polyuria, polydipsia, and fatigue
      symptoms: [
        { id: 'sym-1', name: 'Polyuria', severity: 'moderate', confidence: 0.95, duration: '2 weeks', quality: 'excessive urination', associatedFactors: ['polydipsia', 'fatigue'], sourceText: 'Patient reports urinating frequently, especially at night' },
        { id: 'sym-2', name: 'Polydipsia', severity: 'moderate', confidence: 0.90, duration: '2 weeks', quality: 'excessive thirst', associatedFactors: ['polyuria', 'dry mouth'], sourceText: 'Patient describes constant thirst and dry mouth' },
        { id: 'sym-3', name: 'Fatigue', severity: 'mild', confidence: 0.85, duration: '3 weeks', quality: 'tiredness', associatedFactors: ['polyuria', 'polydipsia'], sourceText: 'Patient reports feeling tired and weak' },
      ] as Symptom[],
      diagnoses: [
        { id: 'dx-1', condition: 'Type 2 Diabetes Mellitus', icd10Code: 'E11.9', probability: 0.90, severity: 'high', supportingEvidence: ['polyuria', 'polydipsia', 'fatigue', 'age >50', 'female'], againstEvidence: ['no weight loss', 'no ketosis'], additionalTestsNeeded: ['fasting glucose', 'HbA1c', 'urinalysis'], reasoning: 'Classic triad of diabetes symptoms in middle-aged patient', urgency: 'urgent' },
        { id: 'dx-2', condition: 'Diabetes Insipidus', icd10Code: 'E23.2', probability: 0.15, severity: 'medium', supportingEvidence: ['polyuria', 'polydipsia'], againstEvidence: ['no hypernatremia', 'age'], additionalTestsNeeded: ['urine specific gravity', 'serum osmolality'], reasoning: 'Less likely given age and presentation', urgency: 'routine' },
      ] as Diagnosis[],
      treatments: [
        { id: 'tx-1', category: 'medication', recommendation: 'Metformin 500mg twice daily', priority: 'high', timeframe: 'immediate', contraindications: ['kidney disease', 'liver disease'], alternatives: ['other antidiabetic agents'], expectedOutcome: 'Improved glycemic control', evidenceLevel: 'A' },
        { id: 'tx-2', category: 'lifestyle', recommendation: 'Diabetes education and lifestyle modifications', priority: 'high', timeframe: 'within 1 week', contraindications: [], alternatives: ['intensive diabetes management program'], expectedOutcome: 'Better diabetes self-management', evidenceLevel: 'A' },
      ] as Treatment[],
      concerns: [
        { id: 'flag-1', type: 'urgent_referral', severity: 'high', message: 'New diagnosis of diabetes requires immediate management and education', recommendation: 'Endocrinology consultation and diabetes education within 1 week', requiresImmediateAction: true },
      ] as ConcernFlag[],
      confidenceScore: 0.93,
    },
    'V011': { // Christopher White - Generalized rash and itching
      symptoms: [
        { id: 'sym-1', name: 'Generalized rash', severity: 'moderate', confidence: 0.90, duration: '3 days', location: 'widespread', quality: 'erythematous', associatedFactors: ['itching', 'new detergent exposure'], sourceText: 'Patient has widespread red rash over trunk and extremities' },
        { id: 'sym-2', name: 'Itching', severity: 'moderate', confidence: 0.85, duration: '3 days', quality: 'pruritus', associatedFactors: ['rash', 'worse at night'], sourceText: 'Patient reports intense itching, especially at night' },
        { id: 'sym-3', name: 'Skin irritation', severity: 'mild', confidence: 0.78, duration: '2 days', quality: 'inflamed skin', associatedFactors: ['rash', 'itching'], sourceText: 'Skin appears inflamed and irritated' },
      ] as Symptom[],
      diagnoses: [
        { id: 'dx-1', condition: 'Contact Dermatitis', icd10Code: 'L25.9', probability: 0.85, severity: 'low', supportingEvidence: ['new detergent exposure', 'widespread rash', 'itching'], againstEvidence: ['no blisters', 'no fever'], additionalTestsNeeded: ['patch testing if recurrent'], reasoning: 'Clear temporal relationship with new detergent exposure', urgency: 'routine' },
        { id: 'dx-2', condition: 'Allergic reaction', icd10Code: 'T78.40', probability: 0.20, severity: 'medium', supportingEvidence: ['widespread rash', 'itching'], againstEvidence: ['no respiratory symptoms', 'no angioedema'], additionalTestsNeeded: ['allergy testing'], reasoning: 'Possible allergic reaction but less likely without systemic symptoms', urgency: 'routine' },
      ] as Diagnosis[],
      treatments: [
        { id: 'tx-1', category: 'medication', recommendation: 'Topical corticosteroid (hydrocortisone 1%)', priority: 'high', timeframe: 'immediate', contraindications: ['skin infection'], alternatives: ['calamine lotion'], expectedOutcome: 'Reduced inflammation and itching', evidenceLevel: 'A' },
        { id: 'tx-2', category: 'lifestyle', recommendation: 'Avoid suspected allergen (new detergent)', priority: 'high', timeframe: 'immediate', contraindications: [], alternatives: ['hypoallergenic products'], expectedOutcome: 'Prevention of recurrence', evidenceLevel: 'A' },
      ] as Treatment[],
      concerns: [
        { id: 'flag-1', type: 'urgent_referral', severity: 'low', message: 'Monitor for signs of secondary infection', recommendation: 'Return if rash worsens or develops signs of infection', requiresImmediateAction: false },
      ] as ConcernFlag[],
      confidenceScore: 0.76,
    },
    'V012': { // Amanda Thompson - Persistent cough with hemoptysis and weight loss
      symptoms: [
        { id: 'sym-1', name: 'Persistent cough', severity: 'moderate', confidence: 0.95, duration: '6 weeks', quality: 'productive', associatedFactors: ['hemoptysis', 'weight loss'], sourceText: 'Patient reports productive cough persisting for 6 weeks' },
        { id: 'sym-2', name: 'Hemoptysis', severity: 'moderate', confidence: 0.90, duration: '2 weeks', quality: 'blood-streaked sputum', associatedFactors: ['cough', 'weight loss'], sourceText: 'Patient notices blood-streaked sputum for 2 weeks' },
        { id: 'sym-3', name: 'Weight loss', severity: 'moderate', confidence: 0.88, duration: '2 months', quality: 'unintentional', associatedFactors: ['cough', 'poor appetite'], sourceText: 'Patient reports unintentional weight loss of 15 pounds over 2 months' },
      ] as Symptom[],
      diagnoses: [
        { id: 'dx-1', condition: 'Lung Adenocarcinoma', icd10Code: 'C78.00', probability: 0.75, severity: 'critical', supportingEvidence: ['hemoptysis', 'weight loss', 'persistent cough', 'age >45', 'female'], againstEvidence: ['no smoking history documented'], additionalTestsNeeded: ['chest CT', 'bronchoscopy with biopsy', 'PET scan'], reasoning: 'Classic presentation of lung cancer with hemoptysis and weight loss', urgency: 'emergent' },
        { id: 'dx-2', condition: 'Pulmonary tuberculosis', icd10Code: 'A15.9', probability: 0.25, severity: 'high', supportingEvidence: ['persistent cough', 'hemoptysis', 'weight loss'], againstEvidence: ['no night sweats', 'no fever'], additionalTestsNeeded: ['sputum AFB', 'chest X-ray', 'tuberculin skin test'], reasoning: 'TB can present with similar symptoms', urgency: 'urgent' },
      ] as Diagnosis[],
      treatments: [
        { id: 'tx-1', category: 'procedure', recommendation: 'Urgent chest CT and bronchoscopy', priority: 'urgent', timeframe: 'within 48 hours', contraindications: ['severe coagulopathy'], alternatives: ['sputum cytology'], expectedOutcome: 'Tissue diagnosis and staging', evidenceLevel: 'A' },
        { id: 'tx-2', category: 'referral', recommendation: 'Immediate oncology consultation', priority: 'urgent', timeframe: 'within 24 hours', contraindications: [], alternatives: ['multidisciplinary tumor board'], expectedOutcome: 'Comprehensive cancer treatment planning', evidenceLevel: 'A' },
      ] as Treatment[],
      concerns: [
        { id: 'flag-1', type: 'red_flag', severity: 'critical', message: 'Hemoptysis with weight loss highly suspicious for lung malignancy', recommendation: 'Immediate workup with chest CT and bronchoscopy', requiresImmediateAction: true },
      ] as ConcernFlag[],
      confidenceScore: 0.96,
    },
  };

  const config = analysisConfigurations[visitId as keyof typeof analysisConfigurations];
  if (!config) return null;

  return {
    id: `analysis-${visitId}`,
    status: 'completed',
    confidenceScore: config.confidenceScore,
    processingTime: Math.random() * 2 + 2, // Random between 2-4 seconds
    aiModel: 'GPT-4 Medical',
    analysisDate: new Date(),
    reviewStatus: 'pending',
    
    patientContext: {
      age: visit.patientAge,
      gender: visit.patientGender,
      primaryLanguage: 'English',
      chiefComplaint: visit.chiefComplaint || 'No chief complaint documented',
    },
    
    symptoms: config.symptoms,
    diagnoses: config.diagnoses,
    treatments: config.treatments,
    concerns: config.concerns,
    
    metrics: {
      totalSymptoms: config.symptoms.length,
      highConfidenceFindings: config.symptoms.filter(s => s.confidence > 0.85).length,
      criticalConcerns: config.concerns.filter(c => c.severity === 'critical' || c.severity === 'high').length,
      recommendedTests: config.treatments.filter(t => t.category === 'procedure' || t.category === 'monitoring').length,
      urgentActions: config.treatments.filter(t => t.priority === 'urgent' || t.priority === 'high').length,
    },
  };
};

const AIAnalysisPage: React.FC = () => {
  const { id: visitId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [currentTabValue, setCurrentTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [userRating, setUserRating] = useState<number | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null);
  
  // Prescription-related state
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [prescriptionSuggestions, setPrescriptionSuggestions] = useState<PrescriptionSuggestion[]>([]);
  const [isGeneratingPrescriptions, setIsGeneratingPrescriptions] = useState(false);
  const [customPrescription, setCustomPrescription] = useState<CustomPrescription>({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    notes: ''
  });
  const [selectedPrescriptionTab, setSelectedPrescriptionTab] = useState(0);
  
  // Generate patient-specific analysis data
  const [analysisData] = useState(() => {
    const data = generatePatientAnalysisData(visitId!);
    if (!data) {
      // Fallback data if visit not found
      return {
        id: `analysis-${visitId}`,
        status: 'completed',
        confidenceScore: 0.5,
        processingTime: 2.0,
        aiModel: 'GPT-4 Medical',
        analysisDate: new Date(),
        reviewStatus: 'pending',
        patientContext: {
          age: 0,
          gender: 'unknown',
          primaryLanguage: 'English',
          chiefComplaint: 'Visit not found',
        },
        symptoms: [],
        diagnoses: [],
        treatments: [],
        concerns: [],
        metrics: {
          totalSymptoms: 0,
          highConfidenceFindings: 0,
          criticalConcerns: 0,
          recommendedTests: 0,
          urgentActions: 0,
        },
      };
    }
    return data;
  });

  const [transcriptData] = useState({
    available: true,
    processedAt: new Date(),
    duration: 18.5,
    confidence: 0.92,
    speakerCount: 2,
    content: `Doctor: Good morning! What brings you in today?

Patient: Hi Doctor. I've been having this chest pain for about 2 hours now. It started when I was climbing the stairs to my apartment.

Doctor: Can you describe the pain for me? Is it sharp, dull, or pressure-like?

Patient: It's more like pressure, like someone is sitting on my chest. It's really worrying me because my father had a heart attack when he was 60.

Doctor: I understand your concern. Are you having any trouble breathing?

Patient: Yes, a little bit. It's not terrible, but I feel like I can't take a deep breath.

Doctor: Any nausea, sweating, or pain going to your arm or jaw?

Patient: No nausea or sweating. Maybe a tiny bit of discomfort in my left arm, but I'm not sure if that's related.

Doctor: Have you ever had chest pain like this before?

Patient: I've had some stress and anxiety lately with work, and sometimes I get chest tightness, but nothing like this.

Doctor: Are you taking any medications currently?

Patient: Just my blood pressure medication - lisinopril, I think it's called. And I take aspirin sometimes.

Doctor: Any allergies to medications?

Patient: Yes, I'm allergic to penicillin - I get a rash.`,
    
    segments: [
      { speaker: 'provider', timestamp: 0, confidence: 0.95, text: 'Good morning! What brings you in today?' },
      { speaker: 'patient', timestamp: 2.1, confidence: 0.93, text: 'Hi Doctor. I\'ve been having this chest pain for about 2 hours now.' },
      // ... more segments would be here
    ],
  });

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleRunAnalysis = async () => {
    setIsRunningAnalysis(true);
    setAnalysisProgress(0);
    
    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      await openAIService.analyzeTranscript(transcriptData.content, undefined);
      setNotification({ message: 'Analysis completed successfully', type: 'success' });
    } catch (error) {
      setNotification({ message: 'Error running analysis', type: 'error' });
    } finally {
      setTimeout(() => {
        setIsRunningAnalysis(false);
        setAnalysisProgress(0);
      }, 2000);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': case 'severe': return 'error';
      case 'medium': case 'moderate': return 'warning';
      case 'low': case 'mild': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getEvidenceColor = (level: string) => {
    switch (level) {
      case 'A': return 'success';
      case 'B': return 'info';
      case 'C': return 'warning';
      case 'D': return 'error';
      default: return 'default';
    }
  };

  // Add these handler functions after the existing handlers
  const handleActNow = (concernId: string) => {
    setNotification({
      message: 'Emergency protocol initiated. Provider has been notified.',
      type: 'warning'
    });
    // In a real app, this would trigger emergency protocols
    console.log('Acting on concern:', concernId);
  };

  const handleViewTreatmentDetails = (treatmentId: string) => {
    const treatment = analysisData.treatments.find(t => t.id === treatmentId);
    if (treatment) {
      setSelectedTreatment(treatment as any);
    }
  };

  const handleViewSymptomDetails = (symptomId: string) => {
    const symptom = analysisData.symptoms.find(s => s.id === symptomId);
    if (symptom) {
      setSelectedSymptom(symptom as any);
    }
  };

  const handleViewDiagnosisDetails = (diagnosisId: string) => {
    const diagnosis = analysisData.diagnoses.find(d => d.id === diagnosisId);
    if (diagnosis) {
      setSelectedDiagnosis(diagnosis as any);
    }
  };

  const handleExportTranscript = () => {
    setNotification({
      message: 'Transcript exported successfully.',
      type: 'success'
    });
    // In a real app, this would trigger a download
    console.log('Exporting transcript');
  };

  const handleSaveReview = () => {
    if (!reviewNotes || !userRating) {
      setNotification({
        message: 'Please provide both a rating and review notes.',
        type: 'warning'
      });
      return;
    }
    setNotification({
      message: 'Review saved successfully.',
      type: 'success'
    });
    console.log('Saving review:', { rating: userRating, notes: reviewNotes });
  };

  const handleApproveAnalysis = () => {
    setNotification({
      message: 'Analysis approved and marked as reviewed.',
      type: 'success'
    });
    console.log('Approving analysis');
  };

  // Prescription handler functions
  const handlePrescribeTreatment = async (treatment: Treatment) => {
    setShowPrescriptionDialog(true);
    setIsGeneratingPrescriptions(true);
    
    try {
      const suggestions = await generatePrescriptionSuggestions(treatment, analysisData);
      setPrescriptionSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating prescription suggestions:', error);
      setNotification({
        message: 'Error generating prescription suggestions. You can still enter a custom prescription.',
        type: 'warning'
      });
    } finally {
      setIsGeneratingPrescriptions(false);
    }
  };

  const generatePrescriptionSuggestions = async (treatment: Treatment, _patientData: any): Promise<PrescriptionSuggestion[]> => {
    try {
      // Build context for AI (currently unused but kept for future AI integration)
      // const patientContext = {
      //   age: patientData.patientContext.age,
      //   gender: patientData.patientContext.gender,
      //   chiefComplaint: patientData.patientContext.chiefComplaint,
      //   symptoms: patientData.symptoms.map((s: any) => s.name).join(', '),
      //   diagnoses: patientData.diagnoses.map((d: any) => d.condition).join(', '),
      //   treatment: treatment.recommendation
      // };

      // Generate patient-specific prescription suggestions

      // For now, we'll use mock data instead of the AI service
      // In a real implementation, you would call the AI service here
      // const response = await openAIService.generateText(prompt);
      
      // Generate patient-specific mock suggestions based on treatment category
      const suggestions = generatePatientSpecificSuggestions(treatment);
      
      return suggestions;
    } catch (error) {
      console.error('Error generating prescription suggestions:', error);
      throw error;
    }
  };

  const generatePatientSpecificSuggestions = (treatment: Treatment): PrescriptionSuggestion[] => {
    // Generate suggestions based on treatment category and patient context
    const suggestions: PrescriptionSuggestion[] = [];
    
    if (treatment.category === 'medication') {
      // For medication treatments, generate specific drug suggestions
      if (treatment.recommendation.toLowerCase().includes('aspirin')) {
        suggestions.push({
          id: 'rx-1',
          medication: 'Aspirin',
          dosage: '81mg',
          frequency: 'Once daily',
          duration: 'Long-term',
          instructions: 'Take with food to reduce stomach irritation',
          contraindications: ['Active bleeding', 'Aspirin allergy', 'Recent GI bleeding'],
          interactions: ['Warfarin', 'Methotrexate', 'NSAIDs'],
          confidence: 95,
          reasoning: 'Low-dose aspirin for cardioprotective therapy, indicated for patients with cardiovascular risk factors',
          category: 'first-line'
        });
      }
      
      if (treatment.recommendation.toLowerCase().includes('proton pump') || treatment.recommendation.toLowerCase().includes('omeprazole')) {
        suggestions.push({
          id: 'rx-2',
          medication: 'Omeprazole',
          dosage: '20mg',
          frequency: 'Once daily',
          duration: '4-8 weeks',
          instructions: 'Take 30 minutes before breakfast on empty stomach',
          contraindications: ['Hypersensitivity to PPIs'],
          interactions: ['Clopidogrel', 'Warfarin', 'Digoxin'],
          confidence: 92,
          reasoning: 'Proton pump inhibitor for acid suppression and gastric protection',
          category: 'first-line'
        });
      }
      
      if (treatment.recommendation.toLowerCase().includes('anticoagul')) {
        suggestions.push({
          id: 'rx-3',
          medication: 'Apixaban',
          dosage: '5mg',
          frequency: 'Twice daily',
          duration: 'Long-term',
          instructions: 'Take with or without food, maintain consistent timing',
          contraindications: ['Active bleeding', 'Severe liver disease'],
          interactions: ['Strong CYP3A4 inhibitors', 'Rifampin'],
          confidence: 88,
          reasoning: 'Direct oral anticoagulant for stroke prevention in atrial fibrillation',
          category: 'first-line'
        });
      }
    } else if (treatment.category === 'referral') {
      // For referrals, suggest supportive medications
      suggestions.push({
        id: 'rx-4',
        medication: 'Acetaminophen',
        dosage: '650mg',
        frequency: 'Every 6 hours as needed',
        duration: 'As needed',
        instructions: 'Do not exceed 3000mg per day, avoid alcohol',
        contraindications: ['Severe liver disease', 'Acetaminophen allergy'],
        interactions: ['Warfarin (monitor INR)', 'Chronic alcohol use'],
        confidence: 85,
        reasoning: 'Safe analgesic for symptomatic relief while awaiting specialist consultation',
        category: 'alternative'
      });
    }
    
    // Add a general suggestion if no specific ones were generated
    if (suggestions.length === 0) {
      suggestions.push({
        id: 'rx-general',
        medication: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'Every 8 hours as needed',
        duration: 'Short-term (3-5 days)',
        instructions: 'Take with food, discontinue if GI symptoms occur',
        contraindications: ['GI bleeding', 'Kidney disease', 'Heart failure'],
        interactions: ['ACE inhibitors', 'Warfarin', 'Lithium'],
        confidence: 75,
        reasoning: 'NSAID for anti-inflammatory and analgesic effects',
        category: 'alternative'
      });
    }
    
    return suggestions;
  };

  // const parsePrescriptionResponse = (aiResponse: string): PrescriptionSuggestion[] => {
  //   // This method is no longer used but kept for future AI integration
  //   const mockSuggestions: PrescriptionSuggestion[] = [];
  //   return mockSuggestions;
  // };

  const handlePrescriptionSubmit = () => {
    if (selectedPrescriptionTab === 0) {
      // AI suggestions - check if any are selected
      const hasSelections = prescriptionSuggestions.some(s => s.id); // Add selection logic
      if (!hasSelections) {
        setNotification({
          message: 'Please select at least one prescription suggestion.',
          type: 'warning'
        });
        return;
      }
    } else {
      // Custom prescription
      if (!customPrescription.medication || !customPrescription.dosage) {
        setNotification({
          message: 'Please fill in at least medication and dosage.',
          type: 'warning'
        });
        return;
      }
    }
    
    setShowPrescriptionDialog(false);
    setNotification({
      message: 'Prescription saved successfully.',
      type: 'success'
    });
    
    // Reset form
    setCustomPrescription({
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      notes: ''
    });
    setSelectedPrescriptionTab(0);
  };

  const handleClosePrescriptionDialog = () => {
    setShowPrescriptionDialog(false);
    setPrescriptionSuggestions([]);
    setCustomPrescription({
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      notes: ''
    });
    setSelectedPrescriptionTab(0);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            AI Clinical Analysis
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Visit #{visitId} • {analysisData.patientContext.chiefComplaint}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={isRunningAnalysis ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
            onClick={handleRunAnalysis}
            disabled={isRunningAnalysis}
          >
            {isRunningAnalysis ? 'Analyzing...' : 'Re-run Analysis'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<TranscriptionIcon />}
            onClick={() => navigate(ROUTES.TRANSCRIPT_UPLOAD.replace(':id', visitId!))}
          >
            View Transcript
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => setShowExportDialog(true)}
          >
            Export
          </Button>
        </Stack>
      </Box>

      {/* Analysis Progress */}
      {isRunningAnalysis && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AutoAwesomeIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Running AI Analysis...</Typography>
            </Box>
            <LinearProgress variant="determinate" value={analysisProgress} sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Processing clinical data and generating insights...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Notification */}
      {notification && (
        <Alert
          severity={notification.type}
          onClose={() => setNotification(null)}
          sx={{ mb: 2 }}
        >
          {notification.message}
        </Alert>
      )}

      {/* Quick Stats Dashboard */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h4">{(analysisData.confidenceScore * 100).toFixed(0)}%</Typography>
              <Typography variant="body2">Confidence</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarningIcon color="warning" sx={{ fontSize: 40 }} />
              <Typography variant="h4">{analysisData.metrics.criticalConcerns}</Typography>
              <Typography variant="body2">Critical Alerts</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <MedicalServicesIcon color="secondary" sx={{ fontSize: 40 }} />
              <Typography variant="h4">{analysisData.metrics.totalSymptoms}</Typography>
              <Typography variant="body2">Symptoms</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PsychologyIcon color="info" sx={{ fontSize: 40 }} />
              <Typography variant="h4">{analysisData.diagnoses.length}</Typography>
              <Typography variant="body2">Diagnoses</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <HospitalIcon color="success" sx={{ fontSize: 40 }} />
              <Typography variant="h4">{analysisData.treatments.length}</Typography>
              <Typography variant="body2">Treatments</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TimelineIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h4">{analysisData.processingTime.toFixed(2)}s</Typography>
              <Typography variant="body2">Process Time</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTabValue} onChange={(_, newValue) => setCurrentTabValue(newValue)}>
          <Tab label="Clinical Analysis" icon={<AssessmentIcon />} />
          <Tab label="Symptoms & Findings" icon={<MedicalServicesIcon />} />
          <Tab label="Differential Diagnosis" icon={<PsychologyIcon />} />
          <Tab label="Treatment Plan" icon={<HospitalIcon />} />
          <Tab label="Critical Alerts" icon={<WarningIcon />} />
          <Tab label="Transcript Analysis" icon={<TranscriptionIcon />} />
          <Tab label="Review & Quality" icon={<CommentIcon />} />
        </Tabs>
      </Box>

      {/* Clinical Analysis Tab */}
      <TabPanel value={currentTabValue} index={0}>
        <Grid container spacing={3}>
          {/* Analysis Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analysis Summary
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip
                    label={`${analysisData.status.toUpperCase()}`}
                    color="success"
                    icon={<CheckCircleIcon />}
                  />
                  <Chip
                    label={`AI Model: ${analysisData.aiModel}`}
                    variant="outlined"
                  />
                  <Chip
                    label={`Processed: ${analysisData.analysisDate.toLocaleDateString()}`}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body1" paragraph>
                  The AI analysis has processed the clinical encounter and identified key symptoms, 
                  potential diagnoses, and recommended treatment approaches. The analysis shows 
                  {analysisData.confidenceScore >= 0.8 ? ' high' : ' moderate'} confidence in the findings.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Patient Context */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Patient Context
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Age" secondary={`${analysisData.patientContext.age} years old`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Gender" secondary={analysisData.patientContext.gender} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Chief Complaint" secondary={analysisData.patientContext.chiefComplaint} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Language" secondary={analysisData.patientContext.primaryLanguage} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Analysis Quality Metrics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analysis Quality
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Overall Confidence
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={analysisData.confidenceScore * 100} 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2">
                    {(analysisData.confidenceScore * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="High Confidence Findings" 
                      secondary={`${analysisData.metrics.highConfidenceFindings} of ${analysisData.metrics.totalSymptoms}`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Processing Time" 
                      secondary={`${analysisData.processingTime.toFixed(2)} seconds`} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Symptoms & Findings Tab */}
      <TabPanel value={currentTabValue} index={1}>
        <Grid container spacing={3}>
          {analysisData.symptoms.map((symptom) => (
            <Grid item xs={12} md={6} key={symptom.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{symptom.name}</Typography>
                    <Box>
                      <Chip
                        label={symptom.severity}
                        size="small"
                        color={getSeverityColor(symptom.severity) as any}
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`${(symptom.confidence * 100).toFixed(0)}% confident`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Duration" secondary={symptom.duration} />
                    </ListItem>
                    {(symptom as any).location && (
                      <ListItem>
                        <ListItemText primary="Location" secondary={(symptom as any).location} />
                      </ListItem>
                    )}
                    {symptom.quality && (
                      <ListItem>
                        <ListItemText primary="Quality" secondary={symptom.quality} />
                      </ListItem>
                    )}
                    <ListItem>
                      <ListItemText 
                        primary="Associated Factors" 
                        secondary={symptom.associatedFactors.join(', ')} 
                      />
                    </ListItem>
                  </List>
                  
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Source:</strong> {symptom.sourceText}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewSymptomDetails(symptom.id)}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Differential Diagnosis Tab */}
      <TabPanel value={currentTabValue} index={2}>
        {analysisData.diagnoses.map((diagnosis) => (
          <Accordion key={diagnosis.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">{diagnosis.condition}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ICD-10: {diagnosis.icd10Code}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`${(diagnosis.probability * 100).toFixed(0)}% probability`}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={diagnosis.severity}
                    color={getSeverityColor(diagnosis.severity) as any}
                    size="small"
                  />
                  <Chip
                    label={diagnosis.urgency}
                    color={diagnosis.urgency === 'emergent' ? 'error' : diagnosis.urgency === 'urgent' ? 'warning' : 'default'}
                    size="small"
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDiagnosisDetails(diagnosis.id);
                    }}
                    sx={{ ml: 1 }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="body1" paragraph>
                    <strong>Clinical Reasoning:</strong> {diagnosis.reasoning}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Supporting Evidence
                  </Typography>
                  <List dense>
                    {diagnosis.supportingEvidence.map((evidence, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={evidence} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Against Evidence
                  </Typography>
                  <List dense>
                    {diagnosis.againstEvidence.map((evidence, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ErrorIcon color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={evidence} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Additional Tests Needed
                  </Typography>
                  <List dense>
                    {diagnosis.additionalTestsNeeded.map((test, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <MedicalServicesIcon color="info" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={test} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </TabPanel>

      {/* Treatment Plan Tab */}
      <TabPanel value={currentTabValue} index={3}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Recommendation</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Timeframe</TableCell>
                <TableCell>Evidence Level</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analysisData.treatments.map((treatment) => (
                <TableRow key={treatment.id}>
                  <TableCell>
                    <Chip label={treatment.category} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{treatment.recommendation}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={treatment.priority}
                      size="small"
                      color={getPriorityColor(treatment.priority) as any}
                    />
                  </TableCell>
                  <TableCell>{treatment.timeframe}</TableCell>
                  <TableCell>
                    <Chip
                      label={`Level ${treatment.evidenceLevel}`}
                      size="small"
                      color={getEvidenceColor(treatment.evidenceLevel) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small"
                        onClick={() => handleViewTreatmentDetails(treatment.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Critical Alerts Tab */}
      <TabPanel value={currentTabValue} index={4}>
        <Grid container spacing={3}>
          {analysisData.concerns.map((concern) => (
            <Grid item xs={12} key={concern.id}>
              <Alert 
                severity={concern.severity === 'critical' ? 'error' : concern.severity === 'high' ? 'warning' : 'info'}
                action={
                  concern.requiresImmediateAction && (
                    <Button 
                      color="inherit" 
                      size="small"
                      onClick={() => handleActNow(concern.id)}
                    >
                      ACT NOW
                    </Button>
                  )
                }
              >
                <Typography variant="h6" gutterBottom>
                  {concern.type.replace('_', ' ').toUpperCase()}: {concern.message}
                </Typography>
                <Typography variant="body2">
                  <strong>Recommendation:</strong> {concern.recommendation}
                </Typography>
                {concern.requiresImmediateAction && (
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', color: 'error.main' }}>
                    ⚠️ REQUIRES IMMEDIATE ACTION
                  </Typography>
                )}
              </Alert>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Transcript Analysis Tab */}
      <TabPanel value={currentTabValue} index={5}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Transcript Quality
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Overall Confidence" 
                      secondary={`${(transcriptData.confidence * 100).toFixed(1)}%`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Duration" 
                      secondary={`${transcriptData.duration} minutes`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Speakers Detected" 
                      secondary={transcriptData.speakerCount} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Processed" 
                      secondary={transcriptData.processedAt.toLocaleString()} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Full Transcript
                </Typography>
                <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto', bgcolor: 'background.default' }}>
                  <Typography variant="body2" component="pre" style={{ whiteSpace: 'pre-wrap' }}>
                    {transcriptData.content}
                  </Typography>
                </Paper>
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(ROUTES.TRANSCRIPT_UPLOAD.replace(':id', visitId!))}
                  >
                    Edit Transcript
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportTranscript}
                  >
                    Export Transcript
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Review & Quality Tab */}
      <TabPanel value={currentTabValue} index={6}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analysis Review
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" gutterBottom>
                    Rate the quality of this AI analysis:
                  </Typography>
                  <Rating
                    value={userRating}
                    onChange={(_, newValue) => setUserRating(newValue)}
                    size="large"
                  />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Review Notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add your review comments..."
                  variant="outlined"
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveReview}
                  >
                    Save Review
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ThumbUpIcon />}
                    onClick={handleApproveAnalysis}
                  >
                    Approve Analysis
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quality Metrics
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Clinical Accuracy" 
                      secondary="High confidence findings validated"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <HealthAndSafetyIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Safety Checks" 
                      secondary="All critical alerts identified"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Completeness" 
                      secondary="Comprehensive differential diagnosis"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Treatment Details Modal */}
      <Dialog 
        open={!!selectedTreatment} 
        onClose={() => setSelectedTreatment(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Treatment Details: {selectedTreatment?.recommendation || 'Unknown Treatment'}
        </DialogTitle>
        <DialogContent>
          {selectedTreatment && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>General Information</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Category" 
                      secondary={selectedTreatment.category}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Priority" 
                      secondary={
                        <Chip 
                          label={selectedTreatment.priority} 
                          color={getPriorityColor(selectedTreatment.priority) as any}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Timeframe" 
                      secondary={selectedTreatment.timeframe}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Evidence Level" 
                      secondary={
                        <Chip 
                          label={`Level ${selectedTreatment.evidenceLevel}`}
                          color={getEvidenceColor(selectedTreatment.evidenceLevel) as any}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Clinical Details</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Expected Outcome:</Typography>
                  <Typography variant="body2">{selectedTreatment.expectedOutcome}</Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Contraindications:</Typography>
                  {selectedTreatment.contraindications.map((item, index) => (
                    <Chip key={index} label={item} size="small" color="error" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Alternatives:</Typography>
                  {selectedTreatment.alternatives.map((item, index) => (
                    <Chip key={index} label={item} size="small" color="info" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTreatment(null)}>Close</Button>
          <Button 
            variant="contained"
            onClick={() => selectedTreatment && handlePrescribeTreatment(selectedTreatment)}
          >
            Prescribe Treatment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Prescription Dialog */}
      <Dialog 
        open={showPrescriptionDialog} 
        onClose={handleClosePrescriptionDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Prescription Suggestions
          {selectedTreatment && (
            <Typography variant="body2" color="text.secondary">
              Treatment: {selectedTreatment.recommendation}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={selectedPrescriptionTab} onChange={(_, newValue) => setSelectedPrescriptionTab(newValue)}>
              <Tab label="AI Suggestions" />
              <Tab label="Custom Prescription" />
            </Tabs>
          </Box>
          
          {/* AI Suggestions Tab */}
          {selectedPrescriptionTab === 0 && (
            <Box>
              {isGeneratingPrescriptions ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }}>Generating prescription suggestions...</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {prescriptionSuggestions.map((suggestion) => (
                    <Grid item xs={12} key={suggestion.id}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6">{suggestion.medication}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {suggestion.dosage} • {suggestion.frequency} • {suggestion.duration}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label={suggestion.category} 
                              color={suggestion.category === 'first-line' ? 'success' : suggestion.category === 'second-line' ? 'warning' : 'default'} 
                              size="small" 
                            />
                            <Chip 
                              label={`${suggestion.confidence}% confidence`} 
                              color="primary" 
                              size="small" 
                            />
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" gutterBottom>
                          <strong>Instructions:</strong> {suggestion.instructions}
                        </Typography>
                        
                        <Typography variant="body2" gutterBottom>
                          <strong>Reasoning:</strong> {suggestion.reasoning}
                        </Typography>
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            <strong>Contraindications:</strong>
                          </Typography>
                          <Box sx={{ mb: 1 }}>
                            {suggestion.contraindications.map((contra, index) => (
                              <Chip key={index} label={contra} size="small" color="error" sx={{ mr: 1, mb: 1 }} />
                            ))}
                          </Box>
                          
                          <Typography variant="body2" gutterBottom>
                            <strong>Drug Interactions:</strong>
                          </Typography>
                          <Box>
                            {suggestion.interactions.map((interaction, index) => (
                              <Chip key={index} label={interaction} size="small" color="warning" sx={{ mr: 1, mb: 1 }} />
                            ))}
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                  
                  {prescriptionSuggestions.length === 0 && !isGeneratingPrescriptions && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        No prescription suggestions available. Please use the Custom Prescription tab.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>
          )}
          
          {/* Custom Prescription Tab */}
          {selectedPrescriptionTab === 1 && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Medication"
                    value={customPrescription.medication}
                    onChange={(e) => setCustomPrescription(prev => ({ ...prev, medication: e.target.value }))}
                    placeholder="e.g., Aspirin"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Dosage"
                    value={customPrescription.dosage}
                    onChange={(e) => setCustomPrescription(prev => ({ ...prev, dosage: e.target.value }))}
                    placeholder="e.g., 81mg"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Frequency"
                    value={customPrescription.frequency}
                    onChange={(e) => setCustomPrescription(prev => ({ ...prev, frequency: e.target.value }))}
                    placeholder="e.g., Once daily"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Duration"
                    value={customPrescription.duration}
                    onChange={(e) => setCustomPrescription(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 30 days"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Instructions"
                    value={customPrescription.instructions}
                    onChange={(e) => setCustomPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="e.g., Take with food to reduce stomach irritation"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Notes"
                    value={customPrescription.notes}
                    onChange={(e) => setCustomPrescription(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes or considerations"
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrescriptionDialog}>Cancel</Button>
          <Button variant="contained" onClick={handlePrescriptionSubmit}>
            Save Prescription
          </Button>
        </DialogActions>
      </Dialog>

      {/* Symptom Details Modal */}
      <Dialog 
        open={!!selectedSymptom} 
        onClose={() => setSelectedSymptom(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Symptom Details: {selectedSymptom?.name}
        </DialogTitle>
        <DialogContent>
          {selectedSymptom && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Severity:</Typography>
                  <Chip 
                    label={selectedSymptom.severity} 
                    color={getSeverityColor(selectedSymptom.severity) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Confidence:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={selectedSymptom.confidence * 100} 
                      sx={{ flexGrow: 1, mr: 1 }}
                    />
                    <Typography variant="body2">{(selectedSymptom.confidence * 100).toFixed(0)}%</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Duration:</Typography>
                  <Typography variant="body2">{selectedSymptom.duration}</Typography>
                </Grid>
                {selectedSymptom.location && (
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Location:</Typography>
                    <Typography variant="body2">{selectedSymptom.location}</Typography>
                  </Grid>
                )}
                {selectedSymptom.quality && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Quality:</Typography>
                    <Typography variant="body2">{selectedSymptom.quality}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Associated Factors:</Typography>
                  <Box>
                    {selectedSymptom.associatedFactors.map((factor, index) => (
                      <Chip key={index} label={factor} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Source Text:</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2" style={{ fontStyle: 'italic' }}>
                      "{selectedSymptom.sourceText}"
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSymptom(null)}>Close</Button>
          <Button variant="contained">Add to Assessment</Button>
        </DialogActions>
      </Dialog>

      {/* Diagnosis Details Modal */}
      <Dialog 
        open={!!selectedDiagnosis} 
        onClose={() => setSelectedDiagnosis(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Diagnosis Details: {selectedDiagnosis?.condition}
        </DialogTitle>
        <DialogContent>
          {selectedDiagnosis && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Assessment</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="ICD-10 Code" 
                        secondary={selectedDiagnosis.icd10Code}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Probability" 
                        secondary={`${(selectedDiagnosis.probability * 100).toFixed(1)}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Severity" 
                        secondary={
                          <Chip 
                            label={selectedDiagnosis.severity} 
                            color={getSeverityColor(selectedDiagnosis.severity) as any}
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Urgency" 
                        secondary={selectedDiagnosis.urgency}
                      />
                    </ListItem>
                  </List>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Reasoning</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2">
                      {selectedDiagnosis.reasoning}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Supporting Evidence</Typography>
                  <List dense>
                    {selectedDiagnosis.supportingEvidence.map((evidence, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={evidence} />
                      </ListItem>
                    ))}
                  </List>
                  
                  {selectedDiagnosis.againstEvidence.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Against Evidence</Typography>
                      <List dense>
                        {selectedDiagnosis.againstEvidence.map((evidence, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <ErrorIcon color="error" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={evidence} />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Additional Tests Needed</Typography>
                  <List dense>
                    {selectedDiagnosis.additionalTestsNeeded.map((test, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <MedicalServicesIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={test} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDiagnosis(null)}>Close</Button>
          <Button variant="contained">Add to Plan</Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)}>
        <DialogTitle>Export Analysis Report</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Export Format</InputLabel>
            <Select defaultValue="pdf" label="Export Format">
              <MenuItem value="pdf">PDF Report</MenuItem>
              <MenuItem value="json">JSON Data</MenuItem>
              <MenuItem value="csv">CSV Summary</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIAnalysisPage; 