import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography, Card, CardContent, CircularProgress, Stack, Button, Chip, Grid, List, ListItem, ListItemText, TextField, Paper } from '@mui/material';
import { 
  Person as PersonIcon, 
  CalendarToday as CalendarIcon, 
  RecordVoiceOver as TranscriptionIcon, 
  Psychology as PsychologyIcon, 
  Description as DescriptionIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { Layout } from '@/components/layout/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Profile } from '@/pages/Profile';
import { Settings } from '@/pages/Settings';
import { PatientManagement } from '@/pages/PatientManagement';
import { VisitManagement } from '@/pages/VisitManagement';
import AIAnalysis from '@/pages/AIAnalysis';
import AIAnalysisEntry from '@/pages/AIAnalysisEntry';
import TranscriptUpload from '@/pages/TranscriptUpload';
import Transcripts from '@/pages/Transcripts';
import Notes from '@/pages/Notes';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/constants';
import { theme } from '@/theme/theme';

// Proper page components with visible content

// Visits component is now replaced by VisitManagement

const VisitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [visitData, setVisitData] = useState<any>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockVisit = {
      id: id,
      patientId: 'P001',
      type: 'consultation',
      status: 'completed',
      scheduledDateTime: new Date('2024-01-15T09:00:00'),
      startTime: new Date('2024-01-15T09:05:00'),
      endTime: new Date('2024-01-15T09:45:00'),
      duration: 40,
      attendingProvider: 'Dr. Smith',
      department: 'Emergency',
      chiefComplaint: 'Chest pain and shortness of breath',
      visitSummary: 'Patient presented with chest pain. ECG normal. Diagnosed with anxiety.',
      hasTranscript: true,
      hasAiAnalysis: true,
      hasVisitNotes: true,
      createdAt: new Date('2024-01-15T08:30:00'),
      updatedAt: new Date('2024-01-15T10:00:00'),
    };

    const mockPatient = {
      id: 'P001',
      demographics: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1979-05-15'),
        gender: 'male',
        phone: '+1-555-0123',
        preferredLanguage: 'English',
      },
      basicHistory: {
        knownAllergies: ['Penicillin'],
        currentMedications: ['Aspirin 81mg daily', 'Lisinopril 10mg daily'],
        knownConditions: ['Hypertension', 'Gastroesophageal reflux'],
      },
    };

    setVisitData(mockVisit);
    setPatientData(mockPatient);
    setLoading(false);
  }, [id]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'scheduled': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'primary';
      case 'follow_up': return 'secondary';
      case 'urgent_care': return 'warning';
      case 'telemedicine': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
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
        <Typography variant="h4" component="h1">
          Visit Details
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<TranscriptionIcon />}
            onClick={() => navigate(`${ROUTES.TRANSCRIPT_UPLOAD.replace(':id', id!)}`)}
          >
            View Transcript
          </Button>
          <Button
            variant="outlined"
            startIcon={<PsychologyIcon />}
            onClick={() => navigate(`${ROUTES.AI_ANALYSIS.replace(':id', id!)}`)}
          >
            AI Analysis
          </Button>
          <Button
            variant="outlined"
            startIcon={<DescriptionIcon />}
            onClick={() => navigate(`${ROUTES.VISIT_NOTES.replace(':id', id!)}`)}
          >
            Visit Notes
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Visit Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Visit Information</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Visit ID</Typography>
                  <Typography variant="body1">{visitData.id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Chip
                    label={visitData.type}
                    color={getTypeColor(visitData.type) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    label={visitData.status}
                    color={getStatusColor(visitData.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Department</Typography>
                  <Typography variant="body1">{visitData.department}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Provider</Typography>
                  <Typography variant="body1">{visitData.attendingProvider}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="body1">{formatDuration(visitData.duration)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Chief Complaint</Typography>
                  <Typography variant="body1">{visitData.chiefComplaint}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Visit Summary</Typography>
                  <Typography variant="body1">{visitData.visitSummary}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Patient Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Patient Summary</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">
                  {patientData.demographics.firstName} {patientData.demographics.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {patientData.demographics.gender} • {new Date().getFullYear() - patientData.demographics.dateOfBirth.getFullYear()} years old
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Known Allergies</Typography>
                <Typography variant="body1">{patientData.basicHistory.knownAllergies.join(', ')}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Current Medications</Typography>
                <Typography variant="body1">{patientData.basicHistory.currentMedications.join(', ')}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Known Conditions</Typography>
                <Typography variant="body1">{patientData.basicHistory.knownConditions.join(', ')}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <TranscriptionIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Transcript
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {visitData.hasTranscript ? 'Available' : 'Not Available'}
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`${ROUTES.TRANSCRIPT_UPLOAD.replace(':id', id!)}`)}
                      >
                        {visitData.hasTranscript ? 'View' : 'Upload'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <PsychologyIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        AI Analysis
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {visitData.hasAiAnalysis ? 'Available' : 'Not Available'}
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`${ROUTES.AI_ANALYSIS.replace(':id', id!)}`)}
                      >
                        {visitData.hasAiAnalysis ? 'View' : 'Generate'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <DescriptionIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Visit Notes
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {visitData.hasVisitNotes ? 'Available' : 'Not Available'}
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`${ROUTES.VISIT_NOTES.replace(':id', id!)}`)}
                      >
                        {visitData.hasVisitNotes ? 'View' : 'Create'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};



// AIAnalysis component is now imported from @/pages/AIAnalysis

const VisitNotes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<any[]>([]);
  const [currentNote, setCurrentNote] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [noteType] = useState('soap');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    const mockNotes = [
      {
        id: 'note-1',
        visitId: id,
        patientId: 'P001',
        type: 'soap',
        status: 'signed',
        content: `SUBJECTIVE:\nPatient is a 45-year-old male presenting with chest pain and shortness of breath that started 2 hours ago during physical activity.\n\nOBJECTIVE:\nVital signs: BP 140/90, HR 95, RR 20, O2 sat 98% on RA\nPhysical exam: Alert and oriented, mild distress, chest clear to auscultation\n\nASSESSMENT:\nChest pain, likely anxiety-related given normal ECG and vital signs\n\nPLAN:\n- Reassurance and education\n- Follow-up if symptoms worsen\n- Consider anxiety management techniques`,
        author: 'Dr. Smith',
        aiGenerated: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        signedAt: new Date(),
        version: 1,
        tags: ['chest pain', 'anxiety'],
      },
      {
        id: 'note-2',
        visitId: id,
        patientId: 'P001',
        type: 'progress',
        status: 'draft',
        content: `Patient continues to have mild chest discomfort but reports feeling better after reassurance. Vital signs remain stable.`,
        author: 'Dr. Smith',
        aiGenerated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        tags: ['progress', 'follow-up'],
      },
    ];
    setNotes(mockNotes);
    setCurrentNote(mockNotes[0]);
    setLoading(false);
  }, [id]);

  const handleGenerateNote = async () => {
    setGenerating(true);
    try {
      // Mock AI generation
      setTimeout(() => {
        const newNote = {
          id: `note-${Date.now()}`,
          visitId: id,
          patientId: 'P001',
          type: noteType,
          status: 'draft',
          content: `Generated ${noteType.toUpperCase()} note based on visit transcript and analysis...`,
          author: 'System (AI)',
          aiGenerated: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
          tags: ['ai-generated'],
        };
        setNotes(prev => [newNote, ...prev]);
        setCurrentNote(newNote);
        setIsEditing(true);
        setGenerating(false);
      }, 2000);
    } catch (error) {
      setGenerating(false);
    }
  };

  const handleSaveNote = () => {
    if (currentNote) {
      const updatedNote = {
        ...currentNote,
        updatedAt: new Date(),
        version: currentNote.version + 1,
      };
      setNotes(prev => prev.map(note => note.id === currentNote.id ? updatedNote : note));
      setCurrentNote(updatedNote);
      setIsEditing(false);
    }
  };

  const handleSignNote = () => {
    if (currentNote) {
      const signedNote = {
        ...currentNote,
        status: 'signed',
        signedAt: new Date(),
      };
      setNotes(prev => prev.map(note => note.id === currentNote.id ? signedNote : note));
      setCurrentNote(signedNote);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'success';
      case 'pending_review': return 'warning';
      case 'draft': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
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
        <Typography variant="h4" component="h1">
          Visit Notes
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<TranscriptionIcon />}
            onClick={() => navigate(`${ROUTES.TRANSCRIPT_UPLOAD.replace(':id', id!)}`)}
          >
            View Transcript
          </Button>
          <Button
            variant="outlined"
            startIcon={<PsychologyIcon />}
            onClick={() => navigate(`${ROUTES.AI_ANALYSIS.replace(':id', id!)}`)}
          >
            AI Analysis
          </Button>
          <Button
            variant="contained"
            startIcon={generating ? <CircularProgress size={20} /> : <DescriptionIcon />}
            onClick={handleGenerateNote}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate Note'}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Notes List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notes History
              </Typography>
              <List>
                {notes.map((note) => (
                  <ListItem
                    key={note.id}
                    button
                    onClick={() => setCurrentNote(note)}
                    selected={currentNote?.id === note.id}
                    sx={{ mb: 1, borderRadius: 1 }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">
                            {note.type.toUpperCase()}
                          </Typography>
                          <Chip
                            label={note.status}
                            size="small"
                            color={getStatusColor(note.status) as any}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {note.author} • Version {note.version}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {note.createdAt.toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Note Editor */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {currentNote ? `${currentNote.type.toUpperCase()} Note` : 'No Note Selected'}
                </Typography>
                {currentNote && (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                    {isEditing && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveNote}
                      >
                        Save
                      </Button>
                    )}
                    {currentNote.status !== 'signed' && (
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={handleSignNote}
                      >
                        Sign
                      </Button>
                    )}
                  </Stack>
                )}
              </Box>

              {currentNote ? (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Author: {currentNote.author} • Status: {currentNote.status} • Version: {currentNote.version}
                    </Typography>
                    {currentNote.aiGenerated && (
                      <Chip label="AI Generated" size="small" color="info" sx={{ mt: 1 }} />
                    )}
                  </Box>

                  {isEditing ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={20}
                      value={currentNote.content}
                      onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                      variant="outlined"
                      sx={{ fontFamily: 'monospace' }}
                    />
                  ) : (
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography
                        variant="body2"
                        component="pre"
                        style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
                      >
                        {currentNote.content}
                      </Typography>
                    </Paper>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Created: {currentNote.createdAt.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Updated: {currentNote.updatedAt.toLocaleString()}
                    </Typography>
                    {currentNote.signedAt && (
                      <Typography variant="body2" color="text.secondary">
                        Signed: {currentNote.signedAt.toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Select a note from the list to view or edit it.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};



interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.LOGIN} />;
};

function App() {
  const { initialize, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading state while initializing
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
          }}
        >
          <Typography variant="h6">Loading...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route
            path={ROUTES.HOME}
            element={
              isAuthenticated ? (
                <Navigate to={ROUTES.DASHBOARD} />
              ) : (
                <Navigate to={ROUTES.LOGIN} />
              )
            }
          />
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PATIENTS}
            element={
              <ProtectedRoute>
                <Layout>
                  <PatientManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.VISITS}
            element={
              <ProtectedRoute>
                <Layout>
                  <VisitManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.VISIT_DETAIL}
            element={
              <ProtectedRoute>
                <Layout>
                  <VisitDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.TRANSCRIPT_UPLOAD}
            element={
              <ProtectedRoute>
                <Layout>
                  <TranscriptUpload />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.AI_ANALYSIS}
            element={
              <ProtectedRoute>
                <Layout>
                  <AIAnalysisEntry />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.AI_ANALYSIS_DETAIL}
            element={
              <ProtectedRoute>
                <Layout>
                  <AIAnalysis />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.VISIT_NOTES}
            element={
              <ProtectedRoute>
                <Layout>
                  <VisitNotes />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.TRANSCRIPTS}
            element={
              <ProtectedRoute>
                <Layout>
                  <Transcripts />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.NOTES}
            element={
              <ProtectedRoute>
                <Layout>
                  <Notes />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.SETTINGS}
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 