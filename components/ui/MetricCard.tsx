'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  status?: 'healthy' | 'warning' | 'degraded' | 'critical';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtext,
  icon: Icon,
  trend,
  trendValue,
  status = 'healthy',
  className = '',
}) => {
  const statusColors = {
    healthy: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    warning: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    degraded: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    critical: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  };

  const borderAccent = {
    healthy: 'hover:border-emerald-500/50',
    warning: 'hover:border-amber-500/50',
    degraded: 'hover:border-orange-500/50',
    critical: 'hover:border-rose-500/50',
  };

  return (
    <div
      className={`aerospace-panel p-4 flex flex-col justify-between transition-all duration-200 ${borderAccent[status]} ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
          {title}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded-md border ${statusColors[status]}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="my-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-mono font-bold text-white tracking-tight">
          {value}
        </span>
        {unit && <span className="text-xs font-mono text-slate-400">{unit}</span>}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>{subtext}</span>
        {trend && (
          <div className="flex items-center gap-1 font-mono">
            {trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 text-rose-400" />}
            {trend === 'neutral' && <Minus className="w-3 h-3 text-slate-500" />}
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
