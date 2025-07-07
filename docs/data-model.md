# Data Model Documentation 📊

*Focused data model for the Pre-Examination Charting Agent - Visit Transcript Analysis & Diagnosis Assistance*

---

## Overview

This document outlines the focused data model for the Pre-Examination Charting Agent, designed specifically for analyzing patient visit transcripts to assist healthcare providers with diagnosis and treatment recommendations. The system focuses on transcript analysis and AI-powered insights rather than comprehensive medical record management.

**Key Scope**: This system primarily processes visit recordings/transcripts and provides diagnostic assistance. It does not manage sensitive medical data like vitals, test results, or comprehensive medical records.

## Core Entities

### 1. User Management

#### Users Collection
```typescript
interface User {
  id: string;                    // Firebase Auth UID
  email: string;                 // Login email
  displayName: string;           // Full name
  role: UserRole;               // doctor | nurse | admin
  department?: string;           // e.g., "Emergency", "ICU", "Med-Surg"
  licenseNumber?: string;        // Professional license
  isActive: boolean;            // Account status
  lastLogin?: Timestamp;         // Last login time
  preferences: UserPreferences;  // UI/workflow preferences
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

enum UserRole {
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  ADMIN = 'admin'
}

interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;              // e.g., 'en', 'es'
  autoSave: boolean;
  notificationsEnabled: boolean;
  aiAssistanceLevel: 'basic' | 'detailed' | 'comprehensive';
}
```

### 2. Patient Management (Basic Info Only)

#### Patients Collection
```typescript
interface Patient {
  id: string;                    // System-generated patient ID
  demographics: PatientDemographics;
  basicHistory: BasicMedicalHistory;
  photo?: string;                // Photo URL/base64
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;             // User ID who created record
}

interface PatientDemographics {
  firstName: string;
  lastName: string;
  dateOfBirth: Timestamp;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  phone?: string;
  preferredLanguage?: string;
}

interface BasicMedicalHistory {
  knownAllergies: string[];      // Simple list from patient conversation
  currentMedications: string[];  // Simple list from patient conversation
  knownConditions: string[];     // Simple list from patient conversation
  notes?: string;                // Any additional notes from conversation
}
```

### 3. Visit Management

#### Visits Collection
```typescript
interface Visit {
  id: string;                    // System-generated visit ID
  patientId: string;             // Reference to patient
  type: VisitType;
  status: VisitStatus;
  scheduledDateTime?: Timestamp;
  startTime?: Timestamp;
  endTime?: Timestamp;
  attendingProvider: string;     // User ID
  department: string;
  chiefComplaint?: string;       // Primary reason for visit
  visitSummary?: string;         // Brief summary
  transcript?: VisitTranscript;  // Main data source
  aiAnalysis?: AIAnalysis;       // AI-generated insights
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

enum VisitType {
  CONSULTATION = 'consultation',
  FOLLOW_UP = 'follow_up',
  URGENT_CARE = 'urgent_care',
  TELEMEDICINE = 'telemedicine'
}

enum VisitStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

interface VisitTranscript {
  id: string;
  rawTranscript: string;         // Full transcript text
  structured: TranscriptSegment[];
  audioFile?: string;            // Audio file reference
  transcriptionMethod: 'manual' | 'ai' | 'voice_recognition';
  confidenceScore?: number;      // Transcription accuracy (0-1)
  language: string;
  duration?: number;             // Duration in seconds
  speakers: Speaker[];
  createdAt: Timestamp;
  processedAt?: Timestamp;
}

interface TranscriptSegment {
  id: string;
  speaker: 'patient' | 'provider' | 'other';
  timestamp: number;             // Seconds from start
  text: string;
  confidence?: number;           // Confidence for this segment
  tags?: string[];               // e.g., ['symptom', 'history', 'medication']
}

interface Speaker {
  id: string;
  role: 'patient' | 'provider' | 'other';
  name?: string;
}
```

### 4. AI Analysis & Diagnosis Assistance

