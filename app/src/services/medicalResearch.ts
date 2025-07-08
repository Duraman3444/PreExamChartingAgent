import { MedicalEvidence, ResearchContext } from './openai';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedDate?: string;
  type: 'clinical_study' | 'systematic_review' | 'guideline' | 'case_study' | 'meta_analysis';
  relevanceScore: number;
}

export interface MedicalResearchService {
  searchMedicalLiterature(query: string): Promise<SearchResult[]>;
  searchGuidelines(condition: string): Promise<SearchResult[]>;
  searchClinicalTrials(condition: string): Promise<SearchResult[]>;
  searchDrugInformation(medication: string): Promise<SearchResult[]>;
  analyzeSearchResults(results: SearchResult[], context: string): Promise<MedicalEvidence[]>;
}

class WebMedicalResearchService implements MedicalResearchService {
  private readonly MEDICAL_SITES = [
    'pubmed.ncbi.nlm.nih.gov',
    'nejm.org',
    'jamanetwork.com',
    'bmj.com',
    'thelancet.com',
    'cochrane.org',
    'uptodate.com',
    'who.int',
    'cdc.gov',
    'mayoclinic.org',
    'clevelandclinic.org',
    'medscape.com',
    'nih.gov'
  ];

  /**
   * Search medical literature using web search
   */
  async searchMedicalLiterature(query: string): Promise<SearchResult[]> {
    // Enhance query with medical terms
    const enhancedQuery = `${query} medical research clinical study evidence`;
    
    // Simulate web search (in production, this would use a real web search API)
    return this.simulateWebSearch(enhancedQuery, 'medical_literature');
  }

  /**
   * Search clinical guidelines for specific conditions
   */
  async searchGuidelines(condition: string): Promise<SearchResult[]> {
    const guidelineQuery = `${condition} clinical guidelines treatment protocol evidence-based`;
    
    return this.simulateWebSearch(guidelineQuery, 'guidelines');
  }

  /**
   * Search clinical trials for specific conditions
   */
  async searchClinicalTrials(condition: string): Promise<SearchResult[]> {
    const trialsQuery = `${condition} clinical trials randomized controlled trial RCT`;
    
    return this.simulateWebSearch(trialsQuery, 'clinical_trials');
  }

  /**
   * Search drug information and interactions
   */
  async searchDrugInformation(medication: string): Promise<SearchResult[]> {
    const drugQuery = `${medication} drug information interactions contraindications dosage`;
    
    return this.simulateWebSearch(drugQuery, 'drug_information');
  }

