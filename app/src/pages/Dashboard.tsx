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
  useTheme,
  Divider,
} from '@mui/material';
import {
  People,
  RecordVoiceOver,
  Psychology,
  TrendingUp,
  VideoCall,
  Assessment,
  ChevronRight,
  CheckCircle,
  Schedule,
  LocalHospital,
  CalendarToday,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/stores/authStore';
import { mockVisits } from '@/data/mockData';
import { format } from 'date-fns';





const quickActions = [
  {
    title: 'Manage Transcripts',
    description: 'Upload and manage visit transcripts for analysis',
    icon: <RecordVoiceOver />,
    color: '#FF6000',
    route: ROUTES.VISITS,
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

  // Helper functions defined first
  const getVisitStatusColor = (status: string, type: string) => {
    switch (status) {
      case 'completed':
        return '#6C5BD4';
      case 'in_progress':
        return '#FF6000';
      case 'scheduled':
        return '#2E7D32';
      case 'cancelled':
        return '#D32F2F';
      default:
        // Color based on visit type
        switch (type) {
          case 'telemedicine':
            return '#9C27B0';
          case 'urgent_care':
            return '#FF5722';
          case 'follow_up':
            return '#795548';
          default:
            return '#FF6000';
        }
    }
  };

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
      case 'in_progress':
        return <Schedule />;
      case 'scheduled':
        return <CalendarToday />;
      case 'cancelled':
        return <Assessment />;
      default:
        return <LocalHospital />;
    }
  };

  // Calculate real-time statistics from actual data
  const totalPatients = new Set(mockVisits.map(visit => visit.patientId)).size;
  const pendingTranscripts = mockVisits.filter(visit => 
    visit.transcriptStatus === 'none' || visit.transcriptStatus === 'uploaded' || visit.transcriptStatus === 'processing'
  ).length;
  const completedAnalyses = mockVisits.filter(visit => 
    visit.analysisStatus === 'completed' || visit.analysisStatus === 'reviewed'
  ).length;
  
  // Calculate analysis accuracy from confidence scores
  const analysesWithConfidence = mockVisits.filter(visit => visit.analysisConfidence);
  const averageConfidence = analysesWithConfidence.length > 0 
    ? analysesWithConfidence.reduce((sum, visit) => sum + (visit.analysisConfidence || 0), 0) / analysesWithConfidence.length
    : 0;

  // Get recent visits from actual data, sorted by most recent first
  const recentVisitsData = mockVisits
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)
    .map(visit => ({
      id: visit.id,
      date: format(new Date(visit.scheduledDateTime), 'dd MMM yy'),
      type: visit.chiefComplaint || `${visit.type.replace('_', ' ')} Visit`,
      doctor: visit.attendingProvider,
      status: visit.status,
      color: getVisitStatusColor(visit.status, visit.type),
      patientName: visit.patientName,
      department: visit.department,
    }));

  // Generate recent activities from actual visit data
  const recentActivities = mockVisits
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4)
    .map(visit => {
      const timeDiff = Math.floor((new Date().getTime() - new Date(visit.updatedAt).getTime()) / (1000 * 60 * 60));
      const timeAgo = timeDiff < 1 ? 'Just now' : 
                      timeDiff === 1 ? '1 hour ago' : 
                      timeDiff < 24 ? `${timeDiff} hours ago` : 
                      `${Math.floor(timeDiff / 24)} days ago`;
      
      // Generate activity based on visit status and available data
      let action = '';
      let status = visit.status;
      let icon = <Assessment color="info" />;
      
      if (visit.analysisStatus === 'completed' || visit.analysisStatus === 'reviewed') {
        action = `AI analysis completed for ${visit.patientName} visit`;
        status = 'completed';
        icon = <CheckCircle color="success" />;
      } else if (visit.transcriptStatus === 'completed') {
        action = `Transcript processed for ${visit.patientName} consultation`;
        status = 'completed';
        icon = <RecordVoiceOver color="success" />;
      } else if (visit.hasVisitNotes) {
        action = `Visit notes generated for ${visit.patientName}`;
        status = 'completed';
        icon = <CheckCircle color="success" />;
             } else if (visit.transcriptStatus === 'processing') {
        action = `Transcript processing for ${visit.patientName} consultation`;
        status = 'in_progress';
        icon = <Schedule color="warning" />;
      } else {
        action = `${visit.type.replace('_', ' ')} visit completed for ${visit.patientName}`;
        status = visit.status;
        icon = <LocalHospital color="info" />;
      }
      
      return {
        id: visit.id,
        action,
        time: timeAgo,
        status,
        icon,
      };
    });

  const statsCards = [
    {
      title: 'Active Patients',
      value: totalPatients.toString(),
      icon: <People />,
      color: '#FF6000',
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'Pending Transcripts',
      value: pendingTranscripts.toString(),
      icon: <RecordVoiceOver />,
      color: '#6C5BD4',
      change: '-3%',
      trend: 'down',
    },
    {
      title: 'AI Analysis Complete',
      value: completedAnalyses.toString(),
      icon: <Psychology />,
      color: '#FF6000',
      change: '+8%',
      trend: 'up',
    },
    {
      title: 'Analysis Accuracy',
      value: `${Math.round(averageConfidence * 100)}%`,
      icon: <TrendingUp />,
      color: '#6C5BD4',
      change: '+2%',
      trend: 'up',
    },
  ];

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
                {recentVisitsData.map((visit, index) => (
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
                    {index < recentVisitsData.length - 1 && <Divider />}
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