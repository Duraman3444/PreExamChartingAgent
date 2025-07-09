import React, { useState } from 'react';
import { Button, Alert, Typography, CircularProgress, Box } from '@mui/material';
import { BugReport } from '@mui/icons-material';
import { openAIService } from '../../services/openai';

interface O1TestButtonProps {
  onTestComplete?: (success: boolean, error?: string) => void;
}

const O1TestButton: React.FC<O1TestButtonProps> = ({ onTestComplete }) => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string; data?: any } | null>(null);

  const runO1Test = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      console.log('🔍 [O1 Test] Starting O1 analysis test...');
      
      const testTranscript = "Patient presents with severe chest pain radiating to left arm, onset 2 hours ago. Associated with shortness of breath, diaphoresis, and nausea. Patient describes pain as crushing, 8/10 severity. No previous cardiac history. Vital signs: BP 150/90, HR 110, RR 22, O2 sat 94% on room air. Patient appears anxious and diaphoretic.";
      
      const testPatientContext = {
        age: 45,
        gender: 'male',
        medicalHistory: 'None',
        medications: 'None',
        allergies: 'None'
      };
      
      // Test regular O1 analysis
      const o1Result = await openAIService.analyzeTranscriptWithReasoning(
        testTranscript, 
        testPatientContext, 
        'o1-mini'
      );
      
      console.log('✅ [O1 Test] O1 analysis completed successfully:', o1Result);
      
      // Verify result structure
      const isValidResult = o1Result && 
        o1Result.symptoms && 
        o1Result.diagnoses && 
        o1Result.treatments && 
        o1Result.concerns && 
        o1Result.reasoning && 
        o1Result.modelUsed;
      
      if (isValidResult) {
        setResult({
          success: true,
          data: {
            symptoms: o1Result.symptoms.length,
            diagnoses: o1Result.diagnoses.length,
            treatments: o1Result.treatments.length,
            concerns: o1Result.concerns.length,
            modelUsed: o1Result.modelUsed,
            reasoningLength: o1Result.reasoning.length,
            hasReasoningTrace: !!o1Result.reasoningTrace
          }
        });
        
        if (onTestComplete) {
          onTestComplete(true);
        }
      } else {
        throw new Error('Invalid result structure received');
      }
      
    } catch (error) {
      console.error('❌ [O1 Test] O1 analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setResult({
        success: false,
        error: errorMessage
      });
      
      if (onTestComplete) {
        onTestComplete(false, errorMessage);
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box>
      <Button
        variant="outlined"
        color="primary"
        startIcon={testing ? <CircularProgress size={16} /> : <BugReport />}
        onClick={runO1Test}
        disabled={testing}
        size="small"
      >
        {testing ? 'Testing O1...' : 'Test O1 Analysis'}
      </Button>
      
      {result && (
        <Alert 
          severity={result.success ? 'success' : 'error'} 
          sx={{ mt: 2 }}
        >
          {result.success ? (
            <Box>
              <Typography variant="body2" gutterBottom>
                ✅ O1 Analysis Test Successful!
              </Typography>
              <Typography variant="caption" component="div">
                • Symptoms: {result.data.symptoms}
              </Typography>
              <Typography variant="caption" component="div">
                • Diagnoses: {result.data.diagnoses}
              </Typography>
              <Typography variant="caption" component="div">
                • Treatments: {result.data.treatments}
              </Typography>
              <Typography variant="caption" component="div">
                • Concerns: {result.data.concerns}
              </Typography>
              <Typography variant="caption" component="div">
                • Model: {result.data.modelUsed}
              </Typography>
              <Typography variant="caption" component="div">
                • Reasoning: {result.data.reasoningLength} characters
              </Typography>
              <Typography variant="caption" component="div">
                • Reasoning Trace: {result.data.hasReasoningTrace ? 'Present' : 'Missing'}
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" gutterBottom>
                ❌ O1 Analysis Test Failed
              </Typography>
              <Typography variant="caption" component="div">
                Error: {result.error}
              </Typography>
            </Box>
          )}
        </Alert>
      )}
    </Box>
  );
};

export default O1TestButton; 