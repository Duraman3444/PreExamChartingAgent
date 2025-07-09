import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  Tabs,
  Tab,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
} from '@mui/material';
import {
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
  PlayArrow as PlayArrowIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  LocalHospital as HospitalIcon,
  Warning as WarningIcon,
  AutoAwesome as AutoAwesomeIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { mockVisits } from '@/data/mockData';
import { validateAIIntegration, type AIValidationResult } from '@/utils/aiTestUtils';

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

interface ReasoningStep {
  id: string;
  timestamp: number;
  type: 'analysis' | 'research' | 'evaluation' | 'synthesis' | 'decision' | 'validation';
  title: string;
  content: string;
  confidence: number;
  evidence?: string[];
  considerations?: string[];
}

interface ReasoningTrace {
  sessionId: string;
  totalSteps: number;
  steps: ReasoningStep[];
  startTime: number;
  endTime?: number;
  model: string;
  reasoning: string;
}

interface AIAgentAnalysis {
  symptoms: Symptom[];
  diagnoses: Diagnosis[];
  treatments: Treatment[];
  concerns: ConcernFlag[];
  confidenceScore: number;
  reasoning: string;
  nextSteps: string[];
  reasoningTrace?: ReasoningTrace;
  modelUsed?: 'o1' | 'o1-mini' | 'gpt-4o';
  thinkingTime?: number;
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
  const [testResult, setTestResult] = useState<AIValidationResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'quick' | 'o1_deep_reasoning'>('quick');

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

  const generatePatientTranscript = (patientData: any): string => {
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
    
    let transcript = `Patient Visit Summary\n\n`;
    
    if (isExisting) {
      transcript += `Patient: ${patientData.name}\n`;
      transcript += `Age: ${patientData.age}\n`;
      transcript += `Gender: ${patientData.gender}\n`;
      transcript += `Previous Medical History: ${patientData.medicalHistory}\n`;
      transcript += `Known Allergies: ${patientData.allergies}\n`;
      transcript += `Current Medications: ${patientData.medications}\n`;
      transcript += `Recent Visit: ${patientData.recentVisit}\n\n`;
      
      if (hasAdditionalInfo) {
        transcript += `Current Visit Information:\n`;
        transcript += `Chief Complaint: ${chiefComplaint}\n`;
        if (symptoms) transcript += `Current Symptoms: ${symptoms}\n`;
        if (patientData.additionalInfo.newMedicalHistory) {
          transcript += `New Medical History: ${patientData.additionalInfo.newMedicalHistory}\n`;
        }
        if (patientData.additionalInfo.currentMedications) {
          transcript += `Current Medications: ${patientData.additionalInfo.currentMedications}\n`;
        }
        if (patientData.additionalInfo.newAllergies) {
          transcript += `New Allergies: ${patientData.additionalInfo.newAllergies}\n`;
        }
        if (patientData.additionalInfo.additionalInfo) {
          transcript += `Additional Information: ${patientData.additionalInfo.additionalInfo}\n`;
        }
      }
    } else {
      transcript += `Patient: ${patientData.firstName} ${patientData.lastName}\n`;
      transcript += `Age: ${patientData.age}\n`;
      transcript += `Gender: ${patientData.gender}\n`;
      transcript += `Chief Complaint: ${chiefComplaint}\n`;
      if (symptoms) transcript += `Symptoms: ${symptoms}\n`;
      if (patientData.medicalHistory) transcript += `Medical History: ${patientData.medicalHistory}\n`;
      if (patientData.medications) transcript += `Current Medications: ${patientData.medications}\n`;
      if (patientData.allergies) transcript += `Known Allergies: ${patientData.allergies}\n`;
      if (patientData.additionalInfo) transcript += `Additional Information: ${patientData.additionalInfo}\n`;
    }
    
    return transcript;
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Progress tracking
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Get patient data
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

      // Generate transcript from patient data
      const transcript = generatePatientTranscript(patientData);
      
      // Import OpenAI service
      const { openAIService } = await import('../services/openai');
      
      // Check if OpenAI is configured
      if (!openAIService.isConfigured()) {
        console.warn('OpenAI not configured, falling back to mock analysis');
        
        // Generate fallback mock analysis
        const mockAnalysis: AIAgentAnalysis = {
          symptoms: [{
            id: 'sym-1',
            name: 'Primary concern (Mock Analysis)',
            severity: 'moderate',
            confidence: 0.85,
            duration: 'Recent onset',
            location: 'As described',
            quality: 'Patient reported',
            associatedFactors: ['current presentation'],
            sourceText: `Patient reports symptoms - OpenAI API not configured`
          }],
          diagnoses: [{
            id: 'dx-1',
            condition: 'Requires real OpenAI API for analysis',
            icd10Code: 'Z00.00',
            probability: 0.5,
            severity: 'medium',
            supportingEvidence: ['patient history', 'presenting symptoms'],
            againstEvidence: ['OpenAI API not configured'],
            additionalTestsNeeded: ['Configure OpenAI API key'],
            reasoning: 'OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file for real analysis.',
            urgency: 'routine'
          }],
          treatments: [{
            id: 'tx-1',
            category: 'medication',
            recommendation: 'Configure OpenAI API for real treatment recommendations',
            priority: 'high',
            timeframe: 'Immediate',
            contraindications: ['Missing API configuration'],
            alternatives: ['Set up OpenAI API key'],
            expectedOutcome: 'Real AI analysis capabilities',
            evidenceLevel: 'A'
          }],
          concerns: [{
            id: 'flag-1',
            type: 'red_flag',
            severity: 'high',
            message: 'OpenAI API not configured',
            recommendation: 'Add VITE_OPENAI_API_KEY to .env file',
            requiresImmediateAction: true
          }],
          confidenceScore: 0.1,
          reasoning: 'This is a mock analysis because OpenAI API is not configured. To get real medical AI analysis, please configure your OpenAI API key.',
          nextSteps: [
            'Configure OpenAI API key in .env file',
            'Restart the application',
            'Run analysis again for real AI insights'
          ]
        };
        
        clearInterval(progressInterval);
        setAnalysis(mockAnalysis);
        setAnalysisProgress(100);
        setTabValue(1);
        return;
      }

      // Prepare patient context for OpenAI
      const patientContext = {
        age: (patientData as any).age,
        gender: (patientData as any).gender,
        medicalHistory: (patientData as any).medicalHistory,
        medications: (patientData as any).medications,
        allergies: (patientData as any).allergies,
        familyHistory: (patientData as any).familyHistory || '',
        socialHistory: (patientData as any).socialHistory || ''
      };

      // Use real OpenAI analysis with appropriate model
      let aiAnalysis: AIAgentAnalysis;
      
      if (analysisMode === 'quick') {
        const analysisResult = await openAIService.quickAnalyzeTranscript(transcript);
        aiAnalysis = {
          symptoms: analysisResult.symptoms,
          diagnoses: analysisResult.diagnoses,
          treatments: analysisResult.treatments,
          concerns: analysisResult.concerns,
          confidenceScore: analysisResult.confidenceScore,
          reasoning: analysisResult.reasoning,
          nextSteps: analysisResult.nextSteps,
          modelUsed: 'gpt-4o'
        };
      } else {
        // O1 Deep Reasoning - now processes exactly like 4o model but with reasoning trace
        const o1Result = await openAIService.analyzeTranscriptWithReasoning(transcript, patientContext, 'o1');
        
        // Use the O1 result directly since it now has the same structure as 4o
        aiAnalysis = {
          symptoms: o1Result.symptoms,
          diagnoses: o1Result.diagnoses,
          treatments: o1Result.treatments,
          concerns: o1Result.concerns,
          confidenceScore: o1Result.confidenceScore,
          reasoning: o1Result.reasoning,
          nextSteps: o1Result.nextSteps,
          reasoningTrace: o1Result.reasoningTrace,
          modelUsed: o1Result.modelUsed,
          thinkingTime: o1Result.thinkingTime
        };
      }

      clearInterval(progressInterval);
      setAnalysis(aiAnalysis);
      setAnalysisProgress(100);
      setTabValue(1);

    } catch (error) {
      console.error('Analysis failed:', error);
      
      // Fallback to mock analysis on error
      const errorAnalysis: AIAgentAnalysis = {
        symptoms: [{
          id: 'sym-error',
          name: 'Analysis Error',
          severity: 'critical',
          confidence: 0.1,
          duration: 'System error',
          location: 'API service',
          quality: 'Error condition',
          associatedFactors: ['API failure'],
          sourceText: `Error occurred during analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        diagnoses: [{
          id: 'dx-error',
          condition: 'Analysis service error',
          icd10Code: 'Z99.9',
          probability: 0.1,
          severity: 'critical',
          supportingEvidence: ['system error'],
          againstEvidence: ['normal operation'],
          additionalTestsNeeded: ['check API configuration', 'verify network connectivity'],
          reasoning: `Failed to complete AI analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
          urgency: 'urgent'
        }],
        treatments: [{
          id: 'tx-error',
          category: 'monitoring',
          recommendation: 'Check system configuration and try again',
          priority: 'urgent',
          timeframe: 'Immediate',
          contraindications: ['system errors'],
          alternatives: ['manual analysis', 'retry with different parameters'],
          expectedOutcome: 'System restoration',
          evidenceLevel: 'D'
        }],
        concerns: [{
          id: 'flag-error',
          type: 'red_flag',
          severity: 'critical',
          message: 'Analysis system error',
          recommendation: 'Contact system administrator',
          requiresImmediateAction: true
        }],
        confidenceScore: 0.1,
        reasoning: 'Analysis could not be completed due to system error. Please check configuration and try again.',
        nextSteps: [
          'Verify OpenAI API key configuration',
          'Check network connectivity',
          'Review error logs',
          'Contact technical support if issue persists'
        ]
      };
      
      setAnalysis(errorAnalysis);
      setAnalysisProgress(100);
      setTabValue(1);
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

  const handleTestAI = async () => {
    setIsTesting(true);
    try {
      const result = await validateAIIntegration();
      setTestResult(result);
      console.log('AI Test Results:', result);
    } catch (error) {
      console.error('AI Test Failed:', error);
    } finally {
      setIsTesting(false);
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

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Analysis Mode</InputLabel>
                <Select
                  value={analysisMode}
                  label="Analysis Mode"
                  onChange={(e) => setAnalysisMode(e.target.value as 'quick' | 'o1_deep_reasoning')}
                  disabled={isAnalyzing}
                >
                  <MenuItem value="quick">
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Quick Analysis (5-15 seconds)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Rapid assessment with core diagnoses - GPT-4o
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="o1_deep_reasoning">
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        🧠🔬 O1 Deep Research + Reasoning (60-120 seconds)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Advanced reasoning + research integration with full thinking process - O1
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<PsychologyIcon />}
                onClick={handleRunAnalysis}
                disabled={!canRunAnalysis() || isAnalyzing}
                sx={{ mt: 2 }}
              >
                {isAnalyzing ? 'Analyzing...' : `Run ${
                  analysisMode === 'quick' ? 'Quick' : 'O1 Deep Research'
                } AI Analysis`}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                size="medium"
                startIcon={<SecurityIcon />}
                onClick={handleTestAI}
                disabled={isTesting}
                sx={{ mt: 2 }}
              >
                {isTesting ? 'Testing AI...' : 'Test AI Integration'}
              </Button>

              {testResult && (
                <Alert 
                  severity={testResult.isWorking && testResult.isRealAI ? 'success' : 'warning'}
                  sx={{ mt: 2 }}
                >
                  <Typography variant="body2" gutterBottom>
                    <strong>AI Integration Test Results:</strong>
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    • API Working: {testResult.isWorking ? '✅' : '❌'}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    • Real AI: {testResult.isRealAI ? '✅' : '❌'}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    • Medical Accuracy: {testResult.medicalAccuracy.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    • Full Analysis Time: {testResult.testResults.responseTime}ms
                  </Typography>
                  {testResult.testResults.quickResponseTime && (
                    <Typography variant="body2" gutterBottom>
                      • Quick Analysis Time: {testResult.testResults.quickResponseTime}ms
                    </Typography>
                  )}
                  {testResult.issues.length > 0 && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      Issues: {testResult.issues.join(', ')}
                    </Typography>
                  )}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Analysis Results Panel */}
        <Grid item xs={12} md={8}>
          {analysis ? (
            <Card>
              <CardContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                    <Tab label="Analysis Overview" />
                    <Tab label="Differential Diagnoses" />
                    <Tab label="Treatment Recommendations" />
                    <Tab label="Clinical Concerns" />
                    {analysis.reasoningTrace && <Tab label="🧠 Reasoning Process" />}
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
                          {analysis.modelUsed && (
                            <> | <strong>Model:</strong> {analysis.modelUsed.toUpperCase()}</>
                          )}
                          {analysis.thinkingTime && (
                            <> | <strong>Processing Time:</strong> {(analysis.thinkingTime / 1000).toFixed(1)}s</>
                          )}
                          {analysis.reasoningTrace && (
                            <> | <strong>Reasoning Steps:</strong> {analysis.reasoningTrace.totalSteps}</>
                          )}
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
                      {analysis.symptoms.length > 0 ? (
                        <Grid container spacing={2}>
                          {analysis.symptoms.map((symptom) => (
                            <Grid item xs={12} sm={6} key={symptom.id}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle1" gutterBottom>
                                    {symptom.name}
                                  </Typography>
                                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                    <Chip
                                      label={symptom.severity}
                                      color={getSeverityColor(symptom.severity) as any}
                                      size="small"
                                    />
                                    <Chip
                                      label={`${Math.round(symptom.confidence * 100)}% confidence`}
                                      variant="outlined"
                                      size="small"
                                    />
                                  </Stack>
                                  <Typography variant="body2" color="text.secondary">
                                    Duration: {symptom.duration}
                                  </Typography>
                                  {symptom.location && (
                                    <Typography variant="body2" color="text.secondary">
                                      Location: {symptom.location}
                                    </Typography>
                                  )}
                                  {symptom.quality && (
                                    <Typography variant="body2" color="text.secondary">
                                      Quality: {symptom.quality}
                                    </Typography>
                                  )}
                                  {symptom.associatedFactors && symptom.associatedFactors.length > 0 && (
                                    <Box sx={{ mt: 1 }}>
                                      <Typography variant="caption" color="text.secondary">
                                        Associated factors: {symptom.associatedFactors.join(', ')}
                                      </Typography>
                                    </Box>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Alert severity="info">
                          <Typography variant="body2">
                            No specific symptoms extracted from the analysis. Check the Reasoning Process tab for detailed symptom analysis.
                          </Typography>
                        </Alert>
                      )}
                    </Box>

                    <Box>
                      <Typography variant="h6" gutterBottom>
                        <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Clinical Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h6" color="primary">
                                {analysis.diagnoses.length}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Differential Diagnoses
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h6" color="secondary">
                                {analysis.treatments.length}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Treatment Recommendations
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h6" color="warning.main">
                                {analysis.concerns.length}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Clinical Concerns
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box>
                      <Typography variant="h6" gutterBottom>
                        <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Next Steps
                      </Typography>
                      {analysis.nextSteps && analysis.nextSteps.length > 0 ? (
                        <List>
                          {analysis.nextSteps.map((step, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <CheckCircleIcon color="success" />
                              </ListItemIcon>
                              <ListItemText primary={step} />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Alert severity="info">
                          <Typography variant="body2">
                            No specific next steps provided. Refer to treatment recommendations and clinical concerns for guidance.
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  </Stack>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Stack spacing={2}>
                    <Typography variant="h6" gutterBottom>
                      <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Differential Diagnoses
                    </Typography>
                    {analysis.diagnoses && analysis.diagnoses.length > 0 ? (
                      <Stack spacing={1}>
                        {analysis.diagnoses.map((diagnosis, index) => (
                          <Card key={diagnosis.id} variant="outlined">
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" gutterBottom>
                                    {diagnosis.condition}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    <strong>ICD-10 Code:</strong> {diagnosis.icd10Code}
                                  </Typography>
                                  <Typography variant="body2" paragraph>
                                    <strong>Clinical Reasoning:</strong> {diagnosis.reasoning}
                                  </Typography>
                                </Box>
                                <Box sx={{ ml: 2, minWidth: 200 }}>
                                  <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap">
                                    <Chip
                                      label={`${Math.round(diagnosis.probability * 100)}% probability`}
                                      color="primary"
                                      size="small"
                                    />
                                    <Chip
                                      label={diagnosis.severity}
                                      color={getSeverityColor(diagnosis.severity) as any}
                                      size="small"
                                    />
                                  </Stack>
                                  <Chip
                                    label={diagnosis.urgency}
                                    color={diagnosis.urgency === 'emergent' ? 'error' : diagnosis.urgency === 'urgent' ? 'warning' : 'default'}
                                    size="small"
                                  />
                                </Box>
                              </Box>

                              <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Supporting Evidence
                                  </Typography>
                                  {diagnosis.supportingEvidence && diagnosis.supportingEvidence.length > 0 ? (
                                    <List dense>
                                      {diagnosis.supportingEvidence.map((evidence, evidenceIndex) => (
                                        <ListItem key={evidenceIndex} sx={{ py: 0.5 }}>
                                          <ListItemIcon sx={{ minWidth: 30 }}>
                                            <CheckCircleIcon color="success" fontSize="small" />
                                          </ListItemIcon>
                                          <ListItemText primary={evidence} />
                                        </ListItem>
                                      ))}
                                    </List>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      Evidence may be embedded in clinical reasoning
                                    </Typography>
                                  )}
                                </Grid>

                                <Grid item xs={12} md={4}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Against Evidence
                                  </Typography>
                                  {diagnosis.againstEvidence && diagnosis.againstEvidence.length > 0 ? (
                                    <List dense>
                                      {diagnosis.againstEvidence.map((evidence, evidenceIndex) => (
                                        <ListItem key={evidenceIndex} sx={{ py: 0.5 }}>
                                          <ListItemIcon sx={{ minWidth: 30 }}>
                                            <ErrorIcon color="error" fontSize="small" />
                                          </ListItemIcon>
                                          <ListItemText primary={evidence} />
                                        </ListItem>
                                      ))}
                                    </List>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      No contradicting evidence identified
                                    </Typography>
                                  )}
                                </Grid>

                                <Grid item xs={12} md={4}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Additional Tests Needed
                                  </Typography>
                                  {diagnosis.additionalTestsNeeded && diagnosis.additionalTestsNeeded.length > 0 ? (
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                      {diagnosis.additionalTestsNeeded.map((test, testIndex) => (
                                        <Chip key={testIndex} label={test} variant="outlined" size="small" />
                                      ))}
                                    </Stack>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      No additional tests specified
                                    </Typography>
                                  )}
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    ) : (
                      <Alert severity="info">
                        <Typography variant="body2">
                          No differential diagnoses available. This may indicate the analysis is still processing or no specific diagnoses were identified.
                        </Typography>
                      </Alert>
                    )}
                  </Stack>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Stack spacing={2}>
                    <Typography variant="h6" gutterBottom>
                      <HospitalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Treatment Recommendations
                    </Typography>
                    {analysis.treatments && analysis.treatments.length > 0 ? (
                      analysis.treatments.map((treatment: Treatment) => (
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
                                {treatment.contraindications && treatment.contraindications.length > 0 ? (
                                  <List dense>
                                    {treatment.contraindications.map((contraindication: string, index: number) => (
                                      <ListItem key={index}>
                                        <ListItemIcon>
                                          <WarningIcon color="warning" />
                                        </ListItemIcon>
                                        <ListItemText primary={contraindication} />
                                      </ListItem>
                                    ))}
                                  </List>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No specific contraindications identified
                                  </Typography>
                                )}
                              </Grid>
                              
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Alternatives
                                </Typography>
                                {treatment.alternatives && treatment.alternatives.length > 0 ? (
                                  <List dense>
                                    {treatment.alternatives.map((alternative: string, index: number) => (
                                      <ListItem key={index}>
                                        <ListItemText primary={alternative} />
                                      </ListItem>
                                    ))}
                                  </List>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No alternative treatments specified
                                  </Typography>
                                )}
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Alert severity="info">
                        <Typography variant="body2">
                          No specific treatment recommendations available. This may indicate the analysis is still processing or no specific treatments were identified. Check the Next Steps section in the Analysis Overview for general guidance.
                        </Typography>
                      </Alert>
                    )}
                  </Stack>
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <Stack spacing={2}>
                    <Typography variant="h6" gutterBottom>
                      <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Clinical Concerns & Alerts
                    </Typography>
                    {analysis.concerns && analysis.concerns.length > 0 ? (
                      analysis.concerns.map((concern) => (
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
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Type: {concern.type.replace('_', ' ')} | Severity: {concern.severity}
                          </Typography>
                        </Alert>
                      ))
                    ) : (
                      <Alert severity="success">
                        <Typography variant="body2">
                          No immediate clinical concerns or red flags identified in the current analysis. Continue with routine monitoring and follow standard clinical protocols.
                        </Typography>
                      </Alert>
                    )}
                  </Stack>
                </TabPanel>

                {/* Reasoning Process Tab Panel */}
                {analysis.reasoningTrace && (
                  <TabPanel value={tabValue} index={4}>
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          O1 Model Reasoning Process
                        </Typography>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            <strong>Model:</strong> {analysis.modelUsed?.toUpperCase()} | 
                            <strong> Thinking Time:</strong> {analysis.thinkingTime ? `${(analysis.thinkingTime / 1000).toFixed(1)}s` : 'N/A'} |
                            <strong> Steps:</strong> {analysis.reasoningTrace.totalSteps}
                          </Typography>
                        </Alert>
                      </Box>

                      <Box>
                        <Typography variant="h6" gutterBottom>
                          <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Step-by-Step Reasoning
                        </Typography>
                        
                        {analysis.reasoningTrace.steps.length > 0 ? (
                          <Stack spacing={2}>
                            {analysis.reasoningTrace.steps.map((step, index) => (
                              <Card key={step.id} variant="outlined">
                                <CardContent>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                      Step {index + 1}: {step.title}
                                    </Typography>
                                    <Chip
                                      label={step.type}
                                      color={
                                        step.type === 'analysis' ? 'primary' :
                                        step.type === 'research' ? 'secondary' :
                                        step.type === 'evaluation' ? 'info' :
                                        step.type === 'synthesis' ? 'success' :
                                        step.type === 'decision' ? 'warning' :
                                        'default'
                                      }
                                      size="small"
                                      sx={{ mr: 1 }}
                                    />
                                    <Chip
                                      label={`${Math.round(step.confidence * 100)}% confidence`}
                                      variant="outlined"
                                      size="small"
                                    />
                                  </Box>
                                  
                                  <Typography variant="body1" paragraph>
                                    {step.content}
                                  </Typography>
                                  
                                  {step.evidence && step.evidence.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                      <Typography variant="subtitle2" gutterBottom>
                                        Evidence Considered:
                                      </Typography>
                                      <List dense>
                                        {step.evidence.map((evidence, evidenceIndex) => (
                                          <ListItem key={evidenceIndex}>
                                            <ListItemIcon>
                                              <CheckCircleIcon color="success" />
                                            </ListItemIcon>
                                            <ListItemText primary={evidence} />
                                          </ListItem>
                                        ))}
                                      </List>
                                    </Box>
                                  )}
                                  
                                  {step.considerations && step.considerations.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                      <Typography variant="subtitle2" gutterBottom>
                                        Key Considerations:
                                      </Typography>
                                      <Stack direction="row" spacing={1} flexWrap="wrap">
                                        {step.considerations.map((consideration, considerationIndex) => (
                                          <Chip 
                                            key={considerationIndex} 
                                            label={consideration} 
                                            variant="outlined" 
                                            size="small"
                                          />
                                        ))}
                                      </Stack>
                                    </Box>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </Stack>
                        ) : (
                          <Alert severity="info">
                            <Typography variant="body2">
                              No detailed reasoning steps available. The model may not have provided structured reasoning output.
                            </Typography>
                          </Alert>
                        )}
                      </Box>

                      {analysis.reasoningTrace.reasoning && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            <AutoAwesomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Full Reasoning Content
                          </Typography>
                          <Paper sx={{ 
                            p: 2, 
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                            border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)'
                          }}>
                            <Typography 
                              variant="body2" 
                              component="pre" 
                              sx={{ 
                                whiteSpace: 'pre-wrap',
                                color: (theme) => theme.palette.mode === 'dark' ? 'grey.100' : 'grey.800',
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                lineHeight: 1.6
                              }}
                            >
                              {analysis.reasoningTrace.reasoning}
                            </Typography>
                          </Paper>
                        </Box>
                      )}
                    </Stack>
                  </TabPanel>
                )}
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