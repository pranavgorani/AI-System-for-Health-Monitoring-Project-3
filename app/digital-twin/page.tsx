'use client';

import React from 'react';
import { useAppState } from '@/lib/useAppState';
import { DigitalTwinEngine } from '@/components/digital-twin/DigitalTwinEngine';
import { Cpu, Activity, ShieldCheck, Flame } from 'lucide-react';
import Link from 'next/link';

export default function DigitalTwinPage() {
  const state = useAppState();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#0c1220] border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">
              LIVE DIGITAL TWIN VIRTUAL ENGINE SYNCHRONIZATION
            </h1>
            <p className="text-xs text-slate-400">
              Continuously synchronized component-level state machine coupled to thermodynamic physics models and simulated telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/fault-lab"
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-rose-950/40 text-rose-300 border border-rose-500/40 hover:bg-rose-900/40 transition flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Inject Fault</span>
          </Link>
          <Link
            href="/diagnostics"
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition"
          >
            AI Diagnostics
          </Link>
        </div>
      </div>

      {/* Main Digital Twin Interactive Engine Schematic */}
      <DigitalTwinEngine
        health={state.health}
        telemetry={state.currentTelemetry}
      />
    </div>
  );
}
