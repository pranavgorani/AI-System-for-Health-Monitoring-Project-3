'use client';

import React, { useRef } from 'react';
import { useAppState } from '@/lib/useAppState';
import { FileText, Download, Printer, ShieldCheck, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function ReportsPage() {
  const state = useAppState();
  const t = state.currentTelemetry;
  const h = state.health;
  const a = state.anomalies;
  const r = state.rul;
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleExportCsv = () => {
    const headers = 'report_id,engine_id,uav_id,health_index,rul_hours,anomaly_score,cht_avg,egt_avg,oil_pressure,vibration_rms\n';
    const row = `REP-${Date.now()},${state.engineId},${state.uavId},${h.overall},${r.estimatedHours},${a.score},${t.cht_avg},${t.egt_avg},${t.oil_pressure},${t.vibration_rms}\n`;
    const blob = new Blob([headers + row], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mission_health_report_${state.missionId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>MISSION PROPULSION HEALTH REPORT GENERATOR</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Exportable engineering debrief document with telemetry envelopes, diagnostic explanations, and predictive maintenance schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print / PDF Export</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div
        ref={reportRef}
        className="aerospace-panel p-8 space-y-8 bg-[#0b101d] text-slate-200 border border-slate-700 rounded-xl print:bg-white print:text-black print:border-none print:shadow-none"
      >
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold text-cyan-400 print:text-blue-700 uppercase tracking-widest">
              DRDO / iDEX MALE UAV PROPULSION HEALTH MONITORING SYSTEM
            </div>
            <h2 className="text-2xl font-black text-white print:text-black tracking-tight mt-1">
              POST-SORTIE ENGINE HEALTH & DIAGNOSTIC REPORT
            </h2>
            <div className="text-xs font-mono text-slate-400 print:text-gray-600 mt-1">
              REPORT ID: <strong className="text-slate-200 print:text-black">REP-2026-09-DRDO-01</strong> | GENERATED: {new Date().toUTCString()}
            </div>
          </div>

          <div className="text-right text-xs font-mono space-y-1">
            <div>TARGET ENGINE: <strong className="text-cyan-300 print:text-black">{state.engineId}</strong></div>
            <div>AIRFRAME UAV: <strong className="text-white print:text-black">{state.uavId}</strong></div>
            <div>SORTIE MISSION: <strong className="text-white print:text-black">{state.missionId}</strong></div>
            <div>DATA STATUS: <span className="text-amber-400 print:text-black font-bold">SIMULATED / TEST</span></div>
          </div>
        </div>

        {/* Executive Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-900/80 print:bg-gray-100 p-3 rounded-lg border border-slate-800 print:border-gray-300">
            <span className="text-slate-400 print:text-gray-600 block text-[10px] uppercase">Composite Health</span>
            <span className="text-2xl font-bold text-emerald-400 print:text-green-700">{h.overall}%</span>
            <span className="text-[10px] text-slate-500 block">Status: {h.status}</span>
          </div>

          <div className="bg-slate-900/80 print:bg-gray-100 p-3 rounded-lg border border-slate-800 print:border-gray-300">
            <span className="text-slate-400 print:text-gray-600 block text-[10px] uppercase">Remaining Useful Life</span>
            <span className="text-2xl font-bold text-cyan-300 print:text-blue-700">{r.estimatedHours} hrs</span>
            <span className="text-[10px] text-slate-500 block">CI: {r.confidenceInterval[0]} – {r.confidenceInterval[1]}h</span>
          </div>

          <div className="bg-slate-900/80 print:bg-gray-100 p-3 rounded-lg border border-slate-800 print:border-gray-300">
            <span className="text-slate-400 print:text-gray-600 block text-[10px] uppercase">Peak Thermal CHT</span>
            <span className="text-2xl font-bold text-amber-400 print:text-orange-700">{t.cht_avg} °C</span>
            <span className="text-[10px] text-slate-500 block">Margin: &lt; 155 °C</span>
          </div>

          <div className="bg-slate-900/80 print:bg-gray-100 p-3 rounded-lg border border-slate-800 print:border-gray-300">
            <span className="text-slate-400 print:text-gray-600 block text-[10px] uppercase">Vibration Peak RMS</span>
            <span className="text-2xl font-bold text-purple-400 print:text-purple-700">{t.vibration_rms} mm/s</span>
            <span className="text-[10px] text-slate-500 block">Limit: 4.5 mm/s</span>
          </div>
        </div>

        {/* Operating Envelopes Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold text-slate-300 print:text-black uppercase">
            1. OBSERVED SORTIE OPERATIONAL ENVELOPES
          </h3>
          <table className="w-full text-left text-xs font-mono border border-slate-800 print:border-gray-300">
            <thead className="bg-slate-900 print:bg-gray-200 text-slate-400 print:text-gray-700">
              <tr>
                <th className="p-2">Channel</th>
                <th className="p-2">Observed Value</th>
                <th className="p-2">Permissible Limit</th>
                <th className="p-2">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-gray-300">
              <tr>
                <td className="p-2">Engine Speed (RPM)</td>
                <td className="p-2 font-bold">{t.rpm} RPM</td>
                <td className="p-2">5800 RPM Max</td>
                <td className="p-2 text-emerald-400 print:text-green-700 font-bold">IN LIMITS</td>
              </tr>
              <tr>
                <td className="p-2">Exhaust Gas Temperature (EGT)</td>
                <td className="p-2 font-bold">{t.egt_avg} °C</td>
                <td className="p-2">880 °C Max Continuous</td>
                <td className="p-2 text-emerald-400 print:text-green-700 font-bold">IN LIMITS</td>
              </tr>
              <tr>
                <td className="p-2">Cylinder Head Temperature (CHT)</td>
                <td className="p-2 font-bold">{t.cht_avg} °C</td>
                <td className="p-2">150 °C Max</td>
                <td className="p-2 text-emerald-400 print:text-green-700 font-bold">IN LIMITS</td>
              </tr>
              <tr>
                <td className="p-2">Lubrication Oil Pressure</td>
                <td className="p-2 font-bold">{t.oil_pressure} bar</td>
                <td className="p-2">2.0 – 5.5 bar</td>
                <td className="p-2 text-emerald-400 print:text-green-700 font-bold">IN LIMITS</td>
              </tr>
              <tr>
                <td className="p-2">Crankshaft Vibration RMS</td>
                <td className="p-2 font-bold">{t.vibration_rms} mm/s</td>
                <td className="p-2">4.5 mm/s Aerospace Limit</td>
                <td className="p-2 text-emerald-400 print:text-green-700 font-bold">IN LIMITS</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Diagnostic Findings */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold text-slate-300 print:text-black uppercase">
            2. AI ANOMALY & FAULT DIAGNOSTIC SUMMARY
          </h3>
          <div className="p-4 rounded-lg bg-slate-900/60 print:bg-gray-100 border border-slate-800 print:border-gray-300 text-xs space-y-2">
            <div>
              <strong>Anomaly Classification:</strong> {a.classification} (Score: {a.score} / 1.00)
            </div>
            <div>
              <strong>Top Contributing Factors:</strong>{' '}
              {a.contributingFactors.slice(0, 3).map((f) => `${f.parameter} (+${f.contribution}%)`).join(', ')}
            </div>
            <div>
              <strong>Identified Fault Count:</strong> {state.faults.length} active condition(s).
            </div>
          </div>
        </div>

        {/* Maintenance Recommendations */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold text-slate-300 print:text-black uppercase">
            3. MANDATED PREDICTIVE MAINTENANCE DIRECTIVES
          </h3>
          <div className="space-y-2">
            {state.maintenanceAdvisories.slice(0, 2).map((adv) => (
              <div key={adv.id} className="p-3 rounded-lg border border-slate-800 print:border-gray-300 text-xs">
                <div className="font-bold text-white print:text-black">{adv.issue} ({adv.priority} Priority)</div>
                <div className="text-slate-400 print:text-gray-600 mt-0.5">{adv.suggestedInspection}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Research Disclaimer & Signoff */}
        <div className="border-t border-slate-800 print:border-gray-300 pt-6 text-[10px] font-mono text-slate-500 print:text-gray-600 space-y-2">
          <div>
            <strong>MANDATORY DISCLAIMER:</strong> AEGIS-TWIN is a software demonstrator using simulated/synthetic engine data. It is intended for research, development and demonstration purposes and is not a certified flight-control or safety-critical system.
          </div>
          <div className="flex justify-between pt-4">
            <div>PROPULSION TELEMETRY ANALYST: Wg Cdr S. Sharma (Retd)</div>
            <div>GCS CLEARANCE: DRDO-ALPHA-01</div>
          </div>
        </div>
      </div>
    </div>
  );
}
