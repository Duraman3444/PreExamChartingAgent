import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Stack,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  Warning as WarningIcon,
  AutoAwesome as AutoAwesomeIcon,
  RecordVoiceOver as TranscriptionIcon,
  Comment as CommentIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  LocalHospital as HospitalIcon,
  MedicalServices as MedicalServicesIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  HealthAndSafety as HealthAndSafetyIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { openAIService } from '@/services/openai';
import { ROUTES } from '@/constants';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  confidence: number;
  duration: string;
  location?: string;
  quality?: string;
  associatedFactors: string[];
  sourceText: string;
}

interface Diagnosis {
  id: string;
  condition: string;
  icd10Code: string;
  probability: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  supportingEvidence: string[];
  againstEvidence: string[];
  additionalTestsNeeded: string[];
  reasoning: string;
  urgency: 'routine' | 'urgent' | 'emergent';
}

interface Treatment {
  id: string;
  category: 'medication' | 'procedure' | 'lifestyle' | 'referral' | 'monitoring';
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timeframe: string;
  contraindications: string[];
  alternatives: string[];
  expectedOutcome: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
}

interface ConcernFlag {
  id: string;
  type: 'red_flag' | 'drug_interaction' | 'allergy' | 'urgent_referral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
  requiresImmediateAction: boolean;
}

