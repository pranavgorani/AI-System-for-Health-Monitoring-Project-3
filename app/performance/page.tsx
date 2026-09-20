'use client';

import React from 'react';
import { useAppState } from '@/lib/useAppState';
import { Gauge, Download, Activity, Zap, Flame, Droplets } from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';

export default function EnginePerformancePage() {
  const state = useAppState();
  const history = state.telemetryHistory;

  // Derive operating envelope curve points
  const loadPoints = Array.from({ length: 11 }, (_, i) => {
    const load = i * 10;
    const rpm = 1600 + (load / 100) * 4000;
    const fuel = 7.5 + (load / 100) * 22.0;
    const egt = 620 + (load / 100) * 210;
    const eff = 34.0 - Math.abs(load - 65) * 0.08;
    return {
      load,
      rpm: Math.round(rpm),
      fuel: Math.round(fuel * 10) / 10,
      egt: Math.round(egt),
      efficiency: Math.round(eff * 10) / 10,
    };
  });

  const handleExportCsv = () => {
    const headers = 'load_pct,rpm,fuel_flow_lph,egt_c,efficiency_pct\n';
    const rows = loadPoints
      .map((p) => `${p.load},${p.rpm},${p.fuel},${p.egt},${p.efficiency}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `engine_performance_envelope_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-400" />
            <span>AERO ENGINE PERFORMANCE MAPPING & ENVELOPE CHARTS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Characteristic thermodynamic curves modeling brake specific fuel consumption, thermal output, and mechanical efficiency.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Envelope CSV</span>
        </button>
      </div>

      {/* Grid of Characteristic Curves */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Fuel Flow vs Engine Load */}
        <div className="aerospace-panel p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold">FUEL FLOW VS ENGINE LOAD</span>
            <span className="text-cyan-400 font-bold">L/h vs % Load</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={loadPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="load" stroke="#64748b" tick={{ fontSize: 10 }} unit="%" />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit=" L/h" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Line type="monotone" dataKey="fuel" stroke="#00f0ff" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. EGT vs Engine Load */}
        <div className="aerospace-panel p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold">EXHAUST GAS TEMP (EGT) VS LOAD</span>
            <span className="text-rose-400 font-bold">°C vs % Load</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={loadPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="load" stroke="#64748b" tick={{ fontSize: 10 }} unit="%" />
                <YAxis domain={[550, 900]} stroke="#64748b" tick={{ fontSize: 10 }} unit="°C" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Line type="monotone" dataKey="egt" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Engine RPM vs Load */}
        <div className="aerospace-panel p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold">ENGINE RPM VS LOAD</span>
            <span className="text-emerald-400 font-bold">RPM vs % Load</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={loadPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="load" stroke="#64748b" tick={{ fontSize: 10 }} unit="%" />
                <YAxis domain={[1000, 6000]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Line type="monotone" dataKey="rpm" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Conversion Efficiency vs Load */}
        <div className="aerospace-panel p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold">THERMAL-MECHANICAL EFFICIENCY</span>
            <span className="text-amber-400 font-bold">% vs % Load</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={loadPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="load" stroke="#64748b" tick={{ fontSize: 10 }} unit="%" />
                <YAxis domain={[20, 40]} stroke="#64748b" tick={{ fontSize: 10 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Line type="monotone" dataKey="efficiency" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
