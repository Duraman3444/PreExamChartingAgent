import { aiEvaluationService, DatasetRecord } from './aiEvaluation';
import { Visit } from '../data/mockData';

export interface SyntheticPatient {
  id: string;
  firstName: string;
  lastName: string;
  patientId: string;
  caseNumber: string;
  dateIncharged: Date;
  dateDischarged: Date | null;
  status: 'active' | 'discharged' | 'transferred';
  department: string;
  attendingProvider: string;
  documents: {
    symptoms: boolean;
    diagnosis: boolean;
    visitTranscripts: boolean;
    aiAnalysis: boolean;
    visitNotes: boolean;
  };
  lastVisitDate: Date;
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  phoneNumber?: string;
  // Additional synthetic data fields
  originalQuestion: string;
  expectedAnswer: string;
  datasetSource: string;
  chiefComplaint: string;
  syntheticVisit: Visit;
}

export interface SyntheticPatientConfig {
  maxPatients: number;
  datasetSources: string[];
  departmentDistribution: {
    [department: string]: number; // percentage
  };
  ageDistribution: {
    min: number;
    max: number;
    mean: number;
  };
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
}

class SyntheticPatientGenerator {
  private readonly DEPARTMENTS = [
    'Emergency',
    'Internal Medicine',
    'Family Medicine',
    'Pediatrics',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Psychiatry',
    'Dermatology',
    'Gastroenterology'
  ];

  private readonly PROVIDERS = [
    'Dr. Sarah Johnson',
    'Dr. Michael Chen',
    'Dr. Emily Rodriguez',
    'Dr. David Kim',
    'Dr. Jennifer Thompson',
    'Dr. Robert Martinez',
    'Dr. Lisa Wang',
    'Dr. James Wilson',
    'Dr. Maria Garcia',
    'Dr. Christopher Lee'
  ];

  private readonly FIRST_NAMES = {
    male: ['John', 'Michael', 'David', 'James', 'Robert', 'William', 'Christopher', 'Daniel', 'Matthew', 'Anthony'],
    female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'],
    other: ['Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'River', 'Phoenix']
  };

  private readonly LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
  ];

  private patientCounter = 1000;

  async generatePatientsFromDatasets(config: SyntheticPatientConfig): Promise<SyntheticPatient[]> {
    console.log('Loading datasets for synthetic patient generation...');
    
    // Load all specified datasets
    const allRecords: DatasetRecord[] = [];
    for (const datasetName of config.datasetSources) {
      const records = await aiEvaluationService.loadDataset(`/evaluation/datasets/${datasetName}`);
      allRecords.push(...records);
    }

    if (allRecords.length === 0) {
      throw new Error('No dataset records found for patient generation');
    }

    // Shuffle and sample records
    const shuffled = this.shuffleArray([...allRecords]);
    const sample = shuffled.slice(0, config.maxPatients);

    console.log(`Generating ${sample.length} synthetic patients from ${allRecords.length} total records...`);

    const syntheticPatients: SyntheticPatient[] = [];

    for (let i = 0; i < sample.length; i++) {
      const record = sample[i];
      const patient = this.createSyntheticPatient(record, config, i);
      syntheticPatients.push(patient);
    }

    return syntheticPatients;
  }

