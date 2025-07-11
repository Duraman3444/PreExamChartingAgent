import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  AudioFile as AudioIcon,
  TextFields as TextIcon,
  Close as CloseIcon,
  GetApp as DownloadIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Mic as MicIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/authStore';
import { globalEventStore } from '@/stores/globalEventStore';
import { APP_SETTINGS, ROUTES } from '@/constants';
import { FileUpload, TranscriptSegment } from '@/types';
import {
  uploadFileToStorage,
  transcribeAudio,
  processTextFile,
  validateFile,
  saveTranscript,
  updateTranscript,
  getTranscriptByVisitId,
  exportTranscript,
  formatFileSize,
  ACCEPTED_AUDIO_TYPES,
} from '@/services/fileUpload';

// File validation constants for dropzone
const ACCEPTED_AUDIO_TYPES_DROPZONE = {
  'audio/mp3': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/m4a': ['.m4a'],
  'audio/mp4': ['.mp4'],
  'audio/aac': ['.aac'],
  'audio/webm': ['.webm'],
  'audio/mpeg': ['.mp3'],
  'audio/x-wav': ['.wav'],
  'audio/x-m4a': ['.m4a'],
};

const ACCEPTED_TEXT_TYPES_DROPZONE = {
  'text/plain': ['.txt'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/pdf': ['.pdf'],
};

const ALL_ACCEPTED_TYPES = {
  ...ACCEPTED_AUDIO_TYPES_DROPZONE,
  ...ACCEPTED_TEXT_TYPES_DROPZONE,
};

interface TranscriptUploadProps {
  visitId?: string;
}

interface UploadedFile extends FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  isAudio: boolean;
  preview?: string;
  transcription?: string;
  confidence?: number;
  processing?: boolean;
  segments?: TranscriptSegment[];
}

interface TranscriptVersion {
  id: string;
  content: string;
  timestamp: Date;
  author: string;
  changes?: string;
}

