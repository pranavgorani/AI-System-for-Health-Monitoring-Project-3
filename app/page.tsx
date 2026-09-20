'use client';

import React from 'react';
import Link from 'next/link';
import {
  Cpu,
  Activity,
  Brain,
  Hourglass,
  PlaneTakeoff,
  History,
  Wrench,
  Shield,
  ArrowRight,
  Radio,
  Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  const capabilities = [
    {
      title: 'Real-Time Telemetry Stream',
      desc: 'Simulated 10-parameter aero piston engine stream (RPM, CHT 1-4, EGT 1-4, Oil Pressure & Temp, Vibration RMS) over virtual CAN 2.0B / J1939.',
      icon: Activity,
    },
    {
      title: 'Synchronized Digital Twin',
      desc: 'Physics-informed virtual replica of 9 engine subsystems (Combustion, Lubrication, Fuel, Cooling, Exhaust, Crankshaft, Propeller, Electrical, Sensors).',
      icon: Cpu,
    },
    {
      title: 'AI Anomaly Detection & XAI',
      desc: 'Hybrid Isolation Forest and physics residual engine with transparent Explainable AI horizontal factor contribution breakdowns.',
      icon: Brain,
    },
    {
      title: 'RUL Degradation Forecasting',
      desc: 'Non-linear remaining useful life modeling with 90% confidence bands and projected health milestones at +50h, +100h, and +150h.',
      icon: Hourglass,
    },
    {
      title: 'Mission Flight Simulator',
      desc: 'Configurable environmental profiles (ISA Normal, Hot Weather +45°C, High Altitude 18,000 ft, Endurance Loiter) with safety margin tracking.',
      icon: PlaneTakeoff,
    },
    {
      title: 'Black-Box Mission Replay',
      desc: 'Time-scrubber playback engine with variable speeds (0.5x to 10x) for post-flight incident reconstruction and diagnostic review.',
      icon: History,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 aerospace-grid flex flex-col justify-between">
      {/* Navbar */}
      <header className="w-full border-b border-slate-800/80 bg-[#0a0f1d]/90 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-black text-base">
            A
          </div>
          <div>
            <span className="font-mono font-black text-lg text-white tracking-wider">AEGIS-TWIN</span>
            <span className="ml-2 text-[10px] font-mono text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded uppercase">
              DRDO / iDEX Demonstrator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
          >
            Authenticate / Roles
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg border border-cyan-400/40 transition flex items-center gap-1.5"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Engine Health & Digital Twin Platform for MALE UAVs</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto font-sans">
          Real-Time Engine Intelligence for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
            Predictive Maintenance & Mission Reliability
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
          The platform creates a continuously synchronized virtual representation of an aero piston engine using real-time simulated telemetry, physics-informed relationships, AI anomaly detection, RUL forecasting, and explainable diagnostics.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-xl border border-cyan-300/40 transition flex items-center gap-2"
          >
            <span>Launch Executive Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/digital-twin"
            className="px-6 py-3 rounded-xl text-sm font-bold bg-slate-900/90 text-slate-200 hover:bg-slate-800 border border-slate-700 transition flex items-center gap-2"
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Explore Digital Twin</span>
          </Link>
          <Link
            href="/mission-simulator"
            className="px-6 py-3 rounded-xl text-sm font-bold bg-slate-900/90 text-slate-200 hover:bg-slate-800 border border-slate-700 transition flex items-center gap-2"
          >
            <PlaneTakeoff className="w-4 h-4 text-amber-400" />
            <span>Run Mission Simulator</span>
          </Link>
        </div>

        {/* Live Status Chip */}
        <div className="pt-6 flex items-center justify-center gap-6 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>VIRTUAL TELEMETRY: ACTIVE</span>
          </div>
          <div>TARGET: 4-STROKE TURBO AERO PISTON</div>
          <div>MALE UAV CLASS: TAPAS / HERON EQUIVALENT</div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            CORE PLATFORM CAPABILITIES
          </h2>
          <p className="text-2xl font-bold text-white mt-1">
            Ground Control & Propulsion Health Architecture
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="aerospace-panel p-6 space-y-3 hover:border-cyan-500/50 transition">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">{c.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer / Required Research Disclaimer */}
      <footer className="border-t border-slate-800 bg-[#050811] py-8 px-6 text-center text-xs font-mono text-slate-500 space-y-2">
        <div>
          <strong className="text-slate-400">AEGIS-TWIN PROPULSION MONITORING DEMONSTRATOR</strong> | Developed for DRDO / Department of Defence Production / iDEX
        </div>
        <p className="max-w-4xl mx-auto text-[11px] text-slate-600">
          AEGIS-TWIN is a software demonstrator using simulated/synthetic engine data. It is intended for research, development and demonstration purposes and is not a certified flight-control or safety-critical system.
        </p>
      </footer>
    </div>
  );
}
