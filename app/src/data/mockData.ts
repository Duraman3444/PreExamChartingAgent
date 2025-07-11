// **SINGLE SOURCE OF TRUTH FOR PATIENT DATA**
// 
// This file contains all patient and visit data used throughout the application.
// ALL pages should import and use this data to ensure consistency.
// 
// 🚨 IMPORTANT: When adding new patients, add them here ONLY.
// The following pages automatically use this data:
// - Transcripts page
// - Notes page  
// - AI Analysis Entry page
// - Visit Management page (updated to use this)
// - Patient Management page (derives patients from this data)
//
// DO NOT create separate mock data in individual page files.

export interface Visit {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  type: 'consultation' | 'follow_up' | 'urgent_care' | 'telemedicine';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDateTime: Date;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  attendingProvider: string;
  department: string;
  chiefComplaint?: string;
  visitSummary?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  hasTranscript: boolean;
  hasAiAnalysis: boolean;
  hasVisitNotes: boolean;
  transcriptStatus: 'none' | 'uploaded' | 'processing' | 'completed';
  notesCount: number;
  notesStatus: 'none' | 'draft' | 'signed' | 'reviewed';
  analysisStatus: 'none' | 'pending' | 'processing' | 'completed' | 'reviewed';
  analysisConfidence?: number;
  createdAt: Date;
  updatedAt: Date;
  lastNoteDate?: Date;
  lastAnalysisDate?: Date;
  _synthetic?: {
    originalQuestion: string;
    expectedAnswer: string;
    datasetSource: string;
  };
}

