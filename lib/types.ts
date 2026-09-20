export type FlightState =
  | 'IDLE'
  | 'TAXI'
  | 'TAKEOFF'
  | 'CLIMB'
  | 'CRUISE'
  | 'HIGH_LOAD'
  | 'DESCENT'
  | 'LANDING'
  | 'SHUTDOWN';

export type HealthStatus = 'NORMAL' | 'GOOD' | 'DEGRADED' | 'CRITICAL';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type FaultSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UserRole = 'ADMIN' | 'OPERATOR' | 'MAINTENANCE_ENGINEER' | 'ANALYST';

export type ValidationStatus = 'VALID' | 'SUSPECT' | 'INVALID' | 'OUT_OF_RANGE';
export type SourceType = 'SIMULATED' | 'SYNTHETIC_REPLAY' | 'CAN_TESTBED';

export interface EngineTelemetry {
  timestamp: string;
  engine_id: string;
  mission_id: string;
  flight_state: FlightState;
  
  // Core mechanics
  rpm: number;                  // 0 - 5800 RPM (Typical Rotax / Aero Piston)
  throttle: number;             // 0 - 100 %
  engine_load: number;          // 0 - 100 %
  engine_hours: number;         // Operating hours
  manifold_pressure: number;    // hPa boost
  load_estimate: number;        // % effective torque load
  
  // Thermal parameters (Cylinder Head & Exhaust Gas Temperatures)
  cht_1: number;                // °C (Cylinder 1)
  cht_2: number;                // °C (Cylinder 2)
  cht_3: number;                // °C (Cylinder 3)
  cht_4: number;                // °C (Cylinder 4)
  cht_avg: number;              // °C Average
  egt_1: number;                // °C (Cylinder 1)
  egt_2: number;                // °C (Cylinder 2)
  egt_3: number;                // °C (Cylinder 3)
  egt_4: number;                // °C (Cylinder 4)
  egt_avg: number;              // °C Average

  // Fluid Dynamics & Lubrication
  oil_pressure: number;         // bar (typically 2.0 - 5.5 bar)
  oil_temperature: number;      // °C (typically 50 - 130 °C)
  fuel_flow: number;            // L/h (typically 12 - 32 L/h)
  fuel_level: number;           // Liters remaining
  
  // Mechanical Dynamics
  vibration_rms: number;        // mm/s (normal < 4.5 mm/s)
  vibration_peak: number;       // mm/s peak amplitude
  injection_timing: number;     // °BTDC (typically 22 - 26 °BTDC)
  
  // Electrical & Environmental
  battery_voltage: number;      // V (24V nominal: 25.5 - 28.5V)
  alternator_current: number;   // Amps (typically 20 - 45A)
  altitude: number;             // Feet (0 - 25,000 ft)
  ambient_temperature: number;  // °C
  ambient_pressure: number;     // hPa (1013 at sea level)
  
  // Efficiency
  efficiency: number;           // % (thermal-mechanical conversion)

  // Telemetry metadata & Sensor Quality
  can_frame_id: string;         // e.g. "0x18FEE400"
  signal_quality: number;       // 0 - 100%
  missing_data_flag: boolean;
  validation_status: ValidationStatus;
  source_type: SourceType;
  dataset_version: string;      // e.g. "v2.4-synthetic"
  model_version: string;        // e.g. "v1.2-greybox"
}

// Units mapping for all displayed parameters
export const PARAMETER_UNITS: Record<string, string> = {
  rpm: 'RPM',
  throttle: '%',
  engine_load: '%',
  engine_hours: 'hrs',
  manifold_pressure: 'hPa',
  load_estimate: '%',
  cht_1: '°C',
  cht_2: '°C',
  cht_3: '°C',
  cht_4: '°C',
  cht_avg: '°C',
  egt_1: '°C',
  egt_2: '°C',
  egt_3: '°C',
  egt_4: '°C',
  egt_avg: '°C',
  oil_pressure: 'bar',
  oil_temperature: '°C',
  fuel_flow: 'L/h',
  fuel_level: 'L',
  vibration_rms: 'mm/s',
  vibration_peak: 'mm/s',
  injection_timing: '°BTDC',
  battery_voltage: 'V',
  alternator_current: 'A',
  altitude: 'ft',
  ambient_temperature: '°C',
  ambient_pressure: 'hPa',
  efficiency: '%',
};

