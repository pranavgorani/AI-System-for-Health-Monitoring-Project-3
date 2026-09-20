'use client';

import React from 'react';
import { useAppState } from '@/lib/useAppState';
import { injectFault, clearFault } from '@/lib/store';
import { ActiveFaultInjection } from '@/lib/types';
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
} from 'lucide-react';

interface FaultOption {
  type: ActiveFaultInjection['type'];
  name: string;
  description: string;
  subsystem: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const FAULT_OPTIONS: FaultOption[] = [
  {
    type: 'MISFIRE',
    name: 'Cylinder #3 Misfire',
    description: 'Forces severe EGT drop (-220°C) on Cylinder 3 with accompanying harmonic rotational vibration spike.',
    subsystem: 'Combustion System',
    icon: Flame,
    accentColor: 'from-amber-600 to-rose-600',
  },
  {
    type: 'INJECTOR_ABNORMALITY',
    name: 'Injector Spray Imbalance',
    description: 'Restricts fuel delivery to Cylinder 1, causing lean combustion and elevated cylinder-to-cylinder thermal delta.',
    subsystem: 'Fuel Injection',
    icon: Droplets,
    accentColor: 'from-orange-600 to-amber-600',
  },
  {
    type: 'OVERHEATING',
    name: 'Cooling Degradation / Overheating',
    description: 'Coupled thermal surge raising CHT >150°C and Oil Temp >125°C due to radiator baffle or coolant restriction.',
    subsystem: 'Cooling & Thermal',
    icon: Thermometer,
    accentColor: 'from-rose-600 to-red-700',
  },
  {
    type: 'LUBRICATION_ISSUE',
    name: 'Low Oil Line Pressure',
    description: 'Drops hydraulic line pressure down to 1.2 bar and surges friction temperature in journal bearings.',
    subsystem: 'Lubrication System',
    icon: Gauge,
    accentColor: 'from-red-600 to-rose-800',
  },
  {
    type: 'ABNORMAL_VIBRATION',
    name: 'High Rotor / Bearing Vibration',
    description: 'Injects severe rotational unbalance and bearing defect harmonics reaching >8.5 mm/s RMS.',
    subsystem: 'Crankshaft & Propeller',
    icon: RotateCw,
    accentColor: 'from-purple-600 to-indigo-700',
  },
  {
    type: 'SENSOR_DRIFT',
    name: 'Thermocouple Sensor Drift (+1°C/min)',
    description: 'Introduces a continuous monotonic upward drift (+1.0°C/min) on CHT thermocouple signal without physical engine heating.',
    subsystem: 'Sensors & CAN',
    icon: Activity,
    accentColor: 'from-cyan-600 to-blue-600',
  },
  {
    type: 'SENSOR_FAILURE',
    name: 'Oil Pressure Sensor Dropout (0.0 bar)',
    description: 'Plaussibility failure: Truncates oil transducer reading to 0.0 bar while engine operates at high RPM.',
    subsystem: 'Sensors & CAN',
    icon: Radio,
    accentColor: 'from-slate-600 to-zinc-700',
  },
  {
    type: 'COMBUSTION_INSTABILITY',
    name: 'Combustion Surging / Instability',
    description: 'Creates cyclic cyclic torque hunting and ±65°C oscillatory swings across cylinder exhaust gas outputs.',
    subsystem: 'Combustion System',
    icon: AlertOctagon,
    accentColor: 'from-amber-500 to-orange-600',
  },
  {
    type: 'ELECTRICAL_FAULT',
    name: 'Alternator Bus Voltage Sag (<22V)',
    description: 'Drops alternator generation, dropping FADEC power rail onto battery depletion discharge curve.',
    subsystem: 'Electrical & Avionics',
    icon: Zap,
    accentColor: 'from-yellow-600 to-amber-700',
  },
];

export const FaultInjectionLab: React.FC = () => {
  const state = useAppState();
  const activeType = state.activeFault.type;

  return (
    <div className="space-y-6">
      {/* Active Injection Status Bar */}
      <div className={`p-4 rounded-xl border transition-all duration-300 ${
        activeType !== 'NONE'
          ? 'bg-rose-950/30 border-rose-500/50 shadow-lg'
          : 'bg-[#0b1220] border-slate-800'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg border ${
              activeType !== 'NONE'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              {activeType !== 'NONE' ? <AlertOctagon className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                Current Injection State:
              </div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>{activeType !== 'NONE' ? activeType.replace('_', ' ') : 'NOMINAL (NO FAULT INJECTED)'}</span>
                {activeType !== 'NONE' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500 text-white font-black">
                    ACTIVE
                  </span>
                )}
              </div>
              {state.activeFault.notes && (
                <div className="text-xs text-rose-300/80 font-mono mt-0.5">{state.activeFault.notes}</div>
              )}
            </div>
          </div>

          {activeType !== 'NONE' && (
            <button
              onClick={clearFault}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>CLEAR ACTIVE FAULT</span>
            </button>
          )}
        </div>
      </div>

      {/* Lab Notice */}
      <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/30 text-xs text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <strong>Software Fault Injection Facility:</strong> Clicking any profile below immediately alters the real-time physics engine, causing sensor anomalies to stream into the Digital Twin, AI Anomaly Detector, Fault Classifier, and Maintenance Advisory queue.
        </div>
      </div>

      {/* Fault Injection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FAULT_OPTIONS.map((opt) => {
          const isSelected = activeType === opt.type;
          const Icon = opt.icon;

          return (
            <div
              key={opt.type}
              className={`aerospace-panel p-4 flex flex-col justify-between transition-all duration-200 ${
                isSelected
                  ? 'border-rose-500 bg-rose-950/20 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                  : 'hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white">{opt.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {opt.subsystem}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">{opt.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => injectFault(opt.type, opt.description)}
                  disabled={isSelected}
                  className={`w-full py-1.5 px-3 rounded text-xs font-bold transition flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-rose-500 text-white cursor-default'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'INJECTED (ACTIVE)' : 'INJECT FAULT'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
