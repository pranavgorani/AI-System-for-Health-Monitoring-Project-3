'use client';

import React from 'react';
import { useAppState } from '@/lib/useAppState';
import { ExplainabilityBar } from '@/components/ui/ExplainabilityBar';
import { Brain, Cpu, ShieldAlert, Sparkles, Layers, Info, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function DiagnosticsPage() {
  const state = useAppState();
  const a = state.anomalies;

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
            Hybrid Isolation Forest algorithm and physics residual verification with transparent parameter contribution attribution.
          </p>
        </div>
        <div className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
          DEMO MODEL OUTPUT: SIMULATED / PROTOTYPE
        </div>
      </div>

      {/* AI Processing Pipeline Flow Diagram */}
      <div className="aerospace-panel p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 uppercase">
          <span>AI MULTI-TIER DIAGNOSTIC PIPELINE ARCHITECTURE</span>
          <span className="text-cyan-400">ACTIVE INFERENCE: 1000 MS CYCLE</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs font-mono">
          {[
            { step: '01', name: 'Raw Telemetry', desc: 'CAN 2.0B Frames' },
            { step: '02', name: 'Feature Extraction', desc: 'Rolling Z-Scores' },
            { step: '03', name: 'Physics Validation', desc: 'Thermodynamics' },
            { step: '04', name: 'Isolation Forest', desc: 'Decision Surface' },
            { step: '05', name: 'Anomaly Score', desc: `${a.score} Output` },
            { step: '06', name: 'Fault Classifier', desc: `${state.faults.length} Active` },
            { step: '07', name: 'Explainable XAI', desc: 'Contribution Matrix' },
          ].map((st, i) => (
            <div key={st.step} className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg space-y-1">
              <div className="text-[10px] text-cyan-400 font-bold">STAGE {st.step}</div>
              <div className="font-bold text-white leading-tight">{st.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{st.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Anomaly Score & Explainability Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Overall Score Card */}
        <div className="aerospace-panel p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">
              COMPUTED ANOMALY SEVERITY
            </span>

            <div className="flex items-baseline gap-2 font-mono">
              <span className={`text-5xl font-black ${
                a.score >= 0.75 ? 'text-rose-400' : a.score >= 0.35 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {a.score}
              </span>
              <span className="text-xs text-slate-500 font-bold">/ 1.00</span>
            </div>

            <div className={`p-2.5 rounded-lg border text-xs font-mono font-bold ${
              a.score >= 0.75
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : a.score >= 0.35
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              CLASSIFICATION: {a.classification}
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-800 pt-4 text-xs font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Model Confidence:</span>
              <strong className="text-white">{a.confidence}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Sensor Data Quality:</span>
              <strong className="text-emerald-400">{a.dataQuality}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Inference Engine:</span>
              <strong className="text-slate-300 truncate max-w-[160px]">{a.modelType}</strong>
            </div>
          </div>
        </div>

        {/* Right: Explainable AI Factor Contributions */}
        <div className="lg:col-span-2 aerospace-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
              EXPLAINABLE AI: PARAMETER CONTRIBUTION WATERFALL
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              Why was this anomaly score detected?
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Quantitative percentage weighting indicating which physical telemetry channels diverge most significantly from the nominal flight envelope baseline.
          </p>

          <ExplainabilityBar factors={a.contributingFactors} />
        </div>
      </div>
    </div>
  );
}
