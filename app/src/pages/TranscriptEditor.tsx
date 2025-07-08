import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  History as HistoryIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/constants';
import { mockVisits } from '@/data/mockData';
import { exportTranscript } from '@/services/fileUpload';

// Mock transcript content for each visit (same as in Transcripts.tsx)
const mockTranscriptContent: Record<string, string> = {
  'V001': `**VISIT TRANSCRIPT**
**Date:** January 15, 2024
**Patient:** John Doe (ID: P001)
**Provider:** Dr. Smith
**Department:** Emergency
**Duration:** 40 minutes

**[00:00] Dr. Smith:** Good morning, Mr. Doe. I understand you're here today because of chest pain and shortness of breath. Can you tell me when this started?

**[00:02] Patient:** Good morning, Doctor. It started about 2 hours ago while I was jogging. The pain is right here in my chest, and it feels like pressure.

**[00:05] Dr. Smith:** Can you describe the pain on a scale of 1 to 10?

**[00:06] Patient:** I'd say it's about a 7. It's not getting worse, but it's not getting better either.

**[00:08] Dr. Smith:** Any radiation of the pain to your arm, jaw, or back?

**[00:09] Patient:** No, it's just right here in the center of my chest.

**[00:12] Dr. Smith:** Any associated symptoms like nausea, sweating, or dizziness?

**[00:13] Patient:** I did sweat a bit when it first started, but no nausea or dizziness.

**[00:15] Dr. Smith:** Have you had anything like this before?

**[00:16] Patient:** No, never. I'm usually pretty healthy. I exercise regularly.

**[00:20] Dr. Smith:** Any family history of heart disease?

**[00:21] Patient:** My father had a heart attack when he was 65, but he was a smoker.

**[00:25] Dr. Smith:** I'm going to examine you now and then we'll get an ECG to check your heart rhythm.

**[00:30] Dr. Smith:** Your blood pressure is 140/90, which is slightly elevated. Heart rate is 95. Lungs are clear. 

**[00:35] Patient:** Is this serious, Doctor?

**[00:36] Dr. Smith:** We're going to run some tests to be sure, but given your age and the nature of the pain, this could be related to anxiety or muscle strain. The ECG will help us rule out any heart issues.

**[00:40] VISIT CONCLUDED**

**ASSESSMENT:** Chest pain, likely anxiety-related given normal ECG and vital signs. Patient reassured and educated about anxiety management techniques.`,

  'V002': `**VISIT TRANSCRIPT**
**Date:** January 18, 2024
**Patient:** Jane Smith (ID: P002)
**Provider:** Dr. Johnson
**Department:** Cardiology
**Duration:** 28 minutes

**[00:00] Dr. Johnson:** Good afternoon, Mrs. Smith. You're here for a follow-up regarding palpitations and fatigue. How have you been feeling since our last visit?

**[00:03] Patient:** Well, the palpitations are still happening, maybe 3-4 times a day. And I'm so tired all the time.

**[00:07] Dr. Johnson:** When do the palpitations typically occur?

**[00:08] Patient:** Usually when I'm just sitting or lying down. Sometimes at night when I'm trying to sleep.

**[00:12] Dr. Johnson:** Do they last long?

**[00:13] Patient:** Maybe 30 seconds to a minute. My heart just starts racing out of nowhere.

**[00:16] Dr. Johnson:** Any chest pain or shortness of breath with them?

**[00:17] Patient:** Sometimes I feel a little short of breath, but no chest pain.

**[00:20] Dr. Johnson:** I see your Holter monitor results show atrial fibrillation episodes. This explains your symptoms.

**[00:23] Patient:** Is that serious? What does that mean?

**[00:24] Dr. Johnson:** Atrial fibrillation means your heart's upper chambers aren't beating in a regular rhythm. It's manageable with medication and lifestyle changes.

**[00:28] VISIT CONCLUDED**

**ASSESSMENT:** Atrial fibrillation confirmed. Started on anticoagulation therapy. Patient educated about condition and follow-up scheduled.`,

  'V003': `**VISIT TRANSCRIPT**
**Date:** January 20, 2024
**Patient:** Michael Brown (ID: P003)
**Provider:** Dr. Davis
**Department:** Internal Medicine
**Duration:** 25 minutes

**[00:00] Dr. Davis:** Good morning, Mr. Brown. I see you're concerned about fatigue and gastrointestinal symptoms. Tell me more about what you've been experiencing.

**[00:04] Patient:** Doctor, I've been feeling really tired for about 2 weeks now, and I have this constant pain in my stomach area.

**[00:08] Dr. Davis:** Where exactly is the stomach pain located?

**[00:09] Patient:** Right here, in the upper part of my stomach. It gets worse after I eat.

**[00:12] Dr. Davis:** Any nausea or vomiting?

**[00:13] Patient:** Yes, especially in the mornings. And I've lost about 10 pounds without trying.

**[00:16] Dr. Davis:** That's concerning. Any changes in your bowel movements?

**[00:17] Patient:** They've been looser than usual, and sometimes there's blood.

**[00:20] Dr. Davis:** How long has the weight loss been going on?

**[00:21] Patient:** About 2 weeks, same as the other symptoms.

**[00:24] Dr. Davis:** Given your symptoms, I want to schedule you for an endoscopy to take a closer look at your stomach and upper intestine.

**[00:25] VISIT CONCLUDED**

**ASSESSMENT:** Epigastric pain with weight loss and GI symptoms. Endoscopy scheduled to rule out ulcers or other gastric pathology.`,

  'V004': `**VISIT TRANSCRIPT**
**Date:** January 16, 2024
**Patient:** Sarah Wilson (ID: P004)
**Provider:** Dr. Thompson
**Department:** Neurology
**Duration:** 45 minutes

**[00:00] Dr. Thompson:** Good afternoon, Sarah. I understand you're having a severe headache with vision changes. Can you describe what you're experiencing?

**[00:04] Patient:** Doctor, this headache is terrible. It started about 4 hours ago and it's throbbing, mainly on the front and sides of my head.

**[00:08] Dr. Thompson:** On a scale of 1 to 10, how would you rate the pain?

**[00:09] Patient:** It's definitely a 9. I've never had a headache this bad.

**[00:12] Dr. Thompson:** You mentioned vision changes. What exactly are you seeing?

**[00:13] Patient:** I'm seeing these flashing lights, like zigzag patterns. They started about 2 hours ago.

**[00:17] Dr. Thompson:** Are you sensitive to light or sound?

**[00:18] Patient:** Yes, very much so. The lights in here are really bothering me.

**[00:21] Dr. Thompson:** Any nausea?

**[00:22] Patient:** A little bit, but not severe.

**[00:25] Dr. Thompson:** Have you ever had migraines before?

**[00:26] Patient:** I get headaches sometimes, but nothing like this.

**[00:30] Dr. Thompson:** Based on your symptoms - the severe throbbing headache, visual aura with flashing lights, and photophobia - this appears to be a migraine with aura.

**[00:35] Patient:** Is there something you can give me for the pain?

**[00:36] Dr. Thompson:** Yes, I'm going to give you sumatriptan, which is specifically for migraines. I'll also prescribe something for the nausea.

**[00:40] Dr. Thompson:** I want you to rest in a dark, quiet room. The medication should help within 30-60 minutes.

**[00:45] VISIT CONCLUDED**

**ASSESSMENT:** Migraine with aura. Prescribed sumatriptan and anti-nausea medication. Patient advised on trigger avoidance and follow-up care.`,

  'V005': `**VISIT TRANSCRIPT**
**Date:** January 19, 2024
**Patient:** Robert Johnson (ID: P005)
**Provider:** Dr. Lee
**Department:** Orthopedics
**Duration:** 35 minutes

**[00:00] Dr. Lee:** Good morning, Mr. Johnson. I see you're here about knee pain and swelling. How long has this been going on?

**[00:03] Patient:** It started about a week ago, Doctor. I was playing basketball and heard a pop.

**[00:07] Dr. Lee:** Did you fall or twist your knee when you heard the pop?

**[00:08] Patient:** I was going for a rebound and came down awkwardly. Twisted my knee pretty bad.

**[00:12] Dr. Lee:** How would you rate the pain currently?

**[00:13] Patient:** It's about a 6 or 7. Hurts more when I try to walk.

**[00:16] Dr. Lee:** Any swelling?

**[00:17] Patient:** Yes, quite a bit. It's been swollen since it happened.

**[00:20] Dr. Lee:** Let me examine your knee. Can you bend it for me?

**[00:25] Dr. Lee:** I can feel some fluid in the joint, and there's definitely instability. We'll need an MRI to check for ligament damage.

**[00:30] Patient:** Do you think I tore something?

**[00:31] Dr. Lee:** It's possible. Given the mechanism of injury and the instability, this could be an ACL tear.

**[00:35] VISIT CONCLUDED**

**ASSESSMENT:** Knee injury with possible ACL tear. MRI scheduled. Patient given knee brace and referred to physical therapy.`,

  'V006': `**VISIT TRANSCRIPT**
**Date:** January 21, 2024
**Patient:** Emily Davis (ID: P006)
**Provider:** Dr. Miller
**Department:** Pediatrics
**Duration:** 20 minutes

**[00:00] Dr. Miller:** Good afternoon, Emily. Mom says you've been having a fever and cough. How are you feeling?

**[00:03] Patient:** I feel yucky, Doctor. My throat hurts and I'm tired.

**[00:06] Dr. Miller:** [To mother] How long has she had the fever?

**[00:07] Mother:** Started yesterday evening. Got up to 101.5°F last night.

**[00:10] Dr. Miller:** Any other symptoms? Runny nose, headache?

**[00:11] Mother:** Yes, runny nose and she's been complaining of a headache.

**[00:14] Dr. Miller:** Let me listen to your chest, Emily. Take a deep breath for me.

**[00:17] Dr. Miller:** Lungs sound clear. Let me check your throat.

**[00:20] VISIT CONCLUDED**

**ASSESSMENT:** Viral upper respiratory infection. Symptomatic treatment recommended. Return if symptoms worsen.`,

  'V007': `**VISIT TRANSCRIPT**
**Date:** January 13, 2024
**Patient:** David Anderson (ID: P007)
**Provider:** Dr. Brown
**Department:** Urgent Care
**Duration:** 15 minutes

**[00:00] Dr. Brown:** Good evening, Mr. Anderson. I understand you're having abdominal pain. Can you tell me about it?

**[00:03] Patient:** Doctor, the pain started about 4 hours ago. It's really sharp and in my lower right side.

**[00:07] Dr. Brown:** On a scale of 1 to 10?

**[00:08] Patient:** It's definitely an 8. Gets worse when I move.

**[00:11] Dr. Brown:** Any nausea or vomiting?

**[00:12] Patient:** Yes, I threw up twice on the way here.

**[00:15] VISIT CONCLUDED**

**ASSESSMENT:** Acute appendicitis suspected. Patient transferred to emergency department for surgical evaluation.`,
};

