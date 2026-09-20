'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/useAppState';
import { acknowledgeAlert, resolveAlert } from '@/lib/store';
import { AlertSeverity } from '@/lib/types';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Check,
  Search,
  Filter,
} from 'lucide-react';

export default function AlertsCenterPage() {
  const state = useAppState();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const alerts = state.alerts.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.description.toLowerCase().includes(q) ||
        a.subsystem.toLowerCase().includes(q) ||
        a.evidence.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityBadge = (s: AlertSeverity) => {
    switch (s) {
      case 'CRITICAL':
        return 'bg-rose-500 text-white font-black animate-pulse';
      case 'WARNING':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold';
      default:
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <span>PROPULSION ALERTS & ANOMALY INCIDENT TRIAGE</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time threshold exceedances, sensor loss alerts, and automated AI diagnostic incident logs.
          </p>
        </div>

        {/* Search & Severity Filter */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search alert keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
            {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterSeverity(s)}
                className={`px-2 py-1 rounded text-[10px] font-mono transition ${
                  filterSeverity === s
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="aerospace-panel p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">NO ACTIVE ALERTS</h3>
            <p className="text-xs text-slate-400">All propulsion thresholds and sensors operating within nominal limits.</p>
          </div>
        ) : (
          alerts.map((a) => (
            <div
              key={a.id}
              className={`aerospace-panel p-4 space-y-3 transition border-l-4 ${
                a.severity === 'CRITICAL'
                  ? 'border-l-rose-500 bg-rose-950/10'
                  : a.severity === 'WARNING'
                  ? 'border-l-amber-500'
                  : 'border-l-blue-500'
              } ${a.resolved ? 'opacity-50' : ''}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-slate-800 border border-slate-700">
                    {a.severity === 'CRITICAL' ? (
                      <AlertOctagon className="w-4 h-4 text-rose-400" />
                    ) : a.severity === 'WARNING' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${getSeverityBadge(a.severity)}`}>
                        {a.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {a.subsystem} | ID: {a.id}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(a.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{a.description}</h4>
                  </div>
                </div>

                {/* Acknowledge / Resolve Actions */}
                <div className="flex items-center gap-2">
                  {!a.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(a.id)}
                      className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                    >
                      Acknowledge
                    </button>
                  )}
                  {a.acknowledged && !a.resolved && (
                    <button
                      onClick={() => resolveAlert(a.id)}
                      className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/40 transition flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Resolve</span>
                    </button>
                  )}
                  {a.resolved && (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/30 border border-emerald-500/20">
                      RESOLVED
                    </span>
                  )}
                </div>
              </div>

              {/* Evidence & Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Evidence:</span>
                  <span className="text-slate-300">{a.evidence}</span>
                </div>
                <div className="bg-cyan-950/20 p-2.5 rounded border border-cyan-500/20">
                  <span className="text-cyan-400 block text-[10px] uppercase font-bold">Recommended Action:</span>
                  <span className="text-slate-200">{a.recommendedAction}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
