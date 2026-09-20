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
  injection_timing: number;     // °BTDC (typically 22 - 26 °BTDC)
  
  // Electrical & Environmental
  battery_voltage: number;      // V (24V nominal: 25.5 - 28.5V)
  alternator_current: number;   // Amps (typically 20 - 45A)
  altitude: number;             // Feet (0 - 25,000 ft)
  ambient_temperature: number;  // °C
  ambient_pressure: number;     // hPa (1013 at sea level)
  
  // Efficiency
  efficiency: number;           // % (thermal-mechanical conversion)
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
  classification: 'NORMAL' | 'MINOR ANOMALY' | 'SIGNIFICANT ANOMALY' | 'SEVERE ANOMALY';
  confidence: number;           // % (e.g. 89%)
  contributingFactors: ContributingFactor[];
  isAnomaly: boolean;
  modelType: string;
  dataQuality: number;          // % (e.g. 98%)
}

export interface FaultPrediction {
  id: string;
  faultName: string;
  probability: number;          // 0 - 100 %
  affectedSubsystem: string;
  detectedParameters: string[];
  severity: FaultSeverity;
  firstDetectedTime: string;
  currentStatus: 'ACTIVE' | 'RESOLVING' | 'CLEARED';
  recommendedInspection: string;
  explanation: string;
}

export interface RulProjection {
  hoursAhead: number;
  projectedHealth: number;
  status: HealthStatus;
  confidenceMin: number;
  confidenceMax: number;
}

export interface RulEstimate {
  estimatedHours: number;
  confidenceInterval: [number, number];
  degradationRatePerHour: number; // e.g. 0.42 health points/hour
  projectedCurve: RulProjection[];
  baselineUsefulLife: number;
  consumedHours: number;
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

export interface ActiveFaultInjection {
  type:
    | 'NONE'
    | 'MISFIRE'
    | 'INJECTOR_ABNORMALITY'
    | 'COMBUSTION_DEGRADATION'
    | 'LUBRICATION_ISSUE'
    | 'SENSOR_DRIFT'
    | 'SENSOR_FAILURE'
    | 'COMBUSTION_INSTABILITY'
    | 'OVERHEATING'
    | 'ABNORMAL_VIBRATION'
    | 'ELECTRICAL_FAULT';
  subsystem: string;
  severity: number;             // 0 to 1
  startedAt: string;
  notes: string;
}
