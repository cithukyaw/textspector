import React from 'react';
import { motion } from 'motion/react';
import { VerdictType } from '../types/detector';

interface ScoreGaugeProps {
  score: number; // 0 to 100
  verdict: VerdictType;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, verdict }) => {
  // Clamped 0-100
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

  // SVG Gauge calculations
  const size = 190;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Semi-circle arc of 260 degrees
  const arcLength = circumference * (260 / 360);
  const strokeDashoffset = arcLength - (arcLength * normalizedScore) / 100;

  // Determine color scheme based on score
  let primaryColor = '#10b981'; // green-500
  let badgeBg = 'bg-emerald-50';
  let badgeText = 'text-emerald-700';
  let badgeBorder = 'border-emerald-200';

  if (normalizedScore > 65 || verdict === 'Likely AI') {
    primaryColor = '#ef4444'; // red-500
    badgeBg = 'bg-red-50';
    badgeText = 'text-red-700';
    badgeBorder = 'border-red-200';
  } else if (normalizedScore >= 35 || verdict === 'Mixed / Edited') {
    primaryColor = '#f59e0b'; // amber-500
    badgeBg = 'bg-amber-50';
    badgeText = 'text-amber-700';
    badgeBorder = 'border-amber-200';
  }

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-130"
          style={{ transformOrigin: '50% 50%' }}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Animated Value Arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={primaryColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pt-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-baseline"
          >
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
              {normalizedScore}
            </span>
            <span className="text-xl font-bold text-slate-500 ml-0.5">%</span>
          </motion.div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
            AI Score
          </span>
        </div>
      </div>

      {/* Dynamic Verdict Badge */}
      <div className="mt-2 text-center">
        <span
          id="verdict-badge"
          className={`inline-block px-3.5 py-1 text-xs sm:text-sm font-bold rounded-full border ${badgeBg} ${badgeText} ${badgeBorder} shadow-2xs`}
        >
          {verdict}
        </span>
        <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
          {normalizedScore > 65
            ? 'Sounds mostly like AI writing'
            : normalizedScore < 35
            ? 'Sounds natural and human-written'
            : 'Contains a mix of human and AI styles'}
        </p>
      </div>
    </div>
  );
};
