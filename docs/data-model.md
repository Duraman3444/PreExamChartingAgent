# Data Model Documentation 📊

*Comprehensive data model for the Pre-Examination Charting Agent focused on patient visit management.*

---

## Overview

This document outlines the complete data model for the Pre-Examination Charting Agent, designed specifically for managing patient visits from pre-examination screening through provider documentation. The model focuses on core visit workflows without attempting to manage hospital-controlled systems like laboratory tests or diagnostic equipment.

## Core Entities

### 1. User Management

#### Users Collection
```typescript
interface User {
  id: string;                    // Firebase Auth UID
  email: string;                 // Login email
  displayName: string;           // Full name
  role: UserRole;               // nurse | doctor | admin
  department?: string;           // e.g., "Emergency", "ICU", "Med-Surg"
  licenseNumber?: string;        // Professional license
  isActive: boolean;            // Account status
  lastLogin?: Timestamp;         // Last login time
  preferences: UserPreferences;  // UI/workflow preferences
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

enum UserRole {
  NURSE = 'nurse',
  DOCTOR = 'doctor', 
  ADMIN = 'admin'
}

interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;              // e.g., 'en', 'es'
  vitalsUnits: 'metric' | 'imperial';
  autoSave: boolean;
  notificationsEnabled: boolean;
}
```

### 2. Patient Management

#### Patients Collection
```typescript
interface Patient {
  id: string;                    // System-generated patient ID
  mrn?: string;                  // Medical Record Number (if available)
  demographics: PatientDemographics;
  medicalHistory: MedicalHistory;
  emergencyContacts: EmergencyContact[];
  insurance?: InsuranceInfo;
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
  email?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferredLanguage?: string;
}

interface MedicalHistory {
  allergies: Allergy[];
  medications: Medication[];
  conditions: MedicalCondition[];
  socialHistory: SocialHistory;
  familyHistory: FamilyHistory[];
}

interface Allergy {
  id: string;
  allergen: string;              // Name of allergen
  type: 'drug' | 'food' | 'environmental' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  reaction?: string;             // Description of reaction
  onsetDate?: Timestamp;
  notes?: string;
  isActive: boolean;
}

interface Medication {
  id: string;
  name: string;                  // Generic or brand name
  dosage: string;                // e.g., "10mg"
  frequency: string;             // e.g., "twice daily"
  route: string;                 // e.g., "oral", "IV"
  startDate?: Timestamp;
  endDate?: Timestamp;
  prescriber?: string;
  indication?: string;           // Why prescribed
  isActive: boolean;
  notes?: string;
}

interface MedicalCondition {
  id: string;
  condition: string;             // Condition name
  icd10Code?: string;            // ICD-10 code if available
  diagnosisDate?: Timestamp;
  status: 'active' | 'resolved' | 'chronic' | 'monitoring';
  severity?: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

interface SocialHistory {
  smokingStatus: 'never' | 'former' | 'current' | 'unknown';
  alcoholUse: 'none' | 'occasional' | 'moderate' | 'heavy' | 'unknown';
  substanceUse?: string;
  occupation?: string;
  maritalStatus?: string;
  livingArrangement?: string;
  exerciseFrequency?: string;
}

interface FamilyHistory {
  id: string;
  relationship: string;          // e.g., "mother", "father", "sibling"
  condition: string;
  ageAtDiagnosis?: number;
  isDeceased?: boolean;
  causeOfDeath?: string;
  notes?: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

interface InsuranceInfo {
  provider: string;
  memberId: string;
  groupNumber?: string;
  planName?: string;
  effectiveDate?: Timestamp;
  expirationDate?: Timestamp;
}
```

### 3. Visit Management

