'use client';

import React, { useState } from 'react';
import { SubsystemHealth, EngineTelemetry, HealthStatus } from '@/lib/types';
import {
  Flame,
  Droplets,
  Gauge,
  Thermometer,
  Wind,
  RotateCw,
  Zap,
  Activity,
  Radio,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface SubsystemNode {
  id: keyof Omit<SubsystemHealth, 'overall' | 'status' | 'confidence'>;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  telemetrySummary: string;
  inspectionGuide: string;
}

const SUBSYSTEM_DEFS: SubsystemNode[] = [
  {
    id: 'combustion',
    name: 'Cylinder / Combustion Chamber',
    category: 'Thermal & Power Generation',
    icon: Flame,
    telemetrySummary: 'CHT 1-4, EGT 1-4, Thermal Efficiency',
    inspectionGuide: 'Inspect spark plug gaps, compression pressure, and bore condition.',
  },
  {
    id: 'fuel_system',
    name: 'Fuel Injection System',
    category: 'Metering & Delivery',
    icon: Droplets,
    telemetrySummary: 'Fuel Flow (L/h), Injection Timing (°BTDC)',
    inspectionGuide: 'Verify fuel rail pressure, filter differential, and injector spray pattern.',
  },
  {
    id: 'lubrication',
    name: 'Lubrication Circuit',
    category: 'Hydraulic & Friction Management',
    icon: Gauge,
    telemetrySummary: 'Oil Pressure (bar), Oil Temperature (°C)',
    inspectionGuide: 'Check oil filter for metal particulate, oil level, and pressure relief valve.',
  },
  {
    id: 'cooling',
    name: 'Thermal Cooling System',
    category: 'Heat Exchangers & Liquid Jacket',
    icon: Thermometer,
    telemetrySummary: 'Coolant Flow, Ram-Air Radiator Delta',
    inspectionGuide: 'Examine radiator duct airflow, coolant level, and water pump drive belt.',
  },
  {
    id: 'exhaust',
    name: 'Turbocharger & Exhaust Manifold',
    category: 'Gas Dynamics & Scavenging',
    icon: Wind,
    telemetrySummary: 'Turbine Inlet Temp, Exhaust Gas Temp Avg',
    inspectionGuide: 'Check wastegate linkage, turbo compressor wheel play, and manifold welds.',
  },
  {
    id: 'crankshaft',
    name: 'Crankshaft & Rotating Assembly',
    category: 'Kinematics & Structural Dynamics',
    icon: RotateCw,
    telemetrySummary: 'Engine RPM, Vibration RMS (mm/s)',
    inspectionGuide: 'Measure crankshaft journal clearance, torsional damper, and main bearings.',
  },
  {
    id: 'propeller',
    name: 'Propeller Reduction Interface',
    category: 'Thrust Transmission',
    icon: Activity,
    telemetrySummary: 'Gearbox Ratio, Torsional Resonance Index',
    inspectionGuide: 'Inspect gearbox dog clutch, propeller hub balance, and pitch governor.',
  },
  {
    id: 'electrical',
    name: 'Electrical & FADEC Power',
    category: 'Avionics Power & Ignition',
    icon: Zap,
    telemetrySummary: 'Bus Voltage (28V), Alternator Current (A)',
    inspectionGuide: 'Check alternator belt, master circuit breakers, and battery charge state.',
  },
  {
    id: 'sensors',
    name: 'Sensors & CAN Transceivers',
    category: 'Data Acquisition & Telemetry',
    icon: Radio,
    telemetrySummary: 'CAN Bus Frames, Sensor Signal Plausibility',
    inspectionGuide: 'Perform transducer zero-point calibration and inspect wiring harnesses.',
  },
];

interface DigitalTwinEngineProps {
  health: SubsystemHealth;
  telemetry: EngineTelemetry;
}

export const DigitalTwinEngine: React.FC<DigitalTwinEngineProps> = ({ health, telemetry }) => {
  const [selectedSubsystem, setSelectedSubsystem] = useState<SubsystemNode | null>(null);

  const getStatusColor = (score: number) => {
    if (score >= 90) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', fill: '#10b981', label: 'NORMAL' };
    if (score >= 75) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/40', fill: '#f59e0b', label: 'MONITOR' };
    if (score >= 50) return { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/40', fill: '#f97316', label: 'DEGRADED' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/40', fill: '#ef4444', label: 'CRITICAL' };
  };

  return (
    <div className="space-y-6">
      {/* Schematic Overview Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-[#0c1220] border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              VIRTUAL AERO ENGINE TWIN ARCHITECTURE
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Continuously synchronized model of 4-stroke turbocharged aero piston engine. Click any subsystem block for deep telemetry inspection.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
            STATE: <strong className="text-cyan-400">{telemetry.flight_state}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
            CONFIDENCE: <strong className="text-emerald-400">{health.confidence}%</strong>
          </span>
        </div>
      </div>

      {/* Subsystems Interactive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUBSYSTEM_DEFS.map((sub) => {
          const score = health[sub.id] as number;
          const status = getStatusColor(score);
          const Icon = sub.icon;

          return (
            <div
              key={sub.id}
              onClick={() => setSelectedSubsystem(sub)}
              className={`aerospace-panel p-4 cursor-pointer hover:border-cyan-500/60 transition-all duration-200 group flex flex-col justify-between relative overflow-hidden ${
                score < 75 ? 'border-amber-500/40' : ''
              }`}
            >
              {/* Top Row: Icon & Status */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg border ${status.bg} ${status.border} ${status.text}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                        {sub.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">
                        {sub.category}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${status.bg} ${status.border} ${status.text}`}>
                    {status.label}
                  </span>
                </div>

                {/* Score & Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs font-mono">
                    <span className="text-slate-400">Subsystem Health:</span>
                    <span className={`font-bold ${status.text}`}>{score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${score}%`, backgroundColor: status.fill }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Quick Telemetry Summary */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="truncate">{sub.telemetrySummary}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Subsystem Inspection Detail Modal */}
      {selectedSubsystem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#0b1220] border border-cyan-500/50 rounded-xl shadow-2xl p-6 text-slate-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <selectedSubsystem.icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    Digital Twin Component Inspector
                  </span>
                  <h3 className="text-lg font-bold text-white">{selectedSubsystem.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubsystem(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Health Status & Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Health Score</div>
                <div className="text-xl font-mono font-bold text-cyan-300">
                  {health[selectedSubsystem.id] as number}%
                </div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Flight State</div>
                <div className="text-sm font-mono font-bold text-white">{telemetry.flight_state}</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Engine RPM</div>
                <div className="text-xl font-mono font-bold text-white">{telemetry.rpm}</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Load %</div>
                <div className="text-xl font-mono font-bold text-white">{telemetry.engine_load}%</div>
              </div>
            </div>

            {/* Detailed Parameters List */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 mb-4 space-y-2">
              <div className="text-xs font-mono font-bold text-slate-300 uppercase">
                Active Telemetry Cross-Readout
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div>CHT Avg: <span className="text-cyan-300">{telemetry.cht_avg} °C</span></div>
                <div>EGT Avg: <span className="text-cyan-300">{telemetry.egt_avg} °C</span></div>
                <div>Oil Press: <span className="text-cyan-300">{telemetry.oil_pressure} bar</span></div>
                <div>Oil Temp: <span className="text-cyan-300">{telemetry.oil_temperature} °C</span></div>
                <div>Fuel Flow: <span className="text-cyan-300">{telemetry.fuel_flow} L/h</span></div>
                <div>Vibration: <span className="text-cyan-300">{telemetry.vibration_rms} mm/s</span></div>
              </div>
            </div>

            {/* Maintenance Guidance */}
            <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-lg p-3.5 space-y-1">
              <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Recommended Technical Directive:</span>
              </div>
              <p className="text-xs text-slate-300">{selectedSubsystem.inspectionGuide}</p>
            </div>

            {/* Footer Close */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedSubsystem(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
