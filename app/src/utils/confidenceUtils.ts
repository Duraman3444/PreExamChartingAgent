/**
 * Utility functions for handling confidence scores and probabilities
 */

export const formatConfidenceScore = (score: number): string => {
  // Ensure score is between 0 and 1
  let normalizedScore = score;
  
  if (score > 1) {
    // If score is likely in percentage format (0-100), convert to decimal
    normalizedScore = Math.min(score / 100, 1);
  }
  
  // Ensure it's within valid range
  normalizedScore = Math.max(0, Math.min(normalizedScore, 1));
  
  // Convert to percentage and format
  return `${Math.round(normalizedScore * 100)}%`;
};

export const formatProbability = (probability: number): string => {
  return formatConfidenceScore(probability);
};

export const getConfidenceColor = (score: number): 'success' | 'warning' | 'error' => {
  const normalizedScore = score > 1 ? score / 100 : score;
  
  if (normalizedScore >= 0.8) return 'success';
  if (normalizedScore >= 0.6) return 'warning';
  return 'error';
};

export const getProbabilityColor = (probability: number): 'success' | 'warning' | 'error' => {
  return getConfidenceColor(probability);
}; 