/**
 * Ollama AI Text Detection Service
 *
 * Interacts with a local Ollama instance running at VITE_OLLAMA_BASE_URL.
 * Requires CORS enabled via `OLLAMA_ORIGINS="*"`.
 */

import axios from 'axios';
import { APP_CONFIG } from '../config';
import type { DetectorResult } from '../types/detector';
import { SYSTEM_PROMPT, parseDetectorResponse } from '../utils/detector.ts';

export async function analyzeTextWithOllama(text: string, model?: string): Promise<DetectorResult> {
  const baseUrl = APP_CONFIG.ollama.baseUrl.replace(/\/+$/, '');
  const selectedModel = model || APP_CONFIG.ollama.defaultModel;
  const endpoint = `${baseUrl}/api/chat`;

  const requestPayload = {
    model: selectedModel,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `Analyze the following text for AI generation markers:\n\n"""\n${text}\n"""`,
      },
    ],
    stream: false,
    format: 'json',
    options: {
      temperature: 0.1,
    },
  };

  try {
    const response = await axios.post(endpoint, requestPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });

    const content = response.data?.message?.content;
    if (!content) {
      throw new Error('Received an empty response from local Ollama.');
    }

    const result = parseDetectorResponse(content);
    result.modelUsed = selectedModel;
    result.analyzedAt = new Date().toLocaleTimeString();

    return result;
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || !error.response) {
      throw new Error(
        `Unable to reach Ollama at ${baseUrl}. Please ensure Ollama is running ('ollama serve') with CORS enabled: 'OLLAMA_ORIGINS="*" ollama serve'.`
      );
    }
    throw new Error(error.response?.data?.error || error.message || 'Ollama analysis failed.');
  }
}
