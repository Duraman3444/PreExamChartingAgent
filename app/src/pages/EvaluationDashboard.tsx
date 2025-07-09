import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Collapse,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  PlayArrow as RunIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
  Psychology as PsychologyIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  DataUsage as DataUsageIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { aiEvaluationService, EvaluationMetrics, EvaluationResult, EvaluationProgress, EvaluationLog } from '../services/aiEvaluation';
import { syntheticPatientGenerator } from '../services/syntheticPatientGenerator';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`evaluation-tabpanel-${index}`}
      aria-labelledby={`evaluation-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const EvaluationDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationMetrics | null>(null);
  const [isRunningEvaluation, setIsRunningEvaluation] = useState(false);
  const [evaluationProgress, setEvaluationProgress] = useState(0);
  const [selectedResult, setSelectedResult] = useState<EvaluationResult | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [syntheticPatientCount, setSyntheticPatientCount] = useState(0);
  const [isGeneratingPatients, setIsGeneratingPatients] = useState(false);
  const [evaluationConfig, setEvaluationConfig] = useState({
    sampleSize: 50,
    modelType: 'quick' as 'quick' | 'o1_deep_reasoning',
    evaluationType: 'quick' as 'quick' | 'comprehensive'
  });
  
  // New logging state
  const [currentProgress, setCurrentProgress] = useState<EvaluationProgress | null>(null);
  const [evaluationLogs, setEvaluationLogs] = useState<EvaluationLog[]>([]);
  const [showLogs, setShowLogs] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  // New state for detailed results view
  const [showAllResults, setShowAllResults] = useState(false);
  const [resultsPage, setResultsPage] = useState(0);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [resultsFilter, setResultsFilter] = useState<string>('all');
  const [resultsSortBy, setResultsSortBy] = useState<'score' | 'id' | 'category'>('score');
  const [resultsSortOrder, setResultsSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // Load any previous evaluation results
    const savedResults = localStorage.getItem('evaluationResults');
    if (savedResults) {
      try {
        setEvaluationResults(JSON.parse(savedResults));
      } catch (error) {
        console.error('Failed to load saved evaluation results:', error);
      }
    }
  }, []);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [evaluationLogs]);

  const handleRunEvaluation = async () => {
    setIsRunningEvaluation(true);
    setEvaluationProgress(0);
    setCurrentProgress(null);
    setEvaluationLogs([]);

    // Set up progress callback
    const progressCallback = (progress: EvaluationProgress) => {
      setCurrentProgress(progress);
      setEvaluationProgress(progress.percentage);
      setEvaluationLogs(progress.logs);
    };

    aiEvaluationService.setProgressCallback(progressCallback);

    try {
      let results: EvaluationMetrics;
      
      if (evaluationConfig.evaluationType === 'quick') {
        results = await aiEvaluationService.quickEvaluation(evaluationConfig.sampleSize);
      } else {
        results = await aiEvaluationService.comprehensiveEvaluation(evaluationConfig.sampleSize);
      }

      setEvaluationProgress(100);
      setEvaluationResults(results);
      
      // Save results to localStorage
      localStorage.setItem('evaluationResults', JSON.stringify(results));

    } catch (error) {
      console.error('Evaluation failed:', error);
      setEvaluationProgress(0);
    } finally {
      setIsRunningEvaluation(false);
      aiEvaluationService.setProgressCallback(null);
      setTimeout(() => {
        setEvaluationProgress(0);
        setCurrentProgress(null);
      }, 3000);
    }
  };

  const handleGenerateSyntheticPatients = async () => {
    setIsGeneratingPatients(true);
    
    try {
      const patients = await syntheticPatientGenerator.generateDefaultSyntheticPatients(100);
      await syntheticPatientGenerator.addToPatientSystem(patients);
      setSyntheticPatientCount(patients.length);
    } catch (error) {
      console.error('Failed to generate synthetic patients:', error);
    } finally {
      setIsGeneratingPatients(false);
    }
  };

  const handleViewResult = (result: EvaluationResult) => {
    setSelectedResult(result);
    setResultDialogOpen(true);
  };

  const handleExportResults = () => {
    if (!evaluationResults) return;

    // Export filtered and sorted results
    const resultsToExport = getFilteredAndSortedResults();
    
    const csvData = resultsToExport.map(result => ({
      id: result.id,
      question: result.originalQuestion.substring(0, 200),
      expectedAnswer: result.expectedAnswer.substring(0, 200),
      overallScore: result.comparisonScore,
      category: result.category,
      symptomScore: result.detailedScores.symptomExtraction,
      diagnosisScore: result.detailedScores.diagnosisAccuracy,
      treatmentScore: result.detailedScores.treatmentRecommendations,
      coherenceScore: result.detailedScores.overallCoherence,
      strengths: result.strengths.join('; '),
      weaknesses: result.weaknesses.join('; '),
      aiSymptoms: result.aiAnalysis.symptoms.map((s: any) => s.name).join(', '),
      aiDiagnoses: result.aiAnalysis.diagnoses.map((d: any) => d.condition).join(', '),
      aiTreatments: result.aiAnalysis.treatments.map((t: any) => t.recommendation).join(', ')
    }));

    const csvContent = [
      ['ID', 'Question', 'Expected Answer', 'Overall Score', 'Category', 'Symptom Score', 'Diagnosis Score', 'Treatment Score', 'Coherence Score', 'Strengths', 'Weaknesses', 'AI Symptoms', 'AI Diagnoses', 'AI Treatments'],
      ...csvData.map(row => [
        row.id, 
        row.question, 
        row.expectedAnswer,
        row.overallScore.toString(), 
        row.category,
        row.symptomScore.toString(),
        row.diagnosisScore.toString(),
        row.treatmentScore.toString(),
        row.coherenceScore.toString(),
        row.strengths, 
        row.weaknesses,
        row.aiSymptoms,
        row.aiDiagnoses,
        row.aiTreatments
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Include filter info in filename
    const filterSuffix = resultsFilter !== 'all' ? `_${resultsFilter}` : '';
    link.download = `evaluation_results${filterSuffix}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckIcon color="success" />;
    if (score >= 60) return <WarningIcon color="warning" />;
    return <ErrorIcon color="error" />;
  };

  const getLogIcon = (type: EvaluationLog['type']) => {
    switch (type) {
      case 'success':
        return <CheckIcon sx={{ color: 'success.main', fontSize: 16 }} />;
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main', fontSize: 16 }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main', fontSize: 16 }} />;
      default:
        return <InfoIcon sx={{ color: 'info.main', fontSize: 16 }} />;
    }
  };

  const getLogColor = (type: EvaluationLog['type']) => {
    switch (type) {
      case 'success':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'error':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  // Helper functions for detailed results
  const getFilteredAndSortedResults = () => {
    if (!evaluationResults) return [];
    
    let filtered = evaluationResults.detailedResults;
    
    // Apply filter
    if (resultsFilter !== 'all') {
      filtered = filtered.filter(result => result.category === resultsFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (resultsSortBy) {
        case 'score':
          aVal = a.comparisonScore;
          bVal = b.comparisonScore;
          break;
        case 'id':
          aVal = a.id;
          bVal = b.id;
          break;
        case 'category':
          aVal = a.category;
          bVal = b.category;
          break;
        default:
          aVal = a.comparisonScore;
          bVal = b.comparisonScore;
      }
      
      if (resultsSortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const getPaginatedResults = () => {
    const filteredResults = getFilteredAndSortedResults();
    
    if (showAllResults) {
      return filteredResults;
    }
    
    const start = resultsPage * resultsPerPage;
    const end = start + resultsPerPage;
    return filteredResults.slice(start, end);
  };

  const getTotalPages = () => {
    const filteredResults = getFilteredAndSortedResults();
    return Math.ceil(filteredResults.length / resultsPerPage);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setResultsPage(0);
  }, [resultsFilter, resultsSortBy, resultsSortOrder]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        AI Evaluation Dashboard
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Evaluate AI performance against thousands of anonymized medical Q&A pairs
      </Typography>

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="AI Performance" icon={<AssessmentIcon />} />
        <Tab label="Synthetic Patients" icon={<PsychologyIcon />} />
        <Tab label="Dataset Analysis" icon={<DataUsageIcon />} />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Evaluation Configuration */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Evaluation Configuration
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Evaluation Type</InputLabel>
                  <Select
                    value={evaluationConfig.evaluationType}
                    label="Evaluation Type"
                    onChange={(e) => setEvaluationConfig(prev => ({ 
                      ...prev, 
                      evaluationType: e.target.value as 'quick' | 'comprehensive'
                    }))}
                  >
                    <MenuItem value="quick">Quick Evaluation (50 samples)</MenuItem>
                    <MenuItem value="comprehensive">Comprehensive (200 samples)</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>AI Model</InputLabel>
                  <Select
                    value={evaluationConfig.modelType}
                    label="AI Model"
                    onChange={(e) => setEvaluationConfig(prev => ({ 
                      ...prev, 
                      modelType: e.target.value as 'quick' | 'o1_deep_reasoning'
                    }))}
                  >
                    <MenuItem value="quick">GPT-4o (Quick)</MenuItem>
                    <MenuItem value="o1_deep_reasoning">O1 (Deep Reasoning)</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Sample Size"
                  type="number"
                  value={evaluationConfig.sampleSize}
                  onChange={(e) => setEvaluationConfig(prev => ({ 
                    ...prev, 
                    sampleSize: parseInt(e.target.value) || 50
                  }))}
                  sx={{ mb: 2 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<RunIcon />}
                  onClick={handleRunEvaluation}
                  disabled={isRunningEvaluation}
                >
                  {isRunningEvaluation ? 'Running Evaluation...' : 'Run AI Evaluation'}
                </Button>

                {isRunningEvaluation && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress variant="determinate" value={evaluationProgress} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Processing {evaluationProgress}% complete...
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Real-time Evaluation Logs */}
          {(isRunningEvaluation || evaluationLogs.length > 0) && (
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Evaluation Progress
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {currentProgress && (
                        <Typography variant="body2" color="text.secondary">
                          {currentProgress.currentRecord}/{currentProgress.totalRecords} records
                        </Typography>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => setShowLogs(!showLogs)}
                        aria-label={showLogs ? 'Hide logs' : 'Show logs'}
                      >
                        {showLogs ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                  </Box>

                  {currentProgress && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Step {currentProgress.currentStep} of {currentProgress.totalSteps}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {currentProgress.percentage}%
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={currentProgress.percentage} />
                    </Box>
                  )}

                  <Collapse in={showLogs}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        height: 400, 
                        overflow: 'auto',
                        backgroundColor: '#fafafa',
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      <Box
                        ref={logContainerRef}
                        sx={{
                          p: 2,
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          lineHeight: 1.4,
                          height: '100%',
                          overflow: 'auto'
                        }}
                      >
                        {evaluationLogs.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                            No logs yet. Click "Run AI Evaluation" to start.
                          </Typography>
                        ) : (
                          evaluationLogs.map((log, index) => (
                            <Box
                              key={log.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                mb: 1,
                                gap: 1,
                                p: 1,
                                borderRadius: 1,
                                backgroundColor: log.type === 'error' ? '#ffebee' : 
                                                log.type === 'warning' ? '#fff3e0' :
                                                log.type === 'success' ? '#e8f5e8' : 'transparent'
                              }}
                            >
                              <Box sx={{ mt: 0.5 }}>
                                {getLogIcon(log.type)}
                              </Box>
                              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: getLogColor(log.type),
                                    fontFamily: 'monospace',
                                    fontSize: '0.8rem',
                                    wordBreak: 'break-word'
                                  }}
                                >
                                  [{format(log.timestamp, 'HH:mm:ss')}] {log.message}
                                </Typography>
                                {log.details && (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: 'text.secondary',
                                      fontFamily: 'monospace',
                                      fontSize: '0.75rem',
                                      mt: 0.5,
                                      pl: 1,
                                      borderLeft: '2px solid #e0e0e0'
                                    }}
                                  >
                                    {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          ))
                        )}
                      </Box>
                    </Paper>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Overall Performance Metrics */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Overall Performance
                  </Typography>
                  {evaluationResults && (
                    <Button
                      startIcon={<DownloadIcon />}
                      onClick={handleExportResults}
                      size="small"
                    >
                      Export Results
                    </Button>
                  )}
                </Box>

                {evaluationResults ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <TrendingUpIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h4" color="primary">
                            {evaluationResults.accuracyScore.toFixed(1)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Overall Accuracy
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <SpeedIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h4" color="secondary">
                            {(evaluationResults.processingTime / 1000).toFixed(1)}s
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Processing Time
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <DataUsageIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h4" color="success">
                            {evaluationResults.sampleSize}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Samples Tested
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <PsychologyIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h4" color="info">
                            {evaluationResults.datasetSource.split(',').length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Dataset Sources
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Alert severity="info">
                    Run an evaluation to see AI performance metrics
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Category Performance */}
          {evaluationResults && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Performance by Category
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress
                          variant="determinate"
                          value={evaluationResults.performanceByCategory.symptomExtraction}
                          size={80}
                          thickness={4}
                          color={getScoreColor(evaluationResults.performanceByCategory.symptomExtraction)}
                        />
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          {evaluationResults.performanceByCategory.symptomExtraction.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Symptom Extraction
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress
                          variant="determinate"
                          value={evaluationResults.performanceByCategory.diagnosisAccuracy}
                          size={80}
                          thickness={4}
                          color={getScoreColor(evaluationResults.performanceByCategory.diagnosisAccuracy)}
                        />
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          {evaluationResults.performanceByCategory.diagnosisAccuracy.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Diagnosis Accuracy
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress
                          variant="determinate"
                          value={evaluationResults.performanceByCategory.treatmentRecommendations}
                          size={80}
                          thickness={4}
                          color={getScoreColor(evaluationResults.performanceByCategory.treatmentRecommendations)}
                        />
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          {evaluationResults.performanceByCategory.treatmentRecommendations.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Treatment Recommendations
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress
                          variant="determinate"
                          value={evaluationResults.performanceByCategory.overallCoherence}
                          size={80}
                          thickness={4}
                          color={getScoreColor(evaluationResults.performanceByCategory.overallCoherence)}
                        />
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          {evaluationResults.performanceByCategory.overallCoherence.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Overall Coherence
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Detailed Results */}
          {evaluationResults && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Detailed Results ({getFilteredAndSortedResults().length} total)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Button
                        variant={showAllResults ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setShowAllResults(!showAllResults)}
                      >
                        {showAllResults ? 'Show Paginated' : 'Show All Results'}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportResults}
                      >
                        Export Results
                      </Button>
                    </Box>
                  </Box>

                  {/* Filters and Controls */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Filter by Category</InputLabel>
                      <Select
                        value={resultsFilter}
                        label="Filter by Category"
                        onChange={(e) => setResultsFilter(e.target.value)}
                      >
                        <MenuItem value="all">All Categories</MenuItem>
                        <MenuItem value="symptom_extraction">Symptom Extraction</MenuItem>
                        <MenuItem value="diagnosis">Diagnosis</MenuItem>
                        <MenuItem value="treatment">Treatment</MenuItem>
                        <MenuItem value="general">General</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Sort by</InputLabel>
                      <Select
                        value={resultsSortBy}
                        label="Sort by"
                        onChange={(e) => setResultsSortBy(e.target.value as 'score' | 'id' | 'category')}
                      >
                        <MenuItem value="score">Score</MenuItem>
                        <MenuItem value="id">ID</MenuItem>
                        <MenuItem value="category">Category</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>Order</InputLabel>
                      <Select
                        value={resultsSortOrder}
                        label="Order"
                        onChange={(e) => setResultsSortOrder(e.target.value as 'asc' | 'desc')}
                      >
                        <MenuItem value="desc">Desc</MenuItem>
                        <MenuItem value="asc">Asc</MenuItem>
                      </Select>
                    </FormControl>

                    {!showAllResults && (
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Results per page</InputLabel>
                        <Select
                          value={resultsPerPage}
                          label="Results per page"
                          onChange={(e) => setResultsPerPage(Number(e.target.value))}
                        >
                          <MenuItem value={10}>10</MenuItem>
                          <MenuItem value={25}>25</MenuItem>
                          <MenuItem value={50}>50</MenuItem>
                          <MenuItem value={100}>100</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  </Box>

                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Question</TableCell>
                          <TableCell>Score</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Symptom Score</TableCell>
                          <TableCell>Diagnosis Score</TableCell>
                          <TableCell>Treatment Score</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getPaginatedResults().map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>{result.id}</TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ maxWidth: 300 }}>
                                {result.originalQuestion.substring(0, 100)}...
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {getScoreIcon(result.comparisonScore)}
                                <Typography sx={{ ml: 1 }}>
                                  {result.comparisonScore.toFixed(1)}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={result.category.replace('_', ' ')}
                                size="small"
                                color="primary"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color={result.detailedScores.symptomExtraction >= 80 ? 'success.main' : result.detailedScores.symptomExtraction >= 60 ? 'warning.main' : 'error.main'}>
                                {result.detailedScores.symptomExtraction.toFixed(1)}%
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color={result.detailedScores.diagnosisAccuracy >= 80 ? 'success.main' : result.detailedScores.diagnosisAccuracy >= 60 ? 'warning.main' : 'error.main'}>
                                {result.detailedScores.diagnosisAccuracy.toFixed(1)}%
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color={result.detailedScores.treatmentRecommendations >= 80 ? 'success.main' : result.detailedScores.treatmentRecommendations >= 60 ? 'warning.main' : 'error.main'}>
                                {result.detailedScores.treatmentRecommendations.toFixed(1)}%
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                onClick={() => handleViewResult(result)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination Controls */}
                  {!showAllResults && getTotalPages() > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
                      <Button
                        disabled={resultsPage === 0}
                        onClick={() => setResultsPage(resultsPage - 1)}
                      >
                        Previous
                      </Button>
                      <Typography>
                        Page {resultsPage + 1} of {getTotalPages()}
                      </Typography>
                      <Button
                        disabled={resultsPage >= getTotalPages() - 1}
                        onClick={() => setResultsPage(resultsPage + 1)}
                      >
                        Next
                      </Button>
                    </Box>
                  )}

                  {/* Results Summary */}
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {showAllResults 
                        ? `Showing all ${getFilteredAndSortedResults().length} results` 
                        : `Showing ${(resultsPage * resultsPerPage) + 1}-${Math.min((resultsPage + 1) * resultsPerPage, getFilteredAndSortedResults().length)} of ${getFilteredAndSortedResults().length} results`
                      }
                    </Typography>
                    {showAllResults && getFilteredAndSortedResults().length > 100 && (
                      <Alert severity="info" sx={{ ml: 2 }}>
                        Large dataset - consider using pagination for better performance
                      </Alert>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Generate Synthetic Patients
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Create realistic patient records from anonymized medical Q&A datasets
                </Typography>
                
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<PsychologyIcon />}
                  onClick={handleGenerateSyntheticPatients}
                  disabled={isGeneratingPatients}
                >
                  {isGeneratingPatients ? 'Generating Patients...' : 'Generate 100 Synthetic Patients'}
                </Button>

                {isGeneratingPatients && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Creating synthetic patient records...
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Synthetic Patient Statistics
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary">
                    {syntheticPatientCount}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Synthetic patients generated
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Dataset Analysis
            </Typography>
            <Alert severity="info">
              Dataset analysis features coming soon. This will include:
              <List>
                <ListItem>
                  <ListItemText primary="Dataset size and composition" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Question type distribution" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Medical specialty coverage" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Answer quality metrics" />
                </ListItem>
              </List>
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Result Detail Dialog */}
      <Dialog
        open={resultDialogOpen}
        onClose={() => setResultDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Evaluation Result Details
        </DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Original Question
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                {selectedResult.originalQuestion}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Expected Answer
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                {selectedResult.expectedAnswer}
              </Typography>

              <Typography variant="h6" gutterBottom>
                AI Analysis
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Symptoms:</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {selectedResult.aiAnalysis.symptoms.map((s: any) => s.name).join(', ') || 'None identified'}
                </Typography>
                
                <Typography variant="subtitle2">Diagnoses:</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {selectedResult.aiAnalysis.diagnoses.map((d: any) => d.condition).join(', ') || 'None provided'}
                </Typography>
                
                <Typography variant="subtitle2">Treatments:</Typography>
                <Typography variant="body2">
                  {selectedResult.aiAnalysis.treatments.map((t: any) => t.recommendation).join(', ') || 'None recommended'}
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>
                Evaluation Score: {selectedResult.comparisonScore.toFixed(1)}%
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="success.main">
                    Strengths:
                  </Typography>
                  <List dense>
                    {selectedResult.strengths.map((strength, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={strength} />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="error.main">
                    Weaknesses:
                  </Typography>
                  <List dense>
                    {selectedResult.weaknesses.map((weakness, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ErrorIcon color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={weakness} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 