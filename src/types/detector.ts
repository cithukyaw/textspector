export type ProviderType = 'openrouter' | 'ollama';

export type VerdictType = 'Likely Human' | 'Mixed / Edited' | 'Likely AI';

export type LevelScore = 'Low' | 'Medium' | 'High';

export interface DetectorMetrics {
  perplexityScore: LevelScore;
  burstinessScore: LevelScore;
  repetitivePhrasing: boolean;
}

export interface ParagraphAnalysis {
  paragraphIndex: number;
  score: number;
  note: string;
}

export interface DetectorResult {
  overallScore: number; // 0 to 100
  verdict: VerdictType;
  reasoning: string;
  metrics: DetectorMetrics;
  flaggedPhrases: string[];
  paragraphAnalysis: ParagraphAnalysis[];
  analyzedAt?: string;
  modelUsed?: string;
}

export interface AnalyzeRequestOptions {
  text: string;
  model?: string;
}
