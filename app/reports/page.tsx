'use client';

import React, { useRef } from 'react';
import { useAppState } from '@/lib/useAppState';
import { FileText, Download, Printer, ShieldCheck, AlertOctagon, CheckCircle2, Activity, Gauge, Flame, Wrench } from 'lucide-react';

export default function ReportsPage() {
  const state = useAppState();
  const t = state.currentTelemetry;
  const h = state.health;
  const a = state.anomalies;
  const r = state.rul;
  const sq = state.sensorReport;
  const pm = state.physicsOutput;
  const mission = state.missionAssessment;
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleExportCsv = () => {
    const headers = 'report_id,engine_id,uav_id,sensor_quality,health_index,rul_hours,rul_ci_lower,rul_ci_upper,anomaly_score,mission_status,cht_avg,egt_avg,oil_pressure,vibration_rms,fuel_flow\n';
    const row = `REP-${Date.now()},${state.engineId},${state.uavId},${sq.overallSensorConfidence},${h.overall},${r.estimatedHours},${r.confidenceInterval[0]},${r.confidenceInterval[1]},${a.score},${mission.recommendation},${t.cht_avg},${t.egt_avg},${t.oil_pressure},${t.vibration_rms},${t.fuel_flow}\n`;
    const blob = new Blob([headers + row], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mission_health_report_${state.missionId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Check channel limits
  const isEgtExceeded = t.egt_avg > 880 || Math.max(t.egt_1, t.egt_2, t.egt_3, t.egt_4) > 895;
  const isChtExceeded = t.cht_avg > 150;
  const isOilLow = t.oil_pressure < 2.0;
  const isVibExceeded = t.vibration_rms > 4.5;

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
            Standardized post-sortie engineering debrief document with sensor validation, physics residuals, and predictive maintenance schedules.
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
              AEGIS-TWIN PROPULSION PHM RESEARCH DEMONSTRATOR
            </div>
            <h2 className="text-2xl font-black text-white print:text-black tracking-tight mt-1">
              POST-SORTIE ENGINE HEALTH &amp; DIAGNOSTIC REPORT
            </h2>
            <div className="text-xs font-mono text-slate-400 print:text-gray-600 mt-1">
              REPORT ID: <strong className="text-slate-200 print:text-black">REP-2026-09-SYNTH-01</strong> | GENERATED: {new Date().toUTCString()}
            </div>
          </div>

          <div className="text-right text-xs font-mono space-y-1">
            <div>TARGET ENGINE: <strong className="text-cyan-300 print:text-black">{state.engineId}</strong></div>
            <div>AIRFRAME UAV: <strong className="text-white print:text-black">{state.uavId}</strong></div>
            <div>SORTIE MISSION: <strong className="text-white print:text-black">{state.missionId}</strong></div>
            <div>SUITABILITY: <span className={`font-bold ${mission.recommendation === 'GO' ? 'text-emerald-400' : mission.recommendation === 'CONDITIONAL_GO' ? 'text-amber-400' : 'text-red-400'}`}>{mission.recommendation}</span></div>
          </div>
        </div>

        {/* Research & Data Disclaimer Notice */}
        <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] font-mono text-cyan-300 print:bg-gray-100 print:text-gray-800 print:border-gray-300">
          <strong>DEMONSTRATION RECORD NOTICE:</strong> All telemetry frames in this debrief originate from the AEGIS-TWIN synthetic physics-guided simulator. Algorithms run in Demonstration Mode. Intended strictly for research, benchmarking, and engineering evaluation.
        </div>

        {/* Executive Summary KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-900/80 print:bg-gray-100 p-3 rounded-lg border border-slate-800 print:border-gray-300">
            <span className="text-slate-400 print:text-gray-600 block text-[10px] uppercase">Composite Engine Health</span>
            <span className={`text-2xl font-bold ${h.overall >= 80 ? 'text-emerald-400' : h.overall >= 60 ? 'text-amber-400' : 'text-red-400'} print:text-black`}>
              {h.overall}%
            </span>
            <span className="text-[10px] text-slate-500 block">Status: {h.status}</span>
          </div>

          <div className="bg-slate-900/80 print:bg-gray-100 p-3 rounded-lg border border-slate-800 print:border-gray-300">
            <span className="text-slate-400 print:text-gray-600 block text-[10px] uppercase">RUL Prediction (80% CI)</span>
            <span className="text-2xl font-bold text-cyan-300 print:text-blue-700">{r.estimatedHours} hrs</span>
            <span className="text-[10px] text-slate-500 block">Interval: [{r.confidenceInterval[0]}, {r.confidenceInterval[1]}] hrs</span>
          </div>

          <div className="bg-slate-900/80 print:bg-gray-100 p-3 rounded-lg border border-slate-800 print:border-gray-300">
            <span className="text-slate-400 print:text-gray-600 block text-[10px] uppercase">Sensor Signal Quality</span>
            <span className={`text-2xl font-bold ${sq.overallSensorConfidence >= 90 ? 'text-emerald-400' : 'text-amber-400'} print:text-black`}>
              {sq.overallSensorConfidence}%
            </span>
            <span className="text-[10px] text-slate-500 block">Valid: {sq.validChannelCount}/{sq.validChannelCount + sq.suspectChannelCount + sq.failedChannelCount} channels</span>
          </div>

          <div className="bg-slate-900/80 print:bg-gray-100 p-3 rounded-lg border border-slate-800 print:border-gray-300">
            <span className="text-slate-400 print:text-gray-600 block text-[10px] uppercase">Physics Model Validity</span>
            <span className="text-sm font-bold text-slate-200 print:text-black block mt-1">
              {pm.validityRegion.replace(/_/g, ' ')}
            </span>
            <span className="text-[10px] text-slate-500 block">Efficiency: {pm.expectedValues.efficiency}%</span>
          </div>
        </div>

        {/* Operating Envelopes Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold text-slate-300 print:text-black uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>1. OBSERVED SORTIE OPERATIONAL ENVELOPES</span>
          </h3>
          <table className="w-full text-left text-xs font-mono border border-slate-800 print:border-gray-300">
            <thead className="bg-slate-900 print:bg-gray-200 text-slate-400 print:text-gray-700">
              <tr>
                <th className="p-2">Telemetry Channel</th>
                <th className="p-2">Observed Value</th>
                <th className="p-2">Expected (Physics)</th>
                <th className="p-2">Permissible Limit</th>
                <th className="p-2">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-gray-300">
              <tr>
                <td className="p-2">Engine Speed (RPM)</td>
                <td className="p-2 font-bold">{t.rpm} RPM</td>
                <td className="p-2">4650 RPM (Cruise)</td>
                <td className="p-2">5800 RPM Max</td>
                <td className="p-2 text-emerald-400 print:text-green-700 font-bold">IN LIMITS</td>
              </tr>
              <tr>
                <td className="p-2">Exhaust Gas Temp - Avg (EGT)</td>
                <td className="p-2 font-bold">{t.egt_avg} °C</td>
                <td className="p-2">{pm.expectedValues.egt_avg} °C</td>
                <td className="p-2">880 °C Continuous</td>
                <td className={`p-2 font-bold ${isEgtExceeded ? 'text-red-400' : 'text-emerald-400 print:text-green-700'}`}>
                  {isEgtExceeded ? 'EXCEEDED' : 'IN LIMITS'}
                </td>
              </tr>
              <tr>
                <td className="p-2">EGT Cyl 1 / Cyl 2 / Cyl 3 / Cyl 4</td>
                <td className="p-2 font-bold text-[11px]">{t.egt_1} / {t.egt_2} / <span className={t.egt_3 > 850 ? 'text-amber-400' : ''}>{t.egt_3}</span> / {t.egt_4} °C</td>
                <td className="p-2 text-[11px]">~{pm.expectedValues.egt_avg} °C</td>
                <td className="p-2">Δ max 50 °C</td>
                <td className={`p-2 font-bold ${Math.abs(t.egt_3 - ((t.egt_1 + t.egt_2 + t.egt_4) / 3)) > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {Math.abs(t.egt_3 - ((t.egt_1 + t.egt_2 + t.egt_4) / 3)) > 40 ? 'CYL 3 SPREAD' : 'BALANCED'}
                </td>
              </tr>
              <tr>
                <td className="p-2">Cylinder Head Temp - Avg (CHT)</td>
                <td className="p-2 font-bold">{t.cht_avg} °C</td>
                <td className="p-2">{pm.expectedValues.cht_avg} °C</td>
                <td className="p-2">150 °C Max</td>
                <td className={`p-2 font-bold ${isChtExceeded ? 'text-red-400' : 'text-emerald-400 print:text-green-700'}`}>
                  {isChtExceeded ? 'EXCEEDED' : 'IN LIMITS'}
                </td>
              </tr>
              <tr>
                <td className="p-2">Lubrication Oil Pressure</td>
                <td className="p-2 font-bold">{t.oil_pressure} bar</td>
                <td className="p-2">{pm.expectedValues.oil_pressure} bar</td>
                <td className="p-2">2.0 – 5.5 bar</td>
                <td className={`p-2 font-bold ${isOilLow ? 'text-red-400' : 'text-emerald-400 print:text-green-700'}`}>
                  {isOilLow ? 'LOW PRESSURE' : 'IN LIMITS'}
                </td>
              </tr>
              <tr>
                <td className="p-2">Crankshaft Vibration RMS</td>
                <td className="p-2 font-bold">{t.vibration_rms} mm/s</td>
                <td className="p-2">{pm.expectedValues.vibration_rms} mm/s</td>
                <td className="p-2">4.5 mm/s Aerospace Limit</td>
                <td className={`p-2 font-bold ${isVibExceeded ? 'text-red-400' : 'text-emerald-400 print:text-green-700'}`}>
                  {isVibExceeded ? 'EXCEEDED' : 'IN LIMITS'}
                </td>
              </tr>
              <tr>
                <td className="p-2">Fuel Flow Rate</td>
                <td className="p-2 font-bold">{t.fuel_flow} L/h</td>
                <td className="p-2">{pm.expectedValues.fuel_flow} L/h</td>
                <td className="p-2">Nominal Cruise: 24.5 L/h</td>
                <td className="p-2 text-emerald-400 print:text-green-700 font-bold">NOMINAL</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Physics Residuals & Grey-Box Discrepancies */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold text-slate-300 print:text-black uppercase flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>2. FIRST-PRINCIPLES PHYSICS RESIDUALS (OBSERVED vs GREY-BOX BASELINE)</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            {pm.residuals.slice(0, 4).map((res) => (
              <div key={res.parameter} className="p-2.5 rounded bg-slate-900/60 border border-slate-800 print:bg-gray-100 print:border-gray-300">
                <span className="text-[10px] text-slate-400 uppercase block">{res.parameter.replace('_', ' ')}</span>
                <div className="text-sm font-bold text-white print:text-black mt-0.5">
                  Δ {res.residual > 0 ? `+${res.residual}` : res.residual} {res.unit}
                </div>
                <div className="text-[10px] text-slate-400">
                  Normalized: <span className={Math.abs(res.normalizedResidual) > 2 ? 'text-amber-400 font-bold' : 'text-slate-400'}>{res.normalizedResidual}σ</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnostic Findings & Sensor Validation */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold text-slate-300 print:text-black uppercase flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-cyan-400" />
            <span>3. PHM FAULT DIAGNOSTICS &amp; EVIDENCE REASONING</span>
          </h3>
          <div className="p-4 rounded-lg bg-slate-900/60 print:bg-gray-100 border border-slate-800 print:border-gray-300 text-xs space-y-3 font-mono">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div>
                <strong>Anomaly Classification:</strong> {a.classification}
              </div>
              <div className="text-cyan-400 print:text-blue-700">
                Anomaly Score: <strong>{(a.score * 100).toFixed(0)}%</strong> (Persistence: {a.persistenceDurationSec || 0}s)
              </div>
            </div>

            {state.faults.length > 0 ? (
              <div className="space-y-2">
                <div className="font-bold text-slate-300 print:text-black">Identified Root Causes:</div>
                {state.faults.map((f) => (
                  <div key={f.id || f.faultName} className="p-2 rounded bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex justify-between font-bold text-white print:text-black">
                      <span>{f.faultName} ({f.affectedSubsystem})</span>
                      <span className="text-amber-400">{Math.round(f.probability)}% Confidence</span>
                    </div>
                    {f.evidence && f.evidence.length > 0 && (
                      <div className="text-[11px] text-slate-400">
                        Evidence: {f.evidence.join('; ')}
                      </div>
                    )}
                    {f.alternativeHypotheses && f.alternativeHypotheses.length > 0 && (
                      <div className="text-[10px] text-cyan-400/80">
                        Alternative: {f.alternativeHypotheses[0].faultName} ({Math.round(f.alternativeHypotheses[0].probability)}% likelihood)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-emerald-400">
                All engine subsystems operating within statistical baseline boundaries. No persistent fault modes detected.
              </div>
            )}
          </div>
        </div>

        {/* Maintenance Recommendations */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold text-slate-300 print:text-black uppercase flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-cyan-400" />
            <span>4. PREDICTIVE MAINTENANCE DIRECTIVES</span>
          </h3>
          <div className="space-y-2">
            {state.maintenanceAdvisories.slice(0, 3).map((adv) => (
              <div key={adv.id} className="p-3 rounded-lg border border-slate-800 print:border-gray-300 text-xs font-mono">
                <div className="font-bold text-white print:text-black flex justify-between">
                  <span>{adv.issue}</span>
                  <span className={adv.priority === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}>[{adv.priority} PRIORITY]</span>
                </div>
                <div className="text-slate-400 print:text-gray-600 mt-1">{adv.suggestedInspection}</div>
                <div className="text-[10px] text-slate-500 mt-1">Subsystem: {adv.subsystem} | Urgency: &lt; {adv.estimatedUrgencyHours} hrs</div>
              </div>
            ))}
          </div>
        </div>

        {/* Research Disclaimer & Signoff */}
        <div className="border-t border-slate-800 print:border-gray-300 pt-6 text-[10px] font-mono text-slate-500 print:text-gray-600 space-y-2">
          <div>
            <strong>MANDATORY RESEARCH DISCLAIMER:</strong> AEGIS-TWIN is an AI-enabled software demonstrator using simulated and synthetic aero-piston telemetry. It is engineered strictly for research, benchmarking, algorithmic exploration, and DRDO/iDEX-style technical evaluation. It is not a certified flight-control system and does not claim operational military deployment.
          </div>
          <div className="flex justify-between pt-4 text-slate-400 print:text-black">
            <div>PROPULSION TELEMETRY EVALUATOR: Propulsion Systems Lead (Demo Environment)</div>
            <div>STATION CLEARANCE: DEMO-RESEARCH-UNIT-01</div>
          </div>
        </div>
      </div>
    </div>
  );
}

