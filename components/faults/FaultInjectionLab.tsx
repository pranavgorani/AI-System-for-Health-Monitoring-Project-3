'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/useAppState';
import { injectFault, clearFault } from '@/lib/store';
import { ActiveFaultType } from '@/lib/types';
import {
  Flame,
  Droplets,
  Thermometer,
  Gauge,
  Radio,
  AlertOctagon,
  RotateCw,
  Zap,
  Activity,
  RotateCcw,
  CheckCircle2,
  Info,
  Clock,
  Sliders,
  ShieldAlert,
} from 'lucide-react';

interface FaultOption {
  type: ActiveFaultType;
  name: string;
  isPrimary?: boolean;
  affectedCylinder?: number | string;
  affectedParameter: string;
  description: string;
  subsystem: string;
  expectedSymptom: string;
  expectedLeadTimeSec: number;
  expectedDiagnosis: string;
  expectedRecommendation: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const FAULT_OPTIONS: FaultOption[] = [
  {
    type: 'GRADUAL_INJECTOR_DEGRADATION',
    name: 'Gradual Cylinder 3 Injector Degradation (Primary Demo)',
    isPrimary: true,
    affectedCylinder: 3,
    affectedParameter: 'Cylinder 3 EGT (+46°C) & Fuel Flow (+8%)',
    description: 'Simulates progressive restriction and spray fouling on Cylinder 3 nozzle, driving local lean burn and FADEC global rich trim compensation.',
    subsystem: 'Fuel Injection & Combustion',
    expectedSymptom: 'Cyl 3 EGT rises +46°C above peer cylinders; fuel flow rises +8%; vibration RMS rises +14%.',
    expectedLeadTimeSec: 120,
    expectedDiagnosis: 'Likely fault: Cylinder 3 injector degradation (82% Conf). Alt: EGT sensor drift (31%).',
    expectedRecommendation: 'Inspect injector and validate EGT sensor before next endurance mission.',
    icon: Droplets,
    accentColor: 'from-cyan-600 via-blue-600 to-indigo-600',
  },
  {
    type: 'MISFIRE',
    name: 'Sudden Cylinder 3 Misfire',
    affectedCylinder: 3,
    affectedParameter: 'Cylinder 3 EGT (-220°C) & Vibration RMS (>7.0 mm/s)',
    description: 'Instantaneous ignition or injection failure on single cylinder inducing acute rotational torque unbalance.',
    subsystem: 'Combustion System',
    expectedSymptom: 'Sharp EGT drop (-220°C) with synchronized 0.5x rotational vibration harmonic surge.',
    expectedLeadTimeSec: 15,
    expectedDiagnosis: 'Cylinder #3 Misfire (94% Conf). Alt: Complete injector solenoid failure.',
    expectedRecommendation: 'Immediate engine shutdown. Inspect spark plug and ignition coil on Cylinder 3.',
    icon: Flame,
    accentColor: 'from-rose-600 to-red-700',
  },
  {
    type: 'LUBRICATION_ISSUE',
    name: 'Oil Pressure Hydraulic Decay',
    affectedCylinder: 'ALL',
    affectedParameter: 'Oil Pressure (< 1.5 bar) & Oil Temp (> 120°C)',
    description: 'Loss of hydraulic gallery pressure threatening hydrodynamic fluid film collapse in crankshaft journal bearings.',
    subsystem: 'Lubrication System',
    expectedSymptom: 'Pressure drops to <1.5 bar with progressive oil temperature surge.',
    expectedLeadTimeSec: 30,
    expectedDiagnosis: 'Low Lubrication System Pressure (96% Conf). Alt: Relief valve stuck open.',
    expectedRecommendation: 'Ground engine immediately. Inspect oil pump and scavenge filter element.',
    icon: Gauge,
    accentColor: 'from-amber-600 to-rose-700',
  },
  {
    type: 'OVERHEATING',
    name: 'Coupled Thermal Overheating Trend',
    affectedCylinder: 'ALL',
    affectedParameter: 'Average CHT (> 145°C) & Oil Temp (> 118°C)',
    description: 'Convective heat dissipation breakdown due to cooling radiator matrix blockage or stuck airflow shutter.',
    subsystem: 'Cooling & Thermal Management',
    expectedSymptom: 'Simultaneous upward climb in cylinder head temperatures and lubricant oil temperature.',
    expectedLeadTimeSec: 90,
    expectedDiagnosis: 'Engine Thermal Overheating Trend (91% Conf). Alt: Radiator cowl shutter failure.',
    expectedRecommendation: 'Enrich mixture, reduce climb throttle, and check cooling airflow matrix.',
    icon: Thermometer,
    accentColor: 'from-orange-600 to-rose-600',
  },
  {
    type: 'ABNORMAL_VIBRATION',
    name: 'Rotating Assembly Structural Vibration Increase',
    affectedCylinder: 'ALL',
    affectedParameter: 'Vibration RMS (> 7.5 mm/s)',
    description: 'High dynamic unbalance or propeller pitch unbalance exceeding continuous structural fatigue limits.',
    subsystem: 'Crankshaft & Propeller',
    expectedSymptom: 'Broadband vibration RMS climbs > 7.5 mm/s across constant RPM loiter.',
    expectedLeadTimeSec: 60,
    expectedDiagnosis: 'High Rotating Assembly Vibration (88% Conf). Alt: Propeller mass unbalance.',
    expectedRecommendation: 'Perform dynamic propeller rebalancing and inspect reduction gearbox dog teeth.',
    icon: RotateCw,
    accentColor: 'from-purple-600 to-indigo-700',
  },
  {
    type: 'SENSOR_DRIFT',
    name: 'EGT Cylinder #2 Thermocouple Drift (+1°C/min)',
    affectedCylinder: 2,
    affectedParameter: 'EGT 2 Monotonic Drift',
    description: 'Gradual instrumentation decalibration decoupled from cylinder head thermals and adjacent cylinders.',
    subsystem: 'Sensors & Instrumentation',
    expectedSymptom: 'Slow upward drift on single EGT while CHT 2 and peer cylinders remain completely stable.',
    expectedLeadTimeSec: 180,
    expectedDiagnosis: 'Thermocouple Sensor Monotonic Drift (89% Conf). Classified as SENSOR_ANOMALY.',
    expectedRecommendation: 'Recalibrate Type-K thermocouple lead and junction reference compensator.',
    icon: Activity,
    accentColor: 'from-teal-600 to-cyan-600',
  },
  {
    type: 'FROZEN_SENSOR',
    name: 'Frozen Transducer Output (Zero Entropy)',
    affectedCylinder: 'ALL',
    affectedParameter: 'Oil Pressure Transducer (Static 3.8 bar)',
    description: 'Sensor reading remains strictly identical over consecutive frames while throttle and RPM vary.',
    subsystem: 'Sensors & Instrumentation',
    expectedSymptom: 'Zero numerical delta across 15+ frames under variable engine operating conditions.',
    expectedLeadTimeSec: 45,
    expectedDiagnosis: 'Transducer Signal Frozen (90% Conf). Classified as SENSOR_ANOMALY.',
    expectedRecommendation: 'Inspect analog signal conditioning board and check for ADC latch-up.',
    icon: Radio,
    accentColor: 'from-slate-600 to-zinc-700',
  },
  {
    type: 'CAN_DROPOUT',
    name: 'Avionics CAN Bus Frame Timeout / Dropout',
    affectedCylinder: 'ALL',
    affectedParameter: 'CAN Frame Missing Flag',
    description: 'Simulates dropped communication frames or cable shielding EMI interference.',
    subsystem: 'Avionics Communications',
    expectedSymptom: 'CAN timeout indicator trips and bus frame load drops.',
    expectedLeadTimeSec: 10,
    expectedDiagnosis: 'Avionics CAN Bus Frame Timeout (95% Conf). Classified as COMM_ANOMALY.',
    expectedRecommendation: 'Inspect 120Ω bus termination and physical harness shielding integrity.',
    icon: AlertOctagon,
    accentColor: 'from-yellow-600 to-amber-700',
  },
  {
    type: 'ELECTRICAL_FAULT',
    name: 'Alternator Circuit Failure & Battery Degradation',
    affectedCylinder: 'ALL',
    affectedParameter: 'Bus Voltage (< 22.0V) & Current (< 2A)',
    description: 'Alternator generation failure causing FADEC bus voltage to sag onto battery depletion discharge curve.',
    subsystem: 'Electrical & FADEC Bus',
    expectedSymptom: 'Bus voltage drops below 24.0V while alternator current drops to near zero.',
    expectedLeadTimeSec: 60,
    expectedDiagnosis: 'Alternator Charging Circuit Anomaly (92% Conf). Alt: Main bus short circuit.',
    expectedRecommendation: 'Inspect alternator drive belt and replace master voltage regulator module.',
    icon: Zap,
    accentColor: 'from-amber-500 to-yellow-600',
  },
];

export const FaultInjectionLab: React.FC = () => {
  const state = useAppState();
  const activeType = state.activeFault.type;
  const [severity, setSeverity] = useState(0.85);
  const [rampDuration, setRampDuration] = useState(30);

  return (
    <div className="space-y-6">
      {/* Research & Safety Notice */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-start gap-2.5">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white uppercase font-bold">Research & Demonstration Control Bench:</strong>{' '}
          Fault injection capabilities are strictly for simulated synthetic verification and algorithmic benchmarking. They do not interface with live flight hardware and are never exposed as operational ground-station commands.
        </div>
      </div>

      {/* Active Injection Status Bar */}
      <div
        className={`p-5 rounded-xl border transition-all duration-300 ${
          activeType !== 'NONE'
            ? 'bg-rose-950/30 border-rose-500/50 shadow-lg'
            : 'bg-[#0b1220] border-slate-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg border ${
                activeType !== 'NONE'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {activeType !== 'NONE' ? <AlertOctagon className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                Active Benchmark Profile:
              </div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>{activeType !== 'NONE' ? activeType.replace(/_/g, ' ') : 'NOMINAL BASELINE (NO FAULT ACTIVE)'}</span>
                {activeType !== 'NONE' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500 text-white font-black animate-pulse">
                    INJECTED
                  </span>
                )}
              </div>
              {state.activeFault.notes && (
                <div className="text-xs text-rose-300/80 font-mono mt-0.5">{state.activeFault.notes}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeType !== 'NONE' && (
              <button
                onClick={() => clearFault()}
                className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span>Clear / Restore Baseline</span>
              </button>
            )}
          </div>
        </div>

        {/* Fault Execution Metadata if active */}
        {activeType !== 'NONE' && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-900/60 p-2 rounded">
              <span className="text-slate-400 block text-[10px]">AFFECTED SUBSYSTEM</span>
              <strong className="text-white">{state.activeFault.subsystem}</strong>
            </div>
            <div className="bg-slate-900/60 p-2 rounded">
              <span className="text-slate-400 block text-[10px]">INJECTION SEVERITY</span>
              <strong className="text-amber-400">{Math.round((state.activeFault.severity || 0.85) * 100)}%</strong>
            </div>
            <div className="bg-slate-900/60 p-2 rounded">
              <span className="text-slate-400 block text-[10px]">START TIME (UTC)</span>
              <strong className="text-slate-200">{state.activeFault.startedAt.slice(11, 19) || 'Active'}</strong>
            </div>
            <div className="bg-slate-900/60 p-2 rounded">
              <span className="text-slate-400 block text-[10px]">AI ANOMALY SCORE</span>
              <strong className={state.anomalies.score > 0.4 ? 'text-rose-400' : 'text-emerald-400'}>
                {state.anomalies.score} ({state.anomalies.classification})
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Global Injection Tuning Controls */}
      <div className="aerospace-panel p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold uppercase flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>INJECTION PARAMETER CONTROLS</span>
          </span>
          <span className="text-slate-500">Configurable before test execution</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Severity Multiplier:</span>
              <strong className="text-cyan-300">{Math.round(severity * 100)}%</strong>
            </div>
            <input
              type="range"
              min="0.3"
              max="1.0"
              step="0.05"
              value={severity}
              onChange={(e) => setSeverity(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Ramp Duration:</span>
              <strong className="text-amber-300">{rampDuration} seconds</strong>
            </div>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={rampDuration}
              onChange={(e) => setRampDuration(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 9 Aerospace Failure Scenarios Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold uppercase">
            AERO-PISTON BENCHMARK SCENARIO CATALOG ({FAULT_OPTIONS.length} FAILURE MODES)
          </span>
          <span className="text-cyan-400 font-bold">SELECT TO INJECT</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FAULT_OPTIONS.map((opt) => {
            const isCurrent = activeType === opt.type;
            const Icon = opt.icon;

            return (
              <div
                key={opt.type}
                className={`aerospace-panel p-4 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-rose-500 bg-rose-950/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                    : opt.isPrimary
                    ? 'border-cyan-500/60 bg-cyan-950/15 hover:border-cyan-400'
                    : 'hover:border-slate-600'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${opt.accentColor} text-white shadow`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        {opt.isPrimary && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase font-black block mb-0.5">
                            PRIMARY DRDO DEMO SCENARIO
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-white leading-tight">{opt.name}</h4>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">{opt.description}</p>

                  <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 space-y-1.5 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">AFFECTED CHANNEL:</span>
                      <span className="text-cyan-300 font-semibold">{opt.affectedParameter}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">EXPECTED SYMPTOM:</span>
                      <span className="text-slate-300 leading-tight block">{opt.expectedSymptom}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                      <span className="text-slate-500">LEAD TIME:</span>
                      <strong className="text-amber-400">~{opt.expectedLeadTimeSec}s</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-800">
                  <button
                    onClick={() => {
                      if (isCurrent) {
                        clearFault();
                      } else {
                        injectFault(opt.type, opt.description, severity);
                      }
                    }}
                    className={`w-full py-2 px-3 rounded text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition ${
                      isCurrent
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow'
                        : opt.isPrimary
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md border border-cyan-400/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>CLEAR FAULT</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-3.5 h-3.5" />
                        <span>INJECT {opt.type.replace(/_/g, ' ')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
