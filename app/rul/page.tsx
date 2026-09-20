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
import { Hourglass, TrendingDown, Sliders, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export default function RulPredictionPage() {
  const state = useAppState();
  const r = state.rul;
  const t = state.currentTelemetry;

  const degradationModes: { level: DegradationLevel; label: string; rate: string; desc: string }[] = [
    { level: 'NORMAL', label: 'Nominal Engine Wear', rate: '0.18 pts/hr', desc: 'Typical cruise operation in non-hostile thermal environment.' },
    { level: 'MILD', label: 'Mild Degradation', rate: '0.35 pts/hr', desc: 'Frequent altitude climbs with moderate thermal cycling.' },
    { level: 'MODERATE', label: 'Moderate Degradation', rate: '0.65 pts/hr', desc: 'High ambient temperature exposure or slight oil thinning.' },
    { level: 'SEVERE', label: 'Severe Wear Acceleration', rate: '1.45 pts/hr', desc: 'Persistent over-temperature or bearing friction surge.' },
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
            Exponential degradation modeling predicting operational envelope before maintenance intervention is mandated.
          </p>
        </div>
        <div className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
          PROGNOSTIC ESTIMATE: DEMO DATA
        </div>
      </div>

      {/* RUL Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="aerospace-panel p-4 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Estimated Remaining Life</div>
          <div className="text-3xl font-mono font-black text-cyan-300">
            {r.estimatedHours} <span className="text-sm text-slate-400">Hours</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            90% CI: [{r.confidenceInterval[0]} – {r.confidenceInterval[1]} hrs]
          </div>
        </div>

        <div className="aerospace-panel p-4 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Active Degradation Velocity</div>
          <div className="text-3xl font-mono font-black text-amber-400">
            {r.degradationRatePerHour} <span className="text-sm text-slate-400">pts/hr</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Current Profile: {state.degradationLevel}
          </div>
        </div>

        <div className="aerospace-panel p-4 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Current Operating Time</div>
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
            Status: {state.health.status}
          </div>
        </div>
      </div>

      {/* Degradation Simulation Controller */}
      <div className="aerospace-panel p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold uppercase">
            SIMULATED DEGRADATION SCENARIO CONTROLLER
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
                  Rate: {dm.rate}
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
            PROJECTED HEALTH INDEX VS OPERATING HOURS HORIZON
          </span>
          <span className="text-slate-500">Shaded bounds represent 90% confidence limits</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hoursAhead" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
              />
              <Area type="monotone" dataKey="maxBound" stroke="transparent" fill="#00f0ff" fillOpacity={0.1} />
              <Area type="monotone" dataKey="minBound" stroke="transparent" fill="#00f0ff" fillOpacity={0.1} />
              <Line type="monotone" dataKey="projectedHealth" name="Predicted Health" stroke="#00f0ff" strokeWidth={3} dot={{ r: 4, fill: '#00f0ff' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Milestone Milestones Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
          {r.projectedCurve.map((m) => (
            <div key={m.hoursAhead} className="bg-slate-900/80 border border-slate-800 p-2 rounded text-center">
              <div className="text-slate-400 text-[10px]">+{m.hoursAhead} Hours</div>
              <div className="text-sm font-bold text-white mt-0.5">{m.projectedHealth}%</div>
              <div className="text-[10px] text-cyan-400">{m.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
