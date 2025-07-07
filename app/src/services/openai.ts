import { auth } from './firebase';

const FIREBASE_FUNCTIONS_BASE_URL = 'https://us-central1-medicalchartingapp.cloudfunctions.net';

interface AnalysisResult {
  id: string;
  symptoms: string[];
  differential_diagnosis: {
    condition: string;
    confidence: string;
    reasoning: string;
  }[];
  treatment_recommendations: string[];
  flagged_concerns: string[];
  follow_up_recommendations: string[];
}

interface SummaryResult {
  summary: string;
}

interface AnalysisHistory {
  analyses: {
    id: string;
    patientId: string;
    visitId: string;
    analysis: AnalysisResult;
    timestamp: any;
    status: string;
  }[];
}

class OpenAIService {
  private async getAuthToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return await user.getIdToken();
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async analyzeTranscript(
    transcript: string,
    patientId?: string,
    visitId?: string
  ): Promise<AnalysisResult> {
    try {
      const result = await this.makeRequest('analyzeTranscript', {
        transcript,
        patientId,
        visitId,
      });

      return {
        id: result.id,
        symptoms: result.symptoms || [],
        differential_diagnosis: result.differential_diagnosis || [],
        treatment_recommendations: result.treatment_recommendations || [],
        flagged_concerns: result.flagged_concerns || [],
        follow_up_recommendations: result.follow_up_recommendations || [],
      };
    } catch (error) {
      console.error('Error analyzing transcript:', error);
      throw new Error('Failed to analyze transcript. Please try again.');
    }
  }

  async generateSummary(transcript: string, type: 'visit' | 'consultation' = 'visit'): Promise<string> {
    try {
      const result: SummaryResult = await this.makeRequest('generateSummary', {
        transcript,
        type,
      });

      return result.summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary. Please try again.');
    }
  }

  async getAnalysisHistory(patientId?: string, limit: number = 10): Promise<AnalysisHistory> {
    try {
      const token = await this.getAuthToken();
      
      const params = new URLSearchParams({
        limit: limit.toString(),
      });
      
      if (patientId) {
        params.append('patientId', patientId);
      }

      const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/getAnalysisHistory?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      throw new Error('Failed to fetch analysis history. Please try again.');
    }
  }
}

export const openAIService = new OpenAIService();
export default openAIService; 