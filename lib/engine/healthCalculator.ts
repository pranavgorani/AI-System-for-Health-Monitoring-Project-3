import { EngineTelemetry, SubsystemHealth, HealthStatus } from '../types';

export interface HealthWeights {
  combustion: number;
  fuel_system: number;
  lubrication: number;
  cooling: number;
  exhaust: number;
  crankshaft: number;
  propeller: number;
  electrical: number;
  sensors: number;
}

export const DEFAULT_HEALTH_WEIGHTS: HealthWeights = {
  combustion: 0.20,
  fuel_system: 0.12,
  lubrication: 0.18,
  cooling: 0.14,
  exhaust: 0.10,
  crankshaft: 0.12,
  propeller: 0.05,
  electrical: 0.05,
  sensors: 0.04,
};

/**
 * Calculates subsystem health based on physical operating limits,
 * temperature spreads, pressure deviations, and vibration signatures.
 */
export function calculateSubsystemHealth(
  t: EngineTelemetry,
  weights: HealthWeights = DEFAULT_HEALTH_WEIGHTS
): SubsystemHealth {
  // 1. Combustion Health: based on CHT/EGT balance, efficiency, and individual cylinder delta
  const egtSpread = Math.max(t.egt_1, t.egt_2, t.egt_3, t.egt_4) - Math.min(t.egt_1, t.egt_2, t.egt_3, t.egt_4);
  let combustion = 100;
  if (egtSpread > 45) combustion -= (egtSpread - 45) * 0.8;
  if (t.egt_avg > 820) combustion -= (t.egt_avg - 820) * 1.5;
  if (t.efficiency < 28) combustion -= (28 - t.efficiency) * 2.2;
  combustion = Math.max(10, Math.min(100, Math.round(combustion)));

  // 2. Fuel System Health: fuel flow expected vs actual, pressure delivery
  let fuel_system = 100;
  if (t.fuel_flow > 33) fuel_system -= (t.fuel_flow - 33) * 5;
  if (t.flight_state === 'CRUISE' && t.fuel_flow > 24) fuel_system -= 18;
  if (egtSpread > 60) fuel_system -= 20; // injector blockage sign
  fuel_system = Math.max(15, Math.min(100, Math.round(fuel_system)));

  // 3. Lubrication Health: Oil pressure (nominal 2.5 - 5.0 bar) and Oil temp (nominal 75 - 110 °C)
  let lubrication = 100;
  if (t.oil_pressure < 2.0) {
    lubrication -= (2.0 - t.oil_pressure) * 45;
  } else if (t.oil_pressure > 5.5) {
    lubrication -= (t.oil_pressure - 5.5) * 20;
  }
  if (t.oil_temperature > 115) {
    lubrication -= (t.oil_temperature - 115) * 2.2;
  }
  lubrication = Math.max(8, Math.min(100, Math.round(lubrication)));

  // 4. Cooling Health: CHT margins (nominal < 135 °C, max 150 °C)
  let cooling = 100;
  if (t.cht_avg > 135) {
    cooling -= (t.cht_avg - 135) * 2.5;
  }
  const chtSpread = Math.max(t.cht_1, t.cht_2, t.cht_3, t.cht_4) - Math.min(t.cht_1, t.cht_2, t.cht_3, t.cht_4);
  if (chtSpread > 18) cooling -= (chtSpread - 18) * 1.5;
  cooling = Math.max(10, Math.min(100, Math.round(cooling)));

  // 5. Exhaust Health: EGT temperatures (< 850 °C safe)
  let exhaust = 100;
  if (t.egt_avg > 800) {
    exhaust -= (t.egt_avg - 800) * 1.2;
  }
  exhaust = Math.max(15, Math.min(100, Math.round(exhaust)));

  // 6. Crankshaft / Bearing Health: Vibration RMS (< 4.5 mm/s normal)
  let crankshaft = 100;
  if (t.vibration_rms > 4.5) {
    crankshaft -= (t.vibration_rms - 4.5) * 16;
  }
  crankshaft = Math.max(12, Math.min(100, Math.round(crankshaft)));

  // 7. Propeller Interface Health: RPM harmonic stability
  let propeller = 100;
  if (t.vibration_rms > 5.2 && t.rpm > 4500) {
    propeller -= (t.vibration_rms - 5.2) * 12;
  }
  propeller = Math.max(20, Math.min(100, Math.round(propeller)));

  // 8. Electrical Health: Bus voltage (26 - 29 V nominal) and alternator load
  let electrical = 100;
  if (t.battery_voltage < 24.5) {
    electrical -= (24.5 - t.battery_voltage) * 25;
  } else if (t.battery_voltage > 29.5) {
    electrical -= (t.battery_voltage - 29.5) * 30;
  }
  if (t.alternator_current > 55) {
    electrical -= (t.alternator_current - 55) * 2;
  }
  electrical = Math.max(10, Math.min(100, Math.round(electrical)));

  // 9. Sensor Health: Consistency check across channels
  let sensors = 100;
  if (t.oil_pressure === 0 && t.rpm > 1000) {
    sensors = 35; // likely sensor disconnect
  }
  if (isNaN(t.cht_avg) || isNaN(t.egt_avg)) {
    sensors = 20;
  }
  sensors = Math.max(10, Math.min(100, Math.round(sensors)));

  // Overall Weighted Engine Health
  const overall = Math.round(
    combustion * weights.combustion +
    fuel_system * weights.fuel_system +
    lubrication * weights.lubrication +
    cooling * weights.cooling +
    exhaust * weights.exhaust +
    crankshaft * weights.crankshaft +
    propeller * weights.propeller +
    electrical * weights.electrical +
    sensors * weights.sensors
  );

  let status: HealthStatus = 'NORMAL';
  if (overall < 50) {
    status = 'CRITICAL';
  } else if (overall < 75) {
    status = 'DEGRADED';
  } else if (overall < 90) {
    status = 'GOOD';
  }

  return {
    overall,
    combustion,
    fuel_system,
    lubrication,
    cooling,
    exhaust,
    crankshaft,
    propeller,
    electrical,
    sensors,
    status,
    confidence: 96,
  };
}
