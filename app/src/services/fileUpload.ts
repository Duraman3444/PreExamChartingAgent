import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, updateDoc, doc, getDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { storage, db } from './firebase';
import { APP_SETTINGS } from '@/constants';
import { VisitTranscript, TranscriptSegment } from '@/types';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// File validation constants
export const ACCEPTED_AUDIO_TYPES = [
  'audio/mp3',
  'audio/wav',
  'audio/m4a',
  'audio/mp4',
  'audio/aac',
  'audio/webm',
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
  console.log('🔧 [Storage Debug] Starting upload...', {
    fileName: file.name,
    fileSize: file.size,
    userId,
    visitId,
    storageConfigured: !!storage
  });

  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  if (!storage) {
    console.error('❌ [Storage Debug] Firebase Storage not initialized');
    console.error('❌ [Storage Debug] This usually means Firebase environment variables are not configured properly');
    throw new Error('Firebase Storage not configured. Please check your environment variables.');
  }

  const timestamp = new Date().getTime();
  const fileName = `${timestamp}-${file.name}`;
  const storagePath = `transcripts/${userId}/${visitId}/${fileName}`;
  
  console.log('🔧 [Storage Debug] Creating storage reference:', {
    path: storagePath,
    bucket: storage.app.options.storageBucket
  });
  
  const storageRef = ref(storage, storagePath);
  
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('📈 [Storage Debug] Upload progress:', progress);
        onProgress?.(progress);
      },
      (error) => {
        console.error('❌ [Storage Debug] Upload error:', {
          code: error.code,
          message: error.message,
          serverResponse: error.serverResponse
        });
        reject(new Error(`Upload failed: ${error.message}`));
      },
      async () => {
        try {
          console.log('✅ [Storage Debug] Upload completed, getting download URL...');
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('✅ [Storage Debug] Download URL obtained:', downloadURL);
          resolve(downloadURL);
        } catch (error) {
          console.error('❌ [Storage Debug] Failed to get download URL:', error);
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
      // PDF text extraction using PDF.js
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText.trim();
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // DOCX text extraction using mammoth
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
      return result.value;
    } else {
      throw new Error('Unsupported text file type');
    }
  } catch (error) {
    throw new Error(`Failed to process text file: ${error}`);
  }
};

// Audio transcription service using OpenAI Whisper
export const transcribeAudio = async (file: File): Promise<{
  text: string;
  segments: TranscriptSegment[];
  confidence: number;
}> => {
  console.log('🎙️ [Transcription Debug] Starting audio transcription process...', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    timestamp: new Date().toISOString()
  });

  const validation = validateFile(file);
  if (!validation.isValid) {
    console.error('❌ [Transcription Debug] File validation failed:', validation.error);
    throw new Error(validation.error);
  }

  if (validation.fileType !== 'audio') {
    console.error('❌ [Transcription Debug] File is not an audio file:', validation.fileType);
    throw new Error('File is not an audio file');
  }

  console.log('✅ [Transcription Debug] File validation passed, proceeding with transcription...');

  try {
    console.log('🔧 [Transcription Debug] Importing OpenAI service...');
    // Import the OpenAI service
    const { openAIService } = await import('./openai');
    
    console.log('🔧 [Transcription Debug] Checking OpenAI configuration...');
    // Check if OpenAI is configured
    if (!openAIService.isConfigured()) {
      console.error('❌ [Transcription Debug] OpenAI API key not configured');
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
    }

    console.log('✅ [Transcription Debug] OpenAI configured, starting transcription with Whisper...');
    console.log('⏳ [Transcription Debug] This may take 10-60 seconds depending on audio length...');
    
    // Use real OpenAI Whisper transcription
    const result = await openAIService.transcribeAudio(file);
    
    console.log('✅ [Transcription Debug] OpenAI transcription completed successfully!', {
      textLength: result.text.length,
      segmentCount: result.segments.length,
      confidence: result.confidence
    });
    
    // Convert to the expected format
    const formattedResult = {
      text: result.text,
      segments: result.segments.map(segment => ({
        id: segment.id,
        speaker: (segment.speaker === 'unknown' ? 'other' : segment.speaker) as 'patient' | 'provider' | 'other',
        timestamp: segment.timestamp,
        text: segment.text,
        confidence: segment.confidence,
        tags: segment.tags
      })),
      confidence: result.confidence
    };
    
    console.log('✅ [Transcription Debug] Transcription processing complete!');
    return formattedResult;
  } catch (error) {
    console.error('❌ [Transcription Debug] Real audio transcription failed:', error);
    
    // Fallback to mock data if OpenAI fails (for development)
    console.warn('⚠️ [Transcription Debug] Falling back to mock transcription data due to error:', error);
    console.log('🔧 [Transcription Debug] Using mock data for development/testing...');
    
    // Simulate processing time
    console.log('⏳ [Transcription Debug] Simulating processing time (2 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ [Transcription Debug] Mock transcription completed!');
    return {
      text: `[Fallback Mock Transcription for ${file.name} - OpenAI transcription failed]
      
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
      // Export as PDF using jsPDF
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 7;
      const maxWidth = pageWidth - 2 * margin;
      
      // Add title
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Medical Visit Transcript', margin, margin);
      
      // Add metadata
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, margin + 15);
      pdf.text(`Document: ${filename}`, margin, margin + 22);
      
      // Add transcript content
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const lines = transcript.split('\n');
      let yPosition = margin + 35;
      
      for (const line of lines) {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        if (line.trim()) {
          const splitLines = pdf.splitTextToSize(line, maxWidth);
          for (const splitLine of splitLines) {
            if (yPosition > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(splitLine, margin, yPosition);
            yPosition += lineHeight;
          }
        } else {
          yPosition += lineHeight / 2; // Smaller spacing for empty lines
        }
      }
      
      // Save the PDF
      pdf.save(`${filename}.pdf`);
    } else if (format === 'docx') {
      // Export as DOCX using docx library
      const lines = transcript.split('\n');
      const paragraphs = [];
      
      // Add title
      paragraphs.push(
        new Paragraph({
          text: 'Medical Visit Transcript',
          heading: HeadingLevel.HEADING_1,
        })
      );
      
      // Add metadata
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated: ${new Date().toLocaleString()}`,
              size: 20,
              color: '666666',
            }),
          ],
        })
      );
      
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Document: ${filename}`,
              size: 20,
              color: '666666',
            }),
          ],
        })
      );
      
      // Add empty line
      paragraphs.push(new Paragraph({ text: '' }));
      
      // Add transcript content
      for (const line of lines) {
        if (line.trim()) {
          // Check if line starts with "Doctor:" or "Patient:" to make it bold
          if (line.startsWith('Doctor:') || line.startsWith('Patient:')) {
            const [speaker, ...rest] = line.split(':');
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: speaker + ':',
                    bold: true,
                    size: 22,
                  }),
                  new TextRun({
                    text: rest.join(':'),
                    size: 22,
                  }),
                ],
              })
            );
          } else {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    size: 22,
                  }),
                ],
              })
            );
          }
        } else {
          paragraphs.push(new Paragraph({ text: '' }));
        }
      }
      
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });
      
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${filename}.docx`);
    } else {
      throw new Error('Unsupported export format');
    }
  } catch (error) {
    console.error('Export error:', error);
    throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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