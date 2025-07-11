// Global event store for managing real-time updates across pages
type PatientRecord = {
  id: string;
  firstName: string;
  lastName: string;
  patientAge: number;
  patientGender: string;
  department: string;
  attendingProvider: string;
  [key: string]: any;
};

type VisitRecord = {
  id: string;
  patientId: string;
  patientName: string;
  [key: string]: any;
};

type EventCallback = (data: any) => void;

class GlobalEventStore {
  private patientCallbacks: EventCallback[] = [];
  private visitCallbacks: EventCallback[] = [];
  private transcriptCallbacks: EventCallback[] = [];

  // Register callbacks for different event types
  onPatientCreated(callback: EventCallback) {
    this.patientCallbacks.push(callback);
    console.log('🔥 [GlobalStore] Patient callback registered. Total:', this.patientCallbacks.length);
  }

  onVisitCreated(callback: EventCallback) {
    this.visitCallbacks.push(callback);
    console.log('🔥 [GlobalStore] Visit callback registered. Total:', this.visitCallbacks.length);
  }

  onTranscriptUpdated(callback: EventCallback) {
    this.transcriptCallbacks.push(callback);
    console.log('🔥 [GlobalStore] Transcript callback registered. Total:', this.transcriptCallbacks.length);
  }

  // Trigger events
  triggerPatientCreated(patient: PatientRecord) {
    console.log('📢 [GlobalStore] Triggering patient created event:', patient);
    this.patientCallbacks.forEach((callback, index) => {
      try {
        console.log(`📢 [GlobalStore] Calling patient callback ${index + 1}`);
        callback(patient);
      } catch (error) {
        console.error(`❌ [GlobalStore] Error in patient callback ${index + 1}:`, error);
      }
    });
  }

  triggerVisitCreated(visit: VisitRecord) {
    console.log('📢 [GlobalStore] Triggering visit created event:', visit);
    this.visitCallbacks.forEach((callback, index) => {
      try {
        console.log(`📢 [GlobalStore] Calling visit callback ${index + 1}`);
        callback(visit);
      } catch (error) {
        console.error(`❌ [GlobalStore] Error in visit callback ${index + 1}:`, error);
      }
    });
  }

  triggerTranscriptUpdated(data: { visitId: string; status: string; timestamp: Date }) {
    console.log('📢 [GlobalStore] Triggering transcript updated event:', data);
    this.transcriptCallbacks.forEach((callback, index) => {
      try {
        console.log(`📢 [GlobalStore] Calling transcript callback ${index + 1}`);
        callback(data);
      } catch (error) {
        console.error(`❌ [GlobalStore] Error in transcript callback ${index + 1}:`, error);
      }
    });
  }

  // Clean up callbacks
  removePatientCallbacks() {
    this.patientCallbacks = [];
  }

  removeVisitCallbacks() {
    this.visitCallbacks = [];
  }

  removeTranscriptCallbacks() {
    this.transcriptCallbacks = [];
  }

  // Debug info
  getDebugInfo() {
    return {
      patientCallbacks: this.patientCallbacks.length,
      visitCallbacks: this.visitCallbacks.length,
      transcriptCallbacks: this.transcriptCallbacks.length,
    };
  }

  // **NEW: Test function to verify the store is working**
  runTest() {
    console.log('🧪 [GlobalStore] Running test...');
    
    // Test patient creation
    const testPatient = {
      id: 'TEST-P-001',
      firstName: 'Test',
      lastName: 'Patient',
      patientAge: 30,
      patientGender: 'prefer-not-to-say' as const,
      department: 'Test Department',
      attendingProvider: 'Dr. Test',
    };
    
    console.log('🧪 [GlobalStore] Triggering test patient creation...');
    this.triggerPatientCreated(testPatient);
    
    // Test visit creation
    const testVisit = {
      id: 'TEST-V-001',
      patientId: 'TEST-P-001',
      patientName: 'Test Patient',
      scheduledDateTime: new Date(),
      hasTranscript: true,
    };
    
    console.log('🧪 [GlobalStore] Triggering test visit creation...');
    this.triggerVisitCreated(testVisit);
    
    // Test transcript update
    const testTranscript = {
      visitId: 'TEST-V-001',
      status: 'completed',
      timestamp: new Date(),
    };
    
    console.log('🧪 [GlobalStore] Triggering test transcript update...');
    this.triggerTranscriptUpdated(testTranscript);
    
    console.log('🧪 [GlobalStore] Test completed!');
  }
}

// Create global instance
export const globalEventStore = new GlobalEventStore();

// Add to window for debugging
if (typeof window !== 'undefined') {
  (window as any).globalEventStore = globalEventStore;
  console.log('🧪 [GlobalStore] Added globalEventStore to window for debugging');
} 