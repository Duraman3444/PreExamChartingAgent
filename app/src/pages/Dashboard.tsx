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
  Assignment,
  LocalHospital,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/stores/authStore';

const statsCards = [
  {
    title: 'Total Patients',
    value: '1,234',
    icon: <People />,
    color: '#1976d2',
  },
  {
    title: 'Pending Charts',
    value: '45',
    icon: <Assignment />,
    color: '#dc004e',
  },
  {
    title: 'Vitals Today',
    value: '89',
    icon: <LocalHospital />,
    color: '#2e7d32',
  },
  {
    title: 'Completion Rate',
    value: '94%',
    icon: <TrendingUp />,
    color: '#ed6c02',
  },
];

const recentActivities = [
  { id: '1', action: 'Chart completed for John Doe', time: '2 hours ago', status: 'completed' },
  { id: '2', action: 'Vitals recorded for Jane Smith', time: '4 hours ago', status: 'completed' },
  { id: '3', action: 'Screening started for Mike Johnson', time: '6 hours ago', status: 'pending' },
  { id: '4', action: 'Chart updated for Sarah Wilson', time: '8 hours ago', status: 'completed' },
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
        Welcome back, {user?.name}! Here's your overview for today.
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
                  View Patients
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate(ROUTES.SCREENING)}
                  startIcon={<Assignment />}
                >
                  Start Screening
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate(ROUTES.VITALS)}
                  startIcon={<LocalHospital />}
                >
                  Record Vitals
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
                      color={activity.status === 'completed' ? 'success' : 'warning'}
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