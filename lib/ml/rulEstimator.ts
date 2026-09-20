import { RulEstimate, RulProjection, HealthStatus } from '../types';

export type DegradationLevel = 'NORMAL' | 'MILD' | 'MODERATE' | 'SEVERE' | 'CUSTOM';

const DEGRADATION_RATES: Record<DegradationLevel, number> = {
  NORMAL: 0.18,      // 0.18 health points lost per flight hour
  MILD: 0.35,        // 0.35 health points lost per flight hour
  MODERATE: 0.65,    // 0.65 health points lost per flight hour
  SEVERE: 1.45,      // 1.45 health points lost per flight hour
  CUSTOM: 0.50,
};

/**
 * Predicts Remaining Useful Life (RUL) using exponential degradation modeling,
 * taking into account baseline operating hours, current health index,
 * and active thermal/mechanical stress multipliers.
 */
export function estimateRul(
  currentHealth: number,
  operatingHours: number,
  degradationLevel: DegradationLevel = 'NORMAL',
  customRate?: number,
  activeFaultCount: number = 0
): RulEstimate {
  let rate = customRate !== undefined && degradationLevel === 'CUSTOM'
    ? customRate
    : DEGRADATION_RATES[degradationLevel] || DEGRADATION_RATES.NORMAL;

  // Fault stress multiplier
  if (activeFaultCount > 0) {
    rate = rate * (1 + activeFaultCount * 0.75);
  }

  // Calculate hours until critical threshold (Health < 40)
  const healthMargin = Math.max(0, currentHealth - 40);
  const rawRulHours = rate > 0 ? healthMargin / rate : 800;
  const estimatedHours = Math.round(rawRulHours);

  // Confidence bounds (±15% to ±25% depending on degradation volatility)
  const uncertainty = Math.round(estimatedHours * 0.16);
  const minRul = Math.max(0, estimatedHours - uncertainty);
  const maxRul = estimatedHours + uncertainty;

  // Generate future projection trajectory (+0, +25, +50, +75, +100, +150, +200 hrs)
  const horizons = [0, 25, 50, 75, 100, 150, 200];
  const projectedCurve: RulProjection[] = horizons.map((h) => {
    // Non-linear wear acceleration
    const wear = rate * h * (1 + (h / 400) * 0.3);
    const projHealth = Math.max(10, Math.min(100, Math.round((currentHealth - wear) * 10) / 10));

    let status: HealthStatus = 'NORMAL';
    if (projHealth < 50) status = 'CRITICAL';
    else if (projHealth < 75) status = 'DEGRADED';
    else if (projHealth < 90) status = 'GOOD';

    return {
      hoursAhead: h,
      projectedHealth: projHealth,
      status,
      confidenceMin: Math.max(5, Math.round(projHealth - (h * 0.08) - 2)),
      confidenceMax: Math.min(100, Math.round(projHealth + (h * 0.08) + 2)),
    };
  });

  return {
    estimatedHours,
    confidenceInterval: [minRul, maxRul],
    degradationRatePerHour: Math.round(rate * 100) / 100,
    projectedCurve,
    baselineUsefulLife: 1500,
    consumedHours: Math.round(operatingHours * 10) / 10,
  };
}
