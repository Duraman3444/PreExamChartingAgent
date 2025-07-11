import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  Avatar,
  TableSortLabel,
  TablePagination,
  Badge,
  Alert,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material';
import { globalEventStore } from '@/stores/globalEventStore';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  RecordVoiceOver as TranscriptIcon,
  LocalHospital as HospitalIcon,
  CalendarToday as CalendarIcon,
  VideoCall as VideoCallIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { exportTranscript } from '@/services/fileUpload';
import { MockDataStore, Visit } from '@/data/mockData';

// Extended visit interface for the management view
interface VisitRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  type: 'consultation' | 'follow_up' | 'urgent_care' | 'telemedicine';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDateTime: Date;
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in minutes
  attendingProvider: string;
  department: string;
  chiefComplaint?: string;
  visitSummary?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  hasTranscript: boolean;
  hasAiAnalysis: boolean;
  hasVisitNotes: boolean;
  transcriptProcessingStatus: 'pending' | 'processing' | 'completed' | 'error';
  aiAnalysisStatus: 'pending' | 'processing' | 'completed' | 'reviewed' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

// Convert shared Visit data to VisitRecord format for this component
const convertVisitToRecord = (visit: Visit): VisitRecord => ({
  ...visit,
  transcriptProcessingStatus: visit.transcriptStatus as 'pending' | 'processing' | 'completed' | 'error',
  aiAnalysisStatus: visit.analysisStatus as 'pending' | 'processing' | 'completed' | 'reviewed' | 'error',
});

// Use shared mock data - converted to VisitRecord format
const getVisitData = (): VisitRecord[] => MockDataStore.getVisits().map(convertVisitToRecord);


interface VisitDetailsProps {
  open: boolean;
  onClose: () => void;
  visit: VisitRecord;
}