// ==========================================
// SENSOR AND DATA-QUALITY LAYER TYPES
// ==========================================
export type SensorAnomalyType = 'ENGINE_ANOMALY' | 'SENSOR_ANOMALY' | 'COMM_ANOMALY' | 'UNKNOWN';
export type SensorChannelStatus = 'HEALTHY' | 'SUSPECT' | 'DEGRADED' | 'FAILED' | 'FROZEN' | 'DRIFT';

export interface SensorChannelHealth {
  channel: string;
  label: string;
  currentValue: number;
  unit: string;
  status: SensorChannelStatus;
  confidence: number;          // 0 - 100 %
  anomalyType: SensorAnomalyType;
  reason: string;
  lastValidUpdate: string;
  qualityScore: number;        // 0 - 100 %
  isFrozen: boolean;
  isDrifting: boolean;
  rateOfChange: number;        // engineering unit / sec
}

export interface SensorQualityReport {
  overallSensorConfidence: number; // 0 - 100 %
  validChannelCount: number;
  suspectChannelCount: number;
  failedChannelCount: number;
  anomalyClassification: SensorAnomalyType;
  channels: Record<string, SensorChannelHealth>;
  timestamp: string;
}

// ==========================================
// PHYSICS GREY-BOX RESIDUAL TYPES
// ==========================================
export type ModelValidityRegion =
  | 'VALID_OPERATING_REGION'
  | 'EXTRAPOLATED_REGION'
  | 'OUT_OF_DOMAIN_REGION';

export interface ParameterResidual {
  parameter: string;
  label: string;
  actual: number;
  expected: number;
  residual: number;            // actual - expected
  normalizedResidual: number;  // residual / sigma
  unit: string;
  trend: 'STABLE' | 'DIVERGING' | 'CONVERGING';
  modelConfidence: number;     // %
  modelValidity: ModelValidityRegion;
}

export interface PhysicsModelOutput {
  validityRegion: ModelValidityRegion;
  validityMessage?: string;
  modelConfidence: number;
  expectedValues: {
    egt_avg: number;
    egt_1: number;
    egt_2: number;
    egt_3: number;
    egt_4: number;
    cht_avg: number;
    cht_1: number;
    cht_2: number;
    cht_3: number;
    cht_4: number;
    oil_pressure: number;
    oil_temperature: number;
    fuel_flow: number;
    vibration_rms: number;
    efficiency: number;
  };
  residuals: ParameterResidual[];
}

export interface SubsystemHealth {
  overall: number;              // 0 - 100
  combustion: number;           // 0 - 100
  fuel_system: number;          // 0 - 100
  lubrication: number;          // 0 - 100
  cooling: number;              // 0 - 100
  exhaust: number;              // 0 - 100
  crankshaft: number;           // 0 - 100
  propeller: number;            // 0 - 100
  electrical: number;           // 0 - 100
  sensors: number;              // 0 - 100
  status: HealthStatus;
  confidence: number;           // % confidence in health calculation
  contributions?: Record<string, number>; // Breakdown of degradation penalties
  disclaimer: string;
}

export interface ContributingFactor {
  parameter: string;
  contribution: number;        // e.g. +31%
  direction: 'higher' | 'lower' | 'erratic';
  severity: 'low' | 'medium' | 'high';
  baseline: number;
  current: number;
  unit: string;
}

export interface AnomalyOutput {
  score: number;                // 0.00 to 1.00
  classification: 'NORMAL' | 'INFORMATION' | 'ADVISORY' | 'WARNING' | 'CRITICAL';
  confidence: number;           // % (e.g. 89%)
  contributingFactors: ContributingFactor[];
  isAnomaly: boolean;
  modelType: string;
  dataQuality: number;          // % (e.g. 98%)
  affectedParameter?: string;
  affectedCylinder?: number | 'ALL';
  persistenceDurationSec: number;
  detectionLeadTimeSec: number;
  explanation: string;
}

