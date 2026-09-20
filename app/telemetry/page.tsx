'use client';

import React from 'react';
import { useAppState } from '@/lib/useAppState';
import { Activity, Flame, Gauge, Zap, Wind, Droplets } from 'lucide-react';

export default function RealTimeTelemetryPage() {
  const state = useAppState();
  const t = state.currentTelemetry;

  const parameters = [
    { name: 'Engine Speed (RPM)', val: `${t.rpm} RPM`, nominal: '4600 – 5500', status: t.rpm > 5700 ? 'WARN' : 'NOMINAL' },
    { name: 'Throttle Command', val: `${t.throttle}%`, nominal: '0 – 100%', status: 'NOMINAL' },
    { name: 'Calculated Engine Load', val: `${t.engine_load}%`, nominal: '20 – 95%', status: 'NOMINAL' },
    { name: 'Cylinder 1 CHT', val: `${t.cht_1} °C`, nominal: '< 145 °C', status: t.cht_1 > 145 ? 'WARN' : 'NOMINAL' },
    { name: 'Cylinder 2 CHT', val: `${t.cht_2} °C`, nominal: '< 145 °C', status: t.cht_2 > 145 ? 'WARN' : 'NOMINAL' },
    { name: 'Cylinder 3 CHT', val: `${t.cht_3} °C`, nominal: '< 145 °C', status: t.cht_3 > 145 ? 'WARN' : 'NOMINAL' },
    { name: 'Cylinder 4 CHT', val: `${t.cht_4} °C`, nominal: '< 145 °C', status: t.cht_4 > 145 ? 'WARN' : 'NOMINAL' },
    { name: 'Cylinder 1 EGT', val: `${t.egt_1} °C`, nominal: '< 850 °C', status: t.egt_1 > 850 ? 'WARN' : 'NOMINAL' },
    { name: 'Cylinder 2 EGT', val: `${t.egt_2} °C`, nominal: '< 850 °C', status: t.egt_2 > 850 ? 'WARN' : 'NOMINAL' },
    { name: 'Cylinder 3 EGT', val: `${t.egt_3} °C`, nominal: '< 850 °C', status: t.egt_3 > 850 ? 'WARN' : 'NOMINAL' },
    { name: 'Cylinder 4 EGT', val: `${t.egt_4} °C`, nominal: '< 850 °C', status: t.egt_4 > 850 ? 'WARN' : 'NOMINAL' },
    { name: 'Engine Oil Pressure', val: `${t.oil_pressure} bar`, nominal: '2.5 – 5.0 bar', status: t.oil_pressure < 2.0 ? 'CRIT' : 'NOMINAL' },
    { name: 'Engine Oil Temperature', val: `${t.oil_temperature} °C`, nominal: '70 – 115 °C', status: t.oil_temperature > 120 ? 'WARN' : 'NOMINAL' },
    { name: 'Fuel Flow Rate', val: `${t.fuel_flow} L/h`, nominal: '12 – 30 L/h', status: 'NOMINAL' },
    { name: 'Fuel Tank Remaining', val: `${t.fuel_level} L`, nominal: '0 – 120 L', status: 'NOMINAL' },
    { name: 'Vibration RMS', val: `${t.vibration_rms} mm/s`, nominal: '< 4.5 mm/s', status: t.vibration_rms > 5.0 ? 'WARN' : 'NOMINAL' },
    { name: 'Injection Timing', val: `${t.injection_timing} °BTDC`, nominal: '22 – 26 °BTDC', status: 'NOMINAL' },
    { name: 'FADEC Bus Voltage', val: `${t.battery_voltage} V`, nominal: '26.0 – 29.0 V', status: t.battery_voltage < 24.5 ? 'WARN' : 'NOMINAL' },
    { name: 'Alternator Current', val: `${t.alternator_current} A`, nominal: '15 – 50 A', status: 'NOMINAL' },
    { name: 'Operating Hours', val: `${t.engine_hours} hrs`, nominal: 'TBO 1500 hrs', status: 'NOMINAL' },
    { name: 'Flight Altitude', val: `${t.altitude} ft`, nominal: '0 – 25,000 ft', status: 'NOMINAL' },
    { name: 'Ambient Air Temp', val: `${t.ambient_temperature} °C`, nominal: '-40 to +50 °C', status: 'NOMINAL' },
    { name: 'Ambient Pressure', val: `${t.ambient_pressure} hPa`, nominal: '400 – 1013 hPa', status: 'NOMINAL' },
    { name: 'Conversion Efficiency', val: `${t.efficiency}%`, nominal: '28 – 36%', status: 'NOMINAL' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>REAL-TIME ENGINE TELEMETRY STREAM</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standardized 24-channel parameter acquisition over virtual FADEC/CAN bus interface.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
            RATE: <strong className="text-cyan-400">1000 ms (1 Hz)</strong>
          </span>
          <span className="px-3 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
            FRAME ID: <strong className="text-white">#0x{t.timestamp.slice(17, 19)}4F</strong>
          </span>
        </div>
      </div>

      {/* 4-Cylinder Thermal Balance Visualization */}
      <div className="aerospace-panel p-4 space-y-4">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
          CYLINDER INDIVIDUAL THERMAL BALANCE (4-CYLINDER OPPOSED ARCHITECTURE)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { cyl: 1, cht: t.cht_1, egt: t.egt_1 },
            { cyl: 2, cht: t.cht_2, egt: t.egt_2 },
            { cyl: 3, cht: t.cht_3, egt: t.egt_3 },
            { cyl: 4, cht: t.cht_4, egt: t.egt_4 },
          ].map((c) => (
            <div key={c.cyl} className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 font-mono">CYLINDER #{c.cyl}</span>
                <Flame className="w-4 h-4 text-amber-400" />
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">CHT:</span>
                  <strong className={c.cht > 145 ? 'text-rose-400' : 'text-white'}>{c.cht} °C</strong>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${(c.cht / 180) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">EGT:</span>
                  <strong className={c.egt > 850 ? 'text-rose-400' : 'text-white'}>{c.egt} °C</strong>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${(c.egt / 950) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Tabular Telemetry Stream */}
      <div className="aerospace-panel p-4 space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
          LIVE ENGINE SENSOR ACQUISITION TABLE
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Parameter Name</th>
                <th className="py-2.5 px-3">Live Value</th>
                <th className="py-2.5 px-3">Nominal Envelope</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {parameters.map((p) => (
                <tr key={p.name} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 text-slate-200 font-medium">{p.name}</td>
                  <td className="py-2.5 px-3 font-bold text-cyan-300">{p.val}</td>
                  <td className="py-2.5 px-3 text-slate-500">{p.nominal}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'CRIT'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : p.status === 'WARN'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {p.status}
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