const VisitDetails: React.FC<VisitDetailsProps> = ({ open, onClose, visit }) => {
  const navigate = useNavigate();
  
  const handleDownloadTranscript = async (visitRecord: VisitRecord) => {
    try {
      // Generate mock transcript content for download
      const transcriptContent = `
**Visit Transcript**
**Patient:** ${visitRecord.patientName} (${visitRecord.patientId})
**Date:** ${format(visitRecord.scheduledDateTime, 'PPP')}
**Provider:** ${visitRecord.attendingProvider}
**Department:** ${visitRecord.department}
**Type:** ${visitRecord.type.replace('_', ' ').toUpperCase()}
**Duration:** ${visitRecord.duration || 'N/A'} minutes

**Chief Complaint:** ${visitRecord.chiefComplaint || 'N/A'}

**Visit Summary:** ${visitRecord.visitSummary || 'N/A'}

**Transcript Status:** ${visitRecord.transcriptProcessingStatus}
**AI Analysis Status:** ${visitRecord.aiAnalysisStatus}

Generated on: ${format(new Date(), 'PPpp')}
      `.trim();
      
      const filename = `visit-transcript-${visitRecord.patientId}-${format(visitRecord.scheduledDateTime, 'yyyy-MM-dd')}`;
      await exportTranscript(transcriptContent, 'pdf', filename);
    } catch (error) {
      console.error('Failed to download transcript:', error);
      // You might want to show an error message here
    }
  };
  
  const handleDownloadAiAnalysis = async (visitRecord: VisitRecord) => {
    try {
      // Generate mock AI analysis content for download
      const aiAnalysisContent = `
**AI Analysis Report**
**Patient:** ${visitRecord.patientName} (${visitRecord.patientId})
**Visit Date:** ${format(visitRecord.scheduledDateTime, 'PPP')}
**Provider:** ${visitRecord.attendingProvider}
**Generated:** ${format(new Date(), 'PPpp')}

**VISIT OVERVIEW**
• Type: ${visitRecord.type.replace('_', ' ').toUpperCase()}
• Department: ${visitRecord.department}
• Duration: ${visitRecord.duration || 'N/A'} minutes
• Priority: ${visitRecord.priority.toUpperCase()}

**CHIEF COMPLAINT**
${visitRecord.chiefComplaint || 'No chief complaint documented'}

**VISIT SUMMARY**
${visitRecord.visitSummary || 'No visit summary available'}

**AI ANALYSIS STATUS**
Processing Status: ${visitRecord.aiAnalysisStatus}
Transcript Status: ${visitRecord.transcriptProcessingStatus}

**DOCUMENTATION STATUS**
• Transcript Available: ${visitRecord.hasTranscript ? 'Yes' : 'No'}
• AI Analysis Complete: ${visitRecord.hasAiAnalysis ? 'Yes' : 'No'}
• Visit Notes Available: ${visitRecord.hasVisitNotes ? 'Yes' : 'No'}

**RECOMMENDATIONS**
• Follow up with patient as needed
• Review analysis results with attending physician
• Ensure all documentation is complete

Generated by Care Plus AI Analysis System
      `.trim();
      
      const filename = `ai-analysis-${visitRecord.patientId}-${format(visitRecord.scheduledDateTime, 'yyyy-MM-dd')}`;
      await exportTranscript(aiAnalysisContent, 'pdf', filename);
    } catch (error) {
      console.error('Failed to download AI analysis:', error);
      // You might want to show an error message here
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <ScheduleIcon color="info" />;
      case 'in_progress':
        return <PlayIcon color="warning" />;
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'cancelled':
        return <CancelIcon color="error" />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'telemedicine':
        return <VideoCallIcon />;
      case 'urgent_care':
        return <WarningIcon />;
      case 'follow_up':
        return <AssessmentIcon />;
      default:
        return <HospitalIcon />;
    }
  };

  const getProcessingStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', color: 'default' as const };
      case 'processing':
        return { label: 'Processing', color: 'warning' as const };
      case 'completed':
        return { label: 'Completed', color: 'success' as const };
      case 'reviewed':
        return { label: 'Reviewed', color: 'info' as const };
      case 'error':
        return { label: 'Error', color: 'error' as const };
      default:
        return { label: 'Unknown', color: 'default' as const };
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {visit.patientName.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Box>
            <Typography variant="h6">
              {visit.patientName} - {visit.type.replace('_', ' ').toUpperCase()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visit ID: {visit.id} | Patient ID: {visit.patientId}
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            {getStatusIcon(visit.status)}
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Visit Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Type</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getTypeIcon(visit.type)}
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {visit.type.replace('_', ' ')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip
                  label={visit.status.replace('_', ' ').toUpperCase()}
                  color={visit.status === 'completed' ? 'success' : 
                         visit.status === 'in_progress' ? 'warning' : 
                         visit.status === 'cancelled' ? 'error' : 'info'}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Priority</Typography>
                <Chip
                  label={visit.priority.toUpperCase()}
                  color={visit.priority === 'urgent' ? 'error' : 
                         visit.priority === 'high' ? 'warning' : 
                         visit.priority === 'medium' ? 'info' : 'default'}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Department</Typography>
                <Typography variant="body1">{visit.department}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Attending Provider</Typography>
                <Typography variant="body1">{visit.attendingProvider}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Chief Complaint</Typography>
                <Typography variant="body1">{visit.chiefComplaint || 'Not specified'}</Typography>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Scheduling</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Scheduled Date & Time</Typography>
                <Typography variant="body1">
                  {format(visit.scheduledDateTime, 'PPP p')}
                </Typography>
              </Grid>
              {visit.startTime && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Start Time</Typography>
                  <Typography variant="body1">
                    {format(visit.startTime, 'p')}
                  </Typography>
                </Grid>
              )}
              {visit.endTime && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">End Time</Typography>
                  <Typography variant="body1">
                    {format(visit.endTime, 'p')}
                  </Typography>
                </Grid>
              )}
              {visit.duration && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="body1">{visit.duration} minutes</Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Documentation Status</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TranscriptIcon />
                      <Typography variant="subtitle2">Transcript</Typography>
                    </Box>
                    <Chip
                      label={getProcessingStatus(visit.transcriptProcessingStatus).label}
                      color={getProcessingStatus(visit.transcriptProcessingStatus).color}
                      size="small"
                    />
                    {visit.hasTranscript && (
                      <Box sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          onClick={() => navigate(ROUTES.TRANSCRIPT_UPLOAD.replace(':id', visit.id))}
                        >
                          View Transcript
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownloadTranscript(visit)}
                          sx={{ ml: 1 }}
                        >
                          Download
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PsychologyIcon />
                      <Typography variant="subtitle2">AI Analysis</Typography>
                    </Box>
                    <Chip
                      label={getProcessingStatus(visit.aiAnalysisStatus).label}
                      color={getProcessingStatus(visit.aiAnalysisStatus).color}
                      size="small"
                    />
                    {visit.hasAiAnalysis && (
                      <Box sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          onClick={() => navigate(ROUTES.AI_ANALYSIS)}
                        >
                          View Analysis
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownloadAiAnalysis(visit)}
                          sx={{ ml: 1 }}
                        >
                          Download
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <DescriptionIcon />
                      <Typography variant="subtitle2">Visit Notes</Typography>
                    </Box>
                    <Chip
                      label={visit.hasVisitNotes ? 'Available' : 'Not Available'}
                      color={visit.hasVisitNotes ? 'success' : 'default'}
                      size="small"
                    />
                    {visit.hasVisitNotes && (
                      <Box sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          onClick={() => navigate(ROUTES.VISIT_NOTES.replace(':id', visit.id))}
                        >
                          View Notes
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
          
          {visit.visitSummary && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Visit Summary</Typography>
              <Alert severity="info">
                {visit.visitSummary}
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          onClick={() => navigate(ROUTES.VISIT_DETAIL.replace(':id', visit.id))}
        >
          View Full Details
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const VisitManagement: React.FC = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<VisitRecord[]>(getVisitData());

  // Subscribe to MockDataStore updates
  useEffect(() => {
    const unsubscribe = MockDataStore.subscribe(() => {
      console.log('📡 [VisitManagement] MockDataStore updated, refreshing visits...');
      setVisits(getVisitData());
    });

    return unsubscribe;
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedVisit, setSelectedVisit] = useState<VisitRecord | null>(null);
  const [visitDetailsOpen, setVisitDetailsOpen] = useState(false);
  const [editVisit, setEditVisit] = useState<VisitRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [newVisit, setNewVisit] = useState<Partial<VisitRecord>>({
    type: 'consultation',
    status: 'scheduled',
    priority: 'medium',
    department: 'General Medicine',
    attendingProvider: '',
    scheduledDateTime: new Date(),
    chiefComplaint: '',
    hasTranscript: false,
    hasAiAnalysis: false,
    hasVisitNotes: false,
    transcriptProcessingStatus: 'pending',
    aiAnalysisStatus: 'pending'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof VisitRecord>('scheduledDateTime');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // **NEW: Real-time transcript update listener using global store**
  useEffect(() => {
    const handleTranscriptUpdate = (data: { visitId: string; status: string; timestamp: Date }) => {
      console.log('📢 [Visit Management] Received transcript update:', data);
      
      // Update the visit record to show transcript is available
      setVisits(prevVisits => 
        prevVisits.map(visit => 
          visit.id === data.visitId 
            ? { 
                ...visit, 
                hasTranscript: true,
                transcriptProcessingStatus: data.status as 'completed' | 'pending' | 'processing' | 'error',
                updatedAt: data.timestamp
              }
            : visit
        )
      );
      
      console.log(`✅ [Visit Management] Transcript updated for visit ${data.visitId} - Status: ${data.status}`);
    };

    const handleVisitCreated = (visit: any) => {
      console.log('🔥 [Visit Management] handleVisitCreated called with visit:', visit);
      
      // Add the new visit to the list
      setVisits(prevVisits => {
        console.log('🔥 [Visit Management] Adding visit to list. Previous count:', prevVisits.length);
        const newVisits = [visit, ...prevVisits];
        console.log('🔥 [Visit Management] New visits count:', newVisits.length);
        return newVisits;
      });
      
      console.log(`✅ [Visit Management] New visit created for ${visit.patientName} - ID: ${visit.id}`);
    };
    
    // Register with global store
    console.log('🔥 [Visit Management] Registering with global store...');
    globalEventStore.onTranscriptUpdated(handleTranscriptUpdate);
    globalEventStore.onVisitCreated(handleVisitCreated);
    console.log('🔥 [Visit Management] Global store callbacks registered successfully');
    
    // Add debug info to window
    (window as any).visitManagementListeners = {
      globalStoreRegistered: true,
      visitsCount: visits.length,
      debugInfo: globalEventStore.getDebugInfo()
    };
    
    return () => {
      console.log('🔥 [Visit Management] Component unmounting...');
      // Note: In a real app, you'd want to properly clean up callbacks
    };
  }, []);

  // Filter and search logic
  const filteredVisits = useMemo(() => {
    return visits.filter(visit => {
      const matchesSearch = 
        visit.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.attendingProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || visit.status === selectedStatus;
      const matchesType = selectedType === 'all' || visit.type === selectedType;
      const matchesDepartment = selectedDepartment === 'all' || visit.department === selectedDepartment;

      return matchesSearch && matchesStatus && matchesType && matchesDepartment;
    });
  }, [visits, searchTerm, selectedStatus, selectedType, selectedDepartment]);

  // Sort logic
  const sortedVisits = useMemo(() => {
    return [...filteredVisits].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return order === 'asc' ? 1 : -1;
      if (bValue == null) return order === 'asc' ? -1 : 1;
      
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }
      
      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredVisits, orderBy, order]);

  // Pagination
  const paginatedVisits = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedVisits.slice(start, start + rowsPerPage);
  }, [sortedVisits, page, rowsPerPage]);

  const handleSort = (property: keyof VisitRecord) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleViewDetails = (visit: VisitRecord) => {
    setSelectedVisit(visit);
    setVisitDetailsOpen(true);
  };

  const handleEditVisit = (visit: VisitRecord) => {
    setEditVisit({ ...visit });
    setEditDialogOpen(true);
  };

  const handleSaveVisit = async () => {
    if (!editVisit) return;

    setIsUpdating(true);
    try {
      // TODO: Implement Firestore update
      // await updateVisitInFirestore(editVisit);
      
      // Update local state for now
      setVisits(prev => prev.map(v => 
        v.id === editVisit.id 
          ? { ...editVisit, updatedAt: new Date() }
          : v
      ));
      
      setEditDialogOpen(false);
      setEditVisit(null);
      
      // Show success notification (you might want to add a notification system)
      console.log('Visit updated successfully');
      
    } catch (error) {
      console.error('Error updating visit:', error);
      // Show error notification
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditVisit(null);
  };

  const handleExportVisits = () => {
    // Convert visits to CSV format
    const csvHeaders = [
      'Patient Name', 'Patient ID', 'Visit Type', 'Status', 
      'Scheduled Date', 'Provider', 'Department', 'Priority', 
      'Chief Complaint', 'Duration', 'Has Transcript', 'Has AI Analysis'
    ];
    
    const csvData = filteredVisits.map(visit => [
      visit.patientName,
      visit.patientId,
      visit.type.replace('_', ' '),
      visit.status,
      format(visit.scheduledDateTime, 'yyyy-MM-dd HH:mm'),
      visit.attendingProvider,
      visit.department,
      visit.priority,
      visit.chiefComplaint || '',
      visit.duration || '',
      visit.hasTranscript ? 'Yes' : 'No',
      visit.hasAiAnalysis ? 'Yes' : 'No'
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `visits_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleScheduleVisit = () => {
    setScheduleDialogOpen(true);
  };

  const handleSaveNewVisit = async () => {
    if (!newVisit.patientName || !newVisit.patientId || !newVisit.attendingProvider) {
      alert('Please fill in all required fields');
      return;
    }

    setIsUpdating(true);
    try {
      // Create new visit record
      const visitToAdd: VisitRecord = {
        ...newVisit,
        id: 'V' + Date.now(), // Generate temporary ID
        patientName: newVisit.patientName!,
        patientId: newVisit.patientId!,
        patientAge: newVisit.patientAge || 0,
        patientGender: newVisit.patientGender || 'prefer-not-to-say',
        attendingProvider: newVisit.attendingProvider!,
        department: newVisit.department!,
        type: newVisit.type as VisitRecord['type'],
        status: newVisit.status as VisitRecord['status'],
        priority: newVisit.priority as VisitRecord['priority'],
        scheduledDateTime: newVisit.scheduledDateTime!,
        hasTranscript: false,
        hasAiAnalysis: false,
        hasVisitNotes: false,
        transcriptProcessingStatus: 'pending',
        aiAnalysisStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // TODO: Save to Firestore
      // await addVisitToFirestore(visitToAdd);

      // Update local state
      setVisits(prev => [visitToAdd, ...prev]);
      
      setScheduleDialogOpen(false);
      setNewVisit({
        type: 'consultation',
        status: 'scheduled',
        priority: 'medium',
        department: 'General Medicine',
        attendingProvider: '',
        scheduledDateTime: new Date(),
        chiefComplaint: '',
        hasTranscript: false,
        hasAiAnalysis: false,
        hasVisitNotes: false,
        transcriptProcessingStatus: 'pending',
        aiAnalysisStatus: 'pending'
      });

      console.log('Visit scheduled successfully');
    } catch (error) {
      console.error('Error scheduling visit:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelSchedule = () => {
    setScheduleDialogOpen(false);
    setNewVisit({
      type: 'consultation',
      status: 'scheduled',
      priority: 'medium',
      department: 'General Medicine',
      attendingProvider: '',
      scheduledDateTime: new Date(),
      chiefComplaint: '',
      hasTranscript: false,
      hasAiAnalysis: false,
      hasVisitNotes: false,
      transcriptProcessingStatus: 'pending',
      aiAnalysisStatus: 'pending'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'scheduled':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent_care':
        return 'error';
      case 'telemedicine':
        return 'info';
      case 'follow_up':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const uniqueDepartments = [...new Set(visits.map(v => v.department))];
  const uniqueTypes = [...new Set(visits.map(v => v.type))];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Visit Management
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <TextField
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
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant={selectedStatus !== 'all' || selectedType !== 'all' || selectedDepartment !== 'all' ? 'contained' : 'outlined'}
              startIcon={<FilterIcon />}
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              color={selectedStatus !== 'all' || selectedType !== 'all' || selectedDepartment !== 'all' ? 'primary' : 'inherit'}
            >
              Filter {(selectedStatus !== 'all' || selectedType !== 'all' || selectedDepartment !== 'all') && '(Active)'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportVisits}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleScheduleVisit}
            >
              Schedule Visit
            </Button>
          </Stack>

          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={() => setFilterAnchorEl(null)}
          >
            <MenuItem onClick={() => { setSelectedStatus('all'); setFilterAnchorEl(null); }}>
              All Status {selectedStatus === 'all' && '✓'}
            </MenuItem>
            <MenuItem onClick={() => { setSelectedStatus('scheduled'); setFilterAnchorEl(null); }}>
              Scheduled {selectedStatus === 'scheduled' && '✓'}
            </MenuItem>
            <MenuItem onClick={() => { setSelectedStatus('in_progress'); setFilterAnchorEl(null); }}>
              In Progress {selectedStatus === 'in_progress' && '✓'}
            </MenuItem>
            <MenuItem onClick={() => { setSelectedStatus('completed'); setFilterAnchorEl(null); }}>
              Completed {selectedStatus === 'completed' && '✓'}
            </MenuItem>
            <MenuItem onClick={() => { setSelectedStatus('cancelled'); setFilterAnchorEl(null); }}>
              Cancelled {selectedStatus === 'cancelled' && '✓'}
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setSelectedType('all'); setFilterAnchorEl(null); }}>
              All Types {selectedType === 'all' && '✓'}
            </MenuItem>
            {uniqueTypes.map(type => (
              <MenuItem key={type} onClick={() => { setSelectedType(type); setFilterAnchorEl(null); }}>
                {type.replace('_', ' ').toUpperCase()} {selectedType === type && '✓'}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem onClick={() => { setSelectedDepartment('all'); setFilterAnchorEl(null); }}>
              All Departments {selectedDepartment === 'all' && '✓'}
            </MenuItem>
            {uniqueDepartments.map(dept => (
              <MenuItem key={dept} onClick={() => { setSelectedDepartment(dept); setFilterAnchorEl(null); }}>
                {dept} {selectedDepartment === dept && '✓'}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem onClick={() => { 
              setSelectedStatus('all'); 
              setSelectedType('all'); 
              setSelectedDepartment('all'); 
              setFilterAnchorEl(null); 
            }}>
              Clear All Filters
            </MenuItem>
          </Menu>

          {/* Active Filters */}
          {(selectedStatus !== 'all' || selectedType !== 'all' || selectedDepartment !== 'all') && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Active Filters:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {selectedStatus !== 'all' && (
                  <Chip
                    label={`Status: ${selectedStatus.replace('_', ' ')}`}
                    onDelete={() => setSelectedStatus('all')}
                    size="small"
                    color="primary"
                  />
                )}
                {selectedType !== 'all' && (
                  <Chip
                    label={`Type: ${selectedType.replace('_', ' ')}`}
                    onDelete={() => setSelectedType('all')}
                    size="small"
                    color="primary"
                  />
                )}
                {selectedDepartment !== 'all' && (
                  <Chip
                    label={`Department: ${selectedDepartment}`}
                    onDelete={() => setSelectedDepartment('all')}
                    size="small"
                    color="primary"
                  />
                )}
              </Stack>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary">
            Showing {paginatedVisits.length} of {filteredVisits.length} visits
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'patientName'}
                    direction={orderBy === 'patientName' ? order : 'asc'}
                    onClick={() => handleSort('patientName')}
                  >
                    Patient
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'type'}
                    direction={orderBy === 'type' ? order : 'asc'}
                    onClick={() => handleSort('type')}
                  >
                    Type
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'scheduledDateTime'}
                    direction={orderBy === 'scheduledDateTime' ? order : 'asc'}
                    onClick={() => handleSort('scheduledDateTime')}
                  >
                    Scheduled
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'attendingProvider'}
                    direction={orderBy === 'attendingProvider' ? order : 'asc'}
                    onClick={() => handleSort('attendingProvider')}
                  >
                    Provider
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'department'}
                    direction={orderBy === 'department' ? order : 'asc'}
                    onClick={() => handleSort('department')}
                  >
                    Department
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'priority'}
                    direction={orderBy === 'priority' ? order : 'asc'}
                    onClick={() => handleSort('priority')}
                  >
                    Priority
                  </TableSortLabel>
                </TableCell>
                <TableCell>Documents</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedVisits.map((visit) => (
                <TableRow key={visit.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {visit.patientName.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {visit.patientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {visit.patientId} • {visit.patientAge}y • {visit.patientGender}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={visit.type.replace('_', ' ').toUpperCase()}
                      color={getTypeColor(visit.type) as any}
                      size="small"
                      icon={visit.type === 'telemedicine' ? <VideoCallIcon /> : 
                            visit.type === 'urgent_care' ? <WarningIcon /> : 
                            visit.type === 'follow_up' ? <AssessmentIcon /> : 
                            <HospitalIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={visit.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(visit.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2">
                          {format(visit.scheduledDateTime, 'MMM dd, yyyy')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(visit.scheduledDateTime, 'h:mm a')}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {visit.attendingProvider}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {visit.department}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={visit.priority.toUpperCase()}
                      color={getPriorityColor(visit.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Badge
                        color={visit.hasTranscript ? 'success' : 'default'}
                        variant="dot"
                      >
                        <TranscriptIcon fontSize="small" />
                      </Badge>
                      <Badge
                        color={visit.hasAiAnalysis ? 'success' : 'default'}
                        variant="dot"
                      >
                        <PsychologyIcon fontSize="small" />
                      </Badge>
                      <Badge
                        color={visit.hasVisitNotes ? 'success' : 'default'}
                        variant="dot"
                      >
                        <DescriptionIcon fontSize="small" />
                      </Badge>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View details">
                        <IconButton
                          onClick={() => handleViewDetails(visit)}
                          color="primary"
                          size="small"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit visit">
                        <IconButton
                          onClick={() => handleEditVisit(visit)}
                          color="secondary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {!visit.hasTranscript && visit.status === 'completed' && (
                        <Tooltip title="Upload transcript">
                          <IconButton
                            color="info"
                            size="small"
                            onClick={() => navigate(ROUTES.TRANSCRIPT_UPLOAD.replace(':id', visit.id))}
                          >
                            <UploadIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredVisits.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {selectedVisit && (
        <VisitDetails
          open={visitDetailsOpen}
          onClose={() => setVisitDetailsOpen(false)}
          visit={selectedVisit}
        />
      )}

      {/* Edit Visit Dialog */}
      {editVisit && (
        <Dialog 
          open={editDialogOpen} 
          onClose={handleCancelEdit}
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EditIcon />
              Edit Visit - {editVisit.patientName}
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Visit Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Visit Type</InputLabel>
                  <Select
                    value={editVisit.type}
                    onChange={(e) => setEditVisit(prev => prev ? {
                      ...prev,
                      type: e.target.value as VisitRecord['type']
                    } : null)}
                    label="Visit Type"
                  >
                    <MenuItem value="consultation">Consultation</MenuItem>
                    <MenuItem value="follow_up">Follow-up</MenuItem>
                    <MenuItem value="urgent_care">Urgent Care</MenuItem>
                    <MenuItem value="telemedicine">Telemedicine</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editVisit.status}
                    onChange={(e) => setEditVisit(prev => prev ? {
                      ...prev,
                      status: e.target.value as VisitRecord['status']
                    } : null)}
                    label="Status"
                  >
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={editVisit.priority}
                    onChange={(e) => setEditVisit(prev => prev ? {
                      ...prev,
                      priority: e.target.value as VisitRecord['priority']
                    } : null)}
                    label="Priority"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={editVisit.department}
                  onChange={(e) => setEditVisit(prev => prev ? {
                    ...prev,
                    department: e.target.value
                  } : null)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Attending Provider"
                  value={editVisit.attendingProvider}
                  onChange={(e) => setEditVisit(prev => prev ? {
                    ...prev,
                    attendingProvider: e.target.value
                  } : null)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Scheduled Date & Time"
                  type="datetime-local"
                  value={editVisit.scheduledDateTime.toISOString().slice(0, 16)}
                  onChange={(e) => setEditVisit(prev => prev ? {
                    ...prev,
                    scheduledDateTime: new Date(e.target.value)
                  } : null)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {/* Clinical Information */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Clinical Information
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Chief Complaint"
                  multiline
                  rows={2}
                  value={editVisit.chiefComplaint || ''}
                  onChange={(e) => setEditVisit(prev => prev ? {
                    ...prev,
                    chiefComplaint: e.target.value
                  } : null)}
                  placeholder="Patient's primary concern or reason for visit..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Visit Summary"
                  multiline
                  rows={3}
                  value={editVisit.visitSummary || ''}
                  onChange={(e) => setEditVisit(prev => prev ? {
                    ...prev,
                    visitSummary: e.target.value
                  } : null)}
                  placeholder="Brief summary of the visit, findings, and decisions..."
                />
              </Grid>

              {/* Duration for completed visits */}
              {editVisit.status === 'completed' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Duration (minutes)"
                    type="number"
                    value={editVisit.duration || ''}
                    onChange={(e) => setEditVisit(prev => prev ? {
                      ...prev,
                      duration: parseInt(e.target.value) || undefined
                    } : null)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">min</InputAdornment>,
                    }}
                  />
                </Grid>
              )}

              {/* Metadata */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Created:</strong> {format(editVisit.createdAt, 'PPp')}
                  <br />
                  <strong>Last Updated:</strong> {format(editVisit.updatedAt, 'PPp')}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleCancelEdit}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveVisit}
              variant="contained"
              disabled={isUpdating}
              startIcon={isUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Schedule Visit Dialog */}
      <Dialog 
        open={scheduleDialogOpen} 
        onClose={handleCancelSchedule}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AddIcon />
            Schedule New Visit
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Patient Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Patient Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Patient Name"
                value={newVisit.patientName || ''}
                onChange={(e) => setNewVisit(prev => ({
                  ...prev,
                  patientName: e.target.value
                }))}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Patient ID"
                value={newVisit.patientId || ''}
                onChange={(e) => setNewVisit(prev => ({
                  ...prev,
                  patientId: e.target.value
                }))}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Patient Age"
                type="number"
                value={newVisit.patientAge || ''}
                onChange={(e) => setNewVisit(prev => ({
                  ...prev,
                  patientAge: parseInt(e.target.value) || 0
                }))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={newVisit.patientGender || 'prefer-not-to-say'}
                  onChange={(e) => setNewVisit(prev => ({
                    ...prev,
                    patientGender: e.target.value as VisitRecord['patientGender']
                  }))}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Visit Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Visit Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Visit Type</InputLabel>
                <Select
                  value={newVisit.type || 'consultation'}
                  onChange={(e) => setNewVisit(prev => ({
                    ...prev,
                    type: e.target.value as VisitRecord['type']
                  }))}
                  label="Visit Type"
                >
                  <MenuItem value="consultation">Consultation</MenuItem>
                  <MenuItem value="follow_up">Follow-up</MenuItem>
                  <MenuItem value="urgent_care">Urgent Care</MenuItem>
                  <MenuItem value="telemedicine">Telemedicine</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newVisit.priority || 'medium'}
                  onChange={(e) => setNewVisit(prev => ({
                    ...prev,
                    priority: e.target.value as VisitRecord['priority']
                  }))}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                value={newVisit.department || ''}
                onChange={(e) => setNewVisit(prev => ({
                  ...prev,
                  department: e.target.value
                }))}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Attending Provider"
                value={newVisit.attendingProvider || ''}
                onChange={(e) => setNewVisit(prev => ({
                  ...prev,
                  attendingProvider: e.target.value
                }))}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Scheduled Date & Time"
                type="datetime-local"
                value={newVisit.scheduledDateTime ? 
                  newVisit.scheduledDateTime.toISOString().slice(0, 16) : 
                  new Date().toISOString().slice(0, 16)
                }
                onChange={(e) => setNewVisit(prev => ({
                  ...prev,
                  scheduledDateTime: new Date(e.target.value)
                }))}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Chief Complaint"
                multiline
                rows={3}
                value={newVisit.chiefComplaint || ''}
                onChange={(e) => setNewVisit(prev => ({
                  ...prev,
                  chiefComplaint: e.target.value
                }))}
                placeholder="Patient's primary concern or reason for visit..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCancelSchedule}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveNewVisit}
            variant="contained"
            disabled={isUpdating}
            startIcon={isUpdating ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {isUpdating ? 'Scheduling...' : 'Schedule Visit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 