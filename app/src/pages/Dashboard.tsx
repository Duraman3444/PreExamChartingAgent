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
} from '@mui/material';
import {
  People,
  RecordVoiceOver,
  Psychology,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/stores/authStore';

const statsCards = [
  {
    title: 'Active Patients',
    value: '156',
    icon: <People />,
    color: '#1976d2',
  },
  {
    title: 'Pending Transcripts',
    value: '12',
    icon: <RecordVoiceOver />,
    color: '#dc004e',
  },
  {
    title: 'AI Analysis Complete',
    value: '34',
    icon: <Psychology />,
    color: '#2e7d32',
  },
  {
    title: 'Analysis Accuracy',
    value: '92%',
    icon: <TrendingUp />,
    color: '#ed6c02',
  },
];

const recentActivities = [
  { id: '1', action: 'AI analysis completed for John Doe visit', time: '2 hours ago', status: 'completed' },
  { id: '2', action: 'Transcript uploaded for Jane Smith consultation', time: '4 hours ago', status: 'processing' },
  { id: '3', action: 'Visit notes generated for Mike Johnson', time: '6 hours ago', status: 'completed' },
  { id: '4', action: 'Diagnosis recommendations reviewed for Sarah Wilson', time: '8 hours ago', status: 'reviewed' },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Welcome back, {user?.name}! Here's your visit transcript analysis overview.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
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
                  <Typography variant="h6" component="div">
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
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
                >
                  Manage Patients
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate(ROUTES.VISITS)}
                  startIcon={<RecordVoiceOver />}
                >
                  View Visits
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate(ROUTES.VISITS)}
                  startIcon={<Psychology />}
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