import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, updateDoc, doc, getDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { storage, db } from './firebase';
import { APP_SETTINGS } from '@/constants';
import { VisitTranscript, TranscriptSegment } from '@/types';

// File validation constants
export const ACCEPTED_AUDIO_TYPES = [
  'audio/mp3',
  'audio/wav',
  'audio/m4a',
  'audio/mp4',
  'audio/aac',
  'audio/mpeg',
  'audio/x-wav',
  'audio/x-m4a',
];

export const ACCEPTED_TEXT_TYPES = [
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/pdf',
];

export const ALL_ACCEPTED_TYPES = [...ACCEPTED_AUDIO_TYPES, ...ACCEPTED_TEXT_TYPES];

// File validation interface
interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileType: 'audio' | 'text' | 'unknown';
  size: number;
  name: string;
}

// Upload progress callback
export type UploadProgressCallback = (progress: number) => void;

// File validation function
export const validateFile = (file: File): FileValidationResult => {
  const result: FileValidationResult = {
    isValid: false,
    fileType: 'unknown',
    size: file.size,
    name: file.name,
  };

  // Check file type
  if (ACCEPTED_AUDIO_TYPES.includes(file.type)) {
    result.fileType = 'audio';
    if (file.size > APP_SETTINGS.MAX_AUDIO_FILE_SIZE) {
      result.error = `Audio file size exceeds ${APP_SETTINGS.MAX_AUDIO_FILE_SIZE / 1024 / 1024}MB limit`;
      return result;
    }
  } else if (ACCEPTED_TEXT_TYPES.includes(file.type)) {
    result.fileType = 'text';
    if (file.size > APP_SETTINGS.MAX_TRANSCRIPT_SIZE) {
      result.error = `Text file size exceeds ${APP_SETTINGS.MAX_TRANSCRIPT_SIZE / 1024 / 1024}MB limit`;
      return result;
    }
  } else {
    result.error = `Unsupported file type: ${file.type}. Supported types: ${ALL_ACCEPTED_TYPES.join(', ')}`;
    return result;
  }

  // Check file name
  if (file.name.length > 255) {
    result.error = 'File name is too long (max 255 characters)';
    return result;
  }

  // Check for empty file
  if (file.size === 0) {
    result.error = 'File is empty';
    return result;
  }

  result.isValid = true;
  return result;
};

// Upload file to Firebase Storage
export const uploadFileToStorage = async (
  file: File,
  visitId: string,
  userId: string,
  onProgress?: UploadProgressCallback
): Promise<string> => {
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const timestamp = new Date().getTime();
  const fileName = `${timestamp}-${file.name}`;
  const storageRef = ref(storage, `transcripts/${userId}/${visitId}/${fileName}`);
  
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => {
        console.error('Upload error:', error);
        reject(new Error(`Upload failed: ${error.message}`));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(new Error(`Failed to get download URL: ${error}`));
        }
      }
    );
  });
};

// Delete file from Firebase Storage
export const deleteFileFromStorage = async (fileUrl: string): Promise<void> => {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file from storage');
  }
};

// Process text file content
export const processTextFile = async (file: File): Promise<string> => {
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  if (validation.fileType !== 'text') {
    throw new Error('File is not a text file');
  }

  try {
    if (file.type === 'text/plain') {
      return await file.text();
    } else if (file.type === 'application/pdf') {
      // TODO: Implement PDF text extraction
      throw new Error('PDF text extraction not yet implemented');
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // TODO: Implement DOCX text extraction
      throw new Error('DOCX text extraction not yet implemented');
    } else {
      throw new Error('Unsupported text file type');
    }
  } catch (error) {
    throw new Error(`Failed to process text file: ${error}`);
  }
};