const AIAnalysisPage: React.FC = () => {
  const { id: visitId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [currentTabValue, setCurrentTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [userRating, setUserRating] = useState<number | null>(null);
  
  // Comprehensive mock analysis data
  const [analysisData] = useState({
    id: `analysis-${visitId}`,
    status: 'completed',
    confidenceScore: 0.87,
    processingTime: 3.2,
    aiModel: 'GPT-4 Medical',
    analysisDate: new Date(),
    reviewStatus: 'pending',
    
    // Patient context
    patientContext: {
      age: 45,
      gender: 'male',
      primaryLanguage: 'English',
      chiefComplaint: 'Chest pain and shortness of breath',
    },
    
    // Extracted symptoms with detailed analysis
    symptoms: [
      {
        id: 'sym-1',
        name: 'Chest pain',
        severity: 'moderate',
        confidence: 0.95,
        duration: '2 hours',
        location: 'substernal',
        quality: 'pressure-like',
        associatedFactors: ['exertion', 'anxiety'],
        sourceText: 'Patient reports pressure-like chest pain that started 2 hours ago during stair climbing',
      },
      {
        id: 'sym-2',
        name: 'Shortness of breath',
        severity: 'mild',
        confidence: 0.87,
        duration: '1 hour',
        location: 'bilateral',
        quality: 'difficulty breathing',
        associatedFactors: ['chest pain', 'exertion'],
        sourceText: 'Patient mentions some difficulty breathing associated with chest discomfort',
      },
      {
        id: 'sym-3',
        name: 'Anxiety',
        severity: 'moderate',
        confidence: 0.78,
        duration: 'ongoing',
        associatedFactors: ['chest pain', 'fear of heart attack'],
        sourceText: 'Patient appears anxious and worried about potential cardiac event',
      },
    ] as Symptom[],
    
    // Differential diagnoses with comprehensive details
    diagnoses: [
      {
        id: 'dx-1',
        condition: 'Acute Coronary Syndrome',
        icd10Code: 'I24.9',
        probability: 0.75,
        severity: 'high',
        supportingEvidence: ['chest pain', 'male gender', 'age >40', 'exertional trigger'],
        againstEvidence: ['normal ECG', 'short duration', 'anxiety component'],
        additionalTestsNeeded: ['troponin levels', 'stress test', 'echocardiogram'],
        reasoning: 'Classic presentation of chest pain in middle-aged male with cardiac risk factors',
        urgency: 'urgent',
      },
      {
        id: 'dx-2',
        condition: 'Anxiety Disorder with Panic Attack',
        icd10Code: 'F41.0',
        probability: 0.65,
        severity: 'medium',
        supportingEvidence: ['anxiety symptoms', 'pressure sensation', 'situational trigger'],
        againstEvidence: ['physical exertion trigger', 'duration'],
        additionalTestsNeeded: ['anxiety assessment', 'psychiatric evaluation'],
        reasoning: 'Anxiety can manifest with chest discomfort and breathing difficulties',
        urgency: 'routine',
      },
      {
        id: 'dx-3',
        condition: 'Gastroesophageal Reflux Disease',
        icd10Code: 'K21.9',
        probability: 0.45,
        severity: 'low',
        supportingEvidence: ['chest discomfort', 'pressure sensation'],
        againstEvidence: ['exertional trigger', 'breathing symptoms'],
        additionalTestsNeeded: ['PPI trial', 'upper endoscopy'],
        reasoning: 'GERD can cause chest pain that mimics cardiac symptoms',
        urgency: 'routine',
      },
    ] as Diagnosis[],
    
    // Treatment recommendations with detailed information
    treatments: [
      {
        id: 'tx-1',
        category: 'medication',
        recommendation: 'Aspirin 325mg if no contraindications',
        priority: 'high',
        timeframe: 'immediate',
        contraindications: ['active bleeding', 'aspirin allergy', 'severe asthma'],
        alternatives: ['clopidogrel 75mg if aspirin contraindicated'],
        expectedOutcome: 'Reduced platelet aggregation and cardiovascular risk',
        evidenceLevel: 'A',
      },
      {
        id: 'tx-2',
        category: 'referral',
        recommendation: 'Urgent cardiology consultation',
        priority: 'high',
        timeframe: 'within 24 hours',
        contraindications: [],
        alternatives: ['emergency department if symptoms worsen'],
        expectedOutcome: 'Expert cardiac evaluation and risk stratification',
        evidenceLevel: 'A',
      },
      {
        id: 'tx-3',
        category: 'monitoring',
        recommendation: 'Serial troponin measurements',
        priority: 'high',
        timeframe: '0, 6, and 12 hours',
        contraindications: [],
        alternatives: ['high-sensitivity troponin if available'],
        expectedOutcome: 'Rule out myocardial infarction',
        evidenceLevel: 'A',
      },
      {
        id: 'tx-4',
        category: 'lifestyle',
        recommendation: 'Anxiety management techniques',
        priority: 'medium',
        timeframe: 'ongoing',
        contraindications: [],
        alternatives: ['anxiolytic medication if severe'],
        expectedOutcome: 'Reduced anxiety and associated symptoms',
        evidenceLevel: 'B',
      },
    ] as Treatment[],
    
    // Critical concerns and red flags
    concerns: [
      {
        id: 'flag-1',
        type: 'red_flag',
        severity: 'high',
        message: 'Chest pain in middle-aged male with potential cardiac risk factors',
        recommendation: 'Immediate cardiac evaluation with ECG and troponin',
        requiresImmediateAction: true,
      },
      {
        id: 'flag-2',
        type: 'urgent_referral',
        severity: 'medium',
        message: 'Requires specialist evaluation for definitive diagnosis',
        recommendation: 'Cardiology consultation within 24 hours',
        requiresImmediateAction: false,
      },
    ] as ConcernFlag[],
    
    // Analysis metrics
    metrics: {
      totalSymptoms: 3,
      highConfidenceFindings: 2,
      criticalConcerns: 1,
      recommendedTests: 6,
      urgentActions: 2,
    },
  });

  const [transcriptData] = useState({
    available: true,
    processedAt: new Date(),
    duration: 18.5,
    confidence: 0.92,
    speakerCount: 2,
    content: `Doctor: Good morning! What brings you in today?

Patient: Hi Doctor. I've been having this chest pain for about 2 hours now. It started when I was climbing the stairs to my apartment.

Doctor: Can you describe the pain for me? Is it sharp, dull, or pressure-like?

Patient: It's more like pressure, like someone is sitting on my chest. It's really worrying me because my father had a heart attack when he was 60.

Doctor: I understand your concern. Are you having any trouble breathing?

Patient: Yes, a little bit. It's not terrible, but I feel like I can't take a deep breath.

Doctor: Any nausea, sweating, or pain going to your arm or jaw?

Patient: No nausea or sweating. Maybe a tiny bit of discomfort in my left arm, but I'm not sure if that's related.

Doctor: Have you ever had chest pain like this before?

Patient: I've had some stress and anxiety lately with work, and sometimes I get chest tightness, but nothing like this.

Doctor: Are you taking any medications currently?

Patient: Just my blood pressure medication - lisinopril, I think it's called. And I take aspirin sometimes.

Doctor: Any allergies to medications?

Patient: Yes, I'm allergic to penicillin - I get a rash.`,
    
    segments: [
      { speaker: 'provider', timestamp: 0, confidence: 0.95, text: 'Good morning! What brings you in today?' },
      { speaker: 'patient', timestamp: 2.1, confidence: 0.93, text: 'Hi Doctor. I\'ve been having this chest pain for about 2 hours now.' },
      // ... more segments would be here
    ],
  });

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleRunAnalysis = async () => {
    setIsRunningAnalysis(true);
    setAnalysisProgress(0);
    
    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      await openAIService.analyzeTranscript(transcriptData.content, visitId);
      setNotification({ message: 'Analysis completed successfully', type: 'success' });
    } catch (error) {
      setNotification({ message: 'Error running analysis', type: 'error' });
    } finally {
      setTimeout(() => {
        setIsRunningAnalysis(false);
        setAnalysisProgress(0);
      }, 2000);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': case 'severe': return 'error';
      case 'medium': case 'moderate': return 'warning';
      case 'low': case 'mild': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getEvidenceColor = (level: string) => {
    switch (level) {
      case 'A': return 'success';
      case 'B': return 'info';
      case 'C': return 'warning';
      case 'D': return 'error';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            AI Clinical Analysis
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Visit #{visitId} • {analysisData.patientContext.chiefComplaint}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={isRunningAnalysis ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
            onClick={handleRunAnalysis}
            disabled={isRunningAnalysis}
          >
            {isRunningAnalysis ? 'Analyzing...' : 'Re-run Analysis'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<TranscriptionIcon />}
            onClick={() => navigate(ROUTES.TRANSCRIPT_UPLOAD.replace(':id', visitId!))}
          >
            View Transcript
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => setShowExportDialog(true)}
          >
            Export
          </Button>
        </Stack>
      </Box>

      {/* Analysis Progress */}
      {isRunningAnalysis && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AutoAwesomeIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Running AI Analysis...</Typography>
            </Box>
            <LinearProgress variant="determinate" value={analysisProgress} sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Processing clinical data and generating insights...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Notification */}
      {notification && (
        <Alert
          severity={notification.type}
          onClose={() => setNotification(null)}
          sx={{ mb: 2 }}
        >
          {notification.message}
        </Alert>
      )}

      {/* Quick Stats Dashboard */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h4">{(analysisData.confidenceScore * 100).toFixed(0)}%</Typography>
              <Typography variant="body2">Confidence</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarningIcon color="warning" sx={{ fontSize: 40 }} />
              <Typography variant="h4">{analysisData.metrics.criticalConcerns}</Typography>
              <Typography variant="body2">Critical Alerts</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <MedicalServicesIcon color="secondary" sx={{ fontSize: 40 }} />
              <Typography variant="h4">{analysisData.metrics.totalSymptoms}</Typography>
              <Typography variant="body2">Symptoms</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PsychologyIcon color="info" sx={{ fontSize: 40 }} />
              <Typography variant="h4">{analysisData.diagnoses.length}</Typography>
              <Typography variant="body2">Diagnoses</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <HospitalIcon color="success" sx={{ fontSize: 40 }} />
              <Typography variant="h4">{analysisData.treatments.length}</Typography>
              <Typography variant="body2">Treatments</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TimelineIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h4">{analysisData.processingTime}s</Typography>
              <Typography variant="body2">Process Time</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTabValue} onChange={(_, newValue) => setCurrentTabValue(newValue)}>
          <Tab label="Clinical Analysis" icon={<AssessmentIcon />} />
          <Tab label="Symptoms & Findings" icon={<MedicalServicesIcon />} />
          <Tab label="Differential Diagnosis" icon={<PsychologyIcon />} />
          <Tab label="Treatment Plan" icon={<HospitalIcon />} />
          <Tab label="Critical Alerts" icon={<WarningIcon />} />
          <Tab label="Transcript Analysis" icon={<TranscriptionIcon />} />
          <Tab label="Review & Quality" icon={<CommentIcon />} />
        </Tabs>
      </Box>

      {/* Clinical Analysis Tab */}
      <TabPanel value={currentTabValue} index={0}>
        <Grid container spacing={3}>
          {/* Analysis Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analysis Summary
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip
                    label={`${analysisData.status.toUpperCase()}`}
                    color="success"
                    icon={<CheckCircleIcon />}
                  />
                  <Chip
                    label={`AI Model: ${analysisData.aiModel}`}
                    variant="outlined"
                  />
                  <Chip
                    label={`Processed: ${analysisData.analysisDate.toLocaleDateString()}`}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body1" paragraph>
                  The AI analysis has processed the clinical encounter and identified key symptoms, 
                  potential diagnoses, and recommended treatment approaches. The analysis shows 
                  {analysisData.confidenceScore >= 0.8 ? ' high' : ' moderate'} confidence in the findings.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Patient Context */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Patient Context
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Age" secondary={`${analysisData.patientContext.age} years old`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Gender" secondary={analysisData.patientContext.gender} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Chief Complaint" secondary={analysisData.patientContext.chiefComplaint} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Language" secondary={analysisData.patientContext.primaryLanguage} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Analysis Quality Metrics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analysis Quality
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Overall Confidence
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={analysisData.confidenceScore * 100} 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2">
                    {(analysisData.confidenceScore * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="High Confidence Findings" 
                      secondary={`${analysisData.metrics.highConfidenceFindings} of ${analysisData.metrics.totalSymptoms}`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Processing Time" 
                      secondary={`${analysisData.processingTime} seconds`} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Symptoms & Findings Tab */}
      <TabPanel value={currentTabValue} index={1}>
        <Grid container spacing={3}>
          {analysisData.symptoms.map((symptom) => (
            <Grid item xs={12} md={6} key={symptom.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{symptom.name}</Typography>
                    <Box>
                      <Chip
                        label={symptom.severity}
                        size="small"
                        color={getSeverityColor(symptom.severity) as any}
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`${(symptom.confidence * 100).toFixed(0)}% confident`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Duration" secondary={symptom.duration} />
                    </ListItem>
                    {symptom.location && (
                      <ListItem>
                        <ListItemText primary="Location" secondary={symptom.location} />
                      </ListItem>
                    )}
                    {symptom.quality && (
                      <ListItem>
                        <ListItemText primary="Quality" secondary={symptom.quality} />
                      </ListItem>
                    )}
                    <ListItem>
                      <ListItemText 
                        primary="Associated Factors" 
                        secondary={symptom.associatedFactors.join(', ')} 
                      />
                    </ListItem>
                  </List>
                  
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Source:</strong> {symptom.sourceText}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Differential Diagnosis Tab */}
      <TabPanel value={currentTabValue} index={2}>
        {analysisData.diagnoses.map((diagnosis) => (
          <Accordion key={diagnosis.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">{diagnosis.condition}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ICD-10: {diagnosis.icd10Code}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`${(diagnosis.probability * 100).toFixed(0)}% probability`}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={diagnosis.severity}
                    color={getSeverityColor(diagnosis.severity) as any}
                    size="small"
                  />
                  <Chip
                    label={diagnosis.urgency}
                    color={diagnosis.urgency === 'emergent' ? 'error' : diagnosis.urgency === 'urgent' ? 'warning' : 'default'}
                    size="small"
                  />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="body1" paragraph>
                    <strong>Clinical Reasoning:</strong> {diagnosis.reasoning}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Supporting Evidence
                  </Typography>
                  <List dense>
                    {diagnosis.supportingEvidence.map((evidence, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={evidence} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Against Evidence
                  </Typography>
                  <List dense>
                    {diagnosis.againstEvidence.map((evidence, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ErrorIcon color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={evidence} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Additional Tests Needed
                  </Typography>
                  <List dense>
                    {diagnosis.additionalTestsNeeded.map((test, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <MedicalServicesIcon color="info" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={test} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </TabPanel>

      {/* Treatment Plan Tab */}
      <TabPanel value={currentTabValue} index={3}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Recommendation</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Timeframe</TableCell>
                <TableCell>Evidence Level</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analysisData.treatments.map((treatment) => (
                <TableRow key={treatment.id}>
                  <TableCell>
                    <Chip label={treatment.category} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{treatment.recommendation}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={treatment.priority}
                      size="small"
                      color={getPriorityColor(treatment.priority) as any}
                    />
                  </TableCell>
                  <TableCell>{treatment.timeframe}</TableCell>
                  <TableCell>
                    <Chip
                      label={`Level ${treatment.evidenceLevel}`}
                      size="small"
                      color={getEvidenceColor(treatment.evidenceLevel) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Critical Alerts Tab */}
      <TabPanel value={currentTabValue} index={4}>
        <Grid container spacing={3}>
          {analysisData.concerns.map((concern) => (
            <Grid item xs={12} key={concern.id}>
              <Alert 
                severity={concern.severity === 'critical' ? 'error' : concern.severity === 'high' ? 'warning' : 'info'}
                action={
                  concern.requiresImmediateAction && (
                    <Button color="inherit" size="small">
                      ACT NOW
                    </Button>
                  )
                }
              >
                <Typography variant="h6" gutterBottom>
                  {concern.type.replace('_', ' ').toUpperCase()}: {concern.message}
                </Typography>
                <Typography variant="body2">
                  <strong>Recommendation:</strong> {concern.recommendation}
                </Typography>
                {concern.requiresImmediateAction && (
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', color: 'error.main' }}>
                    ⚠️ REQUIRES IMMEDIATE ACTION
                  </Typography>
                )}
              </Alert>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Transcript Analysis Tab */}
      <TabPanel value={currentTabValue} index={5}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Transcript Quality
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Overall Confidence" 
                      secondary={`${(transcriptData.confidence * 100).toFixed(1)}%`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Duration" 
                      secondary={`${transcriptData.duration} minutes`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Speakers Detected" 
                      secondary={transcriptData.speakerCount} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Processed" 
                      secondary={transcriptData.processedAt.toLocaleString()} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Full Transcript
                </Typography>
                <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto', bgcolor: 'background.default' }}>
                  <Typography variant="body2" component="pre" style={{ whiteSpace: 'pre-wrap' }}>
                    {transcriptData.content}
                  </Typography>
                </Paper>
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(ROUTES.TRANSCRIPT_UPLOAD.replace(':id', visitId!))}
                  >
                    Edit Transcript
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                  >
                    Export Transcript
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Review & Quality Tab */}
      <TabPanel value={currentTabValue} index={6}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analysis Review
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" gutterBottom>
                    Rate the quality of this AI analysis:
                  </Typography>
                  <Rating
                    value={userRating}
                    onChange={(_, newValue) => setUserRating(newValue)}
                    size="large"
                  />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Review Notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add your review comments..."
                  variant="outlined"
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                  >
                    Save Review
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ThumbUpIcon />}
                  >
                    Approve Analysis
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quality Metrics
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Clinical Accuracy" 
                      secondary="High confidence findings validated"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <HealthAndSafetyIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Safety Checks" 
                      secondary="All critical alerts identified"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Completeness" 
                      secondary="Comprehensive differential diagnosis"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)}>
        <DialogTitle>Export Analysis Report</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Export Format</InputLabel>
            <Select defaultValue="pdf" label="Export Format">
              <MenuItem value="pdf">PDF Report</MenuItem>
              <MenuItem value="json">JSON Data</MenuItem>
              <MenuItem value="csv">CSV Summary</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIAnalysisPage; 