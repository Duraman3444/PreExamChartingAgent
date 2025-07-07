import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  IconButton,
  Tooltip,
  Avatar,
  Badge,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  ExpandMore as ExpandMoreIcon,
  AutoAwesome as AutoAwesomeIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Lightbulb as LightbulbIcon,
  LocalHospital as LocalHospitalIcon,
  Medication as MedicationIcon,
  MonitorHeart as MonitorHeartIcon,
  CalendarMonth as CalendarMonthIcon,
  Person as PersonIcon,
  RecordVoiceOver as TranscriptIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { AIAnalysis } from '@/types';
import { openAIService } from '@/services/openai';

// Mock data - in a real app, this would come from your backend
const mockAnalyses: AIAnalysis[] = [
  {
    id: '1',
    visitId: 'V001',
    patientId: 'P001',
    status: 'completed',
    extractedSymptoms: [
      {
        id: 'S001',
        symptom: 'Chest pain',
        severity: 'moderate',
        duration: '2 hours',
        frequency: 'intermittent',
        context: 'Started during exercise',
        sourceText: 'Patient reports chest pain that started 2 hours ago while jogging',
        confidence: 0.92,
      },
      {
        id: 'S002',
        symptom: 'Shortness of breath',
        severity: 'mild',
        duration: '30 minutes',
        frequency: 'continuous',
        context: 'Associated with chest pain',
        sourceText: 'Patient also mentions feeling short of breath',
        confidence: 0.85,
      },
    ],
    patientHistory: {
      medications: ['Lisinopril 10mg daily', 'Metformin 500mg twice daily'],
      allergies: ['Penicillin'],
      pastConditions: ['Hypertension', 'Type 2 Diabetes'],
      familyHistory: ['Father had heart attack at age 55'],
      socialHistory: ['Non-smoker', 'Occasional alcohol use'],
      reviewOfSystems: ['Denies nausea', 'Denies palpitations'],
    },
    differentialDiagnosis: [
      {
        id: 'D001',
        condition: 'Angina Pectoris',
        icd10Code: 'I20.9',
        probability: 0.75,
        supportingEvidence: [
          'Chest pain with exertion',
          'History of diabetes and hypertension',
          'Family history of cardiac disease',
        ],
        againstEvidence: ['Pain duration relatively short', 'No EKG changes noted'],
        additionalTestsNeeded: ['Stress test', 'Echocardiogram', 'Cardiac enzymes'],
        reasoning: 'Classic presentation of exertional chest pain in patient with cardiac risk factors',
        severity: 'medium',
      },
      {
        id: 'D002',
        condition: 'Musculoskeletal Chest Pain',
        icd10Code: 'M79.3',
        probability: 0.45,
        supportingEvidence: ['Pain associated with physical activity', 'No radiation pattern'],
        againstEvidence: ['Associated shortness of breath', 'Cardiac risk factors present'],
        additionalTestsNeeded: ['Physical examination', 'Chest X-ray'],
        reasoning: 'Exercise-induced chest pain could be musculoskeletal in origin',
        severity: 'low',
      },
    ],
    treatmentRecommendations: [
      {
        id: 'T001',
        category: 'medication',
        recommendation: 'Sublingual nitroglycerin PRN for chest pain',
        reasoning: 'Would help confirm/rule out angina and provide symptom relief',
        priority: 'high',
        timeframe: 'Immediate',
        contraindications: ['Severe aortic stenosis', 'Recent PDE5 inhibitor use'],
        alternatives: ['Aspirin 81mg daily', 'Beta-blocker therapy'],
        monitoringRequired: ['Blood pressure monitoring', 'Symptom tracking'],
      },
      {
        id: 'T002',
        category: 'procedure',
        recommendation: 'EKG and cardiac enzymes',
        reasoning: 'Rule out acute coronary syndrome',
        priority: 'high',
        timeframe: 'Within 30 minutes',
        contraindications: [],
        alternatives: ['Chest X-ray', 'D-dimer'],
        monitoringRequired: ['Serial EKGs if abnormal', 'Troponin trend'],
      },
    ],
    flaggedConcerns: [
      {
        id: 'C001',
        type: 'red_flag',
        severity: 'high',
        message: 'Chest pain with cardiac risk factors requires immediate evaluation',
        recommendation: 'Obtain EKG and cardiac enzymes immediately',
        sourceText: 'Patient reports chest pain with diabetes and hypertension',
        requiresAttention: true,
      },
    ],
    followUpRecommendations: [
      {
        id: 'F001',
        type: 'appointment',
        description: 'Cardiology consultation',
        timeframe: 'Within 1 week',
        specialty: 'Cardiology',
        priority: 'urgent',
      },
      {
        id: 'F002',
        type: 'test',
        description: 'Stress test if initial workup negative',
        timeframe: 'Within 2 weeks',
        priority: 'routine',
      },
    ],
    confidenceScore: 0.87,
    processingTime: 15000,
    aiModel: 'GPT-4 Turbo',
    createdAt: new Date('2024-01-15T10:30:00'),
    reviewedBy: 'Dr. Smith',
    reviewedAt: new Date('2024-01-15T11:45:00'),
    reviewNotes: 'Comprehensive analysis. Agree with differential diagnosis and treatment plan.',
  },
];

