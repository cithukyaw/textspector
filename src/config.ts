/**
 * Client-Side SPA Configuration
 *
 * SECURITY WARNING:
 * This application is configured as a client-side SPA per the project specification (AGENTS.md).
 * Note that third-party API keys (e.g. VITE_OPENROUTER_API_KEY) in client-side bundles are visible
 * to browser DevTools. For enterprise multi-tenant deployments, proxy requests via server-side endpoints.
 */

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

const resolvedOpenRouterModels = parseEnvModelList(
  import.meta.env.VITE_OPENROUTER_MODELS,
  []
);

const resolvedOllamaModels = parseEnvModelList(
  import.meta.env.VITE_OLLAMA_MODELS,
  []
);

export const APP_CONFIG = {
  provider: (import.meta.env.VITE_PROVIDER || 'openrouter') as 'openrouter' | 'ollama',

  openrouter: {
    proxyEndpoint: '/api/detect',
    // Model list for OpenRouter request-level model routing (driven by VITE_OPENROUTER_MODELS)
    defaultModel:
      import.meta.env.VITE_OPENROUTER_DEFAULT_MODEL || resolvedOpenRouterModels[0],
    models: resolvedOpenRouterModels,
  },

  ollama: {
    baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434',
    // Model list populated into UI Model Selector (driven by VITE_OLLAMA_MODELS)
    defaultModel:
      import.meta.env.VITE_OLLAMA_DEFAULT_MODEL || resolvedOllamaModels[0],
    models: resolvedOllamaModels,
  },
};