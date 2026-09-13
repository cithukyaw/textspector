import React from 'react';
import { Cpu, Server } from 'lucide-react';
import { APP_CONFIG } from '../config';
import logo from '../img/logo.png';

interface HeaderProps {
  selectedOllamaModel: string;
  onSelectOllamaModel: (model: string) => void;
  isLocalPreviewActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedOllamaModel,
  onSelectOllamaModel,
  isLocalPreviewActive,
}) => {
  const isOllama = APP_CONFIG.provider === 'ollama';

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm overflow-hidden">
              <img src={logo} alt="" className="w-full h-full object-contain" />
            </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                <span className="text-slate-900">Text</span>
                <span className="text-emerald-700">Spector</span>
              </h1>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                AI Checker
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
              Check if writing sounds human or AI-generated
            </p>
          </div>
        </div>

        {/* Provider Badge and Model Selector */}
        <div className="flex items-center gap-3">
          {/* Active Provider Indicator Badge */}
          <div
            id="provider-badge"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold bg-slate-50 border-slate-200 text-slate-700"
          >
            {isOllama ? (
              <>
                <Server className="w-3.5 h-3.5 text-blue-600" />
                <span>Provider: Ollama</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                <span>Provider: OpenRouter</span>
              </>
            )}
            {isLocalPreviewActive && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
                Preview Mode
              </span>
            )}
          </div>

          {/* Model Selector Dropdown: Rendered ONLY if active provider is ollama */}
          {isOllama && (
            <div className="flex items-center gap-2">
              <label htmlFor="ollama-model-select" className="text-xs font-medium text-slate-600 hidden md:inline">
                Model:
              </label>
              <select
                id="ollama-model-select"
                value={selectedOllamaModel}
                onChange={(e) => onSelectOllamaModel(e.target.value)}
                className="text-xs font-medium bg-white border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                {APP_CONFIG.ollama.models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
