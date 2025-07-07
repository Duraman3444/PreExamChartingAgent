import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface MedicalCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'orange' | 'purple' | 'glass';
  sx?: SxProps<Theme>;
  className?: string;
}

export const MedicalCard: React.FC<MedicalCardProps> = ({
  children,
  variant = 'default',
  sx,
  className,
}) => {
  const getCardStyles = () => {
    switch (variant) {
      case 'orange':
        return {
          background: 'linear-gradient(135deg, #FF6000 0%, #FF8533 100%)',
          border: '1px solid rgba(255, 96, 0, 0.3)',
          color: '#FFFFFF',
          '&:hover': {
            boxShadow: '0 12px 40px rgba(255, 96, 0, 0.3)',
          },
        };
      case 'purple':
        return {
          background: 'linear-gradient(135deg, #6C5BD4 0%, #8A7CE8 100%)',
          border: '1px solid rgba(108, 91, 212, 0.3)',
          color: '#FFFFFF',
          '&:hover': {
            boxShadow: '0 12px 40px rgba(108, 91, 212, 0.3)',
          },
        };
      case 'glass':
        return {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.08)',
          },
        };
      default:
        return {
          background: 'rgba(45, 45, 45, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        };
    }
  };

  return (
    <Card
      className={className}
      sx={{
        ...getCardStyles(),
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          ...getCardStyles()['&:hover'],
        },
        ...sx,
      }}
    >
      {children}
    </Card>
  );
};

interface HeartbeatCardProps {
  bpm: number;
  status: 'normal' | 'warning' | 'critical';
  className?: string;
}

export const HeartbeatCard: React.FC<HeartbeatCardProps> = ({
  bpm,
  status,
  className,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'warning':
        return '#FF9800';
      case 'critical':
        return '#F44336';
      default:
        return '#4CAF50';
    }
  };

  return (
    <MedicalCard variant="orange" className={className}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {bpm} bpm
            </Typography>
            {/* SVG Heartbeat Line */}
            <Box
              sx={{
                width: '100%',
                height: 60,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <svg width="200" height="40" viewBox="0 0 200 40">
                <path
                  d="M0,20 L40,20 L50,5 L60,35 L70,10 L80,30 L90,20 L200,20"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.8"
                />
              </svg>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
              }}
            >
              <Box
                className="heartbeat"
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                }}
              />
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              Heartbeat Monitor
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: getStatusColor(),
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {status}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </MedicalCard>
  );
};

interface MedicationCardProps {
  name: string;
  dosage: string;
  frequency: string;
  color: 'orange' | 'purple';
  taken: boolean;
  className?: string;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  name,
  dosage,
  frequency,
  color,
  taken,
  className,
}) => {
  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: 2,
        background: taken ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.05)',
        border: `1px solid ${taken ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          background: taken ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 255, 255, 0.08)',
        },
      }}
    >
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: color === 'orange' ? '#FF6000' : '#6C5BD4',
          flexShrink: 0,
        }}
      />
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {dosage} • {frequency}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: taken ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: taken ? '#66BB6A' : 'rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        {taken && (
          <Box
            sx={{
              width: 12,
              height: 12,
              backgroundColor: 'white',
              borderRadius: '50%',
            }}
          />
        )}
      </Box>
    </Box>
  );
};

interface VisitCardProps {
  date: string;
  type: string;
  doctor: string;
  avatar?: string;
  status: 'completed' | 'upcoming' | 'video_call';
  color: 'orange' | 'purple';
  className?: string;
}

export const VisitCard: React.FC<VisitCardProps> = ({
  date,
  type,
  doctor,
  // avatar,
  status,
  color,
  className,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'video_call':
        return (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#6C5BD4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.2rem',
            }}
          >
            📹
          </Box>
        );
      case 'upcoming':
        return (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#FF6000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.2rem',
            }}
          >
            📅
          </Box>
        );
      default:
        return (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: color === 'orange' ? '#FF6000' : '#6C5BD4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.2rem',
            }}
          >
            🩺
          </Box>
        );
    }
  };

  return (
    <MedicalCard variant="glass" className={className}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {getStatusIcon()}
          <Typography variant="caption" color="text.secondary">
            {date}
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {type}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#6C5BD4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {doctor.split(' ').map(n => n[0]).join('')}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {doctor}
          </Typography>
        </Box>
      </CardContent>
    </MedicalCard>
  );
}; 