const mockTranscripts = [
  {
    id: 'T001',
    visitId: 'V001',
    patientName: 'John Doe',
    content: `Doctor: Good morning, Mr. Doe. What brings you in today?

Patient: Hi Doctor. I've been having chest pain for the past couple of hours. It started while I was jogging this morning.

Doctor: Can you describe the pain? Is it sharp, dull, crushing?

Patient: It's more like a pressure feeling, right in the center of my chest. It's not sharp, but it's definitely uncomfortable.

Doctor: Does it radiate anywhere? To your arms, neck, or jaw?

Patient: Not really, it stays pretty much in the center of my chest.

Doctor: Any shortness of breath with it?

Patient: Yeah, a little bit. I noticed I was getting winded more easily than usual.

Doctor: Any nausea, sweating, or dizziness?

Patient: No nausea or dizziness, but I did sweat a bit, though that could have been from the exercise.

Doctor: Tell me about your medical history. Are you on any medications?

Patient: I take Lisinopril for high blood pressure and Metformin for diabetes. I'm allergic to Penicillin.

Doctor: Any family history of heart problems?

Patient: My father had a heart attack when he was 55. That's actually why I'm a bit worried about this chest pain.

Doctor: I understand your concern. Let's do some tests to make sure everything is okay.`,
    createdAt: new Date('2024-01-15T10:00:00'),
  },
];

interface TranscriptAnalyzerProps {
  open: boolean;
  onClose: () => void;
  onAnalyze: (transcript: string) => void;
  isAnalyzing: boolean;
}

