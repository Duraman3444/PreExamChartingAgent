import { syntheticPatientGenerator, SyntheticPatient } from './syntheticPatientGenerator';
import { mockVisits, Visit } from '../data/mockData';

// Define Patient interface since it's not exported from mockData
export interface Patient {
  id: string;
  demographics: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    phone: string;
    preferredLanguage: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  basicHistory: {
    knownAllergies: string[];
    currentMedications: string[];
    knownConditions: string[];
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  visits: string[];
  _synthetic?: {
    originalQuestion: string;
    expectedAnswer: string;
    datasetSource: string;
    chiefComplaint: string;
  };
}

export interface PatientIntegrationConfig {
  mergeWithExisting: boolean;
  generateVisits: boolean;
  generateTranscripts: boolean;
  generateAnalyses: boolean;
  datasetSources: string[];
  maxSyntheticPatients: number;
}

export interface IntegratedPatientData {
  patients: Patient[];
  visits: Visit[];
  syntheticCount: number;
  realCount: number;
  totalRecords: number;
}

class PatientDataIntegration {
  private syntheticPatients: SyntheticPatient[] = [];
  private integratedData: IntegratedPatientData | null = null;

  async integrateSyntheticPatients(config: PatientIntegrationConfig): Promise<IntegratedPatientData> {
    console.log('Starting patient data integration...');

    // Generate synthetic patients
    const syntheticPatients = await syntheticPatientGenerator.generatePatientsFromDatasets({
      maxPatients: config.maxSyntheticPatients,
      datasetSources: config.datasetSources,
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
    });

    this.syntheticPatients = syntheticPatients;

    // Convert synthetic patients to Patient format
    const convertedPatients = this.convertSyntheticToPatientFormat(syntheticPatients);
    const convertedVisits = this.convertSyntheticToVisitFormat(syntheticPatients);

    // Merge with existing data if requested
    let allPatients: Patient[] = [];
    let allVisits: Visit[] = [];

    if (config.mergeWithExisting) {
      // For now, we'll just use converted patients since mockPatients isn't available
      allPatients = convertedPatients;
      allVisits = [...mockVisits, ...convertedVisits];
    } else {
      allPatients = convertedPatients;
      allVisits = convertedVisits;
    }

    this.integratedData = {
      patients: allPatients,
      visits: allVisits,
      syntheticCount: syntheticPatients.length,
      realCount: config.mergeWithExisting ? mockVisits.length : 0,
      totalRecords: allPatients.length
    };

    console.log(`Integration complete: ${this.integratedData.syntheticCount} synthetic + ${this.integratedData.realCount} real = ${this.integratedData.totalRecords} total patients`);

    return this.integratedData;
  }

  private convertSyntheticToPatientFormat(syntheticPatients: SyntheticPatient[]): Patient[] {
    return syntheticPatients.map((synthetic, index) => {
      const patient: Patient = {
        id: synthetic.patientId,
        demographics: {
          firstName: synthetic.firstName,
          lastName: synthetic.lastName,
          dateOfBirth: new Date(Date.now() - synthetic.age * 365 * 24 * 60 * 60 * 1000), // Approximate DOB
          gender: synthetic.gender,
          phone: synthetic.phoneNumber || '',
          preferredLanguage: 'English',
          address: {
            street: `${100 + index} Main St`,
            city: 'Anytown',
            state: 'CA',
            zipCode: '90210',
            country: 'USA'
          },
          emergencyContact: {
            name: 'Emergency Contact',
            relationship: 'Family',
            phone: synthetic.phoneNumber || ''
          }
        },
        basicHistory: {
          knownAllergies: this.generateRandomAllergies(),
          currentMedications: this.generateRandomMedications(),
          knownConditions: this.extractConditionsFromQuestion(synthetic.originalQuestion)
        },
        insurance: {
          provider: 'Health Insurance Co.',
          policyNumber: `POL-${synthetic.patientId}`,
          groupNumber: 'GRP-001'
        },
        visits: [synthetic.syntheticVisit.id],
        // Additional metadata for synthetic patients
        _synthetic: {
          originalQuestion: synthetic.originalQuestion,
          expectedAnswer: synthetic.expectedAnswer,
          datasetSource: synthetic.datasetSource,
          chiefComplaint: synthetic.chiefComplaint
        }
      };

      return patient;
    });
  }

  private convertSyntheticToVisitFormat(syntheticPatients: SyntheticPatient[]): Visit[] {
    return syntheticPatients.map(synthetic => {
      const visit: Visit = {
        ...synthetic.syntheticVisit,
        // Ensure all required fields are present
        patientName: `${synthetic.firstName} ${synthetic.lastName}`,
        patientAge: synthetic.age,
        patientGender: synthetic.gender,
        // Additional metadata for synthetic visits
        _synthetic: {
          originalQuestion: synthetic.originalQuestion,
          expectedAnswer: synthetic.expectedAnswer,
          datasetSource: synthetic.datasetSource
        }
      };

      return visit;
    });
  }

  private generateRandomAllergies(): string[] {
    const commonAllergies = [
      'Penicillin',
      'Aspirin',
      'Peanuts',
      'Shellfish',
      'Latex',
      'Iodine',
      'Sulfa drugs',
      'Codeine'
    ];

    const numAllergies = Math.floor(Math.random() * 3); // 0-2 allergies
    const selectedAllergies: string[] = [];

    for (let i = 0; i < numAllergies; i++) {
      const randomAllergy = commonAllergies[Math.floor(Math.random() * commonAllergies.length)];
      if (!selectedAllergies.includes(randomAllergy)) {
        selectedAllergies.push(randomAllergy);
      }
    }

    return selectedAllergies;
  }

