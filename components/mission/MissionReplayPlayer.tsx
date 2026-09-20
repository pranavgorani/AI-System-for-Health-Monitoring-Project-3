'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { EngineTelemetry } from '@/lib/types';
import { processTelemetryFrame } from '@/lib/store';
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
  Hourglass,
  Brain,
  ShieldAlert,
  AlertTriangle,
  Download,
  SkipForward,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

// Pre-recorded 120-point realistic flight sortie dataset featuring the primary gradual injector degradation scenario
function generateHistoricalReplayDataset(): EngineTelemetry[] {
  const points: EngineTelemetry[] = [];
  const baseTime = new Date(Date.now() - 7200000); // 2 hours ago

  for (let i = 0; i < 120; i++) {
    const t = new Date(baseTime.getTime() + i * 15000); // 15 sec intervals
    let state: EngineTelemetry['flight_state'] = 'CRUISE';
    let rpm = 4650;
    let throttle = 65;
    let load = 68;
    let alt = 6500;
    let ambTemp = 18;
    let ambPress = 810;
    let baseEgt = 745;
    let baseCht = 122;
    let oilP = 4.2;
    let oilT = 92;
    let fuelFlow = 19.5;
    let vib = 2.8;

    if (i < 15) {
      state = 'TAKEOFF';
      rpm = 5650;
      throttle = 100;
      load = 96;
      alt = 1000 + i * 150;
      baseEgt = 820;
      baseCht = 138;
      fuelFlow = 30.5;
      vib = 3.6;
    } else if (i < 35) {
      state = 'CLIMB';
      rpm = 5150;
      throttle = 85;
      load = 82;
      alt = 3250 + (i - 15) * 160;
      baseEgt = 790;
      baseCht = 132;
      fuelFlow = 25.8;
      vib = 3.2;
    } else if (i >= 50 && i <= 95) {
      // PRIMARY DEMONSTRATION SCENARIO: Gradual Cylinder 3 Injector Degradation
      state = 'CRUISE';
      const ramp = Math.min(1.0, (i - 50) / 25); // progressive ramp over 25 points
      baseEgt = 745;
      baseCht = 122;
      fuelFlow = Math.round((19.5 * (1 + 0.08 * ramp)) * 10) / 10;
      vib = Math.round((2.8 * (1 + 0.14 * ramp)) * 10) / 10;
    } else if (i > 105) {
      state = 'DESCENT';
      rpm = 3200;
      throttle = 35;
      load = 38;
      alt = Math.max(1200, 6500 - (i - 105) * 350);
      baseEgt = 660;
      baseCht = 108;
      fuelFlow = 12.0;
      vib = 2.4;
    }

    // Individual cylinder variations
    const isDegrading = i >= 50 && i <= 95;
    const ramp = isDegrading ? Math.min(1.0, (i - 50) / 25) : 0;
    const cyl3EgtOffset = Math.round(46 * ramp);
    const cyl3ChtOffset = Math.round(12 * ramp);

    points.push({
      timestamp: t.toISOString(),
      engine_id: 'AEGIS-ENG-001',
      mission_id: 'MSN-HIST-082',
      flight_state: state,
      rpm: Math.round(rpm + Math.sin(i * 0.5) * 15),
      throttle,
      engine_load: load,
      engine_hours: 142.5 + Math.round((i * 0.02) * 100) / 100,
      manifold_pressure: state === 'TAKEOFF' ? 1350 : state === 'CLIMB' ? 1200 : 1020,
      load_estimate: Math.round(load * 0.95),
      cht_1: Math.round(baseCht + 1.2),
      cht_2: Math.round(baseCht - 0.8),
      cht_3: Math.round(baseCht + 0.5 + cyl3ChtOffset),
      cht_4: Math.round(baseCht - 0.7),
      cht_avg: Math.round(baseCht + cyl3ChtOffset / 4),
      egt_1: Math.round(baseEgt + 2 + Math.sin(i * 0.3) * 3),
      egt_2: Math.round(baseEgt - 2 + Math.cos(i * 0.3) * 3),
      egt_3: Math.round(baseEgt + 1 + cyl3EgtOffset),
      egt_4: Math.round(baseEgt - 1 + Math.cos(i * 0.4) * 2),
      egt_avg: Math.round(baseEgt + cyl3EgtOffset / 4),
      oil_pressure: Math.round(oilP * 100) / 100,
      oil_temperature: Math.round(oilT * 10) / 10,
      fuel_flow: fuelFlow,
      fuel_level: Math.max(0, Math.round((110 - i * 0.35) * 10) / 10),
      vibration_rms: vib,
      vibration_peak: Math.round((vib * 1.45) * 100) / 100,
      injection_timing: 24.2,
      battery_voltage: 28.2,
      alternator_current: 32,
      altitude: alt,
      ambient_temperature: ambTemp,
      ambient_pressure: ambPress,
      efficiency: isDegrading ? Math.max(18, 34.0 - 7 * ramp) : 34.0,
      can_frame_id: '0x18FEE400',
      signal_quality: 98,
      missing_data_flag: false,
      validation_status: 'VALID',
      source_type: 'SYNTHETIC_REPLAY',
      dataset_version: 'v2.4-aero-piston',
      model_version: 'v1.2-greybox-hybrid',
    });
  }
  return points;
}

