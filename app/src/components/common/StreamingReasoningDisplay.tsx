import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  Chip,
  Fade,
  CircularProgress,
  Stack,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Psychology,
  Visibility,
  VisibilityOff,
  Speed,
  Timer,
  AutoAwesome,
  MedicalServices,
  Science
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { ReasoningStep } from '../../services/openai';

interface StreamingReasoningDisplayProps {
  isStreaming: boolean;
  reasoningSteps: ReasoningStep[];
  currentStep?: ReasoningStep;
  streamingStatus: 'connecting' | 'connected' | 'analyzing' | 'complete' | 'error';
  error?: string;
  modelUsed?: string;
  totalProcessingTime?: number;
  onToggleVisibility?: () => void;
}

const StreamingReasoningDisplay: React.FC<StreamingReasoningDisplayProps> = ({
  isStreaming,
  reasoningSteps,
  currentStep,
  streamingStatus,
  error,
  modelUsed = 'O1',
  totalProcessingTime = 0,
  onToggleVisibility,
}) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [processingTime, setProcessingTime] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content appears
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [reasoningSteps]);

  // Update processing time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming) {
      interval = setInterval(() => {
        setProcessingTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStreaming]);

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'preparation':
        return <AutoAwesome color="primary" />;
      case 'analysis':
        return <Science color="info" />;
      case 'reasoning':
      case 'thinking':
        return <Psychology color="secondary" />;
      case 'symptoms':
        return <MedicalServices color="warning" />;
      case 'diagnosis':
        return <Psychology color="error" />;
      case 'treatment':
        return <MedicalServices color="success" />;
      case 'risk':
        return <AutoAwesome color="warning" />;
      default:
        return <Psychology color="primary" />;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'preparation':
        return 'primary';
      case 'analysis':
        return 'info';
      case 'reasoning':
      case 'thinking':
        return 'secondary';
      case 'symptoms':
        return 'warning';
      case 'diagnosis':
        return 'error';
      case 'treatment':
        return 'success';
      case 'risk':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    if (onToggleVisibility) {
      onToggleVisibility();
    }
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Streaming Error:</strong> {error}
        </Typography>
      </Alert>
    );
  }

  return (
    <Card sx={{ mb: 2, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Psychology color="primary" />
            <Typography variant="h6">
              {modelUsed} Real-time Medical Reasoning
            </Typography>
            {isStreaming && (
              <Chip 
                icon={<CircularProgress size={16} />} 
                label="Thinking..." 
                color="primary" 
                size="small" 
                variant="outlined"
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {formatTime(totalProcessingTime || processingTime)}
            </Typography>
            <Tooltip title={isVisible ? "Hide reasoning" : "Show reasoning"}>
              <IconButton size="small" onClick={toggleVisibility}>
                {isVisible ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Status indicator */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Status: {streamingStatus.charAt(0).toUpperCase() + streamingStatus.slice(1)}
          </Typography>
          <LinearProgress 
            variant={isStreaming ? "indeterminate" : "determinate"} 
            value={isStreaming ? undefined : 100}
            sx={{ height: 4, borderRadius: 2 }}
          />
        </Box>

        {/* Main reasoning display */}
        <Fade in={isVisible}>
          <Box sx={{ display: isVisible ? 'block' : 'none' }}>
            {/* Current thinking (Cursor-style flowing text) */}
            {isStreaming && currentStep && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'white',
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider',
                  mb: 2,
                  minHeight: 120,
                  position: 'relative'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {getStepIcon(currentStep.type)}
                  <Typography variant="subtitle2" color={`${getStepColor(currentStep.type)}.main`}>
                    {currentStep.title}
                  </Typography>
                  <Chip
                    label={`${Math.round(currentStep.confidence * 100)}%`}
                    size="small"
                    color={getStepColor(currentStep.type) as any}
                    variant="outlined"
                  />
                </Box>
                
                {/* Flowing text like Cursor thinking */}
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    lineHeight: 1.6,
                    color: theme.palette.text.primary,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {currentStep.content}
                </Typography>
              </Box>
            )}

            {/* Reasoning steps history */}
            {reasoningSteps.length > 0 && (
              <Box
                ref={scrollRef}
                sx={{
                  maxHeight: 400,
                  overflowY: 'auto',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'white'
                }}
              >
                <Stack spacing={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Reasoning History ({reasoningSteps.length} steps)
                  </Typography>
                  
                  {reasoningSteps.map((step, index) => (
                    <Box key={step.id}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 1 }}>
                        <Box sx={{ mt: 0.5 }}>
                          {getStepIcon(step.type)}
                        </Box>
                        
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {step.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(step.timestamp).toLocaleTimeString()}
                            </Typography>
                            <Chip
                              label={`${Math.round(step.confidence * 100)}%`}
                              size="small"
                              color={getStepColor(step.type) as any}
                              variant="filled"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Box>
                          
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              lineHeight: 1.4,
                              wordBreak: 'break-word',
                              maxHeight: step === currentStep ? 'none' : 60,
                              overflow: step === currentStep ? 'visible' : 'hidden',
                              display: step === currentStep ? 'block' : '-webkit-box',
                              WebkitLineClamp: step === currentStep ? 'none' : 3,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {step.content}
                          </Typography>
                          
                          {step.evidence && step.evidence.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                              {step.evidence.slice(0, 3).map((evidence, idx) => (
                                <Chip
                                  key={idx}
                                  label={evidence}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.65rem', height: 20 }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Box>
                      
                      {index < reasoningSteps.length - 1 && <Divider sx={{ my: 1 }} />}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Completion message */}
            {!isStreaming && streamingStatus === 'complete' && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Analysis Complete!</strong> {modelUsed} reasoning finished in {formatTime(totalProcessingTime || processingTime)}.
                  Generated comprehensive medical analysis with detailed clinical reasoning.
                </Typography>
              </Alert>
            )}
          </Box>
        </Fade>
      </CardContent>
    </Card>
  );
};

export default StreamingReasoningDisplay; 