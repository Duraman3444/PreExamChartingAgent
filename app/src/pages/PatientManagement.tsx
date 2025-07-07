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
} from '@mui/icons-material';
import { format } from 'date-fns';

// Extended patient interface for the management view
interface PatientRecord {
  id: string;
  firstName: string;
  lastName: string;
  patientId: string;
  caseNumber: string;
  dateIncharged: Date;
  dateDischarged: Date | null;
  status: 'active' | 'discharged' | 'transferred';
  department: string;
  attendingProvider: string;
  documents: {
    symptoms: boolean;
    diagnosis: boolean;
    visitTranscripts: boolean;
    aiAnalysis: boolean;
    visitNotes: boolean;
  };
  lastVisitDate: Date;
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  phoneNumber?: string;
}

// Mock data for demonstration
const mockPatientData: PatientRecord[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    patientId: 'P001',
    caseNumber: 'CS-2024-001',
    dateIncharged: new Date('2024-01-15'),
    dateDischarged: new Date('2024-01-20'),
    status: 'discharged',
    department: 'Emergency',
    attendingProvider: 'Dr. Smith',
    documents: {
      symptoms: true,
      diagnosis: true,
      visitTranscripts: true,
      aiAnalysis: true,
      visitNotes: true,
    },
    lastVisitDate: new Date('2024-01-20'),
    age: 45,
    gender: 'male',
    phoneNumber: '555-0123',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    patientId: 'P002',
    caseNumber: 'CS-2024-002',
    dateIncharged: new Date('2024-01-18'),
    dateDischarged: null,
    status: 'active',
    department: 'Cardiology',
    attendingProvider: 'Dr. Johnson',
    documents: {
      symptoms: true,
      diagnosis: true,
      visitTranscripts: true,
      aiAnalysis: false,
      visitNotes: false,
    },
    lastVisitDate: new Date('2024-01-18'),
    age: 62,
    gender: 'female',
    phoneNumber: '555-0456',
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Brown',
    patientId: 'P003',
    caseNumber: 'CS-2024-003',
    dateIncharged: new Date('2024-01-20'),
    dateDischarged: null,
    status: 'active',
    department: 'Internal Medicine',
    attendingProvider: 'Dr. Davis',
    documents: {
      symptoms: true,
      diagnosis: false,
      visitTranscripts: true,
      aiAnalysis: true,
      visitNotes: false,
    },
    lastVisitDate: new Date('2024-01-20'),
    age: 38,
    gender: 'male',
    phoneNumber: '555-0789',
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Wilson',
    patientId: 'P004',
    caseNumber: 'CS-2024-004',
    dateIncharged: new Date('2024-01-16'),
    dateDischarged: new Date('2024-01-22'),
    status: 'discharged',
    department: 'Neurology',
    attendingProvider: 'Dr. Thompson',
    documents: {
      symptoms: true,
      diagnosis: true,
      visitTranscripts: true,
      aiAnalysis: true,
      visitNotes: true,
    },
    lastVisitDate: new Date('2024-01-22'),
    age: 29,
    gender: 'female',
    phoneNumber: '555-0321',
  },
];

