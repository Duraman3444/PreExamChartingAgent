import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  Grid,
} from '@mui/material';
import {
  Mic,
  Stop,
  Pause,
  PlayArrow,
  Save,
  Close,
  VolumeUp,
  GraphicEq,
  Person,
  PersonOutline,
  Psychology,
  MedicalServices,
  FileUpload,
  Clear,
  Download,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { formatDistanceToNow, format } from 'date-fns';
import { TranscriptionResult, AnalysisResult } from '@/services/openai';
import { openAIService } from '@/services/openai';
import { medicalDataExtractionService, ExtractedMedicalData } from '@/services/medicalDataExtraction';
import { useAppStore } from '@/stores/appStore';
import { Patient } from '@/types';

interface RecordingSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  audioBlob?: Blob;
  transcription?: TranscriptionResult;
  analysis?: AnalysisResult;
  status: 'recording' | 'stopped' | 'transcribing' | 'analyzing' | 'completed';
  segments: TranscriptionSegment[];
  audioUrl?: string;
  mimeType?: string;
}

interface TranscriptionSegment {
  id: string;
  speaker: 'patient' | 'provider' | 'unknown';
  timestamp: number;
  text: string;
  confidence: number;
  isLive?: boolean;
}

interface RealTimeRecordingProps {
  onRecordingComplete?: (session: RecordingSession) => void;
  onError?: (error: string) => void;
  onPatientCreated?: (patient: Patient) => void;
  onPatientUpdated?: (patient: Patient) => void;
  maxDuration?: number; // in seconds
  autoTranscribe?: boolean;
  autoAnalyze?: boolean;
  availablePatients?: Patient[];
}