#### AIAnalysis Collection
```typescript
interface AIAnalysis {
  id: string;                    // System-generated analysis ID
  visitId: string;               // Reference to visit
  patientId: string;             // Reference to patient
  status: AnalysisStatus;
  extractedSymptoms: ExtractedSymptom[];
  patientHistory: ExtractedHistory;
  differentialDiagnosis: DiagnosisOption[];
  treatmentRecommendations: TreatmentRecommendation[];
  flaggedConcerns: ConcernFlag[];
  followUpRecommendations: FollowUpRecommendation[];
  confidenceScore: number;       // Overall AI confidence (0-1)
  processingTime: number;        // Processing time in seconds
  aiModel: string;               // AI model used
  createdAt: Timestamp;
  reviewedBy?: string;           // User ID who reviewed
  reviewedAt?: Timestamp;
  reviewNotes?: string;
}

enum AnalysisStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REVIEWED = 'reviewed',
  ERROR = 'error'
}

interface ExtractedSymptom {
  id: string;
  symptom: string;
  severity?: 'mild' | 'moderate' | 'severe';
  duration?: string;
  frequency?: string;
  context?: string;              // When/how it occurs
  sourceText: string;            // Original text from transcript
  confidence: number;            // AI confidence for this extraction
}

interface ExtractedHistory {
  medications: string[];
  allergies: string[];
  pastConditions: string[];
  familyHistory: string[];
  socialHistory: string[];
  reviewOfSystems: string[];
}

interface DiagnosisOption {
  id: string;
  condition: string;
  icd10Code?: string;
  probability: number;           // Likelihood (0-1)
  supportingEvidence: string[];  // Symptoms/findings that support this
  againstEvidence: string[];     // Factors that argue against this
  additionalTestsNeeded: string[];
  reasoning: string;             // AI reasoning for this diagnosis
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface TreatmentRecommendation {
  id: string;
  category: 'medication' | 'procedure' | 'lifestyle' | 'referral' | 'monitoring';
  recommendation: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timeframe?: string;            // When to implement
  contraindications: string[];
  alternatives: string[];
  monitoringRequired: string[];
}

interface ConcernFlag {
  id: string;
  type: 'red_flag' | 'drug_interaction' | 'allergy_concern' | 'urgent_referral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
  sourceText?: string;           // Supporting text from transcript
  requiresAttention: boolean;
}

interface FollowUpRecommendation {
  id: string;
  type: 'appointment' | 'test' | 'monitoring' | 'referral';
  description: string;
  timeframe: string;             // e.g., "1-2 weeks", "immediately"
  specialty?: string;            // For referrals
  priority: 'routine' | 'urgent' | 'stat';
}
```

### 5. Documentation & Notes

#### VisitNotes Collection
```typescript
interface VisitNote {
  id: string;                    // System-generated note ID
  visitId: string;               // Reference to visit
  patientId: string;             // Reference to patient
  type: NoteType;
  status: NoteStatus;
  content: string;               // Note content
  author: string;                // User ID
  aiGenerated: boolean;          // Whether AI-generated
  aiSourceData?: string[];       // References to transcript segments
  template?: string;             // Template used
  version: number;               // Version number for revisions
  tags: string[];               // For categorization
  createdAt: Timestamp;
  updatedAt: Timestamp;
  signedAt?: Timestamp;
}

enum NoteType {
  SOAP = 'soap',                 // Subjective, Objective, Assessment, Plan
  PROGRESS = 'progress',
  ASSESSMENT = 'assessment',
  PLAN = 'plan',
  SUMMARY = 'summary'
}

enum NoteStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  SIGNED = 'signed'
}
```

### 6. System Configuration

#### Settings Collection
```typescript
interface SystemSettings {
  id: string;                    // System-generated settings ID
  category: SettingsCategory;
  key: string;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  lastModifiedBy: string;        // User ID
  lastModifiedAt: Timestamp;
}

enum SettingsCategory {
  AI_ANALYSIS = 'ai_analysis',
  TRANSCRIPTION = 'transcription',
  NOTIFICATIONS = 'notifications',
  SECURITY = 'security'
}
```

#### AuditLogs Collection
```typescript
interface AuditLog {
  id: string;                    // System-generated audit ID
  userId?: string;               // User who performed action
  action: AuditAction;
  entityType: string;            // e.g., "visit", "transcript", "analysis"
  entityId: string;              // ID of the affected entity
  ipAddress?: string;
  timestamp: Timestamp;
  metadata?: any;                // Additional context
}

enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  TRANSCRIPT_UPLOAD = 'transcript_upload',
  AI_ANALYSIS = 'ai_analysis'
}
```

## Relationships and Constraints

### Entity Relationships
- **Users** → **Visits** (attending provider)
- **Patients** → **Visits** (one-to-many)
- **Visits** → **VisitTranscript** (one-to-one)
- **Visits** → **AIAnalysis** (one-to-one)
- **Visits** → **VisitNotes** (one-to-many)

### Data Validation Rules
- All visit transcripts must have associated visits
- AI analysis requires completed transcript processing
- Patient demographics must include required fields
- Notes must have valid authors
- Audit logging for all data access

### Security Constraints
- PHI data encrypted at rest and in transit
- Role-based access control for all data
- Audit logging for all data access
- Transcript data anonymized for AI processing when possible
- No storage of raw patient identifiers in AI processing logs

## Data Storage Strategy

### Firebase Firestore Collections
```
/users/{userId}
/patients/{patientId}
/visits/{visitId}
/visit-notes/{noteId}
/ai-analysis/{analysisId}
/settings/{settingId}
/audit-logs/{auditId}
```

### Indexing Strategy
- **Patients**: firstName, lastName, dateOfBirth
- **Visits**: patientId, attendingProvider, status, createdAt
- **AIAnalysis**: visitId, patientId, status, createdAt
- **VisitNotes**: visitId, patientId, author, type, createdAt
- **AuditLogs**: userId, entityType, action, timestamp

### Data Processing Pipeline
1. **Transcript Upload**: Audio/text uploaded to visit
2. **AI Processing**: Extract symptoms, history, generate analysis
3. **Provider Review**: Healthcare provider reviews AI recommendations
4. **Documentation**: Generate visit notes based on analysis
5. **Audit Trail**: Log all access and modifications

This focused data model centers around visit transcript analysis while maintaining HIPAA compliance and providing actionable diagnostic assistance to healthcare providers. 