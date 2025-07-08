import { openAIService, AnalysisResult } from './openai';
import { aiEvaluationService, DatasetRecord } from './aiEvaluation';

export interface BatchAnalysisConfig {
  batchSize: number;
  maxConcurrent: number;
  delayBetweenRequests: number; // milliseconds
  modelType: 'quick' | 'o1_deep_reasoning';
  outputFormat: 'json' | 'csv' | 'jsonl';
  includeGroundTruth: boolean;
}

export interface BatchAnalysisResult {
  id: string;
  originalQuestion: string;
  expectedAnswer?: string;
  aiAnalysis: AnalysisResult;
  processingTime: number;
  timestamp: Date;
  error?: string;
}

export interface BatchAnalysisProgress {
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  errorRecords: number;
  currentBatch: number;
  totalBatches: number;
  estimatedTimeRemaining: number;
  averageProcessingTime: number;
}

export interface BatchAnalysisSession {
  id: string;
  config: BatchAnalysisConfig;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'running' | 'completed' | 'error' | 'cancelled';
  progress: BatchAnalysisProgress;
  results: BatchAnalysisResult[];
  error?: string;
}

class BatchAnalysisPipeline {
  private activeSessions: Map<string, BatchAnalysisSession> = new Map();
  private sessionCounter = 0;

  async startBatchAnalysis(
    dataset: DatasetRecord[],
    config: BatchAnalysisConfig,
    onProgress?: (progress: BatchAnalysisProgress) => void
  ): Promise<string> {
    const sessionId = `batch-${++this.sessionCounter}-${Date.now()}`;
    
    const session: BatchAnalysisSession = {
      id: sessionId,
      config,
      startTime: new Date(),
      status: 'pending',
      progress: {
        totalRecords: dataset.length,
        processedRecords: 0,
        successfulRecords: 0,
        errorRecords: 0,
        currentBatch: 0,
        totalBatches: Math.ceil(dataset.length / config.batchSize),
        estimatedTimeRemaining: 0,
        averageProcessingTime: 0
      },
      results: []
    };

    this.activeSessions.set(sessionId, session);

    // Start processing asynchronously
    this.processBatchAnalysis(sessionId, dataset, onProgress).catch(error => {
      console.error('Batch analysis failed:', error);
      session.status = 'error';
      session.error = error.message;
      session.endTime = new Date();
    });

    return sessionId;
  }

