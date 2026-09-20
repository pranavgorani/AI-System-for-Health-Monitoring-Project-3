'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/useAppState';
import { Binary, Play, Pause, RotateCcw, Plus, Radio, Info } from 'lucide-react';

export default function CanBusPage() {
  const state = useAppState();
  const [messages, setMessages] = useState(state.canMessages);
  const [isStreaming, setIsStreaming] = useState(true);

  // Manual CAN frame injector modal state
  const [customCanId, setCustomCanId] = useState('0x18FEE499');
  const [customSignal, setCustomSignal] = useState('AUX_COOLANT_FLOW');
  const [customValue, setCustomValue] = useState('42.5');
  const [customUnit, setCustomUnit] = useState('L/min');

  const handleInjectFrame = (e: React.FormEvent) => {
    e.preventDefault();
    const newMsg = {
      id: `CAN-INJ-${Date.now()}`,
      canId: customCanId,
      signal: customSignal,
      value: customValue,
      unit: customUnit,
      timestamp: new Date().toISOString(),
      status: 'OK' as const,
    };
    setMessages([newMsg, ...messages]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Binary className="w-5 h-5 text-cyan-400" />
            <span>SOFTWARE CAN BUS (AEROSPACE 2.0B / J1939 SIMULATOR)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulates cyclic 29-bit CAN frame broadcasts from FADEC electronic engine control units. Designed for direct drop-in integration with Linux SocketCAN.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition ${
              isStreaming
                ? 'bg-slate-800 text-cyan-400 border-cyan-500/40'
                : 'bg-amber-950/40 text-amber-300 border-amber-500/40'
            }`}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isStreaming ? 'CAN LINK BROADCASTING' : 'BROADCAST PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* SocketCAN Integration Notice */}
      <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-500/30 text-xs text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <strong>Standardized CAN Layer:</strong> Each frame maps to standardized aerospace parameter group numbers (PGN). On production UAV avionics testbenches, this software interface connects directly to physical dual-redundant 1 Mbps CAN transceivers via Linux <code>vcan0</code> or PEAK-System adapters.
        </div>
      </div>

      {/* Manual Frame Injection Form */}
      <div className="aerospace-panel p-4 space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
          TRANSMIT ARBITRARY CAN 2.0B FRAME
        </h3>

        <form onSubmit={handleInjectFrame} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs font-mono">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">CAN Identifier</label>
            <input
              type="text"
              value={customCanId}
              onChange={(e) => setCustomCanId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Signal Name</label>
            <input
              type="text"
              value={customSignal}
              onChange={(e) => setCustomSignal(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Payload Value</label>
            <input
              type="text"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Engineering Unit</label>
            <input
              type="text"
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Inject Frame</span>
            </button>
          </div>
        </form>
      </div>

      {/* Real-time Broadcast Frame Stream Table */}
      <div className="aerospace-panel p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold uppercase">
            ACTIVE CAN BUS TRAFFIC STREAM ({state.canMessages.length} FRAMES)
          </span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>BUS LOAD: 24.8% (250 KBPS)</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">CAN ID (Hex)</th>
                <th className="py-2.5 px-3">Signal Name</th>
                <th className="py-2.5 px-3">Engineering Value</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Parity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {state.canMessages.map((msg) => (
                <tr key={msg.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-bold text-cyan-300">{msg.canId}</td>
                  <td className="py-2.5 px-3 text-white">{msg.signal}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{msg.value}</td>
                  <td className="py-2.5 px-3 text-slate-400">{msg.unit}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[10px]">
                    {msg.timestamp.split('T')[1]?.slice(0, 12)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        msg.status === 'ERROR'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : msg.status === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {msg.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