const TranscriptAnalyzer: React.FC<TranscriptAnalyzerProps> = ({ open, onClose, onAnalyze, isAnalyzing }) => {
  const [transcript, setTranscript] = useState('');
  const [selectedTranscript, setSelectedTranscript] = useState('');

  const handleAnalyze = () => {
    const textToAnalyze = selectedTranscript || transcript;
    if (textToAnalyze.trim()) {
      onAnalyze(textToAnalyze);
      setTranscript('');
      setSelectedTranscript('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon color="primary" />
          <Typography variant="h6">Analyze Visit Transcript</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>Select Existing Transcript</InputLabel>
            <Select
              value={selectedTranscript}
              onChange={(e) => setSelectedTranscript(e.target.value)}
              disabled={isAnalyzing}
            >
              {mockTranscripts.map((t) => (
                <MenuItem key={t.id} value={t.content}>
                  {t.patientName} - {format(t.createdAt, 'PPp')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary" align="center">
            — OR —
          </Typography>

          <TextField
            label="Paste Transcript Text"
            multiline
            rows={12}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste the visit transcript here for AI analysis..."
            disabled={isAnalyzing}
            fullWidth
          />

          {isAnalyzing && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Analyzing transcript with AI...
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isAnalyzing}>
          Cancel
        </Button>
        <Button
          onClick={handleAnalyze}
          variant="contained"
          disabled={!transcript.trim() && !selectedTranscript.trim() || isAnalyzing}
          startIcon={<AutoAwesomeIcon />}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function AIAnalysisPage() {
  const [analyses, setAnalyses] = useState<AIAnalysis[]>(mockAnalyses);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysis | null>(analyses[0]);
  const [analyzerOpen, setAnalyzerOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleAnalyze = async (transcript: string) => {
    setIsAnalyzing(true);
    setAnalyzerOpen(false);
    
    try {
      // Show progressive analysis steps
      const steps = ['Transcript Processing', 'Symptom Extraction', 'Differential Diagnosis', 'Treatment Recommendations', 'Risk Assessment', 'Follow-up Planning'];
      
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setActiveStep(i);
      }
      
      // Call Firebase Functions for AI analysis
      const result = await openAIService.analyzeTranscript(
        transcript,
        'P' + Date.now(),
        'V' + Date.now()
      );
      
      // Convert Firebase Functions result to AIAnalysis format
      const newAnalysis: AIAnalysis = {
        id: result.id,
        visitId: 'V' + Date.now(),
        patientId: 'P' + Date.now(),
        status: 'completed',
        extractedSymptoms: result.symptoms.map((symptom, index) => ({
          id: `S${index + 1}`,
          symptom,
          severity: 'moderate' as const,
          duration: 'Unknown',
          frequency: 'Unknown',
          context: '',
          sourceText: '',
          confidence: 0.8
        })),
        patientHistory: {
          medications: [],
          allergies: [],
          pastConditions: [],
          familyHistory: [],
          socialHistory: [],
          reviewOfSystems: [],
        },
        differentialDiagnosis: result.differential_diagnosis.map((diagnosis, index) => ({
          id: `D${index + 1}`,
          condition: diagnosis.condition,
          icd10Code: '',
          probability: diagnosis.confidence === 'high' ? 0.9 : diagnosis.confidence === 'medium' ? 0.7 : 0.4,
          supportingEvidence: [diagnosis.reasoning],
          againstEvidence: [],
          additionalTestsNeeded: [],
          reasoning: diagnosis.reasoning,
          severity: diagnosis.confidence === 'high' ? 'high' as const : 'medium' as const
        })),
        treatmentRecommendations: result.treatment_recommendations.map((treatment, index) => ({
          id: `T${index + 1}`,
          category: 'medication' as const,
          recommendation: treatment,
          reasoning: '',
          priority: 'medium' as const,
          timeframe: 'Soon',
          contraindications: [],
          alternatives: [],
          monitoringRequired: []
        })),
        flaggedConcerns: result.flagged_concerns.map((concern, index) => ({
          id: `C${index + 1}`,
          type: 'red_flag' as const,
          severity: 'medium' as const,
          message: concern,
          recommendation: '',
          sourceText: '',
          requiresAttention: true
        })),
        followUpRecommendations: result.follow_up_recommendations.map((followUp, index) => ({
          id: `F${index + 1}`,
          type: 'appointment' as const,
          description: followUp,
          timeframe: 'Soon',
          specialty: '',
          priority: 'routine' as const
        })),
        confidenceScore: 0.85,
        processingTime: 5000,
        aiModel: 'GPT-4 Turbo',
        createdAt: new Date(),
      };
      
      setAnalyses(prev => [newAnalysis, ...prev]);
      setSelectedAnalysis(newAnalysis);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Handle error - could show an error message to user
    } finally {
      setIsAnalyzing(false);
      setActiveStep(0);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'reviewed':
        return <CheckCircleIcon color="info" />;
      case 'processing':
        return <ScheduleIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <ScheduleIcon color="action" />;
    }
  };

  const analysisSteps = [
    'Transcript Processing',
    'Symptom Extraction',
    'Differential Diagnosis',
    'Treatment Recommendations',
    'Risk Assessment',
    'Follow-up Planning',
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            AI Analysis Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            AI-powered medical transcript analysis and clinical decision support
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AutoAwesomeIcon />}
          onClick={() => setAnalyzerOpen(true)}
          size="large"
        >
          New Analysis
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Panel - Analysis List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssessmentIcon />
                Recent Analyses
              </Typography>
              <List>
                {analyses.map((analysis) => (
                  <ListItem
                    key={analysis.id}
                    button
                    selected={selectedAnalysis?.id === analysis.id}
                    onClick={() => setSelectedAnalysis(analysis)}
                    sx={{ borderRadius: 1, mb: 1 }}
                  >
                    <ListItemIcon>
                      {getStatusIcon(analysis.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={`Analysis ${analysis.id}`}
                      secondary={
                        <Box>
                          <Typography variant="caption" component="div">
                            {format(analysis.createdAt, 'PPp')}
                          </Typography>
                          <Chip
                            label={analysis.status.toUpperCase()}
                            size="small"
                            color={analysis.status === 'completed' || analysis.status === 'reviewed' ? 'success' : 'warning'}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {isAnalyzing && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  Processing Analysis
                </Typography>
                <Stepper activeStep={activeStep} orientation="vertical">
                  {analysisSteps.map((step, index) => (
                    <Step key={step}>
                      <StepLabel>{step}</StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary">
                          {index <= activeStep ? 'Completed' : 'Pending'}
                        </Typography>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Panel - Analysis Details */}
        <Grid item xs={12} md={8}>
          {selectedAnalysis ? (
            <Stack spacing={3}>
              {/* Header */}
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        Analysis #{selectedAnalysis.id}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Chip
                          label={selectedAnalysis.status.toUpperCase()}
                          color={selectedAnalysis.status === 'completed' || selectedAnalysis.status === 'reviewed' ? 'success' : 'warning'}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Confidence: {(selectedAnalysis.confidenceScore * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Model: {selectedAnalysis.aiModel}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Tooltip title="Refresh Analysis">
                        <IconButton>
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Report">
                        <IconButton>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Share Analysis">
                        <IconButton>
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Flagged Concerns */}
              {selectedAnalysis.flaggedConcerns.length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon color="error" />
                      Flagged Concerns
                    </Typography>
                    {selectedAnalysis.flaggedConcerns.map((concern) => (
                      <Alert
                        key={concern.id}
                        severity={concern.severity === 'critical' ? 'error' : concern.severity === 'high' ? 'warning' : 'info'}
                        sx={{ mb: 1 }}
                      >
                        <Box>
                          <Typography variant="subtitle2">{concern.message}</Typography>
                          <Typography variant="body2">{concern.recommendation}</Typography>
                        </Box>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Extracted Symptoms */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalHospitalIcon />
                    Extracted Symptoms
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedAnalysis.extractedSymptoms.map((symptom) => (
                      <Grid item xs={12} md={6} key={symptom.id}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {symptom.symptom}
                            </Typography>
                            <Chip
                              label={symptom.severity}
                              size="small"
                              color={getSeverityColor(symptom.severity || 'low') as any}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Duration: {symptom.duration} | Frequency: {symptom.frequency}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {symptom.context}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              Confidence: {(symptom.confidence * 100).toFixed(0)}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={symptom.confidence * 100}
                              sx={{ width: 60 }}
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              {/* Differential Diagnosis */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon />
                    Differential Diagnosis
                  </Typography>
                  <Stack spacing={2}>
                    {selectedAnalysis.differentialDiagnosis.map((diagnosis) => (
                      <Accordion key={diagnosis.id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mr: 2 }}>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {diagnosis.condition}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ICD-10: {diagnosis.icd10Code}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Chip
                                label={`${(diagnosis.probability * 100).toFixed(0)}%`}
                                size="small"
                                color="primary"
                              />
                              <Chip
                                label={diagnosis.severity}
                                size="small"
                                color={getSeverityColor(diagnosis.severity) as any}
                              />
                            </Box>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
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
                            <Grid item xs={12} md={6}>
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
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" gutterBottom>
                                Reasoning
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {diagnosis.reasoning}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" gutterBottom>
                                Additional Tests Needed
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {diagnosis.additionalTestsNeeded.map((test, index) => (
                                  <Chip key={index} label={test} size="small" variant="outlined" />
                                ))}
                              </Box>
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Treatment Recommendations */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MedicationIcon />
                    Treatment Recommendations
                  </Typography>
                  <Stack spacing={2}>
                    {selectedAnalysis.treatmentRecommendations.map((treatment) => (
                      <Paper key={treatment.id} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {treatment.recommendation}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                              label={treatment.category.toUpperCase()}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={treatment.priority.toUpperCase()}
                              size="small"
                              color={getSeverityColor(treatment.priority) as any}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {treatment.reasoning}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Timeframe:</strong> {treatment.timeframe}
                        </Typography>
                        {treatment.contraindications.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" color="error">
                              <strong>Contraindications:</strong> {treatment.contraindications.join(', ')}
                            </Typography>
                          </Box>
                        )}
                        {treatment.monitoringRequired.length > 0 && (
                          <Box>
                            <Typography variant="body2">
                              <strong>Monitoring Required:</strong> {treatment.monitoringRequired.join(', ')}
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Follow-up Recommendations */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonthIcon />
                    Follow-up Recommendations
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedAnalysis.followUpRecommendations.map((followUp) => (
                      <Grid item xs={12} md={6} key={followUp.id}>
                        <Paper sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {followUp.description}
                            </Typography>
                            <Chip
                              label={followUp.priority.toUpperCase()}
                              size="small"
                              color={getSeverityColor(followUp.priority) as any}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Type:</strong> {followUp.type.toUpperCase()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Timeframe:</strong> {followUp.timeframe}
                          </Typography>
                          {followUp.specialty && (
                            <Typography variant="body2" color="text.secondary">
                              <strong>Specialty:</strong> {followUp.specialty}
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              {/* Review Section */}
              {selectedAnalysis.reviewedBy && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon />
                      Physician Review
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {selectedAnalysis.reviewedBy.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">
                          {selectedAnalysis.reviewedBy}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Reviewed on {format(selectedAnalysis.reviewedAt!, 'PPp')}
                        </Typography>
                      </Box>
                    </Box>
                    {selectedAnalysis.reviewNotes && (
                      <Alert severity="info">
                        {selectedAnalysis.reviewNotes}
                      </Alert>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button startIcon={<ThumbUpIcon />} size="small">
                        Approve
                      </Button>
                      <Button startIcon={<ThumbDownIcon />} size="small">
                        Request Changes
                      </Button>
                      <Button startIcon={<EditIcon />} size="small">
                        Add Review Notes
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Stack>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <PsychologyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Analysis Selected
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Select an analysis from the list or create a new one to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={() => setAnalyzerOpen(true)}
                >
                  Create New Analysis
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <TranscriptAnalyzer
        open={analyzerOpen}
        onClose={() => setAnalyzerOpen(false)}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
      />
    </Box>
  );
} 