const TranscriptUpload: React.FC<TranscriptUploadProps> = ({ visitId }) => {
  const { id: routeVisitId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentVisitId = visitId || routeVisitId;
  const { user } = useAuthStore();
  
  // State management
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [transcription, setTranscription] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editableTranscript, setEditableTranscript] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [versions, setVersions] = useState<TranscriptVersion[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    show: boolean;
  }>({ message: '', type: 'info', show: false });

  // **NEW: Patient and Doctor Input Dialog State**
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [pendingTranscriptData, setPendingTranscriptData] = useState<{
    transcriptionResult: any;
    fileData: UploadedFile;
  } | null>(null);
  const [patientDoctorInfo, setPatientDoctorInfo] = useState({
    patientFirstName: '',
    patientLastName: '',
    patientAge: '',
    patientGender: 'prefer-not-to-say' as 'male' | 'female' | 'other' | 'prefer-not-to-say',
    doctorName: '',
    department: '',
    visitType: 'consultation' as 'consultation' | 'follow_up' | 'urgent_care' | 'telemedicine',
    chiefComplaint: ''
  });

  // File upload handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('📁 [File Debug] Files dropped:', acceptedFiles.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size
    })));

    const newFiles: UploadedFile[] = acceptedFiles.map(file => {
      // Fix: ACCEPTED_AUDIO_TYPES is an array, not an object - use .includes() directly
      const isAudio = ACCEPTED_AUDIO_TYPES.includes(file.type);
      console.log('🔍 [File Debug] File analysis:', {
        name: file.name,
        detectedType: file.type,
        isAudio: isAudio,
        acceptedAudioTypes: ACCEPTED_AUDIO_TYPES
      });

      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        isAudio: isAudio,
        progress: 0,
        status: 'pending',
        processing: false,
      };
    });
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Auto-upload files
    newFiles.forEach(uploadFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALL_ACCEPTED_TYPES,
    maxSize: APP_SETTINGS.MAX_AUDIO_FILE_SIZE,
    multiple: true,
  });

  // **NEW: Save transcript to patient record and update visit status**
  const saveTranscriptToPatientRecord = async (transcriptionResult: any, fileData: UploadedFile, patientInfo: any, visitInfo: any) => {
    if (!user) {
      console.log('⚠️ [Save Debug] Missing user information');
      return;
    }

    try {
      console.log('💾 [Save Debug] Creating patient and visit records...');
      
      // Create patient ID and visit ID
      const patientId = `P${Date.now().toString().slice(-4)}`;
      const visitId = `V${Date.now()}`;
      
      // Create patient record
      const patientRecord = {
        id: patientId,
        firstName: patientInfo.patientFirstName,
        lastName: patientInfo.patientLastName,
        patientName: `${patientInfo.patientFirstName} ${patientInfo.patientLastName}`,
        patientAge: parseInt(patientInfo.patientAge) || 0,
        patientGender: patientInfo.patientGender,
        department: patientInfo.department,
        attendingProvider: patientInfo.doctorName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Create visit record
      const visitRecord = {
        id: visitId,
        patientId: patientId,
        patientName: `${patientInfo.patientFirstName} ${patientInfo.patientLastName}`,
        patientAge: parseInt(patientInfo.patientAge) || 0,
        patientGender: patientInfo.patientGender,
        type: visitInfo.visitType,
        status: 'completed' as const,
        scheduledDateTime: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        duration: transcriptionResult.duration || 30,
        attendingProvider: patientInfo.doctorName,
        department: patientInfo.department,
        chiefComplaint: visitInfo.chiefComplaint,
        visitSummary: transcriptionResult.text.slice(0, 200) + '...',
        priority: 'medium' as const,
        hasTranscript: true,
        hasAiAnalysis: false,
        hasVisitNotes: false,
        transcriptStatus: 'completed',
        notesCount: 0,
        notesStatus: 'none',
        analysisStatus: 'none',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Save transcript to database
      const transcriptData = {
        rawTranscript: transcriptionResult.text,
        structured: transcriptionResult.segments || [],
        transcriptionMethod: 'ai' as const,
        confidenceScore: transcriptionResult.confidence,
        language: 'en',
        duration: transcriptionResult.duration || 0,
        speakers: transcriptionResult.segments?.map((seg: any, index: number) => ({
          id: `speaker-${index}`,
          role: seg.speaker || 'unknown',
          name: seg.speaker === 'patient' ? patientInfo.patientFirstName : seg.speaker === 'provider' ? patientInfo.doctorName : 'Unknown'
        })) || [],
        audioFile: fileData.name,
      };

      await saveTranscript(visitId, transcriptData, user.id);
      
      // Update visit status in real-time by triggering a global state update
      updateVisitTranscriptStatus(visitId, 'completed');
      
      // Add a small delay to ensure all components are ready to receive events
      setTimeout(() => {
        updatePatientCreated(patientRecord);
        updateVisitCreated(visitRecord);
        
        // **NEW: Use global store for more reliable event handling**
        globalEventStore.triggerPatientCreated(patientRecord);
        globalEventStore.triggerVisitCreated(visitRecord);
        globalEventStore.triggerTranscriptUpdated({
          visitId: visitRecord.id,
          status: 'completed',
          timestamp: new Date()
        });
      }, 100);
      
      console.log('✅ [Save Debug] Patient, visit, and transcript created successfully!');
      
    } catch (error) {
      console.error('❌ [Save Debug] Failed to save transcript to patient record:', error);
      showNotification('Failed to save patient and transcript data', 'error');
    }
  };

  // **NEW: Update visit status to show transcript is available**
  const updateVisitTranscriptStatus = (visitId: string, status: string) => {
    // This would typically update a global state or trigger a refetch
    // For now, we'll dispatch a custom event that other components can listen to
    const event = new CustomEvent('visitTranscriptUpdated', {
      detail: { visitId, status, timestamp: new Date() }
    });
    window.dispatchEvent(event);
    
    console.log('📢 [Update Debug] Visit transcript status updated:', { visitId, status });
  };

  // **NEW: Update when patient is created**
  const updatePatientCreated = (patientRecord: any) => {
    console.log('🔥 [Debug] About to dispatch patientCreated event:', patientRecord);
    const event = new CustomEvent('patientCreated', {
      detail: { patient: patientRecord, timestamp: new Date() }
    });
    window.dispatchEvent(event);
    
    console.log('📢 [Update Debug] Patient created event dispatched:', patientRecord.id);
  };

  // **NEW: Update when visit is created**
  const updateVisitCreated = (visitRecord: any) => {
    console.log('🔥 [Debug] About to dispatch visitCreated event:', visitRecord);
    const event = new CustomEvent('visitCreated', {
      detail: { visit: visitRecord, timestamp: new Date() }
    });
    const dispatched = window.dispatchEvent(event);
    
    console.log('📢 [Update Debug] Visit created event dispatched:', visitRecord.id, 'Success:', dispatched);
    console.log('📢 [Update Debug] Event detail:', event.detail);
  };

  // **DEBUG: Test function to manually trigger events**
  const testEventSystem = () => {
    console.log('🧪 [Test] Testing event system...');
    
    const testPatient = {
      id: 'TEST123',
      firstName: 'Test',
      lastName: 'Patient',
      patientAge: 30,
      patientGender: 'male',
      department: 'Test Department',
      attendingProvider: 'Dr. Test'
    };
    
    const testVisit = {
      id: 'TESTVISIT123',
      patientId: 'TEST123',
      patientName: 'Test Patient',
      patientAge: 30,
      patientGender: 'male',
      type: 'consultation',
      status: 'completed',
      scheduledDateTime: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      duration: 30,
      attendingProvider: 'Dr. Test',
      department: 'Test Department',
      chiefComplaint: 'Test complaint',
      visitSummary: 'Test summary',
      priority: 'medium',
      hasTranscript: true,
      hasAiAnalysis: false,
      hasVisitNotes: false,
      transcriptStatus: 'completed',
      notesCount: 0,
      notesStatus: 'none',
      analysisStatus: 'none',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setTimeout(() => {
      updatePatientCreated(testPatient);
      updateVisitCreated(testVisit);
    }, 500);
  };

  // Add test function to window for easy debugging
  React.useEffect(() => {
    (window as any).testEventSystem = testEventSystem;
    console.log('🧪 [Test] Added testEventSystem to window. Run window.testEventSystem() in console to test.');
  }, []);

  // **NEW: Handle patient dialog submission**
  const handlePatientDialogSubmit = async () => {
    if (!pendingTranscriptData) return;
    
    // Validate required fields
    if (!patientDoctorInfo.patientFirstName || !patientDoctorInfo.patientLastName || !patientDoctorInfo.doctorName) {
      showNotification('Please fill in all required fields (Patient Name and Doctor)', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Save transcript with patient and visit information
      await saveTranscriptToPatientRecord(
        pendingTranscriptData.transcriptionResult, 
        pendingTranscriptData.fileData,
        patientDoctorInfo,
        patientDoctorInfo
      );
      
      // Reset states
      setShowPatientDialog(false);
      setPendingTranscriptData(null);
      setPatientDoctorInfo({
        patientFirstName: '',
        patientLastName: '',
        patientAge: '',
        patientGender: 'prefer-not-to-say',
        doctorName: '',
        department: '',
        visitType: 'consultation',
        chiefComplaint: ''
      });
      
      showNotification('Patient, visit, and transcript created successfully!', 'success');
      
    } catch (error) {
      console.error('Error saving patient data:', error);
      showNotification('Failed to save patient data. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // **NEW: Handle patient dialog cancel**
  const handlePatientDialogCancel = () => {
    setShowPatientDialog(false);
    setPendingTranscriptData(null);
    setPatientDoctorInfo({
      patientFirstName: '',
      patientLastName: '',
      patientAge: '',
      patientGender: 'prefer-not-to-say',
      doctorName: '',
      department: '',
      visitType: 'consultation',
      chiefComplaint: ''
    });
    showNotification('Transcript processing cancelled', 'info');
  };

  // File upload function
  const uploadFile = async (fileData: UploadedFile) => {
    if (!currentVisitId || !user) {
      showNotification('Missing visit ID or user information', 'error');
      return;
    }

    try {
      // Validate file first
      const validation = validateFile(fileData.file);
      if (!validation.isValid) {
        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'error', error: validation.error }
            : f
        ));
        showNotification(validation.error || 'File validation failed', 'error');
        return;
      }

      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ));

      console.log('📤 [UI Debug] Starting file upload to Firebase Storage...');
      
      // Upload to Firebase Storage
      await uploadFileToStorage(
        fileData.file,
        currentVisitId,
        user.id,
        (progress) => {
          setFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? { ...f, progress: Math.round(progress) }
              : f
          ));
        }
      );
      
      console.log('✅ [UI Debug] File uploaded to Firebase Storage successfully!');
      
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, status: 'completed', progress: 100 }
          : f
      ));

      showNotification('File uploaded successfully!', 'success');

      // If audio file, start transcription
      if (fileData.isAudio) {
        console.log('🎙️ [UI Debug] File is audio, starting transcription process...');
        await processAudioTranscription(fileData);
      } else {
        console.log('📄 [UI Debug] File is text, processing text content...');
        await processTextFileUpload(fileData);
      }

    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
          : f
      ));
      showNotification(error instanceof Error ? error.message : 'Upload failed', 'error');
    }
  };

  // Audio transcription processing
  const processAudioTranscription = async (fileData: UploadedFile) => {
    console.log('🎙️ [UI Debug] Starting audio transcription process for:', fileData.name);
    
    try {
      console.log('🔧 [UI Debug] Setting file processing state to true...');
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, processing: true }
          : f
      ));

      console.log('🔧 [UI Debug] Calling transcribeAudio service...');
      // Use the transcription service
      const transcriptionResult = await transcribeAudio(fileData.file);

      console.log('✅ [UI Debug] Transcription service completed successfully!', {
        textLength: transcriptionResult.text.length,
        segmentCount: transcriptionResult.segments.length,
        confidence: transcriptionResult.confidence
      });

      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { 
              ...f, 
              processing: false, 
              transcription: transcriptionResult.text,
              confidence: transcriptionResult.confidence,
              segments: transcriptionResult.segments
            }
          : f
      ));

      setTranscription(transcriptionResult.text);
      
      // **NEW: Show patient dialog instead of auto-saving**
      setPendingTranscriptData({ transcriptionResult, fileData });
      setShowPatientDialog(true);
      
      console.log('✅ [UI Debug] Transcription completed, showing patient dialog...');
      showNotification('Audio transcription completed! Please enter patient and doctor information.', 'info');

    } catch (error) {
      console.error('❌ [UI Debug] Transcription process failed:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, processing: false, error: 'Transcription failed' }
          : f
      ));
      showNotification('Transcription failed. Please try again.', 'error');
    }
  };

  // Text file processing
  const processTextFileUpload = async (fileData: UploadedFile) => {
    console.log('📄 [UI Debug] Starting text file processing for:', fileData.name);
    
    try {
      console.log('🔧 [UI Debug] Calling processTextFile service...');
      const text = await processTextFile(fileData.file);
      
      console.log('✅ [UI Debug] Text file processed successfully!', {
        textLength: text.length
      });
      
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, transcription: text, confidence: 1.0 }
          : f
      ));
      setTranscription(text);
      
      // **NEW: Show patient dialog for text files too**
      const textTranscriptResult = {
        text: text,
        confidence: 1.0,
        segments: [{
          id: 'text-segment-1',
          speaker: 'unknown',
          timestamp: 0,
          text: text,
          confidence: 1.0
        }],
        duration: 0
      };
      
      setPendingTranscriptData({ transcriptionResult: textTranscriptResult, fileData });
      setShowPatientDialog(true);
      
      showNotification('Text file processed! Please enter patient and doctor information.', 'info');
    } catch (error) {
      console.error('❌ [UI Debug] Text file processing failed:', error);
      showNotification('Failed to process text file.', 'error');
    }
  };

  // Remove file
  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Save transcript
  const handleSaveTranscript = async () => {
    if (!editableTranscript.trim() || !currentVisitId || !user) return;

    try {
      setIsProcessing(true);
      
      // Check if we have an existing transcript
      const existingTranscript = await getTranscriptByVisitId(currentVisitId);
      
      if (existingTranscript) {
        // Update existing transcript
        await updateTranscript(existingTranscript.id, {
          rawTranscript: editableTranscript,
        }, user.id);
      } else {
        // Create new transcript
        await saveTranscript(currentVisitId, {
          rawTranscript: editableTranscript,
          transcriptionMethod: 'manual',
          language: 'en',
          structured: [],
          speakers: [],
        }, user.id);
      }
      
      // Add to version history
      const newVersion: TranscriptVersion = {
        id: Date.now().toString(),
        content: editableTranscript,
        timestamp: new Date(),
        author: user?.displayName || 'Unknown',
        changes: 'Manual edit',
      };
      
      setVersions(prev => [newVersion, ...prev]);
      setTranscription(editableTranscript);
      setShowEditor(false);
      
      showNotification('Transcript saved successfully!', 'success');
      
    } catch (error) {
      showNotification('Failed to save transcript.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Export transcript
  const handleExportTranscript = async () => {
    try {
      setIsProcessing(true);
      
      const filename = `transcript-${currentVisitId}-${new Date().toISOString().split('T')[0]}`;
      await exportTranscript(transcription, exportFormat as 'pdf' | 'docx' | 'txt', filename);
      
      showNotification(`Transcript exported as ${exportFormat.toUpperCase()}!`, 'success');
      setExportDialog(false);
      
    } catch (error) {
      showNotification('Export failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Search functionality
  const highlightSearchQuery = (text: string) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  // Handle search results
  // Search functionality for future use
  // const searchResults = searchQuery.trim() ? searchTranscript(transcription, searchQuery) : [];

  // Notification helper
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ message, type, show: true });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
  };

  // File status color
  const getFileStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'error': return 'error';
      case 'uploading': return 'primary';
      default: return 'default';
    }
  };

  // File status icon
  const getFileStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckIcon />;
      case 'error': return <ErrorIcon />;
      case 'uploading': return <UploadIcon />;
      default: return <InfoIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Transcript Upload & Management
      </Typography>

      {/* Notification */}
      {notification.show && (
        <Alert 
          severity={notification.type} 
          sx={{ mb: 2 }}
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        >
          {notification.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Files
              </Typography>
              
              {/* Drag & Drop Zone */}
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.300',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: isDragActive ? 'primary.50' : 'grey.50',
                  '&:hover': {
                    bgcolor: 'primary.50',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <input {...getInputProps()} />
                <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to select files
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Support: Audio (MP3, WAV, M4A, MP4, AAC, WEBM) up to 50MB
                  <br />
                  Text (TXT, DOCX, PDF) up to 5MB
                </Typography>
              </Box>

              {/* File List */}
              {files.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Uploaded Files
                  </Typography>
                  <List>
                    {files.map((file) => (
                      <ListItem key={file.id} divider>
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          {file.isAudio ? <AudioIcon /> : <TextIcon />}
                        </Box>
                        <ListItemText
                          primary={file.name}
                          secondary={
                            <React.Fragment>
                              <Typography variant="caption" display="block">
                                {formatFileSize(file.size)}
                              </Typography>
                              {file.status === 'uploading' && (
                                <LinearProgress 
                                  variant="determinate" 
                                  value={file.progress} 
                                  sx={{ mt: 1 }}
                                />
                              )}
                              {file.processing && (
                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                  <LinearProgress sx={{ flexGrow: 1, mr: 1 }} />
                                  <Typography variant="caption">Processing...</Typography>
                                </Box>
                              )}
                            </React.Fragment>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={file.status}
                              color={getFileStatusColor(file.status)}
                              size="small"
                              icon={getFileStatusIcon(file.status)}
                            />
                            <IconButton
                              edge="end"
                              onClick={() => removeFile(file.id)}
                              size="small"
                            >
                              <CloseIcon />
                            </IconButton>
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Transcript Display */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Transcript
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    placeholder="Search in transcript..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowEditor(true)}
                    startIcon={<EditIcon />}
                    disabled={!transcription}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowVersionHistory(true)}
                    startIcon={<HistoryIcon />}
                    disabled={versions.length === 0}
                  >
                    History
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setExportDialog(true)}
                    startIcon={<DownloadIcon />}
                    disabled={!transcription}
                  >
                    Export
                  </Button>
                </Stack>
              </Box>

              {transcription ? (
                <Box>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      maxHeight: 400, 
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: highlightSearchQuery(transcription.replace(/\n/g, '<br />'))
                      }}
                    />
                  </Paper>
                  
                  {/* Transcript segments */}
                  {files.some(f => f.segments) && (
                    <Accordion sx={{ mt: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Transcript Segments</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Time</TableCell>
                                <TableCell>Speaker</TableCell>
                                <TableCell>Content</TableCell>
                                <TableCell>Confidence</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {files
                                .find(f => f.segments)
                                ?.segments?.map((segment) => (
                                  <TableRow key={segment.id}>
                                    <TableCell>
                                      {Math.floor(segment.timestamp / 60)}:
                                      {(segment.timestamp % 60).toFixed(1).padStart(4, '0')}
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={segment.speaker}
                                        size="small"
                                        color={segment.speaker === 'patient' ? 'primary' : 'secondary'}
                                        icon={segment.speaker === 'patient' ? <PersonIcon /> : <MicIcon />}
                                      />
                                    </TableCell>
                                    <TableCell>{segment.text}</TableCell>
                                    <TableCell>
                                      {segment.confidence ? (segment.confidence * 100).toFixed(1) + '%' : 'N/A'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: 200,
                    color: 'text.secondary'
                  }}
                >
                  <TextIcon sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="body1">
                    No transcript available
                  </Typography>
                  <Typography variant="caption">
                    Upload an audio file or text document to get started
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      {transcription && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(ROUTES.VISITS)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate(ROUTES.AI_ANALYSIS.replace(':id', currentVisitId || ''))}
            disabled={!transcription}
          >
            Proceed to AI Analysis
          </Button>
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditor} onClose={() => setShowEditor(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Transcript</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={editableTranscript}
            onChange={(e) => setEditableTranscript(e.target.value)}
            placeholder="Edit transcript content..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditor(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveTranscript} 
            variant="contained" 
            disabled={isProcessing}
          >
            {isProcessing ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onClose={() => setShowVersionHistory(false)} maxWidth="md" fullWidth>
        <DialogTitle>Version History</DialogTitle>
        <DialogContent>
          <List>
            {versions.map((version) => (
              <ListItem key={version.id} divider>
                <ListItemText
                  primary={`Version ${version.id}`}
                  secondary={
                    <>
                      <Typography variant="caption" display="block">
                        {format(version.timestamp, 'PPp')} by {version.author}
                      </Typography>
                      {version.changes && (
                        <Typography variant="caption" color="text.secondary">
                          {version.changes}
                        </Typography>
                      )}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <Button
                    size="small"
                    onClick={() => {
                      setTranscription(version.content);
                      setShowVersionHistory(false);
                    }}
                  >
                    Restore
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVersionHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* **NEW: Patient and Doctor Information Dialog** */}
      <Dialog open={showPatientDialog} onClose={handlePatientDialogCancel} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">Patient and Doctor Information</Typography>
          <Typography variant="body2" color="text.secondary">
            Please enter the patient and doctor information for this transcript
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Patient Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Patient Information</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={patientDoctorInfo.patientFirstName}
                onChange={(e) => setPatientDoctorInfo(prev => ({
                  ...prev,
                  patientFirstName: e.target.value
                }))}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name *"
                value={patientDoctorInfo.patientLastName}
                onChange={(e) => setPatientDoctorInfo(prev => ({
                  ...prev,
                  patientLastName: e.target.value
                }))}
                required
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={patientDoctorInfo.patientAge}
                onChange={(e) => setPatientDoctorInfo(prev => ({
                  ...prev,
                  patientAge: e.target.value
                }))}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={patientDoctorInfo.patientGender}
                  onChange={(e) => setPatientDoctorInfo(prev => ({
                    ...prev,
                    patientGender: e.target.value as any
                  }))}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Visit Type</InputLabel>
                <Select
                  value={patientDoctorInfo.visitType}
                  onChange={(e) => setPatientDoctorInfo(prev => ({
                    ...prev,
                    visitType: e.target.value as any
                  }))}
                  label="Visit Type"
                >
                  <MenuItem value="consultation">Consultation</MenuItem>
                  <MenuItem value="follow_up">Follow-up</MenuItem>
                  <MenuItem value="urgent_care">Urgent Care</MenuItem>
                  <MenuItem value="telemedicine">Telemedicine</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Doctor Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Doctor Information</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Doctor Name *"
                value={patientDoctorInfo.doctorName}
                onChange={(e) => setPatientDoctorInfo(prev => ({
                  ...prev,
                  doctorName: e.target.value
                }))}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Department"
                value={patientDoctorInfo.department}
                onChange={(e) => setPatientDoctorInfo(prev => ({
                  ...prev,
                  department: e.target.value
                }))}
                placeholder="e.g., Internal Medicine, Cardiology"
              />
            </Grid>

            {/* Visit Information */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Chief Complaint"
                multiline
                rows={3}
                value={patientDoctorInfo.chiefComplaint}
                onChange={(e) => setPatientDoctorInfo(prev => ({
                  ...prev,
                  chiefComplaint: e.target.value
                }))}
                placeholder="Describe the main reason for this visit..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePatientDialogCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handlePatientDialogSubmit} 
            variant="contained"
            disabled={isProcessing || !patientDoctorInfo.patientFirstName || !patientDoctorInfo.patientLastName || !patientDoctorInfo.doctorName}
          >
            {isProcessing ? 'Creating Patient Record...' : 'Create Patient & Save Transcript'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)}>
        <DialogTitle>Export Transcript</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Format</InputLabel>
            <Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              label="Format"
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="docx">Microsoft Word</MenuItem>
              <MenuItem value="txt">Plain Text</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleExportTranscript} 
            variant="contained"
            disabled={isProcessing}
          >
            {isProcessing ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TranscriptUpload; 