#### Visits Collection
```typescript
interface Visit {
  id: string;                    // System-generated visit ID
  patientId: string;             // Reference to patient
  visitNumber?: string;          // Hospital visit number
  type: VisitType;
  status: VisitStatus;
  scheduledDateTime?: Timestamp;
  arrivalTime?: Timestamp;
  completedTime?: Timestamp;
  assignedNurse?: string;        // User ID
  attendingPhysician?: string;   // User ID
  department: string;
  chiefComplaint?: string;
  visitSummary?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

enum VisitType {
  EMERGENCY = 'emergency',
  OUTPATIENT = 'outpatient', 
  INPATIENT = 'inpatient',
  URGENT_CARE = 'urgent_care',
  FOLLOW_UP = 'follow_up'
}

enum VisitStatus {
  SCHEDULED = 'scheduled',
  CHECKED_IN = 'checked_in',
  SCREENING = 'screening',
  VITALS = 'vitals',
  PROVIDER_REVIEW = 'provider_review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}
```

### 4. Screening Management

#### Screenings Collection
```typescript
interface Screening {
  id: string;                    // System-generated screening ID
  visitId: string;               // Reference to visit
  patientId: string;             // Reference to patient
  templateId: string;            // Reference to screening template
  status: ScreeningStatus;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  responses: ScreeningResponse[];
  totalScore?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  completedBy?: string;          // User ID (for nurse-assisted)
  reviewedBy?: string;           // User ID
  reviewNotes?: string;
  flags: ScreeningFlag[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

enum ScreeningStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REVIEWED = 'reviewed',
  FLAGGED = 'flagged'
}

interface ScreeningResponse {
  questionId: string;
  questionText: string;
  responseType: 'text' | 'boolean' | 'number' | 'choice' | 'scale';
  value: any;                    // Response value
  score?: number;                // Calculated score for this response
  timestamp: Timestamp;
}

interface ScreeningFlag {
  id: string;
  type: 'high_risk' | 'missing_info' | 'inconsistent' | 'follow_up';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  questionId?: string;           // Related question if applicable
  autoGenerated: boolean;
  acknowledged: boolean;
  acknowledgedBy?: string;       // User ID
  acknowledgedAt?: Timestamp;
}
```

#### ScreeningTemplates Collection
```typescript
interface ScreeningTemplate {
  id: string;                    // System-generated template ID
  name: string;                  // Template name
  description: string;
  category: string;              // e.g., "general", "cardiac", "mental_health"
  version: string;               // Version number
  isActive: boolean;
  questions: ScreeningQuestion[];
  scoringRules: ScoringRule[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;             // User ID
}

interface ScreeningQuestion {
  id: string;
  order: number;                 // Display order
  text: string;                  // Question text
  type: 'text' | 'boolean' | 'number' | 'choice' | 'scale';
  required: boolean;
  options?: string[];            // For choice/scale questions
  minValue?: number;             // For number/scale questions
  maxValue?: number;             // For number/scale questions
  helpText?: string;
  conditionalLogic?: ConditionalLogic[];
  scoringWeight?: number;
}

interface ConditionalLogic {
  dependsOnQuestionId: string;
  condition: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
  action: 'show' | 'hide' | 'require';
}

interface ScoringRule {
  id: string;
  questionId: string;
  condition: any;                // Condition for scoring
  points: number;
  description: string;
}
```

### 5. Vitals Management

#### Vitals Collection
```typescript
interface VitalsRecord {
  id: string;                    // System-generated vitals ID
  visitId: string;               // Reference to visit
  patientId: string;             // Reference to patient
  recordedBy: string;            // User ID of nurse/provider
  recordedAt: Timestamp;
  vitals: VitalSign[];
  notes?: string;
  isValid: boolean;              // Data validation status
  flags: VitalsFlag[];
  device?: DeviceInfo;           // If recorded via device
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface VitalSign {
  type: VitalSignType;
  value: number | string;        // Numeric value or text (e.g., "irregular")
  unit: string;                  // e.g., "mmHg", "bpm", "°F"
  isNormal: boolean;
  normalRange: {
    min: number;
    max: number;
  };
  timestamp: Timestamp;
}

enum VitalSignType {
  SYSTOLIC_BP = 'systolic_bp',
  DIASTOLIC_BP = 'diastolic_bp',
  HEART_RATE = 'heart_rate',
  RESPIRATORY_RATE = 'respiratory_rate',
  TEMPERATURE = 'temperature',
  OXYGEN_SATURATION = 'oxygen_saturation',
  PAIN_SCALE = 'pain_scale',
  WEIGHT = 'weight',
  HEIGHT = 'height',
  BMI = 'bmi'
}

interface VitalsFlag {
  id: string;
  type: 'critical' | 'abnormal' | 'borderline';
  vitalType: VitalSignType;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoGenerated: boolean;
  acknowledged: boolean;
  acknowledgedBy?: string;       // User ID
  acknowledgedAt?: Timestamp;
  notificationSent: boolean;
}

interface DeviceInfo {
  deviceId?: string;
  deviceType: string;            // e.g., "monitor", "thermometer"
  manufacturer?: string;
  model?: string;
  calibrationDate?: Timestamp;
}
```