interface TranscriptVersion {
  id: string;
  content: string;
  timestamp: Date;
  author: string;
  changes?: string;
}

const TranscriptEditor: React.FC = () => {
  const { id: visitId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // State management
  const [transcriptContent, setTranscriptContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [versions, setVersions] = useState<TranscriptVersion[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    show: boolean;
  }>({ message: '', type: 'info', show: false });

  // Get visit info
  const visit = mockVisits.find(v => v.id === visitId);

  // Load transcript content
  useEffect(() => {
    if (visitId) {
      loadTranscriptContent();
    }
  }, [visitId]);

  // Track changes
  useEffect(() => {
    setHasUnsavedChanges(transcriptContent !== originalContent);
  }, [transcriptContent, originalContent]);

  const loadTranscriptContent = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, this would fetch from an API
      const content = mockTranscriptContent[visitId || ''] || '';
      setTranscriptContent(content);
      setOriginalContent(content);
      
      // Mock version history
      const mockVersions: TranscriptVersion[] = [
        {
          id: '1',
          content: content,
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          author: user?.displayName || 'System',
          changes: 'Initial transcript generated'
        }
      ];
      setVersions(mockVersions);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading transcript:', error);
      showNotification('Failed to load transcript', 'error');
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!visitId || !user) return;

    try {
      setIsSaving(true);
      
      // In a real app, this would save to an API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      // Update version history
      const newVersion: TranscriptVersion = {
        id: (versions.length + 1).toString(),
        content: transcriptContent,
        timestamp: new Date(),
        author: user.displayName,
        changes: 'Manual edit'
      };
      setVersions(prev => [...prev, newVersion]);
      
      setOriginalContent(transcriptContent);
      showNotification('Transcript saved successfully', 'success');
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving transcript:', error);
      showNotification('Failed to save transcript', 'error');
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (!visit || !transcriptContent) return;

    try {
      const filename = `transcript_${visit.id}_${visit.patientName.replace(/\s+/g, '_')}`;
      await exportTranscript(transcriptContent, 'pdf', filename);
      showNotification('Transcript exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting transcript:', error);
      showNotification('Failed to export transcript', 'error');
    }
  };

  const handlePrint = () => {
    if (!transcriptContent || !visit) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Transcript - ${visit.patientName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
              pre { white-space: pre-wrap; word-wrap: break-word; }
              .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
              .visit-info { margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Medical Visit Transcript</h1>
              <div class="visit-info"><strong>Patient:</strong> ${visit.patientName}</div>
              <div class="visit-info"><strong>Visit ID:</strong> ${visit.id}</div>
              <div class="visit-info"><strong>Provider:</strong> ${visit.attendingProvider}</div>
              <div class="visit-info"><strong>Date:</strong> ${visit.scheduledDateTime.toLocaleDateString()}</div>
            </div>
            <pre>${transcriptContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const highlightSearchQuery = (text: string) => {
    if (!searchQuery) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.replace(regex, '<mark style="background-color: yellow; padding: 2px;">$1</mark>');
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ message, type, show: true });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate(ROUTES.TRANSCRIPTS);
      }
    } else {
      navigate(ROUTES.TRANSCRIPTS);
    }
  };

  const restoreVersion = (version: TranscriptVersion) => {
    setTranscriptContent(version.content);
    setShowVersionHistory(false);
    showNotification('Version restored', 'success');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!visit) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Visit not found
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <IconButton onClick={handleBack} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Edit Transcript
          </Typography>
          {hasUnsavedChanges && (
            <Chip label="Unsaved changes" color="warning" size="small" />
          )}
        </Stack>
        
        {/* Visit Info */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Patient
                </Typography>
                <Typography variant="body1">{visit.patientName}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Visit ID
                </Typography>
                <Typography variant="body1">{visit.id}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Provider
                </Typography>
                <Typography variant="body1">{visit.attendingProvider}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {visit.scheduledDateTime.toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Notification */}
      {notification.show && (
        <Alert 
          severity={notification.type} 
          sx={{ mb: 2 }}
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        >
          {notification.message}
        </Alert>
      )}

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search in transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ minWidth: 200 }}
          />
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Tooltip title="Version History">
            <IconButton
              onClick={() => setShowVersionHistory(true)}
              disabled={versions.length === 0}
            >
              <HistoryIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Print">
            <IconButton onClick={handlePrint}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Export">
            <IconButton onClick={handleExport}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            startIcon={<SaveIcon />}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Paper>

      {/* Editor */}
      <Paper sx={{ p: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={25}
          value={transcriptContent}
          onChange={(e) => setTranscriptContent(e.target.value)}
          placeholder="Enter transcript content..."
          sx={{
            '& .MuiInputBase-root': {
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              lineHeight: 1.6,
            },
            '& .MuiInputBase-input': {
              resize: 'vertical',
            },
          }}
        />
      </Paper>

      {/* Preview */}
      {searchQuery && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Search Results
          </Typography>
          <Box
            sx={{
              maxHeight: 300,
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              lineHeight: 1.6,
            }}
            dangerouslySetInnerHTML={{
              __html: highlightSearchQuery(transcriptContent.replace(/\n/g, '<br />'))
            }}
          />
        </Paper>
      )}

      {/* Version History Dialog */}
      <Dialog 
        open={showVersionHistory} 
        onClose={() => setShowVersionHistory(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Version History</DialogTitle>
        <DialogContent>
          <List>
            {versions.map((version) => (
              <ListItem key={version.id} divider>
                <ListItemText
                  primary={`Version ${version.id}`}
                  secondary={
                    <>
                      <Typography variant="caption" display="block">
                        {format(version.timestamp, 'PPp')} by {version.author}
                      </Typography>
                      {version.changes && (
                        <Typography variant="caption" color="text.secondary">
                          {version.changes}
                        </Typography>
                      )}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <Button
                    size="small"
                    onClick={() => restoreVersion(version)}
                    disabled={version.content === transcriptContent}
                  >
                    Restore
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVersionHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TranscriptEditor; 