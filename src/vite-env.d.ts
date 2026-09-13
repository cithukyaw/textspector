/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROVIDER?: string;
  readonly VITE_OPENROUTER_API_KEY?: string;
  readonly VITE_OPENROUTER_DEFAULT_MODEL?: string;
  readonly VITE_OPENROUTER_MODELS?: string;
  readonly VITE_OLLAMA_BASE_URL?: string;
  readonly VITE_OLLAMA_DEFAULT_MODEL?: string;
  readonly VITE_OLLAMA_MODELS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
