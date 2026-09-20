'use client';

import React, { useState } from 'react';
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
  Zap,
  Server,
  Terminal,
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export default function SystemArchitecturePage() {
  const [selectedView, setSelectedView] = useState<'pipeline' | 'deployment' | 'latency'>('pipeline');

  const pipelineTiers = [
    {
      tier: 'LAYER 1: TRANSDUCERS & SENSORS',
      title: 'Aero-Piston Engine Instrumentation Suite',
      desc: '26 physical and virtual telemetry channels: Type-K thermocouples (CHT 1-4, EGT 1-4), piezoresistive oil pressure transducers, hall-effect crankshaft RPM pick-ups, piezoelectric vibration accelerometers, turbine manifold pressure transducers, and capacitive fuel flow sensors.',
      channels: '26 telemetry parameters | Rotax 914 / 916 iS compatible | 10 Hz sampling',
      icon: Activity,
      color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    },
    {
      tier: 'LAYER 2: AVIONICS & CAN PROTOCOL',
      title: 'Dual-Redundant Aerospace CAN 2.0B / J1939 Bus',
      desc: 'ISO 11898 standard, 1 Mbps baud rate, cyclic CAN frames: 0x18FE0100 (EGT 1/2), 0x18FE0200 (EGT 3/4), 0x18FEE400 (RPM & Throttle), 0x18FEE500 (Temperatures & CHT), 0x18FEEF00 (Pressures), 0x18FEF200 (Fuel Flow), 0x18FEE600 (Manifold Pressure).',
      channels: 'PGN arbitration | 8-byte payload packing | Parity & CRC error counting',
      icon: Binary,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    },
    {
      tier: 'LAYER 3: SENSOR HEALTH & DATA VALIDATION',
      title: 'Transducer Integrity & Signal Conditioning Engine',
      desc: 'Pre-inference verification: physical range clamps, frozen/stuck value detector (>15 ticks), rate-of-change physics limits, CAN frame drop tracking, EGT vs CHT cross-channel thermal consistency, and thermocouple gradual drift isolation.',
      channels: 'Sensor Quality Index (0-100%) | Damped anomaly thresholding | Signal fault isolation',
      icon: ShieldCheck,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
    {
      tier: 'LAYER 4: FIRST-PRINCIPLES PHYSICS GREY-BOX',
      title: 'Thermodynamic & Mechanical Digital Twin Core',
      desc: 'Dynamic baseline estimation based on engine RPM and throttle setting. Continuously calculates expected values for EGT, CHT, oil pressure, fuel consumption, and vibration. Evaluates model validity operating envelope (VALID / EXTRAPOLATED / OUT OF DOMAIN).',
      channels: 'Thermodynamic efficiency | Residuals (observed - expected) | Normalized z-scores',
      icon: Cpu,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    },
    {
      tier: 'LAYER 5: STATISTICAL & ML ANOMALY DETECTOR',
      title: 'Hybrid Residual & Trend Anomaly Scorer',
      desc: 'Multi-parameter residual fusion combined with rolling standard deviations. Implements N=3 frame temporal persistence filtering to eliminate transient sensor flutter. Computes detection lead time and persistence duration.',
      channels: 'Weighted multi-sensor fusion | 0.0-1.0 anomaly score | Lead-time tracking',
      icon: Zap,
      color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    },
    {
      tier: 'LAYER 6: MULTI-CLASS FAULT DIAGNOSTICIAN',
      title: '12-Class Failure Mode Classifier with Evidence Reasoning',
      desc: 'Classifies failure modes across combustion, thermal, lubrication, fuel, electrical, and structural domains. Primary demonstration scenario: Gradual Cylinder 3 Injector Degradation. Explicitly outputs differential diagnoses, alternative hypotheses, and data limitation notices.',
      channels: '12 failure modes | Evidence trail generation | Alternative hypotheses',
      icon: Brain,
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    },
    {
      tier: 'LAYER 7: UNCERTAINTY-AWARE PROGNOSTICS',
      title: 'Physics-Guided RUL Forecasting with 80% CI',
      desc: 'Component-specific degradation tracking. Projects Remaining Useful Life based on degradation rates towards explicit failure criteria (e.g., injector nozzle thermal threshold 910°C, oil minimum limit 1.8 bar). Reports median hours with 80% confidence interval bounds.',
      channels: 'Uncertainty intervals [lower, upper] | Component-specific failure criteria | RUL trajectory',
      icon: Clock,
      color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    },
    {
      tier: 'LAYER 8: COMPOSITE ENGINE HEALTH INDEX',
      title: 'Multi-Subsystem Health Scoring & Penalty Tree',
      desc: 'Documented weighted degradation formula: Health = 100 - sum(Penalty_i * Weight_i). Subsystems: Combustion (25%), Thermal (20%), Lubrication (20%), Vibration (15%), Fuel System (10%), Electrical (5%), Sensor/Data (5%). Exposes active penalty breakdown.',
      channels: 'Deterministic score calculation | Subsystem sub-indexes | Transparent deduction log',
      icon: HeartPulse,
      color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    },
    {
      tier: 'LAYER 9: MISSION RELIABILITY & OPERATIONAL MARGINS',
      title: 'Mission Suitability & Flight-Phase Risk Engine',
      desc: 'Translates engine telemetry into operational flight decisions: GO, CONDITIONAL GO, or MAINTENANCE REQUIRED. Monitors 5 vital margins: Fuel Reserve, CHT Thermal Headroom, EGT Thermal Headroom, Oil Pressure Margin, and Structural Vibration Margin.',
      channels: 'Flight phase breakdown (Climb/Cruise/Loiter/Descent) | Safety margins | Decision support only',
      icon: LayoutDashboard,
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    },
    {
      tier: 'LAYER 10: GROUND CONTROL STATION & DISPATCH',
      title: 'Ground Station Dashboard, Replay & Maintenance Dispatch',
      desc: 'Unified dark aerospace interface for flight operators and propulsion engineers: Real-time Cockpit Gauges, Diagnostic X-Ray, Digital Twin 3D Inspection, Time-Series Scrubbing Replay, and Post-Sortie PDF/CSV Debrief Generation.',
      channels: 'Air-gapped offline operation | Zero external cloud dependencies | Sub-second UI updates',
      icon: Radio,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    },
  ];

  const deploymentComparison = [
    {
      feature: 'Runtime Architecture',
      demonstrator: 'Next.js 15, React 19, TypeScript Client/Node runtime',
      targetGcs: 'Linux RT-PREEMPT Edge SBC + C++/Python daemon',
    },
    {
      feature: 'CAN Telemetry Input',
      demonstrator: 'Virtual CAN Transceiver with synthetic physics engine',
      targetGcs: 'Hardware SocketCAN (can0/can1) via isolated CAN transceivers',
    },
    {
      feature: 'Inference Engine',
      demonstrator: 'Optimized TypeScript grey-box & ML inference pipeline',
      targetGcs: 'ONNX Runtime / C++ embedded inference engine',
    },
    {
      feature: 'Network Dependency',
      demonstrator: '100% Offline-capable, zero external cloud required',
      targetGcs: '100% Air-gapped, point-to-point RS-422 / Mil-Std Ethernet',
    },
    {
      feature: 'Telemetry Archival',
      demonstrator: 'Browser memory buffer + LocalStorage mission logs',
      targetGcs: 'NVMe write-ahead WAL + Parquet mission archive',
    },
    {
      feature: 'Operator Display',
      demonstrator: 'Responsive browser GCS UI (1920x1080 optimized)',
      targetGcs: 'Ruggedized Mil-Spec GCS dual-display console',
    },
    {
      feature: 'Certification Status',
      demonstrator: 'Research demonstrator / Engineering evaluation prototype',
      targetGcs: 'Subject to DO-178C / DO-254 military qualification process',
    },
  ];

  const latencyBudget = [
    { step: 'CAN Bus Frame Decode & Unpacking', timeMs: '0.8 ms', budgetPct: '5.3%' },
    { step: 'Sensor Health & Cross-Channel Validation', timeMs: '1.4 ms', budgetPct: '9.3%' },
    { step: 'First-Principles Grey-Box Residual Computation', timeMs: '2.1 ms', budgetPct: '14.0%' },
    { step: 'Anomaly Detection & Persistence Evaluation', timeMs: '1.2 ms', budgetPct: '8.0%' },
    { step: '12-Class Fault Classifier & Hypothesis Scoring', timeMs: '3.5 ms', budgetPct: '23.3%' },
    { step: 'Uncertainty RUL & Margin Trajectory Projection', timeMs: '2.8 ms', budgetPct: '18.7%' },
    { step: 'Health Index & Mission Risk Evaluation', timeMs: '1.2 ms', budgetPct: '8.0%' },
    { step: 'UI State Serialization & Store Update', timeMs: '2.0 ms', budgetPct: '13.3%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>AEGIS-TWIN SYSTEM &amp; PIPELINE ARCHITECTURE</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end technical topology: From aero engine transducers through CAN bus, sensor integrity layer, physics grey-box, AI diagnostics, and ground station operations.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setSelectedView('pipeline')}
            className={`px-3 py-1.5 rounded-md font-bold transition ${
              selectedView === 'pipeline' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Functional Pipeline
          </button>
          <button
            onClick={() => setSelectedView('deployment')}
            className={`px-3 py-1.5 rounded-md font-bold transition ${
              selectedView === 'deployment' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Demo vs Target GCS
          </button>
          <button
            onClick={() => setSelectedView('latency')}
            className={`px-3 py-1.5 rounded-md font-bold transition ${
              selectedView === 'latency' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            10 Hz Latency Budget
          </button>
        </div>
      </div>

      {/* View 1: Functional Pipeline */}
      {selectedView === 'pipeline' && (
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
                      ACTIVE SUBSYSTEM
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-12">{t.desc}</p>
                  <div className="pl-12 pt-1">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
                      Technical Spec: {t.channels}
                    </span>
                  </div>
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
      )}

      {/* View 2: Demonstration vs Target GCS Edge Mode */}
      {selectedView === 'deployment' && (
        <div className="aerospace-panel p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Deployment Mode Comparison: Software Demonstrator vs Operational Target</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Clear distinction between the research demonstration environment (evaluated here) and the future ruggedized UAV GCS target architecture.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border border-slate-800">
              <thead className="bg-slate-900 text-slate-300">
                <tr>
                  <th className="p-3 border-b border-slate-800 w-1/4">Architecture Feature</th>
                  <th className="p-3 border-b border-slate-800 w-3/8 text-cyan-300">
                    Demonstration Mode (Current Evaluation Prototype)
                  </th>
                  <th className="p-3 border-b border-slate-800 w-3/8 text-amber-300">
                    Target GCS Mode (Future Field Implementation)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {deploymentComparison.map((row) => (
                  <tr key={row.feature} className="hover:bg-slate-900/30">
                    <td className="p-3 font-bold text-slate-300">{row.feature}</td>
                    <td className="p-3 text-slate-300">{row.demonstrator}</td>
                    <td className="p-3 text-slate-400">{row.targetGcs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-xs font-mono text-cyan-300 space-y-1">
            <strong>PORTABILITY &amp; AIR-GAPPING:</strong>
            <p className="text-slate-300">
              Both configurations maintain strict offline capability with no telemetry streaming to external cloud endpoints. Demonstrator code runs fully within an isolated workstation environment.
            </p>
          </div>
        </div>
      )}

      {/* View 3: 10 Hz Real-Time Latency Budget */}
      {selectedView === 'latency' && (
        <div className="aerospace-panel p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Execution Profile &amp; Latency Budget (10 Hz Nominal Cycle)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Breakdown of computation time per 100 ms telemetry frame. Total pipeline execution consumes ~15 ms, maintaining an 85% safety margin under real-time constraints.
            </p>
          </div>

          <div className="space-y-3 font-mono">
            {latencyBudget.map((step) => (
              <div key={step.step} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-200">{step.step}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">Budget: {step.budgetPct}</span>
                  <span className="font-bold text-cyan-400 w-16 text-right">{step.timeMs}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center text-xs font-mono">
            <div>
              <span className="text-slate-400 uppercase block text-[10px]">Total Step Execution Time:</span>
              <span className="text-lg font-bold text-emerald-400">15.0 ms</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase block text-[10px]">Telemetry Cycle Period:</span>
              <span className="text-lg font-bold text-cyan-300">100.0 ms (10 Hz)</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase block text-[10px]">Real-Time Headroom:</span>
              <span className="text-lg font-bold text-emerald-400">85.0% Margin</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