### 6. Documentation Management

#### ChartNotes Collection
```typescript
interface ChartNote {
  id: string;                    // System-generated note ID
  visitId: string;               // Reference to visit
  patientId: string;             // Reference to patient
  type: NoteType;
  status: NoteStatus;
  content: NoteContent;
  author: string;                // User ID
  coSigner?: string;             // User ID for co-signature
  templateId?: string;           // Reference to note template
  aiGenerated: boolean;          // Whether AI-generated
  aiConfidenceScore?: number;    // AI confidence (0-1)
  aiSourceData?: string[];       // References to source data
  version: number;               // Version number for revisions
  revisionHistory: NoteRevision[];
  tags: string[];               // For categorization
  createdAt: Timestamp;
  updatedAt: Timestamp;
  signedAt?: Timestamp;
}

enum NoteType {
  ASSESSMENT = 'assessment',
  HPI = 'hpi',                   // History of Present Illness
  ROS = 'ros',                   // Review of Systems
  PROGRESS = 'progress',
  DISCHARGE = 'discharge',
  NURSING = 'nursing',
  INCIDENT = 'incident'
}

enum NoteStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  REVIEWED = 'reviewed',
  SIGNED = 'signed',
  ADDENDUM = 'addendum'
}

interface NoteContent {
  text: string;                  // Rich text content
  structuredData?: any;          // Structured data if applicable
  attachments?: string[];        // File URLs/references
}

interface NoteRevision {
  id: string;
  version: number;
  content: NoteContent;
  author: string;                // User ID
  changesSummary: string;
  timestamp: Timestamp;
  diffFromPrevious?: string;     // Diff markup
}
```

#### NoteTemplates Collection
```typescript
interface NoteTemplate {
  id: string;                    // System-generated template ID
  name: string;
  description: string;
  type: NoteType;
  category: string;              // e.g., "emergency", "routine"
  template: string;              // Template content with placeholders
  fields: TemplateField[];       // Dynamic fields
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;             // User ID
}

interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'choice' | 'boolean';
  placeholder: string;           // Template placeholder
  required: boolean;
  options?: string[];            // For choice fields
  defaultValue?: any;
}
```

### 7. Automation & Workflow

#### WorkflowExecutions Collection
```typescript
interface WorkflowExecution {
  id: string;                    // System-generated execution ID
  visitId: string;               // Reference to visit
  workflowType: WorkflowType;
  status: ExecutionStatus;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  steps: WorkflowStep[];
  input: any;                    // Input data
  output?: any;                  // Output data
  error?: string;                // Error message if failed
  metadata: ExecutionMetadata;
  createdAt: Timestamp;
}

enum WorkflowType {
  VISIT_TRANSCRIPT_PROCESSING = 'visit_transcript_processing',
  EHR_SYNC = 'ehr_sync',
  NURSING_NOTIFICATION = 'nursing_notification',
  QUALITY_CHECK = 'quality_check'
}

enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

interface WorkflowStep {
  id: string;
  name: string;
  status: ExecutionStatus;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  input?: any;
  output?: any;
  error?: string;
  duration?: number;             // Execution time in milliseconds
}

interface ExecutionMetadata {
  triggeredBy: string;           // User ID or 'system'
  priority: 'low' | 'medium' | 'high' | 'critical';
  retryCount: number;
  maxRetries: number;
  tags: string[];
}
```

