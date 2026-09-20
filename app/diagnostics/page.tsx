'use client';

import React from 'react';
import { useAppState } from '@/lib/useAppState';
import { ExplainabilityBar } from '@/components/ui/ExplainabilityBar';
import {
  Brain,
  Cpu,
  ShieldAlert,
  Sparkles,
  Layers,
  Info,
  CheckCircle2,
  Clock,
  Activity,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import Link from 'next/link';

export default function DiagnosticsPage() {
  const state = useAppState();
  const a = state.anomalies;
  const physics = state.physicsOutput;
  const sensor = state.sensorReport;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            <span>AI ANOMALY DETECTION & EXPLAINABLE DIAGNOSTICS (XAI)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hybrid grey-box physics residuals, rolling-window trends, sensor-quality damping, and multi-frame persistence filtering.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
            MODEL: <strong className="text-cyan-400">v1.2-GREYBOX-HYBRID</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
            RESEARCH PROTOTYPE
          </span>
        </div>
      </div>

      {/* Model Validity Envelope Banner */}
      {physics && physics.validityRegion !== 'VALID_OPERATING_REGION' ? (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong className="font-bold uppercase text-white">MODEL ENVELOPE NOTICE:</strong>{' '}
            {physics.validityMessage || 'Prediction confidence reduced: operating condition outside calibrated model envelope.'}
            <span className="text-[11px] text-amber-300/80 block mt-0.5">
              Region: {physics.validityRegion} | Confidence: {physics.modelConfidence}%
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            OPERATING WITHIN CALIBRATED GREY-BOX ENVELOPE (Altitude: {state.currentTelemetry.altitude} ft, Amb Temp: {state.currentTelemetry.ambient_temperature}°C)
          </span>
        </div>
      )}

      {/* Persistence & Lead Time Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="aerospace-panel p-3 space-y-1">
          <span className="text-slate-400 text-[10px] block uppercase">Detection Persistence</span>
          <div className="text-xl font-bold text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{a.persistenceDurationSec}s</span>
          </div>
          <span className="text-[10px] text-slate-500">Multi-frame noise filter active</span>
        </div>

        <div className="aerospace-panel p-3 space-y-1">
          <span className="text-slate-400 text-[10px] block uppercase">Est. Detection Lead Time</span>
          <div className="text-xl font-bold text-amber-300 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>~{a.detectionLeadTimeSec}s</span>
          </div>
          <span className="text-[10px] text-slate-500">Before critical threshold breach</span>
        </div>

        <div className="aerospace-panel p-3 space-y-1">
          <span className="text-slate-400 text-[10px] block uppercase">Dominant Channel</span>
          <div className="text-base font-bold text-cyan-300 truncate mt-1">
            {a.affectedParameter || 'Nominal'}
          </div>
          <span className="text-[10px] text-slate-500">
            Cylinder: {a.affectedCylinder !== undefined ? a.affectedCylinder : 'All'}
          </span>
        </div>

        <div className="aerospace-panel p-3 space-y-1">
          <span className="text-slate-400 text-[10px] block uppercase">Sensor Quality Damping</span>
          <div className="text-xl font-bold text-emerald-400">
            {sensor ? sensor.overallSensorConfidence : 98}%
          </div>
          <span className="text-[10px] text-slate-500">
            {sensor ? sensor.anomalyClassification : 'HEALTHY'}
          </span>
        </div>
      </div>

      {/* Anomaly Score & Factor Waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Score Card */}
        <div className="aerospace-panel p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">
              COMPUTED COMPOSITE ANOMALY SCORE
            </span>

            <div className="flex items-baseline gap-2 font-mono">
              <span
                className={`text-5xl font-black ${
                  a.score >= 0.75
                    ? 'text-rose-400'
                    : a.score >= 0.40
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {a.score}
              </span>
              <span className="text-xs text-slate-500 font-bold">/ 1.00</span>
            </div>

            <div
              className={`p-2.5 rounded-lg border text-xs font-mono font-bold ${
                a.score >= 0.75
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : a.score >= 0.40
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              SEVERITY: {a.classification}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono mt-2">
              {a.explanation}
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-800 pt-4 text-xs font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Model Confidence:</span>
              <strong className="text-white">{a.confidence}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Sensor Health Score:</span>
              <strong className="text-emerald-400">{sensor?.overallSensorConfidence || 98}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Persistence State:</span>
              <strong className="text-cyan-300">{a.persistenceDurationSec > 0 ? `${a.persistenceDurationSec}s active` : '0s (Nominal)'}</strong>
            </div>
          </div>
        </div>

        {/* Right: Factor Contributions */}
        <div className="lg:col-span-2 aerospace-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
              EXPLAINABLE AI (XAI): HORIZONTAL PARAMETER CONTRIBUTION BREAKDOWN
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              Why was this anomaly score computed?
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Percentage attribution indicating which physical telemetry channels diverge most significantly from the physics-informed grey-box nominal envelope.
          </p>

          <ExplainabilityBar factors={a.contributingFactors} />
        </div>
      </div>

      {/* Physics Residuals Verification Table */}
      {physics && physics.residuals && (
        <div className="aerospace-panel p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>PHYSICS-INFORMED GREY-BOX RESIDUAL GENERATOR [RESIDUAL = ACTUAL - EXPECTED]</span>
            </span>
            <span className="text-slate-500">Nominal 1-Sigma Thresholds</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Telemetry Parameter</th>
                  <th className="py-2 px-3">Actual Value</th>
                  <th className="py-2 px-3">Physics Expected</th>
                  <th className="py-2 px-3">Raw Residual</th>
                  <th className="py-2 px-3">Normalized (Z)</th>
                  <th className="py-2 px-3 text-right">Trend / State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {physics.residuals.map((r) => {
                  const isHigh = Math.abs(r.normalizedResidual) > 1.8;
                  return (
                    <tr key={r.parameter} className={isHigh ? 'bg-rose-950/20' : 'hover:bg-slate-800/30'}>
                      <td className="py-2 px-3 text-white font-medium">{r.label}</td>
                      <td className="py-2 px-3 font-bold text-cyan-300">{r.actual} {r.unit}</td>
                      <td className="py-2 px-3 text-slate-400">{r.expected} {r.unit}</td>
                      <td className={`py-2 px-3 font-bold ${isHigh ? 'text-rose-400' : 'text-slate-300'}`}>
                        {r.residual > 0 ? `+${r.residual}` : r.residual} {r.unit}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isHigh ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400'
                        }`}>
                          {r.normalizedResidual}σ
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className={`text-[10px] font-bold ${r.trend === 'DIVERGING' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {r.trend}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
