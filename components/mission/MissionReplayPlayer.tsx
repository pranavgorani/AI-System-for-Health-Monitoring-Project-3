'use client';

import React, { useState, useEffect } from 'react';
import { EngineTelemetry } from '@/lib/types';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Activity,
  Gauge,
  Flame,
  Thermometer,
  RotateCw,
} from 'lucide-react';

// Pre-recorded 100-point historical mission with simulated events
function generateHistoricalReplayDataset(): EngineTelemetry[] {
  const points: EngineTelemetry[] = [];
  const baseTime = new Date(Date.now() - 3600000);

  for (let i = 0; i < 100; i++) {
    const t = new Date(baseTime.getTime() + i * 15000);
    // Profile: 0-20 Takeoff/Climb, 20-50 Cruise, 50-70 Thermal anomaly, 70-85 Recovery, 85-100 Descent/Landing
    let state: EngineTelemetry['flight_state'] = 'CRUISE';
    let rpm = 4650;
    let cht = 122;
    let egt = 745;
    let oilP = 4.2;
    let vib = 3.2;

    if (i < 15) {
      state = 'TAKEOFF';
      rpm = 5600;
      cht = 142;
      egt = 820;
    } else if (i < 30) {
      state = 'CLIMB';
      rpm = 5150;
      cht = 136;
      egt = 790;
    } else if (i >= 50 && i <= 70) {
      // Thermal Overheating anomaly
      state = 'HIGH_LOAD';
      rpm = 5350;
      cht = 152 + (i - 50) * 0.4;
      egt = 865 + (i - 50) * 0.6;
      oilP = 3.1;
      vib = 4.8;
    } else if (i > 85) {
      state = 'DESCENT';
      rpm = 3200;
      cht = 110;
      egt = 680;
    }

    points.push({
      timestamp: t.toISOString(),
      engine_id: 'AEGIS-ENG-001',
      mission_id: 'MSN-HIST-082',
      flight_state: state,
      rpm: Math.round(rpm + Math.sin(i) * 20),
      throttle: state === 'TAKEOFF' ? 100 : state === 'CLIMB' ? 85 : state === 'DESCENT' ? 35 : 65,
      engine_load: 72,
      engine_hours: 142.5 + i * 0.05,
      cht_1: Math.round(cht),
      cht_2: Math.round(cht + 2),
      cht_3: Math.round(cht - 1),
      cht_4: Math.round(cht + 1),
      cht_avg: Math.round(cht),
      egt_1: Math.round(egt),
      egt_2: Math.round(egt - 3),
      egt_3: Math.round(egt + 2),
      egt_4: Math.round(egt - 1),
      egt_avg: Math.round(egt),
      oil_pressure: Math.round(oilP * 10) / 10,
      oil_temperature: Math.round(92 + (cht - 120) * 0.4),
      fuel_flow: Math.round(20.5 + Math.sin(i) * 1.5),
      fuel_level: Math.max(0, 110 - i * 0.4),
      vibration_rms: Math.round(vib * 10) / 10,
      injection_timing: 24.2,
      battery_voltage: 28.2,
      alternator_current: 32,
      altitude: Math.round(6500 + i * 40),
      ambient_temperature: 18,
      ambient_pressure: 1013,
      efficiency: 32.4,
    });
  }
  return points;
}

export const MissionReplayPlayer: React.FC = () => {
  const [dataset] = useState<EngineTelemetry[]>(generateHistoricalReplayDataset);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      const intervalMs = Math.max(100, Math.round(1000 / speed));
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= dataset.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, speed, dataset.length]);

  const current = dataset[currentIndex] || dataset[0];
  const progressPct = ((currentIndex / (dataset.length - 1)) * 100).toFixed(1);

  // Derive health & anomaly score from current point
  const isAnomaly = currentIndex >= 50 && currentIndex <= 70;
  const healthScore = isAnomaly ? 62 : 93;
  const anomalyScore = isAnomaly ? 0.84 : 0.14;

  return (
    <div className="space-y-6">
      {/* Player Header */}
      <div className="aerospace-panel p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Historical Mission Replay Controller
            </div>
            <h3 className="text-base font-bold text-white">
              MISSION: MSN-HIST-082 | TAPAS-UAV-04 (Black Box Log)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
              FRAME: <strong>{currentIndex + 1} / {dataset.length}</strong>
            </span>
            <span className={`px-2 py-1 rounded border font-bold ${
              isAnomaly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              {isAnomaly ? 'ANOMALY DETECTED' : 'NOMINAL FLIGHT'}
            </span>
          </div>
        </div>

        {/* Scrubber Timeline */}
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={dataset.length - 1}
            value={currentIndex}
            onChange={(e) => setCurrentIndex(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>T+00:00 (Takeoff)</span>
            <span className="text-rose-400 font-bold">T+12:30 (Thermal Anomaly)</span>
            <span>T+25:00 (Touchdown)</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY REPLAY'}</span>
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex(0);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Rewind to Start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Presets */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <span className="text-[10px] font-mono text-slate-500 px-2">SPEED:</span>
            {[0.5, 1, 2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition ${
                  speed === s
                    ? 'bg-cyan-500 text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Synchronized Telemetry Gauges at Replay Timestamp */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="aerospace-panel p-3">
          <div className="text-[10px] font-mono text-slate-400">ENGINE RPM</div>
          <div className="text-xl font-mono font-bold text-white mt-1">{current.rpm}</div>
          <div className="text-[10px] text-slate-500 font-mono">STATE: {current.flight_state}</div>
        </div>

        <div className="aerospace-panel p-3">
          <div className="text-[10px] font-mono text-slate-400">EGT AVERAGE</div>
          <div className="text-xl font-mono font-bold text-rose-400 mt-1">{current.egt_avg} °C</div>
          <div className="text-[10px] text-slate-500 font-mono">MAX: 880 °C</div>
        </div>

        <div className="aerospace-panel p-3">
          <div className="text-[10px] font-mono text-slate-400">CHT AVERAGE</div>
          <div className="text-xl font-mono font-bold text-amber-400 mt-1">{current.cht_avg} °C</div>
          <div className="text-[10px] text-slate-500 font-mono">MAX: 155 °C</div>
        </div>

        <div className="aerospace-panel p-3">
          <div className="text-[10px] font-mono text-slate-400">OIL PRESSURE</div>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-1">{current.oil_pressure} bar</div>
          <div className="text-[10px] text-slate-500 font-mono">NOM: 4.2 bar</div>
        </div>

        <div className="aerospace-panel p-3">
          <div className="text-[10px] font-mono text-slate-400">VIBRATION RMS</div>
          <div className="text-xl font-mono font-bold text-purple-400 mt-1">{current.vibration_rms} mm/s</div>
          <div className="text-[10px] text-slate-500 font-mono">LIM: 4.5 mm/s</div>
        </div>

        <div className="aerospace-panel p-3">
          <div className="text-[10px] font-mono text-slate-400">ANOMALY SCORE</div>
          <div className={`text-xl font-mono font-bold mt-1 ${anomalyScore > 0.5 ? 'text-rose-400' : 'text-cyan-400'}`}>
            {anomalyScore}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">HEALTH: {healthScore}%</div>
        </div>
      </div>
    </div>
  );
};
