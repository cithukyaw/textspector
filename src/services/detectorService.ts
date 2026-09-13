import { APP_CONFIG } from '../config';
import { DetectorResult } from '../types/detector';
import { analyzeTextWithOpenRouter } from './openrouter';
import { analyzeTextWithOllama } from './ollama';
import { runForensicHeuristic } from './heuristicDetector';

export async function detectAiText(
  text: string,
  options?: {
    ollamaModel?: string;
    useLocalPreviewMode?: boolean;
  }
): Promise<DetectorResult> {
  const cleanText = text.trim();
  if (!cleanText) {
    throw new Error('Please enter or paste text to analyze.');
  }

  if (cleanText.length < 25) {
    throw new Error('Please provide at least 25 characters of text for meaningful forensic linguistic analysis.');
  }

  if (options?.useLocalPreviewMode) {
    return runForensicHeuristic(cleanText);
  }

  if (APP_CONFIG.provider === 'ollama') {
    return analyzeTextWithOllama(cleanText, options?.ollamaModel);
  }

  // Default: OpenRouter via Serverless Proxy /api/detect
  return analyzeTextWithOpenRouter(cleanText);
}
