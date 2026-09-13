/**
 * Client-Side SPA Configuration
 * 
 * SECURITY WARNING:
 * This application is configured as a client-side SPA per the project specification (AGENTS.md).
 * Note that third-party API keys (e.g. VITE_OPENROUTER_API_KEY) in client-side bundles are visible
 * to browser DevTools. For enterprise multi-tenant deployments, proxy requests via server-side endpoints.
 */

export const SYSTEM_PROMPT = `You are an AI text detection assistant. Analyze the provided text to see if it was written by an AI or a human.
Look for:
1. Word choice variety (whether words are predictable or natural).
2. Sentence rhythm (whether sentence lengths vary naturally or are all similar).
3. Common AI habits (repetitive phrases like "delve into", "tapestry", "in conclusion", "furthermore").

Explain your reasoning in plain, easy-to-understand English without using complicated jargon.

Return your final output STRICTLY as a valid JSON object matching this schema:
{
  "overallScore": number (0 to 100, where 100 is definitely AI),
  "verdict": "Likely Human" | "Mixed / Edited" | "Likely AI",
  "reasoning": string (clear, simple explanation for normal readers),
  "metrics": {
    "perplexityScore": "Low" | "Medium" | "High",
    "burstinessScore": "Low" | "Medium" | "High",
    "repetitivePhrasing": boolean
  },
  "flaggedPhrases": [string],
  "paragraphAnalysis": [
    {
      "paragraphIndex": number,
      "score": number,
      "note": string (short plain-English comment)
    }
  ]
}
Do not include markdown code block formatting in your JSON output if possible.`;

function parseEnvModelList(envValue: string | undefined, defaultList: string[]): string[] {
  if (!envValue || typeof envValue !== 'string') {
    return defaultList;
  }
  const parsed = envValue
    .split(',')
    .map((m) => m.trim())
    .filter((m) => m.length > 0);

  return parsed.length > 0 ? parsed : defaultList;
}

const DEFAULT_OPENROUTER_MODELS = [
  import.meta.env.VITE_OPENROUTER_DEFAULT_MODEL || 'nvidia/nemotron-3-ultra:free',
  'google/gemma-4-31b:free',
  'openai/gpt-oss-120b:free',
  'meta-llama/llama-4-scout:free',
  'openrouter/free',
];

const DEFAULT_OLLAMA_MODELS = [
  'qwen3:1.7b',
  'llama3.2:latest',
  'qwen2.5:14b',
  'qwen2.5:7b',
  'deepseek-r1:14b',
  'mistral',
];

const resolvedOpenRouterModels = parseEnvModelList(
  import.meta.env.VITE_OPENROUTER_MODELS,
  DEFAULT_OPENROUTER_MODELS
);

const resolvedOllamaModels = parseEnvModelList(
  import.meta.env.VITE_OLLAMA_MODELS,
  DEFAULT_OLLAMA_MODELS
);

export const APP_CONFIG = {
  provider: (import.meta.env.VITE_PROVIDER || 'openrouter') as 'openrouter' | 'ollama',

  openrouter: {
    proxyEndpoint: '/api/detect',
    defaultModel:
      import.meta.env.VITE_OPENROUTER_DEFAULT_MODEL ||
      resolvedOpenRouterModels[0] ||
      'nvidia/nemotron-3-ultra:free',
    // Fallback model list for OpenRouter request-level model routing (priority given to VITE_OPENROUTER_MODELS)
    models: resolvedOpenRouterModels,
  },

  ollama: {
    baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434',
    defaultModel:
      import.meta.env.VITE_OLLAMA_DEFAULT_MODEL ||
      resolvedOllamaModels[0] ||
      'qwen2.5:14b',
    // Model list populated into UI Model Selector (priority given to VITE_OLLAMA_MODELS)
    models: resolvedOllamaModels,
  },
};
