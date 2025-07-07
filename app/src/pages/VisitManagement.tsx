import React, { useState, useMemo } from 'react';
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
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Grid,
  Avatar,
  TableSortLabel,
  TablePagination,
  Badge,
  LinearProgress,
  Alert,
} from '@mui/material';
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
  AccessTime as TimeIcon,
  Person as PersonIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

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

// Mock data for demonstration
const mockVisitData: VisitRecord[] = [
  {
    id: '1',
    patientId: 'P001',
    patientName: 'John Doe',
    patientAge: 45,
    patientGender: 'male',
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
    priority: 'high',
    hasTranscript: true,
    hasAiAnalysis: true,
    hasVisitNotes: true,
    transcriptProcessingStatus: 'completed',
    aiAnalysisStatus: 'reviewed',
    createdAt: new Date('2024-01-15T08:30:00'),
    updatedAt: new Date('2024-01-15T10:00:00'),
  },
  {
    id: '2',
    patientId: 'P002',
    patientName: 'Jane Smith',
    patientAge: 62,
    patientGender: 'female',
    type: 'follow_up',
    status: 'in_progress',
    scheduledDateTime: new Date('2024-01-18T14:00:00'),
    startTime: new Date('2024-01-18T14:02:00'),
    attendingProvider: 'Dr. Johnson',
    department: 'Cardiology',
    chiefComplaint: 'Follow-up for hypertension',
    priority: 'medium',
    hasTranscript: false,
    hasAiAnalysis: false,
    hasVisitNotes: false,
    transcriptProcessingStatus: 'pending',
    aiAnalysisStatus: 'pending',
    createdAt: new Date('2024-01-17T10:00:00'),
    updatedAt: new Date('2024-01-18T14:02:00'),
  },
  {
    id: '3',
    patientId: 'P003',
    patientName: 'Michael Brown',
    patientAge: 38,
    patientGender: 'male',
    type: 'telemedicine',
    status: 'scheduled',
    scheduledDateTime: new Date('2024-01-20T10:30:00'),
    attendingProvider: 'Dr. Davis',
    department: 'Internal Medicine',
    chiefComplaint: 'Routine checkup',
    priority: 'low',
    hasTranscript: false,
    hasAiAnalysis: false,
    hasVisitNotes: false,
    transcriptProcessingStatus: 'pending',
    aiAnalysisStatus: 'pending',
    createdAt: new Date('2024-01-19T09:00:00'),
    updatedAt: new Date('2024-01-19T09:00:00'),
  },
  {
    id: '4',
    patientId: 'P004',
    patientName: 'Sarah Wilson',
    patientAge: 29,
    patientGender: 'female',
    type: 'urgent_care',
    status: 'completed',
    scheduledDateTime: new Date('2024-01-16T15:30:00'),
    startTime: new Date('2024-01-16T15:35:00'),
    endTime: new Date('2024-01-16T16:20:00'),
    duration: 45,
    attendingProvider: 'Dr. Thompson',
    department: 'Neurology',
    chiefComplaint: 'Severe headache with vision changes',
    visitSummary: 'Migraine with aura. Prescribed sumatriptan.',
    priority: 'urgent',
    hasTranscript: true,
    hasAiAnalysis: true,
    hasVisitNotes: true,
    transcriptProcessingStatus: 'completed',
    aiAnalysisStatus: 'completed',
    createdAt: new Date('2024-01-16T15:00:00'),
    updatedAt: new Date('2024-01-16T16:30:00'),
  },
  {
    id: '5',
    patientId: 'P005',
    patientName: 'Robert Johnson',
    patientAge: 55,
    patientGender: 'male',
    type: 'consultation',
    status: 'cancelled',
    scheduledDateTime: new Date('2024-01-19T11:00:00'),
    attendingProvider: 'Dr. Lee',
    department: 'Orthopedics',
    chiefComplaint: 'Knee pain',
    priority: 'medium',
    hasTranscript: false,
    hasAiAnalysis: false,
    hasVisitNotes: false,
    transcriptProcessingStatus: 'pending',
    aiAnalysisStatus: 'pending',
    createdAt: new Date('2024-01-18T14:00:00'),
    updatedAt: new Date('2024-01-19T10:30:00'),
  },
];

interface VisitDetailsProps {
  open: boolean;
  onClose: () => void;
  visit: VisitRecord;
}

const VisitDetails: React.FC<VisitDetailsProps> = ({ open, onClose, visit }) => {
  const navigate = useNavigate();
  
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
  const theme = useTheme();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<VisitRecord[]>(mockVisitData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedVisit, setSelectedVisit] = useState<VisitRecord | null>(null);
  const [visitDetailsOpen, setVisitDetailsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof VisitRecord>('scheduledDateTime');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

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
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
            >
              Schedule Visit
            </Button>
          </Stack>

          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={() => setFilterAnchorEl(null)}
          >
            <MenuItem onClick={() => setSelectedStatus('all')}>All Status</MenuItem>
            <MenuItem onClick={() => setSelectedStatus('scheduled')}>Scheduled</MenuItem>
            <MenuItem onClick={() => setSelectedStatus('in_progress')}>In Progress</MenuItem>
            <MenuItem onClick={() => setSelectedStatus('completed')}>Completed</MenuItem>
            <MenuItem onClick={() => setSelectedStatus('cancelled')}>Cancelled</MenuItem>
            <Divider />
            <MenuItem onClick={() => setSelectedType('all')}>All Types</MenuItem>
            {uniqueTypes.map(type => (
              <MenuItem key={type} onClick={() => setSelectedType(type)}>
                {type.replace('_', ' ').toUpperCase()}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem onClick={() => setSelectedDepartment('all')}>All Departments</MenuItem>
            {uniqueDepartments.map(dept => (
              <MenuItem key={dept} onClick={() => setSelectedDepartment(dept)}>
                {dept}
              </MenuItem>
            ))}
          </Menu>

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
          onPageChange={(event, newPage) => setPage(newPage)}
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
    </Box>
  );
}; 