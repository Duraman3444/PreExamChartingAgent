import React, { useState, useMemo } from 'react';
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
  useTheme,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
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
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

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

// Mock data for demonstration
const mockPatientData: PatientRecord[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    patientId: 'P001',
    caseNumber: 'CS-2024-001',
    dateIncharged: new Date('2024-01-15'),
    dateDischarged: new Date('2024-01-20'),
    status: 'discharged',
    department: 'Emergency',
    attendingProvider: 'Dr. Smith',
    documents: {
      symptoms: true,
      diagnosis: true,
      visitTranscripts: true,
      aiAnalysis: true,
      visitNotes: true,
    },
    lastVisitDate: new Date('2024-01-20'),
    age: 45,
    gender: 'male',
    phoneNumber: '555-0123',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    patientId: 'P002',
    caseNumber: 'CS-2024-002',
    dateIncharged: new Date('2024-01-18'),
    dateDischarged: null,
    status: 'active',
    department: 'Cardiology',
    attendingProvider: 'Dr. Johnson',
    documents: {
      symptoms: true,
      diagnosis: true,
      visitTranscripts: true,
      aiAnalysis: false,
      visitNotes: false,
    },
    lastVisitDate: new Date('2024-01-18'),
    age: 62,
    gender: 'female',
    phoneNumber: '555-0456',
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Brown',
    patientId: 'P003',
    caseNumber: 'CS-2024-003',
    dateIncharged: new Date('2024-01-20'),
    dateDischarged: null,
    status: 'active',
    department: 'Internal Medicine',
    attendingProvider: 'Dr. Davis',
    documents: {
      symptoms: true,
      diagnosis: false,
      visitTranscripts: true,
      aiAnalysis: true,
      visitNotes: false,
    },
    lastVisitDate: new Date('2024-01-20'),
    age: 38,
    gender: 'male',
    phoneNumber: '555-0789',
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Wilson',
    patientId: 'P004',
    caseNumber: 'CS-2024-004',
    dateIncharged: new Date('2024-01-16'),
    dateDischarged: new Date('2024-01-22'),
    status: 'discharged',
    department: 'Neurology',
    attendingProvider: 'Dr. Thompson',
    documents: {
      symptoms: true,
      diagnosis: true,
      visitTranscripts: true,
      aiAnalysis: true,
      visitNotes: true,
    },
    lastVisitDate: new Date('2024-01-22'),
    age: 29,
    gender: 'female',
    phoneNumber: '555-0321',
  },
];

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
    'P003': {
      title: 'AI Analysis Report',
      content: `
**AI Analysis Summary**
**Generated:** January 20, 2024 at 10:15 AM
**Confidence Score:** 74%
**Model:** GPT-4 Turbo

**EXTRACTED SYMPTOMS:**
• Fatigue - Severe severity, 2 weeks duration, persistent (89% confidence)
• Nausea - Moderate severity, morning predominant (82% confidence)
• Abdominal pain - Mild severity, upper abdomen, dull ache (78% confidence)
• Weight loss - Unintentional, gradual onset (85% confidence)
• Night sweats - Mild severity, recent onset (71% confidence)

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
• Immediate: Complete blood count, comprehensive metabolic panel
• Short-term: Upper endoscopy, CT abdomen/pelvis
• Long-term: Gastroenterology consultation

**FLAGGED CONCERNS:**
⚠️ **HIGH PRIORITY:** Unintentional weight loss requires immediate investigation
⚠️ **HIGH PRIORITY:** Combination of symptoms suggests possible malignancy

**FOLLOW-UP RECOMMENDATIONS:**
• Gastroenterology consultation within 1 week
• Nutritional assessment
• Oncology consultation if imaging abnormal

**AI CONFIDENCE METRICS:**
• Symptom extraction: 81%
• Diagnosis ranking: 74%
• Treatment recommendations: 77%
• Risk assessment: 88%
      `.trim(),
      lastUpdated: '2024-01-20T10:15:00Z'
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
  const documentData = (mockDocumentContent as any)[documentType]?.[patient.patientId];
  
  return (
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
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Download
          </Button>
        )}
      </DialogActions>
    </Dialog>
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
  const theme = useTheme();
  const [patients, setPatients] = useState<PatientRecord[]>(mockPatientData);
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

  const handleSort = (property: keyof PatientRecord) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleViewDocuments = (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setDocumentViewerOpen(true);
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
              {paginatedPatients.map((patient) => (
                <TableRow key={patient.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {patient.firstName.charAt(0)}
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
                        onClick={() => handleViewDocuments(patient)}
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
          onPageChange={(event, newPage) => setPage(newPage)}
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