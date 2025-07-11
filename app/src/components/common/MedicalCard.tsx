import React from 'react';
import { Box, Card, CardContent, Typography, IconButton, alpha } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface MedicalCardProps {
  variant?: 'default' | 'blue' | 'purple' | 'glass';
  title?: string;
  subtitle?: string;
  content?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const getCardStyles = (variant: string) => {
  switch (variant) {
    case 'blue':
      return {
        background: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
        color: 'white',
        border: 'none',
      };
    case 'purple':
      return {
        background: 'linear-gradient(135deg, #6C5BD4 0%, #8A7CE8 100%)',
        color: 'white',
        border: 'none',
      };
    case 'glass':
      return {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'inherit',
      };
    default:
      return {
        background: 'transparent',
        border: '1px solid #e0e0e0',
        color: 'inherit',
      };
  }
};

export const MedicalCard: React.FC<MedicalCardProps> = ({
  variant = 'default',
  title,
  subtitle,
  content,
  onClose,
  className,
  children,
}) => {
  const cardStyles = getCardStyles(variant);

  return (
    <Card
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        ...cardStyles,
      }}
      className={className}
    >
      {onClose && (
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'inherit',
            '&:hover': {
              backgroundColor: alpha('#000', 0.1),
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
      
      <CardContent>
        {title && (
          <Typography variant="h6" component="h2" gutterBottom>
            {title}
          </Typography>
        )}
        
        {subtitle && (
          <Typography variant="subtitle2" color="inherit" sx={{ opacity: 0.8, mb: 2 }}>
            {subtitle}
          </Typography>
        )}
        
        {content && (
          <Box sx={{ mt: 1 }}>
            {content}
          </Box>
        )}
        
        {children}
      </CardContent>
    </Card>
  );
};

// Quick usage component for blue variant
export const BlueMedicalCard: React.FC<Omit<MedicalCardProps, 'variant'>> = (props) => (
  <MedicalCard variant="blue" {...props} />
);

// Analysis Result Card Component
interface AnalysisResultCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color?: 'blue' | 'purple';
  onClick?: () => void;
}

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  color = 'blue',
  onClick,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return null;
    }
  };

  return (
    <Card
      sx={{
        p: 2,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        } : {},
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5" component="div" fontWeight="bold">
            {value} {getTrendIcon()}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box
            sx={{
              p: 1,
              borderRadius: '50%',
              backgroundColor: color === 'blue' ? '#1976D2' : '#6C5BD4',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
    </Card>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color?: 'blue' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  change,
  changeType = 'neutral',
  color = 'blue',
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return '#28a745';
      case 'negative':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  return (
    <Card sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      
      <Typography variant="h3" component="div" fontWeight="bold" color="text.primary">
        {value}
        {unit && (
          <Typography component="span" variant="h5" color="text.secondary">
            {unit}
          </Typography>
        )}
      </Typography>
      
      {change && (
        <Typography
          variant="body2"
          sx={{ 
            mt: 1,
            color: getChangeColor(),
            fontWeight: 'medium',
          }}
        >
          {change}
        </Typography>
      )}
      
      <Box
        sx={{
          mt: 2,
          height: 4,
          borderRadius: 2,
          backgroundColor: color === 'blue' ? '#1976D2' : '#6C5BD4',
        }}
      />
    </Card>
  );
}; 