  /**
   * Analyze search results and convert to medical evidence
   */
  async analyzeSearchResults(results: SearchResult[], context: string): Promise<MedicalEvidence[]> {
    const evidence: MedicalEvidence[] = [];
    
    for (const result of results) {
      const medicalEvidence: MedicalEvidence = {
        id: `evidence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: result.title,
        type: result.type,
        reliability: this.assessReliability(result),
        yearPublished: this.extractYear(result.publishedDate) || new Date().getFullYear(),
        summary: result.snippet,
        relevanceScore: result.relevanceScore,
        url: result.url
      };
      
      evidence.push(medicalEvidence);
    }
    
    return evidence;
  }

  /**
   * Simulate web search (replace with real web search API in production)
   */
  private async simulateWebSearch(query: string, searchType: string): Promise<SearchResult[]> {
    // In production, this would use a real web search API like Google Custom Search API
    // For now, we'll simulate results based on the query type
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const mockResults: SearchResult[] = [];
    
    switch (searchType) {
      case 'medical_literature':
        mockResults.push(
          {
            title: `Recent advances in ${query.split(' ')[0]} research - PubMed`,
            url: 'https://pubmed.ncbi.nlm.nih.gov/example1',
            snippet: `Recent systematic review examining ${query.split(' ')[0]} with meta-analysis of 15 randomized controlled trials...`,
            source: 'PubMed',
            publishedDate: '2024',
            type: 'systematic_review',
            relevanceScore: 0.9
          },
          {
            title: `Clinical study on ${query.split(' ')[0]} treatment outcomes - NEJM`,
            url: 'https://nejm.org/example2',
            snippet: `Large multicenter clinical trial investigating efficacy of treatment protocols for ${query.split(' ')[0]}...`,
            source: 'New England Journal of Medicine',
            publishedDate: '2024',
            type: 'clinical_study',
            relevanceScore: 0.85
          }
        );
        break;
        
      case 'guidelines':
        mockResults.push(
          {
            title: `${query.split(' ')[0]} Clinical Practice Guidelines - WHO`,
            url: 'https://who.int/guidelines/example1',
            snippet: `World Health Organization clinical practice guidelines for diagnosis and management of ${query.split(' ')[0]}...`,
            source: 'World Health Organization',
            publishedDate: '2024',
            type: 'guideline',
            relevanceScore: 0.95
          },
          {
            title: `Evidence-based ${query.split(' ')[0]} Management - American College`,
            url: 'https://example-medical-college.org/guidelines',
            snippet: `Updated evidence-based guidelines for ${query.split(' ')[0]} management based on latest research...`,
            source: 'American Medical Association',
            publishedDate: '2024',
            type: 'guideline',
            relevanceScore: 0.9
          }
        );
        break;
        
      case 'clinical_trials':
        mockResults.push(
          {
            title: `Phase III clinical trial for ${query.split(' ')[0]} - ClinicalTrials.gov`,
            url: 'https://clinicaltrials.gov/example1',
            snippet: `Randomized controlled trial comparing treatment efficacy for ${query.split(' ')[0]}...`,
            source: 'ClinicalTrials.gov',
            publishedDate: '2024',
            type: 'clinical_study',
            relevanceScore: 0.8
          }
        );
        break;
        
      case 'drug_information':
        mockResults.push(
          {
            title: `${query.split(' ')[0]} Drug Information - FDA`,
            url: 'https://fda.gov/drugs/example1',
            snippet: `Comprehensive drug information for ${query.split(' ')[0]} including dosage, contraindications, and interactions...`,
            source: 'FDA',
            publishedDate: '2024',
            type: 'guideline',
            relevanceScore: 0.95
          }
        );
        break;
    }
    
    return mockResults;
  }

  /**
   * Assess reliability of search result based on source
   */
  private assessReliability(result: SearchResult): 'high' | 'medium' | 'low' {
    const highReliabilitySources = [
      'pubmed.ncbi.nlm.nih.gov',
      'nejm.org',
      'jamanetwork.com',
      'bmj.com',
      'thelancet.com',
      'cochrane.org',
      'who.int',
      'cdc.gov',
      'fda.gov'
    ];
    
    const mediumReliabilitySources = [
      'uptodate.com',
      'mayoclinic.org',
      'clevelandclinic.org',
      'medscape.com',
      'nih.gov'
    ];
    
    const domain = this.extractDomain(result.url);
    
    if (highReliabilitySources.includes(domain)) {
      return 'high';
    } else if (mediumReliabilitySources.includes(domain)) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  }

  /**
   * Extract year from published date
   */
  private extractYear(publishedDate?: string): number | null {
    if (!publishedDate) return null;
    
    const year = parseInt(publishedDate.match(/\d{4}/)?.[0] || '');
    return isNaN(year) ? null : year;
  }
}

// Enhanced Medical Research Service with AI Integration
export class EnhancedMedicalResearchService {
  private webSearch: WebMedicalResearchService;

  constructor() {
    this.webSearch = new WebMedicalResearchService();
  }

  /**
   * Perform comprehensive medical research for a clinical case
   */
  async performComprehensiveResearch(
    symptoms: string[],
    potentialDiagnoses: string[],
    patientContext: any
  ): Promise<ResearchContext> {
    const allEvidence: MedicalEvidence[] = [];
    
    // Search for symptom combinations
    for (const symptom of symptoms) {
      const results = await this.webSearch.searchMedicalLiterature(symptom);
      const evidence = await this.webSearch.analyzeSearchResults(results, symptom);
      allEvidence.push(...evidence);
    }
    
    // Search for diagnosis-specific guidelines
    for (const diagnosis of potentialDiagnoses) {
      const guidelineResults = await this.webSearch.searchGuidelines(diagnosis);
      const trialResults = await this.webSearch.searchClinicalTrials(diagnosis);
      
      const guidelineEvidence = await this.webSearch.analyzeSearchResults(guidelineResults, diagnosis);
      const trialEvidence = await this.webSearch.analyzeSearchResults(trialResults, diagnosis);
      
      allEvidence.push(...guidelineEvidence, ...trialEvidence);
    }
    
    // Search for drug interactions if medications are mentioned
    if (patientContext.medications) {
      const medications = patientContext.medications.split(',').map((med: string) => med.trim());
      for (const medication of medications) {
        const drugResults = await this.webSearch.searchDrugInformation(medication);
        const drugEvidence = await this.webSearch.analyzeSearchResults(drugResults, medication);
        allEvidence.push(...drugEvidence);
      }
    }
    
    // Analyze evidence for contradictions and gaps
    const contradictions = this.findContradictions(allEvidence);
    const gaps = this.identifyGaps(allEvidence, symptoms, potentialDiagnoses);
    const recommendations = this.generateRecommendations(allEvidence, contradictions, gaps);
    
    return {
      query: symptoms.join(', '),
      evidence: allEvidence,
      contradictions,
      gaps,
      recommendations
    };
  }

  /**
   * Find contradictions in research evidence
   */
  private findContradictions(evidence: MedicalEvidence[]): string[] {
    const contradictions: string[] = [];
    
    // Group evidence by topic/condition
    const evidenceGroups = new Map<string, MedicalEvidence[]>();
    
    for (const item of evidence) {
      const key = item.source.toLowerCase();
      if (!evidenceGroups.has(key)) {
        evidenceGroups.set(key, []);
      }
      evidenceGroups.get(key)?.push(item);
    }
    
    // Look for conflicting recommendations
    for (const [topic, items] of evidenceGroups) {
      if (items.length > 1) {
        const summaries = items.map(item => item.summary.toLowerCase());
        
        // Simple contradiction detection (can be enhanced with NLP)
        if (summaries.some(s => s.includes('recommend')) && 
            summaries.some(s => s.includes('not recommend'))) {
          contradictions.push(`Conflicting recommendations found for ${topic}`);
        }
      }
    }
    
    return contradictions;
  }

  /**
   * Identify gaps in research evidence
   */
  private identifyGaps(
    evidence: MedicalEvidence[],
    symptoms: string[],
    diagnoses: string[]
  ): string[] {
    const gaps: string[] = [];
    
    // Check for missing evidence types
    const evidenceTypes = new Set(evidence.map(e => e.type));
    
    if (!evidenceTypes.has('systematic_review')) {
      gaps.push('Limited systematic review evidence available');
    }
    
    if (!evidenceTypes.has('guideline')) {
      gaps.push('Current clinical guidelines not found');
    }
    
    if (!evidenceTypes.has('clinical_study')) {
      gaps.push('Recent clinical studies limited');
    }
    
    // Check for recent evidence
    const recentEvidence = evidence.filter(e => e.yearPublished >= 2022);
    if (recentEvidence.length < evidence.length * 0.5) {
      gaps.push('Limited recent evidence (last 2 years)');
    }
    
    return gaps;
  }

  /**
   * Generate evidence-based recommendations
   */
  private generateRecommendations(
    evidence: MedicalEvidence[],
    contradictions: string[],
    gaps: string[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Quality assessment
    const highQualityEvidence = evidence.filter(e => e.reliability === 'high');
    const evidenceRatio = highQualityEvidence.length / evidence.length;
    
    if (evidenceRatio > 0.7) {
      recommendations.push('High-quality evidence available - recommendations well-supported');
    } else if (evidenceRatio > 0.4) {
      recommendations.push('Moderate evidence quality - clinical judgment recommended');
    } else {
      recommendations.push('Limited high-quality evidence - exercise caution in decision-making');
    }
    
    // Contradiction handling
    if (contradictions.length > 0) {
      recommendations.push('Conflicting evidence found - consider individualized approach');
    }
    
    // Gap addressing
    if (gaps.length > 0) {
      recommendations.push('Evidence gaps identified - monitor for emerging research');
    }
    
    // Recency recommendations
    const recentEvidence = evidence.filter(e => e.yearPublished >= 2023);
    if (recentEvidence.length > 0) {
      recommendations.push('Recent evidence available - consider latest findings');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const medicalResearchService = new EnhancedMedicalResearchService(); 