  private async processBatchAnalysis(
    sessionId: string,
    dataset: DatasetRecord[],
    onProgress?: (progress: BatchAnalysisProgress) => void
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.status = 'running';
    
    const batches = this.createBatches(dataset, session.config.batchSize);
    const processingTimes: number[] = [];

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      if (session.status === 'cancelled') break;

      const batch = batches[batchIndex];
      session.progress.currentBatch = batchIndex + 1;

      console.log(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} records)`);

      // Process batch with concurrency control
      const batchResults = await this.processBatch(batch, session.config);
      
      // Update session results
      session.results.push(...batchResults);
      
      // Update progress
      session.progress.processedRecords += batch.length;
      session.progress.successfulRecords += batchResults.filter(r => !r.error).length;
      session.progress.errorRecords += batchResults.filter(r => r.error).length;

      // Calculate timing statistics
      const batchProcessingTimes = batchResults.map(r => r.processingTime);
      processingTimes.push(...batchProcessingTimes);
      
      if (processingTimes.length > 0) {
        session.progress.averageProcessingTime = 
          processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
        
        const remainingRecords = session.progress.totalRecords - session.progress.processedRecords;
        session.progress.estimatedTimeRemaining = 
          remainingRecords * session.progress.averageProcessingTime;
      }

      // Notify progress
      if (onProgress) {
        onProgress(session.progress);
      }

      // Add delay between batches to avoid rate limiting
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, session.config.delayBetweenRequests));
      }
    }

    if (session.status !== 'cancelled') {
      session.status = 'completed';
    }
    session.endTime = new Date();

    console.log(`Batch analysis completed: ${session.progress.successfulRecords}/${session.progress.totalRecords} successful`);
  }

  private async processBatch(
    batch: DatasetRecord[],
    config: BatchAnalysisConfig
  ): Promise<BatchAnalysisResult[]> {
    const semaphore = new Semaphore(config.maxConcurrent);
    const results: BatchAnalysisResult[] = [];

    const promises = batch.map(async (record, index) => {
      await semaphore.acquire();
      
      try {
        const startTime = Date.now();
        
        let aiAnalysis: AnalysisResult;
        if (config.modelType === 'quick') {
          aiAnalysis = await openAIService.quickAnalyzeTranscript(record.question);
        } else {
          aiAnalysis = await openAIService.analyzeTranscript(record.question, undefined, false);
        }

        const processingTime = Date.now() - startTime;

        const result: BatchAnalysisResult = {
          id: `${record.source}-${index}`,
          originalQuestion: record.question,
          expectedAnswer: config.includeGroundTruth ? record.answer : undefined,
          aiAnalysis,
          processingTime,
          timestamp: new Date()
        };

        results.push(result);
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, config.delayBetweenRequests));
        
      } catch (error) {
        console.error('Failed to process record:', error);
        results.push({
          id: `${record.source}-${index}`,
          originalQuestion: record.question,
          expectedAnswer: config.includeGroundTruth ? record.answer : undefined,
          aiAnalysis: {
            id: `failed-${index}`,
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
          processingTime: 0,
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        semaphore.release();
      }
    });

    await Promise.all(promises);
    return results;
  }

  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  getSession(sessionId: string): BatchAnalysisSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  cancelSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (session && session.status === 'running') {
      session.status = 'cancelled';
      session.endTime = new Date();
      return true;
    }
    return false;
  }

  async exportResults(sessionId: string, format: 'json' | 'csv' | 'jsonl'): Promise<string> {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    switch (format) {
      case 'json':
        return JSON.stringify(session.results, null, 2);
      
      case 'jsonl':
        return session.results.map(result => JSON.stringify(result)).join('\n');
      
      case 'csv':
        const headers = [
          'ID',
          'Original Question',
          'Expected Answer',
          'AI Symptoms',
          'AI Diagnoses',
          'AI Treatments',
          'Confidence Score',
          'Processing Time',
          'Error'
        ];
        
        const csvRows = session.results.map(result => [
          result.id,
          `"${result.originalQuestion.replace(/"/g, '""')}"`,
          result.expectedAnswer ? `"${result.expectedAnswer.replace(/"/g, '""')}"` : '',
          `"${result.aiAnalysis.symptoms.map((s: any) => s.name).join('; ')}"`,
          `"${result.aiAnalysis.diagnoses.map((d: any) => d.condition).join('; ')}"`,
          `"${result.aiAnalysis.treatments.map((t: any) => t.recommendation).join('; ')}"`,
          result.aiAnalysis.confidenceScore.toString(),
          result.processingTime.toString(),
          result.error || ''
        ]);
        
        return [headers, ...csvRows].map(row => row.join(',')).join('\n');
      
      default:
        throw new Error('Unsupported export format');
    }
  }

  async runLargeScaleEvaluation(
    sampleSize: number = 1000,
    config?: Partial<BatchAnalysisConfig>
  ): Promise<string> {
    const defaultConfig: BatchAnalysisConfig = {
      batchSize: 50,
      maxConcurrent: 5,
      delayBetweenRequests: 1000,
      modelType: 'quick',
      outputFormat: 'jsonl',
      includeGroundTruth: true,
      ...config
    };

    // Load dataset
    const dataset = await aiEvaluationService.loadMergedDataset();
    const sample = dataset.slice(0, sampleSize);

    console.log(`Starting large-scale evaluation with ${sample.length} samples`);

    return this.startBatchAnalysis(sample, defaultConfig);
  }

  async runComparisonEvaluation(
    sampleSize: number = 200
  ): Promise<{ quickSessionId: string; deepSessionId: string }> {
    const dataset = await aiEvaluationService.loadMergedDataset();
    const sample = dataset.slice(0, sampleSize);

    const baseConfig: BatchAnalysisConfig = {
      batchSize: 25,
      maxConcurrent: 3,
      delayBetweenRequests: 1500,
      outputFormat: 'jsonl',
      includeGroundTruth: true,
      modelType: 'quick'
    };

    // Run quick analysis
    const quickSessionId = await this.startBatchAnalysis(sample, {
      ...baseConfig,
      modelType: 'quick'
    });

    // Run deep analysis
    const deepSessionId = await this.startBatchAnalysis(sample, {
      ...baseConfig,
      modelType: 'o1_deep_reasoning',
      delayBetweenRequests: 3000 // Longer delay for O1 model
    });

    return { quickSessionId, deepSessionId };
  }

  listActiveSessions(): BatchAnalysisSession[] {
    return Array.from(this.activeSessions.values());
  }

  getSessionSummary(sessionId: string): {
    duration: number;
    successRate: number;
    averageProcessingTime: number;
    totalCost: number;
  } | undefined {
    const session = this.activeSessions.get(sessionId);
    if (!session) return undefined;

    const duration = session.endTime ? 
      session.endTime.getTime() - session.startTime.getTime() : 
      Date.now() - session.startTime.getTime();

    const successRate = session.progress.totalRecords > 0 ? 
      (session.progress.successfulRecords / session.progress.totalRecords) * 100 : 0;

    // Estimate cost based on model type and usage
    const estimatedCostPerRequest = session.config.modelType === 'quick' ? 0.01 : 0.05;
    const totalCost = session.progress.processedRecords * estimatedCostPerRequest;

    return {
      duration,
      successRate,
      averageProcessingTime: session.progress.averageProcessingTime,
      totalCost
    };
  }
}

// Simple semaphore implementation for concurrency control
class Semaphore {
  private permits: number;
  private waitQueue: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise(resolve => {
      this.waitQueue.push(resolve);
    });
  }

  release(): void {
    this.permits++;
    const next = this.waitQueue.shift();
    if (next) {
      this.permits--;
      next();
    }
  }
}

export const batchAnalysisPipeline = new BatchAnalysisPipeline(); 