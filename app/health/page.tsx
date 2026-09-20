'use client';

import React from 'react';
import { useAppState } from '@/lib/useAppState';
import { HealthRing } from '@/components/ui/HealthRing';
import { HeartPulse, CheckCircle2, AlertTriangle, AlertOctagon, TrendingUp, Sliders } from 'lucide-react';

export default function EngineHealthPage() {
  const state = useAppState();
  const h = state.health;
  const t = state.currentTelemetry;

  const thresholds = [
    { label: 'NORMAL', range: '90 – 100%', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', desc: 'All physical parameters well within aerospace safety envelope.' },
    { label: 'GOOD / MONITOR', range: '75 – 89%', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', desc: 'Slight thermal or vibration deviation; continuous monitoring advised.' },
    { label: 'DEGRADED', range: '50 – 74%', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10', desc: 'Subsystem performance compromised; requires maintenance attention.' },
    { label: 'CRITICAL', range: '< 50%', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10', desc: 'Immediate ground-risk; hydraulic or combustion failure imminent.' },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800">
        <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-emerald-400" />
          <span>ENGINE HEALTH INDEX & DEGRADATION MATRIX</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Weighted multi-tier health formulation combining thermodynamics, hydrodynamic oil pressure, rotational vibration harmonics, and electrical continuity.
        </p>
      </div>

      {/* Main Health Ring & Key Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="aerospace-panel p-6 flex flex-col items-center justify-center text-center">
          <HealthRing score={h.overall} size={200} strokeWidth={14} label="COMPOSITE ENGINE HEALTH" sublabel={`Status: ${h.status}`} />
          <div className="mt-6 w-full space-y-2 text-xs font-mono text-slate-400 border-t border-slate-800 pt-4">
            <div className="flex justify-between">
              <span>Health Confidence:</span>
              <strong className="text-emerald-400">{h.confidence}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Wear Velocity:</span>
              <strong className="text-white">{state.rul.degradationRatePerHour} pts/hr</strong>
            </div>
            <div className="flex justify-between">
              <span>Operating Hours:</span>
              <strong className="text-white">{t.engine_hours} hrs</strong>
            </div>
          </div>
        </div>

        {/* Traffic Light Threshold Standards */}
        <div className="lg:col-span-2 aerospace-panel p-6 space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
            HEALTH THRESHOLD CLASSIFICATION STANDARDS
          </h3>
          <div className="space-y-3">
            {thresholds.map((th) => (
              <div key={th.label} className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${th.color}`}>
                      {th.label}
                    </span>
                    <strong className="text-xs font-mono text-white">{th.range}</strong>
                  </div>
                  <p className="text-xs text-slate-400">{th.desc}</p>
                </div>
                {h.status === th.label.split(' ')[0] && (
                  <span className="text-[10px] font-mono font-bold text-cyan-400 px-2 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 shrink-0">
                    CURRENT STATE
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subsystems Detailed Score Breakdown */}
      <div className="aerospace-panel p-6 space-y-4">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
          SUBSYSTEM COMPONENT HEALTH BREAKDOWN
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Combustion System', score: h.combustion, weight: '20%', formula: 'Coupled CHT/EGT balance & efficiency' },
            { name: 'Lubrication Circuit', score: h.lubrication, weight: '18%', formula: 'Oil line pressure & sump temperature' },
            { name: 'Cooling System', score: h.cooling, weight: '14%', formula: 'Cylinder head temp margins & radiator delta' },
            { name: 'Fuel Injection', score: h.fuel_system, weight: '12%', formula: 'Specific fuel consumption & balance' },
            { name: 'Crankshaft & Assembly', score: h.crankshaft, weight: '12%', formula: 'Vibration RMS & rotational harmonics' },
            { name: 'Turbocharger & Exhaust', score: h.exhaust, weight: '10%', formula: 'Turbine inlet temperature & backpressure' },
            { name: 'Propeller Reduction', score: h.propeller, weight: '5%', formula: 'Gearbox resonance & thrust stability' },
            { name: 'Electrical & FADEC', score: h.electrical, weight: '5%', formula: '28V generator bus & battery health' },
            { name: 'Sensor Telemetry Fusion', score: h.sensors, weight: '4%', formula: 'CAN bus parity & transducer plausibility' },
          ].map((sub) => (
            <div key={sub.name} className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{sub.name}</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  Weight: {sub.weight}
                </span>
              </div>
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-2xl font-bold text-white">{sub.score}%</span>
                <span className="text-xs text-slate-400">
                  {sub.score >= 90 ? 'Nominal' : sub.score >= 75 ? 'Monitor' : 'Degraded'}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full ${sub.score >= 90 ? 'bg-emerald-500' : sub.score >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${sub.score}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 font-mono pt-1">{sub.formula}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
