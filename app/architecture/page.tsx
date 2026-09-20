'use client';

import React from 'react';
import {
  Layers,
  Cpu,
  Activity,
  Binary,
  Brain,
  HeartPulse,
  LayoutDashboard,
  Wrench,
  Radio,
  ArrowDown,
  ShieldCheck,
} from 'lucide-react';

export default function SystemArchitecturePage() {
  const pipelineTiers = [
    {
      tier: 'LAYER 1: PROPULSION HARDWARE & TRANSDUCERS',
      title: 'Engine Sensors & Transducers',
      desc: 'Rotax/turbo aero piston sensors: Type-K thermocouples (CHT 1-4, EGT 1-4), piezoresistive oil pressure transducers, hall-effect RPM pick-ups, piezoelectric vibration accelerometers, and turbine boost sensors.',
      icon: Activity,
      color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    },
    {
      tier: 'LAYER 2: AVIONICS & BUS INTERFACES',
      title: 'CAN / SocketCAN / ECU / FADEC Bus',
      desc: 'Dual-redundant 1 Mbps Aerospace CAN 2.0B / J1939 network transmitting cyclic parameter groups (PGN 0x18FEE400 engine speed, PGN 0x18FEE500 temperatures, PGN 0x18FEEF00 pressures).',
      icon: Binary,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    },
    {
      tier: 'LAYER 3: EDGE INGESTION & NORMALIZATION',
      title: 'Edge Telemetry Normalization Pipeline',
      desc: 'Time-series buffering, timestamp synchronization, outlier rejection, conversion to SI/aerospace units, and sliding-window rolling feature calculations.',
      icon: Radio,
      color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    },
    {
      tier: 'LAYER 4: DIGITAL TWIN CORE MODEL',
      title: 'Physics-Informed Digital Twin Core',
      desc: 'Synchronized virtual engine representation housing 4-stroke thermodynamic equations, convective heat exchange models, hydrodynamic lubrication film models, and real-time state estimation.',
      icon: Cpu,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    },
    {
      tier: 'LAYER 5: AI & PREDICTIVE ANALYTICS',
      title: 'Multi-Tier AI / ML Intelligence Pipeline',
      desc: 'Hybrid Isolation Forest anomaly scoring, physics residual checking, 10-class fault pattern recognition, non-linear RUL prognostic forecasting, and Explainable AI (XAI) attribution.',
      icon: Brain,
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    },
    {
      tier: 'LAYER 6: MISSION RELIABILITY & HEALTH',
      title: 'Engine Health Indexing & Margin Tracking',
      desc: 'Weighted multi-subsystem scoring (0-100), thermal/lubrication/vibration safety margin indicators, and flight state reliability envelopes.',
      icon: HeartPulse,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
    {
      tier: 'LAYER 7: GCS DASHBOARD & MAINTENANCE',
      title: 'Ground Control Station & Maintenance Advisory',
      desc: 'Mission command display, real-time alerting, condition-based maintenance queue, black-box replay, and post-sortie engineering report generation.',
      icon: LayoutDashboard,
      color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800">
        <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>AEGIS-TWIN SYSTEM & PIPELINE ARCHITECTURE</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          End-to-end data flow topology from aero engine sensors through virtual FADEC CAN transceivers, physics digital twin models, AI anomaly detectors, and ground control analytics.
        </p>
      </div>

      {/* Tiered Architecture Diagram */}
      <div className="space-y-3">
        {pipelineTiers.map((t, idx) => {
          const Icon = t.icon;
          return (
            <React.Fragment key={t.tier}>
              <div className="aerospace-panel p-5 space-y-2 hover:border-cyan-500/50 transition">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg border ${t.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        {t.tier}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{t.title}</h3>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-700 text-cyan-300 font-bold">
                    ACTIVE MODULE
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-12">{t.desc}</p>
              </div>

              {idx < pipelineTiers.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500">
                    <ArrowDown className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