// Original mock data
const initialMockVisits: Visit[] = [
  {
    id: 'V001',
    patientId: 'P001',
    patientName: 'John Doe',
    patientAge: 45,
    patientGender: 'male',
    type: 'consultation',
    status: 'completed',
    scheduledDateTime: new Date('2024-01-15T09:00:00'),
    startTime: new Date('2024-01-15T09:05:00'),
    endTime: new Date('2024-01-15T09:45:00'),
    duration: 40,
    attendingProvider: 'Dr. Smith',
    department: 'Emergency',
    chiefComplaint: 'Chest pain and shortness of breath',
    visitSummary: 'Patient presented with chest pain. ECG normal. Diagnosed with anxiety.',
    priority: 'high',
    hasTranscript: true,
    hasAiAnalysis: true,
    hasVisitNotes: true,
    transcriptStatus: 'completed',
    notesCount: 3,
    notesStatus: 'signed',
    analysisStatus: 'reviewed',
    analysisConfidence: 0.89,
    createdAt: new Date('2024-01-15T08:30:00'),
    updatedAt: new Date('2024-01-15T10:00:00'),
    lastNoteDate: new Date('2024-01-15T10:30:00'),
    lastAnalysisDate: new Date('2024-01-15T10:45:00'),
  },
  {
    id: 'V002',
    patientId: 'P002',
    patientName: 'Jane Smith',
    patientAge: 62,
    patientGender: 'female',
    type: 'follow_up',
    status: 'completed',
    scheduledDateTime: new Date('2024-01-18T14:00:00'),
    startTime: new Date('2024-01-18T14:02:00'),
    endTime: new Date('2024-01-18T14:30:00'),
    duration: 28,
    attendingProvider: 'Dr. Johnson',
    department: 'Cardiology',
    chiefComplaint: 'Palpitations and fatigue',
    visitSummary: 'Diagnosed with atrial fibrillation. Started on anticoagulation.',
    priority: 'medium',
    hasTranscript: true,
    hasAiAnalysis: true,
    hasVisitNotes: true,
    transcriptStatus: 'completed',
    notesCount: 2,
    notesStatus: 'signed',
    analysisStatus: 'completed',
    analysisConfidence: 0.92,
    createdAt: new Date('2024-01-17T10:00:00'),
    updatedAt: new Date('2024-01-18T14:30:00'),
    lastNoteDate: new Date('2024-01-18T15:00:00'),
    lastAnalysisDate: new Date('2024-01-18T14:45:00'),
  },
  {
    id: 'V003',
    patientId: 'P003',
    patientName: 'Michael Brown',
    patientAge: 38,
    patientGender: 'male',
    type: 'consultation',
    status: 'completed',
    scheduledDateTime: new Date('2024-01-20T10:30:00'),
    startTime: new Date('2024-01-20T10:35:00'),
    endTime: new Date('2024-01-20T11:00:00'),
    duration: 25,
    attendingProvider: 'Dr. Davis',
    department: 'Internal Medicine',
    chiefComplaint: 'Fatigue and gastrointestinal symptoms',
    visitSummary: 'Epigastric pain with weight loss. Endoscopy scheduled.',
    priority: 'high',
    hasTranscript: true,
    hasAiAnalysis: true,
    hasVisitNotes: true,
    transcriptStatus: 'completed',
    notesCount: 1,
    notesStatus: 'draft',
    analysisStatus: 'completed',
    analysisConfidence: 0.85,
    createdAt: new Date('2024-01-19T09:00:00'),
    updatedAt: new Date('2024-01-20T11:00:00'),
    lastNoteDate: new Date('2024-01-20T11:30:00'),
    lastAnalysisDate: new Date('2024-01-20T11:15:00'),
  },
  {
    id: 'V004',
    patientId: 'P004',
    patientName: 'Sarah Wilson',
    patientAge: 29,
    patientGender: 'female',
    type: 'urgent_care',
    status: 'completed',
    scheduledDateTime: new Date('2024-01-16T15:30:00'),
    startTime: new Date('2024-01-16T15:35:00'),
    endTime: new Date('2024-01-16T16:20:00'),
    duration: 45,
    attendingProvider: 'Dr. Thompson',
    department: 'Neurology',
    chiefComplaint: 'Severe headache with vision changes',
    visitSummary: 'Migraine with aura. Prescribed sumatriptan.',
    priority: 'urgent',
    hasTranscript: true,
    hasAiAnalysis: true,
    hasVisitNotes: true,
    transcriptStatus: 'completed',
    notesCount: 2,
    notesStatus: 'reviewed',
    analysisStatus: 'completed',
    analysisConfidence: 0.91,
    createdAt: new Date('2024-01-16T15:00:00'),
    updatedAt: new Date('2024-01-16T16:30:00'),
    lastNoteDate: new Date('2024-01-16T17:00:00'),
    lastAnalysisDate: new Date('2024-01-16T16:45:00'),
  },
  {
    id: 'V005',
    patientId: 'P005',
    patientName: 'Robert Johnson',
    patientAge: 55,
    patientGender: 'male',
    type: 'consultation',
    status: 'completed',
    scheduledDateTime: new Date('2024-01-19T11:00:00'),
    startTime: new Date('2024-01-19T11:05:00'),
    endTime: new Date('2024-01-19T11:45:00'),
    duration: 40,
    attendingProvider: 'Dr. Lee',
    department: 'Orthopedics',
    chiefComplaint: 'Knee pain and swelling',
    visitSummary: 'Osteoarthritis with acute flare. Started NSAIDs and PT.',
    priority: 'medium',
    hasTranscript: true,
    hasAiAnalysis: true,
    hasVisitNotes: true,
    transcriptStatus: 'completed',
    notesCount: 2,
    notesStatus: 'signed',
    analysisStatus: 'completed',
    analysisConfidence: 0.78,
    createdAt: new Date('2024-01-18T14:00:00'),
    updatedAt: new Date('2024-01-19T11:45:00'),
    lastNoteDate: new Date('2024-01-19T12:15:00'),
    lastAnalysisDate: new Date('2024-01-19T12:00:00'),
  },
  {
    id: 'V006',
    patientId: 'P006',
    patientName: 'Emily Davis',
    patientAge: 8,
    patientGender: 'female',
    type: 'consultation',
    status: 'completed',
    scheduledDateTime: new Date('2024-01-21T14:30:00'),
    startTime: new Date('2024-01-21T14:35:00'),
    endTime: new Date('2024-01-21T15:00:00'),
    duration: 25,
    attendingProvider: 'Dr. Miller',
    department: 'Pediatrics',
    chiefComplaint: 'Fever and cough',
    visitSummary: 'Viral upper respiratory infection. Supportive care recommended.',
    priority: 'low',
    hasTranscript: true,
    hasAiAnalysis: false,
    hasVisitNotes: false,
    transcriptStatus: 'completed',
    notesCount: 0,
    notesStatus: 'none',
    analysisStatus: 'pending',
    createdAt: new Date('2024-01-21T14:00:00'),
    updatedAt: new Date('2024-01-21T15:00:00'),
  },
  {
    id: 'V007',
    patientId: 'P007',
    patientName: 'David Anderson',
    patientAge: 42,
    patientGender: 'male',
    type: 'urgent_care',
    status: 'completed',
    scheduledDateTime: new Date('2024-01-17T16:00:00'),
    startTime: new Date('2024-01-17T16:05:00'),
    endTime: new Date('2024-01-17T18:30:00'),
    duration: 145,
    attendingProvider: 'Dr. Garcia',
    department: 'Surgery',
    chiefComplaint: 'Severe abdominal pain',
    visitSummary: 'Acute appendicitis. Emergency appendectomy performed successfully.',
    priority: 'urgent',
    hasTranscript: true,
    hasAiAnalysis: true,
    hasVisitNotes: true,
    transcriptStatus: 'completed',
    notesCount: 4,
    notesStatus: 'signed',
    analysisStatus: 'completed',
    analysisConfidence: 0.94,
    createdAt: new Date('2024-01-17T15:30:00'),
    updatedAt: new Date('2024-01-17T19:00:00'),
    lastNoteDate: new Date('2024-01-17T19:30:00'),
    lastAnalysisDate: new Date('2024-01-17T19:15:00'),
  },
  {
    id: 'V008',
    patientId: 'P008',
    patientName: 'Lisa Martinez',
    patientAge: 28,
    patientGender: 'female',
    type: 'follow_up',
    status: 'completed',
    scheduledDateTime: new Date('2024-01-22T10:00:00'),
    startTime: new Date('2024-01-22T10:05:00'),
    endTime: new Date('2024-01-22T10:45:00'),
    duration: 40,
    attendingProvider: 'Dr. Rodriguez',
    department: 'Obstetrics',
    chiefComplaint: 'Decreased fetal movement at 32 weeks',
    visitSummary: 'Fetal monitoring reassuring. Kick count instructions provided.',
    priority: 'medium',
    hasTranscript: true,
    hasAiAnalysis: false,
    hasVisitNotes: true,
    transcriptStatus: 'completed',
    notesCount: 1,
    notesStatus: 'draft',
    analysisStatus: 'processing',
    createdAt: new Date('2024-01-22T09:30:00'),
    updatedAt: new Date('2024-01-22T10:45:00'),
    lastNoteDate: new Date('2024-01-22T11:00:00'),
  },
  {
    id: 'V009',
    patientId: 'P009',
    patientName: 'James Taylor',
    patientAge: 34,
    patientGender: 'male',
    type: 'consultation',
    status: 'completed',
    scheduledDateTime: new Date('2024-01-14T13:00:00'),
    startTime: new Date('2024-01-14T13:05:00'),
    endTime: new Date('2024-01-14T14:00:00'),
    duration: 55,
    attendingProvider: 'Dr. Wilson',
    department: 'Psychiatry',
    chiefComplaint: 'Depression and anxiety symptoms',
    visitSummary: 'Major depressive disorder diagnosed. Started sertraline and therapy.',
    priority: 'medium',
    hasTranscript: true,
    hasAiAnalysis: true,
    hasVisitNotes: true,
    transcriptStatus: 'completed',
    notesCount: 3,
    notesStatus: 'signed',
    analysisStatus: 'completed',
    analysisConfidence: 0.87,
    createdAt: new Date('2024-01-14T12:30:00'),
    updatedAt: new Date('2024-01-14T14:30:00'),
    lastNoteDate: new Date('2024-01-14T15:00:00'),
    lastAnalysisDate: new Date('2024-01-14T14:45:00'),
  },
  {
    id: 'V010',
    patientId: 'P010',
    patientName: 'Maria Gonzalez',
    patientAge: 51,
    patientGender: 'female',
    type: 'consultation',
    status: 'completed',
    scheduledDateTime: new Date('2024-01-23T09:00:00'),
    startTime: new Date('2024-01-23T09:05:00'),
    endTime: new Date('2024-01-23T10:00:00'),
    duration: 55,
    attendingProvider: 'Dr. Chen',
    department: 'Endocrinology',
    chiefComplaint: 'Polyuria, polydipsia, and fatigue',
    visitSummary: 'New diagnosis of Type 2 diabetes. Started metformin and education.',
    priority: 'high',
    hasTranscript: false,
    hasAiAnalysis: false,
    hasVisitNotes: true,
    transcriptStatus: 'none',
    notesCount: 1,
    notesStatus: 'draft',
    analysisStatus: 'none',
    createdAt: new Date('2024-01-23T08:30:00'),
    updatedAt: new Date('2024-01-23T10:15:00'),
    lastNoteDate: new Date('2024-01-23T10:30:00'),
  },
  {
    id: 'V011',
    patientId: 'P011',
    patientName: 'Christopher White',
    patientAge: 39,
    patientGender: 'male',
    type: 'consultation',
    status: 'completed',
    scheduledDateTime: new Date('2024-01-20T15:00:00'),
    startTime: new Date('2024-01-20T15:05:00'),
    endTime: new Date('2024-01-20T15:30:00'),
    duration: 25,
    attendingProvider: 'Dr. Patel',
    department: 'Dermatology',
    chiefComplaint: 'Generalized rash and itching',
    visitSummary: 'Contact dermatitis from new detergent. Topical steroid prescribed.',
    priority: 'low',
    hasTranscript: true,
    hasAiAnalysis: true,
    hasVisitNotes: true,
    transcriptStatus: 'completed',
    notesCount: 1,
    notesStatus: 'signed',
    analysisStatus: 'completed',
    analysisConfidence: 0.76,
    createdAt: new Date('2024-01-20T14:30:00'),
    updatedAt: new Date('2024-01-20T15:45:00'),
    lastNoteDate: new Date('2024-01-20T16:00:00'),
    lastAnalysisDate: new Date('2024-01-20T15:50:00'),
  },
  {
    id: 'V012',
    patientId: 'P012',
    patientName: 'Amanda Thompson',
    patientAge: 47,
    patientGender: 'female',
    type: 'consultation',
    status: 'completed',
    scheduledDateTime: new Date('2024-01-19T11:00:00'),
    startTime: new Date('2024-01-19T11:05:00'),
    endTime: new Date('2024-01-19T12:00:00'),
    duration: 55,
    attendingProvider: 'Dr. Kumar',
    department: 'Oncology',
    chiefComplaint: 'Persistent cough with hemoptysis and weight loss',
    visitSummary: 'Lung adenocarcinoma diagnosed. Oncology treatment planning initiated.',
    priority: 'urgent',
    hasTranscript: true,
    hasAiAnalysis: true,
    hasVisitNotes: true,
    transcriptStatus: 'completed',
    notesCount: 5,
    notesStatus: 'signed',
    analysisStatus: 'completed',
    analysisConfidence: 0.96,
    createdAt: new Date('2024-01-19T10:30:00'),
    updatedAt: new Date('2024-01-19T12:30:00'),
    lastNoteDate: new Date('2024-01-19T13:00:00'),
    lastAnalysisDate: new Date('2024-01-19T12:45:00'),
  },
]; 