export type FaultClassificationType =
  | 'MISFIRE'
  | 'INJECTOR_DEGRADATION'
  | 'IGNITION_TIMING_ABNORMALITY'
  | 'LUBRICATION_PRESSURE_LOSS'
  | 'OVERHEATING_TREND'
  | 'ABNORMAL_VIBRATION'
  | 'COMBUSTION_INSTABILITY'
  | 'EGT_SENSOR_DRIFT'
  | 'OIL_PRESSURE_SENSOR_FAILURE'
  | 'ELECTRICAL_ALTERNATOR_FAULT'
  | 'CAN_FRAME_DROPOUT'
  | 'FROZEN_SENSOR';

export interface AlternativeHypothesis {
  faultName: string;
  probability: number;
  rationale: string;
}

export interface FaultPrediction {
  id: string;
  faultName: string;
  faultType?: FaultClassificationType;
  probability: number;          // 0 - 100 %
  affectedSubsystem: string;
  affectedCylinder?: number | 'ALL';
  detectedParameters: string[];
  evidence?: string[];
  alternativeHypotheses?: AlternativeHypothesis[];
  severity: FaultSeverity;
  firstDetectedTime: string;
  currentStatus: 'ACTIVE' | 'RESOLVING' | 'CLEARED';
  recommendedInspection: string;
  explanation: string;
  dataLimitations?: string;
}

export interface RulProjection {
  hoursAhead: number;
  projectedHealth: number;
  status: HealthStatus;
  confidenceMin: number;
  confidenceMax: number;
}

export interface RulEstimate {
  predictedComponent: string;
  endOfLifeCriterion: string;
  currentDegradationIndicator: string;
  estimatedHours: number;       // Median RUL
  confidenceInterval: [number, number]; // [Lower Bound, Upper Bound]
  confidenceLevel: number;      // e.g. 80%
  degradationRatePerHour: number; // e.g. 0.42 health points/hour
  projectedCurve: RulProjection[];
  baselineUsefulLife: number;
  consumedHours: number;
  dataSource: string;
  modelStatus: string;
  statusDisclaimer: string;
}

export interface Alert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  subsystem: string;
  description: string;
  evidence: string;
  recommendedAction: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface MaintenanceAdvisory {
  id: string;
  issue: string;
  subsystem: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  confidence: number;
  suggestedInspection: string;
  detectedCondition: string;
  supportingEvidence: string[];
  estimatedUrgencyHours: number;
  status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface CanMessage {
  id: string;
  canId: string;                // e.g. 0x18FEE400
  signal: string;
  value: number | string;
  unit: string;
  timestamp: string;
  status: 'OK' | 'WARNING' | 'ERROR';
}

export type ActiveFaultType =
  | 'NONE'
  | 'GRADUAL_INJECTOR_DEGRADATION' // Primary Demo Scenario (Cyl 3)
  | 'MISFIRE'
  | 'INJECTOR_ABNORMALITY'
  | 'COMBUSTION_DEGRADATION'
  | 'LUBRICATION_ISSUE'
  | 'OVERHEATING'
  | 'ABNORMAL_VIBRATION'
  | 'COMBUSTION_INSTABILITY'
  | 'IGNITION_TIMING'
  | 'ELECTRICAL_FAULT'
  | 'SENSOR_DRIFT'
  | 'SENSOR_FAILURE'
  | 'FROZEN_SENSOR'
  | 'CAN_DROPOUT';

export interface ActiveFaultInjection {
  type: ActiveFaultType;
  subsystem: string;
  severity: number;             // 0 to 1
  startedAt: string;
  notes: string;
  rampDurationSec?: number;
  affectedCylinder?: number;
  affectedParameter?: string;
  expectedSymptom?: string;
  expectedLeadTimeSec?: number;
}

// ==========================================
// MISSION SIMULATOR & RISK MARGIN TYPES
// ==========================================
export type MissionAssessmentStatus = 'GO' | 'CONDITIONAL_GO' | 'MAINTENANCE_REQUIRED';

export interface MissionRiskAssessment {
  assessment: MissionAssessmentStatus;
  primaryRisk: string;
  fuelMarginPct: number;
  thermalMarginPct: number;
  oilPressureMarginPct: number;
  vibrationMarginPct: number;
  interruptionRiskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  faultRiskByFlightPhase: {
    phase: FlightState;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    notes: string;
  }[];
  recommendation: string;
  operatingRestriction?: string;
  disclaimer: string;
}
