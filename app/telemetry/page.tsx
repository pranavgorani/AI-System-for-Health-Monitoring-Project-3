'use client';

import React from 'react';
import { useAppState } from '@/lib/useAppState';
import {
  Activity,
  Flame,
  Gauge,
  Zap,
  Wind,
  Droplets,
  ShieldCheck,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { PARAMETER_UNITS } from '@/lib/types';

export default function RealTimeTelemetryPage() {
  const state = useAppState();
  const t = state.currentTelemetry;
  const sensor = state.sensorReport;

  const parameters = [
    { name: 'Engine Speed (RPM)', key: 'rpm', val: `${t.rpm} RPM`, nominal: '4600 – 5500', status: t.rpm > 5700 ? 'WARN' : 'NOMINAL' },
    { name: 'Throttle Command', key: 'throttle', val: `${t.throttle}%`, nominal: '0 – 100%', status: 'NOMINAL' },
    { name: 'Calculated Engine Load', key: 'engine_load', val: `${t.engine_load}%`, nominal: '20 – 95%', status: 'NOMINAL' },
    { name: 'Manifold Air Pressure', key: 'manifold_pressure', val: `${t.manifold_pressure} hPa`, nominal: '700 – 1400 hPa', status: 'NOMINAL' },
    { name: 'Cylinder 1 CHT', key: 'cht_1', val: `${t.cht_1} °C`, nominal: '< 145 °C', status: t.cht_1 > 145 ? 'WARN' : 'NOMINAL' },
    { name: 'Cylinder 2 CHT', key: 'cht_2', val: `${t.cht_2} °C`, nominal: '< 145 °C', status: t.cht_2 > 145 ? 'WARN' : 'NOMINAL' },
    { name: 'Cylinder 3 CHT', key: 'cht_3', val: `${t.cht_3} °C`, nominal: '< 145 °C', status: t.cht_3 > 145 ? 'WARN' : 'NOMINAL' },
    { name: 'Cylinder 4 CHT', key: 'cht_4', val: `${t.cht_4} °C`, nominal: '< 145 °C', status: t.cht_4 > 145 ? 'WARN' : 'NOMINAL' },
    { name: 'Cylinder 1 EGT', key: 'egt_1', val: `${t.egt_1} °C`, nominal: '< 850 °C', status: t.egt_1 > 850 ? 'WARN' : 'NOMINAL' },
    { name: 'Cylinder 2 EGT', key: 'egt_2', val: `${t.egt_2} °C`, nominal: '< 850 °C', status: t.egt_2 > 850 ? 'WARN' : 'NOMINAL' },
    { name: 'Cylinder 3 EGT', key: 'egt_3', val: `${t.egt_3} °C`, nominal: '< 850 °C', status: t.egt_3 > 850 ? 'WARN' : 'NOMINAL' },
    { name: 'Cylinder 4 EGT', key: 'egt_4', val: `${t.egt_4} °C`, nominal: '< 850 °C', status: t.egt_4 > 850 ? 'WARN' : 'NOMINAL' },
    { name: 'Engine Oil Pressure', key: 'oil_pressure', val: `${t.oil_pressure} bar`, nominal: '2.5 – 5.0 bar', status: t.oil_pressure < 2.0 ? 'CRIT' : 'NOMINAL' },
    { name: 'Engine Oil Temperature', key: 'oil_temperature', val: `${t.oil_temperature} °C`, nominal: '70 – 115 °C', status: t.oil_temperature > 120 ? 'WARN' : 'NOMINAL' },
    { name: 'Fuel Flow Rate', key: 'fuel_flow', val: `${t.fuel_flow} L/h`, nominal: '12 – 30 L/h', status: 'NOMINAL' },
    { name: 'Fuel Tank Remaining', key: 'fuel_level', val: `${t.fuel_level} L`, nominal: '0 – 120 L', status: 'NOMINAL' },
    { name: 'Vibration RMS', key: 'vibration_rms', val: `${t.vibration_rms} mm/s`, nominal: '< 4.5 mm/s', status: t.vibration_rms > 5.0 ? 'WARN' : 'NOMINAL' },
    { name: 'Vibration Peak', key: 'vibration_peak', val: `${t.vibration_peak} mm/s`, nominal: '< 6.5 mm/s', status: 'NOMINAL' },
    { name: 'Injection Timing', key: 'injection_timing', val: `${t.injection_timing} °BTDC`, nominal: '22 – 26 °BTDC', status: 'NOMINAL' },
    { name: 'FADEC Bus Voltage', key: 'battery_voltage', val: `${t.battery_voltage} V`, nominal: '26.0 – 29.0 V', status: t.battery_voltage < 24.5 ? 'WARN' : 'NOMINAL' },
    { name: 'Alternator Current', key: 'alternator_current', val: `${t.alternator_current} A`, nominal: '15 – 50 A', status: 'NOMINAL' },
    { name: 'Operating Hours', key: 'engine_hours', val: `${t.engine_hours} hrs`, nominal: 'TBO 1500 hrs', status: 'NOMINAL' },
    { name: 'Flight Altitude', key: 'altitude', val: `${t.altitude} ft`, nominal: '0 – 25,000 ft', status: 'NOMINAL' },
    { name: 'Ambient Air Temp', key: 'ambient_temperature', val: `${t.ambient_temperature} °C`, nominal: '-40 to +50 °C', status: 'NOMINAL' },
    { name: 'Ambient Pressure', key: 'ambient_pressure', val: `${t.ambient_pressure} hPa`, nominal: '400 – 1013 hPa', status: 'NOMINAL' },
    { name: 'Conversion Efficiency', key: 'efficiency', val: `${t.efficiency}%`, nominal: '28 – 36%', status: 'NOMINAL' },
  ];

  const channelHealthList = sensor ? Object.values(sensor.channels) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>REAL-TIME TELEMETRY & SENSOR-HEALTH VALIDATION LAYER</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pre-flight transducer validation, signal quality analysis, rate-of-change limits, and frozen/drift classification.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
            RATE: <strong className="text-cyan-400">1000 ms (1 Hz)</strong>
          </span>
          <span className="px-3 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
            FRAME ID: <strong className="text-white">{t.can_frame_id}</strong>
          </span>
        </div>
      </div>

      {/* Sensor-Health Summary Matrix */}
      {sensor && (
        <div className="aerospace-panel p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase">
                SENSOR-QUALITY VALIDATION SUMMARY (PRE-DIAGNOSTIC LAYER)
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">ABNORMALITY CLASSIFICATION:</span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                sensor.anomalyClassification === 'SENSOR_ANOMALY'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : sensor.anomalyClassification === 'COMM_ANOMALY'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {sensor.anomalyClassification}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase">Overall Sensor Confidence</span>
              <div className="text-2xl font-bold text-cyan-300">{sensor.overallSensorConfidence}%</div>
              <span className="text-[10px] text-slate-500">Cross-channel average</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase">Healthy Channels</span>
              <div className="text-2xl font-bold text-emerald-400">{sensor.validChannelCount}</div>
              <span className="text-[10px] text-slate-500">In physical range & rate</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase">Suspect / Drift Channels</span>
              <div className={`text-2xl font-bold ${sensor.suspectChannelCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {sensor.suspectChannelCount}
              </div>
              <span className="text-[10px] text-slate-500">Plausibility conflict</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase">Failed / Frozen Channels</span>
              <div className={`text-2xl font-bold ${sensor.failedChannelCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {sensor.failedChannelCount}
              </div>
              <span className="text-[10px] text-slate-500">Dropout or zero entropy</span>
            </div>
          </div>
        </div>
      )}

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
          ].map((c) => {
            const isCyl3Imbalanced = c.cyl === 3 && Math.abs(c.egt - t.egt_avg) > 35;
            return (
              <div
                key={c.cyl}
                className={`bg-slate-900/80 border p-4 rounded-lg space-y-3 transition ${
                  isCyl3Imbalanced ? 'border-amber-500/60 bg-amber-950/20 shadow-md' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 font-mono">CYLINDER #{c.cyl}</span>
                  <div className="flex items-center gap-1">
                    {isCyl3Imbalanced && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        IMBALANCE
                      </span>
                    )}
                    <Flame className="w-4 h-4 text-amber-400" />
                  </div>
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
                    <strong className={c.egt > 850 ? 'text-rose-400' : isCyl3Imbalanced ? 'text-amber-300' : 'text-white'}>
                      {c.egt} °C
                    </strong>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${(c.egt / 950) * 100}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Sensor Quality & Validation Report Table */}
      {channelHealthList.length > 0 && (
        <div className="aerospace-panel p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold uppercase">
              TRANSDUCER HEALTH STATUS & REASONING (MANDATORY PRE-ENGINE CHECK)
            </span>
            <span className="text-slate-500">Auto-Checked Every Tick</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Transducer Channel</th>
                  <th className="py-2.5 px-3">Live Value</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Diagnostic Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {channelHealthList.map((ch) => {
                  const statusBadge =
                    ch.status === 'HEALTHY'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : ch.status === 'SUSPECT' || ch.status === 'DRIFT'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40';

                  return (
                    <tr key={ch.channel} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-3 text-white font-medium">{ch.label}</td>
                      <td className="py-2.5 px-3 font-bold text-cyan-300">
                        {ch.currentValue} {ch.unit}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge}`}>
                          {ch.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-200">{ch.confidence}%</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">{ch.anomalyType}</td>
                      <td className="py-2.5 px-3 text-slate-300 text-[11px] max-w-xs truncate" title={ch.reason}>
                        {ch.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Complete Tabular Telemetry Stream */}
      <div className="aerospace-panel p-4 space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
          FULL ENGINE PARAMETER TELEMETRY STREAM (26 CHANNELS)
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
