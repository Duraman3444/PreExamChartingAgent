import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
  Add as AddIcon,
  PlayArrow as PlayArrowIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  LocalHospital as HospitalIcon,
  MedicalServices as MedicalServicesIcon,
  Warning as WarningIcon,
  AutoAwesome as AutoAwesomeIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ThumbUp as ThumbUpIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  HealthAndSafety as HealthAndSafetyIcon,
} from '@mui/icons-material';
import { openAIService } from '@/services/openai';
import { mockVisits } from '@/data/mockData';

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

interface NewPatientData {
  firstName: string;
  lastName: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  chiefComplaint: string;
  symptoms: string;
  medicalHistory: string;
  medications: string;
  allergies: string;
  additionalInfo: string;
}

interface ExistingPatientAddition {
  currentSymptoms: string;
  newMedicalHistory: string;
  currentMedications: string;
  newAllergies: string;
  chiefComplaint: string;
  additionalInfo: string;
}

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

interface AIAgentAnalysis {
  symptoms: Symptom[];
  diagnoses: Diagnosis[];
  treatments: Treatment[];
  concerns: ConcernFlag[];
  confidenceScore: number;
  reasoning: string;
  nextSteps: string[];
}

const AIAgent: React.FC = () => {
  const [agentMode, setAgentMode] = useState(false);
  const [patientType, setPatientType] = useState<'existing' | 'new'>('existing');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [newPatientData, setNewPatientData] = useState<NewPatientData>({
    firstName: '',
    lastName: '',
    age: 0,
    gender: 'male',
    chiefComplaint: '',
    symptoms: '',
    medicalHistory: '',
    medications: '',
    allergies: '',
    additionalInfo: '',
  });
  const [existingPatientAddition, setExistingPatientAddition] = useState<ExistingPatientAddition>({
    currentSymptoms: '',
    newMedicalHistory: '',
    currentMedications: '',
    newAllergies: '',
    chiefComplaint: '',
    additionalInfo: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAgentAnalysis | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const patients = mockVisits.map(visit => ({
    id: visit.patientId,
    name: visit.patientName,
    age: visit.patientAge,
    gender: visit.patientGender,
    recentVisit: visit.chiefComplaint,
    visitId: visit.id,
  }));

  const uniquePatients = patients.filter((patient, index, self) =>
    index === self.findIndex(p => p.id === patient.id)
  );

  const handleEnterAgentMode = () => {
    setAgentMode(true);
  };

  const handleExitAgentMode = () => {
    setAgentMode(false);
    setPatientType('existing');
    setSelectedPatient('');
    setNewPatientData({
      firstName: '',
      lastName: '',
      age: 0,
      gender: 'male',
      chiefComplaint: '',
      symptoms: '',
      medicalHistory: '',
      medications: '',
      allergies: '',
      additionalInfo: '',
    });
    setExistingPatientAddition({
      currentSymptoms: '',
      newMedicalHistory: '',
      currentMedications: '',
      newAllergies: '',
      chiefComplaint: '',
      additionalInfo: '',
    });
    setAnalysis(null);
    setTabValue(0);
  };

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatient(patientId);
  };

  const handleNewPatientDataChange = (field: keyof NewPatientData, value: any) => {
    setNewPatientData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExistingPatientAdditionChange = (field: keyof ExistingPatientAddition, value: any) => {
    setExistingPatientAddition(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateMockAnalysis = (patientData: any): AIAgentAnalysis => {
    // Generate mock analysis based on patient data
    const isExisting = patientType === 'existing';
    const hasAdditionalInfo = isExisting && patientData.additionalInfo && 
      Object.values(patientData.additionalInfo).some((value: any) => value && value.trim !== '' && value.trim && value.trim() !== '');
    
    const chiefComplaint = isExisting 
      ? (patientData.additionalInfo?.chiefComplaint && patientData.additionalInfo.chiefComplaint.trim() !== '' 
          ? patientData.additionalInfo.chiefComplaint 
          : patientData.recentVisit)
      : patientData.chiefComplaint;
    const symptoms = isExisting 
      ? patientData.additionalInfo?.currentSymptoms 
      : patientData.symptoms;
    
    const symptomsArray: Symptom[] = [
      {
        id: 'sym-1',
        name: chiefComplaint || 'Primary concern',
        severity: 'moderate',
        confidence: 0.95,
        duration: 'Recent onset',
        location: 'As described',
        quality: 'Patient reported',
        associatedFactors: ['current presentation'],
        sourceText: `Patient reports: ${chiefComplaint || 'general symptoms'}`
      }
    ];

    // Add additional symptoms if provided
    if (symptoms && symptoms.trim() !== '') {
      symptomsArray.push({
        id: 'sym-2',
        name: 'Additional symptoms',
        severity: 'mild',
        confidence: 0.88,
        duration: 'Variable',
        location: 'Multiple',
        quality: 'Associated symptoms',
        associatedFactors: ['primary complaint'],
        sourceText: `Additional symptoms: ${symptoms}`
      });
    }

          const diagnoses: Diagnosis[] = [
        {
          id: 'dx-1',
          condition: isExisting ? 'Follow-up assessment' : 'Primary differential diagnosis',
          icd10Code: 'Z00.00',
          probability: 0.85,
          severity: 'medium',
          supportingEvidence: [
            'patient history', 
            'presenting symptoms',
            ...(isExisting && hasAdditionalInfo ? ['existing patient records', 'follow-up presentation'] : []),
            ...(isExisting && !hasAdditionalInfo ? ['existing patient records', 'historical data'] : [])
          ],
          againstEvidence: ['no contraindications noted'],
          additionalTestsNeeded: ['laboratory studies', 'imaging if indicated'],
          reasoning: isExisting 
            ? (hasAdditionalInfo 
                ? `Based on existing patient history and current presentation: ${chiefComplaint}. Additional information provided helps refine the clinical assessment.`
                : `Based on existing patient history for ${patientData.name}. Previous visit: ${patientData.recentVisit}. Analysis uses historical data; current symptoms would enhance accuracy.`)
            : 'Based on patient presentation and clinical history, this is the most likely diagnosis requiring further evaluation.',
          urgency: 'routine'
        }
      ];

    const treatments: Treatment[] = [
      {
        id: 'tx-1',
        category: 'medication',
        recommendation: 'Symptomatic treatment as appropriate',
        priority: 'medium',
        timeframe: 'As needed',
        contraindications: ['known allergies'],
        alternatives: ['lifestyle modifications'],
        expectedOutcome: 'Symptom improvement expected',
        evidenceLevel: 'B'
      }
    ];

    const concerns: ConcernFlag[] = [
      {
        id: 'flag-1',
        type: 'red_flag',
        severity: 'medium',
        message: 'Monitor for symptom progression',
        recommendation: 'Regular follow-up recommended',
        requiresImmediateAction: false
      }
    ];

          return {
        symptoms: symptomsArray,
        diagnoses,
        treatments,
        concerns,
        confidenceScore: 0.87,
        reasoning: isExisting 
          ? (hasAdditionalInfo 
              ? `AI analysis based on existing patient records and additional information provided. Patient: ${patientData.name}. Current presentation analysis incorporates previous medical history and current symptoms.`
              : `AI analysis based on existing patient records for ${patientData.name}. Analysis uses historical data from previous visits. Additional current information would enhance assessment accuracy.`)
          : 'AI analysis based on provided patient information. Clinical correlation and physician review recommended.',
        nextSteps: [
          'Review with attending physician',
          'Consider additional diagnostic tests',
          'Monitor patient response to treatment',
          'Schedule appropriate follow-up',
          ...(isExisting && hasAdditionalInfo ? ['Update patient records with new information'] : []),
          ...(isExisting && !hasAdditionalInfo ? ['Consider gathering current symptoms and presentation details'] : [])
        ]
      };
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await new Promise(resolve => setTimeout(resolve, 2000));

      let patientData;
      if (patientType === 'existing') {
        const patient = uniquePatients.find(p => p.id === selectedPatient);
        patientData = {
          ...patient,
          additionalInfo: existingPatientAddition,
        };
      } else {
        patientData = newPatientData;
      }

      const analysisResult = generateMockAnalysis(patientData);
      setAnalysis(analysisResult);
      setAnalysisProgress(100);
      setTabValue(1);

    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canRunAnalysis = () => {
    if (patientType === 'existing') {
      return selectedPatient !== '';
    } else {
      return newPatientData.firstName !== '' && 
             newPatientData.lastName !== '' && 
             newPatientData.age > 0 && 
             newPatientData.chiefComplaint !== '';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'urgent': return 'error';
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

  if (!agentMode) {
    return (
      <Box sx={{ p: 3 }}>
        <Card sx={{ maxWidth: 600, mx: 'auto', mt: 8 }}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <SmartToyIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              AI Medical Agent
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Enter AI Agent Mode to analyze patient information and receive 
              comprehensive differential diagnoses, treatment recommendations, and clinical insights.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrowIcon />}
              onClick={handleEnterAgentMode}
              sx={{ mt: 2 }}
            >
              Enter Agent Mode
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SmartToyIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            AI Medical Agent
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={handleExitAgentMode}
          color="secondary"
        >
          Exit Agent Mode
        </Button>
      </Box>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Analyzing Patient Data...
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={analysisProgress} 
            sx={{ mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {analysisProgress}% Complete
          </Typography>
        </Paper>
      )}

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Patient Selection Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Patient Selection
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Patient Type</InputLabel>
                <Select
                  value={patientType}
                  label="Patient Type"
                  onChange={(e) => setPatientType(e.target.value as 'existing' | 'new')}
                >
                  <MenuItem value="existing">Existing Patient</MenuItem>
                  <MenuItem value="new">New Patient</MenuItem>
                </Select>
              </FormControl>

              {patientType === 'existing' && (
                <>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Select Patient</InputLabel>
                    <Select
                      value={selectedPatient}
                      label="Select Patient"
                      onChange={(e) => handlePatientSelect(e.target.value)}
                    >
                      {uniquePatients.map((patient) => (
                        <MenuItem key={patient.id} value={patient.id}>
                          {patient.name} ({patient.age}y, {patient.gender})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {selectedPatient && (
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                        Add Additional Information for Analysis
                      </Typography>
                      <Typography variant="caption" sx={{ mb: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                        Optional: You can run analysis with existing patient data only, or add current visit information below
                      </Typography>
                      <Stack spacing={2}>
                        <TextField
                          fullWidth
                          label="Current Chief Complaint"
                          value={existingPatientAddition.chiefComplaint}
                          onChange={(e) => handleExistingPatientAdditionChange('chiefComplaint', e.target.value)}
                          multiline
                          rows={2}
                          placeholder="Describe the current reason for visit..."
                        />

                        <TextField
                          fullWidth
                          label="Current Symptoms"
                          value={existingPatientAddition.currentSymptoms}
                          onChange={(e) => handleExistingPatientAdditionChange('currentSymptoms', e.target.value)}
                          multiline
                          rows={3}
                          placeholder="Describe current symptoms, onset, duration, severity..."
                        />

                        <TextField
                          fullWidth
                          label="Recent Medical History"
                          value={existingPatientAddition.newMedicalHistory}
                          onChange={(e) => handleExistingPatientAdditionChange('newMedicalHistory', e.target.value)}
                          multiline
                          rows={2}
                          placeholder="Any new medical conditions or recent changes..."
                        />

                        <TextField
                          fullWidth
                          label="Current Medications"
                          value={existingPatientAddition.currentMedications}
                          onChange={(e) => handleExistingPatientAdditionChange('currentMedications', e.target.value)}
                          multiline
                          rows={2}
                          placeholder="List current medications, dosages, and any recent changes..."
                        />

                        <TextField
                          fullWidth
                          label="New Allergies"
                          value={existingPatientAddition.newAllergies}
                          onChange={(e) => handleExistingPatientAdditionChange('newAllergies', e.target.value)}
                          placeholder="Any new allergies or reactions..."
                        />

                        <TextField
                          fullWidth
                          label="Additional Information"
                          value={existingPatientAddition.additionalInfo}
                          onChange={(e) => handleExistingPatientAdditionChange('additionalInfo', e.target.value)}
                          multiline
                          rows={2}
                          placeholder="Any other relevant information for this visit..."
                        />
                      </Stack>
                    </>
                  )}
                </>
              )}

              {patientType === 'new' && (
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={newPatientData.firstName}
                        onChange={(e) => handleNewPatientDataChange('firstName', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={newPatientData.lastName}
                        onChange={(e) => handleNewPatientDataChange('lastName', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Age"
                        type="number"
                        value={newPatientData.age || ''}
                        onChange={(e) => handleNewPatientDataChange('age', parseInt(e.target.value) || 0)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Gender</InputLabel>
                        <Select
                          value={newPatientData.gender}
                          label="Gender"
                          onChange={(e) => handleNewPatientDataChange('gender', e.target.value)}
                        >
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                          <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label="Chief Complaint"
                    value={newPatientData.chiefComplaint}
                    onChange={(e) => handleNewPatientDataChange('chiefComplaint', e.target.value)}
                    multiline
                    rows={2}
                  />

                  <TextField
                    fullWidth
                    label="Symptoms"
                    value={newPatientData.symptoms}
                    onChange={(e) => handleNewPatientDataChange('symptoms', e.target.value)}
                    multiline
                    rows={3}
                  />

                  <TextField
                    fullWidth
                    label="Medical History"
                    value={newPatientData.medicalHistory}
                    onChange={(e) => handleNewPatientDataChange('medicalHistory', e.target.value)}
                    multiline
                    rows={2}
                  />

                  <TextField
                    fullWidth
                    label="Current Medications"
                    value={newPatientData.medications}
                    onChange={(e) => handleNewPatientDataChange('medications', e.target.value)}
                    multiline
                    rows={2}
                  />

                  <TextField
                    fullWidth
                    label="Allergies"
                    value={newPatientData.allergies}
                    onChange={(e) => handleNewPatientDataChange('allergies', e.target.value)}
                  />

                  <TextField
                    fullWidth
                    label="Additional Information"
                    value={newPatientData.additionalInfo}
                    onChange={(e) => handleNewPatientDataChange('additionalInfo', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Stack>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<PsychologyIcon />}
                onClick={handleRunAnalysis}
                disabled={!canRunAnalysis() || isAnalyzing}
                sx={{ mt: 3 }}
              >
                {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Analysis Results Panel */}
        <Grid item xs={12} md={8}>
          {analysis ? (
            <Card>
              <CardContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                    <Tab label="Analysis Overview" />
                    <Tab label="Differential Diagnoses" />
                    <Tab label="Treatment Recommendations" />
                    <Tab label="Clinical Concerns" />
                  </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        <AutoAwesomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        AI Analysis Summary
                      </Typography>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Analysis Confidence:</strong> {Math.round(analysis.confidenceScore * 100)}%
                        </Typography>
                      </Alert>
                      <Typography variant="body1" paragraph>
                        {analysis.reasoning}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="h6" gutterBottom>
                        <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Extracted Symptoms
                      </Typography>
                      <Grid container spacing={2}>
                        {analysis.symptoms.map((symptom) => (
                          <Grid item xs={12} sm={6} key={symptom.id}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="subtitle1" gutterBottom>
                                  {symptom.name}
                                </Typography>
                                <Chip
                                  label={symptom.severity}
                                  color={getSeverityColor(symptom.severity) as any}
                                  size="small"
                                  sx={{ mb: 1 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                  Duration: {symptom.duration}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Confidence: {Math.round(symptom.confidence * 100)}%
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    <Box>
                      <Typography variant="h6" gutterBottom>
                        <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Next Steps
                      </Typography>
                      <List>
                        {analysis.nextSteps.map((step, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={step} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Stack>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Stack spacing={2}>
                    <Typography variant="h6" gutterBottom>
                      <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Differential Diagnoses
                    </Typography>
                    {analysis.diagnoses.map((diagnosis) => (
                      <Accordion key={diagnosis.id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                              {diagnosis.condition}
                            </Typography>
                            <Chip
                              label={`${Math.round(diagnosis.probability * 100)}% probability`}
                              color="primary"
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Chip
                              label={diagnosis.severity}
                              color={getSeverityColor(diagnosis.severity) as any}
                              size="small"
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                ICD-10 Code: {diagnosis.icd10Code}
                              </Typography>
                              <Typography variant="body1" paragraph>
                                {diagnosis.reasoning}
                              </Typography>
                            </Box>
                            
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Supporting Evidence
                                </Typography>
                                <List dense>
                                  {diagnosis.supportingEvidence.map((evidence, index) => (
                                    <ListItem key={index}>
                                      <ListItemIcon>
                                        <CheckCircleIcon color="success" />
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
                                        <ErrorIcon color="error" />
                                      </ListItemIcon>
                                      <ListItemText primary={evidence} />
                                    </ListItem>
                                  ))}
                                </List>
                              </Grid>
                            </Grid>

                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                Additional Tests Needed
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {diagnosis.additionalTestsNeeded.map((test, index) => (
                                  <Chip key={index} label={test} variant="outlined" />
                                ))}
                              </Stack>
                            </Box>
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Stack>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Stack spacing={2}>
                    <Typography variant="h6" gutterBottom>
                      <HospitalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Treatment Recommendations
                    </Typography>
                    {analysis.treatments.map((treatment) => (
                      <Card key={treatment.id} variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6">
                              {treatment.recommendation}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              <Chip
                                label={treatment.priority}
                                color={getPriorityColor(treatment.priority) as any}
                                size="small"
                              />
                              <Chip
                                label={`Evidence Level ${treatment.evidenceLevel}`}
                                color={getEvidenceColor(treatment.evidenceLevel) as any}
                                size="small"
                              />
                            </Stack>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Category: {treatment.category} | Timeframe: {treatment.timeframe}
                          </Typography>
                          
                          <Typography variant="body1" paragraph>
                            {treatment.expectedOutcome}
                          </Typography>

                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" gutterBottom>
                                Contraindications
                              </Typography>
                              <List dense>
                                {treatment.contraindications.map((contraindication, index) => (
                                  <ListItem key={index}>
                                    <ListItemIcon>
                                      <WarningIcon color="warning" />
                                    </ListItemIcon>
                                    <ListItemText primary={contraindication} />
                                  </ListItem>
                                ))}
                              </List>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" gutterBottom>
                                Alternatives
                              </Typography>
                              <List dense>
                                {treatment.alternatives.map((alternative, index) => (
                                  <ListItem key={index}>
                                    <ListItemText primary={alternative} />
                                  </ListItem>
                                ))}
                              </List>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <Stack spacing={2}>
                    <Typography variant="h6" gutterBottom>
                      <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Clinical Concerns & Alerts
                    </Typography>
                    {analysis.concerns.map((concern) => (
                      <Alert
                        key={concern.id}
                        severity={concern.severity === 'critical' ? 'error' : concern.severity === 'high' ? 'warning' : 'info'}
                        action={
                          concern.requiresImmediateAction && (
                            <Button color="inherit" size="small">
                              Act Now
                            </Button>
                          )
                        }
                      >
                        <Typography variant="subtitle1" gutterBottom>
                          {concern.message}
                        </Typography>
                        <Typography variant="body2">
                          {concern.recommendation}
                        </Typography>
                      </Alert>
                    ))}
                  </Stack>
                </TabPanel>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <PsychologyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Select a patient and run AI analysis to view results
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIAgent; 