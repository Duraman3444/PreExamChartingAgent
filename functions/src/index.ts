import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { OpenAI } from 'openai';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize CORS
const corsHandler = cors({ origin: true });

// Initialize OpenAI with config
const openai = new OpenAI({
  apiKey: functions.config().openai.api_key,
});

// Medical analysis prompt
const MEDICAL_ANALYSIS_PROMPT = `
You are a medical AI assistant. Analyze the following patient transcript and provide a structured analysis in JSON format with the following fields:

{
  "symptoms": ["list of symptoms mentioned"],
  "differential_diagnosis": [
    {
      "condition": "condition name",
      "confidence": "high/medium/low",
      "reasoning": "brief explanation"
    }
  ],
  "treatment_recommendations": ["list of treatment recommendations"],
  "flagged_concerns": ["any urgent concerns or red flags"],
  "follow_up_recommendations": ["recommended follow-up actions"]
}

Be thorough but concise. Focus on clinical accuracy and patient safety.
`;

// Analyze transcript function
export const analyzeTranscript = functions.https.onRequest(async (request, response) => {
  return corsHandler(request, response, async () => {
    try {
      // Check authentication
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const token = authHeader.split('Bearer ')[1];
      
      try {
        await admin.auth().verifyIdToken(token);
      } catch (error) {
        response.status(401).json({ error: 'Invalid token' });
        return;
      }

      // Get request data
      const { transcript, patientId, visitId } = request.body;
      
      if (!transcript) {
        response.status(400).json({ error: 'Transcript is required' });
        return;
      }

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: MEDICAL_ANALYSIS_PROMPT },
          { role: 'user', content: `Transcript: ${transcript}` }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const analysisText = completion.choices[0]?.message?.content;
      
      if (!analysisText) {
        throw new Error('No analysis received from OpenAI');
      }

      // Parse the JSON response
      let analysis;
      try {
        analysis = JSON.parse(analysisText);
      } catch (parseError) {
        // If JSON parsing fails, create a structured response
        analysis = {
          symptoms: [],
          differential_diagnosis: [],
          treatment_recommendations: [],
          flagged_concerns: [],
          follow_up_recommendations: [],
          raw_response: analysisText
        };
      }

      // Save to Firestore
      const analysisData = {
        patientId: patientId || null,
        visitId: visitId || null,
        transcript,
        analysis,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'completed'
      };

      const docRef = await admin.firestore().collection('analyses').add(analysisData);

      response.json({
        id: docRef.id,
        ...analysis
      });

    } catch (error) {
      console.error('Error analyzing transcript:', error);
      response.status(500).json({ 
        error: 'Failed to analyze transcript',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// Generate summary function
export const generateSummary = functions.https.onRequest(async (request, response) => {
  return corsHandler(request, response, async () => {
    try {
      // Check authentication
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const token = authHeader.split('Bearer ')[1];
      
      try {
        await admin.auth().verifyIdToken(token);
      } catch (error) {
        response.status(401).json({ error: 'Invalid token' });
        return;
      }

      const { transcript, type = 'visit' } = request.body;
      
      if (!transcript) {
        response.status(400).json({ error: 'Transcript is required' });
        return;
      }

      const summaryPrompt = `
        Provide a concise medical summary of the following ${type} transcript. 
        Focus on key clinical points, patient concerns, and any important observations.
        Keep it professional and structured.
        
        Transcript: ${transcript}
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a medical assistant providing clinical summaries.' },
          { role: 'user', content: summaryPrompt }
        ],
        temperature: 0.1,
        max_tokens: 500,
      });

      const summary = completion.choices[0]?.message?.content;
      
      if (!summary) {
        throw new Error('No summary received from OpenAI');
      }

      response.json({ summary });

    } catch (error) {
      console.error('Error generating summary:', error);
      response.status(500).json({ 
        error: 'Failed to generate summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// Get analysis history function
export const getAnalysisHistory = functions.https.onRequest(async (request, response) => {
  return corsHandler(request, response, async () => {
    try {
      // Check authentication
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const token = authHeader.split('Bearer ')[1];
      
      try {
        await admin.auth().verifyIdToken(token);
      } catch (error) {
        response.status(401).json({ error: 'Invalid token' });
        return;
      }

      const { patientId, limit = 10 } = request.query;

      let query = admin.firestore().collection('analyses')
        .orderBy('timestamp', 'desc')
        .limit(Number(limit));

      if (patientId) {
        query = query.where('patientId', '==', patientId);
      }

      const snapshot = await query.get();
      const analyses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      response.json({ analyses });

    } catch (error) {
      console.error('Error fetching analysis history:', error);
      response.status(500).json({ 
        error: 'Failed to fetch analysis history',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// Transcribe audio function
export const transcribeAudio = functions.https.onRequest(async (request, response) => {
  return corsHandler(request, response, async () => {
    try {
      // Check authentication
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const token = authHeader.split('Bearer ')[1];
      
      try {
        await admin.auth().verifyIdToken(token);
      } catch (error) {
        response.status(401).json({ error: 'Invalid token' });
        return;
      }

      // Get request data
      const { audioFileUrl, visitId } = request.body;
      
      if (!audioFileUrl) {
        response.status(400).json({ error: 'Audio file URL is required' });
        return;
      }

      // Download audio file from Firebase Storage
      // Note: In production, you'd want to stream this directly to OpenAI
      // For now, we'll use a placeholder response
      
      // TODO: Implement actual OpenAI Whisper API call
      // const transcription = await openai.audio.transcriptions.create({
      //   file: audioFileStream,
      //   model: 'whisper-1',
      //   response_format: 'verbose_json',
      //   timestamp_granularities: ['segment'],
      // });

      // Mock response for now
      const mockResponse = {
        text: `[Transcription for visit ${visitId}]
        
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
        confidence: 0.92,
        duration: 65.8,
        language: 'en'
      };

      // Save transcription to Firestore
      const transcriptionData = {
        visitId: visitId || null,
        audioFileUrl,
        transcription: mockResponse.text,
        segments: mockResponse.segments,
        confidence: mockResponse.confidence,
        duration: mockResponse.duration,
        language: mockResponse.language,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'completed'
      };

      const docRef = await admin.firestore().collection('transcriptions').add(transcriptionData);

      response.json({
        id: docRef.id,
        ...mockResponse
      });

    } catch (error) {
      console.error('Error transcribing audio:', error);
      response.status(500).json({ 
        error: 'Failed to transcribe audio',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}); 

// AI Evaluation function
export const evaluateQuestion = functions.https.onRequest(async (request, response) => {
  return corsHandler(request, response, async () => {
    try {
      // Check authentication
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const token = authHeader.split('Bearer ')[1];
      
      try {
        await admin.auth().verifyIdToken(token);
      } catch (error) {
        response.status(401).json({ error: 'Invalid token' });
        return;
      }

      const { question, expectedAnswer, aiAnalysis, evaluationPrompt } = request.body;
      
      if (!question || !expectedAnswer || !aiAnalysis) {
        response.status(400).json({ error: 'Question, expectedAnswer, and aiAnalysis are required' });
        return;
      }

      // Call OpenAI API for evaluation
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: evaluationPrompt },
          { 
            role: 'user', 
            content: `ORIGINAL QUESTION: ${question}\n\nEXPECTED ANSWER: ${expectedAnswer}\n\nAI ANALYSIS: ${JSON.stringify(aiAnalysis)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      const evaluationText = completion.choices[0]?.message?.content;
      
      if (!evaluationText) {
        throw new Error('No evaluation received from OpenAI');
      }

      // Parse the JSON response
      let evaluation;
      try {
        evaluation = JSON.parse(evaluationText);
      } catch (parseError) {
        throw new Error('Failed to parse evaluation response');
      }

      response.json(evaluation);

    } catch (error) {
      console.error('Error evaluating question:', error);
      response.status(500).json({ 
        error: 'Failed to evaluate question',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// Batch Analysis function for evaluation
export const batchAnalyzeQuestions = functions.https.onRequest(async (request, response) => {
  return corsHandler(request, response, async () => {
    try {
      // Check authentication
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const token = authHeader.split('Bearer ')[1];
      
      try {
        await admin.auth().verifyIdToken(token);
      } catch (error) {
        response.status(401).json({ error: 'Invalid token' });
        return;
      }

      const { questions, analysisPrompt } = request.body;
      
      if (!questions || !Array.isArray(questions)) {
        response.status(400).json({ error: 'Questions array is required' });
        return;
      }

      const results = [];
      
      for (const question of questions) {
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: analysisPrompt },
              { role: 'user', content: question }
            ],
            temperature: 0.1,
            max_tokens: 1000,
            response_format: { type: 'json_object' }
          });

          const analysisText = completion.choices[0]?.message?.content;
          
          if (analysisText) {
            try {
              const analysis = JSON.parse(analysisText);
              results.push({
                question,
                analysis,
                success: true
              });
            } catch (parseError) {
              results.push({
                question,
                analysis: null,
                success: false,
                error: 'Failed to parse analysis'
              });
            }
          } else {
            results.push({
              question,
              analysis: null,
              success: false,
              error: 'No analysis received'
            });
          }
        } catch (error) {
          results.push({
            question,
            analysis: null,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      response.json({ results });

    } catch (error) {
      console.error('Error in batch analysis:', error);
      response.status(500).json({ 
        error: 'Failed to perform batch analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// Enhanced Analysis function with O1 reasoning support
export const analyzeWithReasoning = functions.https.onRequest(async (request, response) => {
  return corsHandler(request, response, async () => {
    try {
      // Check authentication
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const token = authHeader.split('Bearer ')[1];
      
      try {
        await admin.auth().verifyIdToken(token);
      } catch (error) {
        response.status(401).json({ error: 'Invalid token' });
        return;
      }

      const { transcript, patientContext, modelType = 'o1-mini', analysisPrompt } = request.body;
      
      if (!transcript) {
        response.status(400).json({ error: 'Transcript is required' });
        return;
      }

      // Determine model to use
      const model = modelType === 'o1' ? 'o1-preview' : 'o1-mini';
      
      // Call OpenAI API with O1 reasoning
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          { 
            role: 'user', 
            content: `${analysisPrompt}\n\nTranscript: ${transcript}\n\nPatient Context: ${JSON.stringify(patientContext || {})}` 
          }
        ],
        temperature: 1.0, // O1 models use temperature 1.0
        max_completion_tokens: 4000,
      });

      const analysisText = completion.choices[0]?.message?.content;
      
      if (!analysisText) {
        throw new Error('No analysis received from OpenAI');
      }

      // Parse the JSON response
      let analysis;
      try {
        analysis = JSON.parse(analysisText);
      } catch (parseError) {
        // If JSON parsing fails, create a structured response
        analysis = {
          symptoms: [],
          diagnoses: [],
          treatments: [],
          concerns: [],
          reasoning: analysisText,
          confidenceScore: 0
        };
      }

      // Add reasoning trace information
      const reasoningTrace = {
        sessionId: `session-${Date.now()}`,
        totalSteps: 1,
        steps: [{
          id: 'reasoning-1',
          timestamp: Date.now(),
          type: 'analysis',
          title: 'Medical Analysis with Reasoning',
          content: analysisText,
          confidence: 0.9
        }],
        startTime: Date.now(),
        endTime: Date.now(),
        model: model,
        reasoning: analysisText
      };

      response.json({
        ...analysis,
        reasoningTrace,
        modelUsed: modelType,
        thinkingTime: completion.usage?.completion_tokens || 0
      });

    } catch (error) {
      console.error('Error analyzing with reasoning:', error);
      response.status(500).json({ 
        error: 'Failed to analyze with reasoning',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}); 