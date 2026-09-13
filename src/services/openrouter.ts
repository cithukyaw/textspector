/**
 * OpenRouter AI Text Detection Service (Serverless Proxy Client)
 * 
 * Proxies requests via the backend serverless endpoint POST /api/detect.
 * Does NOT require or send VITE_OPENROUTER_API_KEY from the browser client,
 * keeping the API key completely secure on the backend.
 */

import axios from 'axios';
import { APP_CONFIG } from '../config';
import { DetectorResult } from '../types/detector';

export async function analyzeTextWithOpenRouter(text: string): Promise<DetectorResult> {
  const endpoint = APP_CONFIG.openrouter.proxyEndpoint || '/api/detect';

  try {
    const response = await axios.post<DetectorResult>(
      endpoint,
      {
        text,
        model: APP_CONFIG.openrouter.defaultModel,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    return response.data;
  } catch (error: any) {
    if (
      error.response?.data?.error === 'MISSING_OPENROUTER_KEY' ||
      error.response?.data?.message?.includes('OPENROUTER_API_KEY')
    ) {
      throw new Error('MISSING_OPENROUTER_KEY');
    }

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Proxy connection failed while analyzing text.';

    throw new Error(message);
  }
}