// **NEW: Functions to manage the data store**
export class MockDataStore {
  private static visits: Visit[] = [...initialMockVisits];
  private static listeners: (() => void)[] = [];

  static addVisit(visit: Visit) {
    console.log('📝 [MockDataStore] Adding new visit:', visit.id, visit.patientName);
    this.visits.unshift(visit); // Add to beginning of array
    this.notifyListeners();
  }

  static getVisits(): Visit[] {
    return [...this.visits]; // Return copy to prevent direct mutation
  }

  static getVisitById(id: string): Visit | undefined {
    return this.visits.find(visit => visit.id === id);
  }

  static getVisitsByPatientId(patientId: string): Visit[] {
    return this.visits.filter(visit => visit.patientId === patientId);
  }

  static updateVisit(id: string, updates: Partial<Visit>) {
    const index = this.visits.findIndex(visit => visit.id === id);
    if (index !== -1) {
      this.visits[index] = { ...this.visits[index], ...updates };
      this.notifyListeners();
    }
  }

  static subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners() {
    console.log('📡 [MockDataStore] Notifying', this.listeners.length, 'listeners of data change');
    this.listeners.forEach(listener => listener());
  }

  // Debug function
  static getDebugInfo() {
    return {
      totalVisits: this.visits.length,
      totalListeners: this.listeners.length,
      latestVisit: this.visits[0]?.patientName || 'None'
    };
  }
}

// Add to window for debugging
if (typeof window !== 'undefined') {
  (window as any).mockDataStore = MockDataStore;
  console.log('🧪 [MockDataStore] Added to window for debugging');
}

// Backwards compatibility - getter function that always returns current data
export const getMockVisits = () => MockDataStore.getVisits();

// Legacy export for existing code - this will be a snapshot but should be replaced with getMockVisits()
export const mockVisits = initialMockVisits; 