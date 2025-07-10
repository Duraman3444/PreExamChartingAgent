import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Error,
  Warning,
  Psychology,
  LocalHospital,
  Assessment,
  Science,
  MedicalServices,
  Shield,
  VerifiedUser,
  Timeline,
  Insights,
  TrendingUp,
  Star,
  Info,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Download,
  Share,
  Print,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { 
  O1DeepAnalysisResult, 
  O1AnalysisStage, 
  O1ComprehensiveSymptom,
  O1DifferentialDiagnosis,
  O1TreatmentProtocol,
  O1QualityAssurance,
  ValidationCheck,
  O1EvidenceSource,
  o1DeepReasoningService
} from '../../services/o1DeepReasoning';

interface O1DeepReasoningDisplayProps {
  transcript: string;
  patientContext?: {
    age?: number;
    gender?: string;
    medicalHistory?: string;
    medications?: string;
    allergies?: string;
    familyHistory?: string;
    socialHistory?: string;
  };
  onAnalysisComplete?: (result: O1DeepAnalysisResult) => void;
  onAnalysisError?: (error: Error) => void;
  analysisDepth?: 'comprehensive' | 'deep' | 'ultra_deep';
  autoStart?: boolean;
}

const O1DeepReasoningDisplay: React.FC<O1DeepReasoningDisplayProps> = ({
  transcript,
  patientContext,
  onAnalysisComplete,
  onAnalysisError,
  analysisDepth = 'comprehensive',
  autoStart = false,
}) => {
  const theme = useTheme();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<O1DeepAnalysisResult | null>(null);
  const [stages, setStages] = useState<O1AnalysisStage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (autoStart && transcript) {
      startAnalysis();
    }
  }, [autoStart, transcript]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isAnalyzing && startTime) {
      interval = setInterval(() => {
        setProcessingTime(Date.now() - startTime);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing, startTime]);

  const startAnalysis = async () => {
    if (!transcript) {
      setError('Transcript is required for analysis');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisProgress(0);
    setCurrentStage(0);
    setStartTime(Date.now());
    setProcessingTime(0);

    try {
      console.log('🚀 [O1 UI] Starting O1 Preview analysis');

      // Create a new service instance for this analysis
      const service = new (await import('../../services/o1DeepReasoning')).default();
      
      // Start the analysis
      const result = await service.performO1Analysis(
        transcript,
        patientContext,
        {
          analysisDepth,
          timeoutMinutes: 20 // Extended timeout for comprehensive analysis
        }
      );

      console.log('✅ [O1 UI] Analysis completed successfully');
      
      setAnalysisResult(result);
      setStages(result.stages);
      setAnalysisProgress(100);
      setCurrentStage(7);
      setIsAnalyzing(false);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }

    } catch (error) {
      console.error('❌ [O1 UI] Analysis failed:', error);
      setError((error as Error).message || 'Analysis failed');
      setIsAnalyzing(false);
      
      if (onAnalysisError) {
        onAnalysisError(error as Error);
      }
    }
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    setError('Analysis stopped by user');
  };

  const toggleStageExpansion = (stageId: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
  };

  const getStageIcon = (stage: O1AnalysisStage) => {
    switch (stage.id) {
      case 'intake_analysis':
        return <Assessment />;
      case 'symptom_characterization':
        return <LocalHospital />;
      case 'differential_generation':
        return <Psychology />;
      case 'evidence_research':
        return <Science />;
      case 'treatment_planning':
        return <MedicalServices />;
      case 'risk_assessment':
        return <Shield />;
      case 'validation_qa':
        return <VerifiedUser />;
      default:
        return <Timeline />;
    }
  };

  const getStageColor = (stage: O1AnalysisStage) => {
    switch (stage.status) {
      case 'completed':
        return 'success';
      case 'running':
        return 'primary';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const renderStageProgress = () => {
    const completedStages = stages.filter(s => s.status === 'completed').length;
    const totalStages = stages.length;
    const progress = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            O1 Preview Analysis Progress
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {formatTime(processingTime)}
            </Typography>
            <Chip
              label={`${completedStages}/${totalStages} stages`}
              color={isAnalyzing ? 'primary' : 'success'}
              size="small"
            />
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4, mb: 2 }}
        />
      </Box>
    );
  };

  const renderStageDetails = (stage: O1AnalysisStage) => (
    <Card sx={{ mb: 2 }} elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getStageIcon(stage)}
          <Typography variant="h6" sx={{ ml: 2, flex: 1 }}>
            {stage.name}
          </Typography>
          <Chip
            label={stage.status}
            color={getStageColor(stage) as any}
            size="small"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {stage.description}
        </Typography>

        {stage.status === 'running' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2">Processing...</Typography>
          </Box>
        )}

        {stage.status === 'completed' && stage.startTime && stage.endTime && (
          <Typography variant="body2" color="text.secondary">
            Completed in {formatTime(stage.endTime - stage.startTime)}
          </Typography>
        )}

        {stage.result && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={expandedStages.has(stage.id) ? <VisibilityOff /> : <Visibility />}
              onClick={() => toggleStageExpansion(stage.id)}
            >
              {expandedStages.has(stage.id) ? 'Hide' : 'Show'} Results
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderAnalysisResults = () => {
    if (!analysisResult) return null;

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Analysis Results
        </Typography>

        {/* Executive Summary */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Executive Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">
                  Primary Concern
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {analysisResult.executiveSummary.primaryConcern}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">
                  Urgency Level
                </Typography>
                <Chip
                  label={analysisResult.executiveSummary.urgencyLevel}
                  color={
                    analysisResult.executiveSummary.urgencyLevel === 'emergent' ? 'error' :
                    analysisResult.executiveSummary.urgencyLevel === 'urgent' ? 'warning' :
                    'success'
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary">
                  Key Findings
                </Typography>
                <List dense>
                  {analysisResult.executiveSummary.keyFindings.map((finding, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon>
                        <CheckCircle color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={finding} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Quality Assurance */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quality Assurance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {Math.round(analysisResult.qualityAssurance.overallConfidence * 100)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall Confidence
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {Math.round(analysisResult.qualityAssurance.consistencyScore * 100)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Consistency Score
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    label={analysisResult.qualityAssurance.evidenceQuality}
                    color={
                      analysisResult.qualityAssurance.evidenceQuality === 'high' ? 'success' :
                      analysisResult.qualityAssurance.evidenceQuality === 'moderate' ? 'warning' :
                      'error'
                    }
                  />
                  <Typography variant="body2" color="text.secondary">
                    Evidence Quality
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    label={analysisResult.qualityAssurance.safetyValidation}
                    color={
                      analysisResult.qualityAssurance.safetyValidation === 'pass' ? 'success' :
                      analysisResult.qualityAssurance.safetyValidation === 'warning' ? 'warning' :
                      'error'
                    }
                  />
                  <Typography variant="body2" color="text.secondary">
                    Safety Validation
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Comprehensive Results Tabs */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Comprehensive Symptoms ({analysisResult.comprehensiveSymptoms.length})
                </Typography>
                <List>
                  {analysisResult.comprehensiveSymptoms.slice(0, 5).map((symptom, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={symptom.name}
                        secondary={`${symptom.severity} • ${symptom.confidence}% confidence`}
                      />
                      <Chip
                        label={symptom.clinicalSignificance}
                        size="small"
                        color={
                          symptom.clinicalSignificance === 'high' ? 'error' :
                          symptom.clinicalSignificance === 'medium' ? 'warning' :
                          'success'
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                {analysisResult.comprehensiveSymptoms.length > 5 && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                      setSelectedResult({ type: 'symptoms', data: analysisResult.comprehensiveSymptoms });
                      setDialogOpen(true);
                    }}
                  >
                    View All Symptoms
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Differential Diagnoses ({analysisResult.differentialDiagnoses.length})
                </Typography>
                <List>
                  {analysisResult.differentialDiagnoses.slice(0, 5).map((diagnosis, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={diagnosis.condition}
                        secondary={`${Math.round(diagnosis.probability * 100)}% probability • ${diagnosis.evidenceLevel} evidence`}
                      />
                      <Chip
                        label={diagnosis.urgency}
                        size="small"
                        color={
                          diagnosis.urgency === 'emergent' ? 'error' :
                          diagnosis.urgency === 'urgent' ? 'warning' :
                          'success'
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                {analysisResult.differentialDiagnoses.length > 5 && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                      setSelectedResult({ type: 'diagnoses', data: analysisResult.differentialDiagnoses });
                      setDialogOpen(true);
                    }}
                  >
                    View All Diagnoses
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderDetailDialog = () => (
    <Dialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        {selectedResult?.type === 'symptoms' ? 'Comprehensive Symptoms' : 'Differential Diagnoses'}
      </DialogTitle>
      <DialogContent>
        {selectedResult?.type === 'symptoms' ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Symptom</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Significance</TableCell>
                  <TableCell>Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedResult.data.map((symptom: O1ComprehensiveSymptom, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{symptom.name}</TableCell>
                    <TableCell>{symptom.severity}</TableCell>
                    <TableCell>{symptom.confidence}%</TableCell>
                    <TableCell>{symptom.clinicalSignificance}</TableCell>
                    <TableCell>{symptom.duration}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Condition</TableCell>
                  <TableCell>Probability</TableCell>
                  <TableCell>Evidence Level</TableCell>
                  <TableCell>Urgency</TableCell>
                  <TableCell>ICD-10</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedResult.data.map((diagnosis: O1DifferentialDiagnosis, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{diagnosis.condition}</TableCell>
                    <TableCell>{Math.round(diagnosis.probability * 100)}%</TableCell>
                    <TableCell>{diagnosis.evidenceLevel}</TableCell>
                    <TableCell>{diagnosis.urgency}</TableCell>
                    <TableCell>{diagnosis.icd10Code}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5">
              O1 Preview Analysis
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!isAnalyzing && !analysisResult && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={startAnalysis}
                  disabled={!transcript}
                >
                  Start Analysis
                </Button>
              )}
              {isAnalyzing && (
                <Button
                  variant="outlined"
                  startIcon={<Stop />}
                  onClick={stopAnalysis}
                  color="error"
                >
                  Stop Analysis
                </Button>
              )}
              {analysisResult && (
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={startAnalysis}
                >
                  Reanalyze
                </Button>
              )}
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {(isAnalyzing || analysisResult) && renderStageProgress()}

          {stages.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Analysis Stages
              </Typography>
              {stages.map((stage) => renderStageDetails(stage))}
            </Box>
          )}

          {renderAnalysisResults()}
          {renderDetailDialog()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default O1DeepReasoningDisplay; 