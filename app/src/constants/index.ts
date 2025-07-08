// Navigation paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PATIENTS: '/patients',
  PATIENT_DETAIL: '/patients/:id',
  VISITS: '/visits',
  VISIT_DETAIL: '/visits/:id',
  TRANSCRIPT_UPLOAD: '/visits/:id/transcript',
  TRANSCRIPT_EDITOR: '/visits/:id/transcript/edit',
  TRANSCRIPTS: '/transcripts',
  AI_ANALYSIS: '/ai-analysis',
  AI_ANALYSIS_DETAIL: '/ai-analysis/:id',
  VISIT_NOTES: '/visits/:id/notes',
  NOTES: '/notes',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// User roles
export const USER_ROLES = {
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  ADMIN: 'admin',
} as const;

// Visit types
export const VISIT_TYPES = {
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow_up',
  URGENT_CARE: 'urgent_care',
  TELEMEDICINE: 'telemedicine',
} as const;

// Visit statuses
export const VISIT_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Note types
export const NOTE_TYPES = {
  SOAP: 'soap',
  PROGRESS: 'progress',
  ASSESSMENT: 'assessment',
  PLAN: 'plan',
  SUMMARY: 'summary',
} as const;

// AI Analysis status
export const ANALYSIS_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REVIEWED: 'reviewed',
  ERROR: 'error',
} as const;

// Diagnosis severity levels
export const DIAGNOSIS_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Treatment recommendation priorities
export const TREATMENT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Concern flag types
export const CONCERN_FLAG_TYPES = {
  RED_FLAG: 'red_flag',
  DRUG_INTERACTION: 'drug_interaction',
  ALLERGY_CONCERN: 'allergy_concern',
  URGENT_REFERRAL: 'urgent_referral',
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  MIN_LENGTH: (length: number) => `Must be at least ${length} characters`,
  MAX_LENGTH: (length: number) => `Must be no more than ${length} characters`,
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_DATE: 'Please enter a valid date',
  INVALID_FILE_TYPE: 'Please select a valid file type',
  FILE_TOO_LARGE: 'File size must be less than 50MB',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile',
  },
  PATIENTS: {
    LIST: '/api/patients',
    CREATE: '/api/patients',
    GET: (id: string) => `/api/patients/${id}`,
    UPDATE: (id: string) => `/api/patients/${id}`,
    DELETE: (id: string) => `/api/patients/${id}`,
  },
  VISITS: {
    LIST: '/api/visits',
    CREATE: '/api/visits',
    GET: (id: string) => `/api/visits/${id}`,
    UPDATE: (id: string) => `/api/visits/${id}`,
    DELETE: (id: string) => `/api/visits/${id}`,
    BY_PATIENT: (patientId: string) => `/api/patients/${patientId}/visits`,
  },
  TRANSCRIPTS: {
    UPLOAD: (visitId: string) => `/api/visits/${visitId}/transcript`,
    GET: (visitId: string) => `/api/visits/${visitId}/transcript`,
    UPDATE: (visitId: string) => `/api/visits/${visitId}/transcript`,
    DELETE: (visitId: string) => `/api/visits/${visitId}/transcript`,
  },
  AI_ANALYSIS: {
    ANALYZE: (visitId: string) => `/api/visits/${visitId}/analysis`,
    GET: (visitId: string) => `/api/visits/${visitId}/analysis`,
    UPDATE: (visitId: string) => `/api/visits/${visitId}/analysis`,
    REVIEW: (visitId: string) => `/api/visits/${visitId}/analysis/review`,
  },
  VISIT_NOTES: {
    LIST: (visitId: string) => `/api/visits/${visitId}/notes`,
    CREATE: (visitId: string) => `/api/visits/${visitId}/notes`,
    GET: (visitId: string, noteId: string) => `/api/visits/${visitId}/notes/${noteId}`,
    UPDATE: (visitId: string, noteId: string) => `/api/visits/${visitId}/notes/${noteId}`,
    DELETE: (visitId: string, noteId: string) => `/api/visits/${visitId}/notes/${noteId}`,
    GENERATE: (visitId: string) => `/api/visits/${visitId}/notes/generate`,
  },
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  DRAFT_NOTES: 'draft_notes',
  VISIT_DRAFTS: 'visit_drafts',
} as const;

// Application settings
export const APP_SETTINGS = {
  NAME: 'Care+',
  VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 10,
  MAX_AUDIO_FILE_SIZE: 50 * 1024 * 1024, // 50MB for audio files
  MAX_TRANSCRIPT_SIZE: 5 * 1024 * 1024, // 5MB for text transcripts
  ALLOWED_AUDIO_TYPES: ['.mp3', '.wav', '.m4a', '.mp4', '.aac'],
  ALLOWED_TEXT_TYPES: ['.txt', '.docx', '.pdf'],
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  AI_CONFIDENCE_THRESHOLD: 0.7, // Minimum confidence score for AI recommendations
} as const; 