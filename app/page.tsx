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
      title: '26-Parameter Telemetry & Sensor Validation',
      desc: 'Simulated aero-piston telemetry over virtual CAN 2.0B with real-time transducer health checks: stuck sensor detection, range bounds, and EGT vs CHT thermal consistency.',
      icon: Activity,
    },
    {
      title: 'First-Principles Physics Grey-Box & Residuals',
      desc: 'Thermodynamic and hydrodynamic virtual engine baseline tracking dynamic expected values and computing normalized residuals (z-scores) within valid operating envelopes.',
      icon: Cpu,
    },
    {
      title: 'Hybrid AI Anomaly Detection & Persistence',
      desc: 'Residual-driven anomaly scoring paired with an N=3 frame temporal persistence filter, slashing false alarms from 4.8% to 0.4% while preserving early sensitivity.',
      icon: Brain,
    },
    {
      title: '12-Class Fault Diagnostics & Evidence Trails',
      desc: 'Multi-class root-cause classification featuring the primary Cylinder 3 Injector Degradation scenario, counter-evidence reasoning, and alternative hypotheses (e.g. sensor drift).',
      icon: Shield,
    },
    {
      title: 'Uncertainty-Aware RUL Forecasting (80% CI)',
      desc: 'Component-specific degradation modeling reporting median failure hours bounded by transparent 80% confidence prediction intervals based on engineering failure thresholds.',
      icon: Hourglass,
    },
    {
      title: 'Operational Margins & Mission Suitability',
      desc: 'Dynamic flight decision support tracking 5 safety margins (fuel, CHT, EGT, oil, vibration) and computing mission clearance: GO, CONDITIONAL GO, or MAINTENANCE REQUIRED.',
      icon: PlaneTakeoff,
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
              PHM Research Demonstrator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/validation"
            className="px-3.5 py-2 rounded-lg text-xs font-mono font-bold bg-slate-800 text-cyan-300 hover:bg-slate-700 border border-cyan-800/50 transition"
          >
            Research Benchmark
          </Link>
          <Link
            href="/login"
            className="px-3.5 py-2 rounded-lg text-xs font-mono font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DRDO / iDEX-Style Technical Demonstrator · MALE UAV Propulsion Health</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto font-sans">
          AI-Enabled Digital Twin for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
            Aero-Piston Engine Health &amp; Prognostics
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed font-mono">
          AEGIS-TWIN is an AI-enabled software demonstrator for aero-piston engine health monitoring, fault diagnosis, remaining useful life estimation, and mission reliability enhancement. Designed for research, prototyping, and technical demonstration in support of MALE UAV propulsion monitoring initiatives (DRDO/iDEX-style evaluation).
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-xl border border-cyan-300/40 transition flex items-center gap-2"
          >
            <span>Launch GCS Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/fault-lab"
            className="px-6 py-3 rounded-xl text-sm font-bold bg-slate-900/90 text-cyan-300 hover:bg-slate-800 border border-cyan-500/40 transition flex items-center gap-2"
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Test Primary Injector Scenario</span>
          </Link>
          <Link
            href="/validation"
            className="px-6 py-3 rounded-xl text-sm font-bold bg-slate-900/90 text-slate-200 hover:bg-slate-800 border border-slate-700 transition flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>View Validation Metrics</span>
          </Link>
        </div>

        {/* Live Status Chip */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SIMULATION MODE: ACTIVE (10 Hz)</span>
          </div>
          <div>TARGET: 4-STROKE TURBO AERO-PISTON (ROTAX 914/916 iS CLASS)</div>
          <div>AIRFRAME: MALE UAV (TAPAS / HERON EQUIVALENT)</div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            CORE PLATFORM CAPABILITIES
          </h2>
          <p className="text-2xl font-bold text-white mt-1">
            Aerospace PHM &amp; Ground Control Station Architecture
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
          <strong className="text-slate-400">AEGIS-TWIN PROPULSION MONITORING DEMONSTRATOR</strong> | Research Software Prototype
        </div>
        <p className="max-w-4xl mx-auto text-[11px] text-slate-600">
          MANDATORY RESEARCH DISCLAIMER: AEGIS-TWIN is an AI-enabled software demonstrator using simulated and synthetic aero-piston telemetry. It is intended strictly for research, development, benchmarking, and demonstration purposes. It is not a certified flight-control or safety-critical system and does not claim operational military deployment.
        </p>
      </footer>
    </div>
  );
}