  private createSyntheticPatient(record: DatasetRecord, config: SyntheticPatientConfig, index: number): SyntheticPatient {
    const patientId = `SP${(this.patientCounter + index).toString().padStart(3, '0')}`;
    const gender = this.selectGender(config.genderDistribution);
    const firstName = this.selectFirstName(gender);
    const lastName = this.selectLastName();
    const age = this.generateAge(config.ageDistribution);
    const department = this.selectDepartment(config.departmentDistribution);
    const provider = this.selectProvider();
    
    // Extract chief complaint from question
    const chiefComplaint = this.extractChiefComplaint(record.question);
    
    // Generate visit date (random within last 30 days)
    const visitDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    // Create synthetic visit
    const syntheticVisit: Visit = {
      id: `V${patientId}${index}`,
      patientId,
      patientName: `${firstName} ${lastName}`,
      patientAge: age,
      patientGender: gender,
      type: this.selectVisitType(record.question),
      status: 'completed',
      scheduledDateTime: visitDate,
      startTime: visitDate,
      endTime: new Date(visitDate.getTime() + (30 + Math.random() * 60) * 60 * 1000), // 30-90 min duration
      duration: 30 + Math.random() * 60,
      attendingProvider: provider,
      department,
      chiefComplaint,
      visitSummary: this.generateVisitSummary(record.question, record.answer),
      priority: this.selectPriority(record.question),
      hasTranscript: true,
      hasAiAnalysis: true,
      hasVisitNotes: true,
      transcriptStatus: 'completed',
      notesCount: 1 + Math.floor(Math.random() * 3),
      notesStatus: 'signed',
      analysisStatus: 'completed',
      analysisConfidence: 0.7 + Math.random() * 0.3,
      createdAt: visitDate,
      updatedAt: visitDate,
      lastNoteDate: visitDate,
      lastAnalysisDate: visitDate
    };

    const syntheticPatient: SyntheticPatient = {
      id: index.toString(),
      firstName,
      lastName,
      patientId,
      caseNumber: `CS-2024-${patientId.replace('SP', '').padStart(3, '0')}`,
      dateIncharged: visitDate,
      dateDischarged: null,
      status: 'active',
      department,
      attendingProvider: provider,
      documents: {
        symptoms: true,
        diagnosis: true,
        visitTranscripts: true,
        aiAnalysis: true,
        visitNotes: true,
      },
      lastVisitDate: visitDate,
      age,
      gender,
      phoneNumber: `555-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      originalQuestion: record.question,
      expectedAnswer: record.answer,
      datasetSource: record.source,
      chiefComplaint,
      syntheticVisit
    };

    return syntheticPatient;
  }

  private extractChiefComplaint(question: string): string {
    // Simple extraction - take first sentence or first 100 characters
    const sentences = question.split(/[.!?]+/);
    const firstSentence = sentences[0]?.trim() || '';
    
    if (firstSentence.length > 100) {
      return firstSentence.substring(0, 97) + '...';
    }
    
    return firstSentence || question.substring(0, 100) + '...';
  }

  private generateVisitSummary(question: string, answer: string): string {
    // Generate a brief summary combining question and answer
    const summary = `Patient presented with: ${this.extractChiefComplaint(question)}. ${answer.substring(0, 200)}...`;
    return summary;
  }

  private selectGender(distribution: { male: number; female: number; other: number }): 'male' | 'female' | 'other' | 'prefer-not-to-say' {
    const rand = Math.random();
    if (rand < distribution.male) return 'male';
    if (rand < distribution.male + distribution.female) return 'female';
    return 'other';
  }

  private selectFirstName(gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'): string {
    const names = this.FIRST_NAMES[gender === 'prefer-not-to-say' ? 'other' : gender];
    return names[Math.floor(Math.random() * names.length)];
  }

  private selectLastName(): string {
    return this.LAST_NAMES[Math.floor(Math.random() * this.LAST_NAMES.length)];
  }

  private generateAge(distribution: { min: number; max: number; mean: number }): number {
    // Generate age with normal distribution around mean
    const age = Math.round(this.normalRandom(distribution.mean, 15));
    return Math.max(distribution.min, Math.min(distribution.max, age));
  }

  private selectDepartment(distribution: { [department: string]: number }): string {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [department, percentage] of Object.entries(distribution)) {
      cumulative += percentage;
      if (rand < cumulative) {
        return department;
      }
    }
    
    // Fallback to random department
    return this.DEPARTMENTS[Math.floor(Math.random() * this.DEPARTMENTS.length)];
  }

  private selectProvider(): string {
    return this.PROVIDERS[Math.floor(Math.random() * this.PROVIDERS.length)];
  }

  private selectVisitType(question: string): 'consultation' | 'follow_up' | 'urgent_care' | 'telemedicine' {
    const urgentKeywords = ['emergency', 'urgent', 'severe', 'acute', 'sudden', 'chest pain', 'difficulty breathing'];
    const followUpKeywords = ['follow up', 'check up', 'routine', 'monitoring', 'follow-up'];
    
    const lowerQuestion = question.toLowerCase();
    
    if (urgentKeywords.some(keyword => lowerQuestion.includes(keyword))) {
      return 'urgent_care';
    }
    
    if (followUpKeywords.some(keyword => lowerQuestion.includes(keyword))) {
      return 'follow_up';
    }
    
    // Random between consultation and telemedicine
    return Math.random() < 0.7 ? 'consultation' : 'telemedicine';
  }

  private selectPriority(question: string): 'low' | 'medium' | 'high' | 'urgent' {
    const urgentKeywords = ['emergency', 'severe', 'acute', 'sudden', 'chest pain', 'difficulty breathing'];
    const highKeywords = ['pain', 'bleeding', 'fever', 'infection', 'injury'];
    
    const lowerQuestion = question.toLowerCase();
    
    if (urgentKeywords.some(keyword => lowerQuestion.includes(keyword))) {
      return 'urgent';
    }
    
    if (highKeywords.some(keyword => lowerQuestion.includes(keyword))) {
      return 'high';
    }
    
    return Math.random() < 0.6 ? 'medium' : 'low';
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private normalRandom(mean: number, stdDev: number): number {
    // Box-Muller transform for normal distribution
    const u = Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return z * stdDev + mean;
  }

  async generateDefaultSyntheticPatients(count: number = 100): Promise<SyntheticPatient[]> {
    const config: SyntheticPatientConfig = {
      maxPatients: count,
      datasetSources: ['merged_medical_qa.jsonl'],
      departmentDistribution: {
        'Emergency': 0.25,
        'Internal Medicine': 0.20,
        'Family Medicine': 0.15,
        'Cardiology': 0.10,
        'Neurology': 0.08,
        'Pediatrics': 0.07,
        'Orthopedics': 0.05,
        'Psychiatry': 0.04,
        'Dermatology': 0.03,
        'Gastroenterology': 0.03
      },
      ageDistribution: {
        min: 18,
        max: 90,
        mean: 45
      },
      genderDistribution: {
        male: 0.48,
        female: 0.50,
        other: 0.02
      }
    };

    return this.generatePatientsFromDatasets(config);
  }

  async addToPatientSystem(syntheticPatients: SyntheticPatient[]): Promise<void> {
    console.log(`Adding ${syntheticPatients.length} synthetic patients to patient management system...`);
    
    // In a real implementation, this would:
    // 1. Add patients to Firebase/database
    // 2. Create associated visits
    // 3. Generate synthetic transcripts
    // 4. Create AI analysis records
    // 5. Generate visit notes
    
    // For now, we'll just log the integration
    console.log('Synthetic patients ready for integration:');
    syntheticPatients.forEach((patient, index) => {
      if (index < 5) { // Show first 5 as example
        console.log(`${patient.patientId}: ${patient.firstName} ${patient.lastName} - ${patient.chiefComplaint}`);
      }
    });
    
    if (syntheticPatients.length > 5) {
      console.log(`... and ${syntheticPatients.length - 5} more patients`);
    }
  }
}

export const syntheticPatientGenerator = new SyntheticPatientGenerator(); 