// Audio transcription service (placeholder for OpenAI Whisper integration)
export const transcribeAudio = async (file: File): Promise<{
  text: string;
  segments: TranscriptSegment[];
  confidence: number;
}> => {
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  if (validation.fileType !== 'audio') {
    throw new Error('File is not an audio file');
  }

  try {
    // TODO: Implement OpenAI Whisper API integration
    // For now, return mock data
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time
    
    return {
      text: `[Mock Transcription for ${file.name}]
      
Patient: Good morning, Doctor. I've been experiencing some chest pain for the past few days.

Doctor: Good morning. Can you describe the chest pain in more detail? When did it start exactly?

Patient: It started about three days ago. It's a sharp pain, mainly on the left side. It gets worse when I breathe deeply or move around.

Doctor: On a scale of 1 to 10, how would you rate the pain intensity?

Patient: I'd say it's about a 7 when it's at its worst, maybe a 4 when I'm resting.

Doctor: Any other symptoms? Shortness of breath, nausea, or sweating?

Patient: Yes, I've been feeling short of breath, especially when climbing stairs. No nausea or sweating though.

Doctor: Have you had any recent chest injuries or trauma?

Patient: No, nothing that I can recall.

Doctor: What medications are you currently taking?

Patient: Just my blood pressure medication, lisinopril 10mg daily.

Doctor: Any family history of heart problems or lung issues?

Patient: My father had a heart attack when he was 65, but I've never had any heart problems myself.

Doctor: Based on your symptoms, I'd like to run some tests to rule out any serious conditions. We'll start with an EKG and chest X-ray.`,
      segments: [
        {
          id: '1',
          speaker: 'patient',
          timestamp: 0,
          text: "Good morning, Doctor. I've been experiencing some chest pain for the past few days.",
          confidence: 0.92,
          tags: ['greeting', 'chief_complaint', 'chest_pain']
        },
        {
          id: '2',
          speaker: 'provider',
          timestamp: 5.2,
          text: "Good morning. Can you describe the chest pain in more detail? When did it start exactly?",
          confidence: 0.95,
          tags: ['greeting', 'history_taking', 'pain_assessment']
        },
        {
          id: '3',
          speaker: 'patient',
          timestamp: 10.1,
          text: "It started about three days ago. It's a sharp pain, mainly on the left side. It gets worse when I breathe deeply or move around.",
          confidence: 0.88,
          tags: ['symptom_description', 'chest_pain', 'pain_quality']
        },
        {
          id: '4',
          speaker: 'provider',
          timestamp: 18.5,
          text: "On a scale of 1 to 10, how would you rate the pain intensity?",
          confidence: 0.94,
          tags: ['pain_scale', 'assessment']
        },
        {
          id: '5',
          speaker: 'patient',
          timestamp: 21.8,
          text: "I'd say it's about a 7 when it's at its worst, maybe a 4 when I'm resting.",
          confidence: 0.91,
          tags: ['pain_scale', 'pain_intensity']
        },
        {
          id: '6',
          speaker: 'provider',
          timestamp: 26.2,
          text: "Any other symptoms? Shortness of breath, nausea, or sweating?",
          confidence: 0.96,
          tags: ['symptom_review', 'associated_symptoms']
        },
        {
          id: '7',
          speaker: 'patient',
          timestamp: 29.5,
          text: "Yes, I've been feeling short of breath, especially when climbing stairs. No nausea or sweating though.",
          confidence: 0.89,
          tags: ['dyspnea', 'exertional_symptoms']
        },
        {
          id: '8',
          speaker: 'provider',
          timestamp: 35.1,
          text: "Have you had any recent chest injuries or trauma?",
          confidence: 0.97,
          tags: ['history_taking', 'trauma_history']
        },
        {
          id: '9',
          speaker: 'patient',
          timestamp: 37.8,
          text: "No, nothing that I can recall.",
          confidence: 0.93,
          tags: ['negative_history']
        },
        {
          id: '10',
          speaker: 'provider',
          timestamp: 40.2,
          text: "What medications are you currently taking?",
          confidence: 0.98,
          tags: ['medication_history']
        },
        {
          id: '11',
          speaker: 'patient',
          timestamp: 42.5,
          text: "Just my blood pressure medication, lisinopril 10mg daily.",
          confidence: 0.86,
          tags: ['medications', 'antihypertensive']
        },
        {
          id: '12',
          speaker: 'provider',
          timestamp: 46.8,
          text: "Any family history of heart problems or lung issues?",
          confidence: 0.95,
          tags: ['family_history', 'cardiac_history']
        },
        {
          id: '13',
          speaker: 'patient',
          timestamp: 49.2,
          text: "My father had a heart attack when he was 65, but I've never had any heart problems myself.",
          confidence: 0.90,
          tags: ['family_history', 'cardiac_history', 'personal_history']
        },
        {
          id: '14',
          speaker: 'provider',
          timestamp: 54.5,
          text: "Based on your symptoms, I'd like to run some tests to rule out any serious conditions. We'll start with an EKG and chest X-ray.",
          confidence: 0.93,
          tags: ['plan', 'diagnostic_tests', 'ekg', 'chest_xray']
        }
      ],
      confidence: 0.92
    };
  } catch (error) {
    throw new Error(`Audio transcription failed: ${error}`);
  }
};

