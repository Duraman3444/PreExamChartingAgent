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

  // File upload handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      isAudio: Object.keys(ACCEPTED_AUDIO_TYPES).includes(file.type),
      progress: 0,
      status: 'pending',
      processing: false,
    }));
    
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
      
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, status: 'completed', progress: 100 }
          : f
      ));

      showNotification('File uploaded successfully!', 'success');

      // If audio file, start transcription
      if (fileData.isAudio) {
        await processAudioTranscription(fileData);
      } else {
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
    try {
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, processing: true }
          : f
      ));

      // Use the transcription service
      const transcriptionResult = await transcribeAudio(fileData.file);

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
      showNotification('Audio transcription completed successfully!', 'success');

    } catch (error) {
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
    try {
      const text = await processTextFile(fileData.file);
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, transcription: text, confidence: 1.0 }
          : f
      ));
      setTranscription(text);
      showNotification('Text file processed successfully!', 'success');
    } catch (error) {
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
                  Support: Audio (MP3, WAV, M4A, MP4, AAC) up to 50MB
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
                            <Box>
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
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                  <LinearProgress sx={{ flexGrow: 1, mr: 1 }} />
                                  <Typography variant="caption">Processing...</Typography>
                                </Box>
                              )}
                            </Box>
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