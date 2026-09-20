'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/useAppState';
import { updateCoefficients, resetToDefaults, setRole } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { Sliders, RotateCcw, Save, CheckCircle2, Shield, Settings, Database } from 'lucide-react';

export default function AdminSettingsPage() {
  const state = useAppState();
  const [bsfc, setBsfc] = useState(state.coefficients.bsfc.toString());
  const [friction, setFriction] = useState(state.coefficients.frictionFactor.toString());
  const [altitude, setAltitude] = useState(state.coefficients.altitudeFt.toString());
  const [ambientTemp, setAmbientTemp] = useState(state.coefficients.ambientTempC.toString());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCoefficients({
      bsfc: parseFloat(bsfc) || 0.285,
      frictionFactor: parseFloat(friction) || 0.08,
      altitudeFt: parseFloat(altitude) || 6500,
      ambientTempC: parseFloat(ambientTemp) || 22,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    resetToDefaults();
    setBsfc('0.285');
    setFriction('0.08');
    setAltitude('6500');
    setAmbientTemp('22');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <span>ADMINISTRATIVE CONFIGURATION & ENGINE CALIBRATION</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tune thermodynamic coefficients, adjust health weighting vectors, configure alert thresholds, and manage access roles.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Defaults</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Simulation coefficients updated and committed to active runtime memory.</span>
        </div>
      )}

      {/* Configuration Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Physical Engine Coefficients */}
        <form onSubmit={handleSave} className="aerospace-panel p-6 space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>THERMODYNAMIC COEFFICIENTS</span>
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">
                Brake Specific Fuel Consumption (BSFC - L/kW-h)
              </label>
              <input
                type="number"
                step="0.005"
                value={bsfc}
                onChange={(e) => setBsfc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Mechanical Friction Factor (Bearing / Piston Drag)
              </label>
              <input
                type="number"
                step="0.01"
                value={friction}
                onChange={(e) => setFriction(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Cruising Altitude (Feet Above MSL)
              </label>
              <input
                type="number"
                step="500"
                value={altitude}
                onChange={(e) => setAltitude(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Ambient Sea-Level Air Temperature (°C)
              </label>
              <input
                type="number"
                step="1"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition"
          >
            <Save className="w-4 h-4" />
            <span>Apply Simulation Parameters</span>
          </button>
        </form>

        {/* Role & Security Administration */}
        <div className="aerospace-panel p-6 space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>OPERATOR ROLE & CLEARANCE SYSTEM</span>
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <span className="text-slate-400 block mb-1">Active Operator Role</span>
              <div className="grid grid-cols-2 gap-2">
                {(['ADMIN', 'OPERATOR', 'MAINTENANCE_ENGINEER', 'ANALYST'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`p-2 rounded text-left border transition ${
                      state.userRole === r
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 text-slate-400 leading-relaxed text-[11px]">
              <strong>ADMIN:</strong> Full control over physical parameters, simulation speeds, fault injection, and data management.<br />
              <strong>OPERATOR:</strong> Real-time flight dashboard, live telemetry, and mission monitoring.<br />
              <strong>MAINTENANCE:</strong> Subsystem health, fault classifications, and advisory queue.<br />
              <strong>ANALYST:</strong> Historical trends, comparative mission charts, and report exports.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
