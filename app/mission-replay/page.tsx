'use client';

import React from 'react';
import { MissionReplayPlayer } from '@/components/mission/MissionReplayPlayer';
import { History } from 'lucide-react';

export default function MissionReplayPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800">
        <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-400" />
          <span>HISTORICAL MISSION BLACK-BOX REPLAY</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Post-flight diagnostic reconstruction. Replay recorded telemetry frames with variable scrub speeds (0.5x to 10x) and synchronize virtual Digital Twin state.
        </p>
      </div>

      <MissionReplayPlayer />
    </div>
  );
}
