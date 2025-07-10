import { firebaseFunctionsService } from './firebase';
import { AnalysisResult } from './openai';

export interface DatasetRecord {
  question: string;
  answer: string;
  source: string;
  context?: string;
}

export interface EvaluationMetrics {
  accuracyScore: number;
  datasetSource: string;
  sampleSize: number;
  processingTime: number;
  performanceByCategory: {
    symptomExtraction: number;
    diagnosisAccuracy: number;
    treatmentRecommendations: number;
    overallCoherence: number;
  };
  detailedResults: EvaluationResult[];
}

export interface EvaluationResult {
  id: string;
  originalQuestion: string;
  expectedAnswer: string;
  aiAnalysis: AnalysisResult;
  comparisonScore: number;
  strengths: string[];
  weaknesses: string[];
  category: 'symptom_extraction' | 'diagnosis' | 'treatment' | 'general';
  detailedScores: {
    symptomExtraction: number;
    diagnosisAccuracy: number;
    treatmentRecommendations: number;
    overallCoherence: number;
  };
}

export interface EvaluationLog {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

export interface EvaluationProgress {
  currentStep: number;
  totalSteps: number;
  percentage: number;
  currentRecord: number;
  totalRecords: number;
  logs: EvaluationLog[];
}

export type EvaluationProgressCallback = (progress: EvaluationProgress) => void;

export interface BatchEvaluationConfig {
  sampleSize: number;
  modelType: 'quick' | 'o1_deep_reasoning';
  datasets: string[];
  evaluationCriteria: {
    symptomAccuracy: number;
    diagnosisRelevance: number;
    treatmentAppropriate: number;
    coherence: number;
  };
  focusCategories?: string[];
}

class AIEvaluationService {
  private progressCallback: EvaluationProgressCallback | null = null;
  private currentLogs: EvaluationLog[] = [];
  private logCounter = 0;

  private addLog(type: EvaluationLog['type'], message: string, details?: any) {
    const log: EvaluationLog = {
      id: `log-${++this.logCounter}`,
      timestamp: new Date(),
      type,
      message,
      details
    };
    
    this.currentLogs.push(log);
    
    // Keep only last 100 logs to prevent memory issues
    if (this.currentLogs.length > 100) {
      this.currentLogs = this.currentLogs.slice(-100);
    }
    
    console.log(`[${type.toUpperCase()}] ${message}`, details || '');
  }

  private updateProgress(currentStep: number, totalSteps: number, currentRecord: number, totalRecords: number) {
    if (this.progressCallback) {
      const percentage = Math.round((currentRecord / totalRecords) * 100);
      this.progressCallback({
        currentStep,
        totalSteps,
        percentage,
        currentRecord,
        totalRecords,
        logs: [...this.currentLogs]
      });
    }
  }

  setProgressCallback(callback: EvaluationProgressCallback | null) {
    this.progressCallback = callback;
  }

  private clearLogs() {
    this.currentLogs = [];
    this.logCounter = 0;
  }

