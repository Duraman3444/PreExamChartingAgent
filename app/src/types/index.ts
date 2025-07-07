// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'doctor' | 'nurse' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Patient Types
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  phoneNumber: string;
  email?: string;
  address: Address;
  emergencyContact: EmergencyContact;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
}

// Vitals Types
export interface Vitals {
  id: string;
  patientId: string;
  recordedBy: string;
  recordedAt: Date;
  temperature: number;
  bloodPressure: BloodPressure;
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight: number;
  height: number;
  notes?: string;
}

export interface BloodPressure {
  systolic: number;
  diastolic: number;
}

// Chart Note Types
export interface ChartNote {
  id: string;
  patientId: string;
  authorId: string;
  title: string;
  content: string;
  category: 'assessment' | 'plan' | 'progress' | 'discharge';
  createdAt: Date;
  updatedAt: Date;
  isLocked: boolean;
}

// Screening Types
export interface Screening {
  id: string;
  patientId: string;
  type: 'initial' | 'follow-up' | 'pre-procedure';
  questions: ScreeningQuestion[];
  completedAt?: Date;
  completedBy?: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface ScreeningQuestion {
  id: string;
  question: string;
  type: 'yes-no' | 'text' | 'multiple-choice' | 'scale';
  answer?: string | number | boolean;
  options?: string[];
  required: boolean;
}

// Application State Types
export interface AppState {
  user: User | null;
  currentPatient: Patient | null;
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
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
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