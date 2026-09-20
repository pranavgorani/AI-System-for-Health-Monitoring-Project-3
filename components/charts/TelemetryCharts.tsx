'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { EngineTelemetry } from '@/lib/types';

interface TelemetryChartsProps {
  history: EngineTelemetry[];
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({ history }) => {
  // Format data for chart display
  const chartData = history.map((t, idx) => ({
    time: t.timestamp.split('T')[1]?.slice(0, 8) || `${idx}s`,
    rpm: t.rpm,
    egt_avg: t.egt_avg,
    cht_avg: t.cht_avg,
    oil_pressure: t.oil_pressure,
    oil_temperature: t.oil_temperature,
    fuel_flow: t.fuel_flow,
    vibration_rms: t.vibration_rms,
    efficiency: t.efficiency,
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-2.5 rounded shadow-xl text-xs font-mono">
          <div className="text-slate-400 mb-1">{label}</div>
          {payload.map((p, i) => (
            <div key={i} className="flex items-center justify-between gap-3 text-slate-200">
              <span style={{ color: p.color }}>{p.name}:</span>
              <strong className="text-white">{p.value}</strong>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. RPM vs Time */}
      <div className="aerospace-panel p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold">ENGINE RPM</span>
          <span className="text-cyan-400 font-bold">{history[history.length - 1]?.rpm || 0} RPM</span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9 }} hide={false} />
              <YAxis domain={[0, 6000]} stroke="#64748b" tick={{ fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="rpm" name="RPM" stroke="#00f0ff" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. EGT vs Time */}
      <div className="aerospace-panel p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold">EXHAUST GAS TEMP (EGT)</span>
          <span className="text-rose-400 font-bold">{history[history.length - 1]?.egt_avg || 0} °C</span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9 }} />
              <YAxis domain={[500, 950]} stroke="#64748b" tick={{ fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="egt_avg" name="EGT Avg" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. CHT vs Time */}
      <div className="aerospace-panel p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold">CYLINDER HEAD TEMP (CHT)</span>
          <span className="text-amber-400 font-bold">{history[history.length - 1]?.cht_avg || 0} °C</span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9 }} />
              <YAxis domain={[60, 180]} stroke="#64748b" tick={{ fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="cht_avg" name="CHT Avg" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Oil Pressure vs Time */}
      <div className="aerospace-panel p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold">OIL PRESSURE</span>
          <span className="text-emerald-400 font-bold">{history[history.length - 1]?.oil_pressure || 0} bar</span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 7]} stroke="#64748b" tick={{ fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="oil_pressure" name="Oil Press" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Oil Temperature vs Time */}
      <div className="aerospace-panel p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold">OIL TEMPERATURE</span>
          <span className="text-orange-400 font-bold">{history[history.length - 1]?.oil_temperature || 0} °C</span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9 }} />
              <YAxis domain={[40, 150]} stroke="#64748b" tick={{ fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="oil_temperature" name="Oil Temp" stroke="#ea580c" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. Vibration RMS vs Time */}
      <div className="aerospace-panel p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold">VIBRATION RMS</span>
          <span className="text-purple-400 font-bold">{history[history.length - 1]?.vibration_rms || 0} mm/s</span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 12]} stroke="#64748b" tick={{ fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="vibration_rms" name="Vibration RMS" stroke="#a855f7" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
