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
  Upload as UploadIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { ROUTES } from '@/constants';
import { mockVisits, Visit } from '@/data/mockData';

export const Transcripts: React.FC = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

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

  const handleViewTranscript = (visitId: string) => {
    navigate(ROUTES.TRANSCRIPT_UPLOAD.replace(':id', visitId));
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
        Manage and view transcripts for all visits
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
                      <Tooltip title="View Transcript">
                        <IconButton
                          size="small"
                          onClick={() => handleViewTranscript(visit.id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
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
    </Box>
  );
};

export default Transcripts; 