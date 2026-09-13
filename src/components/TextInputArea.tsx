import React from 'react';
import { Sparkles, Trash2, Loader2, FileText } from 'lucide-react';
import { SAMPLE_TEXTS, SampleText } from '../data/sampleTexts';

interface TextInputAreaProps {
  text: string;
  onChangeText: (text: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  onClear: () => void;
}

export const TextInputArea: React.FC<TextInputAreaProps> = ({
  text,
  onChangeText,
  onAnalyze,
  isLoading,
  onClear,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const paragraphCount = text.trim()
    ? text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean).length
    : 0;

  const handleSelectSample = (sample: SampleText) => {
    onChangeText(sample.text);
  };

  const isAnalyzeDisabled = isLoading || text.trim().length < 25;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Sample Selector Bar */}
      <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>Try an example:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {SAMPLE_TEXTS.map((sample) => (
            <button
              key={sample.id}
              id={`load-sample-${sample.id}`}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                sample.type === 'ai'
                  ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                  : sample.type === 'human'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              {sample.title}
            </button>
          ))}
          {text.trim().length > 0 && (
            <button
              id="clear-text-btn"
              type="button"
              onClick={onClear}
              disabled={isLoading}
              className="px-2 py-1 text-xs font-medium rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="p-4 sm:p-5">
        <label htmlFor="detector-input-textarea" className="sr-only">
          Text to analyze for AI patterns
        </label>
        <textarea
          ref={textareaRef}
          id="detector-input-textarea"
          rows={7}
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Paste or type your text here (minimum 25 characters) to see how likely it was written by AI..."
          disabled={isLoading}
          className="w-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent border-0 focus:outline-none resize-y min-h-[160px] leading-relaxed font-sans"
        />

        {/* Footer info & Analyze Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Metrics / Word count */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span>
              <strong className="text-slate-700 font-semibold">{wordCount}</strong> words
            </span>
            <span>•</span>
            <span>
              <strong className="text-slate-700 font-semibold">{charCount}</strong> characters
            </span>
            <span>•</span>
            <span>
              <strong className="text-slate-700 font-semibold">{paragraphCount}</strong> paragraphs
            </span>
            {charCount > 0 && charCount < 25 && (
              <span className="text-amber-600 text-xs font-normal">
                (at least 25 characters needed)
              </span>
            )}
          </div>

          {/* Action Button */}
          <button
            id="analyze-text-btn"
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzeDisabled}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
              isAnalyzeDisabled
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Checking text...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Check Text</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
