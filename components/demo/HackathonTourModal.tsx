'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Cpu,
  Brain,
  Activity,
  Wrench,
  PlaneTakeoff,
  FileText,
} from 'lucide-react';
import { setFlightState, injectFault, clearFault, toggleSimulation, getState } from '@/lib/store';

interface TourStep {
  step: number;
  title: string;
  subtitle: string;
  route: string;
  description: string;
  actionLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  executeAction: () => void;
  highlights: string[];
}

interface HackathonTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HackathonTourModal: React.FC<HackathonTourModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const steps: TourStep[] = [
    {
      step: 1,
      title: 'Real-Time Telemetry & Engine GCS Baseline',
      subtitle: 'Synchronized Ground Control Station Stream',
      route: '/dashboard',
      icon: Activity,
      description:
        'Demonstrates continuous telemetry ingestion (RPM, CHT, EGT, Oil Pressure, Vibration) over a simulated J1939/CAN 2.0B bus. All values follow realistic aero piston thermodynamic relationships.',
      actionLabel: 'Set Engine to Cruise (4650 RPM)',
      highlights: [
        'Physics-coupled thermodynamic parameters',
        'Cylinder-by-cylinder CHT and EGT readings',
        'Vibration RMS & hydrodynamic lubrication pressure',
      ],
      executeAction: () => {
        if (!getState().isSimulating) toggleSimulation();
        clearFault();
        setFlightState('CRUISE');
        router.push('/dashboard');
      },
    },
    {
      step: 2,
      title: 'Interactive Digital Twin Subsystem View',
      subtitle: 'Component-Level Virtual Engine Representation',
      route: '/digital-twin',
      icon: Cpu,
      description:
        'Explore the 9 core virtual engine subsystems: Cylinder/Combustion, Lubrication, Fuel Injection, Cooling, Exhaust, Crankshaft, Propeller, Sensors, and Electrical. Subsystem health dynamically reflects thermodynamic state.',
      actionLabel: 'Inspect Subsystem Health Matrix',
      highlights: [
        'Traffic-light health indexing (0-100%)',
        'Subsystem drill-down with telemetry linkages',
        'Synchronized mechanical & thermal state machine',
      ],
      executeAction: () => {
        router.push('/digital-twin');
      },
    },
    {
      step: 3,
      title: 'AI Anomaly Detection Trigger',
      subtitle: 'Hybrid Isolation Forest & Physics Residuals',
      route: '/diagnostics',
      icon: Brain,
      description:
        'Inject a subtle high-altitude overheating anomaly. Watch the AI Anomaly Detector compute z-score residuals and cross-correlations, pushing the anomaly score from 0.12 to >0.85.',
      actionLabel: 'Inject Overheating & Run AI Detection',
      highlights: [
        'Multi-variate Isolation Forest scoring',
        'Residual error against nominal flight physics',
        'Instantaneous confidence & data quality metrics',
      ],
      executeAction: () => {
        injectFault('OVERHEATING', 'Hackathon Demo: Rapid thermal buildup during climb phase');
        router.push('/diagnostics');
      },
    },
    {
      step: 4,
      title: 'Explainable AI & Fault Classification',
      subtitle: 'Transparent Reasoning & Root Cause Attribution',
      route: '/fault-analysis',
      icon: AlertTriangle,
      description:
        'The Explainable AI (XAI) engine decomposes the anomaly into horizontal factor contributions (EGT: +31%, CHT: +24%, Oil Temp: +18%), while the fault classifier isolates "Engine Thermal Overheating Trend".',
      actionLabel: 'View XAI Factor Contributions',
      highlights: [
        'Quantitative parameter contribution breakdown',
        '10 aero piston fault classification models',
        'Confidence score and physical evidence mapping',
      ],
      executeAction: () => {
        router.push('/fault-analysis');
      },
    },
    {
      step: 5,
      title: 'RUL Estimation & Mission Reliability',
      subtitle: 'Prognostic Degradation & Wear Forecasting',
      route: '/rul',
      icon: PlaneTakeoff,
      description:
        'Examine how active thermal degradation impacts Remaining Useful Life (RUL), updating the projected wear trajectory, confidence intervals (120-168 hrs), and forward milestones (+50h, +100h, +150h).',
      actionLabel: 'Evaluate RUL Trajectory',
      highlights: [
        'Dynamic degradation rate adjustment (points/hour)',
        '90% statistical confidence boundaries',
        'Predictive maintenance planning horizons',
      ],
      executeAction: () => {
        router.push('/rul');
      },
    },
    {
      step: 6,
      title: 'Automated Maintenance Advisory & Mission Report',
      subtitle: 'Actionable Engineering Directives & Executive Export',
      route: '/reports',
      icon: FileText,
      description:
        'Synthesizes all real-time telemetry, detected anomalies, fault classifications, and RUL forecasts into a prioritized maintenance queue and an exportable Mission Health Report.',
      actionLabel: 'Generate Printable Mission Health Report',
      highlights: [
        'Prioritized maintenance queue (Critical/High/Medium/Low)',
        'Full mission telemetry envelopes and timeline',
        'Official DRDO/iDEX demonstrator disclaimer',
      ],
      executeAction: () => {
        router.push('/reports');
      },
    },
  ];

  const current = steps[currentStepIndex];
  const Icon = current.icon;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      steps[nextIdx].executeAction();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      steps[prevIdx].executeAction();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0d1424] border border-cyan-500/50 rounded-xl shadow-2xl p-6 text-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                DRDO / iDEX Hackathon Presentation Tour
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Step {current.step} of {steps.length}: {current.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => {
                setCurrentStepIndex(idx);
                s.executeAction();
              }}
              className={`flex-1 h-2 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                  : idx < currentStepIndex
                  ? 'bg-emerald-500'
                  : 'bg-slate-800'
              }`}
              title={`Jump to Step ${s.step}: ${s.title}`}
            />
          ))}
        </div>

        {/* Body Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
            <Icon className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold uppercase">{current.subtitle}</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{current.description}</p>

          {/* Highlights */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 space-y-2">
            <div className="text-[11px] font-mono text-slate-400 font-bold uppercase">
              Demonstration Highlights:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {current.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-6">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => {
              current.executeAction();
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg border border-cyan-400/40 transition"
          >
            <span>{current.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
