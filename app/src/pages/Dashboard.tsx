import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  Stack,
  useTheme,
} from '@mui/material';
import {
  People,
  RecordVoiceOver,
  Psychology,
  TrendingUp,
  VideoCall,
  LocalHospital,
  Assessment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/stores/authStore';

const statsCards = [
  {
    title: 'Active Patients',
    value: '156',
    icon: <People />,
    color: '#FF6000',
  },
  {
    title: 'Pending Transcripts',
    value: '12',
    icon: <RecordVoiceOver />,
    color: '#6C5BD4',
  },
  {
    title: 'AI Analysis Complete',
    value: '34',
    icon: <Psychology />,
    color: '#FF6000',
  },
  {
    title: 'Analysis Accuracy',
    value: '92%',
    icon: <TrendingUp />,
    color: '#6C5BD4',
  },
];

const recentActivities = [
  { id: '1', action: 'AI analysis completed for John Doe visit', time: '2 hours ago', status: 'completed' },
  { id: '2', action: 'Transcript uploaded for Jane Smith consultation', time: '4 hours ago', status: 'processing' },
  { id: '3', action: 'Visit notes generated for Mike Johnson', time: '6 hours ago', status: 'completed' },
  { id: '4', action: 'Diagnosis recommendations reviewed for Sarah Wilson', time: '8 hours ago', status: 'reviewed' },
];

const recentVisits = [
  {
    id: '1',
    date: '24 April \'23',
    type: 'Complete Blood Count (CBC)',
    doctor: 'Dr. Shimron Hetmyer',
    avatar: '/api/placeholder/40/40',
    status: 'completed',
    color: '#6C5BD4',
  },
  {
    id: '2',
    date: '31 May \'23',
    type: 'Clinic Visit Appointment',
    doctor: 'Dr. Shilpa Rao',
    avatar: '/api/placeholder/40/40',
    status: 'completed',
    color: '#FF6000',
  },
  {
    id: '3',
    date: '02 June \'23',
    type: 'Video Consultation Chat',
    doctor: 'Dr. Kartik Aryan',
    avatar: '/api/placeholder/40/40',
    status: 'video_call',
    color: '#6C5BD4',
  },
];

const medicationSchedule = [
  {
    id: '1',
    name: 'Albufin',
    dosage: '20mg',
    frequency: '1x daily',
    color: '#6C5BD4',
    days: ['Mon 20', 'Tue 21', 'Wed 22', 'Thu 23', 'Fri 24', 'Sat 25'],
    taken: [true, true, false, false, false, false],
  },
  {
    id: '2',
    name: 'Vitamin D',
    dosage: '100mg',
    frequency: '2x daily',
    color: '#6C5BD4',
    days: ['Mon 20', 'Tue 21', 'Wed 22', 'Thu 23', 'Fri 24', 'Sat 25'],
    taken: [true, true, false, false, false, false],
  },
  {
    id: '3',
    name: 'Omega 3',
    dosage: '500mg',
    frequency: '2x daily',
    color: '#6C5BD4',
    days: ['Mon 20', 'Tue 21', 'Wed 22', 'Thu 23', 'Fri 24', 'Sat 25'],
    taken: [true, true, false, false, false, false],
  },
  {
    id: '4',
    name: 'Ibuprofen',
    dosage: '75mg',
    frequency: '1x daily',
    color: '#FF6000',
    days: ['Mon 20', 'Tue 21', 'Wed 22', 'Thu 23', 'Fri 24', 'Sat 25'],
    taken: [false, false, false, false, false, false],
  },
  {
    id: '5',
    name: 'Aspirin',
    dosage: '100mg',
    frequency: '2x daily',
    color: '#6C5BD4',
    days: ['Mon 20', 'Tue 21', 'Wed 22', 'Thu 23', 'Fri 24', 'Sat 25'],
    taken: [true, true, false, false, false, false],
  },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h2" component="h1" gutterBottom sx={{ mb: 1 }}>
        Health Diagnosis Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Welcome back, {user?.displayName}! Here's your visit transcript analysis overview.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Summary Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Box
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 2,
                  p: 3,
                  color: 'white',
                  mb: 2,
                }}
              >
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  120 bpm
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <LocalHospital />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Heartbeat Monitor
                    </Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.8)">
                      NORMAL
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Reports
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Box sx={{ 
                  width: 60, 
                  height: 60, 
                  backgroundColor: theme.palette.secondary.main, 
                  borderRadius: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Assessment sx={{ color: 'white' }} />
                </Box>
                <Box sx={{ 
                  width: 60, 
                  height: 60, 
                  backgroundColor: theme.palette.primary.main, 
                  borderRadius: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Psychology sx={{ color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Medication Schedule */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Medication
              </Typography>
              <Stack spacing={2}>
                {medicationSchedule.map((med) => (
                  <Box
                    key={med.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: med.color,
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {med.name} {med.dosage}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {med.taken.slice(0, 3).map((taken, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: taken ? med.color : 'rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          {taken ? '✓' : index + 1}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Visits Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Visits
              </Typography>
              <Grid container spacing={2}>
                {recentVisits.map((visit) => (
                  <Grid item xs={12} sm={6} md={4} key={visit.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: visit.color,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {visit.date}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {visit.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {visit.doctor}
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{ width: 32, height: 32 }}
                        src={visit.avatar}
                      >
                        {visit.doctor.split(' ')[1]?.charAt(0)}
                      </Avatar>
                      {visit.status === 'video_call' && (
                        <VideoCall sx={{ color: theme.palette.secondary.main }} />
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats Cards */}
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: card.color,
                      color: 'white',
                      mr: 2,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate(ROUTES.PATIENTS)}
                  startIcon={<People />}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Manage Patients
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate(ROUTES.VISITS)}
                  startIcon={<RecordVoiceOver />}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  View Visits
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate(ROUTES.VISITS)}
                  startIcon={<Psychology />}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Review AI Analysis
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {recentActivities.map((activity) => (
                  <ListItem key={activity.id} disablePadding>
                    <ListItemText
                      primary={activity.action}
                      secondary={activity.time}
                    />
                    <Chip
                      label={activity.status}
                      color={
                        activity.status === 'completed' ? 'success' :
                        activity.status === 'reviewed' ? 'info' :
                        activity.status === 'processing' ? 'warning' : 'default'
                      }
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}; 