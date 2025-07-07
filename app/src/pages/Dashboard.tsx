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
  LinearProgress,
  Divider,
  IconButton,
} from '@mui/material';
import {
  People,
  RecordVoiceOver,
  Psychology,
  TrendingUp,
  VideoCall,
  LocalHospital,
  Assessment,
  ChevronRight,
  CheckCircle,
  Schedule,
  Warning,
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
    change: '+12%',
    trend: 'up',
  },
  {
    title: 'Pending Transcripts',
    value: '12',
    icon: <RecordVoiceOver />,
    color: '#6C5BD4',
    change: '-3%',
    trend: 'down',
  },
  {
    title: 'AI Analysis Complete',
    value: '34',
    icon: <Psychology />,
    color: '#FF6000',
    change: '+8%',
    trend: 'up',
  },
  {
    title: 'Analysis Accuracy',
    value: '92%',
    icon: <TrendingUp />,
    color: '#6C5BD4',
    change: '+2%',
    trend: 'up',
  },
];

const recentActivities = [
  { 
    id: '1', 
    action: 'AI analysis completed for John Doe visit', 
    time: '2 hours ago', 
    status: 'completed',
    icon: <CheckCircle color="success" />,
  },
  { 
    id: '2', 
    action: 'Transcript uploaded for Jane Smith consultation', 
    time: '4 hours ago', 
    status: 'processing',
    icon: <Schedule color="warning" />,
  },
  { 
    id: '3', 
    action: 'Visit notes generated for Mike Johnson', 
    time: '6 hours ago', 
    status: 'completed',
    icon: <CheckCircle color="success" />,
  },
  { 
    id: '4', 
    action: 'Diagnosis recommendations reviewed for Sarah Wilson', 
    time: '8 hours ago', 
    status: 'reviewed',
    icon: <Assessment color="info" />,
  },
];

const recentVisits = [
  {
    id: '1',
    date: '24 April \'23',
    type: 'Complete Blood Count (CBC)',
    doctor: 'Dr. Shimron Hetmyer',
    status: 'completed',
    color: '#6C5BD4',
  },
  {
    id: '2',
    date: '31 May \'23',
    type: 'Clinic Visit Appointment',
    doctor: 'Dr. Shilpa Rao',
    status: 'completed',
    color: '#FF6000',
  },
  {
    id: '3',
    date: '02 June \'23',
    type: 'Video Consultation Chat',
    doctor: 'Dr. Kartik Aryan',
    status: 'video_call',
    color: '#6C5BD4',
  },
];

const quickActions = [
  {
    title: 'Upload Transcript',
    description: 'Upload new visit transcript for AI analysis',
    icon: <RecordVoiceOver />,
    color: '#FF6000',
    route: ROUTES.TRANSCRIPT_UPLOAD,
  },
  {
    title: 'View Patients',
    description: 'Manage patient records and information',
    icon: <People />,
    color: '#6C5BD4',
    route: ROUTES.PATIENTS,
  },
  {
    title: 'AI Analysis',
    description: 'Review AI-generated diagnosis and recommendations',
    icon: <Psychology />,
    color: '#FF6000',
    route: ROUTES.AI_ANALYSIS,
  },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.palette.success.main;
      case 'processing':
        return theme.palette.warning.main;
      case 'reviewed':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle />;
      case 'processing':
        return <Schedule />;
      case 'video_call':
        return <VideoCall />;
      default:
        return <Assessment />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ mb: 1 }}>
          Health Diagnosis Overview
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Welcome back, {user?.displayName || 'Doctor'}! Here's your visit transcript analysis overview.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: `${card.color}15`,
                      color: card.color,
                      mr: 2,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {card.value}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={card.change}
                    size="small"
                    sx={{
                      backgroundColor: card.trend === 'up' ? '#E8F5E8' : '#FFF3E0',
                      color: card.trend === 'up' ? '#2E7D32' : '#F57C00',
                      fontSize: '0.75rem',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Quick Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: action.color,
                          transform: 'translateY(-2px)',
                        },
                      }}
                      onClick={() => navigate(action.route)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: '50%',
                            backgroundColor: `${action.color}15`,
                            color: action.color,
                            display: 'inline-flex',
                            mb: 2,
                          }}
                        >
                          {action.icon}
                        </Box>
                        <Typography variant="h6" gutterBottom>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">
                  Recent Activities
                </Typography>
                <Button 
                  variant="text" 
                  endIcon={<ChevronRight />}
                  onClick={() => navigate(ROUTES.VISITS)}
                >
                  View All
                </Button>
              </Box>
              <List disablePadding>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0 }}>
                      <Box sx={{ mr: 2 }}>
                        {activity.icon}
                      </Box>
                      <ListItemText
                        primary={activity.action}
                        secondary={activity.time}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { fontWeight: 500 },
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption',
                        }}
                      />
                      <Chip
                        label={activity.status}
                        size="small"
                        sx={{
                          backgroundColor: `${getStatusColor(activity.status)}15`,
                          color: getStatusColor(activity.status),
                          textTransform: 'capitalize',
                        }}
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Health Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Health Summary
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">
                  Blood Pressure
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  120/80 mmHg
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">
                  Temperature
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  98.6°F
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  Oxygen Level
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  98%
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Visits */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Visits
                </Typography>
                <Button 
                  variant="text" 
                  size="small"
                  endIcon={<ChevronRight />}
                  onClick={() => navigate(ROUTES.VISITS)}
                >
                  View All
                </Button>
              </Box>
              <List disablePadding>
                {recentVisits.map((visit, index) => (
                  <React.Fragment key={visit.id}>
                    <ListItem sx={{ px: 0 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: visit.color,
                          mr: 2,
                        }}
                      >
                        {getStatusIcon(visit.status)}
                      </Avatar>
                      <ListItemText
                        primary={visit.type}
                        secondary={`${visit.doctor} • ${visit.date}`}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { fontWeight: 500 },
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption',
                        }}
                      />
                    </ListItem>
                    {index < recentVisits.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}; 