import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  Paper,
  Stack,
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
  Link,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
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
  Science as ScienceIcon,
  Article as ArticleIcon,
  Verified as VerifiedIcon,
  TrendingUp as TrendingUpIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { openAIService, DeepAnalysisResult } from '@/services/openai';

interface ResearchSession {
  id: string;
  query: string;
  timestamp: Date;
  results: DeepAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}

const DeepResearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [currentSession, setCurrentSession] = useState<ResearchSession | null>(null);
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  // const [selectedTab, setSelectedTab] = useState(0);

  const handleStartResearch = async () => {
    if (!query.trim()) return;

    const newSession: ResearchSession = {
      id: `session-${Date.now()}`,
      query: query.trim(),
      timestamp: new Date(),
      results: null,
      isLoading: true,
      error: null
    };

    setCurrentSession(newSession);
    setSessions(prev => [newSession, ...prev]);
    setQuery('');

    try {
      // Perform deep analysis with research integration
      const analysisResult = await openAIService.deepMedicalAnalysis(query, {
        age: undefined,
        gender: undefined,
        medicalHistory: undefined,
        medications: undefined,
        allergies: undefined,
        familyHistory: undefined,
        socialHistory: undefined
      });

      const updatedSession = {
        ...newSession,
        results: analysisResult,
        isLoading: false
      };

      setCurrentSession(updatedSession);
      setSessions(prev => prev.map(s => s.id === newSession.id ? updatedSession : s));
    } catch (error) {
      const errorSession = {
        ...newSession,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      };

      setCurrentSession(errorSession);
      setSessions(prev => prev.map(s => s.id === newSession.id ? errorSession : s));
    }
  };

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'error';
      default: return 'default';
    }
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'systematic_review': return <ScienceIcon />;
      case 'clinical_study': return <AssessmentIcon />;
      case 'guideline': return <VerifiedIcon />;
      case 'case_study': return <ArticleIcon />;
      case 'meta_analysis': return <TrendingUpIcon />;
      default: return <ArticleIcon />;
    }
  };

  const formatEvidenceType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <ScienceIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Deep Medical Research
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Advanced AI-powered medical analysis with real-time research integration, evidence-based recommendations, and comprehensive diagnostic support.
      </Typography>

      {/* Research Input */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Research Query
          </Typography>
          
          <Stack spacing={2}>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              label="Enter medical case, symptoms, or research question"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={currentSession?.isLoading}
              placeholder="Example: 35-year-old male with chest pain, shortness of breath, and family history of cardiac disease..."
            />
            
            <Button
              variant="contained"
              size="large"
              startIcon={<PsychologyIcon />}
              onClick={handleStartResearch}
              disabled={!query.trim() || currentSession?.isLoading}
              sx={{ alignSelf: 'flex-start' }}
            >
              {currentSession?.isLoading ? 'Analyzing...' : 'Start Deep Research'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Current Analysis */}
      {currentSession && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <AutoAwesomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Analysis Results
            </Typography>
            
            {currentSession.isLoading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                  Performing deep analysis and research integration...
                </Typography>
              </Box>
            )}

            {currentSession.error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {currentSession.error}
              </Alert>
            )}

            {currentSession.results && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                {/* Primary Diagnosis */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    <HospitalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Primary Diagnosis
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {currentSession.results.primaryDiagnosis.condition}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip
                          label={`${Math.round(currentSession.results.primaryDiagnosis.probability * 100)}% confidence`}
                          color="primary"
                          size="small"
                        />
                        <Chip
                          label={currentSession.results.primaryDiagnosis.severity}
                          color={currentSession.results.primaryDiagnosis.severity === 'critical' ? 'error' : 'warning'}
                          size="small"
                        />
                        <Chip
                          label={currentSession.results.primaryDiagnosis.icd10Code}
                          variant="outlined"
                          size="small"
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {currentSession.results.primaryDiagnosis.reasoning}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                {/* Research Evidence */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    <ScienceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Research Evidence
                    <Badge 
                      badgeContent={currentSession.results.researchEvidence.length} 
                      color="primary" 
                      sx={{ ml: 1 }}
                    >
                      <span />
                    </Badge>
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {currentSession.results.researchEvidence.map((evidence, _index) => (
                      <Grid item xs={12} md={6} key={evidence.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                              {getEvidenceIcon(evidence.type)}
                              <Typography variant="subtitle2">
                                {formatEvidenceType(evidence.type)}
                              </Typography>
                              <Chip
                                label={evidence.reliability}
                                color={getReliabilityColor(evidence.reliability) as any}
                                size="small"
                              />
                            </Stack>
                            
                            <Typography variant="body2" fontWeight="bold" gutterBottom>
                              {evidence.source}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {evidence.summary}
                            </Typography>
                            
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="caption" color="text.secondary">
                                {evidence.yearPublished} • Relevance: {Math.round(evidence.relevanceScore * 100)}%
                              </Typography>
                              
                              {evidence.url && (
                                <IconButton
                                  size="small"
                                  component={Link}
                                  href={evidence.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <OpenInNewIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Confidence Assessment */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Confidence Assessment
                  </Typography>
                  
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="text.secondary">
                            Evidence Quality
                          </Typography>
                          <Typography variant="h6">
                            {currentSession.results.confidenceAssessment.evidenceQuality.toUpperCase()}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="text.secondary">
                            Consistency Score
                          </Typography>
                          <Typography variant="h6">
                            {Math.round(currentSession.results.confidenceAssessment.consistencyScore * 100)}%
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="text.secondary">
                            Evidence Items
                          </Typography>
                          <Typography variant="h6">
                            {currentSession.results.researchEvidence.length}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      {currentSession.results.confidenceAssessment.gaps.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Evidence Gaps:
                          </Typography>
                          <List dense>
                            {currentSession.results.confidenceAssessment.gaps.map((gap, index) => (
                              <ListItem key={index} sx={{ py: 0 }}>
                                <ListItemIcon>
                                  <WarningIcon color="warning" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={gap} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Box>

                {/* Clinical Recommendations */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Clinical Recommendations
                  </Typography>
                  
                  <Stack spacing={2}>
                    {currentSession.results.clinicalRecommendations.map((rec, _index) => (
                      <Accordion key={rec.id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                              {rec.recommendation}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              <Chip
                                label={rec.priority}
                                color={rec.priority === 'urgent' ? 'error' : rec.priority === 'high' ? 'warning' : 'default'}
                                size="small"
                              />
                              <Chip
                                label={`Evidence: ${rec.evidenceLevel}`}
                                variant="outlined"
                                size="small"
                              />
                            </Stack>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Expected Outcome:
                              </Typography>
                              <Typography variant="body2">
                                {rec.expectedOutcome}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Timeframe:
                              </Typography>
                              <Typography variant="body2">
                                {rec.timeframe}
                              </Typography>
                            </Grid>
                            
                            {rec.contraindications.length > 0 && (
                              <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Contraindications:
                                </Typography>
                                <Typography variant="body2">
                                  {rec.contraindications.join(', ')}
                                </Typography>
                              </Grid>
                            )}
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>
      )}

      {/* Session History */}
      {sessions.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Research History
            </Typography>
            
            <Stack spacing={2}>
              {sessions.map((session) => (
                <Paper key={session.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {session.query.substring(0, 100)}...
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {session.timestamp.toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box>
                      {session.isLoading && <LinearProgress sx={{ width: 100 }} />}
                      {session.error && <ErrorIcon color="error" />}
                      {session.results && <CheckCircleIcon color="success" />}
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DeepResearch; 