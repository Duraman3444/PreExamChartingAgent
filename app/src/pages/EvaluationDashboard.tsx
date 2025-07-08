import React, { useState, useEffect } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  PlayArrow as RunIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Psychology as PsychologyIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  DataUsage as DataUsageIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { aiEvaluationService, EvaluationMetrics, EvaluationResult } from '../services/aiEvaluation';
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

  const handleRunEvaluation = async () => {
    setIsRunningEvaluation(true);
    setEvaluationProgress(0);

    const progressInterval = setInterval(() => {
      setEvaluationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 2000);

    try {
      let results: EvaluationMetrics;
      
      if (evaluationConfig.evaluationType === 'quick') {
        results = await aiEvaluationService.quickEvaluation(evaluationConfig.sampleSize);
      } else {
        results = await aiEvaluationService.comprehensiveEvaluation(evaluationConfig.sampleSize);
      }

      clearInterval(progressInterval);
      setEvaluationProgress(100);
      setEvaluationResults(results);
      
      // Save results to localStorage
      localStorage.setItem('evaluationResults', JSON.stringify(results));

    } catch (error) {
      console.error('Evaluation failed:', error);
      clearInterval(progressInterval);
      setEvaluationProgress(0);
    } finally {
      setIsRunningEvaluation(false);
      setTimeout(() => setEvaluationProgress(0), 2000);
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

    const csvData = evaluationResults.detailedResults.map(result => ({
      id: result.id,
      question: result.originalQuestion.substring(0, 100),
      score: result.comparisonScore,
      category: result.category,
      strengths: result.strengths.join('; '),
      weaknesses: result.weaknesses.join('; ')
    }));

    const csvContent = [
      ['ID', 'Question', 'Score', 'Category', 'Strengths', 'Weaknesses'],
      ...csvData.map(row => [row.id, row.question, row.score.toString(), row.category, row.strengths, row.weaknesses])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evaluation_results_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
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

          {/* Overall Performance Metrics */}
          <Grid item xs={12} md={8}>
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
                  <Typography variant="h6" gutterBottom>
                    Detailed Results
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Question</TableCell>
                          <TableCell>Score</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {evaluationResults.detailedResults.slice(0, 10).map((result) => (
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
                  {evaluationResults.detailedResults.length > 10 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Showing first 10 of {evaluationResults.detailedResults.length} results
                    </Typography>
                  )}
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