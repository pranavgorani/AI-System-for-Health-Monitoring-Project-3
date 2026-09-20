'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/useAppState';
import { setFlightState, updateCoefficients } from '@/lib/store';
import { FlightState } from '@/lib/types';
import {
  PlaneTakeoff,
  PlaneLanding,
  CloudSun,
  Flame,
  Mountain,
  Gauge,
  ShieldAlert,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface MissionScenario {
  id: string;
  name: string;
  altitudeFt: number;
  ambientTempC: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SCENARIOS: MissionScenario[] = [
  {
    id: 'NORMAL',
    name: 'Standard ISA Day',
    altitudeFt: 6500,
    ambientTempC: 15,
    description: 'Nominal operational envelope at standard lapse rate conditions.',
    icon: CloudSun,
  },
  {
    id: 'HOT_WEATHER',
    name: 'Desert / Hot Day (+45°C)',
    altitudeFt: 3500,
    ambientTempC: 45,
    description: 'Elevated ambient temperature severely reduces radiator convective cooling.',
    icon: Flame,
  },
  {
    id: 'HIGH_ALTITUDE',
    name: 'High Altitude Recon (18,000 ft)',
    altitudeFt: 18000,
    ambientTempC: -21,
    description: 'Thin atmosphere lowers ambient pressure to 506 hPa, requiring maximum turbo boost.',
    icon: Mountain,
  },
  {
    id: 'ENDURANCE',
    name: 'Endurance Loiter (12 Hours)',
    altitudeFt: 12000,
    ambientTempC: -8,
    description: 'Extended low-fuel cruise with progressive thermal wear accumulation.',
    icon: Clock,
  },
];

const FLIGHT_PHASES: { state: FlightState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { state: 'IDLE', label: '1. Pre-Start / Idle', icon: Gauge },
  { state: 'TAXI', label: '2. Ground Taxi', icon: Gauge },
  { state: 'TAKEOFF', label: '3. Full Takeoff (100%)', icon: PlaneTakeoff },
  { state: 'CLIMB', label: '4. Sustained Climb', icon: PlaneTakeoff },
  { state: 'CRUISE', label: '5. Mid-Altitude Cruise', icon: PlaneTakeoff },
  { state: 'HIGH_LOAD', label: '6. High-Load Evasion', icon: Flame },
  { state: 'DESCENT', label: '7. Step Descent', icon: PlaneLanding },
  { state: 'LANDING', label: '8. Approach & Touchdown', icon: PlaneLanding },
  { state: 'SHUTDOWN', label: '9. Engine Shutdown', icon: Gauge },
];

export const MissionSimulatorControl: React.FC = () => {
  const state = useAppState();
  const currentPhase = state.flightState;
  const currentCoeffs = state.coefficients;

  // Compute safety margins
  const thermalMargin = Math.max(0, Math.min(100, Math.round(100 - (state.currentTelemetry.cht_avg / 160) * 100)));
  const lubricationMargin = Math.max(0, Math.min(100, Math.round((state.currentTelemetry.oil_pressure / 5.5) * 100)));
  const vibrationMargin = Math.max(0, Math.min(100, Math.round(100 - (state.currentTelemetry.vibration_rms / 8.0) * 100)));
  const fuelMargin = Math.max(0, Math.min(100, Math.round((state.currentTelemetry.fuel_level / 120) * 100)));

  return (
    <div className="space-y-6">
      {/* Flight Phase Selector Bar */}
      <div className="aerospace-panel p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase">
            FLIGHT STATE MACHINE SELECTOR
          </span>
          <span className="text-xs font-mono text-cyan-400 font-bold">
            ACTIVE STATE: {currentPhase}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
          {FLIGHT_PHASES.map((p) => {
            const isActive = currentPhase === p.state;
            return (
              <button
                key={p.state}
                onClick={() => setFlightState(p.state)}
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="text-[10px] font-mono leading-tight">{p.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Environmental Scenario Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SCENARIOS.map((sc) => {
          const isSelected =
            currentCoeffs.altitudeFt === sc.altitudeFt && currentCoeffs.ambientTempC === sc.ambientTempC;
          const Icon = sc.icon;

          return (
            <div
              key={sc.id}
              onClick={() => {
                updateCoefficients({
                  altitudeFt: sc.altitudeFt,
                  ambientTempC: sc.ambientTempC,
                });
              }}
              className={`aerospace-panel p-4 cursor-pointer transition ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded bg-slate-800 text-cyan-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{sc.name}</h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    {sc.altitudeFt} ft | {sc.ambientTempC}°C
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400">{sc.description}</p>
            </div>
          );
        })}
      </div>

      {/* Mission Reliability Margins */}
      <div className="aerospace-panel p-4 space-y-4">
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
          MISSION RELIABILITY & SAFETY OPERATING MARGINS
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Thermal Margin */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Thermal Margin:</span>
              <strong className={thermalMargin > 30 ? 'text-emerald-400' : 'text-rose-400'}>
                {thermalMargin}%
              </strong>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full ${thermalMargin > 30 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${thermalMargin}%` }}
              />
            </div>
          </div>

          {/* Lubrication Margin */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Lubrication Margin:</span>
              <strong className={lubricationMargin > 40 ? 'text-emerald-400' : 'text-rose-400'}>
                {lubricationMargin}%
              </strong>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full ${lubricationMargin > 40 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${lubricationMargin}%` }}
              />
            </div>
          </div>

          {/* Vibration Margin */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Vibration Margin:</span>
              <strong className={vibrationMargin > 40 ? 'text-emerald-400' : 'text-rose-400'}>
                {vibrationMargin}%
              </strong>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full ${vibrationMargin > 40 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${vibrationMargin}%` }}
              />
            </div>
          </div>

          {/* Fuel Margin */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Fuel Remaining:</span>
              <strong className="text-cyan-400">{fuelMargin}% ({state.currentTelemetry.fuel_level} L)</strong>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-cyan-500" style={{ width: `${fuelMargin}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
