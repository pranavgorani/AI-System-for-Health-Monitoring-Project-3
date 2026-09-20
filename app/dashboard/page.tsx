'use client';

import React from 'react';
import { useAppState } from '@/lib/useAppState';
import { MetricCard } from '@/components/ui/MetricCard';
import { HealthRing } from '@/components/ui/HealthRing';
import { TelemetryCharts } from '@/components/charts/TelemetryCharts';
import {
  HeartPulse,
  Hourglass,
  Brain,
  Gauge,
  Activity,
  Droplets,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Flame,
  RotateCw,
} from 'lucide-react';
import Link from 'next/link';

export default function ExecutiveDashboardPage() {
  const state = useAppState();
  const t = state.currentTelemetry;
  const h = state.health;
  const a = state.anomalies;
  const r = state.rul;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-900 via-[#0d1527] to-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">
                EXECUTIVE PROPULSION HEALTH OVERVIEW
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                ACTIVE MONITORING
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target: <strong className="text-slate-200">{state.engineId}</strong> on UAV <strong className="text-slate-200">{state.uavId}</strong> | State: <strong className="text-cyan-400">{t.flight_state}</strong> ({t.rpm} RPM)
            </p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          <Link
            href="/digital-twin"
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            Digital Twin
          </Link>
          <Link
            href="/fault-lab"
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/40 transition flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Fault Lab</span>
          </Link>
        </div>
      </div>

      {/* Active Fault Alert Callout */}
      {state.activeFault.type !== 'NONE' && (
        <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/60 flex items-center justify-between gap-3 text-rose-200 text-xs animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <strong className="font-bold uppercase tracking-wider text-rose-300">
                ACTIVE FAULT TRIGGERED: {state.activeFault.type.replace('_', ' ')}
              </strong>
              <div className="text-[11px] text-rose-200/80 font-mono mt-0.5">
                {state.activeFault.notes || 'Anomalous thermodynamic divergence observed across primary sensors.'}
              </div>
            </div>
          </div>
          <Link
            href="/diagnostics"
            className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 transition"
          >
            Inspect AI Root Cause
          </Link>
        </div>
      )}

      {/* Top 8 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. ENGINE HEALTH */}
        <MetricCard
          title="ENGINE HEALTH"
          value={`${h.overall}%`}
          subtext="Composite Index"
          icon={HeartPulse}
          status={h.overall >= 90 ? 'healthy' : h.overall >= 75 ? 'warning' : 'critical'}
          trend={h.overall >= 90 ? 'neutral' : 'down'}
        />

        {/* 2. RUL */}
        <MetricCard
          title="ESTIMATED RUL"
          value={r.estimatedHours}
          unit="hrs"
          subtext={`[${r.confidenceInterval[0]}-${r.confidenceInterval[1]}]`}
          icon={Hourglass}
          status={r.estimatedHours > 80 ? 'healthy' : r.estimatedHours > 40 ? 'warning' : 'critical'}
        />

        {/* 3. ANOMALY SCORE */}
        <MetricCard
          title="ANOMALY SCORE"
          value={a.score}
          subtext={a.classification}
          icon={Brain}
          status={a.score < 0.35 ? 'healthy' : a.score < 0.65 ? 'warning' : 'critical'}
        />

        {/* 4. ENGINE EFFICIENCY */}
        <MetricCard
          title="EFFICIENCY"
          value={`${t.efficiency}%`}
          subtext="Thermal-to-Work"
          icon={Gauge}
          status={t.efficiency > 28 ? 'healthy' : 'warning'}
        />

        {/* 5. VIBRATION HEALTH */}
        <MetricCard
          title="VIBRATION"
          value={`${h.crankshaft}%`}
          subtext={`${t.vibration_rms} mm/s`}
          icon={Activity}
          status={h.crankshaft >= 85 ? 'healthy' : h.crankshaft >= 60 ? 'warning' : 'critical'}
        />

        {/* 6. OIL SYSTEM HEALTH */}
        <MetricCard
          title="OIL SYSTEM"
          value={`${h.lubrication}%`}
          subtext={`${t.oil_pressure} bar`}
          icon={Droplets}
          status={h.lubrication >= 85 ? 'healthy' : h.lubrication >= 60 ? 'warning' : 'critical'}
        />

        {/* 7. FUEL SYSTEM HEALTH */}
        <MetricCard
          title="FUEL SYSTEM"
          value={`${h.fuel_system}%`}
          subtext={`${t.fuel_flow} L/h`}
          icon={Flame}
          status={h.fuel_system >= 85 ? 'healthy' : 'warning'}
        />

        {/* 8. THERMAL HEALTH */}
        <MetricCard
          title="THERMAL"
          value={`${h.cooling}%`}
          subtext={`CHT: ${t.cht_avg}°C`}
          icon={Thermometer}
          status={h.cooling >= 85 ? 'healthy' : h.cooling >= 60 ? 'warning' : 'critical'}
        />
      </div>

      {/* Middle Section: Health Gauge + Subsystem Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Overall Health Ring */}
        <div className="aerospace-panel p-4 flex flex-col items-center justify-center">
          <HealthRing
            score={h.overall}
            size={160}
            strokeWidth={12}
            label="SYNCHRONIZED HEALTH"
            sublabel={`Status: ${h.status} (${h.confidence}% Conf)`}
          />
          <div className="mt-4 w-full grid grid-cols-2 gap-2 text-center text-[11px] font-mono border-t border-slate-800 pt-3">
            <div className="bg-slate-900/60 p-1.5 rounded">
              <span className="text-slate-400 block">Operating Hours:</span>
              <strong className="text-white">{t.engine_hours} hrs</strong>
            </div>
            <div className="bg-slate-900/60 p-1.5 rounded">
              <span className="text-slate-400 block">Fuel Tank:</span>
              <strong className="text-cyan-400">{t.fuel_level} L</strong>
            </div>
          </div>
        </div>

        {/* Subsystems Mini Matrix */}
        <div className="lg:col-span-3 aerospace-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
              SUBSYSTEM REAL-TIME HEALTH MATRIX
            </h3>
            <Link href="/digital-twin" className="text-xs font-mono text-cyan-400 hover:underline">
              Open Full Digital Twin →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs font-mono">
            {[
              { name: 'Combustion Chamber', score: h.combustion, val: `${t.egt_avg}°C EGT` },
              { name: 'Lubrication Line', score: h.lubrication, val: `${t.oil_pressure} bar` },
              { name: 'Cooling Radiator', score: h.cooling, val: `${t.cht_avg}°C CHT` },
              { name: 'Fuel Injection', score: h.fuel_system, val: `${t.fuel_flow} L/h` },
              { name: 'Crankshaft Assembly', score: h.crankshaft, val: `${t.vibration_rms} mm/s` },
              { name: 'Turbo & Exhaust', score: h.exhaust, val: `${t.egt_1}°C` },
              { name: 'Electrical & FADEC', score: h.electrical, val: `${t.battery_voltage} V` },
              { name: 'Sensors / CAN', score: h.sensors, val: 'Synchronized' },
            ].map((sub) => {
              const color =
                sub.score >= 90
                  ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                  : sub.score >= 75
                  ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                  : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

              return (
                <div key={sub.name} className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg space-y-1">
                  <div className="text-[10px] text-slate-400 truncate">{sub.name}</div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-white">{sub.val}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${color}`}>
                      {sub.score}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-time Streaming Charts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
            LIVE ENGINE TELEMETRY CHANNELS (STREAMING AT 1 HZ)
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            Buffer: {state.telemetryHistory.length} frames
          </span>
        </div>
        <TelemetryCharts history={state.telemetryHistory} />
      </div>
    </div>
  );
}
