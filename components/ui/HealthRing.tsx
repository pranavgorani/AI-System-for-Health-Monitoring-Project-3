'use client';

import React from 'react';

interface HealthRingProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export const HealthRing: React.FC<HealthRingProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  label = 'ENGINE HEALTH',
  sublabel = 'Overall Index',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  let color = '#10b981'; // emerald
  let statusText = 'NORMAL';
  if (clampedScore < 50) {
    color = '#ef4444'; // rose
    statusText = 'CRITICAL';
  } else if (clampedScore < 75) {
    color = '#f97316'; // orange
    statusText = 'DEGRADED';
  } else if (clampedScore < 90) {
    color = '#f59e0b'; // amber
    statusText = 'MONITOR';
  }

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-mono font-black text-white tracking-tight">
            {clampedScore}%
          </span>
          <span
            className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-0.5"
            style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
          >
            {statusText}
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide">
          {label}
        </div>
        <div className="text-[10px] text-slate-500 font-mono">{sublabel}</div>
      </div>
    </div>
  );
};
