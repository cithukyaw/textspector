import React from 'react';
import { ScoreGauge } from './ScoreGauge';
import { MetricsGrid } from './MetricsGrid';
import { ParagraphBreakdown } from './ParagraphBreakdown';
import { TextForensicView } from './TextForensicView';
import { DetectorResult } from '../types/detector';
import { Clock, Cpu, FileCheck } from 'lucide-react';

interface ResultsDashboardProps {
  result: DetectorResult;
  originalText: string;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  result,
  originalText,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Section: Score Gauge & Linguistic Reasoning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Score Gauge */}
        <div className="lg:col-span-4 flex flex-col">
          <ScoreGauge score={result.overallScore} verdict={result.verdict} />
        </div>

        {/* Right: Reasoning & Verdict Narrative */}
        <div className="lg:col-span-8 flex flex-col justify-between p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Why this result?
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Done
              </span>
            </div>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-sans">
              {result.reasoning}
            </p>
          </div>

          {/* Model info & timestamp */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-1.5 font-mono">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <span>Model: {result.modelUsed || 'Detector'}</span>
            </div>
            {result.analyzedAt && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Checked at {result.analyzedAt}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row (Perplexity, Burstiness, Repetition) */}
      <MetricsGrid
        metrics={result.metrics}
        modelUsed={result.modelUsed}
        analyzedAt={result.analyzedAt}
      />

      {/* Interactive Text Inspector View */}
      <TextForensicView
        originalText={originalText}
        flaggedPhrases={result.flaggedPhrases}
        paragraphs={result.paragraphAnalysis}
      />

      {/* Paragraph Breakdown with Score Distribution */}
      <ParagraphBreakdown
        paragraphs={result.paragraphAnalysis}
        flaggedPhrases={result.flaggedPhrases}
      />
    </div>
  );
};
