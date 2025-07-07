// User and Authentication Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'doctor' | 'nurse' | 'admin';
  department?: string;
  licenseNumber?: string;
  isActive: boolean;
  lastLogin?: Date;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  autoSave: boolean;
  notificationsEnabled: boolean;
  aiAssistanceLevel: 'basic' | 'detailed' | 'comprehensive';
}

// Patient Types (Basic Info Only)
export interface Patient {
  id: string;
  demographics: PatientDemographics;
  basicHistory: BasicMedicalHistory;
  photo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface PatientDemographics {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  phone?: string;
  preferredLanguage?: string;
}

export interface BasicMedicalHistory {
  knownAllergies: string[];
  currentMedications: string[];
  knownConditions: string[];
  notes?: string;
}

// Visit Types
export interface Visit {
  id: string;
  patientId: string;
  type: 'consultation' | 'follow_up' | 'urgent_care' | 'telemedicine';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDateTime?: Date;
  startTime?: Date;
  endTime?: Date;
  attendingProvider: string;
  department: string;
  chiefComplaint?: string;
  visitSummary?: string;
  transcript?: VisitTranscript;
  aiAnalysis?: AIAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisitTranscript {
  id: string;
  rawTranscript: string;
  structured: TranscriptSegment[];
  audioFile?: string;
  transcriptionMethod: 'manual' | 'ai' | 'voice_recognition';
  confidenceScore?: number;
  language: string;
  duration?: number;
  speakers: Speaker[];
  createdAt: Date;
  processedAt?: Date;
}

export interface TranscriptSegment {
  id: string;
  speaker: 'patient' | 'provider' | 'other';
  timestamp: number;
  text: string;
  confidence?: number;
  tags?: string[];
}

export interface Speaker {
  id: string;
  role: 'patient' | 'provider' | 'other';
  name?: string;
}

// AI Analysis Types
export interface AIAnalysis {
  id: string;
  visitId: string;
  patientId: string;
  status: 'pending' | 'processing' | 'completed' | 'reviewed' | 'error';
  extractedSymptoms: ExtractedSymptom[];
  patientHistory: ExtractedHistory;
  differentialDiagnosis: DiagnosisOption[];
  treatmentRecommendations: TreatmentRecommendation[];
  flaggedConcerns: ConcernFlag[];
  followUpRecommendations: FollowUpRecommendation[];
  confidenceScore: number;
  processingTime: number;
  aiModel: string;
  createdAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

export interface ExtractedSymptom {
  id: string;
  symptom: string;
  severity?: 'mild' | 'moderate' | 'severe';
  duration?: string;
  frequency?: string;
  context?: string;
  sourceText: string;
  confidence: number;
}

export interface ExtractedHistory {
  medications: string[];
  allergies: string[];
  pastConditions: string[];
  familyHistory: string[];
  socialHistory: string[];
  reviewOfSystems: string[];
}

export interface DiagnosisOption {
  id: string;
  condition: string;
  icd10Code?: string;
  probability: number;
  supportingEvidence: string[];
  againstEvidence: string[];
  additionalTestsNeeded: string[];
  reasoning: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface TreatmentRecommendation {
  id: string;
  category: 'medication' | 'procedure' | 'lifestyle' | 'referral' | 'monitoring';
  recommendation: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timeframe?: string;
  contraindications: string[];
  alternatives: string[];
  monitoringRequired: string[];
}

export interface ConcernFlag {
  id: string;
  type: 'red_flag' | 'drug_interaction' | 'allergy_concern' | 'urgent_referral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
  sourceText?: string;
  requiresAttention: boolean;
}

export interface FollowUpRecommendation {
  id: string;
  type: 'appointment' | 'test' | 'monitoring' | 'referral';
  description: string;
  timeframe: string;
  specialty?: string;
  priority: 'routine' | 'urgent' | 'stat';
}

// Visit Notes Types
export interface VisitNote {
  id: string;
  visitId: string;
  patientId: string;
  type: 'soap' | 'progress' | 'assessment' | 'plan' | 'summary';
  status: 'draft' | 'pending_review' | 'signed';
  content: string;
  author: string;
  aiGenerated: boolean;
  aiSourceData?: string[];
  template?: string;
  version: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  signedAt?: Date;
}

// Application State Types
export interface AppState {
  user: User | null;
  currentPatient: Patient | null;
  currentVisit: Visit | null;
  isLoading: boolean;
  error: string | null;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  requiredRole?: User['role'][];
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'file';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  accept?: string; // For file inputs
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// File Upload Types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

// System Settings Types
export interface SystemSettings {
  id: string;
  category: 'ai_analysis' | 'transcription' | 'notifications' | 'security';
  key: string;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  lastModifiedBy: string;
  lastModifiedAt: Date;
} 