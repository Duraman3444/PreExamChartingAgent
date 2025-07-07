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