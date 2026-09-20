import {
  FlightState,
  EngineTelemetry,
  SubsystemHealth,
  AnomalyOutput,
  FaultPrediction,
  RulEstimate,
  Alert,
  MaintenanceAdvisory,
  CanMessage,
  ActiveFaultInjection,
  UserRole,
} from './types';
import { calculateNextTelemetry, DEFAULT_COEFFICIENTS, EngineCoefficients } from './engine/physicsModel';
import { calculateSubsystemHealth } from './engine/healthCalculator';
import { detectAnomalies } from './ml/anomalyDetector';
import { classifyFaults } from './ml/faultClassifier';
import { estimateRul, DegradationLevel } from './ml/rulEstimator';
import { telemetryToCanFrames } from './engine/canSimulator';

export interface AppState {
  // Auth & Roles
  userRole: UserRole;
  isAuthenticated: boolean;
  currentUser: {
    name: string;
    callsign: string;
    role: UserRole;
  };

  // Demo & GCS Identifiers
  isDemoMode: boolean;
  engineId: string;
  uavId: string;
  missionId: string;
  isSimulating: boolean;
  isCanActive: boolean;

  // Engine State Machine
  flightState: FlightState;
  coefficients: EngineCoefficients;
  degradationLevel: DegradationLevel;
  customDegradationRate: number;
  activeFault: ActiveFaultInjection;

  // Real-time Pipeline Outputs
  currentTelemetry: EngineTelemetry;
  telemetryHistory: EngineTelemetry[]; // max 120 buffer points
  health: SubsystemHealth;
  anomalies: AnomalyOutput;
  faults: FaultPrediction[];
  rul: RulEstimate;
  canMessages: CanMessage[];

  // Operational Queues
  alerts: Alert[];
  maintenanceAdvisories: MaintenanceAdvisory[];

  // Replay System
  isReplaying: boolean;
  replayIndex: number;
  replaySpeed: number; // 0.5, 1, 2, 5, 10
}

const INITIAL_TELEMETRY: EngineTelemetry = calculateNextTelemetry(null, 'CRUISE');
const INITIAL_HEALTH = calculateSubsystemHealth(INITIAL_TELEMETRY);
const INITIAL_ANOMALIES = detectAnomalies(INITIAL_TELEMETRY);
const INITIAL_FAULTS = classifyFaults(INITIAL_TELEMETRY, { type: 'NONE', subsystem: 'none', severity: 0, startedAt: '', notes: '' });
const INITIAL_RUL = estimateRul(INITIAL_HEALTH.overall, INITIAL_TELEMETRY.engine_hours, 'NORMAL');

export const INITIAL_STATE: AppState = {
  userRole: 'ADMIN',
  isAuthenticated: true,
  currentUser: {
    name: 'Wg Cdr S. Sharma (Retd)',
    callsign: 'DRDO-GCS-ALPHA',
    role: 'ADMIN',
  },
  isDemoMode: true,
  engineId: 'AEGIS-ENG-001',
  uavId: 'TAPAS-MALE-UAV-04',
  missionId: 'MSN-2026-09',
  isSimulating: true,
  isCanActive: true,
  flightState: 'CRUISE',
  coefficients: { ...DEFAULT_COEFFICIENTS },
  degradationLevel: 'NORMAL',
  customDegradationRate: 0.25,
  activeFault: { type: 'NONE', subsystem: 'none', severity: 0, startedAt: '', notes: '' },
  currentTelemetry: INITIAL_TELEMETRY,
  telemetryHistory: [INITIAL_TELEMETRY],
  health: INITIAL_HEALTH,
  anomalies: INITIAL_ANOMALIES,
  faults: INITIAL_FAULTS,
  rul: INITIAL_RUL,
  canMessages: telemetryToCanFrames(INITIAL_TELEMETRY),
  alerts: [
    {
      id: 'ALT-101',
      timestamp: new Date().toISOString(),
      severity: 'INFO',
      subsystem: 'FADEC Core',
      description: 'Telemetry stream initialized over virtual ARINC-429/CAN bridge',
      evidence: 'All 10 primary engine sensors synchronized',
      recommendedAction: 'Verify pre-flight digital twin baseline',
      acknowledged: true,
      resolved: false,
    },
  ],
  maintenanceAdvisories: [
    {
      id: 'ADV-001',
      issue: 'Routine 50-hr Spark Plug & Injector Flow Inspection',
      subsystem: 'Combustion System',
      priority: 'LOW',
      reason: 'Scheduled interval approaching within 8.5 operating hours',
      confidence: 99,
      suggestedInspection: 'Borescope inspection of cylinder #3 and injector flow nozzle verification.',
      detectedCondition: 'Nominal wear trajectory',
      supportingEvidence: ['Operating hours: 142.5 hrs', 'EGT balance within tolerance'],
      estimatedUrgencyHours: 8.5,
      status: 'SCHEDULED',
    },
  ],
  isReplaying: false,
  replayIndex: 0,
  replaySpeed: 1.0,
};

