'use client';

import React from 'react';
import { ContributingFactor } from '@/lib/types';
import { ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';

interface ExplainabilityBarProps {
  factors: ContributingFactor[];
}

export const ExplainabilityBar: React.FC<ExplainabilityBarProps> = ({ factors }) => {
  return (
    <div className="space-y-3">
      {factors.map((f) => {
        let barColor = 'bg-cyan-500';
        let badgeColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
        if (f.severity === 'high') {
          barColor = 'bg-rose-500';
          badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
        } else if (f.severity === 'medium') {
          barColor = 'bg-amber-500';
          badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
        }

        return (
          <div key={f.parameter} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-200">
                <span>{f.parameter}</span>
                {f.direction === 'higher' && <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />}
                {f.direction === 'lower' && <ArrowDownRight className="w-3.5 h-3.5 text-blue-400" />}
                {f.direction === 'erratic' && <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400">
                  {f.current} {f.unit} (Nominal: {f.baseline} {f.unit})
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                  +{f.contribution}%
                </span>
              </div>
            </div>

            {/* Contribution Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${Math.min(100, Math.max(5, f.contribution))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
