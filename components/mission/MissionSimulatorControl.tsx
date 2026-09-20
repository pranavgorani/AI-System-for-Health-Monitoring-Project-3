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
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Fuel,
  Thermometer,
  Activity,
  Sliders,
  ShieldAlert,
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
    name: 'Standard ISA Baseline Day',
    altitudeFt: 6500,
    ambientTempC: 15,
    description: 'Nominal operational envelope at standard atmospheric lapse rate conditions.',
    icon: CloudSun,
  },
  {
    id: 'HOT_WEATHER',
    name: 'Desert / Hot Weather (+45°C)',
    altitudeFt: 3500,
    ambientTempC: 45,
    description: 'Elevated ambient temperature severely compresses radiator convective cooling margins.',
    icon: Flame,
  },
  {
    id: 'HIGH_ALTITUDE',
    name: 'High Altitude Recon (18,000 ft)',
    altitudeFt: 18000,
    ambientTempC: -21,
    description: 'Thin barometric density (506 hPa) mandates maximum continuous turbo boost.',
    icon: Mountain,
  },
  {
    id: 'ENDURANCE',
    name: 'MALE Endurance Loiter (12 Hours)',
    altitudeFt: 12000,
    ambientTempC: -8,
    description: 'Long-duration surveillance loiter with progressive cumulative thermal wear accumulation.',
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
  const t = state.currentTelemetry;
  const risk = state.missionAssessment;

  // Configurable Mission Parameters
  const [plannedDurationHours, setPlannedDurationHours] = useState(4.5);
  const [fuelAvailableLiters, setFuelAvailableLiters] = useState(110);
  const [rapidThrottleCycles, setRapidThrottleCycles] = useState(false);

  // Calculate Operational Margins
  const fuelBurnRate = t.fuel_flow > 0 ? t.fuel_flow : 19.5;
  const totalRequiredFuel = plannedDurationHours * fuelBurnRate;
  const fuelMarginPct = Math.max(0, Math.min(100, Math.round(((fuelAvailableLiters - totalRequiredFuel) / fuelAvailableLiters) * 100)));
  const chtMarginPct = Math.max(0, Math.min(100, Math.round(100 - (t.cht_avg / 150) * 100)));
  const egtMarginPct = Math.max(0, Math.min(100, Math.round(100 - (t.egt_avg / 860) * 100)));
  const oilMarginPct = Math.max(0, Math.min(100, Math.round((t.oil_pressure / 5.0) * 100)));
  const vibrationMarginPct = Math.max(0, Math.min(100, Math.round(100 - (t.vibration_rms / 6.0) * 100)));

  // Dynamic Assessment Evaluation
  let assessmentStatus = risk.assessment;
  let recommendationText = risk.recommendation;
  if (fuelMarginPct < 10) {
    assessmentStatus = 'MAINTENANCE_REQUIRED';
    recommendationText = 'Fuel reserve below mandatory 10% IFR aerospace reserve. Increase tank fill or shorten sortie duration.';
  }

  const assessmentBadge =
    assessmentStatus === 'GO'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
      : assessmentStatus === 'CONDITIONAL_GO'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
      : 'bg-rose-500/20 text-rose-300 border-rose-500/50';

  return (
    <div className="space-y-6">
      {/* Required Decision Support Disclaimer */}
      <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs font-mono text-slate-300 flex items-start gap-2.5">
        <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white uppercase font-bold">Decision-Support Notice:</strong>{' '}
          {risk.disclaimer} Current outputs are derived from grey-box propulsion models under simulated flight envelopes.
        </div>
      </div>

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
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{sc.name}</h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    {sc.altitudeFt.toLocaleString()} ft | {sc.ambientTempC}°C
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{sc.description}</p>
            </div>
          );
        })}
      </div>

      {/* Configurable Mission Parameters Grid */}
      <div className="aerospace-panel p-4 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold uppercase flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>MISSION CONFIGURATION & ENVIRONMENTAL CONTROLS</span>
          </span>
          <span className="text-slate-500">Real-time grey-box recalculation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Sortie Duration:</span>
              <strong className="text-white">{plannedDurationHours} hrs</strong>
            </div>
            <input
              type="range"
              min="1.0"
              max="14.0"
              step="0.5"
              value={plannedDurationHours}
              onChange={(e) => setPlannedDurationHours(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Fuel Available:</span>
              <strong className="text-cyan-300">{fuelAvailableLiters} Liters</strong>
            </div>
            <input
              type="range"
              min="30"
              max="130"
              step="5"
              value={fuelAvailableLiters}
              onChange={(e) => setFuelAvailableLiters(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer p-2 rounded bg-slate-900 border border-slate-800">
              <input
                type="checkbox"
                checked={rapidThrottleCycles}
                onChange={(e) => setRapidThrottleCycles(e.target.checked)}
                className="accent-cyan-400 rounded"
              />
              <span className="text-xs">Simulate Rapid Throttle Transients</span>
            </label>
          </div>
        </div>
      </div>

      {/* Mission Decision Support Assessment Card */}
      <div className="aerospace-panel p-6 space-y-5 border-cyan-500/40 bg-[#0a1122]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              MISSION READINESS ASSESSMENT
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-3 py-1 rounded text-sm font-mono font-black border uppercase tracking-wider ${assessmentBadge}`}>
                ASSESSMENT: {assessmentStatus.replace(/_/g, ' ')}
              </span>
              <span className="text-xs font-mono text-slate-300">
                INTERRUPTION RISK: <strong className={assessmentStatus === 'GO' ? 'text-emerald-400' : 'text-amber-400'}>{risk.interruptionRiskCategory}</strong>
              </span>
            </div>
          </div>

          <div className="text-right text-xs font-mono">
            <div className="text-slate-400">Sortie Fuel Required:</div>
            <div className="text-base font-bold text-cyan-300">{Math.round(totalRequiredFuel)} L / {fuelAvailableLiters} L Available</div>
          </div>
        </div>

        {/* 5 Operating Margins KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
              <Fuel className="w-3 h-3 text-cyan-400" />
              <span>Fuel Margin</span>
            </div>
            <div className={`text-xl font-bold ${fuelMarginPct > 20 ? 'text-emerald-400' : fuelMarginPct > 10 ? 'text-amber-400' : 'text-rose-400'}`}>
              {fuelMarginPct}%
            </div>
            <div className="text-[10px] text-slate-500">Min 10% Reserve</div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-amber-400" />
              <span>Thermal Margin (CHT)</span>
            </div>
            <div className={`text-xl font-bold ${chtMarginPct > 20 ? 'text-emerald-400' : chtMarginPct > 10 ? 'text-amber-400' : 'text-rose-400'}`}>
              {chtMarginPct}%
            </div>
            <div className="text-[10px] text-slate-500">Limit &lt; 150 °C</div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-rose-400" />
              <span>EGT Margin</span>
            </div>
            <div className={`text-xl font-bold ${egtMarginPct > 15 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {egtMarginPct}%
            </div>
            <div className="text-[10px] text-slate-500">Limit &lt; 860 °C</div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
              <Gauge className="w-3 h-3 text-blue-400" />
              <span>Oil Press Margin</span>
            </div>
            <div className={`text-xl font-bold ${oilMarginPct > 40 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {oilMarginPct}%
            </div>
            <div className="text-[10px] text-slate-500">Limit &gt; 2.2 bar</div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
              <Activity className="w-3 h-3 text-purple-400" />
              <span>Vibration Margin</span>
            </div>
            <div className={`text-xl font-bold ${vibrationMarginPct > 30 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {vibrationMarginPct}%
            </div>
            <div className="text-[10px] text-slate-500">Limit &lt; 6.0 mm/s</div>
          </div>
        </div>

        {/* Primary Risk & Operating Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] text-amber-400 uppercase font-bold block">
              PRIMARY MISSION RISK IDENTIFIED:
            </span>
            <p className="text-slate-200 leading-relaxed">{risk.primaryRisk}</p>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-lg border border-cyan-500/30 space-y-1">
            <span className="text-[10px] text-cyan-400 uppercase font-bold block">
              RECOMMENDED OPERATING ADVISORY:
            </span>
            <p className="text-slate-200 leading-relaxed">{recommendationText}</p>
            {risk.operatingRestriction && (
              <div className="text-amber-300 text-[11px] pt-1">
                Restriction: {risk.operatingRestriction}
              </div>
            )}
          </div>
        </div>

        {/* Flight Phase Risk Breakdown Table */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-bold block">
            PROPULSION FAULT RISK BY FLIGHT PHASE
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs font-mono">
            {risk.faultRiskByFlightPhase.map((pr) => (
              <div key={pr.phase} className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white">{pr.phase}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                    pr.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    pr.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {pr.riskLevel}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">{pr.notes}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
