import React, { useState } from 'react';
import { Eye, FileText, Highlighter, Check, Copy } from 'lucide-react';
import { ParagraphAnalysis } from '../types/detector';

interface TextForensicViewProps {
  originalText: string;
  flaggedPhrases: string[];
  paragraphs: ParagraphAnalysis[];
}

export const TextForensicView: React.FC<TextForensicViewProps> = ({
  originalText,
  flaggedPhrases,
  paragraphs,
}) => {
  const [highlightMode, setHighlightMode] = useState<'annotated' | 'raw'>('annotated');
  const [copied, setCopied] = useState(false);

  const rawParagraphs = originalText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const handleCopy = () => {
    navigator.clipboard.writeText(originalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderHighlightedParagraph = (paraText: string, idx: number) => {
    const analysis = paragraphs.find((p) => p.paragraphIndex === idx + 1);
    const score = analysis?.score ?? 50;

    let borderClass = 'border-l-4 border-slate-200';
    let riskBadge = 'bg-slate-100 text-slate-700';

    if (score >= 70) {
      borderClass = 'border-l-4 border-red-500 bg-red-50/20';
      riskBadge = 'bg-red-100 text-red-800';
    } else if (score >= 35) {
      borderClass = 'border-l-4 border-amber-500 bg-amber-50/20';
      riskBadge = 'bg-amber-100 text-amber-800';
    } else {
      borderClass = 'border-l-4 border-emerald-500 bg-emerald-50/20';
      riskBadge = 'bg-emerald-100 text-emerald-800';
    }

    // Highlight flagged phrases inside this paragraph
    let elements: React.ReactNode[] = [paraText];

    if (flaggedPhrases.length > 0) {
      const sortedPhrases = [...flaggedPhrases].sort((a, b) => b.length - a.length);
      const escaped = sortedPhrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      const regex = new RegExp(`(${escaped})`, 'gi');

      const parts = paraText.split(regex);
      elements = parts.map((part, pIdx) => {
        const isMatch = sortedPhrases.some((phrase) => phrase.toLowerCase() === part.toLowerCase());
        if (isMatch) {
          return (
            <mark
              key={pIdx}
              className="bg-red-100 text-red-900 px-1 py-0.5 rounded font-semibold border-b-2 border-red-400"
              title="Common AI phrase or transition"
            >
              {part}
            </mark>
          );
        }
        return part;
      });
    }

    return (
      <div
        key={idx}
        className={`p-3.5 my-2 rounded-r-xl transition-all ${borderClass}`}
      >
        <div className="flex items-center justify-between mb-1 text-[11px] font-semibold">
          <span className="text-slate-400">Paragraph #{idx + 1}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${riskBadge}`}>
            {score}% AI Risk
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
          {elements}
        </p>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-600" />
          <h4 className="text-sm font-bold text-slate-800">
            Highlighted Text View
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setHighlightMode('annotated')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                highlightMode === 'annotated'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Highlights
            </button>
            <button
              type="button"
              onClick={() => setHighlightMode('raw')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                highlightMode === 'raw'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Plain Text
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            title="Copy original text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {highlightMode === 'annotated' ? (
        <div className="space-y-1">
          {rawParagraphs.length > 0 ? (
            rawParagraphs.map((para, idx) => renderHighlightedParagraph(para, idx))
          ) : (
            <p className="text-sm text-slate-500 italic">No text provided.</p>
          )}
        </div>
      ) : (
        <div className="p-3 bg-slate-50 rounded-lg text-xs sm:text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
          {originalText}
        </div>
      )}
    </div>
  );
};