  private generateRandomMedications(): string[] {
    const commonMedications = [
      'Lisinopril 10mg daily',
      'Metformin 500mg twice daily',
      'Atorvastatin 20mg daily',
      'Omeprazole 20mg daily',
      'Aspirin 81mg daily',
      'Levothyroxine 50mcg daily',
      'Amlodipine 5mg daily',
      'Metoprolol 25mg twice daily'
    ];

    const numMedications = Math.floor(Math.random() * 4); // 0-3 medications
    const selectedMedications: string[] = [];

    for (let i = 0; i < numMedications; i++) {
      const randomMedication = commonMedications[Math.floor(Math.random() * commonMedications.length)];
      if (!selectedMedications.includes(randomMedication)) {
        selectedMedications.push(randomMedication);
      }
    }

    return selectedMedications;
  }

  private extractConditionsFromQuestion(question: string): string[] {
    const conditionKeywords = {
      'diabetes': ['diabetes', 'diabetic', 'blood sugar', 'glucose'],
      'hypertension': ['high blood pressure', 'hypertension', 'blood pressure'],
      'asthma': ['asthma', 'breathing', 'inhaler', 'wheezing'],
      'depression': ['depression', 'depressed', 'sad', 'mood'],
      'anxiety': ['anxiety', 'anxious', 'panic', 'worry'],
      'arthritis': ['arthritis', 'joint pain', 'stiff joints'],
      'migraine': ['migraine', 'headache', 'head pain'],
      'heart disease': ['heart', 'cardiac', 'chest pain', 'heart attack'],
      'gastroesophageal reflux': ['heartburn', 'acid reflux', 'gerd', 'indigestion']
    };

    const conditions: string[] = [];
    const lowerQuestion = question.toLowerCase();

    Object.entries(conditionKeywords).forEach(([condition, keywords]) => {
      if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
        conditions.push(condition);
      }
    });

    return conditions;
  }

  async quickIntegration(sampleSize: number = 100): Promise<IntegratedPatientData> {
    return this.integrateSyntheticPatients({
      mergeWithExisting: true,
      generateVisits: true,
      generateTranscripts: true,
      generateAnalyses: true,
      datasetSources: ['merged_medical_qa.jsonl'],
      maxSyntheticPatients: sampleSize
    });
  }

  async datasetSpecificIntegration(datasetName: string, sampleSize: number = 50): Promise<IntegratedPatientData> {
    return this.integrateSyntheticPatients({
      mergeWithExisting: true,
      generateVisits: true,
      generateTranscripts: true,
      generateAnalyses: true,
      datasetSources: [datasetName],
      maxSyntheticPatients: sampleSize
    });
  }

  getIntegratedData(): IntegratedPatientData | null {
    return this.integratedData;
  }

  getSyntheticPatients(): SyntheticPatient[] {
    return this.syntheticPatients;
  }

  async exportIntegratedData(format: 'json' | 'csv'): Promise<string> {
    if (!this.integratedData) {
      throw new Error('No integrated data available. Run integration first.');
    }

    switch (format) {
      case 'json':
        return JSON.stringify(this.integratedData, null, 2);
      
      case 'csv':
        const headers = [
          'Patient ID',
          'First Name',
          'Last Name',
          'Age',
          'Gender',
          'Department',
          'Chief Complaint',
          'Is Synthetic',
          'Dataset Source',
          'Original Question'
        ];

        const csvRows = this.integratedData.patients.map(patient => {
          const synthetic = (patient as any)._synthetic;
          const visit = this.integratedData!.visits.find(v => v.patientId === patient.id);
          
          return [
            patient.id,
            patient.demographics.firstName,
            patient.demographics.lastName,
            this.calculateAge(patient.demographics.dateOfBirth).toString(),
            patient.demographics.gender,
            visit?.department || '',
            visit?.chiefComplaint || '',
            synthetic ? 'Yes' : 'No',
            synthetic?.datasetSource || '',
            synthetic?.originalQuestion?.substring(0, 100) || ''
          ];
        });

        return [headers, ...csvRows]
          .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
          .join('\n');
      
      default:
        throw new Error('Unsupported export format');
    }
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  getIntegrationStats(): {
    totalPatients: number;
    syntheticPatients: number;
    realPatients: number;
    syntheticPercentage: number;
    departmentDistribution: Record<string, number>;
    ageDistribution: Record<string, number>;
    genderDistribution: Record<string, number>;
  } | null {
    if (!this.integratedData) return null;

    const departmentCounts: Record<string, number> = {};
    const ageCounts: Record<string, number> = { '18-30': 0, '31-50': 0, '51-70': 0, '71+': 0 };
    const genderCounts: Record<string, number> = { male: 0, female: 0, other: 0 };

    this.integratedData.visits.forEach(visit => {
      // Department distribution
      departmentCounts[visit.department] = (departmentCounts[visit.department] || 0) + 1;
      
      // Age distribution
      const age = visit.patientAge;
      if (age <= 30) ageCounts['18-30']++;
      else if (age <= 50) ageCounts['31-50']++;
      else if (age <= 70) ageCounts['51-70']++;
      else ageCounts['71+']++;
      
      // Gender distribution
      genderCounts[visit.patientGender]++;
    });

    return {
      totalPatients: this.integratedData.totalRecords,
      syntheticPatients: this.integratedData.syntheticCount,
      realPatients: this.integratedData.realCount,
      syntheticPercentage: (this.integratedData.syntheticCount / this.integratedData.totalRecords) * 100,
      departmentDistribution: departmentCounts,
      ageDistribution: ageCounts,
      genderDistribution: genderCounts
    };
  }
}

export const patientDataIntegration = new PatientDataIntegration(); 