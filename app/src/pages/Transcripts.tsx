import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ROUTES } from '@/constants';
import { mockVisits, Visit } from '@/data/mockData';
import { exportTranscript } from '@/services/fileUpload';

// Mock transcript content for each visit
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
**Duration:** 40 minutes

**[00:00] Dr. Lee:** Good morning, Mr. Johnson. I see you're having knee pain and swelling. Which knee is bothering you?

**[00:03] Patient:** It's my right knee, Doctor. It started hurting about 3 days ago and now it's really swollen.

**[00:07] Dr. Lee:** What were you doing when the pain started?

**[00:08] Patient:** I was just walking up the stairs at home. Nothing unusual, but suddenly I felt this sharp pain.

**[00:12] Dr. Lee:** How would you describe the pain?

**[00:13] Patient:** It's a deep aching pain, and it gets much worse when I try to walk or bend my knee.

**[00:17] Dr. Lee:** Any stiffness?

**[00:18] Patient:** Yes, especially in the morning. It takes me about 30 minutes to get moving.

**[00:22] Dr. Lee:** Let me examine your knee. I can see there's definitely swelling and some warmth.

**[00:25] Patient:** It's been getting worse each day. Yesterday I could barely walk.

**[00:28] Dr. Lee:** Your range of motion is limited due to the swelling. This looks like an acute flare of osteoarthritis.

**[00:32] Dr. Lee:** Have you taken anything for the pain?

**[00:33] Patient:** Just some over-the-counter ibuprofen, but it's not helping much.

**[00:36] Dr. Lee:** I'm going to prescribe a stronger anti-inflammatory and refer you to physical therapy. We'll also discuss some lifestyle modifications that can help.

**[00:40] VISIT CONCLUDED**

**ASSESSMENT:** Osteoarthritis with acute flare. Started on NSAIDs and physical therapy referral provided.`
};

export const Transcripts: React.FC = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Transcript viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [transcriptContent, setTranscriptContent] = useState('');

  useEffect(() => {
    // Use shared mock data for consistency across all pages
    setVisits(mockVisits);
    setFilteredVisits(mockVisits);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = visits;

    if (searchTerm) {
      filtered = filtered.filter(visit =>
        visit.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (visit.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        visit.attendingProvider.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(visit => visit.transcriptStatus === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(visit => visit.type === typeFilter);
    }

    setFilteredVisits(filtered);
  }, [visits, searchTerm, statusFilter, typeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'uploaded': return 'info';
      case 'none': return 'default';
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

  const handleUploadTranscript = (visitId: string) => {
    navigate(ROUTES.TRANSCRIPT_UPLOAD.replace(':id', visitId));
  };

  const handleViewTranscript = (visit: Visit) => {
    setSelectedVisit(visit);
    setTranscriptContent(mockTranscriptContent[visit.id] || 'Transcript content not available.');
    setViewerOpen(true);
  };

  const handleDownloadTranscript = async (visit: Visit) => {
    try {
      const content = mockTranscriptContent[visit.id] || 'Transcript content not available.';
      const filename = `transcript-${visit.patientId}-${format(visit.scheduledDateTime, 'yyyy-MM-dd')}`;
      await exportTranscript(content, 'pdf', filename);
    } catch (error) {
      console.error('Failed to download transcript:', error);
    }
  };

  const handleEditTranscript = (visitId: string) => {
    setViewerOpen(false);
    navigate(ROUTES.TRANSCRIPT_EDITOR.replace(':id', visitId));
  };

  const handlePrintTranscript = () => {
    if (transcriptContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Transcript - ${selectedVisit?.patientName}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                pre { white-space: pre-wrap; word-wrap: break-word; }
              </style>
            </head>
            <body>
              <pre>${transcriptContent}</pre>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
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
      <Typography variant="h4" component="h1" gutterBottom>
        Transcripts
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View, manage, and download transcripts for all visits
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search visits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Transcript Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Transcript Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="none">No Transcript</MenuItem>
                <MenuItem value="uploaded">Uploaded</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Visit Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Visit Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="consultation">Consultation</MenuItem>
                <MenuItem value="follow_up">Follow-up</MenuItem>
                <MenuItem value="urgent_care">Urgent Care</MenuItem>
                <MenuItem value="telemedicine">Telemedicine</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Visits Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Visit ID</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Chief Complaint</TableCell>
              <TableCell>Transcript Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVisits.map((visit) => (
              <TableRow key={visit.id}>
                <TableCell>{visit.id}</TableCell>
                <TableCell>{visit.patientName}</TableCell>
                <TableCell>
                  <Chip
                    label={visit.type}
                    color={getTypeColor(visit.type) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {visit.scheduledDateTime.toLocaleDateString()}
                </TableCell>
                <TableCell>{visit.attendingProvider}</TableCell>
                <TableCell>{visit.chiefComplaint}</TableCell>
                <TableCell>
                  <Chip
                    label={visit.transcriptStatus}
                    color={getStatusColor(visit.transcriptStatus) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {visit.hasTranscript ? (
                      <>
                        <Tooltip title="View Transcript">
                          <IconButton
                            size="small"
                            onClick={() => handleViewTranscript(visit)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download Transcript">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadTranscript(visit)}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Transcript">
                          <IconButton
                            size="small"
                            onClick={() => handleEditTranscript(visit.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title="Upload Transcript">
                        <IconButton
                          size="small"
                          onClick={() => handleUploadTranscript(visit.id)}
                        >
                          <UploadIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredVisits.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No visits found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filters
          </Typography>
        </Box>
      )}

      {/* Transcript Viewer Dialog */}
      <Dialog
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">
                Transcript - {selectedVisit?.patientName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visit {selectedVisit?.id} • {selectedVisit?.scheduledDateTime.toLocaleDateString()} • {selectedVisit?.attendingProvider}
              </Typography>
            </Box>
            <IconButton onClick={() => setViewerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedVisit && !selectedVisit.hasTranscript ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No transcript available for this visit. You can upload one using the transcript management system.
            </Alert>
          ) : (
            <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
              <Typography 
                component="pre" 
                sx={{ 
                  whiteSpace: 'pre-wrap', 
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  margin: 0
                }}
              >
                {transcriptContent}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        
        <DialogActions>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<PrintIcon />}
              onClick={handlePrintTranscript}
              disabled={!selectedVisit?.hasTranscript}
            >
              Print
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => selectedVisit && handleDownloadTranscript(selectedVisit)}
              disabled={!selectedVisit?.hasTranscript}
            >
              Download
            </Button>
            <Button
              startIcon={<EditIcon />}
              onClick={() => selectedVisit && handleEditTranscript(selectedVisit.id)}
              disabled={!selectedVisit?.hasTranscript}
            >
              Edit
            </Button>
            <Button onClick={() => setViewerOpen(false)}>
              Close
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transcripts; 