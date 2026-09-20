'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '@/lib/useAppState';
import {
  setRole,
  setEngineId,
  toggleSimulation,
  injectFault,
  clearFault,
} from '@/lib/store';
import { UserRole } from '@/lib/types';
import {
  Activity,
  AlertTriangle,
  Play,
  Pause,
  Shield,
  Clock,
  Radio,
  Zap,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onOpenHackathonModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHackathonModal }) => {
  const state = useAppState();
  const [utcTime, setUtcTime] = useState('');
  const [demoRunning, setDemoRunning] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().split(' ')[4] + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Quick 1-Click "RUN DEMO" scenario
  const handleRunDemo = () => {
    setDemoRunning(true);
    // 1. Ensure simulating
    if (!state.isSimulating) toggleSimulation();
    // 2. Inject subtle thermal anomaly after short delay
    setTimeout(() => {
      injectFault('OVERHEATING', 'Demo Scenario: Coupled thermal increase at high altitude cruise');
      setDemoRunning(false);
    }, 1200);
  };

  const unreadAlerts = state.alerts.filter((a) => !a.acknowledged).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0f1d]/95 backdrop-blur border-b border-slate-800 text-xs font-mono text-slate-300 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
      {/* Brand & GCS Status */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-sans font-black text-sm tracking-wider text-cyan-400 hover:text-cyan-300">
          <div className="w-6 h-6 rounded bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold">
            A
          </div>
          <span>AEGIS-TWIN</span>
        </Link>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30">
          Simulated Data
        </span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <Radio className="w-3 h-3 animate-pulse" />
          <span className="text-[11px] font-semibold">LINK: CAN 2.0B / ACTIVE</span>
        </div>
      </div>

      {/* Target Identifiers */}
      <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-400">
        <div>
          <span className="text-slate-500">ENGINE:</span>{' '}
          <select
            aria-label="Target Engine ID"
            value={state.engineId}
            onChange={(e) => setEngineId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-cyan-300 rounded px-1.5 py-0.5 font-bold focus:outline-none"
          >
            <option value="AEGIS-ENG-001">AEGIS-ENG-001 (Port)</option>
            <option value="AEGIS-ENG-002">AEGIS-ENG-002 (Starboard)</option>
            <option value="AEGIS-ENG-003">AEGIS-ENG-003 (Bench Test)</option>
          </select>
        </div>
        <div>
          <span className="text-slate-500">UAV:</span>{' '}
          <span className="text-slate-200 font-semibold">{state.uavId}</span>
        </div>
        <div>
          <span className="text-slate-500">MISSION:</span>{' '}
          <span className="text-slate-200 font-semibold">{state.missionId}</span>
        </div>
      </div>

      {/* Clock, Alerts & Demo Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{utcTime || '12:00:00 UTC'}</span>
        </div>

        {/* Simulation Play/Pause */}
        <button
          onClick={toggleSimulation}
          className={`px-2 py-1 rounded flex items-center gap-1.5 text-[11px] font-semibold border transition ${
            state.isSimulating
              ? 'bg-slate-800 text-cyan-400 border-cyan-500/40 hover:bg-slate-700'
              : 'bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-900/40'
          }`}
          title="Toggle Real-Time Telemetry Simulation"
        >
          {state.isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span>{state.isSimulating ? 'STREAMING' : 'PAUSED'}</span>
        </button>

        {/* Quick RUN DEMO Button */}
        <button
          onClick={handleRunDemo}
          disabled={demoRunning}
          className="px-2.5 py-1 rounded flex items-center gap-1 text-[11px] font-bold bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow border border-cyan-400/40"
          title="Trigger Automated Demonstration Scenario"
        >
          <Zap className="w-3 h-3" />
          <span>{demoRunning ? 'INJECTING...' : 'RUN DEMO'}</span>
        </button>

        {/* Hackathon Presentation Tour */}
        {onOpenHackathonModal && (
          <button
            onClick={onOpenHackathonModal}
            className="px-2.5 py-1 rounded flex items-center gap-1 text-[11px] font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-900/60"
            title="Launch 6-Step Guided Hackathon Presentation Tour"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span className="hidden sm:inline">HACKATHON TOUR</span>
          </button>
        )}

        {/* Active Fault Badge & Clear */}
        {state.activeFault.type !== 'NONE' && (
          <button
            onClick={clearFault}
            className="px-2 py-1 rounded flex items-center gap-1 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30 animate-pulse"
            title="Active Fault Triggered. Click to Clear."
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>CLEAR FAULT</span>
          </button>
        )}

        {/* Alerts Badge */}
        <Link
          href="/alerts"
          className="relative p-1.5 rounded bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300"
          title="View Alerts Center"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          {unreadAlerts > 0 && (
            <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 bg-rose-600 text-white rounded-full text-[9px] font-black">
              {unreadAlerts}
            </span>
          )}
        </Link>

        {/* Role Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700 rounded px-2 py-0.5">
          <Shield className="w-3 h-3 text-cyan-400" />
          <select
            aria-label="User Role"
            value={state.userRole}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="bg-transparent text-[10px] font-bold text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="OPERATOR">OPERATOR</option>
            <option value="MAINTENANCE_ENGINEER">MAINT ENG</option>
            <option value="ANALYST">ANALYST</option>
          </select>
        </div>
      </div>
    </header>
  );
};
