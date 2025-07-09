import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  ExpandMore,
  BugReport,
  PlayArrow,
  Speed,
  Psychology,
} from '@mui/icons-material';
import { openAIService } from '../../services/openai';

interface DiagnosticResult {
  status: 'success' | 'warning' | 'error';
  issues: string[];
  recommendations: string[];
  testResults: {
    firebaseConfig: boolean;
    firebaseAuth: boolean;
    firebaseFunctions: boolean;
    openaiConfig: boolean;
    o1ModelAccess: boolean;
    quickAnalysis: boolean;
    o1Analysis: boolean;
  };
}

const O1DiagnosticTool: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [isTestingAnalysis, setIsTestingAnalysis] = useState(false);
  const [analysisTestResults, setAnalysisTestResults] = useState<{
    quickAnalysis: { status: boolean; result?: any; error?: string };
    o1Analysis: { status: boolean; result?: any; error?: string };
  } | null>(null);

  const runDiagnostic = async () => {
    setIsRunning(true);
    setDiagnosticResult(null);
    
    try {
      const result = await openAIService.diagnoseO1Issues();
      setDiagnosticResult(result);
    } catch (error) {
      setDiagnosticResult({
        status: 'error',
        issues: [`Diagnostic failed: ${(error as Error).message}`],
        recommendations: ['Check browser console for detailed error information'],
        testResults: {
          firebaseConfig: false,
          firebaseAuth: false,
          firebaseFunctions: false,
          openaiConfig: false,
          o1ModelAccess: false,
          quickAnalysis: false,
          o1Analysis: false
        }
      });
    } finally {
      setIsRunning(false);
    }
  };

  const testAnalysisModes = async () => {
    setIsTestingAnalysis(true);
    setAnalysisTestResults(null);
    
    // More comprehensive test transcript for better evaluation
    const testTranscript = "Patient presents with severe chest pain radiating to left arm, onset 2 hours ago. Associated with shortness of breath, diaphoresis, and nausea. Patient describes pain as crushing, 8/10 severity. No previous cardiac history. Vital signs: BP 150/90, HR 110, RR 22, O2 sat 94% on room air. Patient appears anxious and diaphoretic.";
    
    const results = {
      quickAnalysis: { status: false, result: undefined as any, error: undefined as string | undefined },
      o1Analysis: { status: false, result: undefined as any, error: undefined as string | undefined }
    };
    
    try {
      // Test Quick Analysis
      console.log('🔍 Testing Quick Analysis mode...');
      try {
        const quickResult = await openAIService.quickAnalyzeTranscript(testTranscript);
        results.quickAnalysis = {
          status: true,
          result: {
            symptoms: quickResult.symptoms.length,
            diagnoses: quickResult.diagnoses.length,
            treatments: quickResult.treatments.length,
            concerns: quickResult.concerns.length,
            confidenceScore: quickResult.confidenceScore,
            reasoning: quickResult.reasoning?.substring(0, 200) + '...',
            hasDetailedContent: quickResult.diagnoses.some(d => d.reasoning && d.reasoning.length > 50)
          },
          error: undefined
        };
        console.log('✅ Quick Analysis test passed');
      } catch (quickError) {
        results.quickAnalysis = {
          status: false,
          result: undefined,
          error: (quickError as Error).message
        };
        console.error('❌ Quick Analysis test failed:', quickError);
      }
      
      // Test O1 Analysis
      console.log('🔍 Testing O1 Analysis mode...');
      try {
        const o1Result = await openAIService.analyzeTranscriptWithReasoning(testTranscript, undefined, 'o1-mini');
        results.o1Analysis = {
          status: true,
          result: {
            symptoms: o1Result.symptoms.length,
            diagnoses: o1Result.diagnoses.length,
            treatments: o1Result.treatments.length,
            concerns: o1Result.concerns.length,
            confidenceScore: o1Result.confidenceScore,
            reasoning: o1Result.reasoning?.substring(0, 200) + '...',
            modelUsed: o1Result.modelUsed,
            thinkingTime: o1Result.thinkingTime,
            reasoningSteps: o1Result.reasoningTrace?.totalSteps || 0,
            hasDetailedContent: o1Result.diagnoses.some(d => d.reasoning && d.reasoning.length > 50),
            hasReasoningTrace: !!o1Result.reasoningTrace,
            reasoningLength: o1Result.reasoning?.length || 0
          },
          error: undefined
        };
        console.log('✅ O1 Analysis test passed');
      } catch (o1Error) {
        results.o1Analysis = {
          status: false,
          result: undefined,
          error: (o1Error as Error).message
        };
        console.error('❌ O1 Analysis test failed:', o1Error);
      }
      
    } finally {
      setAnalysisTestResults(results);
      setIsTestingAnalysis(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle color="success" />
    ) : (
      <Error color="error" />
    );
  };

  const getStatusColor = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <BugReport color="primary" />
            <Typography variant="h5">O1 Analysis Diagnostic Tool</Typography>
          </Box>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            This tool helps identify issues with the O1 analysis feature. Click "Run Diagnostic" to check all components.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                startIcon={isRunning ? <CircularProgress size={20} /> : <PlayArrow />}
                onClick={runDiagnostic}
                disabled={isRunning}
              >
                {isRunning ? 'Running Diagnostic...' : 'Run System Diagnostic'}
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={isTestingAnalysis ? <CircularProgress size={20} /> : <Psychology />}
                onClick={testAnalysisModes}
                disabled={isTestingAnalysis}
              >
                {isTestingAnalysis ? 'Testing Analysis...' : 'Test Analysis Modes'}
              </Button>
            </Grid>
          </Grid>

          {/* Analysis Mode Test Results */}
          {analysisTestResults && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Analysis Mode Test Results
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Speed color="primary" />
                        <Typography variant="h6">Quick Analysis</Typography>
                        <Chip 
                          label={analysisTestResults.quickAnalysis.status ? 'PASS' : 'FAIL'} 
                          color={analysisTestResults.quickAnalysis.status ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                      
                      {analysisTestResults.quickAnalysis.status ? (
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            ✅ Quick analysis working properly
                          </Typography>
                          {analysisTestResults.quickAnalysis.result && (
                            <List dense>
                              <ListItem>
                                <ListItemText 
                                  primary={`Symptoms: ${analysisTestResults.quickAnalysis.result.symptoms}`}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary={`Diagnoses: ${analysisTestResults.quickAnalysis.result.diagnoses}`}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary={`Treatments: ${analysisTestResults.quickAnalysis.result.treatments}`}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary={`Concerns: ${analysisTestResults.quickAnalysis.result.concerns}`}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary={`Confidence: ${Math.round(analysisTestResults.quickAnalysis.result.confidenceScore * 100)}%`}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary={`Detailed Content: ${analysisTestResults.quickAnalysis.result.hasDetailedContent ? 'Yes' : 'No'}`}
                                  secondary={analysisTestResults.quickAnalysis.result.hasDetailedContent ? 'Analysis includes detailed reasoning' : 'Analysis may be minimal or generic'}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary="Sample Reasoning"
                                  secondary={analysisTestResults.quickAnalysis.result.reasoning}
                                />
                              </ListItem>
                            </List>
                          )}
                        </Box>
                      ) : (
                        <Alert severity="error">
                          <Typography variant="body2">
                            ❌ Quick analysis failed: {analysisTestResults.quickAnalysis.error}
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Psychology color="secondary" />
                        <Typography variant="h6">O1 Analysis</Typography>
                        <Chip 
                          label={analysisTestResults.o1Analysis.status ? 'PASS' : 'FAIL'} 
                          color={analysisTestResults.o1Analysis.status ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                      
                      {analysisTestResults.o1Analysis.status ? (
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            ✅ O1 analysis with reasoning working properly
                          </Typography>
                          {analysisTestResults.o1Analysis.result && (
                            <Box>
                              {/* Quality Assessment */}
                              <Alert 
                                severity={
                                  analysisTestResults.o1Analysis.result.hasDetailedContent && 
                                  analysisTestResults.o1Analysis.result.symptoms > 0 && 
                                  analysisTestResults.o1Analysis.result.diagnoses > 0 
                                    ? 'success' : 'warning'
                                }
                                sx={{ mb: 2 }}
                              >
                                <Typography variant="body2">
                                  <strong>Analysis Quality:</strong> {
                                    analysisTestResults.o1Analysis.result.hasDetailedContent && 
                                    analysisTestResults.o1Analysis.result.symptoms > 0 && 
                                    analysisTestResults.o1Analysis.result.diagnoses > 0 
                                      ? 'Excellent - Comprehensive analysis with detailed content'
                                      : 'Needs Improvement - Some areas may be generic or incomplete'
                                  }
                                </Typography>
                                {analysisTestResults.o1Analysis.result.symptoms === 0 && (
                                  <Typography variant="body2" color="error">
                                    ⚠️ No symptoms extracted - this indicates a processing issue
                                  </Typography>
                                )}
                                {analysisTestResults.o1Analysis.result.diagnoses === 0 && (
                                  <Typography variant="body2" color="error">
                                    ⚠️ No diagnoses generated - this indicates a processing issue
                                  </Typography>
                                )}
                              </Alert>
                              
                              <List dense>
                                <ListItem>
                                  <ListItemText 
                                    primary={`Model: ${analysisTestResults.o1Analysis.result.modelUsed}`}
                                  />
                                </ListItem>
                                <ListItem>
                                  <ListItemText 
                                    primary={`Symptoms: ${analysisTestResults.o1Analysis.result.symptoms}`}
                                    secondary={analysisTestResults.o1Analysis.result.symptoms > 0 ? 'Good - Symptoms detected' : 'Issue - No symptoms found'}
                                  />
                                </ListItem>
                                <ListItem>
                                  <ListItemText 
                                    primary={`Diagnoses: ${analysisTestResults.o1Analysis.result.diagnoses}`}
                                    secondary={analysisTestResults.o1Analysis.result.diagnoses > 2 ? 'Excellent - Multiple differential diagnoses' : 
                                              analysisTestResults.o1Analysis.result.diagnoses > 0 ? 'Good - Some diagnoses present' : 'Issue - No diagnoses found'}
                                  />
                                </ListItem>
                                <ListItem>
                                  <ListItemText 
                                    primary={`Treatments: ${analysisTestResults.o1Analysis.result.treatments}`}
                                    secondary={analysisTestResults.o1Analysis.result.treatments > 2 ? 'Excellent - Multiple treatment recommendations' : 
                                              analysisTestResults.o1Analysis.result.treatments > 0 ? 'Good - Some treatments present' : 'Issue - No treatments found'}
                                  />
                                </ListItem>
                                <ListItem>
                                  <ListItemText 
                                    primary={`Concerns: ${analysisTestResults.o1Analysis.result.concerns}`}
                                    secondary={analysisTestResults.o1Analysis.result.concerns > 0 ? 'Good - Clinical concerns identified' : 'May be okay - No urgent concerns'}
                                  />
                                </ListItem>
                                <ListItem>
                                  <ListItemText 
                                    primary={`Confidence: ${Math.round(analysisTestResults.o1Analysis.result.confidenceScore * 100)}%`}
                                  />
                                </ListItem>
                                <ListItem>
                                  <ListItemText 
                                    primary={`Reasoning Steps: ${analysisTestResults.o1Analysis.result.reasoningSteps}`}
                                  />
                                </ListItem>
                                <ListItem>
                                  <ListItemText 
                                    primary={`Reasoning Trace: ${analysisTestResults.o1Analysis.result.hasReasoningTrace ? 'Present' : 'Missing'}`}
                                    secondary={analysisTestResults.o1Analysis.result.hasReasoningTrace ? 'O1 reasoning trace available' : 'No reasoning trace found'}
                                  />
                                </ListItem>
                                <ListItem>
                                  <ListItemText 
                                    primary={`Detailed Content: ${analysisTestResults.o1Analysis.result.hasDetailedContent ? 'Yes' : 'No'}`}
                                    secondary={analysisTestResults.o1Analysis.result.hasDetailedContent ? 'Analysis includes detailed reasoning' : 'Analysis may be minimal or generic'}
                                  />
                                </ListItem>
                                <ListItem>
                                  <ListItemText 
                                    primary={`Reasoning Length: ${analysisTestResults.o1Analysis.result.reasoningLength} characters`}
                                    secondary={analysisTestResults.o1Analysis.result.reasoningLength > 1000 ? 'Comprehensive reasoning' : 
                                              analysisTestResults.o1Analysis.result.reasoningLength > 500 ? 'Good reasoning' : 'Basic reasoning'}
                                  />
                                </ListItem>
                                <ListItem>
                                  <ListItemText 
                                    primary="Sample Reasoning"
                                    secondary={analysisTestResults.o1Analysis.result.reasoning}
                                  />
                                </ListItem>
                              </List>
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Alert severity="error">
                          <Typography variant="body2">
                            ❌ O1 analysis failed: {analysisTestResults.o1Analysis.error}
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
            </Box>
          )}

          {diagnosticResult && (
            <Box>
              <Alert 
                severity={getStatusColor(diagnosticResult.status)} 
                sx={{ mb: 3 }}
              >
                <Typography variant="h6">
                  Diagnostic Status: {diagnosticResult.status.toUpperCase()}
                </Typography>
                {diagnosticResult.status === 'success' && (
                  <Typography>All systems are functioning correctly!</Typography>
                )}
                {diagnosticResult.status === 'warning' && (
                  <Typography>Some issues detected but O1 analysis may still work</Typography>
                )}
                {diagnosticResult.status === 'error' && (
                  <Typography>Critical issues detected - O1 analysis will not work</Typography>
                )}
              </Alert>

              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">Test Results</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(diagnosticResult.testResults.firebaseConfig)}
                      </ListItemIcon>
                      <ListItemText 
                        primary="Firebase Configuration"
                        secondary="Firebase is properly configured and initialized"
                      />
                      <Chip 
                        label={diagnosticResult.testResults.firebaseConfig ? 'PASS' : 'FAIL'} 
                        color={diagnosticResult.testResults.firebaseConfig ? 'success' : 'error'}
                        size="small"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(diagnosticResult.testResults.firebaseAuth)}
                      </ListItemIcon>
                      <ListItemText 
                        primary="Firebase Authentication"
                        secondary="User is authenticated and can access Firebase Functions"
                      />
                      <Chip 
                        label={diagnosticResult.testResults.firebaseAuth ? 'PASS' : 'FAIL'} 
                        color={diagnosticResult.testResults.firebaseAuth ? 'success' : 'error'}
                        size="small"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(diagnosticResult.testResults.firebaseFunctions)}
                      </ListItemIcon>
                      <ListItemText 
                        primary="Firebase Functions Connectivity"
                        secondary="Can connect to Firebase Functions endpoint"
                      />
                      <Chip 
                        label={diagnosticResult.testResults.firebaseFunctions ? 'PASS' : 'FAIL'} 
                        color={diagnosticResult.testResults.firebaseFunctions ? 'success' : 'error'}
                        size="small"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(diagnosticResult.testResults.openaiConfig)}
                      </ListItemIcon>
                      <ListItemText 
                        primary="OpenAI Configuration"
                        secondary="OpenAI API is configured and accessible in Firebase Functions"
                      />
                      <Chip 
                        label={diagnosticResult.testResults.openaiConfig ? 'PASS' : 'FAIL'} 
                        color={diagnosticResult.testResults.openaiConfig ? 'success' : 'error'}
                        size="small"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(diagnosticResult.testResults.quickAnalysis)}
                      </ListItemIcon>
                      <ListItemText 
                        primary="Quick Analysis"
                        secondary="Standard GPT-4o analysis is working"
                      />
                      <Chip 
                        label={diagnosticResult.testResults.quickAnalysis ? 'PASS' : 'FAIL'} 
                        color={diagnosticResult.testResults.quickAnalysis ? 'success' : 'error'}
                        size="small"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(diagnosticResult.testResults.o1ModelAccess)}
                      </ListItemIcon>
                      <ListItemText 
                        primary="O1 Model Access"
                        secondary="O1 models are accessible via OpenAI API"
                      />
                      <Chip 
                        label={diagnosticResult.testResults.o1ModelAccess ? 'PASS' : 'FAIL'} 
                        color={diagnosticResult.testResults.o1ModelAccess ? 'success' : 'error'}
                        size="small"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(diagnosticResult.testResults.o1Analysis)}
                      </ListItemIcon>
                      <ListItemText 
                        primary="O1 Analysis"
                        secondary="Complete O1 analysis with reasoning trace is working"
                      />
                      <Chip 
                        label={diagnosticResult.testResults.o1Analysis ? 'PASS' : 'FAIL'} 
                        color={diagnosticResult.testResults.o1Analysis ? 'success' : 'error'}
                        size="small"
                      />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>

              {diagnosticResult.issues.length > 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">
                      Issues Found ({diagnosticResult.issues.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {diagnosticResult.issues.map((issue, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Warning color="warning" />
                          </ListItemIcon>
                          <ListItemText primary={issue} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}

              {diagnosticResult.recommendations.length > 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">
                      Recommendations ({diagnosticResult.recommendations.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {diagnosticResult.recommendations.map((recommendation, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckCircle color="info" />
                          </ListItemIcon>
                          <ListItemText primary={recommendation} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default O1DiagnosticTool; 