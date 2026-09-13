import React from 'react';
import { Activity, Waves, Repeat, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { DetectorMetrics } from '../types/detector';

interface MetricsGridProps {
  metrics: DetectorMetrics;
  modelUsed?: string;
  analyzedAt?: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  modelUsed,
  analyzedAt,
}) => {
  // Helper for Perplexity (Word Choice Variety) badge
  const getPerplexityMeta = (level: string) => {
    switch (level) {
      case 'High':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          desc: 'Uses a rich variety of words. Natural and creative, like human writing.',
          indicator: 'Human-like',
        };
      case 'Low':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          desc: 'Uses very predictable words and common phrases typical of AI.',
          indicator: 'AI-like',
        };
      default:
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          desc: 'Normal mix of everyday words and familiar patterns.',
          indicator: 'Mixed / Balanced',
        };
    }
  };

  // Helper for Burstiness (Sentence Length Variety) badge
  const getBurstinessMeta = (level: string) => {
    switch (level) {
      case 'High':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          desc: 'Mixes short and long sentences naturally, creating lively pacing.',
          indicator: 'Natural Flow',
        };
      case 'Low':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          desc: 'Sentences are almost all the same length, which often sounds robotic.',
          indicator: 'Robotic Flow',
        };
      default:
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          desc: 'Moderate sentence variety with a few repeated rhythms.',
          indicator: 'Moderate Flow',
        };
    }
  };

  const perp = getPerplexityMeta(metrics.perplexityScore);
  const burst = getBurstinessMeta(metrics.burstinessScore);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Metric 1: Word Variety (Perplexity) */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span>Word Variety</span>
            </div>
            <span
              className={`px-2 py-0.5 text-xs font-bold rounded-full border ${perp.bg} ${perp.text} ${perp.border}`}
            >
              {metrics.perplexityScore}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {perp.desc}
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Unpredictability</span>
          <span className="font-semibold text-slate-600">{perp.indicator}</span>
        </div>
      </div>

      {/* Metric 2: Sentence Variety (Burstiness) */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Waves className="w-4 h-4 text-sky-500" />
              <span>Sentence Variety</span>
            </div>
            <span
              className={`px-2 py-0.5 text-xs font-bold rounded-full border ${burst.bg} ${burst.text} ${burst.border}`}
            >
              {metrics.burstinessScore}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {burst.desc}
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Rhythm</span>
          <span className="font-semibold text-slate-600">{burst.indicator}</span>
        </div>
      </div>

      {/* Metric 3: Cliché AI Phrases */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Repeat className="w-4 h-4 text-violet-500" />
              <span>Repeated Phrases</span>
            </div>
            <span
              className={`px-2 py-0.5 text-xs font-bold rounded-full border ${
                metrics.repetitivePhrasing
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {metrics.repetitivePhrasing ? 'Detected' : 'None'}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {metrics.repetitivePhrasing
              ? 'Found repeated filler words or cliché phrases that AI often uses.'
              : 'Smooth and natural phrasing without repetitive filler words.'}
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Pattern</span>
          <span className="font-semibold text-slate-600">
            {metrics.repetitivePhrasing ? 'AI Pattern Found' : 'Natural Flow'}
          </span>
        </div>
      </div>
    </div>
  );
};
