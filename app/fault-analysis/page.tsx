'use client';

import React from 'react';
import { useAppState } from '@/lib/useAppState';
import {
  AlertOctagon,
  ShieldAlert,
  CheckCircle2,
  Flame,
  Wrench,
  ArrowRight,
  HelpCircle,
  Activity,
  Info,
} from 'lucide-react';
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
            <span>AI FAULT DIAGNOSIS, HYPOTHESES & ROOT CAUSE ANALYSIS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multi-hypothesis diagnostic reasoning across 12 aero-piston failure modes with transparent physical evidence trails and alternative hypotheses.
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
          <span className="text-slate-500">Evidence-based probabilistic classification</span>
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
              className="aerospace-panel p-6 border-rose-500/50 bg-rose-950/20 space-y-5 shadow-lg animate-in fade-in"
            >
              {/* Fault Header Bar */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rose-500/30 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    <AlertOctagon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-bold">
                        {f.id} | Subsystem: {f.affectedSubsystem}
                      </span>
                      {f.affectedCylinder !== undefined && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                          CYLINDER #{f.affectedCylinder}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mt-0.5">{f.faultName}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-3 py-1 rounded bg-rose-500 text-white font-black text-xs">
                    SEVERITY: {f.severity}
                  </span>
                  <span className="px-3 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold">
                    CONFIDENCE: {f.probability}%
                  </span>
                </div>
              </div>

              {/* Physical Evidence Bullets */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-slate-300 uppercase font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Physical Evidence Trail:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  {(f.evidence || f.detectedParameters).map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-slate-200 flex items-start gap-2"
                    >
                      <span className="text-cyan-400 font-bold">▶</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnostic Explanation & Recommended Maintenance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                    Diagnostic Engineering Rationale:
                  </span>
                  <p className="text-slate-300 leading-relaxed font-mono">{f.explanation}</p>
                </div>

                <div className="bg-cyan-950/25 p-4 rounded-xl border border-cyan-500/40 space-y-1.5">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block flex items-center gap-1.5">
                    <Wrench className="w-4 h-4" />
                    <span>Recommended Maintenance Action:</span>
                  </span>
                  <p className="text-slate-200 leading-relaxed font-mono font-medium">{f.recommendedInspection}</p>
                </div>
              </div>

              {/* Alternative Hypotheses Section */}
              {f.alternativeHypotheses && f.alternativeHypotheses.length > 0 && (
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold uppercase">
                    <HelpCircle className="w-4 h-4" />
                    <span>Evaluated Alternative Hypotheses (Bayesian Multi-Hypothesis Analysis):</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    {f.alternativeHypotheses.map((alt, i) => (
                      <div key={i} className="p-2.5 rounded bg-slate-950/60 border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white">{alt.faultName}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {alt.probability}% Conf
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{alt.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Limitations Disclaimer */}
              {f.dataLimitations && (
                <div className="text-[11px] font-mono text-slate-500 flex items-start gap-1.5 pt-1">
                  <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>Data Limitations: {f.dataLimitations}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
