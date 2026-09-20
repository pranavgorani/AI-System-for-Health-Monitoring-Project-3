import {
  EngineTelemetry,
  SubsystemHealth,
  HealthStatus,
  SensorQualityReport,
} from '../types';

export interface HealthWeights {
  combustion: number;   // 0.22
  thermal: number;      // 0.18
  lubrication: number;  // 0.18
  vibration: number;    // 0.16
  fuel_system: number;  // 0.12
  electrical: number;   // 0.08
  sensors: number;      // 0.06
}

export const DOCUMENTED_HEALTH_WEIGHTS: HealthWeights = {
  combustion: 0.22,
  thermal: 0.18,
  lubrication: 0.18,
  vibration: 0.16,
  fuel_system: 0.12,
  electrical: 0.08,
  sensors: 0.06,
};

/**
 * Calculates physics-informed subsystem health and weighted overall degradation index.
 * Formula: overallHealth = 100 - sum(weighted degradation penalties)
 */
export function calculateSubsystemHealth(
  t: EngineTelemetry,
  sensorReport?: SensorQualityReport,
  weights: HealthWeights = DOCUMENTED_HEALTH_WEIGHTS
): SubsystemHealth {
  const contributions: Record<string, number> = {};

  // 1. COMBUSTION HEALTH (Weight: 22%)
  // Based on EGT cylinder-to-cylinder spread, peak EGT margin, and thermal-mechanical efficiency
  const egtSpread = Math.max(t.egt_1, t.egt_2, t.egt_3, t.egt_4) - Math.min(t.egt_1, t.egt_2, t.egt_3, t.egt_4);
  let combustionPenalty = 0;
  if (egtSpread > 38) combustionPenalty += (egtSpread - 38) * 0.75;
  if (t.egt_avg > 820) combustionPenalty += (t.egt_avg - 820) * 1.6;
  if (t.efficiency < 28 && t.flight_state === 'CRUISE') combustionPenalty += (28 - t.efficiency) * 2.5;
  const combustion = Math.max(10, Math.min(100, Math.round(100 - combustionPenalty)));
  contributions['Combustion Imbalance / Inefficiency'] = Math.round(combustionPenalty * weights.combustion * 10) / 10;

  // 2. THERMAL HEALTH (Cooling & Cylinder Heads) (Weight: 18%)
  // CHT nominal < 135°C, max 150°C; CHT spread across cylinders
  const chtSpread = Math.max(t.cht_1, t.cht_2, t.cht_3, t.cht_4) - Math.min(t.cht_1, t.cht_2, t.cht_3, t.cht_4);
  let thermalPenalty = 0;
  if (t.cht_avg > 135) thermalPenalty += (t.cht_avg - 135) * 2.8;
  if (chtSpread > 14) thermalPenalty += (chtSpread - 14) * 1.8;
  if (t.oil_temperature > 115) thermalPenalty += (t.oil_temperature - 115) * 1.4;
  const cooling = Math.max(10, Math.min(100, Math.round(100 - thermalPenalty)));
  contributions['Thermal Margin Degradation'] = Math.round(thermalPenalty * weights.thermal * 10) / 10;

  // 3. LUBRICATION HEALTH (Weight: 18%)
  // Hydraulic line pressure (nominal 2.5 - 5.0 bar) and oil temperature viscosity envelope
  let lubricationPenalty = 0;
  if (t.oil_pressure < 2.2 && t.rpm > 1500) {
    lubricationPenalty += (2.2 - t.oil_pressure) * 55;
  } else if (t.oil_pressure > 5.5) {
    lubricationPenalty += (t.oil_pressure - 5.5) * 25;
  }
  if (t.oil_temperature > 118) {
    lubricationPenalty += (t.oil_temperature - 118) * 2.4;
  }
  const lubrication = Math.max(8, Math.min(100, Math.round(100 - lubricationPenalty)));
  contributions['Lubrication Pressure / Thermal Penalty'] = Math.round(lubricationPenalty * weights.lubrication * 10) / 10;

  // 4. VIBRATION & CRANKSHAFT HEALTH (Weight: 16%)
  // Vibration RMS (< 4.5 mm/s normal) and peak harmonic energy
  let vibrationPenalty = 0;
  if (t.vibration_rms > 4.2) {
    vibrationPenalty += (t.vibration_rms - 4.2) * 18;
  }
  if (t.vibration_peak > 6.0) {
    vibrationPenalty += (t.vibration_peak - 6.0) * 8;
  }
  const crankshaft = Math.max(12, Math.min(100, Math.round(100 - vibrationPenalty)));
  contributions['Rotational Vibration Dynamics'] = Math.round(vibrationPenalty * weights.vibration * 10) / 10;

  // 5. FUEL SYSTEM HEALTH (Weight: 12%)
  // Expected vs actual fuel flow rate & injector disparity
  let fuelPenalty = 0;
  if (t.flight_state === 'CRUISE' && t.fuel_flow > 23.5) {
    fuelPenalty += (t.fuel_flow - 23.5) * 6.5;
  }
  if (egtSpread > 45) fuelPenalty += (egtSpread - 45) * 0.4;
  const fuel_system = Math.max(15, Math.min(100, Math.round(100 - fuelPenalty)));
  contributions['Fuel Delivery & BSFC Divergence'] = Math.round(fuelPenalty * weights.fuel_system * 10) / 10;

  // 6. ELECTRICAL HEALTH (Weight: 8%)
  // FADEC bus voltage (nominal 26.0 - 29.0 V) and alternator generation
  let electricalPenalty = 0;
  if (t.battery_voltage < 24.5) {
    electricalPenalty += (24.5 - t.battery_voltage) * 28;
  } else if (t.battery_voltage > 29.5) {
    electricalPenalty += (t.battery_voltage - 29.5) * 35;
  }
  if (t.alternator_current > 55) {
    electricalPenalty += (t.alternator_current - 55) * 2;
  }
  const electrical = Math.max(10, Math.min(100, Math.round(100 - electricalPenalty)));
  contributions['Electrical / FADEC Bus Deviation'] = Math.round(electricalPenalty * weights.electrical * 10) / 10;

  // 7. SENSOR / DATA HEALTH (Weight: 6%)
  // Driven by sensor validation quality report
  const sensorConfidence = sensorReport ? sensorReport.overallSensorConfidence : 96;
  const sensorPenalty = Math.max(0, 100 - sensorConfidence);
  const sensors = Math.max(10, Math.min(100, Math.round(100 - sensorPenalty)));
  contributions['Sensor Telemetry Quality Loss'] = Math.round(sensorPenalty * weights.sensors * 10) / 10;

  // Exhaust & Propeller legacy subsystem compatibility
  const exhaust = Math.max(15, Math.min(100, Math.round(100 - (t.egt_avg > 800 ? (t.egt_avg - 800) * 1.2 : 0))));
  const propeller = Math.max(20, Math.min(100, Math.round(100 - (t.vibration_rms > 5.0 ? (t.vibration_rms - 5.0) * 14 : 0))));

  // OVERALL WEIGHTED CALCULATION
  // Formula: overallHealth = 100 - sum(weighted penalties)
  const totalWeightedPenalty =
    combustionPenalty * weights.combustion +
    thermalPenalty * weights.thermal +
    lubricationPenalty * weights.lubrication +
    vibrationPenalty * weights.vibration +
    fuelPenalty * weights.fuel_system +
    electricalPenalty * weights.electrical +
    sensorPenalty * weights.sensors;

  const overall = Math.max(10, Math.min(100, Math.round(100 - totalWeightedPenalty)));

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
    confidence: sensorConfidence,
    contributions,
    disclaimer: 'Model-based research health index; not a certified aerospace flight-safety score.',
  };
}
