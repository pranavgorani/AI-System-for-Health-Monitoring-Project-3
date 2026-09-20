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
  ActiveFaultType,
  UserRole,
  SensorQualityReport,
  PhysicsModelOutput,
  MissionRiskAssessment,
  MissionAssessmentStatus,
} from './types';
import {
  calculateNextTelemetry,
  calculatePhysicsResiduals,
  DEFAULT_COEFFICIENTS,
  EngineCoefficients,
} from './engine/physicsModel';
import { calculateSubsystemHealth } from './engine/healthCalculator';
import { validateSensors } from './engine/sensorValidator';
import { detectAnomalies, resetAnomalyDetectorState } from './ml/anomalyDetector';
import { classifyFaults } from './ml/faultClassifier';
import { estimateRul, DegradationLevel } from './ml/rulEstimator';
import { telemetryToCanFrames } from './engine/canSimulator';

export interface AppState {
  // Auth & Roles (Using clearly fictional research accounts)
  userRole: UserRole;
  isAuthenticated: boolean;
  currentUser: {
    name: string;
    callsign: string;
    email: string;
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
  sensorReport: SensorQualityReport;
  physicsOutput: PhysicsModelOutput;
  health: SubsystemHealth;
  anomalies: AnomalyOutput;
  faults: FaultPrediction[];
  rul: RulEstimate;
  missionAssessment: MissionRiskAssessment;
  canMessages: CanMessage[];

  // Operational Queues
  alerts: Alert[];
  maintenanceAdvisories: MaintenanceAdvisory[];

  // Replay System
  isReplaying: boolean;
  replayIndex: number;
  replaySpeed: number; // 0.5, 1, 2, 5, 10
}

function computeMissionRisk(
  t: EngineTelemetry,
  health: SubsystemHealth,
  faults: FaultPrediction[],
  anomalies: AnomalyOutput
): MissionRiskAssessment {
  const fuelMarginPct = Math.max(0, Math.min(100, Math.round((t.fuel_level / 120) * 100)));
  const thermalMarginPct = Math.max(0, Math.min(100, Math.round(100 - (t.cht_avg / 155) * 100)));
  const oilPressureMarginPct = Math.max(0, Math.min(100, Math.round((t.oil_pressure / 5.0) * 100)));
  const vibrationMarginPct = Math.max(0, Math.min(100, Math.round(100 - (t.vibration_rms / 6.0) * 100)));

  let assessment: MissionAssessmentStatus = 'GO';
  let primaryRisk = 'Nominal flight parameters across all propulsion subsystems';
  let recommendation = 'Continue planned mission loiter within standard operational envelopes.';
  let restriction: string | undefined = undefined;
  let interruptionRisk: MissionRiskAssessment['interruptionRiskCategory'] = 'LOW';

  const hasCriticalFault = faults.some((f) => f.severity === 'CRITICAL') || health.overall < 50;
  const hasInjectorDegradation = faults.some((f) => f.faultType === 'INJECTOR_DEGRADATION' || f.faultName.includes('Injector'));

  if (hasCriticalFault) {
    assessment = 'MAINTENANCE_REQUIRED';
    primaryRisk = faults[0]?.faultName || 'Critical propulsion subsystem degradation';
    recommendation = 'Abort sortie loiter, initiate return to base (RTB), and schedule immediate maintenance inspection.';
    restriction = 'Immediate RTB / reduce engine power setting to < 65% throttle';
    interruptionRisk = 'CRITICAL';
  } else if (hasInjectorDegradation) {
    assessment = 'CONDITIONAL_GO';
    primaryRisk = 'Reduced thermal and fuel trim margin on Cylinder #3';
    recommendation = 'Limit hot-weather loiter to 90 minutes and inspect Cylinder 3 injector and validate EGT sensor after mission.';
    restriction = 'Limit continuous RPM to 4800; avoid sudden wide-open-throttle transients';
    interruptionRisk = 'MEDIUM';
  } else if (faults.length > 0 || health.overall < 75 || thermalMarginPct < 15 || anomalies.isAnomaly) {
    assessment = 'CONDITIONAL_GO';
    primaryRisk = faults[0]?.faultName || 'Elevated anomaly score or reduced safety margin';
    recommendation = 'Maintain elevated sensor monitoring; restrict high-load evasive maneuvers.';
    restriction = 'Avoid high-altitude climb bursts (> 15,000 ft)';
    interruptionRisk = 'MEDIUM';
  }

  const faultRiskByFlightPhase = [
    { phase: 'TAKEOFF' as FlightState, riskLevel: (hasCriticalFault ? 'HIGH' : hasInjectorDegradation ? 'MEDIUM' : 'LOW') as 'LOW' | 'MEDIUM' | 'HIGH', notes: 'Full 100% throttle thermal surge' },
    { phase: 'CLIMB' as FlightState, riskLevel: (hasInjectorDegradation ? 'MEDIUM' : 'LOW') as 'LOW' | 'MEDIUM' | 'HIGH', notes: 'High manifold boost with decreased airspeed cooling' },
    { phase: 'CRUISE' as FlightState, riskLevel: (hasCriticalFault ? 'HIGH' : 'LOW') as 'LOW' | 'MEDIUM' | 'HIGH', notes: 'Continuous loiter steady-state' },
    { phase: 'HIGH_LOAD' as FlightState, riskLevel: (hasInjectorDegradation ? 'HIGH' : 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH', notes: 'Evasion or rapid throttle transition' },
    { phase: 'DESCENT' as FlightState, riskLevel: 'LOW' as const, notes: 'Idle-cooling shock prevention' },
  ];

  return {
    assessment,
    primaryRisk,
    fuelMarginPct,
    thermalMarginPct,
    oilPressureMarginPct,
    vibrationMarginPct,
    interruptionRiskCategory: interruptionRisk,
    faultRiskByFlightPhase,
    recommendation,
    operatingRestriction: restriction,
    disclaimer: 'Decision-support assessment; not a certified flight-safety or airworthiness release.',
  };
}

// Initial Pipeline Construction
const INITIAL_TELEMETRY: EngineTelemetry = calculateNextTelemetry(null, 'CRUISE');
const INITIAL_SENSOR_REPORT = validateSensors(INITIAL_TELEMETRY, []);
const INITIAL_PHYSICS = calculatePhysicsResiduals(INITIAL_TELEMETRY);
const INITIAL_HEALTH = calculateSubsystemHealth(INITIAL_TELEMETRY, INITIAL_SENSOR_REPORT);
const INITIAL_ANOMALIES = detectAnomalies(INITIAL_TELEMETRY, INITIAL_PHYSICS, INITIAL_SENSOR_REPORT);
const INITIAL_FAULTS = classifyFaults(INITIAL_TELEMETRY, { type: 'NONE', subsystem: 'none', severity: 0, startedAt: '', notes: '' }, INITIAL_PHYSICS, INITIAL_SENSOR_REPORT);
const INITIAL_RUL = estimateRul(INITIAL_HEALTH.overall, INITIAL_TELEMETRY.engine_hours, 'NORMAL', undefined, INITIAL_FAULTS, INITIAL_PHYSICS, INITIAL_SENSOR_REPORT);
const INITIAL_MISSION_ASSESSMENT = computeMissionRisk(INITIAL_TELEMETRY, INITIAL_HEALTH, INITIAL_FAULTS, INITIAL_ANOMALIES);

export const INITIAL_STATE: AppState = {
  userRole: 'ADMIN',
  isAuthenticated: true,
  currentUser: {
    name: 'Research Demonstrator Lead',
    callsign: 'GCS-SIM-ALPHA',
    email: 'admin.demo@aegis-twin.local',
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
  sensorReport: INITIAL_SENSOR_REPORT,
  physicsOutput: INITIAL_PHYSICS,
  health: INITIAL_HEALTH,
  anomalies: INITIAL_ANOMALIES,
  faults: INITIAL_FAULTS,
  rul: INITIAL_RUL,
  missionAssessment: INITIAL_MISSION_ASSESSMENT,
  canMessages: telemetryToCanFrames(INITIAL_TELEMETRY),
  alerts: [
    {
      id: 'ALT-101',
      timestamp: new Date().toISOString(),
      severity: 'INFO',
      subsystem: 'FADEC Core',
      description: 'Telemetry stream synchronized over virtual CAN 2.0B / J1939 bridge',
      evidence: 'All primary transducers initialized and passing sensor-health checks',
      recommendedAction: 'Verify baseline digital twin telemetry before mission start',
      acknowledged: true,
      resolved: false,
    },
  ],
  maintenanceAdvisories: [
    {
      id: 'ADV-001',
      issue: 'Routine 50-hr Spark Plug & Injector Flow Verification',
      subsystem: 'Combustion System',
      priority: 'LOW',
      reason: 'Scheduled maintenance inspection approaching within 7.5 operating hours',
      confidence: 96,
      suggestedInspection: 'Borescope inspection of Cylinder 3 and injector flow rate calibration.',
      detectedCondition: 'Nominal wear profile',
      supportingEvidence: ['Operating hours: 142.5 hrs', 'Cylinder EGT delta within normal tolerances'],
      estimatedUrgencyHours: 7.5,
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
 * Executes the complete PHM pipeline for a given telemetry frame:
 * Telemetry -> Sensor Validation -> Physics Grey-Box -> Residuals -> Anomaly Detection ->
 * Fault Diagnosis -> Health Index -> RUL Forecasting -> Mission Risk -> Maintenance Advisories
 */
export function processTelemetryFrame(
  nextTelem: EngineTelemetry,
  activeFault: ActiveFaultInjection = state.activeFault
) {
  const sensorReport = validateSensors(nextTelem, state.telemetryHistory);
  const physicsOutput = calculatePhysicsResiduals(nextTelem, state.coefficients);
  const nextHealth = calculateSubsystemHealth(nextTelem, sensorReport);
  const nextAnomalies = detectAnomalies(nextTelem, physicsOutput, sensorReport);
  const nextFaults = classifyFaults(nextTelem, activeFault, physicsOutput, sensorReport);
  const nextRul = estimateRul(
    nextHealth.overall,
    nextTelem.engine_hours,
    state.degradationLevel,
    state.customDegradationRate,
    nextFaults,
    physicsOutput,
    sensorReport
  );
  const nextMissionRisk = computeMissionRisk(nextTelem, nextHealth, nextFaults, nextAnomalies);
  const nextCan = state.isCanActive ? telemetryToCanFrames(nextTelem) : state.canMessages;

  return {
    sensorReport,
    physicsOutput,
    nextHealth,
    nextAnomalies,
    nextFaults,
    nextRul,
    nextMissionRisk,
    nextCan,
  };
}

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

  const {
    sensorReport,
    physicsOutput,
    nextHealth,
    nextAnomalies,
    nextFaults,
    nextRul,
    nextMissionRisk,
    nextCan,
  } = processTelemetryFrame(nextTelem);

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
          ...(f.evidence || f.detectedParameters),
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
    sensorReport,
    physicsOutput,
    health: nextHealth,
    anomalies: nextAnomalies,
    faults: nextFaults,
    rul: nextRul,
    missionAssessment: nextMissionRisk,
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

export function injectFault(type: ActiveFaultType, notes: string = '', severity: number = 0.85): void {
  let subsystem = 'Combustion';
  if (type === 'LUBRICATION_ISSUE') subsystem = 'Lubrication';
  else if (type === 'ABNORMAL_VIBRATION') subsystem = 'Crankshaft & Propeller';
  else if (type.includes('SENSOR')) subsystem = 'Sensors & Instrumentation';
  else if (type === 'ELECTRICAL_FAULT') subsystem = 'Electrical & FADEC Bus';
  else if (type === 'OVERHEATING') subsystem = 'Cooling & Thermal';
  else if (type === 'GRADUAL_INJECTOR_DEGRADATION') subsystem = 'Fuel Injection & Combustion';

  state = {
    ...state,
    activeFault: {
      type,
      subsystem,
      severity,
      startedAt: new Date().toISOString(),
      notes: notes || `Simulated injection of ${type} fault profile`,
      affectedCylinder: type.includes('INJECTOR') || type === 'MISFIRE' ? 3 : undefined,
    },
  };
  notify();
}

export function clearFault(): void {
  resetAnomalyDetectorState();
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
  const emailMap: Record<UserRole, string> = {
    ADMIN: 'admin.demo@aegis-twin.local',
    OPERATOR: 'operator.demo@aegis-twin.local',
    MAINTENANCE_ENGINEER: 'maintenance.demo@aegis-twin.local',
    ANALYST: 'analyst.demo@aegis-twin.local',
  };

  state = {
    ...state,
    userRole: role,
    currentUser: {
      ...state.currentUser,
      role,
      email: emailMap[role],
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
  resetAnomalyDetectorState();
  state = {
    ...INITIAL_STATE,
    telemetryHistory: [INITIAL_TELEMETRY],
  };
  notify();
}
