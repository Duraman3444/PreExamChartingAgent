import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Alert,
  Fade,
  Slide,
  Paper,
  Divider,
  CircularProgress,
  Collapse
} from '@mui/material';
import {
  CheckCircle,
  AutoAwesome,
  Psychology,
  Timeline,
  Analytics,
  Search,
  Assessment,
  Hub,
  Gavel,
  Verified,
  PlayArrow,
  Pause,
  Stop
} from '@mui/icons-material';
import { ReasoningStep } from '../../services/openai';

interface StreamingReasoningDisplayProps {
  isStreaming: boolean;
  reasoningSteps: ReasoningStep[];
  currentStep?: ReasoningStep;
  onStepComplete?: (step: ReasoningStep) => void;
  onStreamComplete?: () => void;
  onStreamError?: (error: Error) => void;
  showFullReasoning?: boolean;
  fullReasoningContent?: string;
  showProgress?: boolean;
  totalSteps?: number;
  streamingStatus?: 'connecting' | 'connected' | 'analyzing' | 'complete' | 'error';
}

const StreamingReasoningDisplay: React.FC<StreamingReasoningDisplayProps> = ({
  isStreaming,
  reasoningSteps,
  currentStep,
  onStepComplete,
  onStreamComplete,
  onStreamError,
  showFullReasoning = false,
  fullReasoningContent = '',
  showProgress = true,
  totalSteps = 5,
  streamingStatus = 'connecting'
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [animatingStep, setAnimatingStep] = useState<string | null>(null);
  const lastStepRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest step
  useEffect(() => {
    if (lastStepRef.current) {
      lastStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [reasoningSteps.length]);

  // Animate new steps
  useEffect(() => {
    if (currentStep) {
      setAnimatingStep(currentStep.id);
      const timer = setTimeout(() => {
        setAnimatingStep(null);
        if (onStepComplete) {
          onStepComplete(currentStep);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onStepComplete]);

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'analysis':
        return <Analytics />;
      case 'research':
        return <Search />;
      case 'evaluation':
        return <Assessment />;
      case 'synthesis':
        return <Hub />;
      case 'decision':
        return <Gavel />;
      case 'validation':
        return <Verified />;
      default:
        return <Psychology />;
    }
  };

  const getStepColor = (stepType: string) => {
    switch (stepType) {
      case 'analysis':
        return 'primary';
      case 'research':
        return 'secondary';
      case 'evaluation':
        return 'info';
      case 'synthesis':
        return 'success';
      case 'decision':
        return 'warning';
      case 'validation':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStreamingStatusInfo = () => {
    switch (streamingStatus) {
      case 'connecting':
        return { icon: <CircularProgress size={16} />, message: 'Connecting to AI agent...', color: 'info' };
      case 'connected':
        return { icon: <PlayArrow />, message: 'Connected - Starting analysis...', color: 'success' };
      case 'analyzing':
        return { icon: <Psychology />, message: 'AI agent is thinking...', color: 'primary' };
      case 'complete':
        return { icon: <CheckCircle />, message: 'Analysis complete!', color: 'success' };
      case 'error':
        return { icon: <Stop />, message: 'Analysis failed', color: 'error' };
      default:
        return { icon: <CircularProgress size={16} />, message: 'Initializing...', color: 'info' };
    }
  };

  const progressPercentage = totalSteps > 0 ? Math.min((reasoningSteps.length / totalSteps) * 100, 100) : 0;
  const statusInfo = getStreamingStatusInfo();

  return (
    <Stack spacing={3}>
      {/* Header with streaming status */}
      <Box>
        <Typography variant="h6" gutterBottom>
          <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
          Real-time AI Reasoning Process
        </Typography>
        
        <Alert 
          severity={statusInfo.color as any} 
          sx={{ mb: 2 }}
          icon={statusInfo.icon}
        >
          <Typography variant="body2">
            <strong>Status:</strong> {statusInfo.message}
            {isStreaming && (
              <> | <strong>Steps:</strong> {reasoningSteps.length} / {totalSteps}</>
            )}
          </Typography>
        </Alert>

        {/* Progress bar */}
        {showProgress && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                Analysis Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(progressPercentage)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}
      </Box>

      {/* Reasoning Steps */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Step-by-Step Reasoning
        </Typography>
        
        {reasoningSteps.length > 0 ? (
          <Stack spacing={2}>
            {reasoningSteps.map((step, index) => (
              <Fade in={true} timeout={500} key={step.id}>
                <Card 
                  variant="outlined"
                  sx={{
                    borderColor: animatingStep === step.id ? 'primary.main' : 'inherit',
                    boxShadow: animatingStep === step.id ? 2 : 0,
                    transition: 'all 0.3s ease-in-out',
                    ...(index === reasoningSteps.length - 1 && { mb: 2 })
                  }}
                  ref={index === reasoningSteps.length - 1 ? lastStepRef : undefined}
                >
                  <CardContent>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 1,
                        cursor: 'pointer'
                      }}
                      onClick={() => toggleStepExpansion(step.id)}
                    >
                      <Box sx={{ mr: 2 }}>
                        {getStepIcon(step.type)}
                      </Box>
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Step {index + 1}: {step.title}
                      </Typography>
                      <Chip
                        label={step.type}
                        color={getStepColor(step.type) as any}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`${Math.round(step.confidence * 100)}% confidence`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    
                    <Typography 
                      variant="body1" 
                      paragraph 
                      sx={{ 
                        color: 'text.secondary',
                        fontStyle: animatingStep === step.id ? 'italic' : 'normal'
                      }}
                    >
                      {step.content}
                    </Typography>
                    
                    <Collapse in={expandedSteps.has(step.id)}>
                      <Divider sx={{ my: 2 }} />
                      
                      {step.evidence && step.evidence.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Evidence Considered:
                          </Typography>
                          <List dense>
                            {step.evidence.map((evidence, evidenceIndex) => (
                              <ListItem key={evidenceIndex}>
                                <ListItemIcon>
                                  <CheckCircle color="success" />
                                </ListItemIcon>
                                <ListItemText primary={evidence} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                      
                      {step.considerations && step.considerations.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Key Considerations:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {step.considerations.map((consideration, considerationIndex) => (
                              <Chip 
                                key={considerationIndex} 
                                label={consideration} 
                                variant="outlined" 
                                size="small"
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Collapse>
                  </CardContent>
                </Card>
              </Fade>
            ))}
          </Stack>
        ) : (
          <Alert severity="info">
            <Typography variant="body2">
              {isStreaming ? 'Waiting for AI reasoning steps...' : 'No reasoning steps available'}
            </Typography>
          </Alert>
        )}

        {/* Current step being processed */}
        {isStreaming && currentStep && (
          <Slide direction="up" in={true} timeout={500}>
            <Card 
              variant="outlined" 
              sx={{ 
                mt: 2,
                bgcolor: 'action.hover',
                borderColor: 'primary.main',
                borderStyle: 'dashed'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CircularProgress size={20} sx={{ mr: 2 }} />
                  <Typography variant="h6">
                    Processing: {currentStep.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {currentStep.content}
                </Typography>
              </CardContent>
            </Card>
          </Slide>
        )}
      </Box>

      {/* Full reasoning content (if available) */}
      {showFullReasoning && fullReasoningContent && (
        <Box>
          <Typography variant="h6" gutterBottom>
            <AutoAwesome sx={{ mr: 1, verticalAlign: 'middle' }} />
            Full Reasoning Content
          </Typography>
          <Paper sx={{ 
            p: 2, 
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
            border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)'
          }}>
            <Typography 
              variant="body2" 
              component="pre" 
              sx={{ 
                whiteSpace: 'pre-wrap',
                color: (theme) => theme.palette.mode === 'dark' ? 'grey.100' : 'grey.800',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                lineHeight: 1.6
              }}
            >
              {fullReasoningContent}
            </Typography>
          </Paper>
        </Box>
      )}
    </Stack>
  );
};

export default StreamingReasoningDisplay; 