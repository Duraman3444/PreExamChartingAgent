import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link,
  Chip,
} from '@mui/material';
import {
  Home as HomeIcon,
  Mic as MicIcon,
  KeyboardArrowRight as ArrowRightIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { RealTimeRecording } from '@/components/common/RealTimeRecording';
import { useAppStore } from '@/stores/appStore';
import { ROUTES } from '@/constants';
import { Patient } from '@/types';

export const Transcribe: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { addNotification } = useAppStore();
  
  // State for notifications
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    show: boolean;
  }>({ message: '', type: 'info', show: false });

  // Mock available patients - in production, this would come from your patient store
  const availablePatients: Patient[] = []; // Add your patient data here

  const handleRecordingComplete = (session: any) => {
    console.log('Recording session completed:', session);
    addNotification({
      type: 'success',
      title: 'Recording Complete',
      message: 'Your medical recording has been successfully processed and analyzed.',
    });
    
    setNotification({
      message: 'Recording session completed successfully! Check your visit management for the processed transcript.',
      type: 'success',
      show: true,
    });
  };

  const handleRecordingError = (error: string) => {
    console.error('Recording error:', error);
    addNotification({
      type: 'error',
      title: 'Recording Error',
      message: error,
    });
    
    setNotification({
      message: `Recording error: ${error}`,
      type: 'error',
      show: true,
    });
  };

  const handlePatientCreated = (patient: Patient) => {
    console.log('Patient created:', patient);
    addNotification({
      type: 'success',
      title: 'Patient Created',
      message: `New patient ${patient.demographics.firstName} ${patient.demographics.lastName} has been added to your records.`,
    });
  };

  const handlePatientUpdated = (patient: Patient) => {
    console.log('Patient updated:', patient);
    addNotification({
      type: 'info',
      title: 'Patient Updated',
      message: `Patient ${patient.demographics.firstName} ${patient.demographics.lastName} has been updated with new information.`,
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<ArrowRightIcon fontSize="small" />} 
          sx={{ mb: 2 }}
        >
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={() => navigate(ROUTES.DASHBOARD)}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <HomeIcon fontSize="small" />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MicIcon fontSize="small" />
            Transcribe
          </Typography>
        </Breadcrumbs>

        {/* Page Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Medical Transcription
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Record patient conversations with real-time transcription and AI analysis
            </Typography>
          </Box>
          <Chip
            icon={<MicIcon />}
            label="Real-Time Recording"
            color="primary"
            variant="outlined"
            size="medium"
          />
        </Box>

        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Privacy Notice:</strong> All recordings are processed securely and comply with HIPAA regulations. 
            AI analysis helps ensure accurate transcription and extraction of relevant medical information.
          </Typography>
        </Alert>
      </Box>

      {/* Main Recording Interface */}
      <Card sx={{ 
        minHeight: '70vh',
        boxShadow: theme.shadows[2],
        borderRadius: 2,
      }}>
        <CardContent sx={{ 
          p: 0,
          '&:last-child': { pb: 0 },
          height: '100%',
        }}>
          <RealTimeRecording
            onRecordingComplete={handleRecordingComplete}
            onError={handleRecordingError}
            onPatientCreated={handlePatientCreated}
            onPatientUpdated={handlePatientUpdated}
            availablePatients={availablePatients}
            maxDuration={3600} // 1 hour max
            autoTranscribe={true} // Enable automatic transcription
            autoAnalyze={true} // Enable automatic AI analysis
          />
        </CardContent>
      </Card>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.show}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 