export const RealTimeRecording: React.FC<RealTimeRecordingProps> = ({
  onRecordingComplete,
  onError,
  onPatientCreated,
  onPatientUpdated,
  maxDuration = 3600, // 1 hour default
  autoTranscribe = false, // Disabled by default for testing
  autoAnalyze = false, // Disabled by default for testing
  availablePatients = [],
}) => {
  const theme = useTheme();
  const { currentPatient } = useAppStore();
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSession, setCurrentSession] = useState<RecordingSession | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Transcription state
  const [liveTranscription, setLiveTranscription] = useState<TranscriptionSegment[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Enhanced UI state for patient selection
  const [extractedMedicalData, setExtractedMedicalData] = useState<ExtractedMedicalData | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  
  // Enhanced new patient data
  const [newPatientData, setNewPatientData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'prefer-not-to-say' as 'male' | 'female' | 'other' | 'prefer-not-to-say',
    phone: '',
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceGroupNumber: '',
  });
  
  // UI state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(currentPatient);
  const [isNewPatient, setIsNewPatient] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioLevelTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio level monitoring
  useEffect(() => {
    if (isRecording && !isPaused) {
      audioLevelTimerRef.current = setInterval(() => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
          setAudioLevel(average / 255);
        }
      }, 100);
    } else {
      if (audioLevelTimerRef.current) {
        clearInterval(audioLevelTimerRef.current);
      }
      setAudioLevel(0);
    }
    
    return () => {
      if (audioLevelTimerRef.current) {
        clearInterval(audioLevelTimerRef.current);
      }
    };
  }, [isRecording, isPaused]);
  
  // Recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
    
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording, isPaused, maxDuration]);
  
  // Patient search filtering
  useEffect(() => {
    if (patientSearchQuery.trim() === '') {
      setFilteredPatients(availablePatients.slice(0, 10)); // Show first 10
    } else {
      const filtered = availablePatients.filter(patient =>
        `${patient.demographics.firstName} ${patient.demographics.lastName}`
          .toLowerCase()
          .includes(patientSearchQuery.toLowerCase()) ||
        patient.id.toLowerCase().includes(patientSearchQuery.toLowerCase())
      ).slice(0, 10);
      setFilteredPatients(filtered);
    }
  }, [patientSearchQuery, availablePatients]);
  
  // Auto-populate new patient data from extracted medical data
  useEffect(() => {
    if (extractedMedicalData?.patientInfo) {
      const patientInfo = extractedMedicalData.patientInfo;
      setNewPatientData(prev => ({
        ...prev,
        firstName: patientInfo.firstName || prev.firstName,
        lastName: patientInfo.lastName || prev.lastName,
        dateOfBirth: patientInfo.dateOfBirth || prev.dateOfBirth,
        gender: patientInfo.gender || prev.gender,
        phone: patientInfo.contactInfo?.phone || prev.phone,
        email: patientInfo.contactInfo?.email || prev.email,
        address: patientInfo.contactInfo?.address || prev.address,
        emergencyContactName: patientInfo.emergencyContact?.name || prev.emergencyContactName,
        emergencyContactPhone: patientInfo.emergencyContact?.phone || prev.emergencyContactPhone,
        emergencyContactRelationship: patientInfo.emergencyContact?.relationship || prev.emergencyContactRelationship,
        insuranceProvider: patientInfo.insuranceInfo?.provider || prev.insuranceProvider,
        insurancePolicyNumber: patientInfo.insuranceInfo?.policyNumber || prev.insurancePolicyNumber,
        insuranceGroupNumber: patientInfo.insuranceInfo?.groupNumber || prev.insuranceGroupNumber,
      }));
    }
  }, [extractedMedicalData]);
  
  // Start recording
  const startRecording = async () => {
    try {
      setTranscriptionError(null);
      setAnalysisError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
      
      // Set up audio context for level monitoring
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Create new session FIRST before setting up event handlers
      const newSession: RecordingSession = {
        id: `recording-${Date.now()}`,
        startTime: new Date(),
        duration: 0,
        status: 'recording',
        segments: [],
      };
      setCurrentSession(newSession);
      setLiveTranscription([]);
      
      // Set up media recorder with m4a format
      let mimeType = 'audio/mp4';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Fallback to webm if mp4 is not supported
        mimeType = 'audio/webm;codecs=opus';
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType,
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        console.log('🎵 [Recording Debug] Audio recording stopped:', {
          audioBlobSize: audioBlob.size,
          audioUrl: audioUrl,
          sessionId: newSession.id
        });
        
        // Update session with audio data
        const updatedSession = {
          ...newSession,
          endTime: new Date(),
          duration: recordingTime,
          audioBlob,
          audioUrl,
          status: 'stopped' as const,
          mimeType: mimeType,
        };
        
        console.log('🎵 [Recording Debug] Setting updated session:', {
          sessionId: updatedSession.id,
          status: updatedSession.status,
          hasAudioBlob: !!updatedSession.audioBlob,
          hasAudioUrl: !!updatedSession.audioUrl,
          duration: updatedSession.duration
        });
        
        setCurrentSession(updatedSession);
        
        // Auto-transcribe if enabled
        if (autoTranscribe) {
          await transcribeSession(updatedSession);
        }
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };
      
      // Start recording
      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';
      setTranscriptionError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };
  
  // Pause/resume recording
  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };
  
  // Transcribe session
  const transcribeSession = async (session: RecordingSession) => {
    if (!session.audioBlob) return;
    
    try {
      setIsTranscribing(true);
      setTranscriptionError(null);
      
      // Convert blob to file with appropriate format
      const mimeType = session.mimeType || session.audioBlob.type;
      const fileExtension = mimeType.includes('mp4') ? 'm4a' : 'webm';
      
      const audioFile = new File([session.audioBlob], `recording-${session.id}.${fileExtension}`, {
        type: mimeType,
      });
      
      const transcription = await openAIService.transcribeAudio(audioFile);
      
      const updatedSession = {
        ...session,
        transcription,
        segments: transcription.segments.map(seg => ({
          id: seg.id,
          speaker: seg.speaker,
          timestamp: seg.timestamp,
          text: seg.text,
          confidence: seg.confidence,
        })),
        status: 'transcribing' as const,
      };
      
      setCurrentSession(updatedSession);
      setLiveTranscription(updatedSession.segments);
      
      // Auto-analyze if enabled
      if (autoAnalyze) {
        await analyzeTranscription(updatedSession);
      } else {
        setCurrentSession(prev => prev ? { ...prev, status: 'completed' } : null);
      }
      
    } catch (error) {
      console.error('Error transcribing audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to transcribe audio';
      setTranscriptionError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsTranscribing(false);
    }
  };
  
  // Enhanced analysis with medical data extraction
  const analyzeTranscription = async (session: RecordingSession) => {
    if (!session.transcription) return;
    
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      setAnalysisProgress(0);
      
      const patientContext = selectedPatient ? {
        age: selectedPatient.demographics.dateOfBirth 
          ? Math.floor((new Date().getTime() - new Date(selectedPatient.demographics.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : undefined,
        gender: selectedPatient.demographics.gender,
        medicalHistory: selectedPatient.basicHistory.knownConditions.join(', '),
        medications: selectedPatient.basicHistory.currentMedications.join(', '),
        allergies: selectedPatient.basicHistory.knownAllergies.join(', '),
      } : undefined;
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 5, 45));
      }, 300);
      
      // Get AI analysis
      const analysis = await openAIService.analyzeTranscript(
        session.transcription.text,
        patientContext
      );
      
      setAnalysisProgress(50);
      
      // Extract medical data
      setIsExtracting(true);
      const extractionProgressInterval = setInterval(() => {
        setExtractionProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      
      const medicalData = await medicalDataExtractionService.extractMedicalData(
        session.transcription.text,
        selectedPatient || undefined,
        analysis
      );
      
      clearInterval(progressInterval);
      clearInterval(extractionProgressInterval);
      setAnalysisProgress(100);
      setExtractionProgress(100);
      
      const updatedSession = {
        ...session,
        analysis,
        status: 'completed' as const,
      };
      
      setCurrentSession(updatedSession);
      setExtractedMedicalData(medicalData);
      
      if (onRecordingComplete) {
        onRecordingComplete(updatedSession);
      }
      
    } catch (error) {
      console.error('Error analyzing transcription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze transcription';
      setAnalysisError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsAnalyzing(false);
      setIsExtracting(false);
    }
  };
  
  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle save session
  const handleSaveSession = () => {
    if (currentSession && currentSession.status === 'completed') {
      setShowSaveDialog(true);
    }
  };
  
  // Clear session
  const clearSession = () => {
    setCurrentSession(null);
    setLiveTranscription([]);
    setRecordingTime(0);
    setTranscriptionError(null);
    setAnalysisError(null);
    setAnalysisProgress(0);
  };
  
  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsNewPatient(false);
    setPatientSearchQuery(`${patient.demographics.firstName} ${patient.demographics.lastName}`);
    setShowPatientSearch(false);
  };
  
  // Handle creating new patient
  const handleCreateNewPatient = async () => {
    if (!extractedMedicalData) return;
    
    try {
      const newPatient: Patient = {
        id: `patient-${Date.now()}`,
        demographics: {
          firstName: newPatientData.firstName,
          lastName: newPatientData.lastName,
          dateOfBirth: new Date(newPatientData.dateOfBirth),
          gender: newPatientData.gender,
          phone: newPatientData.phone || undefined,
          preferredLanguage: undefined,
        },
        basicHistory: {
          knownAllergies: [
            ...extractedMedicalData.allergies.drugAllergies.map(a => `${a.allergen} (${a.reaction})`),
            ...extractedMedicalData.allergies.foodAllergies.map(a => `${a.allergen} (${a.reaction})`),
            ...extractedMedicalData.allergies.environmentalAllergies.map(a => `${a.allergen} (${a.reaction})`),
          ],
          currentMedications: extractedMedicalData.medications.currentMedications.map(m => 
            `${m.name} ${m.dosage} ${m.frequency}`
          ),
          knownConditions: [
            ...extractedMedicalData.medicalHistory.chronicConditions,
            ...extractedMedicalData.medicalHistory.pastMedicalHistory,
          ],
          notes: [
            `Visit ${extractedMedicalData.extractionTimestamp.toLocaleDateString()}: ${extractedMedicalData.medicalHistory.chiefComplaint}`,
            `History: ${extractedMedicalData.medicalHistory.historyOfPresentIllness}`,
            medicalDataExtractionService.generateExtractionSummary(extractedMedicalData),
          ].join('\n\n'),
        },
        photo: undefined,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system', // In a real app, this would be the current user ID
      };
      
      // In a real app, this would save to the database
      console.log('Creating new patient:', newPatient);
      
      if (onPatientCreated) {
        onPatientCreated(newPatient);
      }
      
      setShowSaveDialog(false);
      // setLastRecordingResult(`New patient created: ${newPatient.demographics.firstName} ${newPatient.demographics.lastName}`); // This line was removed from the new_code, so it's removed here.
      
    } catch (error) {
      console.error('Error creating new patient:', error);
      if (onError) {
        onError('Failed to create new patient');
      }
    }
  };
  
  // Handle updating existing patient
  const handleUpdateExistingPatient = async () => {
    if (!extractedMedicalData || !selectedPatient) return;
    
    try {
      const updates = await medicalDataExtractionService.convertToPatientProfileUpdates(
        extractedMedicalData,
        selectedPatient
      );
      
      const updatedPatient: Patient = {
        ...selectedPatient,
        ...updates,
        updatedAt: new Date(),
      };
      
      // In a real app, this would save to the database
      console.log('Updating existing patient:', updatedPatient);
      
      if (onPatientUpdated) {
        onPatientUpdated(updatedPatient);
      }
      
      setShowSaveDialog(false);
      
    } catch (error) {
      console.error('Error updating patient:', error);
      if (onError) {
        onError('Failed to update patient');
      }
    }
  };
  
  // Download audio file
  const downloadAudio = () => {
    if (!currentSession?.audioBlob || !currentSession?.audioUrl) return;
    
    // Determine file extension based on stored mimeType or blob type
    const mimeType = currentSession.mimeType || currentSession.audioBlob.type;
    const fileExtension = mimeType.includes('mp4') ? 'm4a' : 'webm';
    
    const link = document.createElement('a');
    link.href = currentSession.audioUrl;
    link.download = `medical-recording-${format(currentSession.startTime, 'yyyy-MM-dd-HHmm')}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Real-Time Medical Recording
      </Typography>
      
      {/* Recording Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isRecording ? (
                <Button
                  variant="contained"
                  startIcon={<Mic />}
                  onClick={startRecording}
                  sx={{
                    backgroundColor: theme.palette.error.main,
                    '&:hover': { backgroundColor: theme.palette.error.dark },
                  }}
                >
                  Start Recording
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={isPaused ? <PlayArrow /> : <Pause />}
                    onClick={togglePause}
                    disabled={!isRecording}
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Stop />}
                    onClick={stopRecording}
                    color="secondary"
                  >
                    Stop Recording
                  </Button>
                </>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                {formatTime(recordingTime)}
              </Typography>
              {isRecording && (
                <Chip
                  label={isPaused ? 'PAUSED' : 'RECORDING'}
                  color={isPaused ? 'warning' : 'error'}
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
            </Box>
          </Box>
          
          {/* Audio Level Indicator */}
          {isRecording && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <VolumeUp color="action" />
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={audioLevel * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme.palette.grey[300],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: audioLevel > 0.7 ? theme.palette.error.main : 
                                     audioLevel > 0.3 ? theme.palette.warning.main : 
                                     theme.palette.success.main,
                    },
                  }}
                />
              </Box>
              <GraphicEq sx={{ 
                color: audioLevel > 0.1 ? theme.palette.primary.main : theme.palette.grey[400] 
              }} />
            </Box>
          )}
          
          {/* Progress indicators */}
          {isTranscribing && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Transcribing audio...</Typography>
              </Box>
            </Box>
          )}
          
          {isAnalyzing && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Analyzing transcript...</Typography>
              </Box>
              <LinearProgress variant="determinate" value={analysisProgress} />
            </Box>
          )}
          
          {isExtracting && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Extracting medical data...</Typography>
              </Box>
              <LinearProgress variant="determinate" value={extractionProgress} />
            </Box>
          )}
          
          {/* Debug Section - Remove this after fixing */}
          {currentSession && (
            <Box sx={{ mt: 2, p: 1, backgroundColor: '#f0f0f0', borderRadius: 1, fontSize: '0.8rem' }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                🐛 Debug - Session: {currentSession.id} | Status: {currentSession.status} | 
                AudioBlob: {currentSession.audioBlob ? 'YES' : 'NO'} | 
                AudioUrl: {currentSession.audioUrl ? 'YES' : 'NO'} | 
                Duration: {currentSession.duration}s
              </Typography>
            </Box>
          )}
          
          {/* Session actions */}
          {currentSession && currentSession.audioBlob && currentSession.audioUrl && (
            <Box sx={{ mt: 2 }}>
              {/* Download section - always show when audio is available */}
              <Box sx={{ mb: 2, p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  📁 Recording Available for Download
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Duration: {formatTime(currentSession.duration)} • Recorded: {format(currentSession.startTime, 'MMM dd, yyyy HH:mm')}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={downloadAudio}
                  color="primary"
                  sx={{ mr: 1 }}
                >
                  Download Audio File
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  💡 Download to upload as transcript later
                </Typography>
              </Box>
              
              {/* Other actions - only show when completed */}
              {(currentSession.status === 'completed' || currentSession.status === 'stopped') && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {currentSession.status === 'completed' && (
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveSession}
                      color="primary"
                    >
                      Save to Patient
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={clearSession}
                  >
                    Clear Session
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Error Messages */}
      {transcriptionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2">{transcriptionError}</Typography>
        </Alert>
      )}
      
      {analysisError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2">{analysisError}</Typography>
        </Alert>
      )}
      
      {/* Live Transcription */}
      {liveTranscription.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Live Transcription
            </Typography>
            <Paper
              sx={{
                maxHeight: 400,
                overflow: 'auto',
                p: 2,
                backgroundColor: theme.palette.grey[50],
              }}
            >
              <List disablePadding>
                {liveTranscription.map((segment, index) => (
                  <React.Fragment key={segment.id}>
                    <ListItem sx={{ px: 0 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 2,
                          backgroundColor: segment.speaker === 'patient' ? 
                            theme.palette.info.main : theme.palette.success.main,
                        }}
                      >
                        {segment.speaker === 'patient' ? <Person /> : <PersonOutline />}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {segment.speaker === 'patient' ? 'Patient' : 'Provider'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(Math.floor(segment.timestamp))}
                            </Typography>
                            <Chip
                              label={`${Math.round(segment.confidence * 100)}%`}
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {segment.text}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < liveTranscription.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </CardContent>
        </Card>
      )}
      
      {/* Enhanced Medical Data Summary */}
      {extractedMedicalData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Extracted Medical Information
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Confidence: {Math.round(extractedMedicalData.extractionConfidence * 100)}%
            </Typography>
            
            <Grid container spacing={2}>
              {extractedMedicalData.patientInfo.firstName && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Patient Information</Typography>
                  <Typography variant="body2">
                    {extractedMedicalData.patientInfo.firstName} {extractedMedicalData.patientInfo.lastName}
                    {extractedMedicalData.patientInfo.age && `, Age: ${extractedMedicalData.patientInfo.age}`}
                    {extractedMedicalData.patientInfo.gender && `, Gender: ${extractedMedicalData.patientInfo.gender}`}
                  </Typography>
                </Grid>
              )}
              
              {extractedMedicalData.medicalHistory.chiefComplaint && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Chief Complaint</Typography>
                  <Typography variant="body2">{extractedMedicalData.medicalHistory.chiefComplaint}</Typography>
                </Grid>
              )}
              
              {extractedMedicalData.clinicalFindings.symptoms.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Key Symptoms</Typography>
                  <Typography variant="body2">
                    {extractedMedicalData.clinicalFindings.symptoms.slice(0, 3).map(s => s.name).join(', ')}
                  </Typography>
                </Grid>
              )}
              
              {extractedMedicalData.medications.currentMedications.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Current Medications</Typography>
                  <Typography variant="body2">
                    {extractedMedicalData.medications.currentMedications.slice(0, 3).map(m => m.name).join(', ')}
                  </Typography>
                </Grid>
              )}
              
              {extractedMedicalData.allergies.drugAllergies.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Allergies</Typography>
                  <Typography variant="body2">
                    {extractedMedicalData.allergies.drugAllergies.map(a => a.allergen).join(', ')}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* AI Analysis Results */}
      {currentSession?.analysis && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI Analysis Results
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Key Symptoms ({currentSession.analysis.symptoms.length})
                </Typography>
                <List dense>
                  {currentSession.analysis.symptoms.slice(0, 5).map((symptom) => (
                    <ListItem key={symptom.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={symptom.name}
                        secondary={`${symptom.severity} - ${Math.round(symptom.confidence * 100)}% confidence`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Top Diagnoses ({currentSession.analysis.diagnoses.length})
                </Typography>
                <List dense>
                  {currentSession.analysis.diagnoses.slice(0, 3).map((diagnosis) => (
                    <ListItem key={diagnosis.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={diagnosis.condition}
                        secondary={`${Math.round(diagnosis.probability * 100)}% probability`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Enhanced Save Dialog */}
      <Dialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Save Recording Session</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Choose whether to update an existing patient or create a new patient profile.
          </Typography>
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <Button
              variant={!isNewPatient ? 'contained' : 'outlined'}
              onClick={() => setIsNewPatient(false)}
              sx={{ mr: 1 }}
            >
              Update Existing Patient
            </Button>
            <Button
              variant={isNewPatient ? 'contained' : 'outlined'}
              onClick={() => setIsNewPatient(true)}
            >
              Create New Patient
            </Button>
          </Box>
          
          {isNewPatient ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="info">
                Patient information has been automatically populated from the recording where available.
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="First Name"
                    value={newPatientData.firstName}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, firstName: e.target.value }))}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Last Name"
                    value={newPatientData.lastName}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, lastName: e.target.value }))}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Date of Birth"
                    type="date"
                    value={newPatientData.dateOfBirth}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={newPatientData.gender}
                      onChange={(e) => setNewPatientData(prev => ({ ...prev, gender: e.target.value as any }))}
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                      <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Phone"
                    value={newPatientData.phone}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, phone: e.target.value }))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Email"
                    value={newPatientData.email}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, email: e.target.value }))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    value={newPatientData.address}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, address: e.target.value }))}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Emergency Contact</Typography>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Name"
                    value={newPatientData.emergencyContactName}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Phone"
                    value={newPatientData.emergencyContactPhone}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Relationship"
                    value={newPatientData.emergencyContactRelationship}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, emergencyContactRelationship: e.target.value }))}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" gutterBottom>
                Search for an existing patient:
              </Typography>
              <TextField
                label="Search patients"
                value={patientSearchQuery}
                onChange={(e) => {
                  setPatientSearchQuery(e.target.value);
                  setShowPatientSearch(true);
                }}
                onFocus={() => setShowPatientSearch(true)}
                fullWidth
                sx={{ mb: 2 }}
              />
              
              {showPatientSearch && (
                <Paper sx={{ maxHeight: 200, overflow: 'auto' }}>
                  <List>
                    {filteredPatients.map((patient) => (
                      <ListItem
                        key={patient.id}
                        button
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <ListItemText
                          primary={`${patient.demographics.firstName} ${patient.demographics.lastName}`}
                          secondary={`DOB: ${patient.demographics.dateOfBirth.toLocaleDateString()}, ID: ${patient.id}`}
                        />
                      </ListItem>
                    ))}
                    {filteredPatients.length === 0 && (
                      <ListItem>
                        <ListItemText primary="No patients found" />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              )}
              
              {selectedPatient && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
                  <Typography variant="subtitle2">Selected Patient:</Typography>
                  <Typography variant="body2">
                    {selectedPatient.demographics.firstName} {selectedPatient.demographics.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    DOB: {selectedPatient.demographics.dateOfBirth.toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {selectedPatient.id}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          
          {/* Medical Data Summary */}
          {extractedMedicalData && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Medical Data to be {isNewPatient ? 'added to new patient' : 'merged with existing patient'}:
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: theme.palette.grey[50] }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {medicalDataExtractionService.generateExtractionSummary(extractedMedicalData)}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={isNewPatient ? handleCreateNewPatient : handleUpdateExistingPatient}
            disabled={
              isNewPatient 
                ? (!newPatientData.firstName || !newPatientData.lastName || !newPatientData.dateOfBirth)
                : !selectedPatient
            }
          >
            {isNewPatient ? 'Create New Patient' : 'Update Patient'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RealTimeRecording; 