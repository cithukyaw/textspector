import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Tag, Layers, BarChart2 } from 'lucide-react';
import { ParagraphAnalysis } from '../types/detector';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface ParagraphBreakdownProps {
  paragraphs: ParagraphAnalysis[];
  flaggedPhrases: string[];
}

export const ParagraphBreakdown: React.FC<ParagraphBreakdownProps> = ({
  paragraphs,
  flaggedPhrases,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return { bar: '#ef4444', text: 'text-red-600', badge: 'bg-red-50 text-red-700 border-red-200' };
    if (score >= 35) return { bar: '#f59e0b', text: 'text-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { bar: '#10b981', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const chartData = paragraphs.map((p) => ({
    name: `P${p.paragraphIndex}`,
    score: p.score,
    note: p.note,
  }));

  return (
    <div className="space-y-4">
      {/* Flagged Phrases Section */}
      {flaggedPhrases.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center gap-2 mb-2.5">
            <Tag className="w-4 h-4 text-red-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Common AI Phrases Found ({flaggedPhrases.length})
            </h4>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            These words and phrases are frequently used by AI models and can make writing sound artificial:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {flaggedPhrases.map((phrase, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-800 border border-red-200 shadow-2xs font-mono"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                "{phrase}"
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Paragraph Breakdown List / Chart */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <h4 className="text-sm font-bold text-slate-800">
              Paragraph-by-Paragraph Breakdown
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {paragraphs.length} {paragraphs.length === 1 ? 'paragraph' : 'paragraphs'} checked
          </span>
        </div>

        {/* Small comparative Bar Chart if multiple paragraphs */}
        {paragraphs.length > 1 && (
          <div className="mb-5 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-2">
              <span className="flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
                AI Score by Paragraph (%)
              </span>
              <span className="text-[11px] text-slate-400">Higher = More likely AI</span>
            </div>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded shadow-lg">
                            <p className="font-semibold">{data.name}: {data.score}% AI</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getScoreColor(entry.score).bar} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Accordion / List of Paragraphs */}
        <div className="space-y-2.5">
          {paragraphs.map((item, index) => {
            const colors = getScoreColor(item.score);
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={index}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-slate-50/50 hover:bg-slate-50"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(index)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left gap-3 focus:outline-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {item.paragraphIndex}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800">
                        Paragraph {item.paragraphIndex}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[280px] sm:max-w-md">
                        {item.note}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${colors.badge}`}
                    >
                      {item.score}% AI
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-3 pt-1 border-t border-slate-200/60 bg-white">
                    <div className="text-xs text-slate-600 leading-relaxed mt-1">
                      <strong className="text-slate-800">Forensic Evaluation: </strong>
                      {item.note}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                        <span>Synthetic Probability</span>
                        <span className={colors.text}>{item.score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.score}%`,
                            backgroundColor: colors.bar,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
