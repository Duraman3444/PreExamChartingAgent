// Navigation paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PATIENTS: '/patients',
  PATIENT_DETAIL: '/patients/:id',
  SCREENING: '/screening',
  VITALS: '/vitals',
  CHARTS: '/charts',
  SETTINGS: '/settings',
} as const;

// User roles
export const USER_ROLES = {
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  ADMIN: 'admin',
} as const;

// Chart note categories
export const CHART_CATEGORIES = {
  ASSESSMENT: 'assessment',
  PLAN: 'plan',
  PROGRESS: 'progress',
  DISCHARGE: 'discharge',
} as const;

// Screening types
export const SCREENING_TYPES = {
  INITIAL: 'initial',
  FOLLOW_UP: 'follow-up',
  PRE_PROCEDURE: 'pre-procedure',
} as const;

// Question types
export const QUESTION_TYPES = {
  YES_NO: 'yes-no',
  TEXT: 'text',
  MULTIPLE_CHOICE: 'multiple-choice',
  SCALE: 'scale',
} as const;

// Vital signs normal ranges
export const VITAL_RANGES = {
  TEMPERATURE: { min: 97.0, max: 99.5, unit: '°F' },
  HEART_RATE: { min: 60, max: 100, unit: 'bpm' },
  RESPIRATORY_RATE: { min: 12, max: 20, unit: 'breaths/min' },
  OXYGEN_SATURATION: { min: 95, max: 100, unit: '%' },
  BLOOD_PRESSURE: {
    SYSTOLIC: { min: 90, max: 120, unit: 'mmHg' },
    DIASTOLIC: { min: 60, max: 80, unit: 'mmHg' },
  },
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  MIN_LENGTH: (length: number) => `Must be at least ${length} characters`,
  MAX_LENGTH: (length: number) => `Must be no more than ${length} characters`,
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_DATE: 'Please enter a valid date',
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
  VITALS: {
    LIST: (patientId: string) => `/api/patients/${patientId}/vitals`,
    CREATE: (patientId: string) => `/api/patients/${patientId}/vitals`,
    GET: (patientId: string, vitalId: string) => `/api/patients/${patientId}/vitals/${vitalId}`,
    UPDATE: (patientId: string, vitalId: string) => `/api/patients/${patientId}/vitals/${vitalId}`,
    DELETE: (patientId: string, vitalId: string) => `/api/patients/${patientId}/vitals/${vitalId}`,
  },
  CHARTS: {
    LIST: (patientId: string) => `/api/patients/${patientId}/charts`,
    CREATE: (patientId: string) => `/api/patients/${patientId}/charts`,
    GET: (patientId: string, chartId: string) => `/api/patients/${patientId}/charts/${chartId}`,
    UPDATE: (patientId: string, chartId: string) => `/api/patients/${patientId}/charts/${chartId}`,
    DELETE: (patientId: string, chartId: string) => `/api/patients/${patientId}/charts/${chartId}`,
  },
  SCREENING: {
    LIST: (patientId: string) => `/api/patients/${patientId}/screening`,
    CREATE: (patientId: string) => `/api/patients/${patientId}/screening`,
    GET: (patientId: string, screeningId: string) => `/api/patients/${patientId}/screening/${screeningId}`,
    UPDATE: (patientId: string, screeningId: string) => `/api/patients/${patientId}/screening/${screeningId}`,
    DELETE: (patientId: string, screeningId: string) => `/api/patients/${patientId}/screening/${screeningId}`,
  },
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  DRAFT_NOTES: 'draft_notes',
} as const;

// Application settings
export const APP_SETTINGS = {
  NAME: 'Medical Charting App',
  VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 10,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
} as const; 