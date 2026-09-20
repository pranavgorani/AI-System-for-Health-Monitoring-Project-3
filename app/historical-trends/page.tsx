'use client';

import React, { useState } from 'react';
import { LineChart as ChartIcon, CheckCircle2, TrendingUp, Filter } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface MissionRecord {
  missionId: string;
  date: string;
  durationHours: number;
  avgEgt: number;
  avgCht: number;
  avgVibration: number;
  totalFuelLiters: number;
  efficiency: number;
  finalHealth: number;
  faultsDetected: number;
}

const HISTORICAL_MISSIONS: MissionRecord[] = [
  {
    missionId: 'MSN-2026-06 (Border Recon)',
    date: '2026-09-12',
    durationHours: 6.2,
    avgEgt: 735,
    avgCht: 118,
    avgVibration: 2.8,
    totalFuelLiters: 118.5,
    efficiency: 33.8,
    finalHealth: 94,
    faultsDetected: 0,
  },
  {
    missionId: 'MSN-2026-07 (High Altitude Test)',
    date: '2026-09-15',
    durationHours: 4.8,
    avgEgt: 785,
    avgCht: 132,
    avgVibration: 3.6,
    totalFuelLiters: 104.2,
    efficiency: 31.2,
    finalHealth: 88,
    faultsDetected: 1,
  },
  {
    missionId: 'MSN-2026-08 (Hot Desert Patrol)',
    date: '2026-09-18',
    durationHours: 5.5,
    avgEgt: 810,
    avgCht: 144,
    avgVibration: 4.2,
    totalFuelLiters: 122.0,
    efficiency: 29.5,
    finalHealth: 79,
    faultsDetected: 2,
  },
  {
    missionId: 'MSN-2026-09 (Current Active)',
    date: '2026-09-20',
    durationHours: 3.4,
    avgEgt: 748,
    avgCht: 124,
    avgVibration: 3.1,
    totalFuelLiters: 68.4,
    efficiency: 32.8,
    finalHealth: 91,
    faultsDetected: 0,
  },
];

export default function HistoricalTrendsPage() {
  const [selectedMissions, setSelectedMissions] = useState<string[]>([
    'MSN-2026-06 (Border Recon)',
    'MSN-2026-07 (High Altitude Test)',
    'MSN-2026-08 (Hot Desert Patrol)',
    'MSN-2026-09 (Current Active)',
  ]);

  const filteredMissions = HISTORICAL_MISSIONS.filter((m) =>
    selectedMissions.includes(m.missionId)
  );

  const chartData = filteredMissions.map((m) => ({
    name: m.missionId.split(' ')[0],
    avgEgt: m.avgEgt,
    avgCht: m.avgCht,
    vibration: m.avgVibration * 20, // scale for visual comparison
    health: m.finalHealth,
    efficiency: m.efficiency * 2,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-cyan-400" />
            <span>HISTORICAL ENGINE TRENDS & MULTI-MISSION BENCHMARKING</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Compare cumulative degradation wear, fuel consumption efficiency, and thermal margins across historical sorties.
          </p>
        </div>
      </div>

      {/* Comparative Bar Chart */}
      <div className="aerospace-panel p-6 space-y-4">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
          CROSS-MISSION THERMAL & HEALTH BENCHMARK
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Bar dataKey="avgEgt" name="Avg EGT (°C)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgCht" name="Avg CHT (°C)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="health" name="Final Health Index (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mission Comparison Table */}
      <div className="aerospace-panel p-4 space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
          SORTIE PARAMETER LOG ARCHIVE
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Mission ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Flight Time</th>
                <th className="py-2.5 px-3">Avg EGT</th>
                <th className="py-2.5 px-3">Avg CHT</th>
                <th className="py-2.5 px-3">Avg Vibration</th>
                <th className="py-2.5 px-3">Total Fuel</th>
                <th className="py-2.5 px-3">Efficiency</th>
                <th className="py-2.5 px-3 text-right">Health Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {HISTORICAL_MISSIONS.map((m) => (
                <tr key={m.missionId} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-bold text-white">{m.missionId}</td>
                  <td className="py-2.5 px-3 text-slate-400">{m.date}</td>
                  <td className="py-2.5 px-3">{m.durationHours} hrs</td>
                  <td className="py-2.5 px-3 text-rose-300 font-semibold">{m.avgEgt} °C</td>
                  <td className="py-2.5 px-3 text-amber-300 font-semibold">{m.avgCht} °C</td>
                  <td className="py-2.5 px-3">{m.avgVibration} mm/s</td>
                  <td className="py-2.5 px-3 text-cyan-300">{m.totalFuelLiters} L</td>
                  <td className="py-2.5 px-3">{m.efficiency}%</td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        m.finalHealth >= 90
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : m.finalHealth >= 75
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {m.finalHealth}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