// Save transcript to Firestore
export const saveTranscript = async (
  visitId: string,
  transcript: Partial<VisitTranscript>,
  userId: string
): Promise<string> => {
  try {
    const transcriptData = {
      visitId,
      ...transcript,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
    };

    const docRef = await addDoc(collection(db, 'transcripts'), transcriptData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving transcript:', error);
    throw new Error('Failed to save transcript to database');
  }
};

// Update transcript in Firestore
export const updateTranscript = async (
  transcriptId: string,
  updates: Partial<VisitTranscript>,
  userId: string
): Promise<void> => {
  try {
    const transcriptRef = doc(db, 'transcripts', transcriptId);
    await updateDoc(transcriptRef, {
      ...updates,
      updatedAt: new Date(),
      updatedBy: userId,
    });
  } catch (error) {
    console.error('Error updating transcript:', error);
    throw new Error('Failed to update transcript');
  }
};

// Get transcript by visit ID
export const getTranscriptByVisitId = async (visitId: string): Promise<VisitTranscript | null> => {
  try {
    const q = query(
      collection(db, 'transcripts'),
      where('visitId', '==', visitId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as VisitTranscript;
  } catch (error) {
    console.error('Error getting transcript:', error);
    throw new Error('Failed to retrieve transcript');
  }
};

// Get transcript by ID
export const getTranscriptById = async (transcriptId: string): Promise<VisitTranscript | null> => {
  try {
    const docRef = doc(db, 'transcripts', transcriptId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as VisitTranscript;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting transcript by ID:', error);
    throw new Error('Failed to retrieve transcript');
  }
};

// Export transcript to different formats
export const exportTranscript = async (
  transcript: string,
  format: 'pdf' | 'docx' | 'txt',
  filename: string
): Promise<void> => {
  try {
    if (format === 'txt') {
      // Export as plain text
      const blob = new Blob([transcript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // TODO: Implement PDF export using jsPDF or similar
      throw new Error('PDF export not yet implemented');
    } else if (format === 'docx') {
      // TODO: Implement DOCX export using docx library
      throw new Error('DOCX export not yet implemented');
    } else {
      throw new Error('Unsupported export format');
    }
  } catch (error) {
    throw new Error(`Export failed: ${error}`);
  }
};

// Search within transcript
export const searchTranscript = (
  transcript: string,
  query: string,
  caseSensitive: boolean = false
): Array<{ index: number; text: string; context: string }> => {
  if (!query.trim()) return [];
  
  const searchText = caseSensitive ? transcript : transcript.toLowerCase();
  const searchQuery = caseSensitive ? query : query.toLowerCase();
  const results = [];
  
  let index = 0;
  while ((index = searchText.indexOf(searchQuery, index)) !== -1) {
    const start = Math.max(0, index - 50);
    const end = Math.min(transcript.length, index + searchQuery.length + 50);
    const context = transcript.substring(start, end);
    
    results.push({
      index,
      text: transcript.substring(index, index + searchQuery.length),
      context,
    });
    
    index += searchQuery.length;
  }
  
  return results;
};

// Get file type icon
export const getFileTypeIcon = (fileType: string): string => {
  if (ACCEPTED_AUDIO_TYPES.includes(fileType)) {
    return 'audio';
  } else if (ACCEPTED_TEXT_TYPES.includes(fileType)) {
    return 'text';
  } else {
    return 'unknown';
  }
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file extension
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// Validate file extension
export const isValidFileExtension = (filename: string): boolean => {
  const extension = getFileExtension(filename).toLowerCase();
  const validExtensions = [
    ...APP_SETTINGS.ALLOWED_AUDIO_TYPES,
    ...APP_SETTINGS.ALLOWED_TEXT_TYPES,
  ].map(ext => ext.replace('.', ''));
  
  return validExtensions.includes(extension);
}; 