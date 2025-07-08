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
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { ROUTES } from '@/constants';
import { mockVisits, Visit } from '@/data/mockData';

export const Notes: React.FC = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showNotesOnly, setShowNotesOnly] = useState(false);

  useEffect(() => {
    // Use shared mock data for consistency across all pages
    setVisits(mockVisits);
    setFilteredVisits(mockVisits);
    
    // Debug: Log the visits data
    console.log('Total visits loaded:', mockVisits.length);
    const visitsWithNotes = mockVisits.filter(v => v.hasVisitNotes);
    console.log('Visits with notes:', visitsWithNotes.length);
    console.log('Visits with notes details:', visitsWithNotes.map(v => ({
      id: v.id,
      patient: v.patientName,
      notesCount: v.notesCount,
      notesStatus: v.notesStatus
    })));
    
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
      filtered = filtered.filter(visit => visit.notesStatus === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(visit => visit.type === typeFilter);
    }

    if (showNotesOnly) {
      filtered = filtered.filter(visit => visit.hasVisitNotes);
    }

    console.log('Filtered visits count:', filtered.length);
    setFilteredVisits(filtered);
  }, [visits, searchTerm, statusFilter, typeFilter, showNotesOnly]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'success';
      case 'reviewed': return 'info';
      case 'draft': return 'warning';
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

  const handleViewNotes = (visitId: string) => {
    navigate(ROUTES.VISIT_NOTES.replace(':id', visitId));
  };

  const handleCreateNote = (visitId: string) => {
    navigate(ROUTES.VISIT_NOTES.replace(':id', visitId));
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
        Visit Notes
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage and view visit notes for all visits
      </Typography>
      
      {/* Debug Summary */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Data Summary
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Total visits: {visits.length} | 
          Filtered visits: {filteredVisits.length} | 
          Visits with notes: {visits.filter(v => v.hasVisitNotes).length}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Patients with notes:</strong> {visits.filter(v => v.hasVisitNotes).map(v => v.patientName).join(', ')}
        </Typography>
        <Button
          variant={showNotesOnly ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setShowNotesOnly(!showNotesOnly)}
        >
          {showNotesOnly ? 'Show All Visits' : 'Show Only Visits with Notes'}
        </Button>
      </Box>

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
              <InputLabel>Notes Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Notes Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="none">No Notes</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="reviewed">Reviewed</MenuItem>
                <MenuItem value="signed">Signed</MenuItem>
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
              <TableCell>Notes Count</TableCell>
              <TableCell>Notes Status</TableCell>
              <TableCell>Last Note</TableCell>
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
                <TableCell>{visit.notesCount}</TableCell>
                <TableCell>
                  <Chip
                    label={visit.notesStatus}
                    color={getStatusColor(visit.notesStatus) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {visit.lastNoteDate ? (
                    <Typography variant="body2">
                      {visit.lastNoteDate.toLocaleDateString()}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No notes
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {visit.hasVisitNotes ? (
                      <Tooltip title="View Notes">
                        <IconButton
                          size="small"
                          onClick={() => handleViewNotes(visit.id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Create Note">
                        <IconButton
                          size="small"
                          onClick={() => handleCreateNote(visit.id)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit Notes">
                      <IconButton
                        size="small"
                        onClick={() => handleViewNotes(visit.id)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
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

export default Notes; 