import React from 'react';
import { AlertTriangle, Terminal, Sparkles, Server } from 'lucide-react';
import { APP_CONFIG } from '../config';

interface EnvironmentNoticeProps {
  isLocalPreviewActive: boolean;
  onToggleLocalPreview: (active: boolean) => void;
  errorMessage?: string | null;
}

export const EnvironmentNotice: React.FC<EnvironmentNoticeProps> = ({
  isLocalPreviewActive,
  onToggleLocalPreview,
  errorMessage,
}) => {
  const isOllama = APP_CONFIG.provider === 'ollama';

  if (!errorMessage && !isLocalPreviewActive) {
    return null;
  }

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-amber-950">
              {errorMessage && errorMessage !== 'MISSING_OPENROUTER_KEY'
                ? 'Analysis Notice'
                : isOllama
                ? 'Ollama Configuration Guide'
                : 'Serverless Proxy (POST /api/detect)'}
            </h3>

            {/* Toggle Preview Button */}
            {!isOllama && (
              <button
                id="toggle-preview-mode-btn"
                type="button"
                onClick={() => onToggleLocalPreview(!isLocalPreviewActive)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors shadow-2xs ${
                  isLocalPreviewActive
                    ? 'bg-amber-700 text-white hover:bg-amber-800'
                    : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {isLocalPreviewActive ? 'Offline Mode Active' : 'Enable Instant Offline Checker'}
              </button>
            )}
          </div>

          <div className="mt-2 text-xs sm:text-sm text-amber-900 leading-relaxed space-y-1.5">
            {errorMessage && errorMessage !== 'MISSING_OPENROUTER_KEY' ? (
              <p className="font-medium text-red-700">{errorMessage}</p>
            ) : isOllama ? (
              <>
                <p>
                  Make sure Ollama is running on your computer with cross-origin access enabled:
                </p>
                <div className="mt-2 bg-slate-900 text-slate-100 font-mono text-xs px-3 py-2 rounded-md flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>OLLAMA_ORIGINS="*" ollama serve</span>
                </div>
              </>
            ) : (
              <>
                <p>
                  Requests are sent through the backend proxy at{' '}
                  <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-950 font-semibold">
                    POST /api/detect
                  </code>
                  .
                </p>
                <p className="text-xs text-amber-800">
                  On Vercel, just add{' '}
                  <code className="font-mono font-semibold">OPENROUTER_API_KEY</code> in your Project Settings under Environment Variables. Your key stays private on the server.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
