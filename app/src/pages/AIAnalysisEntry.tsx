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
} from '@mui/material';
import {
  PlayArrow as RunIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Assessment as AnalysisIcon,
} from '@mui/icons-material';
import { ROUTES } from '@/constants';

interface Visit {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  status: string;
  scheduledDateTime: Date;
  hasTranscript: boolean;
  hasAiAnalysis: boolean;
  analysisStatus: 'none' | 'pending' | 'processing' | 'completed' | 'reviewed';
  analysisConfidence?: number;
  department: string;
  provider: string;
  chiefComplaint: string;
  lastAnalysisDate?: Date;
}

export const AIAnalysisEntry: React.FC = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockVisits: Visit[] = [
      {
        id: 'V001',
        patientId: 'P001',
        patientName: 'John Doe',
        type: 'consultation',
        status: 'completed',
        scheduledDateTime: new Date('2024-01-15T09:00:00'),
        hasTranscript: true,
        hasAiAnalysis: true,
        analysisStatus: 'completed',
        analysisConfidence: 0.89,
        department: 'Cardiology',
        provider: 'Dr. Smith',
        chiefComplaint: 'Chest pain',
        lastAnalysisDate: new Date('2024-01-15T10:45:00'),
      },
      {
        id: 'V002',
        patientId: 'P002',
        patientName: 'Jane Smith',
        type: 'follow_up',
        status: 'completed',
        scheduledDateTime: new Date('2024-01-16T14:30:00'),
        hasTranscript: false,
        hasAiAnalysis: false,
        analysisStatus: 'none',
        department: 'Internal Medicine',
        provider: 'Dr. Johnson',
        chiefComplaint: 'Diabetes follow-up',
      },
      {
        id: 'V003',
        patientId: 'P003',
        patientName: 'Mike Johnson',
        type: 'urgent_care',
        status: 'completed',
        scheduledDateTime: new Date('2024-01-17T11:15:00'),
        hasTranscript: true,
        hasAiAnalysis: true,
        analysisStatus: 'processing',
        department: 'Emergency',
        provider: 'Dr. Brown',
        chiefComplaint: 'Severe headache',
        lastAnalysisDate: new Date('2024-01-17T12:30:00'),
      },
      {
        id: 'V004',
        patientId: 'P004',
        patientName: 'Sarah Wilson',
        type: 'telemedicine',
        status: 'completed',
        scheduledDateTime: new Date('2024-01-18T16:00:00'),
        hasTranscript: true,
        hasAiAnalysis: true,
        analysisStatus: 'reviewed',
        analysisConfidence: 0.92,
        department: 'Psychiatry',
        provider: 'Dr. Davis',
        chiefComplaint: 'Anxiety management',
        lastAnalysisDate: new Date('2024-01-18T17:30:00'),
      },
    ];

    setVisits(mockVisits);
    setFilteredVisits(mockVisits);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = visits;

    if (searchTerm) {
      filtered = filtered.filter(visit =>
        visit.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.provider.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(visit => visit.analysisStatus === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(visit => visit.type === typeFilter);
    }

    setFilteredVisits(filtered);
  }, [visits, searchTerm, statusFilter, typeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'reviewed': return 'info';
      case 'processing': return 'warning';
      case 'pending': return 'default';
      case 'none': return 'error';
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

  const handleViewAnalysis = (visitId: string) => {
    navigate(ROUTES.AI_ANALYSIS_DETAIL.replace(':id', visitId));
  };

  const handleRunAnalysis = (visitId: string) => {
    navigate(ROUTES.AI_ANALYSIS_DETAIL.replace(':id', visitId));
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
        AI Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View and manage AI analysis for all visits
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
              <InputLabel>Analysis Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Analysis Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="none">No Analysis</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="reviewed">Reviewed</MenuItem>
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
              <TableCell>Transcript</TableCell>
              <TableCell>Analysis Status</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell>Last Analysis</TableCell>
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
                <TableCell>{visit.provider}</TableCell>
                <TableCell>{visit.chiefComplaint}</TableCell>
                <TableCell>
                  <Chip
                    label={visit.hasTranscript ? 'Available' : 'Missing'}
                    color={visit.hasTranscript ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={visit.analysisStatus}
                    color={getStatusColor(visit.analysisStatus) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {visit.analysisConfidence ? (
                    <Typography variant="body2">
                      {Math.round(visit.analysisConfidence * 100)}%
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      N/A
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {visit.lastAnalysisDate ? (
                    <Typography variant="body2">
                      {visit.lastAnalysisDate.toLocaleDateString()}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Never
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {visit.hasAiAnalysis ? (
                      <Tooltip title="View Analysis">
                        <IconButton
                          size="small"
                          onClick={() => handleViewAnalysis(visit.id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Run Analysis">
                        <IconButton
                          size="small"
                          onClick={() => handleRunAnalysis(visit.id)}
                          disabled={!visit.hasTranscript}
                        >
                          <RunIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {visit.hasTranscript && (
                      <Tooltip title="Analysis Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewAnalysis(visit.id)}
                        >
                          <AnalysisIcon />
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
    </Box>
  );
};

export default AIAnalysisEntry; 