'use client';

import React from 'react';
import { useAppState } from '@/lib/useAppState';
import { MissionSimulatorControl } from '@/components/mission/MissionSimulatorControl';
import { PlaneTakeoff, Radio, Clock, ShieldCheck } from 'lucide-react';

export default function MissionSimulatorPage() {
  const state = useAppState();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <PlaneTakeoff className="w-5 h-5 text-amber-400" />
            <span>MALE UAV FLIGHT MISSION SIMULATOR</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate operational mission profiles (Takeoff, Climb, Recon Loiter, High Altitude, Hot Weather) and monitor engine physics under variable environmental workloads.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
            UAV ID: <strong className="text-cyan-400">{state.uavId}</strong>
          </span>
          <span className="px-3 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
            MISSION: <strong className="text-emerald-400">{state.missionId}</strong>
          </span>
        </div>
      </div>

      {/* Main Mission Simulator Controls */}
      <MissionSimulatorControl />
    </div>
  );
}
