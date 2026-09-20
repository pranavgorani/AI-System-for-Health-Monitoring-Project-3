import {
  RulEstimate,
  RulProjection,
  HealthStatus,
  FaultPrediction,
  PhysicsModelOutput,
  SensorQualityReport,
} from '../types';

export type DegradationLevel = 'NORMAL' | 'MILD' | 'MODERATE' | 'SEVERE' | 'CUSTOM';

const BASE_DEGRADATION_RATES: Record<DegradationLevel, number> = {
  NORMAL: 0.18,      // 0.18 health points lost per flight hour
  MILD: 0.35,        // 0.35 health points lost per flight hour
  MODERATE: 0.65,    // 0.65 health points lost per flight hour
  SEVERE: 1.45,      // 1.45 health points lost per flight hour
  CUSTOM: 0.50,
};

/**
 * Trend-based, uncertainty-aware Remaining Useful Life (RUL) estimator.
 * Generates median estimate with 80% confidence prediction intervals,
 * failure criteria, component specificity, and research disclaimers.
 */
export function estimateRul(
  currentHealth: number,
  operatingHours: number,
  degradationLevel: DegradationLevel = 'NORMAL',
  customRate?: number,
  activeFaults: FaultPrediction[] = [],
  physicsOutput?: PhysicsModelOutput,
  sensorReport?: SensorQualityReport
): RulEstimate {
  let rate = customRate !== undefined && degradationLevel === 'CUSTOM'
    ? customRate
    : BASE_DEGRADATION_RATES[degradationLevel] || BASE_DEGRADATION_RATES.NORMAL;

  let predictedComponent = 'Propulsion Powerplant General Assembly';
  let endOfLifeCriterion = 'Composite health index decay below minimum TBO threshold (40%)';
  let currentIndicator = `Nominal wear trajectory (${rate} pts/hr)`;
  let dataSource = 'simulated degradation scenario (exponential baseline model)';
  let modelStatus = 'Research prognostic model (calibrated on synthetic aero-piston run-to-failure curves)';

  // 1. Component-specific failure criteria mapping based on active fault
  const topFault = activeFaults.length > 0 ? activeFaults[0] : null;

  if (topFault) {
    if (topFault.faultType === 'INJECTOR_DEGRADATION' || topFault.faultName.includes('Injector')) {
      predictedComponent = 'Cylinder 3 Injector & Nozzle Assembly';
      endOfLifeCriterion = 'Persistent EGT imbalance above configured limit (+60°C) or CHT thermal exceedance';
      currentIndicator = 'Cylinder 3 EGT divergence (+46°C above peer bank) and +8% fuel flow trim';
      // Specific injector wear acceleration
      rate = 1.12; // points per hour
    } else if (topFault.faultType === 'MISFIRE') {
      predictedComponent = 'Cylinder 3 Spark Plug & Ignition Coil Train';
      endOfLifeCriterion = 'Total loss of single-cylinder power stroke / severe vibration harmonic';
      currentIndicator = 'EGT collapse and vibration harmonic surge';
      rate = 2.40;
    } else if (topFault.faultType === 'LUBRICATION_PRESSURE_LOSS') {
      predictedComponent = 'Crankshaft Main Journal Hydrodynamic Bearings';
      endOfLifeCriterion = 'Hydrodynamic oil film collapse / journal metal-to-metal boundary friction';
      currentIndicator = 'Oil pressure line decay below 2.0 bar';
      rate = 3.20;
    } else if (topFault.faultType === 'OVERHEATING_TREND') {
      predictedComponent = 'Cylinder Head Gasket & Valve Seats';
      endOfLifeCriterion = 'Sustained CHT > 150°C causing cylinder head structural warp';
      currentIndicator = 'Coupled CHT and oil temperature margin erosion';
      rate = 1.85;
    } else if (topFault.faultType === 'ABNORMAL_VIBRATION') {
      predictedComponent = 'Propeller Reduction Gearbox / Crankshaft';
      endOfLifeCriterion = 'Rotational vibration RMS > 7.5 mm/s exceeding fatigue limits';
      currentIndicator = 'Synchronous vibration exceedance';
      rate = 1.60;
    } else {
      rate = rate * (1 + activeFaults.length * 0.65);
    }
  }

  // 2. Adjust confidence level based on sensor health & model validity envelope
  let confidenceLevel = 80;
  const sensorConf = sensorReport ? sensorReport.overallSensorConfidence : 95;
  if (sensorConf < 75) {
    confidenceLevel = Math.max(50, Math.round(confidenceLevel * (sensorConf / 100)));
  }
  if (physicsOutput && physicsOutput.validityRegion !== 'VALID_OPERATING_REGION') {
    confidenceLevel = Math.min(confidenceLevel, 55);
    modelStatus = 'Degraded confidence: Operating in extrapolated or out-of-domain envelope';
  }

  // 3. Project hours until configured failure criterion (Health < 40)
  const healthMargin = Math.max(0, currentHealth - 40);
  const rawRulHours = rate > 0 ? healthMargin / rate : 800;
  const estimatedHours = Math.round(rawRulHours);

  // 4. Uncertainty Interval Calculation
  // Uncertainty width expands when confidence is lower or rate is higher
  const uncertaintySpreadPct = 0.15 + ((100 - confidenceLevel) / 100) * 0.20;
  const spreadHours = Math.max(4, Math.round(estimatedHours * uncertaintySpreadPct));
  const lowerBoundHours = Math.max(0, estimatedHours - spreadHours);
  const upperBoundHours = estimatedHours + spreadHours;

  // 5. Generate Forward Projection Trajectory
  const horizons = [0, 25, 50, 75, 100, 150, 200];
  const projectedCurve: RulProjection[] = horizons.map((h) => {
    const wear = rate * h * (1 + (h / 350) * 0.25);
    const projHealth = Math.max(10, Math.min(100, Math.round((currentHealth - wear) * 10) / 10));

    let status: HealthStatus = 'NORMAL';
    if (projHealth < 50) status = 'CRITICAL';
    else if (projHealth < 75) status = 'DEGRADED';
    else if (projHealth < 90) status = 'GOOD';

    const uncertaintyAtH = Math.round((h * 0.12) + 4);
    return {
      hoursAhead: h,
      projectedHealth: projHealth,
      status,
      confidenceMin: Math.max(5, Math.round(projHealth - uncertaintyAtH)),
      confidenceMax: Math.min(100, Math.round(projHealth + uncertaintyAtH)),
    };
  });

  return {
    predictedComponent,
    endOfLifeCriterion,
    currentDegradationIndicator: currentIndicator,
    estimatedHours,
    confidenceInterval: [lowerBoundHours, upperBoundHours],
    confidenceLevel,
    degradationRatePerHour: Math.round(rate * 100) / 100,
    projectedCurve,
    baselineUsefulLife: 1500,
    consumedHours: Math.round(operatingHours * 10) / 10,
    dataSource,
    modelStatus,
    statusDisclaimer:
      'RUL is estimated from simulated degradation profiles and must not be interpreted as a validated operational life limit.',
  };
}