export const MissionReplayPlayer: React.FC = () => {
  const [dataset] = useState<EngineTelemetry[]>(generateHistoricalReplayDataset);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Playback timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      const intervalMs = Math.max(80, Math.round(1000 / speed));
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

  // EXECUTE EXACT SAME PHM INFERENCE PIPELINE AS LIVE STREAMING
  const pipelineOutput = useMemo(() => {
    const isDegrading = currentIndex >= 50 && currentIndex <= 95;
    const activeInjection = isDegrading
      ? {
          type: 'GRADUAL_INJECTOR_DEGRADATION' as const,
          subsystem: 'Fuel Injection & Combustion',
          severity: Math.min(1.0, (currentIndex - 50) / 25),
          startedAt: current.timestamp,
          notes: 'Replayed sortie degradation: Gradual Cylinder 3 Injector wear',
        }
      : { type: 'NONE' as const, subsystem: 'none', severity: 0, startedAt: '', notes: '' };

    return processTelemetryFrame(current, activeInjection);
  }, [current, currentIndex]);

  const {
    sensorReport,
    nextHealth,
    nextAnomalies,
    nextFaults,
    nextRul,
    nextMissionRisk,
  } = pipelineOutput;

  const handleJumpToAnomaly = () => {
    setCurrentIndex(52); // Exactly where injector degradation begins
  };

  const handleExportReplayLog = () => {
    const jsonStr = JSON.stringify(
      {
        mission_id: current.mission_id,
        frame_index: currentIndex,
        telemetry: current,
        health: nextHealth,
        anomalies: nextAnomalies,
        faults: nextFaults,
        rul: nextRul,
        missionRisk: nextMissionRisk,
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `replay_frame_${currentIndex}_${current.mission_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Replay Controls */}
      <div className="aerospace-panel p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              SORTIE BLACK-BOX POST-FLIGHT REPLAY
            </div>
            <h3 className="text-base font-bold text-white">
              MISSION: {current.mission_id} | TAPAS-UAV-04 (120 Synchronized Frames)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleJumpToAnomaly}
              className="px-3 py-1.5 rounded text-xs font-mono font-bold bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Jump to Anomaly (Frame 52)</span>
            </button>
            <button
              onClick={handleExportReplayLog}
              className="px-3 py-1.5 rounded text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Snapshot</span>
            </button>
          </div>
        </div>

        {/* Timeline Scrubber Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>
              Frame: <strong className="text-white">{currentIndex + 1}</strong> / {dataset.length} ({progressPct}%)
            </span>
            <span>{current.timestamp.slice(11, 19)} UTC | State: <strong className="text-cyan-400">{current.flight_state}</strong></span>
          </div>

          <input
            type="range"
            min="0"
            max={dataset.length - 1}
            value={currentIndex}
            onChange={(e) => setCurrentIndex(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Takeoff (0-15)</span>
            <span>Climb (15-35)</span>
            <span className="text-rose-400 font-bold">Injector Degradation (50-95)</span>
            <span>Descent (105-120)</span>
          </div>
        </div>

        {/* Playback Button Group */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY REPLAY'}</span>
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex(0);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Rewind to start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Selectors */}
          <div className="flex items-center gap-1 text-xs font-mono">
            <span className="text-slate-400 mr-1 text-[11px]">SPEED:</span>
            {[0.5, 1, 2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded border text-[11px] font-bold ${
                  speed === s
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shared Pipeline Diagnostics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="aerospace-panel p-3 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Engine Health</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">{nextHealth.overall}%</div>
          <span className="text-[10px] font-mono text-slate-500">Status: {nextHealth.status}</span>
        </div>

        <div className="aerospace-panel p-3 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Sensor Confidence</span>
          <div className="text-2xl font-bold font-mono text-cyan-300">{sensorReport.overallSensorConfidence}%</div>
          <span className="text-[10px] font-mono text-slate-500">Quality: {sensorReport.anomalyClassification}</span>
        </div>

        <div className="aerospace-panel p-3 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Anomaly Score</span>
          <div className={`text-2xl font-bold font-mono ${nextAnomalies.score > 0.4 ? 'text-rose-400' : 'text-slate-200'}`}>
            {nextAnomalies.score}
          </div>
          <span className="text-[10px] font-mono text-slate-500">{nextAnomalies.classification}</span>
        </div>

        <div className="aerospace-panel p-3 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Estimated RUL</span>
          <div className="text-2xl font-bold font-mono text-amber-300">{nextRul.estimatedHours} hrs</div>
          <span className="text-[10px] font-mono text-slate-500">
            [{nextRul.confidenceInterval[0]} – {nextRul.confidenceInterval[1]}h]
          </span>
        </div>

        <div className="aerospace-panel p-3 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Mission Suitability</span>
          <div className={`text-sm font-bold font-mono mt-1 ${
            nextMissionRisk.assessment === 'GO' ? 'text-emerald-400' :
            nextMissionRisk.assessment === 'CONDITIONAL_GO' ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {nextMissionRisk.assessment.replace(/_/g, ' ')}
          </div>
          <span className="text-[10px] font-mono text-slate-500">Risk: {nextMissionRisk.interruptionRiskCategory}</span>
        </div>

        <div className="aerospace-panel p-3 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Cyl 3 EGT Delta</span>
          <div className="text-2xl font-bold font-mono text-white">
            {current.egt_3} °C
          </div>
          <span className="text-[10px] font-mono text-slate-500">Avg: {current.egt_avg}°C</span>
        </div>
      </div>

      {/* Diagnosed Faults & Evidence in Current Replay Frame */}
      {nextFaults.length > 0 && (
        <div className="aerospace-panel p-4 border-rose-500/50 bg-rose-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-mono font-bold uppercase">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>DIAGNOSTIC PIPELINE OUTPUT (REPLAY FRAME {currentIndex + 1})</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500 text-white font-black">
              {nextFaults[0].probability}% CONFIDENCE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Diagnosed Fault:</span>
              <strong className="text-white text-sm">{nextFaults[0].faultName}</strong>
              <p className="text-slate-300 text-xs mt-1">{nextFaults[0].explanation}</p>
            </div>
            <div>
              <span className="text-[10px] text-cyan-400 block uppercase font-bold">Recommended Directive:</span>
              <p className="text-slate-200 text-xs mt-1">{nextFaults[0].recommendedInspection}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
