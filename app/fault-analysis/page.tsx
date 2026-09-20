'use client';

import React from 'react';
import { useAppState } from '@/lib/useAppState';
import { AlertOctagon, ShieldAlert, CheckCircle2, Flame, Wrench, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FaultAnalysisPage() {
  const state = useAppState();
  const activeFaults = state.faults;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <span>AI FAULT CLASSIFICATION & ROOT CAUSE ANALYSIS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated pattern classification matching cross-parameter deviations against 10 aero piston fault modes.
          </p>
        </div>
        <Link
          href="/fault-lab"
          className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-rose-950/40 text-rose-300 border border-rose-500/40 hover:bg-rose-900/40 transition flex items-center gap-1.5"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Fault Injection Lab</span>
        </Link>
      </div>

      {/* Active Faults List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold uppercase">
            ACTIVE IDENTIFIED FAULT CONDITIONS ({activeFaults.length})
          </span>
          <span className="text-slate-500">Automated classification inference</span>
        </div>

        {activeFaults.length === 0 ? (
          <div className="aerospace-panel p-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">ALL PROPULSION SUBSYSTEMS NOMINAL</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No active fault signatures detected. Exhaust temperatures, oil pressure, vibration harmonics, and bus voltage are within baseline thresholds.
            </p>
            <Link
              href="/fault-lab"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:underline pt-2"
            >
              <span>Test Fault Classifier in Fault Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          activeFaults.map((f) => (
            <div
              key={f.id}
              className="aerospace-panel p-5 border-rose-500/50 bg-rose-950/20 space-y-4 shadow-lg animate-in fade-in"
            >
              {/* Fault Title Bar */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-bold">
                      {f.id} | Subsystem: {f.affectedSubsystem}
                    </div>
                    <h3 className="text-base font-bold text-white">{f.faultName}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-rose-500 text-white font-black text-[11px]">
                    SEVERITY: {f.severity}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold">
                    CONFIDENCE: {f.probability}%
                  </span>
                </div>
              </div>

              {/* Physical Evidence Indicators */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                  Physical Evidence Channels:
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {f.detectedParameters.map((p, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Explanation & Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                    Diagnostic Explanation:
                  </span>
                  <p className="text-slate-300 leading-relaxed">{f.explanation}</p>
                </div>

                <div className="bg-cyan-950/20 p-3 rounded-lg border border-cyan-500/30 space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Recommended Inspection Directive:</span>
                  </span>
                  <p className="text-slate-200 leading-relaxed">{f.recommendedInspection}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
