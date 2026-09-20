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
      title: 'System Overview & Research Demonstrator Readiness',
      subtitle: 'Executive Ground Control Station Baseline',
      route: '/dashboard',
      icon: Activity,
      description:
        'Demonstrates an offline-capable, standalone aero-piston digital twin system for MALE UAVs. Ingests 26 telemetry channels at 10 Hz with strict local execution and explicit research positioning.',
      actionLabel: 'Set Engine to Nominal Cruise (4650 RPM)',
      highlights: [
        'Air-gapped operation with zero external cloud dependencies',
        '26-parameter telemetry suite covering all engine subsystems',
        'Real-time mission suitability (GO) and composite health (98%)',
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
      title: '26-Parameter Telemetry Suite & CAN Decoding',
      subtitle: 'Avionics Bus Ingestion & Unit Consistency',
      route: '/telemetry',
      icon: Activity,
      description:
        'Examine the comprehensive 26-channel aerospace sensor suite including individual cylinder EGT 1-4, CHT 1-4, manifold pressure, and fuel flow packed into dual-redundant CAN 2.0B / J1939 frames.',
      actionLabel: 'Inspect Telemetry Channels',
      highlights: [
        'Cylinder-by-cylinder thermal balance (EGT 1-4, CHT 1-4)',
        'Aerospace CAN frame mapping (PGN 0x18FEE400, 0x18FE0200)',
        'Clean engineering unit mappings (°C, bar, RPM, mm/s, L/h)',
      ],
      executeAction: () => {
        router.push('/telemetry');
      },
    },
    {
      step: 3,
      title: 'Transducer Integrity & Sensor Validation',
      subtitle: 'Pre-Inference Signal Quality Assurance',
      route: '/telemetry',
      icon: Activity,
      description:
        'Before data reaches AI or physics models, the Sensor-Health Layer validates range bounds, flags frozen/stuck transducers (>15 ticks), checks rates of change, and enforces EGT vs CHT thermal consistency.',
      actionLabel: 'View Sensor Health Quality Index',
      highlights: [
        'Transducer Health Status: 100% Valid (26/26 channels)',
        'Damped anomaly scoring during sensor unreliability',
        'Cross-channel thermocouple drift isolation',
      ],
      executeAction: () => {
        router.push('/telemetry');
      },
    },
    {
      step: 4,
      title: 'First-Principles Physics Grey-Box Model',
      subtitle: 'Dynamic Virtual Engine Baseline',
      route: '/digital-twin',
      icon: Cpu,
      description:
        'The thermodynamic digital twin calculates expected values as a function of RPM, manifold pressure, and throttle. Validates that current telemetry resides strictly within the VALID_OPERATING_REGION.',
      actionLabel: 'Inspect Physics State & Envelopes',
      highlights: [
        'Thermodynamic and hydrodynamic expected baselines',
        'Model validity envelope classification (Valid / Extrapolated)',
        'Real-time grey-box thermal efficiency calculations',
      ],
      executeAction: () => {
        router.push('/digital-twin');
      },
    },
    {
      step: 5,
      title: 'Primary Scenario: Gradual Cyl 3 Injector Degradation',
      subtitle: 'Fault Injection Laboratory',
      route: '/fault-lab',
      icon: AlertTriangle,
      description:
        'Inject the primary benchmark failure scenario: gradual nozzle varnishing on Cylinder 3 over 45 seconds. EGT3 rises +46°C, fuel flow jumps +8%, vibration increases +14%, while Cylinder 1, 2, and 4 remain normal.',
      actionLabel: 'Inject Gradual Cyl 3 Injector Clogging',
      highlights: [
        'Non-linear progressive degradation over time',
        'Realistic localized multi-sensor symptom propagation',
        'Benchmark scenario for DRDO/iDEX technical evaluation',
      ],
      executeAction: () => {
        injectFault('GRADUAL_INJECTOR_DEGRADATION', 'Cylinder 3 fuel injector nozzle varnishing and spray pattern degradation');
        router.push('/fault-lab');
      },
    },
    {
      step: 6,
      title: 'First-Principles Residual Generation',
      subtitle: 'Physics-Based Residual Tracking',
      route: '/diagnostics',
      icon: Brain,
      description:
        'Observe how the observed telemetry departs from grey-box physics expectations. Normalized residual z = (observed - expected) / sigma exceeds 3.2σ on Cylinder 3 EGT and fuel flow.',
      actionLabel: 'Examine Residual Table & Z-Scores',
      highlights: [
        'EGT Cyl 3 Residual: +46.2 °C (Normalized: +3.8σ)',
        'Fuel Flow Residual: +1.8 L/h (Normalized: +2.4σ)',
        'Cylinder 1, 2, 4 Residuals remain < 0.5σ (Localized fault)',
      ],
      executeAction: () => {
        router.push('/diagnostics');
      },
    },
    {
      step: 7,
      title: 'Hybrid Anomaly Detection & Persistence Filtering',
      subtitle: 'Eliminating Transient Sensor False Alarms',
      route: '/diagnostics',
      icon: Brain,
      description:
        'The hybrid anomaly detector evaluates residuals and rolling trends. An N=3 temporal persistence filter prevents single-sample noise alarms, confirming the fault after 3 consecutive frames with 54s lead time.',
      actionLabel: 'View Anomaly Score & Lead Time',
      highlights: [
        'Persistence Filter (N=3): Slashes false alarms from 4.8% to 0.4%',
        'Anomaly Score reaches 0.88 / 1.00 (Persistence confirmed)',
        'Earliest confirmation 54 seconds before thermal safety trip',
      ],
      executeAction: () => {
        router.push('/diagnostics');
      },
    },
    {
      step: 8,
      title: '12-Class Failure Diagnosis & Evidence Trail',
      subtitle: 'Multi-Class Root-Cause Classification',
      route: '/fault-analysis',
      icon: AlertTriangle,
      description:
        'The diagnostic classifier isolates "Gradual Cylinder 3 Injector Degradation" with 94% confidence, generating an explicit evidence trail detailing localized EGT spread, fuel flow elevation, and acoustic vibration.',
      actionLabel: 'View Diagnostic Reasoning & Evidence',
      highlights: [
        'Top Diagnosis: Gradual Cylinder 3 Injector Degradation (94%)',
        'Evidence Trail: EGT3 +46°C above peer avg, fuel flow +8%',
        'Traceable reasoning grounded in physical engine telemetry',
      ],
      executeAction: () => {
        router.push('/fault-analysis');
      },
    },
    {
      step: 9,
      title: 'Alternative Hypotheses & Counter-Evidence',
      subtitle: 'Transparent Differential Diagnosis',
      route: '/fault-analysis',
      icon: AlertTriangle,
      description:
        'The system evaluates alternative hypotheses: Hypothesis B considers Thermocouple 3 sensor drift (35% likelihood), noting counter-evidence that simultaneous fuel flow increase and vibration elevation corroborate a real combustion fault.',
      actionLabel: 'Inspect Alternative Hypotheses',
      highlights: [
        'Hypothesis B: Thermocouple 3 gradual calibration drift (35%)',
        'Counter-Evidence: Fuel flow (+8%) and vibration (+14%) agree',
        'Explicit data limitation notices preventing over-confidence',
      ],
      executeAction: () => {
        router.push('/fault-analysis');
      },
    },
    {
      step: 10,
      title: 'Uncertainty-Aware RUL Prognostics',
      subtitle: 'Component-Specific Failure Criteria & 80% CI',
      route: '/rul',
      icon: PlaneTakeoff,
      description:
        'RUL is projected against component-specific engineering criteria: Cylinder 3 nozzle thermal breakdown threshold (EGT > 910°C). Rather than an overconfident point estimate, it reports 82 hours with an 80% CI of [65, 104] hours.',
      actionLabel: 'Analyze RUL Degradation Trajectory',
      highlights: [
        'Estimated Median RUL: 82.0 operating hours',
        '80% Prediction Interval: [65.0, 104.0] hours',
        'Failure Threshold: Injector nozzle thermal limit (910 °C)',
      ],
      executeAction: () => {
        router.push('/rul');
      },
    },
    {
      step: 11,
      title: 'Mission Suitability & Operational Margins',
      subtitle: 'Dynamic Decision Support for Flight Command',
      route: '/mission-simulator',
      icon: PlaneTakeoff,
      description:
        'Engine health degradation (78%) automatically transitions mission suitability from GO to CONDITIONAL GO. Evaluates 5 flight margins: Fuel reserve margin shrinks by 8%, and EGT headroom narrows to 18°C.',
      actionLabel: 'Review Flight Safety Margins',
      highlights: [
        'Mission Clearance: CONDITIONAL GO (Altitude cap recommended)',
        'EGT Headroom Margin: Degraded to 18 °C above cruise',
        'Decision Support Disclaimer: Advisory only, pilot-in-command final',
      ],
      executeAction: () => {
        router.push('/mission-simulator');
      },
    },
    {
      step: 12,
      title: 'Maintenance Advisory & Post-Sortie Debrief',
      subtitle: 'Standardized Engineering Reporting',
      route: '/reports',
      icon: FileText,
      description:
        'The Condition-Based Maintenance system automatically queues a HIGH priority directive for Cylinder 3 ultrasonic injector cleaning and flow bench calibration, generating a printable post-flight engineering debrief.',
      actionLabel: 'Generate Debrief Report & Complete Tour',
      highlights: [
        'High Priority Maintenance Directive: Clean/replace Injector 3',
        'Post-sortie PDF/CSV exportable engineering debrief document',
        'Official research demonstrator disclaimers and sign-off block',
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