#### EHRIntegrations Collection
```typescript
interface EHRIntegration {
  id: string;                    // System-generated integration ID
  name: string;                  // EHR system name
  type: string;                  // e.g., "Epic", "Cerner", "Custom"
  endpointUrl: string;
  authMethod: 'oauth' | 'api_key' | 'basic';
  credentials: any;              // Encrypted credentials
  isActive: boolean;
  lastSyncAt?: Timestamp;
  syncFrequency: number;         // Minutes between syncs
  mappingRules: DataMapping[];
  errorLog: IntegrationError[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface DataMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;       // Transformation function name
  required: boolean;
}

interface IntegrationError {
  id: string;
  timestamp: Timestamp;
  errorType: string;
  errorMessage: string;
  requestData?: any;
  responseData?: any;
  resolved: boolean;
  resolvedAt?: Timestamp;
  resolvedBy?: string;           // User ID
}
```

### 8. System Configuration

#### Settings Collection
```typescript
interface SystemSettings {
  id: string;                    // System-generated settings ID
  category: SettingsCategory;
  key: string;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  isReadOnly: boolean;
  lastModifiedBy: string;        // User ID
  lastModifiedAt: Timestamp;
}

enum SettingsCategory {
  VITALS = 'vitals',
  SCREENING = 'screening',
  NOTIFICATIONS = 'notifications',
  INTEGRATIONS = 'integrations',
  AI = 'ai',
  SECURITY = 'security'
}
```

#### AuditLogs Collection
```typescript
interface AuditLog {
  id: string;                    // System-generated audit ID
  userId?: string;               // User who performed action (null for system)
  action: AuditAction;
  entityType: string;            // e.g., "patient", "visit", "note"
  entityId: string;              // ID of the affected entity
  oldValue?: any;                // Previous value (for updates)
  newValue?: any;                // New value (for creates/updates)
  ipAddress?: string;
  userAgent?: string;
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
  EXPORT = 'export',
  IMPORT = 'import'
}
```

## Relationships and Constraints

### Entity Relationships
- **Users** → **Visits** (assigned nurse/physician)
- **Patients** → **Visits** (one-to-many)
- **Visits** → **Screenings** (one-to-many)
- **Visits** → **VitalsRecords** (one-to-many)
- **Visits** → **ChartNotes** (one-to-many)
- **Visits** → **WorkflowExecutions** (one-to-many)
- **ScreeningTemplates** → **Screenings** (one-to-many)
- **NoteTemplates** → **ChartNotes** (one-to-many)

### Data Validation Rules
- Patient emails must be unique (if provided)
- MRN must be unique within organization (if used)
- Visit numbers must be unique (if provided)
- Vital signs must have valid ranges based on patient age
- Screening responses must match question types
- Notes must have valid authors
- Workflow executions must reference valid visits

### Security Constraints
- PHI data encrypted at rest and in transit
- Role-based access control for all data
- Audit logging for all data access
- Data retention policies based on regulations
- Anonymous identifiers for AI processing

## Data Storage Strategy

### Firebase Firestore Collections
```
/users/{userId}
/patients/{patientId}
/visits/{visitId}
/screenings/{screeningId}
/screening-templates/{templateId}
/vitals/{vitalsId}
/chart-notes/{noteId}
/note-templates/{templateId}
/workflow-executions/{executionId}
/ehr-integrations/{integrationId}
/settings/{settingId}
/audit-logs/{auditId}
```

### Indexing Strategy
- **Patients**: firstName, lastName, dateOfBirth, mrn
- **Visits**: patientId, status, assignedNurse, attendingPhysician, createdAt
- **Screenings**: visitId, patientId, status, completedAt
- **Vitals**: visitId, patientId, recordedAt, recordedBy
- **ChartNotes**: visitId, patientId, author, type, status, createdAt
- **AuditLogs**: userId, entityType, entityId, action, timestamp

### Data Archival
- Archive completed visits older than 7 years
- Maintain audit logs for 10 years minimum
- Anonymous analytics data retained indefinitely
- Export functionality for patient data portability

This data model provides a robust foundation for managing patient visits while maintaining clear boundaries around what data we control versus hospital-managed systems like laboratory tests and diagnostic equipment. 