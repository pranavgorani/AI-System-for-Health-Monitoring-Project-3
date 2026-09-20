'use client';

import React from 'react';
import { useAppState } from '@/lib/useAppState';
import { setDegradation } from '@/lib/store';
import { DegradationLevel } from '@/lib/ml/rulEstimator';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  ComposedChart,
} from 'recharts';
import {
  Hourglass,
  TrendingDown,
  Sliders,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Compass,
  Layers,
  Info,
} from 'lucide-react';

export default function RulPredictionPage() {
  const state = useAppState();
  const r = state.rul;
  const t = state.currentTelemetry;

  const degradationModes: { level: DegradationLevel; label: string; rate: string; desc: string }[] = [
    { level: 'NORMAL', label: 'Nominal Engine Wear', rate: '0.18 pts/hr', desc: 'Typical cruise operation in standard ISA thermal conditions.' },
    { level: 'MILD', label: 'Mild Degradation', rate: '0.35 pts/hr', desc: 'Frequent climb transitions with moderate thermal cycling.' },
    { level: 'MODERATE', label: 'Moderate Degradation', rate: '0.65 pts/hr', desc: 'High ambient temperature exposure or slight oil thinning.' },
    { level: 'SEVERE', label: 'Severe Wear Acceleration', rate: '1.45 pts/hr', desc: 'Active cylinder thermal divergence or bearing friction surge.' },
  ];

  const chartData = r.projectedCurve.map((p) => ({
    hoursAhead: `+${p.hoursAhead}h`,
    projectedHealth: p.projectedHealth,
    minBound: p.confidenceMin,
    maxBound: p.confidenceMax,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Hourglass className="w-5 h-5 text-cyan-400" />
            <span>PROGNOSTIC REMAINING USEFUL LIFE (RUL) ESTIMATION</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Component-specific degradation modeling with 80% confidence prediction intervals and calibrated failure criteria.
          </p>
        </div>
        <div className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
          UNCERTAINTY-AWARE PROGNOSTIC ESTIMATOR
        </div>
      </div>

      {/* Required Research Disclaimer Callout */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-start gap-2.5">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white uppercase font-bold">Prognostic Model Notice:</strong>{' '}
          {r.statusDisclaimer}
          <span className="text-slate-400 block mt-0.5">
            Data Source: {r.dataSource} | Model Status: {r.modelStatus}
          </span>
        </div>
      </div>

      {/* RUL Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="aerospace-panel p-4 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Median RUL Estimate</div>
          <div className="text-3xl font-mono font-black text-cyan-300">
            {r.estimatedHours} <span className="text-sm text-slate-400">Hours</span>
          </div>
          <div className="text-[11px] font-mono text-amber-400 font-bold">
            80% CI: [{r.confidenceInterval[0]} – {r.confidenceInterval[1]} hrs]
          </div>
        </div>

        <div className="aerospace-panel p-4 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Degradation Slope</div>
          <div className="text-3xl font-mono font-black text-amber-400">
            {r.degradationRatePerHour} <span className="text-sm text-slate-400">pts/hr</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Profile: {state.degradationLevel}
          </div>
        </div>

        <div className="aerospace-panel p-4 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Consumed Operating Time</div>
          <div className="text-3xl font-mono font-black text-white">
            {t.engine_hours} <span className="text-sm text-slate-400">Hours</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Manufacturer TBO: 1500.0 hrs
          </div>
        </div>

        <div className="aerospace-panel p-4 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Current Health Index</div>
          <div className="text-3xl font-mono font-black text-emerald-400">
            {state.health.overall}%
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Confidence: {r.confidenceLevel}%
          </div>
        </div>
      </div>

      {/* Component Specificity & Failure Criteria Card */}
      <div className="aerospace-panel p-5 space-y-3 bg-[#0a1122] border-cyan-500/30">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>PREDICTED COMPONENT & FAILURE CRITERION SPECIFICATION</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">PREDICTED COMPONENT</span>
            <strong className="text-cyan-300 text-sm">{r.predictedComponent}</strong>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">END-OF-LIFE CRITERION</span>
            <strong className="text-white text-xs">{r.endOfLifeCriterion}</strong>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">CURRENT DEGRADATION INDICATOR</span>
            <strong className="text-amber-300 text-xs">{r.currentDegradationIndicator}</strong>
          </div>
        </div>
      </div>

      {/* Degradation Simulation Controller */}
      <div className="aerospace-panel p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold uppercase">
            SIMULATED DEGRADATION PROFILE CONTROLLER
          </span>
          <span className="text-cyan-400 font-bold">
            ACTIVE PROFILE: {state.degradationLevel}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {degradationModes.map((dm) => {
            const isSelected = state.degradationLevel === dm.level;
            return (
              <button
                key={dm.level}
                onClick={() => setDegradation(dm.level)}
                className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-md font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white mb-1">{dm.label}</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">{dm.desc}</div>
                </div>
                <div className="mt-3 text-[10px] font-mono text-cyan-400 font-bold">
                  Slope: {dm.rate}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Projected Degradation Curve Chart */}
      <div className="aerospace-panel p-6 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold uppercase">
            PROJECTED RUN-TO-FAILURE DEGRADATION TRAJECTORY (80% CONFIDENCE ENVELOPE)
          </span>
          <span className="text-amber-400">Critical Maintenance Threshold: 40% Health</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hoursAhead" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="maxBound" stroke="none" fill="#06b6d4" fillOpacity={0.12} />
              <Area type="monotone" dataKey="minBound" stroke="none" fill="#0b132b" fillOpacity={0.8} />
              <Line type="monotone" dataKey="projectedHealth" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4, fill: '#06b6d4' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