let state: AppState = { ...INITIAL_STATE };
const listeners = new Set<() => void>();

export function getState(): AppState {
  return state;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  listeners.forEach((l) => l());
}

let tickCounter = 0;

/**
 * Step the simulation pipeline forward by one tick
 */
export function stepSimulation(): void {
  if (!state.isSimulating) return;

  tickCounter++;
  const nextTelem = calculateNextTelemetry(
    state.currentTelemetry,
    state.flightState,
    state.coefficients,
    state.activeFault,
    tickCounter
  );

  const nextHealth = calculateSubsystemHealth(nextTelem);
  const nextAnomalies = detectAnomalies(nextTelem);
  const nextFaults = classifyFaults(nextTelem, state.activeFault);
  const nextRul = estimateRul(
    nextHealth.overall,
    nextTelem.engine_hours,
    state.degradationLevel,
    state.customDegradationRate,
    nextFaults.length
  );
  const nextCan = state.isCanActive ? telemetryToCanFrames(nextTelem) : state.canMessages;

  // Buffer management (keep last 60 points for smooth charts)
  const history = [...state.telemetryHistory.slice(-59), nextTelem];

  // Auto-generate alerts if new faults are detected
  const currentAlerts = [...state.alerts];
  nextFaults.forEach((f) => {
    const existing = currentAlerts.find((a) => a.description.includes(f.faultName));
    if (!existing) {
      currentAlerts.unshift({
        id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        severity: f.severity === 'CRITICAL' ? 'CRITICAL' : f.severity === 'HIGH' ? 'WARNING' : 'INFO',
        subsystem: f.affectedSubsystem,
        description: `${f.faultName} identified by AI Diagnostic Engine`,
        evidence: f.detectedParameters.join('; '),
        recommendedAction: f.recommendedInspection,
        acknowledged: false,
        resolved: false,
      });

      // Also create a maintenance advisory
      state.maintenanceAdvisories.unshift({
        id: `ADV-${Date.now()}`,
        issue: f.faultName,
        subsystem: f.affectedSubsystem,
        priority: f.severity === 'CRITICAL' ? 'CRITICAL' : f.severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
        reason: f.explanation,
        confidence: f.probability,
        suggestedInspection: f.recommendedInspection,
        detectedCondition: f.detectedParameters.join(', '),
        supportingEvidence: [
          `Fault Probability: ${f.probability}%`,
          `Subsystem Health Impact: ${nextHealth.status}`,
          ...f.detectedParameters,
        ],
        estimatedUrgencyHours: f.severity === 'CRITICAL' ? 2 : 12,
        status: 'PENDING',
      });
    }
  });

  state = {
    ...state,
    currentTelemetry: nextTelem,
    telemetryHistory: history,
    health: nextHealth,
    anomalies: nextAnomalies,
    faults: nextFaults,
    rul: nextRul,
    canMessages: nextCan,
    alerts: currentAlerts.slice(0, 50),
    maintenanceAdvisories: state.maintenanceAdvisories.slice(0, 30),
  };

  notify();
}

// User Actions
export function setFlightState(newState: FlightState): void {
  state = { ...state, flightState: newState };
  notify();
}

export function injectFault(type: ActiveFaultInjection['type'], notes: string = ''): void {
  state = {
    ...state,
    activeFault: {
      type,
      subsystem: type.includes('LUBRIC') ? 'Lubrication' : type.includes('VIB') ? 'Crankshaft' : 'Combustion',
      severity: 0.85,
      startedAt: new Date().toISOString(),
      notes: notes || `Simulated injection of ${type} fault profile`,
    },
  };
  notify();
}

export function clearFault(): void {
  state = {
    ...state,
    activeFault: { type: 'NONE', subsystem: 'none', severity: 0, startedAt: '', notes: '' },
  };
  notify();
}

export function toggleSimulation(): void {
  state = { ...state, isSimulating: !state.isSimulating };
  notify();
}

export function setDegradation(level: DegradationLevel, customRate?: number): void {
  state = {
    ...state,
    degradationLevel: level,
    customDegradationRate: customRate ?? state.customDegradationRate,
  };
  notify();
}

export function acknowledgeAlert(alertId: string): void {
  state = {
    ...state,
    alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
  };
  notify();
}

export function resolveAlert(alertId: string): void {
  state = {
    ...state,
    alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)),
  };
  notify();
}

export function setRole(role: UserRole): void {
  state = {
    ...state,
    userRole: role,
    currentUser: {
      ...state.currentUser,
      role,
    },
  };
  notify();
}

export function setEngineId(engineId: string): void {
  state = { ...state, engineId };
  notify();
}

export function setMissionId(missionId: string): void {
  state = { ...state, missionId };
  notify();
}

export function updateCoefficients(coeffs: Partial<EngineCoefficients>): void {
  state = {
    ...state,
    coefficients: { ...state.coefficients, ...coeffs },
  };
  notify();
}

export function resetToDefaults(): void {
  state = {
    ...INITIAL_STATE,
    telemetryHistory: [INITIAL_TELEMETRY],
  };
  notify();
}
