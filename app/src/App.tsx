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
import AIAgent from '@/pages/AIAgent';
import TranscriptUpload from '@/pages/TranscriptUpload';
import TranscriptEditor from '@/pages/TranscriptEditor';
import Transcripts from '@/pages/Transcripts';
import Notes from '@/pages/Notes';
import { EvaluationDashboard } from '@/pages/EvaluationDashboard';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { ROUTES } from '@/constants';
import { createAppTheme } from '@/theme/theme';
import { mockVisits } from '@/data/mockData';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal } from '@/components/common/KeyboardShortcutsModal';
import { GlobalSearchModal } from '@/components/common/GlobalSearchModal';

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
  const [visitData, setVisitData] = useState<any>(null);

  // Function to generate patient-specific notes
  const generatePatientSpecificNotes = (visit: any) => {
    const noteTemplates = {
      'V001': { // John Doe - Chest pain
        soap: `SUBJECTIVE:
Patient is a ${visit.patientAge}-year-old ${visit.patientGender} presenting with ${visit.chiefComplaint.toLowerCase()} that started 2 hours ago during physical activity. Patient reports pressure-like sensation, 7/10 intensity, non-radiating. Associated with mild diaphoresis and anxiety about potential cardiac event.

OBJECTIVE:
Vital signs: BP 140/90, HR 95, RR 20, O2 sat 98% on RA, Temp 98.6°F
Physical exam: Alert and oriented, mild distress, chest clear to auscultation bilaterally
ECG: Normal sinus rhythm, no ST changes
Cardiac enzymes: Pending

ASSESSMENT:
1. Chest pain, likely anxiety-related given normal ECG and stable vital signs
2. Rule out acute coronary syndrome - low probability given presentation
3. Anxiety disorder - patient reports significant worry about heart attack

PLAN:
- Reassurance and patient education about anxiety vs cardiac symptoms
- Serial ECGs and cardiac enzymes to rule out ACS
- Consider anxiolytic if symptoms persist
- Follow-up with primary care in 1-2 days
- Return immediately if symptoms worsen`,
        progress: `Patient reports improvement in chest discomfort after reassurance and education. Denies continued chest pain or shortness of breath. Vital signs remain stable. ECG unchanged from admission. Patient appears more relaxed and understands anxiety component.`
      },
      'V002': { // Jane Smith - Palpitations
        soap: `SUBJECTIVE:
${visit.patientAge}-year-old ${visit.patientGender} with ${visit.chiefComplaint.toLowerCase()} for the past week. Reports irregular heartbeat, especially when lying down. Associated fatigue and mild chest tightness. No syncope or dizziness.

OBJECTIVE:
Vital signs: BP 160/95, HR 110 irregular, RR 16, O2 sat 97% on RA
Physical exam: Irregularly irregular rhythm on auscultation, no murmurs
ECG: Atrial fibrillation with RVR, rate 105-120
Labs: INR pending, BNP elevated at 450

ASSESSMENT:
1. New onset atrial fibrillation with rapid ventricular response
2. Mild heart failure (BNP elevation)
3. Need anticoagulation risk assessment

PLAN:
- Initiate rate control with metoprolol
- Start anticoagulation with apixaban 5mg BID
- Echocardiogram to assess LV function
- Cardiology follow-up in 2 weeks
- Patient education on AFib and anticoagulation`,
        progress: `Patient's heart rate better controlled on metoprolol 25mg BID. Palpitations significantly improved. Started on anticoagulation. Patient educated on importance of compliance with medications.`
      },
      'V003': { // Michael Brown - Abdominal pain
        soap: `SUBJECTIVE:
${visit.patientAge}-year-old ${visit.patientGender} with ${visit.chiefComplaint.toLowerCase()} for 2 weeks. Epigastric pain, described as dull and constant, worse after meals. Associated with 10-pound weight loss and night sweats. Denies nausea/vomiting currently.

OBJECTIVE:
Vital signs: BP 120/80, HR 85, RR 14, O2 sat 99%, Temp 98.8°F, Weight 175 lbs (down from 185)
Physical exam: Mild epigastric tenderness, no rebound or guarding
Labs: H. pylori positive, mild anemia (Hgb 11.2)

ASSESSMENT:
1. Peptic ulcer disease, likely H. pylori-related
2. Iron deficiency anemia, likely GI blood loss
3. Weight loss concerning - requires further workup

PLAN:
- Triple therapy: PPI + clarithromycin + amoxicillin for 14 days
- Upper endoscopy to evaluate for ulcer and rule out malignancy
- Iron supplementation for anemia
- Follow-up in 2 weeks to assess symptom improvement
- H. pylori breath test 4 weeks after completing antibiotics`,
        progress: `Patient reports mild improvement in epigastric pain after starting PPI therapy. Tolerating triple therapy well. Scheduled for EGD next week. Weight stable since last visit.`
      },
      'V004': { // Sarah Wilson - Headache
        soap: `SUBJECTIVE:
${visit.patientAge}-year-old ${visit.patientGender} with ${visit.chiefComplaint.toLowerCase()} for 4 hours. Throbbing frontal and temporal headache, 8/10 intensity. Associated with visual aura (flashing lights), photophobia, and mild nausea. Similar episodes in past.

OBJECTIVE:
Vital signs: BP 125/75, HR 88, RR 16, O2 sat 99%
Neurological exam: Alert and oriented x3, visual fields intact now, no focal deficits
Fundoscopic exam: Normal, no papilledema

ASSESSMENT:
1. Migraine with aura - classic presentation
2. No evidence of secondary headache

PLAN:
- Sumatriptan 6mg SC administered with good response
- Prescribe sumatriptan tablets for home use
- Avoid known triggers (stress, certain foods, sleep deprivation)
- Headache diary to identify patterns
- Consider preventive therapy if frequency increases`,
        progress: `Excellent response to sumatriptan. Headache resolved completely. No residual neurological symptoms. Patient educated on proper use of rescue medication.`
      },
      'V005': { // Robert Johnson - Knee pain
        soap: `SUBJECTIVE:
${visit.patientAge}-year-old ${visit.patientGender} with ${visit.chiefComplaint.toLowerCase()} for 3 days. Right knee pain and swelling, worse with movement and weight-bearing. Difficulty walking and climbing stairs. No history of trauma.

OBJECTIVE:
Vital signs: Stable
Knee exam: Moderate effusion, tenderness over medial joint line, limited ROM due to pain
X-ray: Moderate osteoarthritis, joint space narrowing

ASSESSMENT:
1. Osteoarthritis of right knee with acute flare
2. Knee effusion

PLAN:
- NSAIDs: Ibuprofen 600mg TID with food
- Physical therapy referral for strengthening exercises
- Consider knee injection if no improvement in 2 weeks
- Weight loss counseling
- Activity modification during acute phase`,
        progress: `Patient reports good response to NSAIDs. Swelling decreased, mobility improved. Started physical therapy. Able to walk without significant difficulty.`
      }
    };

    // Get the specific template for this visit, or create a generic one
    const template = noteTemplates[visit.id as keyof typeof noteTemplates] || {
      soap: `SUBJECTIVE:
${visit.patientAge}-year-old ${visit.patientGender} presenting with ${visit.chiefComplaint}. 

OBJECTIVE:
Vital signs stable. Physical examination findings consistent with chief complaint.

ASSESSMENT:
${visit.visitSummary}

PLAN:
Treatment plan based on assessment findings.`,
      progress: `Patient progress note for ${visit.patientName}. ${visit.visitSummary}`
    };

    return [
      {
        id: `note-${visit.id}-1`,
        visitId: visit.id,
        patientId: visit.patientId,
        type: 'soap',
        status: visit.notesStatus,
        content: template.soap,
        author: visit.attendingProvider,
        aiGenerated: false,
        createdAt: visit.lastNoteDate || new Date(),
        updatedAt: visit.lastNoteDate || new Date(),
        signedAt: visit.notesStatus === 'signed' ? visit.lastNoteDate : undefined,
        version: 1,
        tags: [visit.department.toLowerCase(), 'assessment'],
      },
      ...(visit.notesCount > 1 ? [{
        id: `note-${visit.id}-2`,
        visitId: visit.id,
        patientId: visit.patientId,
        type: 'progress',
        status: 'signed',
        content: template.progress,
        author: visit.attendingProvider,
        aiGenerated: true,
        createdAt: new Date(visit.lastNoteDate?.getTime() - 3600000), // 1 hour before
        updatedAt: new Date(visit.lastNoteDate?.getTime() - 3600000),
        signedAt: new Date(visit.lastNoteDate?.getTime() - 1800000), // 30 min before
        version: 1,
        tags: ['progress', 'follow-up'],
      }] : [])
    ];
  };

  useEffect(() => {
    // Find the specific visit data
    const visit = mockVisits.find(v => v.id === id);
    if (visit) {
      setVisitData(visit);
      const patientNotes = generatePatientSpecificNotes(visit);
      setNotes(patientNotes);
      setCurrentNote(patientNotes[0]);
    }
    setLoading(false);
  }, [id]);

  const handleGenerateNote = async () => {
    setGenerating(true);
    try {
      // Mock AI generation with patient-specific content
      setTimeout(() => {
        const newNote = {
          id: `note-${Date.now()}`,
          visitId: id,
          patientId: visitData?.patientId,
          type: noteType,
          status: 'draft',
          content: `AI-Generated ${noteType.toUpperCase()} Note for ${visitData?.patientName}:

Based on the visit transcript and analysis for this ${visitData?.patientAge}-year-old ${visitData?.patientGender} patient presenting with ${visitData?.chiefComplaint?.toLowerCase()}, the following clinical assessment has been generated:

${visitData?.visitSummary}

Recommendations:
- Continue current treatment plan
- Monitor for symptom improvement
- Follow-up as scheduled`,
          author: 'System (AI)',
          aiGenerated: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
          tags: ['ai-generated', visitData?.department?.toLowerCase()],
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
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();
  
  // Show loading state while checking authentication
  if (isLoading || !isInitialized) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.LOGIN} replace />;
};

// Component to handle keyboard shortcuts inside Router context
const AppContent: React.FC = () => {
  const { showHelpModal, setShowHelpModal, showGlobalSearch, setShowGlobalSearch } = useKeyboardShortcuts();
  const { isAuthenticated } = useAuthStore();

  return (
    <>
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
          path={ROUTES.TRANSCRIPT_EDITOR}
          element={
            <ProtectedRoute>
              <Layout>
                <TranscriptEditor />
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
          path={ROUTES.AI_AGENT}
          element={
            <ProtectedRoute>
              <Layout>
                <AIAgent />
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
        <Route
          path="/evaluation"
          element={
            <ProtectedRoute>
              <Layout>
                <EvaluationDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
      
      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        open={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
      
      {/* Global Search Modal */}
      <GlobalSearchModal
        open={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
      />
    </>
  );
};

function App() {
  const { initialize, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  
  console.log('🚀 [App Debug] App component initializing...');
  console.log('🚀 [App Debug] Auth state:', {
    isAuthenticated,
    isLoading,
    isInitialized
  });
  
  const theme = createAppTheme(); // No parameters needed - fixed to light mode

  useEffect(() => {
    console.log('🚀 [App Debug] Calling auth initialize...');
    initialize();
  }, [initialize]);

  // Show loading state while initializing
  if (isLoading || !isInitialized) {
    console.log('🚀 [App Debug] Showing loading state...');
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

  console.log('🚀 [App Debug] Rendering main app...');
  console.log('🚀 [App Debug] User authenticated:', isAuthenticated);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App; 