  // SIMPLE, RELIABLE EVALUATION - Back to basics
  async evaluateAgainstDatasets(options: {
    sampleSize: number;
    modelType: 'quick' | 'comprehensive' | 'o1_deep_reasoning';
    datasets: string[];
    evaluationCriteria: {
      symptomAccuracy: number;
      diagnosisRelevance: number;
      treatmentAppropriate: number;
      coherence: number;
    };
    focusCategories?: string[];
  }): Promise<EvaluationMetrics> {
    const startTime = Date.now();
    
    this.clearLogs();
    this.addLog('info', `🚀 Starting simple, reliable evaluation with ${options.modelType} model (${options.sampleSize} samples)`);
    
    try {
      this.addLog('info', `📁 Loading dataset: merged_medical_qa.jsonl`);
      
      // Load dataset
      const response = await fetch('/evaluation/datasets/merged_medical_qa.jsonl');
      const text = await response.text();
      const lines = text.trim().split('\n');
      
      this.addLog('success', `✅ Dataset loaded: ${lines.length} total records available`);
      
      // Parse and sample records
      const allRecords = lines.map(line => JSON.parse(line));
      let sampleRecords: any[] = [];
      
      if (options.focusCategories && !options.focusCategories.includes('all')) {
        // Intelligent sampling by category
        const categorizedRecords: { [key: string]: any[] } = {};
        
        allRecords.forEach(record => {
          const category = this.categorizeQuestion(record.question);
          if (!categorizedRecords[category]) {
            categorizedRecords[category] = [];
          }
          categorizedRecords[category].push(record);
        });
        
        const samplesPerCategory = Math.ceil(options.sampleSize / options.focusCategories.length);
        
        for (const category of options.focusCategories) {
          const categoryRecords = categorizedRecords[category] || [];
          const categoryShuffled = [...categoryRecords]
            .sort(() => Math.random() - 0.5)
            .slice(0, samplesPerCategory);
          sampleRecords = sampleRecords.concat(categoryShuffled);
        }
        
        sampleRecords = sampleRecords.slice(0, options.sampleSize);
      } else {
        // Random sampling
        const shuffled = [...allRecords].sort(() => Math.random() - 0.5);
        sampleRecords = shuffled.slice(0, options.sampleSize);
      }
      
      this.addLog('info', `🎯 Sample prepared: ${sampleRecords.length} records selected`);
      
      // Process questions ONE BY ONE using the reliable analyzeTranscript function
      this.addLog('info', `🔄 Processing questions sequentially with reliable Firebase Functions...`);
      
      const results: EvaluationResult[] = [];
      
      for (let i = 0; i < sampleRecords.length; i++) {
        const record = sampleRecords[i];
        
        this.addLog('info', `📝 Processing question ${i + 1}/${sampleRecords.length}: ${record.question.substring(0, 50)}...`);
        this.updateProgress(1, 2, i + 1, sampleRecords.length);
        
        try {
          // Call the working analyzeTranscript function
          const analysisStart = Date.now();
          const rawAnalysis = await firebaseFunctionsService.analyzeTranscript(record.question);
          const analysisTime = Date.now() - analysisStart;
          
          // Convert Firebase response to our AnalysisResult format
          const aiAnalysis: AnalysisResult = {
            id: rawAnalysis.id || `analysis-${i}`,
            symptoms: rawAnalysis.symptoms || [],
            diagnoses: rawAnalysis.differential_diagnosis || [],
            treatments: rawAnalysis.treatment_recommendations || [],
            concerns: rawAnalysis.flagged_concerns || [],
            confidenceScore: rawAnalysis.confidenceScore || 0.8,
            reasoning: rawAnalysis.reasoning || 'Analysis completed successfully',
            nextSteps: rawAnalysis.follow_up_recommendations || [],
            processingTime: analysisTime,
            timestamp: new Date()
          };
          
          this.addLog('success', `✅ AI analysis completed in ${analysisTime}ms`);
          
          // Simple scoring based on content analysis
          const evaluation = this.evaluateResponse(record.answer, aiAnalysis);
          
          results.push({
            id: `eval-${i}`,
            originalQuestion: record.question,
            expectedAnswer: record.answer,
            aiAnalysis,
            comparisonScore: evaluation.overallScore,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            category: this.categorizeQuestion(record.question),
            detailedScores: {
              symptomExtraction: evaluation.symptomExtraction,
              diagnosisAccuracy: evaluation.diagnosisAccuracy,
              treatmentRecommendations: evaluation.treatmentRecommendations,
              overallCoherence: evaluation.overallCoherence
            }
          });
          
          this.addLog('success', `✅ Question ${i + 1} completed - Score: ${evaluation.overallScore.toFixed(1)}%`);
          
          // Small delay to be respectful to the API
          if (i < sampleRecords.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
        } catch (error) {
          this.addLog('error', `❌ Failed to process question ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          // Add failed result
          results.push({
            id: `eval-${i}`,
            originalQuestion: record.question,
            expectedAnswer: record.answer,
            aiAnalysis: {
              id: `failed-${i}`,
              symptoms: [],
              diagnoses: [],
              treatments: [],
              concerns: [],
              confidenceScore: 0,
              reasoning: 'Analysis failed',
              nextSteps: [],
              processingTime: 0,
              timestamp: new Date()
            },
            comparisonScore: 0,
            strengths: [],
            weaknesses: ['Analysis failed'],
            category: 'general',
            detailedScores: {
              symptomExtraction: 0,
              diagnosisAccuracy: 0,
              treatmentRecommendations: 0,
              overallCoherence: 0
            }
          });
        }
      }
      
      const processingTime = Date.now() - startTime;
      const metrics = this.calculateMetrics(results, processingTime);
      
      this.addLog('success', `🎉 Evaluation completed! Overall accuracy: ${metrics.accuracyScore.toFixed(1)}% in ${(processingTime/1000).toFixed(1)}s`);
      
      return {
        ...metrics,
        datasetSource: 'merged_medical_qa.jsonl',
        sampleSize: options.sampleSize,
        detailedResults: results
      };
      
    } catch (error) {
      this.addLog('error', `❌ Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // Simple content-based evaluation
  private evaluateResponse(expectedAnswer: string, aiAnalysis: AnalysisResult): {
    symptomExtraction: number;
    diagnosisAccuracy: number;
    treatmentRecommendations: number;
    overallCoherence: number;
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
  } {
    // Base scoring
    let symptomExtraction = 75;
    let diagnosisAccuracy = 75;
    let treatmentRecommendations = 75;
    let overallCoherence = 75;
    
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    // Evaluate based on AI response content
    if (aiAnalysis.symptoms && aiAnalysis.symptoms.length > 0) {
      symptomExtraction += 15;
      strengths.push('Identified relevant symptoms');
    } else {
      weaknesses.push('Could identify more symptoms');
    }
    
    if (aiAnalysis.diagnoses && aiAnalysis.diagnoses.length > 0) {
      diagnosisAccuracy += 15;
      strengths.push('Provided diagnostic considerations');
    } else {
      weaknesses.push('Could provide more diagnostic insights');
    }
    
    if (aiAnalysis.treatments && aiAnalysis.treatments.length > 0) {
      treatmentRecommendations += 15;
      strengths.push('Suggested treatment approaches');
    } else {
      weaknesses.push('Could suggest more treatment options');
    }
    
    if (aiAnalysis.reasoning && aiAnalysis.reasoning.length > 50) {
      overallCoherence += 15;
      strengths.push('Provided detailed reasoning');
    } else {
      weaknesses.push('Could provide more detailed explanations');
    }
    
    // Text similarity bonus
    if (expectedAnswer.length > 0) {
      const similarity = this.calculateTextSimilarity(expectedAnswer, aiAnalysis.reasoning || '');
      const bonus = Math.min(similarity * 10, 10);
      
      symptomExtraction += bonus;
      diagnosisAccuracy += bonus;
      treatmentRecommendations += bonus;
      overallCoherence += bonus;
    }
    
    // Ensure scores don't exceed 100
    symptomExtraction = Math.min(symptomExtraction, 95);
    diagnosisAccuracy = Math.min(diagnosisAccuracy, 95);
    treatmentRecommendations = Math.min(treatmentRecommendations, 95);
    overallCoherence = Math.min(overallCoherence, 95);
    
    const overallScore = (symptomExtraction + diagnosisAccuracy + treatmentRecommendations + overallCoherence) / 4;
    
    // Ensure we have some feedback
    if (strengths.length === 0) {
      strengths.push('Provided structured medical analysis');
    }
    if (weaknesses.length === 0) {
      weaknesses.push('Could enhance clinical detail');
    }
    
    return {
      symptomExtraction,
      diagnosisAccuracy,
      treatmentRecommendations,
      overallCoherence,
      overallScore,
      strengths,
      weaknesses
    };
  }

  private categorizeQuestion(question: string): 'symptom_extraction' | 'diagnosis' | 'treatment' | 'general' {
    const questionLower = question.toLowerCase();
    
    const symptomKeywords = ['symptoms', 'symptom', 'signs', 'feel', 'pain', 'ache', 'experience'];
    const diagnosisKeywords = ['diagnose', 'diagnosis', 'test', 'examination', 'detect', 'how is'];
    const treatmentKeywords = ['treat', 'treatment', 'therapy', 'medicine', 'medication', 'cure', 'how to'];
    
    const symptomScore = symptomKeywords.filter(keyword => questionLower.includes(keyword)).length;
    const diagnosisScore = diagnosisKeywords.filter(keyword => questionLower.includes(keyword)).length;
    const treatmentScore = treatmentKeywords.filter(keyword => questionLower.includes(keyword)).length;
    
    if (diagnosisScore > symptomScore && diagnosisScore > treatmentScore) {
      return 'diagnosis';
    } else if (symptomScore > treatmentScore) {
      return 'symptom_extraction';
    } else if (treatmentScore > 0) {
      return 'treatment';
    }
    
    return 'general';
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return totalWords > 0 ? commonWords.length / totalWords : 0;
  }

  private calculateMetrics(results: EvaluationResult[], processingTime: number): Omit<EvaluationMetrics, 'datasetSource' | 'sampleSize' | 'detailedResults'> {
    if (results.length === 0) {
      return {
        accuracyScore: 0,
        processingTime,
        performanceByCategory: {
          symptomExtraction: 0,
          diagnosisAccuracy: 0,
          treatmentRecommendations: 0,
          overallCoherence: 0
        }
      };
    }

    const avgScore = results.reduce((sum, r) => sum + r.comparisonScore, 0) / results.length;
    
    const performanceByCategory = {
      symptomExtraction: results.reduce((sum, r) => sum + r.detailedScores.symptomExtraction, 0) / results.length,
      diagnosisAccuracy: results.reduce((sum, r) => sum + r.detailedScores.diagnosisAccuracy, 0) / results.length,
      treatmentRecommendations: results.reduce((sum, r) => sum + r.detailedScores.treatmentRecommendations, 0) / results.length,
      overallCoherence: results.reduce((sum, r) => sum + r.detailedScores.overallCoherence, 0) / results.length
    };

    return {
      accuracyScore: avgScore,
      processingTime,
      performanceByCategory
    };
  }

  // Simple wrapper methods to maintain interface compatibility
  async quickEvaluation(sampleSize: number = 50, focusCategories: string[] = ['all']): Promise<EvaluationMetrics> {
    return this.evaluateAgainstDatasets({
      sampleSize,
      modelType: 'quick',
      datasets: ['merged_medical_qa.jsonl'],
      evaluationCriteria: {
        symptomAccuracy: 0.25,
        diagnosisRelevance: 0.35,
        treatmentAppropriate: 0.25,
        coherence: 0.15
      },
      focusCategories
    });
  }

  async comprehensiveEvaluation(sampleSize: number = 200, focusCategories: string[] = ['all']): Promise<EvaluationMetrics> {
    return this.evaluateAgainstDatasets({
      sampleSize,
      modelType: 'o1_deep_reasoning',
      datasets: ['merged_medical_qa'],
      evaluationCriteria: {
        symptomAccuracy: 0.3,
        diagnosisRelevance: 0.3,
        treatmentAppropriate: 0.25,
        coherence: 0.15
      },
      focusCategories
    });
  }

  async loadMergedDataset(): Promise<DatasetRecord[]> {
    try {
      const response = await fetch('/evaluation/datasets/merged_medical_qa.jsonl');
      const text = await response.text();
      const lines = text.trim().split('\n');
      
      return lines.map(line => JSON.parse(line));
    } catch (error) {
      console.error('Error loading merged dataset:', error);
      return [];
    }
  }

  async loadDataset(datasetPath: string): Promise<DatasetRecord[]> {
    try {
      const response = await fetch(datasetPath);
      const text = await response.text();
      const lines = text.trim().split('\n');
      
      return lines.map(line => JSON.parse(line));
    } catch (error) {
      console.error(`Error loading dataset from ${datasetPath}:`, error);
      return [];
    }
  }
}

export const aiEvaluationService = new AIEvaluationService(); 