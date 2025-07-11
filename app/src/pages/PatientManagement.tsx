import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Grid,
  Avatar,
  TableSortLabel,
  TablePagination,
  Alert,
  Select,
  FormControl,
  InputLabel,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  RecordVoiceOver as TranscriptIcon,
  LocalHospital as HospitalIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { exportTranscript } from '@/services/fileUpload';
import { mockVisits, Visit } from '@/data/mockData';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// Extended patient interface for the management view
interface PatientRecord {
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
}

// Convert shared Visit data to PatientRecord format
const convertVisitsToPatients = (visits: Visit[]): PatientRecord[] => {
  const patientMap = new Map<string, PatientRecord>();
  
  visits.forEach((visit, index) => {
    const patientId = visit.patientId;
    const nameParts = visit.patientName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    if (!patientMap.has(patientId)) {
      // Create new patient record
      patientMap.set(patientId, {
        id: (index + 1).toString(),
        firstName,
        lastName,
        patientId,
        caseNumber: `CS-2024-${patientId.replace('P', '').padStart(3, '0')}`,
        dateIncharged: visit.scheduledDateTime,
        dateDischarged: visit.status === 'completed' ? visit.updatedAt : null,
        status: visit.status === 'completed' ? 'discharged' : 'active',
        department: visit.department,
        attendingProvider: visit.attendingProvider,
        documents: {
          symptoms: true,
          diagnosis: true,
          visitTranscripts: visit.hasTranscript,
          aiAnalysis: visit.hasAiAnalysis,
          visitNotes: visit.hasVisitNotes,
        },
        lastVisitDate: visit.scheduledDateTime,
        age: visit.patientAge,
        gender: visit.patientGender,
        phoneNumber: `555-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      });
    } else {
      // Update existing patient record with latest visit info
      const existingPatient = patientMap.get(patientId)!;
      if (visit.scheduledDateTime > existingPatient.lastVisitDate) {
        existingPatient.lastVisitDate = visit.scheduledDateTime;
        existingPatient.department = visit.department;
        existingPatient.attendingProvider = visit.attendingProvider;
        existingPatient.documents.visitTranscripts = existingPatient.documents.visitTranscripts || visit.hasTranscript;
        existingPatient.documents.aiAnalysis = existingPatient.documents.aiAnalysis || visit.hasAiAnalysis;
        existingPatient.documents.visitNotes = existingPatient.documents.visitNotes || visit.hasVisitNotes;
      }
    }
  });
  
  return Array.from(patientMap.values());
};

// Use shared mock data - converted to PatientRecord format
const mockPatientData: PatientRecord[] = convertVisitsToPatients(mockVisits);


// Mock document content data
const mockDocumentContent = {
  symptoms: {
    'P001': {
      title: 'Symptoms Record',
      content: `
**Chief Complaint:** Chest pain and shortness of breath

**History of Present Illness:**
Patient presents with acute onset chest pain that started 2 hours ago while jogging. Pain is described as pressure-like, non-radiating, 7/10 intensity. Associated with mild shortness of breath and diaphoresis.

**Symptom Summary:**
• Chest pain - moderate severity, 2 hours duration, intermittent
• Shortness of breath - mild severity, 30 minutes duration, continuous
• Diaphoresis - mild, associated with physical activity

**Review of Systems:**
• Cardiovascular: Positive for chest pain, shortness of breath
• Respiratory: Positive for dyspnea on exertion
• Gastrointestinal: Negative for nausea, vomiting
• Neurological: Negative for dizziness, syncope
      `.trim(),
      lastUpdated: '2024-01-20T10:30:00Z'
    },
    'P002': {
      title: 'Symptoms Record',
      content: `
**Chief Complaint:** Palpitations and fatigue

**History of Present Illness:**
62-year-old female presents with palpitations and increased fatigue over the past week. Reports occasional chest tightness and has been more short of breath with usual activities.

**Symptom Summary:**
• Palpitations - moderate severity, 1 week duration, intermittent
• Fatigue - moderate severity, 1 week duration, continuous
• Chest tightness - mild severity, 3 days duration, occasional

**Review of Systems:**
• Cardiovascular: Positive for palpitations, chest tightness
• General: Positive for fatigue, weakness
• Respiratory: Positive for mild dyspnea
      `.trim(),
      lastUpdated: '2024-01-18T14:15:00Z'
    },
    'P003': {
      title: 'Symptoms Record',
      content: `
**Chief Complaint:** Abdominal pain and nausea

**History of Present Illness:**
38-year-old male presents with epigastric pain and nausea for 2 weeks. Pain is described as dull, constant, worsening after meals. Associated with weight loss and night sweats.

**Symptom Summary:**
• Abdominal pain - moderate severity, 2 weeks duration, constant
• Nausea - moderate severity, 2 weeks duration, intermittent
• Weight loss - 10 pounds over 2 weeks
• Night sweats - mild, 1 week duration

**Review of Systems:**
• Gastrointestinal: Positive for nausea, weight loss, loose stools
• General: Positive for night sweats, fatigue
• Genitourinary: Negative for urinary symptoms
      `.trim(),
      lastUpdated: '2024-01-20T09:45:00Z'
    },
    'P004': {
      title: 'Symptoms Record',
      content: `
**Chief Complaint:** Severe headache with vision changes

**History of Present Illness:**
29-year-old female presents with severe headache and visual disturbances. Headache is throbbing, primarily frontal and temporal, with associated photophobia and nausea. Vision changes include seeing flashing lights.

**Symptom Summary:**
• Headache - severe intensity, 4 hours duration, throbbing
• Visual disturbances - flashing lights, 2 hours duration
• Photophobia - moderate severity, 4 hours duration
• Nausea - mild severity, 3 hours duration

**Review of Systems:**
• Neurological: Positive for headache, visual changes, photophobia
• Gastrointestinal: Positive for nausea
• Cardiovascular: Negative for chest pain, palpitations
      `.trim(),
      lastUpdated: '2024-01-16T15:30:00Z'
    },
    'P005': {
      title: 'Symptoms Record',
      content: `
**Chief Complaint:** Knee pain and swelling

**History of Present Illness:**
55-year-old male presents with right knee pain and swelling for 3 days. Pain is described as aching, worse with movement. Patient reports difficulty walking and climbing stairs.

**Symptom Summary:**
• Knee pain - moderate to severe intensity, 3 days duration, constant
• Swelling - moderate, right knee, 2 days duration
• Stiffness - severe, worse in morning, 3 days duration
• Difficulty walking - moderate limitation, 2 days duration

**Review of Systems:**
• Musculoskeletal: Positive for joint pain, swelling, stiffness
• General: Negative for fever, weight loss
• Neurological: Negative for numbness, tingling
      `.trim(),
      lastUpdated: '2024-01-19T11:00:00Z'
    },
    'P006': {
      title: 'Symptoms Record',
      content: `
**Chief Complaint:** Fever and cough

**History of Present Illness:**
8-year-old female presents with fever and persistent cough for 5 days. Mother reports child has been less active and eating poorly. No known sick contacts.

**Symptom Summary:**
• Fever - moderate, up to 101.5°F, 5 days duration, intermittent
• Cough - dry, persistent, 5 days duration, worse at night
• Decreased appetite - moderate, 3 days duration
• Fatigue - mild, 4 days duration

**Review of Systems:**
• Respiratory: Positive for cough, no shortness of breath
• General: Positive for fever, decreased appetite, fatigue
• Gastrointestinal: Negative for nausea, vomiting
      `.trim(),
      lastUpdated: '2024-01-21T14:30:00Z'
    },
    'P007': {
      title: 'Symptoms Record',
      content: `
**Chief Complaint:** Abdominal pain requiring surgery

**History of Present Illness:**
42-year-old male presents with severe right lower quadrant abdominal pain. Pain started suddenly 6 hours ago and has been progressively worsening. Associated with nausea and vomiting.

**Symptom Summary:**
• Abdominal pain - severe intensity, 6 hours duration, constant
• Nausea - moderate severity, 4 hours duration, continuous
• Vomiting - 3 episodes, 2 hours duration
• Fever - low grade, 100.2°F, 2 hours duration

**Review of Systems:**
• Gastrointestinal: Positive for nausea, vomiting, abdominal pain
• General: Positive for fever
• Genitourinary: Negative for urinary symptoms
      `.trim(),
      lastUpdated: '2024-01-17T16:45:00Z'
    },
    'P008': {
      title: 'Symptoms Record',
      content: `
**Chief Complaint:** Prenatal check-up with concern about decreased fetal movement

**History of Present Illness:**
28-year-old female at 32 weeks gestation presents for routine prenatal visit. Reports decreased fetal movement over the past 2 days. No contractions or bleeding.

**Symptom Summary:**
• Decreased fetal movement - noticeable decrease, 2 days duration
• Mild back pain - intermittent, 3 days duration
• Fatigue - mild, ongoing throughout pregnancy
• No contractions or bleeding

**Review of Systems:**
• Obstetric: Positive for decreased fetal movement, mild back pain
• General: Positive for fatigue
• Cardiovascular: Negative for chest pain, palpitations
      `.trim(),
      lastUpdated: '2024-01-22T10:15:00Z'
    },
    'P009': {
      title: 'Symptoms Record',
      content: `
**Chief Complaint:** Depression and anxiety symptoms

**History of Present Illness:**
34-year-old male presents with worsening depression and anxiety over the past month. Reports difficulty sleeping, loss of appetite, and feelings of hopelessness. No suicidal ideation.

**Symptom Summary:**
• Depression - moderate to severe, 1 month duration, continuous
• Anxiety - moderate severity, 3 weeks duration, intermittent
• Insomnia - difficulty falling asleep, 2 weeks duration
• Loss of appetite - moderate, 2 weeks duration

**Review of Systems:**
• Psychiatric: Positive for depression, anxiety, insomnia
• General: Positive for weight loss, fatigue
• Neurological: Negative for concentration issues beyond mood
      `.trim(),
      lastUpdated: '2024-01-14T13:20:00Z'
    },
    'P010': {
      title: 'Symptoms Record',
      content: `
**Chief Complaint:** Increased thirst and frequent urination

**History of Present Illness:**
51-year-old female presents with increased thirst and urination for 2 weeks. Reports feeling tired and has noticed blurred vision occasionally. Family history of diabetes.

**Symptom Summary:**
• Polyuria - increased frequency, 2 weeks duration, continuous
• Polydipsia - increased thirst, 2 weeks duration, continuous
• Fatigue - moderate severity, 1 week duration
• Blurred vision - intermittent, 5 days duration

**Review of Systems:**
• Endocrine: Positive for polyuria, polydipsia
• General: Positive for fatigue
• Ophthalmologic: Positive for blurred vision
      `.trim(),
      lastUpdated: '2024-01-23T09:30:00Z'
    },
    'P011': {
      title: 'Symptoms Record',
      content: `
**Chief Complaint:** Skin rash and itching

**History of Present Illness:**
39-year-old male presents with generalized skin rash and itching for 1 week. Rash started on arms and spread to trunk. No known allergen exposure. Patient reports new laundry detergent use.

**Symptom Summary:**
• Rash - generalized, erythematous, 1 week duration
• Itching - moderate to severe intensity, 1 week duration
• Skin irritation - widespread, 5 days duration
• No fever or systemic symptoms

**Review of Systems:**
• Dermatologic: Positive for rash, itching
• General: Negative for fever, weight loss
• Respiratory: Negative for shortness of breath
      `.trim(),
      lastUpdated: '2024-01-20T15:45:00Z'
    },
    'P012': {
      title: 'Symptoms Record',
      content: `
**Chief Complaint:** Persistent cough and weight loss

**History of Present Illness:**
47-year-old female presents with persistent cough and unintentional weight loss over the past 2 months. Cough is productive with occasional blood-tinged sputum. Patient is a former smoker.

**Symptom Summary:**
• Persistent cough - productive, 2 months duration, continuous
• Hemoptysis - occasional blood-tinged sputum, 2 weeks duration
• Weight loss - 15 pounds over 2 months, unintentional
• Fatigue - moderate severity, 6 weeks duration

**Review of Systems:**
• Respiratory: Positive for cough, hemoptysis
• General: Positive for weight loss, fatigue
• Cardiovascular: Negative for chest pain
      `.trim(),
      lastUpdated: '2024-01-19T11:30:00Z'
    }
  },
  diagnosis: {
    'P001': {
      title: 'Diagnosis Report',
      content: `
**Primary Diagnosis:** Angina Pectoris (I20.9)
**Confidence Level:** High (85%)

**Secondary Diagnoses:**
• Hypertension (I10)
• Type 2 Diabetes Mellitus (E11.9)

**Diagnostic Reasoning:**
Based on patient presentation of exertional chest pain with associated shortness of breath, combined with significant cardiovascular risk factors including diabetes and hypertension, angina pectoris is the most likely diagnosis.

**Supporting Evidence:**
• Chest pain triggered by physical activity
• History of diabetes and hypertension
• Family history of coronary artery disease
• Age and gender risk factors

**Differential Diagnoses Considered:**
• Musculoskeletal chest pain - 25% probability
• Gastroesophageal reflux - 15% probability
• Anxiety-related chest pain - 10% probability
      `.trim(),
      lastUpdated: '2024-01-20T11:45:00Z'
    },
    'P002': {
      title: 'Diagnosis Report',
      content: `
**Primary Diagnosis:** Atrial Fibrillation (I48.0)
**Confidence Level:** High (90%)

**Secondary Diagnoses:**
• Hypertension (I10)
• Hyperlipidemia (E78.5)

**Diagnostic Reasoning:**
Patient presents with classic symptoms of atrial fibrillation including palpitations, fatigue, and mild dyspnea. EKG findings confirm irregular rhythm consistent with atrial fibrillation.

**Supporting Evidence:**
• Irregular heart rhythm on examination
• EKG showing atrial fibrillation
• Symptoms of palpitations and fatigue
• Age-related risk factors

**Treatment Plan:**
• Rate control with beta-blocker
• Anticoagulation assessment
• Cardiology consultation for rhythm management
      `.trim(),
      lastUpdated: '2024-01-18T16:20:00Z'
    },
    'P003': {
      title: 'Diagnosis Report',
      content: `
**Primary Diagnosis:** Gastric Ulcer (K25.9)
**Confidence Level:** Moderate (75%)

**Secondary Diagnoses:**
• Gastroesophageal Reflux Disease (K21.9)
• Rule out gastric malignancy

**Diagnostic Reasoning:**
Patient presents with epigastric pain, nausea, and weight loss. Symptoms are consistent with peptic ulcer disease. The presence of weight loss and night sweats requires further investigation to rule out malignancy.

**Supporting Evidence:**
• Epigastric pain worsening after meals
• Associated nausea and weight loss
• No known H. pylori infection yet
• Age and symptom profile

**Recommended Testing:**
• Upper endoscopy with biopsy
• H. pylori testing
• Complete blood count
• Liver function tests
      `.trim(),
      lastUpdated: '2024-01-20T10:15:00Z'
    },
    'P004': {
      title: 'Diagnosis Report',
      content: `
**Primary Diagnosis:** Migraine with Aura (G43.109)
**Confidence Level:** High (88%)

**Secondary Diagnoses:**
• Tension-type headache (G44.209)

**Diagnostic Reasoning:**
Patient presents with classic migraine symptoms including severe throbbing headache, photophobia, nausea, and visual aura. The presence of flashing lights (visual aura) supports the diagnosis of migraine with aura.

**Supporting Evidence:**
• Throbbing headache with photophobia
• Visual aura (flashing lights)
• Associated nausea
• Age and gender profile
• Response to treatment

**Treatment Plan:**
• Acute treatment with triptans
• Preventive therapy discussion
• Lifestyle modifications
• Neurology follow-up
      `.trim(),
      lastUpdated: '2024-01-16T16:45:00Z'
    },
    'P005': {
      title: 'Diagnosis Report',
      content: `
**Primary Diagnosis:** Osteoarthritis of Right Knee (M17.11)
**Confidence Level:** High (82%)

**Secondary Diagnoses:**
• Knee joint effusion (M25.461)
• Chronic pain syndrome (G89.4)

**Diagnostic Reasoning:**
Patient presents with knee pain, swelling, and stiffness consistent with osteoarthritis. Age, symptoms, and physical examination findings support this diagnosis.

**Supporting Evidence:**
• Joint pain and stiffness
• Swelling and decreased range of motion
• Age-related wear and tear
• No systemic symptoms

**Treatment Plan:**
• NSAIDs for pain and inflammation
• Physical therapy referral
• Weight management counseling
• Orthopedic consultation if conservative treatment fails
      `.trim(),
      lastUpdated: '2024-01-19T12:30:00Z'
    },
    'P006': {
      title: 'Diagnosis Report',
      content: `
**Primary Diagnosis:** Viral Upper Respiratory Infection (J06.9)
**Confidence Level:** High (85%)

**Secondary Diagnoses:**
• Fever of unknown origin (R50.9)

**Diagnostic Reasoning:**
8-year-old patient presents with fever, cough, and decreased appetite consistent with viral upper respiratory infection. No signs of bacterial infection on examination.

**Supporting Evidence:**
• Fever and cough without bacterial symptoms
• Age-appropriate presentation
• No significant respiratory distress
• Clear lung sounds on examination

**Treatment Plan:**
• Supportive care with fluids and rest
• Fever management with acetaminophen
• Monitor for complications
• Follow-up if symptoms worsen
      `.trim(),
      lastUpdated: '2024-01-21T15:00:00Z'
    },
    'P007': {
      title: 'Diagnosis Report',
      content: `
**Primary Diagnosis:** Acute Appendicitis (K35.9)
**Confidence Level:** High (92%)

**Secondary Diagnoses:**
• Post-operative status
• Peritonitis (K65.9)

**Diagnostic Reasoning:**
Patient presented with classic symptoms of acute appendicitis including right lower quadrant pain, nausea, vomiting, and fever. CT scan confirmed acute appendicitis with signs of perforation.

**Supporting Evidence:**
• Right lower quadrant pain
• Positive McBurney's point tenderness
• Elevated white blood cell count
• CT scan findings
• Successful appendectomy

**Treatment Plan:**
• Completed appendectomy
• Antibiotic therapy
• Post-operative monitoring
• Gradual return to normal activities
      `.trim(),
      lastUpdated: '2024-01-17T18:00:00Z'
    },
    'P008': {
      title: 'Diagnosis Report',
      content: `
**Primary Diagnosis:** Decreased Fetal Movement (O36.813)
**Confidence Level:** Moderate (70%)

**Secondary Diagnoses:**
• Pregnancy at 32 weeks gestation (Z34.03)
• Pregnancy-related back pain (O26.892)

**Diagnostic Reasoning:**
Patient reports decreased fetal movement at 32 weeks gestation. Fetal monitoring shows reassuring patterns, but continued observation is warranted.

**Supporting Evidence:**
• Patient-reported decreased fetal movement
• Gestational age 32 weeks
• Reassuring fetal heart rate patterns
• No signs of preterm labor

**Treatment Plan:**
• Continued fetal monitoring
• Kick count instructions
• Follow-up in 48 hours
• Delivery planning discussion
      `.trim(),
      lastUpdated: '2024-01-22T11:30:00Z'
    },
    'P009': {
      title: 'Diagnosis Report',
      content: `
**Primary Diagnosis:** Major Depressive Disorder (F32.2)
**Confidence Level:** High (88%)

**Secondary Diagnoses:**
• Generalized Anxiety Disorder (F41.1)
• Insomnia (G47.00)

**Diagnostic Reasoning:**
Patient meets criteria for major depressive disorder with significant symptoms of depression, anxiety, and sleep disturbance. No suicidal ideation present.

**Supporting Evidence:**
• Persistent depressed mood
• Loss of interest and appetite
• Sleep disturbance
• Feelings of hopelessness
• Functional impairment

**Treatment Plan:**
• Antidepressant therapy
• Psychotherapy referral
• Sleep hygiene counseling
• Regular follow-up appointments
      `.trim(),
      lastUpdated: '2024-01-14T14:45:00Z'
    },
    'P010': {
      title: 'Diagnosis Report',
      content: `
**Primary Diagnosis:** Type 2 Diabetes Mellitus (E11.9)
**Confidence Level:** High (90%)

**Secondary Diagnoses:**
• Diabetic retinopathy (E11.319)
• Polyuria (R35.8)

**Diagnostic Reasoning:**
Patient presents with classic symptoms of diabetes including polyuria, polydipsia, and blurred vision. Laboratory results confirm elevated blood glucose levels.

**Supporting Evidence:**
• Classic symptoms of diabetes
• Elevated blood glucose levels
• Positive family history
• Age and risk factors

**Treatment Plan:**
• Metformin initiation
• Diabetes education
• Ophthalmology referral
• Lifestyle modifications
• Regular monitoring
      `.trim(),
      lastUpdated: '2024-01-23T10:45:00Z'
    },
    'P011': {
      title: 'Diagnosis Report',
      content: `
**Primary Diagnosis:** Contact Dermatitis (L25.9)
**Confidence Level:** High (85%)

**Secondary Diagnoses:**
• Allergic reaction (T78.40)

**Diagnostic Reasoning:**
Patient presents with generalized rash and itching following exposure to new laundry detergent. Clinical presentation and history are consistent with contact dermatitis.

**Supporting Evidence:**
• Temporal relationship with new detergent
• Generalized erythematous rash
• Significant itching
• No systemic symptoms

**Treatment Plan:**
• Discontinue suspected allergen
• Topical corticosteroids
• Antihistamines for itching
• Dermatology follow-up if no improvement
      `.trim(),
      lastUpdated: '2024-01-20T16:30:00Z'
    },
    'P012': {
      title: 'Diagnosis Report',
      content: `
**Primary Diagnosis:** Lung Cancer (C78.00)
**Confidence Level:** High (85%)

**Secondary Diagnoses:**
• Chronic obstructive pulmonary disease (J44.1)
• Tobacco use disorder (Z87.891)

**Diagnostic Reasoning:**
Patient presents with persistent cough, hemoptysis, and weight loss. Imaging reveals lung mass consistent with malignancy. Biopsy confirms lung adenocarcinoma.

**Supporting Evidence:**
• Persistent cough with hemoptysis
• Unintentional weight loss
• Smoking history
• Chest imaging showing lung mass
• Biopsy confirmation

**Treatment Plan:**
• Oncology consultation
• Staging workup
• Multidisciplinary treatment planning
• Smoking cessation counseling
• Palliative care discussion
      `.trim(),
      lastUpdated: '2024-01-19T13:15:00Z'
    }
  },
  visitTranscripts: {
    'P001': {
      title: 'Visit Transcript',
      content: `
**Visit Date:** January 20, 2024
**Provider:** Dr. Smith, Emergency Medicine
**Duration:** 45 minutes

**TRANSCRIPT:**

Dr. Smith: Good morning, Mr. Doe. I'm Dr. Smith. What brings you in today?

Patient: Hi Doctor. I've been having chest pain for the past couple of hours. It started while I was jogging this morning.

Dr. Smith: Can you describe the pain? Is it sharp, dull, crushing?

Patient: It's more like a pressure feeling, right in the center of my chest. It's not sharp, but it's definitely uncomfortable.

Dr. Smith: On a scale of 1 to 10, how would you rate the pain?

Patient: I'd say about a 7. It's pretty uncomfortable.

Dr. Smith: Does it radiate anywhere? To your arms, neck, or jaw?

Patient: Not really, it stays pretty much in the center of my chest.

Dr. Smith: Any shortness of breath with it?

Patient: Yeah, a little bit. I noticed I was getting winded more easily than usual.

Dr. Smith: Any nausea, sweating, or dizziness?

Patient: No nausea or dizziness, but I did sweat a bit, though that could have been from the exercise.

Dr. Smith: Tell me about your medical history. Are you on any medications?

Patient: I take Lisinopril for high blood pressure and Metformin for diabetes. I'm allergic to Penicillin.

Dr. Smith: Any family history of heart problems?

Patient: My father had a heart attack when he was 55. That's actually why I'm a bit worried about this chest pain.

Dr. Smith: I understand your concern. Let's do some tests to make sure everything is okay. We'll start with an EKG and some blood work.

Patient: Okay, that sounds good. How long will that take?

Dr. Smith: The EKG is immediate, and we should have the blood work results in about an hour. In the meantime, I want you to rest and let me know if the pain gets worse.

**END TRANSCRIPT**
      `.trim(),
      lastUpdated: '2024-01-20T11:30:00Z'
    },
    'P002': {
      title: 'Visit Transcript',
      content: `
**Visit Date:** January 18, 2024
**Provider:** Dr. Johnson, Cardiology
**Duration:** 30 minutes

**TRANSCRIPT:**

Dr. Johnson: Good afternoon, Mrs. Smith. I'm Dr. Johnson from Cardiology. I understand you've been having some heart rhythm issues?

Patient: Yes, Doctor. I've been having these episodes where my heart feels like it's racing or fluttering. It's been happening for about a week now.

Dr. Johnson: Can you describe what the episodes feel like?

Patient: It's like my heart is beating really fast and irregularly. Sometimes I feel short of breath, and I get tired more easily than usual.

Dr. Johnson: How long do these episodes last?

Patient: They vary. Sometimes just a few minutes, other times it can go on for an hour or more.

Dr. Johnson: Any chest pain with these episodes?

Patient: Sometimes there's a mild tightness in my chest, but not really pain. More like pressure.

Dr. Johnson: Are you on any medications currently?

Patient: I take medications for my blood pressure and cholesterol. I have the list with me.

Dr. Johnson: Good. Any family history of heart problems?

Patient: My mother had atrial fibrillation when she was older, and my father had high blood pressure.

Dr. Johnson: Based on your symptoms and the EKG we did, it looks like you're experiencing atrial fibrillation. This is a common heart rhythm disorder.

Patient: Is that serious? What does that mean?

Dr. Johnson: It's manageable with proper treatment. We'll start you on medication to control your heart rate and discuss anticoagulation to prevent blood clots.

**END TRANSCRIPT**
      `.trim(),
      lastUpdated: '2024-01-18T15:00:00Z'
    },
    'P003': {
      title: 'Visit Transcript',
      content: `
**Visit Date:** January 20, 2024
**Provider:** Dr. Davis, Internal Medicine
**Duration:** 25 minutes

**TRANSCRIPT:**

Dr. Davis: Good morning, Mr. Brown. What brings you in today?

Patient: Hi Doctor. I've been feeling really tired lately, and I've had some stomach issues. My wife convinced me to come in.

Dr. Davis: How long have you been feeling tired?

Patient: About two weeks now. I used to have a lot of energy, but now I feel exhausted even after a full night's sleep.

Dr. Davis: Tell me about the stomach issues.

Patient: I've been having some nausea, especially in the mornings. And I've lost my appetite. I think I've lost some weight too.

Dr. Davis: Any abdominal pain?

Patient: Yes, there's a dull ache in my upper abdomen. It's not severe, but it's been persistent.

Dr. Davis: Any changes in bowel movements?

Patient: They've been a bit loose, and sometimes there's a darker color to them.

Dr. Davis: Any other symptoms? Fever, night sweats?

Patient: No fever, but I have been sweating more at night.

Dr. Davis: Given your symptoms, I'd like to run some blood tests and possibly schedule some imaging studies. We want to make sure we're not missing anything.

Patient: Okay, that sounds reasonable. Should I be worried?

Dr. Davis: Let's wait for the test results before we draw any conclusions. We'll take good care of you.

**END TRANSCRIPT**
      `.trim(),
      lastUpdated: '2024-01-20T09:45:00Z'
    },
    'P004': {
      title: 'Visit Transcript',
      content: `
**Visit Date:** January 16, 2024
**Provider:** Dr. Thompson, Neurology
**Duration:** 35 minutes

**TRANSCRIPT:**

Dr. Thompson: Good afternoon, Ms. Wilson. I understand you're having severe headaches?

Patient: Yes, Doctor. This headache is unlike anything I've experienced before. It's been going on for about 4 hours now.

Dr. Thompson: Can you describe the headache?

Patient: It's throbbing, mainly on the right side of my head. The pain is about an 8 out of 10. And I'm seeing these flashing lights.

Dr. Thompson: Tell me more about the visual symptoms.

Patient: I started seeing these zigzag lights about 2 hours ago. They're mostly in my left field of vision. It's very distracting.

Dr. Thompson: Any nausea or vomiting?

Patient: Yes, I feel nauseous, and the light is bothering me a lot. I had to turn off all the lights in my room.

Dr. Thompson: Have you had headaches like this before?

Patient: I've had headaches, but nothing this severe. Usually, they're just stress headaches from work.

Dr. Thompson: Any recent changes in your life? Stress, diet, sleep?

Patient: Work has been really stressful lately. I've been working long hours and not sleeping well.

Dr. Thompson: Based on your symptoms, this appears to be a migraine with aura. The visual symptoms you're describing are classic migraine aura.

Patient: Is there anything you can give me for the pain?

Dr. Thompson: Yes, I'll prescribe you a medication that should help with both the pain and nausea. I'll also give you information about preventing future migraines.

**END TRANSCRIPT**
      `.trim(),
      lastUpdated: '2024-01-16T16:00:00Z'
    },
    'P005': {
      title: 'Visit Transcript',
      content: `
**Visit Date:** January 19, 2024
**Provider:** Dr. Lee, Orthopedics
**Duration:** 20 minutes

**TRANSCRIPT:**

Dr. Lee: Good afternoon, Mr. Johnson. I see you're having knee problems?

Patient: Yes, Doctor. My right knee has been killing me for the past few days. It's swollen and stiff.

Dr. Lee: When did this start?

Patient: About 3 days ago. I first noticed it when I woke up in the morning. It was stiff and painful.

Dr. Lee: Any recent injury or trauma to the knee?

Patient: Not that I can remember. I do a lot of walking for work, but nothing unusual.

Dr. Lee: How would you rate the pain on a scale of 1 to 10?

Patient: Right now, it's about a 6, but when I try to walk or go up stairs, it gets to about an 8.

Dr. Lee: Any swelling or warmth in the knee?

Patient: Yes, it's definitely swollen. I can see the difference compared to my left knee. It does feel warm to the touch.

Dr. Lee: Let me examine your knee. Can you try to bend it for me?

Patient: It's hard to bend. It feels really stiff, especially in the morning.

Dr. Lee: Based on the examination and your symptoms, this looks like osteoarthritis. The cartilage in your knee is wearing down, causing inflammation.

Patient: Is there anything I can do about it?

Dr. Lee: We'll start with anti-inflammatory medication and I'll refer you to physical therapy. There are also some lifestyle changes that can help.

**END TRANSCRIPT**
      `.trim(),
      lastUpdated: '2024-01-19T11:45:00Z'
    },
    'P006': {
      title: 'Visit Transcript',
      content: `
**Visit Date:** January 21, 2024
**Provider:** Dr. Miller, Pediatrics
**Duration:** 15 minutes

**TRANSCRIPT:**

Dr. Miller: Hello, Emily. And mom, thank you for bringing her in. What's been going on?

Mother: She's had a fever for about 5 days now, and she's been coughing a lot. She's not eating much either.

Dr. Miller: Emily, can you tell me how you're feeling?

Emily: I don't feel good. My throat hurts a little, and I keep coughing.

Dr. Miller: When did the fever start?

Mother: Monday morning. It's been going up and down, but it gets as high as 101.5 degrees.

Dr. Miller: And the cough?

Mother: That started the same day. It's worse at night. She's been having trouble sleeping because of it.

Dr. Miller: Has she been around anyone who's been sick?

Mother: Not that I know of. She goes to school, but I haven't heard of anything going around.

Dr. Miller: Let me listen to her chest. Emily, can you take some deep breaths for me?

Dr. Miller: Her lungs sound clear. This appears to be a viral upper respiratory infection.

Mother: Is there anything I can give her?

Dr. Miller: For the fever, you can give her children's acetaminophen. Make sure she drinks plenty of fluids and gets rest. It should resolve on its own in a few days.

Mother: Should I keep her home from school?

Dr. Miller: Yes, keep her home until she's been fever-free for 24 hours.

**END TRANSCRIPT**
      `.trim(),
      lastUpdated: '2024-01-21T15:15:00Z'
    },
    'P007': {
      title: 'Visit Transcript',
      content: `
**Visit Date:** January 17, 2024
**Provider:** Dr. Garcia, Surgery
**Duration:** 20 minutes

**TRANSCRIPT:**

Dr. Garcia: Mr. Anderson, I understand you're having severe abdominal pain?

Patient: Yes, Doctor. It started this morning and it's gotten much worse. The pain is in my lower right side.

Dr. Garcia: Can you describe the pain?

Patient: It's sharp and constant. It's about a 9 out of 10 right now. I can't get comfortable in any position.

Dr. Garcia: When exactly did it start?

Patient: About 6 hours ago. It woke me up from sleep. At first, I thought it was just gas, but it kept getting worse.

Dr. Garcia: Any nausea or vomiting?

Patient: Yes, I've thrown up three times in the past hour. I feel really nauseous.

Dr. Garcia: Any fever?

Patient: I think so. I feel hot and cold at the same time.

Dr. Garcia: Let me examine your abdomen. I'm going to press on different areas.

Patient: Ouch! That really hurts right there.

Dr. Garcia: That's McBurney's point. Combined with your symptoms, this is very suggestive of appendicitis.

Patient: Appendicitis? Do I need surgery?

Dr. Garcia: We'll need to do a CT scan to confirm, but based on your symptoms and examination, you'll likely need an appendectomy.

Patient: How soon?

Dr. Garcia: We need to move quickly. I'll order the CT scan now, and we'll get you to the operating room as soon as possible.

**END TRANSCRIPT**
      `.trim(),
      lastUpdated: '2024-01-17T17:30:00Z'
    },
    'P008': {
      title: 'Visit Transcript',
      content: `
**Visit Date:** January 22, 2024
**Provider:** Dr. Rodriguez, Obstetrics
**Duration:** 25 minutes

**TRANSCRIPT:**

Dr. Rodriguez: Good morning, Lisa. How are you feeling today?

Patient: I'm okay, but I'm worried about the baby. I haven't felt as much movement as usual over the past couple of days.

Dr. Rodriguez: When did you first notice the decreased movement?

Patient: About 2 days ago. Usually, the baby is very active, especially in the evenings, but it's been much quieter.

Dr. Rodriguez: How far along are you now?

Patient: 32 weeks. This is my first pregnancy, so I'm not sure what's normal.

Dr. Rodriguez: It's good that you're paying attention to the baby's movements. Let's do a fetal heart rate monitoring to check on the baby.

Patient: Is everything okay? Should I be worried?

Dr. Rodriguez: Decreased fetal movement can happen for various reasons. Let's see what the monitoring shows.

Dr. Rodriguez: The heart rate looks good. The baby's heart rate is strong and regular.

Patient: That's a relief. What about the decreased movement?

Dr. Rodriguez: Sometimes babies have quiet periods, especially as they get bigger and have less room to move around.

Patient: Should I be doing anything different?

Dr. Rodriguez: I want you to do kick counts. Try to count 10 movements in 2 hours. If you don't feel that many, call us right away.

Patient: Okay, I can do that. When should I come back?

Dr. Rodriguez: Let's schedule you for a follow-up in 48 hours, and I want you to call if you have any concerns before then.

**END TRANSCRIPT**
      `.trim(),
      lastUpdated: '2024-01-22T11:00:00Z'
    },
    'P009': {
      title: 'Visit Transcript',
      content: `
**Visit Date:** January 14, 2024
**Provider:** Dr. Wilson, Psychiatry
**Duration:** 50 minutes

**TRANSCRIPT:**

Dr. Wilson: Good afternoon, James. Thank you for coming in today. What brought you to see me?

Patient: I've been struggling with depression for about a month now. It's gotten to the point where I can barely function at work.

Dr. Wilson: Can you tell me more about how you've been feeling?

Patient: I feel hopeless most of the time. I used to enjoy things, but now nothing seems to matter. I have no energy.

Dr. Wilson: How is your sleep?

Patient: Terrible. I can't fall asleep, and when I do, I wake up several times during the night. I'm exhausted all the time.

Dr. Wilson: What about your appetite?

Patient: I've lost about 10 pounds in the past month. I just don't feel like eating.

Dr. Wilson: Have you had any thoughts of hurting yourself?

Patient: No, I don't want to hurt myself. I just want to feel better.

Dr. Wilson: That's good to hear. How is your work and social life?

Patient: I've been calling in sick a lot. I don't want to be around people. I just want to stay home.

Dr. Wilson: Have you experienced depression before?

Patient: Yes, a few years ago after my divorce. But it wasn't this bad.

Dr. Wilson: What helped you then?

Patient: I saw a therapist for a while, and that helped. I didn't take any medication.

Dr. Wilson: Based on what you're telling me, you're experiencing a major depressive episode. I think both therapy and medication could help.

Patient: I'm open to trying both. I just want to feel like myself again.

**END TRANSCRIPT**
      `.trim(),
      lastUpdated: '2024-01-14T14:30:00Z'
    },
    'P010': {
      title: 'Visit Transcript',
      content: `
**Visit Date:** January 23, 2024
**Provider:** Dr. Chen, Endocrinology
**Duration:** 30 minutes

**TRANSCRIPT:**

Dr. Chen: Good morning, Maria. I understand you're having some concerning symptoms?

Patient: Yes, Doctor. I've been drinking water constantly for the past two weeks, and I'm urinating all the time.

Dr. Chen: How much water would you say you're drinking?

Patient: Way more than normal. I carry a water bottle everywhere, and I'm constantly refilling it.

Dr. Chen: And the urination?

Patient: I'm going to the bathroom every hour, sometimes more. It's affecting my work and sleep.

Dr. Chen: Any other symptoms?

Patient: I've been really tired, and my vision has been blurry sometimes. That's actually what made me call for an appointment.

Dr. Chen: Do you have any family history of diabetes?

Patient: Yes, my mother has diabetes, and so does my brother.

Dr. Chen: When did you last have blood work done?

Patient: About a year ago at my annual physical. Everything was normal then.

Dr. Chen: Based on your symptoms and family history, I'm concerned about diabetes. We need to check your blood sugar levels.

Patient: I was worried about that. What does that mean if I have diabetes?

Dr. Chen: If you do have diabetes, it's very manageable with proper treatment. We'll start with blood tests and go from there.

Patient: What kind of treatment?

Dr. Chen: It depends on your blood sugar levels, but it usually involves medication, diet changes, and regular monitoring.

Dr. Chen: I'm going to order some blood work right now. We should have results within a few hours.

**END TRANSCRIPT**
      `.trim(),
      lastUpdated: '2024-01-23T10:00:00Z'
    },
    'P011': {
      title: 'Visit Transcript',
      content: `
**Visit Date:** January 20, 2024
**Provider:** Dr. Patel, Dermatology
**Duration:** 20 minutes

**TRANSCRIPT:**

Dr. Patel: Good afternoon, Christopher. I see you're having a skin issue?

Patient: Yes, Doctor. I've got this rash all over my body, and it's driving me crazy with the itching.

Dr. Patel: When did this start?

Patient: About a week ago. It started on my arms and then spread to my chest and back.

Dr. Patel: Did you change anything recently? New soaps, detergents, foods?

Patient: Actually, yes. My wife bought a new laundry detergent about 10 days ago. Could that be it?

Dr. Patel: That's very possible. Let me take a look at the rash.

Dr. Patel: This looks like contact dermatitis. The distribution pattern is consistent with a reaction to something that came in contact with your skin.

Patient: So it's probably the detergent?

Dr. Patel: Most likely. Have you stopped using it?

Patient: Not yet. I wasn't sure if that was the cause.

Dr. Patel: I'd recommend stopping the new detergent immediately and washing all your clothes with your old detergent.

Patient: How long will it take to go away?

Dr. Patel: Usually a few days to a week once you remove the irritant. I'll prescribe a topical steroid cream to help with the itching.

Patient: Should I be worried about anything else?

Dr. Patel: No, this should resolve completely. If it doesn't improve in a week, come back and see me.

**END TRANSCRIPT**
      `.trim(),
      lastUpdated: '2024-01-20T16:00:00Z'
    },
    'P012': {
      title: 'Visit Transcript',
      content: `
**Visit Date:** January 19, 2024
**Provider:** Dr. Kumar, Oncology
**Duration:** 45 minutes

**TRANSCRIPT:**

Dr. Kumar: Good afternoon, Amanda. Thank you for coming in today. I understand you've been having some concerning symptoms?

Patient: Yes, Doctor. I've had this cough for about two months now, and I've lost a lot of weight without trying.

Dr. Kumar: Tell me about the cough.

Patient: It's persistent. I cough throughout the day, and sometimes there's blood in what I cough up.

Dr. Kumar: How much weight have you lost?

Patient: About 15 pounds in the past two months. I haven't been trying to lose weight.

Dr. Kumar: Do you have a history of smoking?

Patient: Yes, I smoked for about 20 years, but I quit 5 years ago.

Dr. Kumar: Any other symptoms? Chest pain, shortness of breath?

Patient: I get tired easily, and sometimes I feel short of breath when I walk up stairs.

Dr. Kumar: I've reviewed your chest X-ray and CT scan. There's a mass in your right lung that we need to investigate further.

Patient: A mass? Do you think it's cancer?

Dr. Kumar: It's possible, but we need to do a biopsy to know for sure. The biopsy will tell us exactly what type of cells we're dealing with.

Patient: What happens if it is cancer?

Dr. Kumar: If it is cancer, we'll determine the stage and type, and then create a treatment plan. There are many effective treatments available.

Patient: How soon can we do the biopsy?

Dr. Kumar: I'll schedule it for this week. We'll have results within a few days after that.

**END TRANSCRIPT**
      `.trim(),
      lastUpdated: '2024-01-19T12:45:00Z'
    }
  },
  aiAnalysis: {
    'P001': {
      title: 'AI Analysis Report',
      content: `
**AI Analysis Summary**
**Generated:** January 20, 2024 at 11:45 AM
**Confidence Score:** 87%
**Model:** GPT-4 Turbo

**EXTRACTED SYMPTOMS:**
• Chest pain - Moderate severity, 2 hours duration, pressure-like quality (92% confidence)
• Shortness of breath - Mild severity, associated with chest pain (85% confidence)
• Diaphoresis - Mild, exercise-related (78% confidence)

**DIFFERENTIAL DIAGNOSIS:**
1. **Angina Pectoris (I20.9)** - 75% probability
   - Supporting: Exertional chest pain, cardiac risk factors, family history
   - Against: Relatively short duration, no EKG changes noted

2. **Musculoskeletal Chest Pain (M79.3)** - 45% probability
   - Supporting: Exercise-related onset, no radiation pattern
   - Against: Associated shortness of breath, cardiac risk factors

**TREATMENT RECOMMENDATIONS:**
• Immediate: EKG and cardiac enzymes
• Short-term: Sublingual nitroglycerin PRN
• Long-term: Cardiology consultation, stress testing

**FLAGGED CONCERNS:**
⚠️ **HIGH PRIORITY:** Chest pain with cardiac risk factors requires immediate evaluation
⚠️ **MEDIUM PRIORITY:** Patient has diabetes and hypertension - increased cardiac risk

**FOLLOW-UP RECOMMENDATIONS:**
• Cardiology consultation within 1 week
• Stress test if initial workup negative
• Lifestyle counseling for diabetes and hypertension management

**AI CONFIDENCE METRICS:**
• Symptom extraction: 92%
• Diagnosis ranking: 87%
• Treatment recommendations: 84%
• Risk assessment: 91%
      `.trim(),
      lastUpdated: '2024-01-20T11:45:00Z'
    },
    'P002': {
      title: 'AI Analysis Report',
      content: `
**AI Analysis Summary**
**Generated:** January 18, 2024 at 4:30 PM
**Confidence Score:** 91%
**Model:** GPT-4 Turbo

**EXTRACTED SYMPTOMS:**
• Palpitations - Moderate severity, 1 week duration, intermittent (94% confidence)
• Fatigue - Moderate severity, 1 week duration, continuous (88% confidence)
• Chest tightness - Mild severity, associated with palpitations (82% confidence)

**DIFFERENTIAL DIAGNOSIS:**
1. **Atrial Fibrillation (I48.0)** - 85% probability
   - Supporting: Palpitations, fatigue, irregular rhythm on EKG
   - Against: No anticoagulation complications noted

2. **Anxiety Disorder (F41.9)** - 25% probability
   - Supporting: Palpitations, chest tightness
   - Against: EKG changes, family history

**TREATMENT RECOMMENDATIONS:**
• Immediate: Rate control with beta-blockers
• Short-term: Anticoagulation assessment (CHA2DS2-VASc score)
• Long-term: Cardiology consultation for rhythm management

**FLAGGED CONCERNS:**
⚠️ **HIGH PRIORITY:** Atrial fibrillation requires anticoagulation assessment
⚠️ **MEDIUM PRIORITY:** Monitor for heart failure symptoms

**FOLLOW-UP RECOMMENDATIONS:**
• Cardiology consultation within 1 week
• INR monitoring if anticoagulation started
• Lifestyle modifications for heart health

**AI CONFIDENCE METRICS:**
• Symptom extraction: 94%
• Diagnosis ranking: 91%
• Treatment recommendations: 89%
• Risk assessment: 87%
      `.trim(),
      lastUpdated: '2024-01-18T16:30:00Z'
    },
    'P003': {
      title: 'AI Analysis Report',
      content: `
**AI Analysis Summary**
**Generated:** January 20, 2024 at 10:15 AM
**Confidence Score:** 76%
**Model:** GPT-4 Turbo

**EXTRACTED SYMPTOMS:**
• Epigastric pain - Moderate severity, 2 weeks duration, constant (89% confidence)
• Nausea - Moderate severity, 2 weeks duration, intermittent (85% confidence)
• Weight loss - 10 pounds over 2 weeks, unintentional (92% confidence)
• Night sweats - Mild severity, 1 week duration (78% confidence)

**DIFFERENTIAL DIAGNOSIS:**
1. **Gastroesophageal Malignancy** - 65% probability
   - Supporting: Weight loss, abdominal pain, nausea, night sweats
   - Against: Age factor, no dysphagia reported

2. **Peptic Ulcer Disease** - 45% probability
   - Supporting: Upper abdominal pain, nausea
   - Against: No clear pain pattern with meals

3. **Hepatitis** - 35% probability
   - Supporting: Fatigue, nausea, night sweats
   - Against: No jaundice reported

**TREATMENT RECOMMENDATIONS:**
• Immediate: Upper endoscopy with biopsy
• Short-term: H. pylori testing, complete blood count
• Long-term: Gastroenterology consultation

**FLAGGED CONCERNS:**
⚠️ **HIGH PRIORITY:** Weight loss and night sweats require malignancy workup
⚠️ **MEDIUM PRIORITY:** Persistent epigastric pain needs endoscopic evaluation

**FOLLOW-UP RECOMMENDATIONS:**
• Gastroenterology consultation within 1 week
• Upper endoscopy within 2 weeks
• Nutritional assessment if weight loss continues

**AI CONFIDENCE METRICS:**
• Symptom extraction: 89%
• Diagnosis ranking: 76%
• Treatment recommendations: 82%
• Risk assessment: 85%
      `.trim(),
      lastUpdated: '2024-01-20T10:15:00Z'
    },
    'P004': {
      title: 'AI Analysis Report',
      content: `
**AI Analysis Summary**
**Generated:** January 16, 2024 at 5:00 PM
**Confidence Score:** 88%
**Model:** GPT-4 Turbo

**EXTRACTED SYMPTOMS:**
• Severe headache - Throbbing, 4 hours duration, 8/10 intensity (95% confidence)
• Visual aura - Flashing lights, 2 hours duration (92% confidence)
• Photophobia - Moderate severity, 4 hours duration (88% confidence)
• Nausea - Mild severity, 3 hours duration (85% confidence)

**DIFFERENTIAL DIAGNOSIS:**
1. **Migraine with Aura (G43.109)** - 88% probability
   - Supporting: Visual aura, throbbing headache, photophobia, nausea
   - Against: No previous history of similar episodes

2. **Cluster Headache (G44.009)** - 15% probability
   - Supporting: Severe intensity, unilateral
   - Against: Duration, visual symptoms, gender

**TREATMENT RECOMMENDATIONS:**
• Immediate: Sumatriptan 50mg, anti-emetic
• Short-term: Dark room, rest, hydration
• Long-term: Preventive therapy discussion, trigger identification

**FLAGGED CONCERNS:**
⚠️ **MEDIUM PRIORITY:** First severe migraine episode requires monitoring
⚠️ **LOW PRIORITY:** Work stress may be contributing trigger

**FOLLOW-UP RECOMMENDATIONS:**
• Neurology consultation within 2 weeks
• Headache diary for trigger identification
• Lifestyle modifications for stress management

**AI CONFIDENCE METRICS:**
• Symptom extraction: 95%
• Diagnosis ranking: 88%
• Treatment recommendations: 91%
• Risk assessment: 86%
      `.trim(),
      lastUpdated: '2024-01-16T17:00:00Z'
    },
    'P005': {
      title: 'AI Analysis Report',
      content: `
**AI Analysis Summary**
**Generated:** January 19, 2024 at 12:30 PM
**Confidence Score:** 82%
**Model:** GPT-4 Turbo

**EXTRACTED SYMPTOMS:**
• Knee pain - Moderate to severe, 3 days duration, constant (91% confidence)
• Joint swelling - Moderate, right knee, 2 days duration (89% confidence)
• Stiffness - Severe, worse in morning, 3 days duration (87% confidence)
• Functional limitation - Difficulty walking, 2 days duration (85% confidence)

**DIFFERENTIAL DIAGNOSIS:**
1. **Osteoarthritis (M17.11)** - 75% probability
   - Supporting: Age, joint pain and stiffness, no systemic symptoms
   - Against: Acute onset, degree of swelling

2. **Septic Arthritis (M00.9)** - 25% probability
   - Supporting: Acute onset, swelling, pain
   - Against: No fever, no systemic symptoms

**TREATMENT RECOMMENDATIONS:**
• Immediate: NSAIDs, joint aspiration if indicated
• Short-term: Physical therapy referral
• Long-term: Weight management, activity modification

**FLAGGED CONCERNS:**
⚠️ **MEDIUM PRIORITY:** Acute onset requires infection workup
⚠️ **LOW PRIORITY:** Functional limitations affecting daily activities

**FOLLOW-UP RECOMMENDATIONS:**
• Orthopedic consultation within 2 weeks
• Physical therapy evaluation
• Weight management counseling

**AI CONFIDENCE METRICS:**
• Symptom extraction: 91%
• Diagnosis ranking: 82%
• Treatment recommendations: 79%
• Risk assessment: 83%
      `.trim(),
      lastUpdated: '2024-01-19T12:30:00Z'
    },
    'P006': {
      title: 'AI Analysis Report',
      content: `
**AI Analysis Summary**
**Generated:** January 21, 2024 at 3:15 PM
**Confidence Score:** 85%
**Model:** GPT-4 Turbo

**EXTRACTED SYMPTOMS:**
• Fever - Moderate, up to 101.5°F, 5 days duration (93% confidence)
• Cough - Dry, persistent, 5 days duration, worse at night (91% confidence)
• Decreased appetite - Moderate, 3 days duration (88% confidence)
• Fatigue - Mild, 4 days duration (85% confidence)

**DIFFERENTIAL DIAGNOSIS:**
1. **Viral Upper Respiratory Infection (J06.9)** - 85% probability
   - Supporting: Fever, cough, age-appropriate presentation
   - Against: Duration of symptoms

2. **Bacterial Pneumonia (J15.9)** - 20% probability
   - Supporting: Fever, cough
   - Against: Clear lung sounds, no respiratory distress

**TREATMENT RECOMMENDATIONS:**
• Immediate: Supportive care, fluids, rest
• Short-term: Fever management with acetaminophen
• Long-term: Monitor for complications

**FLAGGED CONCERNS:**
⚠️ **LOW PRIORITY:** Typical viral illness in pediatric patient
⚠️ **MONITOR:** Watch for respiratory distress

**FOLLOW-UP RECOMMENDATIONS:**
• Follow-up if symptoms worsen
• Return to school when fever-free for 24 hours
• Hydration and rest

**AI CONFIDENCE METRICS:**
• Symptom extraction: 93%
• Diagnosis ranking: 85%
• Treatment recommendations: 88%
• Risk assessment: 82%
      `.trim(),
      lastUpdated: '2024-01-21T15:15:00Z'
    },
    'P007': {
      title: 'AI Analysis Report',
      content: `
**AI Analysis Summary**
**Generated:** January 17, 2024 at 6:00 PM
**Confidence Score:** 92%
**Model:** GPT-4 Turbo

**EXTRACTED SYMPTOMS:**
• Severe abdominal pain - RLQ, 6 hours duration, 9/10 intensity (96% confidence)
• Nausea - Moderate severity, 4 hours duration, continuous (93% confidence)
• Vomiting - 3 episodes, 2 hours duration (91% confidence)
• Fever - Low grade, 100.2°F, 2 hours duration (89% confidence)

**DIFFERENTIAL DIAGNOSIS:**
1. **Acute Appendicitis (K35.9)** - 92% probability
   - Supporting: RLQ pain, McBurney's point tenderness, fever, nausea
   - Against: None significant

2. **Mesenteric Adenitis (I88.0)** - 10% probability
   - Supporting: Abdominal pain, nausea
   - Against: Localized RLQ pain, positive examination

**TREATMENT RECOMMENDATIONS:**
• Immediate: Emergency appendectomy
• Short-term: IV antibiotics, pain management
• Long-term: Post-operative monitoring

**FLAGGED CONCERNS:**
⚠️ **CRITICAL:** Surgical emergency requiring immediate intervention
⚠️ **HIGH PRIORITY:** Risk of perforation with delay

**FOLLOW-UP RECOMMENDATIONS:**
• Post-operative surgical follow-up
• Gradual return to normal activities
• Wound care instructions

**AI CONFIDENCE METRICS:**
• Symptom extraction: 96%
• Diagnosis ranking: 92%
• Treatment recommendations: 95%
• Risk assessment: 94%
      `.trim(),
      lastUpdated: '2024-01-17T18:00:00Z'
    },
    'P008': {
      title: 'AI Analysis Report',
      content: `
**AI Analysis Summary**
**Generated:** January 22, 2024 at 11:30 AM
**Confidence Score:** 78%
**Model:** GPT-4 Turbo

**EXTRACTED SYMPTOMS:**
• Decreased fetal movement - Noticeable decrease, 2 days duration (89% confidence)
• Mild back pain - Intermittent, 3 days duration (75% confidence)
• Fatigue - Mild, ongoing throughout pregnancy (82% confidence)

**DIFFERENTIAL DIAGNOSIS:**
1. **Decreased Fetal Movement (O36.813)** - 70% probability
   - Supporting: Patient-reported decreased movement, gestational age
   - Against: Reassuring fetal heart rate

2. **Normal Fetal Quiet Period** - 45% probability
   - Supporting: Reassuring fetal monitoring, no other symptoms
   - Against: Patient's subjective concern

**TREATMENT RECOMMENDATIONS:**
• Immediate: Continued fetal monitoring
• Short-term: Kick count instructions
• Long-term: Regular prenatal follow-up

**FLAGGED CONCERNS:**
⚠️ **MEDIUM PRIORITY:** Decreased fetal movement requires close monitoring
⚠️ **LOW PRIORITY:** First pregnancy anxiety is normal

**FOLLOW-UP RECOMMENDATIONS:**
• Follow-up appointment in 48 hours
• Kick count monitoring
• Call with any concerns

**AI CONFIDENCE METRICS:**
• Symptom extraction: 89%
• Diagnosis ranking: 78%
• Treatment recommendations: 85%
• Risk assessment: 80%
      `.trim(),
      lastUpdated: '2024-01-22T11:30:00Z'
    },
    'P009': {
      title: 'AI Analysis Report',
      content: `
**AI Analysis Summary**
**Generated:** January 14, 2024 at 2:45 PM
**Confidence Score:** 88%
**Model:** GPT-4 Turbo

**EXTRACTED SYMPTOMS:**
• Major depression - Moderate to severe, 1 month duration (94% confidence)
• Anxiety - Moderate severity, 3 weeks duration (89% confidence)
• Insomnia - Difficulty falling asleep, 2 weeks duration (91% confidence)
• Appetite loss - Moderate, 2 weeks duration (88% confidence)

**DIFFERENTIAL DIAGNOSIS:**
1. **Major Depressive Disorder (F32.2)** - 88% probability
   - Supporting: Persistent low mood, anhedonia, sleep/appetite changes
   - Against: No psychotic features

2. **Adjustment Disorder with Mixed Anxiety and Depression (F43.23)** - 25% probability
   - Supporting: Previous history of depression
   - Against: Severity and duration of symptoms

**TREATMENT RECOMMENDATIONS:**
• Immediate: Antidepressant therapy (SSRI)
• Short-term: Psychotherapy referral
• Long-term: Regular psychiatric follow-up

**FLAGGED CONCERNS:**
⚠️ **HIGH PRIORITY:** Moderate to severe depression affecting function
⚠️ **MEDIUM PRIORITY:** Work impairment and social isolation

**FOLLOW-UP RECOMMENDATIONS:**
• Psychiatric follow-up in 2 weeks
• Psychotherapy consultation
• Sleep hygiene counseling

**AI CONFIDENCE METRICS:**
• Symptom extraction: 94%
• Diagnosis ranking: 88%
• Treatment recommendations: 91%
• Risk assessment: 89%
      `.trim(),
      lastUpdated: '2024-01-14T14:45:00Z'
    },
    'P010': {
      title: 'AI Analysis Report',
      content: `
**AI Analysis Summary**
**Generated:** January 23, 2024 at 10:45 AM
**Confidence Score:** 90%
**Model:** GPT-4 Turbo

**EXTRACTED SYMPTOMS:**
• Polyuria - Increased frequency, 2 weeks duration (95% confidence)
• Polydipsia - Increased thirst, 2 weeks duration (94% confidence)
• Fatigue - Moderate severity, 1 week duration (88% confidence)
• Blurred vision - Intermittent, 5 days duration (86% confidence)

**DIFFERENTIAL DIAGNOSIS:**
1. **Type 2 Diabetes Mellitus (E11.9)** - 90% probability
   - Supporting: Classic triad of symptoms, family history, age
   - Against: No prior glucose testing

2. **Diabetes Insipidus (E23.2)** - 15% probability
   - Supporting: Polyuria, polydipsia
   - Against: Blurred vision, family history

**TREATMENT RECOMMENDATIONS:**
• Immediate: Blood glucose testing, HbA1c
• Short-term: Metformin initiation if confirmed
• Long-term: Diabetes education, lifestyle modifications
• Regular monitoring

**FLAGGED CONCERNS:**
⚠️ **HIGH PRIORITY:** Classic diabetes symptoms require urgent testing
⚠️ **MEDIUM PRIORITY:** Family history increases risk

**FOLLOW-UP RECOMMENDATIONS:**
• Endocrinology consultation within 1 week
• Ophthalmology referral for retinal screening
• Diabetes education classes

**AI CONFIDENCE METRICS:**
• Symptom extraction: 95%
• Diagnosis ranking: 90%
• Treatment recommendations: 88%
• Risk assessment: 92%
      `.trim(),
      lastUpdated: '2024-01-23T10:45:00Z'
    },
    'P011': {
      title: 'AI Analysis Report',
      content: `
**AI Analysis Summary**
**Generated:** January 20, 2024 at 4:30 PM
**Confidence Score:** 85%
**Model:** GPT-4 Turbo

**EXTRACTED SYMPTOMS:**
• Generalized rash - Erythematous, 1 week duration (92% confidence)
• Pruritus - Moderate to severe intensity, 1 week duration (89% confidence)
• Skin irritation - Widespread, 5 days duration (87% confidence)

**DIFFERENTIAL DIAGNOSIS:**
1. **Contact Dermatitis (L25.9)** - 85% probability
   - Supporting: Temporal relationship with new detergent, distribution
   - Against: No previous known allergies

2. **Atopic Dermatitis (L20.9)** - 20% probability
   - Supporting: Generalized rash, itching
   - Against: Adult onset, trigger identification

**TREATMENT RECOMMENDATIONS:**
• Immediate: Discontinue new detergent
• Short-term: Topical corticosteroids, antihistamines
• Long-term: Avoid identified triggers

**FLAGGED CONCERNS:**
⚠️ **LOW PRIORITY:** Typical allergic contact dermatitis
⚠️ **MONITOR:** Watch for signs of infection from scratching

**FOLLOW-UP RECOMMENDATIONS:**
• Dermatology follow-up in 1 week if no improvement
• Allergy testing if recurrent episodes
• Skin care education

**AI CONFIDENCE METRICS:**
• Symptom extraction: 92%
• Diagnosis ranking: 85%
• Treatment recommendations: 88%
• Risk assessment: 83%
      `.trim(),
      lastUpdated: '2024-01-20T16:30:00Z'
    },
    'P012': {
      title: 'AI Analysis Report',
      content: `
**AI Analysis Summary**
**Generated:** January 19, 2024 at 1:15 PM
**Confidence Score:** 85%
**Model:** GPT-4 Turbo

**EXTRACTED SYMPTOMS:**
• Persistent cough - Productive, 2 months duration (96% confidence)
• Hemoptysis - Occasional blood-tinged sputum, 2 weeks duration (94% confidence)
• Weight loss - 15 pounds over 2 months, unintentional (92% confidence)
• Fatigue - Moderate severity, 6 weeks duration (89% confidence)

**DIFFERENTIAL DIAGNOSIS:**
1. **Lung Cancer (C78.00)** - 85% probability
   - Supporting: Smoking history, hemoptysis, weight loss, imaging findings
   - Against: Age factor

2. **Chronic Obstructive Pulmonary Disease (J44.1)** - 30% probability
   - Supporting: Smoking history, chronic cough
   - Against: Hemoptysis, weight loss

**TREATMENT RECOMMENDATIONS:**
• Immediate: Tissue biopsy, staging workup
• Short-term: Oncology consultation
• Long-term: Multidisciplinary cancer care

**FLAGGED CONCERNS:**
⚠️ **CRITICAL:** High suspicion for lung malignancy
⚠️ **HIGH PRIORITY:** Smoking history with concerning symptoms

**FOLLOW-UP RECOMMENDATIONS:**
• Oncology consultation within 3 days
• Staging CT scan and PET scan
• Multidisciplinary treatment planning

**AI CONFIDENCE METRICS:**
• Symptom extraction: 96%
• Diagnosis ranking: 85%
• Treatment recommendations: 92%
• Risk assessment: 94%
      `.trim(),
      lastUpdated: '2024-01-19T13:15:00Z'
    }
  },
  visitNotes: {
    'P001': {
      title: 'Visit Notes',
      content: `
**VISIT NOTE**
**Date:** January 20, 2024
**Time:** 10:30 AM - 11:45 AM
**Provider:** Dr. Smith, Emergency Medicine
**Visit Type:** Emergency Department

**CHIEF COMPLAINT:**
Chest pain x 2 hours, onset with exercise

**HISTORY OF PRESENT ILLNESS:**
45-year-old male presents with acute onset chest pain that began while jogging approximately 2 hours ago. Patient describes pain as pressure-like, non-radiating, 7/10 intensity. Associated with mild shortness of breath and diaphoresis. No nausea, vomiting, or dizziness. Patient has significant concern due to family history of cardiac disease.

**PAST MEDICAL HISTORY:**
• Hypertension
• Type 2 Diabetes Mellitus
• No known cardiac disease

**MEDICATIONS:**
• Lisinopril 10mg daily
• Metformin 500mg twice daily

**ALLERGIES:**
• Penicillin

**SOCIAL HISTORY:**
• Non-smoker
• Occasional alcohol use
• Regular exercise routine

**PHYSICAL EXAMINATION:**
• Vital Signs: BP 142/88, HR 78, RR 16, O2 Sat 98% on room air
• General: Well-appearing male in no acute distress
• Cardiovascular: Regular rate and rhythm, no murmurs
• Respiratory: Clear to auscultation bilaterally
• Abdomen: Soft, non-tender

**DIAGNOSTIC STUDIES:**
• EKG: Normal sinus rhythm, no acute ST changes
• Chest X-ray: Clear lung fields, normal cardiac silhouette
• Laboratory: Troponin I pending

**ASSESSMENT AND PLAN:**
• Chest pain, likely angina pectoris
• Serial cardiac enzymes
• Cardiology consultation
• Discharge planning pending troponin results

**DISPOSITION:**
Patient stable, awaiting final laboratory results for disposition decision.

**Provider:** Dr. Smith, MD
**Electronically signed:** 01/20/2024 11:45 AM
      `.trim(),
      lastUpdated: '2024-01-20T11:45:00Z'
    },
    'P002': {
      title: 'Visit Notes',
      content: `
**VISIT NOTE**
**Date:** January 18, 2024
**Time:** 2:00 PM - 2:30 PM
**Provider:** Dr. Johnson, Cardiology
**Visit Type:** Cardiology Consultation

**CHIEF COMPLAINT:**
Palpitations and fatigue x 1 week

**HISTORY OF PRESENT ILLNESS:**
62-year-old female presents with new onset palpitations and fatigue over the past week. Episodes described as irregular, rapid heartbeat lasting minutes to hours. Associated with mild dyspnea and chest tightness. No syncope or presyncope.

**PAST MEDICAL HISTORY:**
• Hypertension
• Hyperlipidemia
• No prior cardiac arrhythmias

**MEDICATIONS:**
• Amlodipine 5mg daily
• Atorvastatin 20mg daily

**ALLERGIES:**
• No known drug allergies

**FAMILY HISTORY:**
• Mother: atrial fibrillation
• Father: hypertension

**PHYSICAL EXAMINATION:**
• Vital Signs: BP 136/82, HR 88 irregular, RR 16, O2 Sat 97%
• General: Well-appearing female, no distress
• Cardiovascular: Irregularly irregular rhythm, no murmurs
• Respiratory: Clear bilaterally

**DIAGNOSTIC STUDIES:**
• EKG: Atrial fibrillation with controlled ventricular response
• Echocardiogram: Normal LV function, mild LA enlargement

**ASSESSMENT AND PLAN:**
• New onset atrial fibrillation
• CHA2DS2-VASc score: 3 (age, gender, hypertension)
• Initiate metoprolol for rate control
• Start apixaban for anticoagulation
• Cardiology follow-up in 2 weeks

**Provider:** Dr. Johnson, MD
**Electronically signed:** 01/18/2024 4:30 PM
      `.trim(),
      lastUpdated: '2024-01-18T16:30:00Z'
    },
    'P003': {
      title: 'Visit Notes',
      content: `
**VISIT NOTE**
**Date:** January 20, 2024
**Time:** 9:00 AM - 9:25 AM
**Provider:** Dr. Davis, Internal Medicine
**Visit Type:** Outpatient Consultation

**CHIEF COMPLAINT:**
Fatigue and gastrointestinal symptoms x 2 weeks

**HISTORY OF PRESENT ILLNESS:**
38-year-old male presents with 2-week history of progressive fatigue, nausea, and epigastric pain. Reports 10-pound unintentional weight loss and night sweats. Symptoms worsen after meals. No fever, vomiting, or changes in bowel habits.

**PAST MEDICAL HISTORY:**
• No significant medical history
• No previous surgeries

**MEDICATIONS:**
• None

**ALLERGIES:**
• No known drug allergies

**SOCIAL HISTORY:**
• Social drinker
• Non-smoker
• Works in construction

**PHYSICAL EXAMINATION:**
• Vital Signs: BP 118/76, HR 72, RR 14, Temp 98.6°F
• General: Appears fatigued, mild weight loss evident
• Abdomen: Mild epigastric tenderness, no masses
• Lymph nodes: No palpable adenopathy

**DIAGNOSTIC STUDIES:**
• CBC: Mild anemia (Hgb 11.2)
• CMP: Normal except mild hypoalbuminemia
• Upper endoscopy scheduled

**ASSESSMENT AND PLAN:**
• Epigastric pain with weight loss, rule out peptic ulcer vs malignancy
• H. pylori testing
• Upper endoscopy within 1 week
• Gastroenterology consultation
• Nutritional support

**Provider:** Dr. Davis, MD
**Electronically signed:** 01/20/2024 9:45 AM
      `.trim(),
      lastUpdated: '2024-01-20T09:45:00Z'
    },
    'P004': {
      title: 'Visit Notes',
      content: `
**VISIT NOTE**
**Date:** January 22, 2024
**Time:** 9:00 AM - 10:30 AM
**Provider:** Dr. Thompson, Neurology
**Visit Type:** Outpatient Consultation

**CHIEF COMPLAINT:**
Headaches and dizziness, increasing frequency over past month

**HISTORY OF PRESENT ILLNESS:**
29-year-old female presents with complaint of progressively worsening headaches over the past month. Patient describes headaches as throbbing, primarily frontal and temporal, 6-7/10 intensity. Associated with occasional dizziness, nausea, and photophobia. Episodes occur 3-4 times per week, lasting 4-8 hours each. Patient reports missed work days due to severity.

**PAST MEDICAL HISTORY:**
• Migraines (diagnosed age 22)
• No other significant medical history

**MEDICATIONS:**
• Sumatriptan 50mg PRN for migraines
• Oral contraceptive pills

**ALLERGIES:**
• No known drug allergies

**SOCIAL HISTORY:**
• Non-smoker
• Rare alcohol use
• Office work, high stress environment
• Single, no children

**PHYSICAL EXAMINATION:**
• Vital Signs: BP 118/76, HR 72, RR 14, O2 Sat 99% on room air
• General: Well-appearing female, no acute distress
• Neurological: Alert and oriented x3, normal cognitive function
• Cranial nerves: II-XII intact
• Motor: 5/5 strength in all extremities
• Sensory: Intact to light touch and proprioception
• Reflexes: 2+ and symmetric
• Cerebellar: Normal coordination and balance

**DIAGNOSTIC STUDIES:**
• MRI Brain: Scheduled for next week
• Laboratory: CBC, CMP, ESR, CRP ordered

**ASSESSMENT AND PLAN:**
• Migraine headaches, increasing frequency and severity
• Possible medication overuse headache
• Rule out secondary causes with imaging
• Preventive therapy discussion
• Lifestyle modifications counseling

**DISPOSITION:**
Patient to follow up in 2 weeks with MRI results. Emergency precautions discussed.

**Provider:** Dr. Thompson, MD
**Electronically signed:** 01/22/2024 10:30 AM
      `.trim(),
      lastUpdated: '2024-01-22T10:30:00Z'
    },
    'P005': {
      title: 'Visit Notes',
      content: `
**VISIT NOTE**
**Date:** January 19, 2024
**Time:** 11:00 AM - 11:45 AM
**Provider:** Dr. Lee, Orthopedics
**Visit Type:** Outpatient Consultation

**CHIEF COMPLAINT:**
Right knee pain and swelling x 3 days

**HISTORY OF PRESENT ILLNESS:**
55-year-old male presents with acute onset right knee pain and swelling for 3 days. Pain described as aching, 6-8/10 intensity, worse with movement. Reports difficulty walking and climbing stairs. No trauma or injury recalled. Works in construction with significant walking required.

**PAST MEDICAL HISTORY:**
• Hypertension
• No previous joint problems

**MEDICATIONS:**
• Lisinopril 10mg daily

**ALLERGIES:**
• No known drug allergies

**PHYSICAL EXAMINATION:**
• Vital Signs: BP 138/84, HR 76, RR 14, Temp 98.4°F
• Right knee: Moderate swelling, warmth, decreased range of motion
• Tenderness along joint line
• No erythema or deformity
• McMurray test negative

**DIAGNOSTIC STUDIES:**
• X-ray right knee: Mild joint space narrowing, small osteophytes
• Joint aspiration: Clear fluid, no crystals, no bacteria

**ASSESSMENT AND PLAN:**
• Osteoarthritis right knee with acute flare
• NSAIDs for pain and inflammation
• Physical therapy referral
• Activity modification counseling
• Weight management discussion
• Orthopedic follow-up in 4 weeks

**Provider:** Dr. Lee, MD
**Electronically signed:** 01/19/2024 12:00 PM
      `.trim(),
      lastUpdated: '2024-01-19T12:00:00Z'
    },
    'P006': {
      title: 'Visit Notes',
      content: `
**VISIT NOTE**
**Date:** January 21, 2024
**Time:** 2:30 PM - 3:00 PM
**Provider:** Dr. Miller, Pediatrics
**Visit Type:** Sick Visit

**CHIEF COMPLAINT:**
Fever and cough x 5 days

**HISTORY OF PRESENT ILLNESS:**
8-year-old female accompanied by mother presents with 5-day history of fever and cough. Fever peaks at 101.5°F, responsive to acetaminophen. Cough is dry, worse at night, affecting sleep. Decreased appetite and activity level. No known sick contacts.

**PAST MEDICAL HISTORY:**
• No significant medical history
• Immunizations up to date

**MEDICATIONS:**
• Children's acetaminophen PRN fever

**ALLERGIES:**
• No known drug allergies

**PHYSICAL EXAMINATION:**
• Vital Signs: Temp 100.8°F, HR 108, RR 22, O2 Sat 98%
• General: Alert child, appears mildly ill
• HEENT: Mild pharyngeal erythema, no exudate
• Respiratory: Clear to auscultation, no wheeze or stridor
• Cardiovascular: Regular rate and rhythm

**DIAGNOSTIC STUDIES:**
• Rapid strep test: Negative
• No further testing indicated

**ASSESSMENT AND PLAN:**
• Viral upper respiratory infection
• Supportive care with fluids and rest
• Continue acetaminophen for fever
• Honey for cough (age appropriate)
• Return to school when fever-free x 24 hours
• Follow-up if symptoms worsen

**Provider:** Dr. Miller, MD
**Electronically signed:** 01/21/2024 3:15 PM
      `.trim(),
      lastUpdated: '2024-01-21T15:15:00Z'
    },
    'P007': {
      title: 'Visit Notes',
      content: `
**VISIT NOTE**
**Date:** January 17, 2024
**Time:** 4:00 PM - 6:30 PM
**Provider:** Dr. Garcia, Surgery
**Visit Type:** Emergency Surgery

**CHIEF COMPLAINT:**
Severe right lower quadrant abdominal pain x 6 hours

**HISTORY OF PRESENT ILLNESS:**
42-year-old male presents with severe abdominal pain that began 6 hours ago. Pain initially periumbilical, then localized to right lower quadrant. Associated with nausea, vomiting, and low-grade fever. Progressive worsening despite position changes.

**PAST MEDICAL HISTORY:**
• No significant medical history
• No previous surgeries

**MEDICATIONS:**
• None

**ALLERGIES:**
• No known drug allergies

**PHYSICAL EXAMINATION:**
• Vital Signs: BP 128/82, HR 96, RR 18, Temp 100.2°F
• General: Appears uncomfortable, guarding abdomen
• Abdomen: Right lower quadrant tenderness, positive McBurney's sign
• Rebound tenderness present
• Bowel sounds decreased

**DIAGNOSTIC STUDIES:**
• CT abdomen/pelvis: Acute appendicitis with surrounding inflammation
• CBC: WBC 14,800 with left shift
• Urinalysis: Normal

**ASSESSMENT AND PLAN:**
• Acute appendicitis
• Emergency laparoscopic appendectomy performed
• IV antibiotics (cefazolin and metronidazole)
• Post-operative monitoring
• Diet advancement as tolerated

**SURGICAL NOTE:**
Successful laparoscopic appendectomy. Inflamed appendix removed intact. No complications.

**Provider:** Dr. Garcia, MD
**Electronically signed:** 01/17/2024 7:00 PM
      `.trim(),
      lastUpdated: '2024-01-17T19:00:00Z'
    },
    'P008': {
      title: 'Visit Notes',
      content: `
**VISIT NOTE**
**Date:** January 22, 2024
**Time:** 10:00 AM - 10:45 AM
**Provider:** Dr. Rodriguez, Obstetrics
**Visit Type:** Prenatal Visit

**CHIEF COMPLAINT:**
32 weeks gestation, decreased fetal movement x 2 days

**HISTORY OF PRESENT ILLNESS:**
28-year-old G1P0 at 32 weeks gestation presents with concern about decreased fetal movement over past 2 days. Usually very active baby, but movement has been noticeably decreased. No contractions, bleeding, or fluid leakage. Mild back pain noted.

**OBSTETRIC HISTORY:**
• G1P0, EDD: March 15, 2024
• Prenatal course uncomplicated
• All screening tests normal

**MEDICATIONS:**
• Prenatal vitamins
• Iron supplement

**ALLERGIES:**
• No known drug allergies

**PHYSICAL EXAMINATION:**
• Vital Signs: BP 118/72, HR 78, RR 16
• Fundal height: 31 cm (appropriate for gestational age)
• Fetal heart rate: 140s, reactive
• No contractions palpated
• Cervix closed on speculum exam

**DIAGNOSTIC STUDIES:**
• Non-stress test: Reactive
• Fetal movement count instructed

**ASSESSMENT AND PLAN:**
• 32 weeks gestation with decreased fetal movement
• Reassuring fetal testing
• Kick count instructions provided
• Follow-up in 48 hours
• Call with any concerns
• Continue routine prenatal care

**Provider:** Dr. Rodriguez, MD
**Electronically signed:** 01/22/2024 11:00 AM
      `.trim(),
      lastUpdated: '2024-01-22T11:00:00Z'
    },
    'P009': {
      title: 'Visit Notes',
      content: `
**VISIT NOTE**
**Date:** January 14, 2024
**Time:** 1:00 PM - 2:00 PM
**Provider:** Dr. Wilson, Psychiatry
**Visit Type:** Initial Psychiatric Evaluation

**CHIEF COMPLAINT:**
Depression and anxiety symptoms x 1 month

**HISTORY OF PRESENT ILLNESS:**
34-year-old male presents with 1-month history of worsening depression and anxiety. Reports persistent low mood, anhedonia, insomnia, and decreased appetite with 10-pound weight loss. Significant impairment in work and social functioning. No suicidal ideation. Previous episode treated with therapy alone.

**PSYCHIATRIC HISTORY:**
• Major depression 3 years ago (post-divorce)
• Treated with psychotherapy, good response
• No previous hospitalizations

**MEDICATIONS:**
• None currently

**ALLERGIES:**
• No known drug allergies

**SOCIAL HISTORY:**
• Divorced, lives alone
• Works in sales, frequent travel
• No substance use
• Limited social support

**MENTAL STATUS EXAM:**
• Appearance: Casually dressed, poor grooming
• Mood: Depressed
• Affect: Dysthymic, congruent
• Thought process: Linear, goal-directed
• Thought content: No delusions, no suicidal ideation
• Cognition: Intact

**ASSESSMENT AND PLAN:**
• Major Depressive Disorder, moderate severity
• Generalized Anxiety Disorder
• Insomnia disorder
• Initiate sertraline 50mg daily
• Psychotherapy referral
• Sleep hygiene counseling
• Follow-up in 2 weeks

**Provider:** Dr. Wilson, MD
**Electronically signed:** 01/14/2024 2:30 PM
      `.trim(),
      lastUpdated: '2024-01-14T14:30:00Z'
    },
    'P010': {
      title: 'Visit Notes',
      content: `
**VISIT NOTE**
**Date:** January 23, 2024
**Time:** 9:00 AM - 10:00 AM
**Provider:** Dr. Chen, Endocrinology
**Visit Type:** New Patient Consultation

**CHIEF COMPLAINT:**
Polyuria, polydipsia, and fatigue x 2 weeks

**HISTORY OF PRESENT ILLNESS:**
51-year-old female presents with 2-week history of increased urination and thirst. Reports urinating every hour, carrying water bottle constantly. Associated with fatigue and intermittent blurred vision. 15-pound unintentional weight loss over 2 months.

**PAST MEDICAL HISTORY:**
• Hypertension
• Hyperlipidemia

**FAMILY HISTORY:**
• Mother: Type 2 diabetes
• Brother: Type 2 diabetes

**MEDICATIONS:**
• Lisinopril 10mg daily
• Simvastatin 20mg daily

**PHYSICAL EXAMINATION:**
• Vital Signs: BP 142/88, HR 82, RR 16, BMI 28.5
• General: Overweight female, appears fatigued
• HEENT: Mild dry mucous membranes
• Cardiovascular: Regular rate and rhythm
• Extremities: No edema, pulses intact

**DIAGNOSTIC STUDIES:**
• Random glucose: 284 mg/dL
• HbA1c: 9.8%
• Urinalysis: Glucose 3+, ketones negative
• Creatinine: Normal

**ASSESSMENT AND PLAN:**
• New diagnosis Type 2 Diabetes Mellitus
• Diabetic ketosis ruled out
• Initiate metformin 500mg twice daily
• Diabetes education referral
• Ophthalmology referral for retinal screening
• Lifestyle counseling
• Follow-up in 2 weeks

**Provider:** Dr. Chen, MD
**Electronically signed:** 01/23/2024 10:15 AM
      `.trim(),
      lastUpdated: '2024-01-23T10:15:00Z'
    },
    'P011': {
      title: 'Visit Notes',
      content: `
**VISIT NOTE**
**Date:** January 20, 2024
**Time:** 3:00 PM - 3:30 PM
**Provider:** Dr. Patel, Dermatology
**Visit Type:** Dermatology Consultation

**CHIEF COMPLAINT:**
Generalized rash and itching x 1 week

**HISTORY OF PRESENT ILLNESS:**
39-year-old male presents with 1-week history of generalized erythematous rash and intense itching. Rash began on arms and spread to trunk. Patient reports new laundry detergent use 10 days ago. No fever or systemic symptoms.

**PAST MEDICAL HISTORY:**
• No significant medical history
• No known allergies

**MEDICATIONS:**
• None

**ALLERGIES:**
• No known drug allergies

**PHYSICAL EXAMINATION:**
• Vital Signs: BP 126/78, HR 74, RR 14, Temp 98.6°F
• Skin: Diffuse erythematous patches on arms, chest, and back
• No vesicles or bullae
• Multiple excoriation marks from scratching
• No lymphadenopathy

**DIAGNOSTIC STUDIES:**
• None indicated based on clinical presentation

**ASSESSMENT AND PLAN:**
• Allergic contact dermatitis, likely due to laundry detergent
• Discontinue new detergent immediately
• Rewash all clothes with previous detergent
• Triamcinolone 0.1% cream twice daily
• Oral antihistamine for pruritus
• Follow-up in 1 week if no improvement

**Provider:** Dr. Patel, MD
**Electronically signed:** 01/20/2024 3:45 PM
      `.trim(),
      lastUpdated: '2024-01-20T15:45:00Z'
    },
    'P012': {
      title: 'Visit Notes',
      content: `
**VISIT NOTE**
**Date:** January 19, 2024
**Time:** 11:00 AM - 12:00 PM
**Provider:** Dr. Kumar, Oncology
**Visit Type:** Oncology Consultation

**CHIEF COMPLAINT:**
Persistent cough with hemoptysis and weight loss

**HISTORY OF PRESENT ILLNESS:**
47-year-old female presents with 2-month history of persistent productive cough with occasional blood-tinged sputum. 15-pound unintentional weight loss over same period. Progressive fatigue and dyspnea on exertion. Former smoker (20 pack-years, quit 5 years ago).

**PAST MEDICAL HISTORY:**
• Smoking cessation 5 years ago
• No other significant medical history

**MEDICATIONS:**
• None

**ALLERGIES:**
• No known drug allergies

**SOCIAL HISTORY:**
• Former smoker: 20 pack-years
• Divorced, lives alone
• Works as accountant

**PHYSICAL EXAMINATION:**
• Vital Signs: BP 118/74, HR 88, RR 18, O2 Sat 96%
• General: Cachectic appearance, weight loss evident
• Respiratory: Decreased breath sounds right upper lobe
• Lymph nodes: No palpable adenopathy
• Extremities: Clubbing noted

**DIAGNOSTIC STUDIES:**
• Chest CT: 3.2 cm mass right upper lobe with mediastinal nodes
• Bronchoscopy with biopsy: Adenocarcinoma
• PET scan: Hypermetabolic lung mass, mediastinal nodes

**ASSESSMENT AND PLAN:**
• Stage IIIA lung adenocarcinoma
• Multidisciplinary team discussion
• Oncology treatment planning
• Palliative care consultation
• Smoking cessation reinforcement
• Social work referral

**Provider:** Dr. Kumar, MD
**Electronically signed:** 01/19/2024 12:30 PM
      `.trim(),
      lastUpdated: '2024-01-19T12:30:00Z'
    }
  }
};

interface DocumentContentViewerProps {
  open: boolean;
  onClose: () => void;
  documentType: string;
  documentLabel: string;
  patient: PatientRecord;
}

const DocumentContentViewer: React.FC<DocumentContentViewerProps> = ({ 
  open, 
  onClose, 
  documentType, 
  documentLabel, 
  patient 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'txt'>('pdf');
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  const documentData = (mockDocumentContent as any)[documentType]?.[patient.patientId];
  
  const handleDownload = async () => {
    if (!documentData?.content) return;
    
    setIsExporting(true);
    try {
      const filename = `${documentType}-${patient.patientId}-${new Date().toISOString().split('T')[0]}`;
      await exportTranscript(documentData.content, exportFormat, filename);
      setShowExportDialog(false);
    } catch (error) {
      console.error('Download failed:', error);
      // You might want to show an error message here
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">{documentLabel}</Typography>
              <Typography variant="body2" color="text.secondary">
                {patient.firstName} {patient.lastName} - {patient.patientId}
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {documentData ? (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Last Updated: {format(new Date(documentData.lastUpdated), 'PPpp')}
              </Alert>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    whiteSpace: 'pre-line',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    lineHeight: 1.6
                  }}
                >
                  {documentData.content}
                </Typography>
              </Paper>
            </Box>
          ) : (
            <Alert severity="warning">
              No document content available for this patient.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          {documentData && (
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />}
              onClick={() => setShowExportDialog(true)}
              disabled={isExporting}
            >
              {isExporting ? 'Downloading...' : 'Download'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Export Format Dialog */}
      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)}>
        <DialogTitle>Export Document</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Format</InputLabel>
            <Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'docx' | 'txt')}
              label="Format"
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="docx">Microsoft Word</MenuItem>
              <MenuItem value="txt">Plain Text</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDownload} 
            variant="contained"
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

interface DocumentViewerProps {
  open: boolean;
  onClose: () => void;
  patient: PatientRecord;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ open, onClose, patient }) => {
  const [documentContentOpen, setDocumentContentOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [selectedDocumentLabel, setSelectedDocumentLabel] = useState<string>('');

  const documentTypes = [
    { key: 'symptoms', label: 'Symptoms Record', icon: <HospitalIcon />, available: patient.documents.symptoms },
    { key: 'diagnosis', label: 'Diagnosis Report', icon: <AssessmentIcon />, available: patient.documents.diagnosis },
    { key: 'visitTranscripts', label: 'Visit Transcripts', icon: <TranscriptIcon />, available: patient.documents.visitTranscripts },
    { key: 'aiAnalysis', label: 'AI Analysis', icon: <PsychologyIcon />, available: patient.documents.aiAnalysis },
    { key: 'visitNotes', label: 'Visit Notes', icon: <DescriptionIcon />, available: patient.documents.visitNotes },
  ];

  const handleViewDocument = (documentType: string, documentLabel: string) => {
    setSelectedDocumentType(documentType);
    setSelectedDocumentLabel(documentLabel);
    setDocumentContentOpen(true);
  };

  const handleCloseDocumentContent = () => {
    setDocumentContentOpen(false);
    setSelectedDocumentType('');
    setSelectedDocumentLabel('');
  };

  const handleClose = () => {
    setDocumentContentOpen(false);
    setSelectedDocumentType('');
    setSelectedDocumentLabel('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">
              {patient.firstName} {patient.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Patient ID: {patient.patientId} | Case: {patient.caseNumber}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Department</Typography>
            <Typography variant="body1">{patient.department}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Attending Provider</Typography>
            <Typography variant="body1">{patient.attendingProvider}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Date Incharged</Typography>
            <Typography variant="body1">{format(patient.dateIncharged, 'MMM dd, yyyy')}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Date Discharged</Typography>
            <Typography variant="body1">
              {patient.dateDischarged ? format(patient.dateDischarged, 'MMM dd, yyyy') : 'Still Active'}
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>Available Documents</Typography>
        <List>
          {documentTypes.map((doc) => (
            <ListItem key={doc.key}>
              <ListItemIcon>
                {doc.icon}
              </ListItemIcon>
              <ListItemText
                primary={doc.label}
                secondary={doc.available ? 'Available' : 'Not available'}
              />
              <Button
                variant={doc.available ? 'contained' : 'outlined'}
                disabled={!doc.available}
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => handleViewDocument(doc.key, doc.label)}
              >
                View
              </Button>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
      
      <DocumentContentViewer
        open={documentContentOpen}
        onClose={handleCloseDocumentContent}
        documentType={selectedDocumentType}
        documentLabel={selectedDocumentLabel}
        patient={patient}
      />
    </Dialog>
  );
};

export const PatientManagement: React.FC = () => {
  const [patients] = useState<PatientRecord[]>(mockPatientData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof PatientRecord>('lastVisitDate');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Keyboard shortcuts integration
  const { addPatientShortcuts, registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  // Filter and search logic
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = 
        patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.caseNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || patient.status === selectedStatus;
      const matchesDepartment = selectedDepartment === 'all' || patient.department === selectedDepartment;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [patients, searchTerm, selectedStatus, selectedDepartment]);

  // Sort logic
  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return order === 'asc' ? 1 : -1;
      if (bValue == null) return order === 'asc' ? -1 : 1;
      
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }
      
      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredPatients, orderBy, order]);

  // Pagination
  const paginatedPatients = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedPatients.slice(start, start + rowsPerPage);
  }, [sortedPatients, page, rowsPerPage]);

  // Set up patient switching shortcuts
  useEffect(() => {
    // Register shortcuts for first 9 patients in the current view
    const visiblePatients = paginatedPatients.slice(0, 9);
    const patientShortcuts = visiblePatients.map(patient => ({
      id: patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
    }));
    
    addPatientShortcuts(patientShortcuts);

    // Register focus search shortcut
    registerShortcut({
      key: 'f',
      ctrlKey: true,
      description: 'Focus search input',
      action: () => {
        const searchInput = document.querySelector('input[placeholder="Search patients..."]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      category: 'patient',
      context: 'patient-list',
      preventDefault: true,
    });

    // Cleanup function
    return () => {
      // Unregister patient shortcuts
      for (let i = 1; i <= 9; i++) {
        unregisterShortcut(i.toString(), { altKey: true });
      }
      unregisterShortcut('f', { ctrlKey: true });
    };
  }, [paginatedPatients, addPatientShortcuts, registerShortcut, unregisterShortcut]);

  const handleSort = (property: keyof PatientRecord) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleViewDocuments = (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setDocumentViewerOpen(true);
  };

  const handlePatientSelect = (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setDocumentViewerOpen(true);
  };

  const handleExportPatients = () => {
    // Convert patients to CSV format
    const csvHeaders = [
      'Patient ID', 'First Name', 'Last Name', 'Case Number', 'Age', 'Gender',
      'Status', 'Department', 'Attending Provider', 'Date Incharged', 'Date Discharged',
      'Last Visit Date', 'Phone Number', 'Has Symptoms', 'Has Diagnosis', 
      'Has Transcripts', 'Has AI Analysis', 'Has Visit Notes'
    ];
    
    const csvData = filteredPatients.map(patient => [
      patient.patientId,
      patient.firstName,
      patient.lastName,
      patient.caseNumber,
      patient.age.toString(),
      patient.gender,
      patient.status,
      patient.department,
      patient.attendingProvider,
      format(patient.dateIncharged, 'yyyy-MM-dd'),
      patient.dateDischarged ? format(patient.dateDischarged, 'yyyy-MM-dd') : 'N/A',
      format(patient.lastVisitDate, 'yyyy-MM-dd'),
      patient.phoneNumber || 'N/A',
      patient.documents.symptoms ? 'Yes' : 'No',
      patient.documents.diagnosis ? 'Yes' : 'No',
      patient.documents.visitTranscripts ? 'Yes' : 'No',
      patient.documents.aiAnalysis ? 'Yes' : 'No',
      patient.documents.visitNotes ? 'Yes' : 'No'
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `patients_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'discharged':
        return 'primary';
      case 'transferred':
        return 'warning';
      default:
        return 'default';
    }
  };

  const uniqueDepartments = [...new Set(patients.map(p => p.department))];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Patient Management
      </Typography>
      
      {/* Keyboard shortcuts info */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          💡 <strong>Keyboard Shortcuts:</strong> Use <strong>Alt + 1-9</strong> to quickly switch to patients 1-9 in the list below. 
          Use <strong>Ctrl + F</strong> to focus the search input.
        </Typography>
      </Alert>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <TextField
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportPatients}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
            >
              Add Patient
            </Button>
          </Stack>

          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={() => setFilterAnchorEl(null)}
          >
            <MenuItem onClick={() => setSelectedStatus('all')}>All Status</MenuItem>
            <MenuItem onClick={() => setSelectedStatus('active')}>Active</MenuItem>
            <MenuItem onClick={() => setSelectedStatus('discharged')}>Discharged</MenuItem>
            <MenuItem onClick={() => setSelectedStatus('transferred')}>Transferred</MenuItem>
            <Divider />
            <MenuItem onClick={() => setSelectedDepartment('all')}>All Departments</MenuItem>
            {uniqueDepartments.map(dept => (
              <MenuItem key={dept} onClick={() => setSelectedDepartment(dept)}>
                {dept}
              </MenuItem>
            ))}
          </Menu>

          <Typography variant="body2" color="text.secondary">
            Showing {paginatedPatients.length} of {filteredPatients.length} patients
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Shortcut</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'firstName'}
                    direction={orderBy === 'firstName' ? order : 'asc'}
                    onClick={() => handleSort('firstName')}
                  >
                    First Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'lastName'}
                    direction={orderBy === 'lastName' ? order : 'asc'}
                    onClick={() => handleSort('lastName')}
                  >
                    Last Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'patientId'}
                    direction={orderBy === 'patientId' ? order : 'asc'}
                    onClick={() => handleSort('patientId')}
                  >
                    Patient ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'caseNumber'}
                    direction={orderBy === 'caseNumber' ? order : 'asc'}
                    onClick={() => handleSort('caseNumber')}
                  >
                    Case Number
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'dateIncharged'}
                    direction={orderBy === 'dateIncharged' ? order : 'asc'}
                    onClick={() => handleSort('dateIncharged')}
                  >
                    Date Incharged
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'dateDischarged'}
                    direction={orderBy === 'dateDischarged' ? order : 'asc'}
                    onClick={() => handleSort('dateDischarged')}
                  >
                    Date Discharged
                  </TableSortLabel>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>View Documents</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPatients.map((patient, index) => (
                <TableRow 
                  key={patient.id} 
                  hover 
                  onClick={() => handlePatientSelect(patient)}
                  sx={{ 
                    cursor: 'pointer',
                    backgroundColor: selectedPatient?.id === patient.id ? 'action.selected' : 'inherit',
                  }}
                >
                  <TableCell>
                    {index < 9 && (
                      <Tooltip title={`Alt + ${index + 1}`}>
                        <Badge
                          badgeContent={index + 1}
                          color="primary"
                          sx={{
                            '& .MuiBadge-badge': {
                              fontSize: '0.7rem',
                              minWidth: '18px',
                              height: '18px',
                            },
                          }}
                        >
                          <Box sx={{ width: 20, height: 20 }} />
                        </Badge>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                      </Avatar>
                      {patient.firstName}
                    </Box>
                  </TableCell>
                  <TableCell>{patient.lastName}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {patient.patientId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {patient.caseNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {format(patient.dateIncharged, 'MMM dd, yyyy')}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {patient.dateDischarged ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {format(patient.dateDischarged, 'MMM dd, yyyy')}
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Still Active
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                      color={getStatusColor(patient.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {patient.department}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View patient documents">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDocuments(patient);
                        }}
                        color="primary"
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPatients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {selectedPatient && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          patient={selectedPatient}
        />
      )}
    </Box>
  );
}; 