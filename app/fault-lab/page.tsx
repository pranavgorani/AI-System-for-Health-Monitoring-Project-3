'use client';

import React from 'react';
import { FaultInjectionLab } from '@/components/faults/FaultInjectionLab';
import { Flame, Info } from 'lucide-react';

export default function FaultLabPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800">
        <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-500" />
          <span>AERO PISTON ENGINE FAULT INJECTION TEST LAB</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Interactive evaluation workbench. Trigger thermodynamic, mechanical, lubrication, and sensor failure profiles to test real-time AI anomaly detection, Digital Twin response, and prognostic alerts.
        </p>
      </div>

      <FaultInjectionLab />
    </div>
  );
}