interface DocumentViewerProps {
  open: boolean;
  onClose: () => void;
  patient: PatientRecord;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ open, onClose, patient }) => {
  const documentTypes = [
    { key: 'symptoms', label: 'Symptoms Record', icon: <HospitalIcon />, available: patient.documents.symptoms },
    { key: 'diagnosis', label: 'Diagnosis Report', icon: <AssessmentIcon />, available: patient.documents.diagnosis },
    { key: 'visitTranscripts', label: 'Visit Transcripts', icon: <TranscriptIcon />, available: patient.documents.visitTranscripts },
    { key: 'aiAnalysis', label: 'AI Analysis', icon: <PsychologyIcon />, available: patient.documents.aiAnalysis },
    { key: 'visitNotes', label: 'Visit Notes', icon: <DescriptionIcon />, available: patient.documents.visitNotes },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">
              {patient.firstName} {patient.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Patient ID: {patient.patientId} | Case: {patient.caseNumber}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Department</Typography>
            <Typography variant="body1">{patient.department}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Attending Provider</Typography>
            <Typography variant="body1">{patient.attendingProvider}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Date Incharged</Typography>
            <Typography variant="body1">{format(patient.dateIncharged, 'MMM dd, yyyy')}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Date Discharged</Typography>
            <Typography variant="body1">
              {patient.dateDischarged ? format(patient.dateDischarged, 'MMM dd, yyyy') : 'Still Active'}
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>Available Documents</Typography>
        <List>
          {documentTypes.map((doc) => (
            <ListItem key={doc.key}>
              <ListItemIcon>
                {doc.icon}
              </ListItemIcon>
              <ListItemText
                primary={doc.label}
                secondary={doc.available ? 'Available' : 'Not available'}
              />
              <Button
                variant={doc.available ? 'contained' : 'outlined'}
                disabled={!doc.available}
                size="small"
                startIcon={<VisibilityIcon />}
              >
                View
              </Button>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export const PatientManagement: React.FC = () => {
  const theme = useTheme();
  const [patients, setPatients] = useState<PatientRecord[]>(mockPatientData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof PatientRecord>('lastVisitDate');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and search logic
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = 
        patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.caseNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || patient.status === selectedStatus;
      const matchesDepartment = selectedDepartment === 'all' || patient.department === selectedDepartment;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [patients, searchTerm, selectedStatus, selectedDepartment]);

  // Sort logic
  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort((a, b) => {
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
  }, [filteredPatients, orderBy, order]);

  // Pagination
  const paginatedPatients = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedPatients.slice(start, start + rowsPerPage);
  }, [sortedPatients, page, rowsPerPage]);

  const handleSort = (property: keyof PatientRecord) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleViewDocuments = (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setDocumentViewerOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'discharged':
        return 'primary';
      case 'transferred':
        return 'warning';
      default:
        return 'default';
    }
  };

  const uniqueDepartments = [...new Set(patients.map(p => p.department))];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Patient Management
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <TextField
              placeholder="Search patients..."
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
              Add Patient
            </Button>
          </Stack>

          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={() => setFilterAnchorEl(null)}
          >
            <MenuItem onClick={() => setSelectedStatus('all')}>All Status</MenuItem>
            <MenuItem onClick={() => setSelectedStatus('active')}>Active</MenuItem>
            <MenuItem onClick={() => setSelectedStatus('discharged')}>Discharged</MenuItem>
            <MenuItem onClick={() => setSelectedStatus('transferred')}>Transferred</MenuItem>
            <Divider />
            <MenuItem onClick={() => setSelectedDepartment('all')}>All Departments</MenuItem>
            {uniqueDepartments.map(dept => (
              <MenuItem key={dept} onClick={() => setSelectedDepartment(dept)}>
                {dept}
              </MenuItem>
            ))}
          </Menu>

          <Typography variant="body2" color="text.secondary">
            Showing {paginatedPatients.length} of {filteredPatients.length} patients
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
                    active={orderBy === 'firstName'}
                    direction={orderBy === 'firstName' ? order : 'asc'}
                    onClick={() => handleSort('firstName')}
                  >
                    First Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'lastName'}
                    direction={orderBy === 'lastName' ? order : 'asc'}
                    onClick={() => handleSort('lastName')}
                  >
                    Last Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'patientId'}
                    direction={orderBy === 'patientId' ? order : 'asc'}
                    onClick={() => handleSort('patientId')}
                  >
                    Patient ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'caseNumber'}
                    direction={orderBy === 'caseNumber' ? order : 'asc'}
                    onClick={() => handleSort('caseNumber')}
                  >
                    Case Number
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'dateIncharged'}
                    direction={orderBy === 'dateIncharged' ? order : 'asc'}
                    onClick={() => handleSort('dateIncharged')}
                  >
                    Date Incharged
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'dateDischarged'}
                    direction={orderBy === 'dateDischarged' ? order : 'asc'}
                    onClick={() => handleSort('dateDischarged')}
                  >
                    Date Discharged
                  </TableSortLabel>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>View Documents</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPatients.map((patient) => (
                <TableRow key={patient.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {patient.firstName.charAt(0)}
                      </Avatar>
                      {patient.firstName}
                    </Box>
                  </TableCell>
                  <TableCell>{patient.lastName}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {patient.patientId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {patient.caseNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {format(patient.dateIncharged, 'MMM dd, yyyy')}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {patient.dateDischarged ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {format(patient.dateDischarged, 'MMM dd, yyyy')}
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Still Active
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                      color={getStatusColor(patient.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {patient.department}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View patient documents">
                      <IconButton
                        onClick={() => handleViewDocuments(patient)}
                        color="primary"
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPatients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {selectedPatient && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          patient={selectedPatient}
        />
      )}
    </Box>
  );
}; 