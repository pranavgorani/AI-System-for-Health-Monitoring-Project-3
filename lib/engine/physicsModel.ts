import {
  FlightState,
  EngineTelemetry,
  ActiveFaultInjection,
  PhysicsModelOutput,
  ModelValidityRegion,
  ParameterResidual,
} from '../types';

export interface EngineCoefficients {
  bsfc: number;                 // Brake Specific Fuel Consumption (L / kW-h approx)
  coolingEfficiency: number;    // Heat transfer multiplier
  frictionFactor: number;       // Mechanical friction coefficient
  baselineVibration: number;    // Nominal baseline vibration RMS (mm/s)
  ambientTempC: number;         // Ambient air temp
  ambientPressureHpa: number;   // Ambient barometric pressure
  altitudeFt: number;           // Flight altitude in feet
  displacementLiters: number;   // 1.352L (Rotax 914 / 915 equivalent)
  compressionRatio: number;     // 9.0:1
}

export const DEFAULT_COEFFICIENTS: EngineCoefficients = {
  bsfc: 0.285,
  coolingEfficiency: 1.0,
  frictionFactor: 0.08,
  baselineVibration: 2.1,
  ambientTempC: 22,
  ambientPressureHpa: 1013,
  altitudeFt: 6500,
  displacementLiters: 1.352,
  compressionRatio: 9.0,
};

interface StateTarget {
  rpm: number;
  throttle: number;
  baseFuelFlow: number;
  manifoldPressure: number; // hPa
}

const STATE_TARGETS: Record<FlightState, StateTarget> = {
  IDLE: { rpm: 1650, throttle: 12, baseFuelFlow: 7.2, manifoldPressure: 720 },
  TAXI: { rpm: 2150, throttle: 22, baseFuelFlow: 9.8, manifoldPressure: 810 },
  TAKEOFF: { rpm: 5650, throttle: 100, baseFuelFlow: 30.5, manifoldPressure: 1350 }, // Turbo boost
  CLIMB: { rpm: 5150, throttle: 85, baseFuelFlow: 25.8, manifoldPressure: 1200 },
  CRUISE: { rpm: 4650, throttle: 65, baseFuelFlow: 19.2, manifoldPressure: 1020 },
  HIGH_LOAD: { rpm: 5500, throttle: 95, baseFuelFlow: 29.0, manifoldPressure: 1320 },
  DESCENT: { rpm: 3200, throttle: 35, baseFuelFlow: 12.0, manifoldPressure: 860 },
  LANDING: { rpm: 2450, throttle: 25, baseFuelFlow: 10.2, manifoldPressure: 830 },
  SHUTDOWN: { rpm: 0, throttle: 0, baseFuelFlow: 0.0, manifoldPressure: 1013 },
};

// Nominal channel standard deviations for residual normalization
const CHANNEL_SIGMAS: Record<string, number> = {
  egt: 22.0,      // °C
  cht: 7.5,       // °C
  oil_pressure: 0.35, // bar
  oil_temperature: 5.0, // °C
  fuel_flow: 1.8, // L/h
  vibration_rms: 0.45, // mm/s
  efficiency: 2.5, // %
};

/**
 * Evaluates whether current flight conditions fall within the calibrated grey-box envelope
 */
export function checkModelValidity(
  altitudeFt: number,
  ambientTempC: number,
  rpm: number
): { region: ModelValidityRegion; message?: string; confidence: number } {
  if (rpm > 6000 || altitudeFt > 26000 || ambientTempC < -45 || ambientTempC > 58) {
    return {
      region: 'OUT_OF_DOMAIN_REGION',
      message: 'Prediction confidence reduced: operating condition outside calibrated model envelope.',
      confidence: 45,
    };
  }

  if (altitudeFt > 20000 || ambientTempC > 46 || ambientTempC < -30 || rpm > 5750) {
    return {
      region: 'EXTRAPOLATED_REGION',
      message: 'Prediction confidence reduced: operating in extrapolated model regime.',
      confidence: 72,
    };
  }

  return {
    region: 'VALID_OPERATING_REGION',
    confidence: 96,
  };
}

/**
 * Expected-value estimation based on aero-piston thermodynamics & ISA flight conditions
 */
export function estimateExpectedState(
  rpm: number,
  throttle: number,
  engineLoad: number,
  altitudeFt: number,
  ambientTempC: number,
  ambientPressureHpa: number,
  coeffs: EngineCoefficients = DEFAULT_COEFFICIENTS
) {
  const isRunning = rpm > 250;
  if (!isRunning) {
    return {
      egt_avg: ambientTempC,
      egt_1: ambientTempC,
      egt_2: ambientTempC,
      egt_3: ambientTempC,
      egt_4: ambientTempC,
      cht_avg: ambientTempC,
      cht_1: ambientTempC,
      cht_2: ambientTempC,
      cht_3: ambientTempC,
      cht_4: ambientTempC,
      oil_pressure: 0.0,
      oil_temperature: ambientTempC,
      fuel_flow: 0.0,
      vibration_rms: 0.05,
      efficiency: 0.0,
    };
  }

  // 1. Expected Air Density Ratio (sigma_air) via ISA Lapse Rate
  const expectedAmbientTemp = coeffs.ambientTempC - (altitudeFt / 1000) * 1.98;
  const expectedAmbientPressure = coeffs.ambientPressureHpa * Math.exp(-altitudeFt / 27000);
  const densityRatio = (expectedAmbientPressure / 1013.25) * ((288.15) / (expectedAmbientTemp + 273.15));

  // 2. Expected Fuel Flow (L/h): Load x BSFC x Density Factor
  const expectedFuelFlow = Math.max(
    5.0,
    Math.round(((7.0 + (engineLoad / 100) * 22.5) * Math.max(0.75, Math.min(1.2, densityRatio))) * 10) / 10
  );

  // 3. Expected EGT: ~620°C baseline + (load * 2.1)
  const expectedEgtAvg = Math.round(625 + (engineLoad * 2.12) - (expectedAmbientTemp * 0.15));

  // 4. Expected CHT: ~92°C baseline + (load * 0.52) - airspeed cooling effect
  const airspeedCooling = (throttle > 50 && altitudeFt > 2000) ? 9 : 3;
  const expectedChtAvg = Math.round(
    90 + (engineLoad * 0.52) + (expectedAmbientTemp * 0.28) - (airspeedCooling * coeffs.coolingEfficiency)
  );

  // 5. Expected Oil Pressure: correlates with RPM, tempered by thermal viscosity loss
  const expectedOilPressure = Math.round(
    Math.max(1.8, 2.2 + (rpm / 5800) * 2.8 - (Math.max(0, expectedChtAvg - 110) * 0.007)) * 100
  ) / 100;

  // 6. Expected Oil Temperature: nominal 85 - 105°C
  const expectedOilTemp = Math.round(
    65 + (engineLoad * 0.46) + (coeffs.frictionFactor * 150)
  );

  // 7. Expected Vibration Baseline: baseline + harmonic
  const expectedVibration = Math.round(
    (coeffs.baselineVibration + (rpm / 5800) * 1.5) * 100
  ) / 100;

  // 8. Expected Efficiency
  const expectedEfficiency = Math.round(
    Math.max(20, Math.min(36, 34.0 - ((engineLoad - 70) * 0.07) - (coeffs.frictionFactor * 30))) * 10
  ) / 10;

  return {
    egt_avg: expectedEgtAvg,
    egt_1: expectedEgtAvg + 2,
    egt_2: expectedEgtAvg - 2,
    egt_3: expectedEgtAvg + 1,
    egt_4: expectedEgtAvg - 1,
    cht_avg: expectedChtAvg,
    cht_1: expectedChtAvg + 1.2,
    cht_2: expectedChtAvg - 0.8,
    cht_3: expectedChtAvg + 0.5,
    cht_4: expectedChtAvg - 0.7,
    oil_pressure: expectedOilPressure,
    oil_temperature: expectedOilTemp,
    fuel_flow: expectedFuelFlow,
    vibration_rms: expectedVibration,
    efficiency: expectedEfficiency,
  };
}

/**
 * Calculates physical residuals and normalized deviations for explainable AI
 */
export function calculatePhysicsResiduals(
  telemetry: EngineTelemetry,
  coeffs: EngineCoefficients = DEFAULT_COEFFICIENTS
): PhysicsModelOutput {
  const validity = checkModelValidity(telemetry.altitude, telemetry.ambient_temperature, telemetry.rpm);
  const expected = estimateExpectedState(
    telemetry.rpm,
    telemetry.throttle,
    telemetry.engine_load,
    telemetry.altitude,
    telemetry.ambient_temperature,
    telemetry.ambient_pressure,
    coeffs
  );

  const residualSpecs = [
    { key: 'egt_3', label: 'Cylinder 3 EGT', actual: telemetry.egt_3, exp: expected.egt_3, unit: '°C', sigma: CHANNEL_SIGMAS.egt },
    { key: 'egt_avg', label: 'Average EGT', actual: telemetry.egt_avg, exp: expected.egt_avg, unit: '°C', sigma: CHANNEL_SIGMAS.egt },
    { key: 'cht_3', label: 'Cylinder 3 CHT', actual: telemetry.cht_3, exp: expected.cht_3, unit: '°C', sigma: CHANNEL_SIGMAS.cht },
    { key: 'cht_avg', label: 'Average CHT', actual: telemetry.cht_avg, exp: expected.cht_avg, unit: '°C', sigma: CHANNEL_SIGMAS.cht },
    { key: 'fuel_flow', label: 'Fuel Flow Rate', actual: telemetry.fuel_flow, exp: expected.fuel_flow, unit: 'L/h', sigma: CHANNEL_SIGMAS.fuel_flow },
    { key: 'oil_pressure', label: 'Engine Oil Pressure', actual: telemetry.oil_pressure, exp: expected.oil_pressure, unit: 'bar', sigma: CHANNEL_SIGMAS.oil_pressure },
    { key: 'oil_temperature', label: 'Engine Oil Temp', actual: telemetry.oil_temperature, exp: expected.oil_temperature, unit: '°C', sigma: CHANNEL_SIGMAS.oil_temperature },
    { key: 'vibration_rms', label: 'Vibration RMS', actual: telemetry.vibration_rms, exp: expected.vibration_rms, unit: 'mm/s', sigma: CHANNEL_SIGMAS.vibration_rms },
    { key: 'efficiency', label: 'Engine Efficiency', actual: telemetry.efficiency, exp: expected.efficiency, unit: '%', sigma: CHANNEL_SIGMAS.efficiency },
  ];

  const residuals: ParameterResidual[] = residualSpecs.map((s) => {
    const rawRes = Math.round((s.actual - s.exp) * 100) / 100;
    const normRes = Math.round((rawRes / s.sigma) * 100) / 100;
    const isDiverging = Math.abs(normRes) > 1.8;

    return {
      parameter: s.key,
      label: s.label,
      actual: s.actual,
      expected: s.exp,
      residual: rawRes,
      normalizedResidual: normRes,
      unit: s.unit,
      trend: isDiverging ? 'DIVERGING' : 'STABLE',
      modelConfidence: validity.confidence,
      modelValidity: validity.region,
    };
  });

  return {
    validityRegion: validity.region,
    validityMessage: validity.message,
    modelConfidence: validity.confidence,
    expectedValues: expected,
    residuals,
  };
}

/**
 * Deterministic physics-inspired aero piston engine simulator with forward state progression
 */
export function calculateNextTelemetry(
  previous: EngineTelemetry | null,
  state: FlightState,
  coeffs: EngineCoefficients = DEFAULT_COEFFICIENTS,
  activeFault: ActiveFaultInjection = { type: 'NONE', subsystem: 'none', severity: 0, startedAt: '', notes: '' },
  tickCount: number = 0
): EngineTelemetry {
  const target = STATE_TARGETS[state] || STATE_TARGETS.CRUISE;
  
  // Smooth transition / inertia (85% previous, 15% target)
  const prevRpm = previous ? previous.rpm : target.rpm;
  const prevThrottle = previous ? previous.throttle : target.throttle;
  
  const rpm = Math.round(prevRpm * 0.85 + target.rpm * 0.15 + (Math.sin(tickCount * 0.4) * 15));
  const throttle = Math.round((prevThrottle * 0.85 + target.throttle * 0.15) * 10) / 10;
  
  // Engine Load: proportional to Throttle x (RPM / 5800)
  let engineLoad = Math.min(100, Math.max(0, (throttle * 0.6) + ((rpm / 5800) * 40)));
  engineLoad = Math.round(engineLoad * 10) / 10;

  // Manifold Pressure (boost): target manifold pressure with slight dynamic ripple
  let manifoldPressure = target.manifoldPressure + Math.round(Math.sin(tickCount * 0.2) * 12);

  // Altitude lapse rate (ambient temp drops ~1.98°C per 1000 ft)
  const effectiveAmbientTemp = coeffs.ambientTempC - (coeffs.altitudeFt / 1000) * 1.98;
  const effectiveAmbientPressure = coeffs.ambientPressureHpa * Math.exp(-coeffs.altitudeFt / 27000);

  // Fuel Flow (L/h): Load-dependent + BSFC
  let fuelFlow = (target.baseFuelFlow * (engineLoad / 100) * (rpm > 200 ? 1 : 0)) + 
    (Math.cos(tickCount * 0.3) * 0.3);
  fuelFlow = Math.max(0, Math.round(fuelFlow * 10) / 10);

  // EGT (°C): ~600°C at idle up to 840°C at high load
  const baseEgt = rpm > 200 
    ? 620 + (engineLoad * 2.2) - (effectiveAmbientTemp * 0.2) + (Math.sin(tickCount * 0.5) * 4)
    : effectiveAmbientTemp;

  // CHT (°C): ~95°C at idle up to 145°C at high load; cooled by airspeed
  const airspeedCooling = (state === 'CRUISE' || state === 'DESCENT') ? 8 : 0;
  const baseCht = rpm > 200 
    ? 90 + (engineLoad * 0.55) + (effectiveAmbientTemp * 0.3) - (airspeedCooling * coeffs.coolingEfficiency) + (Math.cos(tickCount * 0.2) * 2)
    : effectiveAmbientTemp;

  // Cylinders individual variation (small physics jitter)
  let egt_1 = Math.round(baseEgt + 3 + Math.sin(tickCount * 0.1) * 3);
  let egt_2 = Math.round(baseEgt - 2 + Math.cos(tickCount * 0.15) * 3);
  let egt_3 = Math.round(baseEgt + 1 + Math.sin(tickCount * 0.2) * 2);
  let egt_4 = Math.round(baseEgt - 1 + Math.cos(tickCount * 0.25) * 3);

  let cht_1 = Math.round((baseCht + 1.5) * 10) / 10;
  let cht_2 = Math.round((baseCht - 1.0) * 10) / 10;
  let cht_3 = Math.round((baseCht + 0.5) * 10) / 10;
  let cht_4 = Math.round((baseCht - 0.8) * 10) / 10;

  // Oil Pressure: correlates with RPM, decreases when oil temp gets too hot
  let oilPressure = rpm > 200 
    ? 2.2 + (rpm / 5800) * 2.8 - (Math.max(0, baseCht - 110) * 0.008)
    : 0.1;
  oilPressure = Math.max(0.2, Math.round(oilPressure * 100) / 100);

  // Oil Temperature: correlates with load, friction, and previous heat
  let oilTemp = rpm > 200 
    ? 65 + (engineLoad * 0.48) + (coeffs.frictionFactor * 150) + (Math.sin(tickCount * 0.1) * 1.5)
    : effectiveAmbientTemp;
  oilTemp = Math.round(oilTemp * 10) / 10;

  // Vibration RMS (mm/s): baseline ~2.1 mm/s + RPM harmonic
  let vibration = rpm > 200 
    ? coeffs.baselineVibration + ((rpm / 5800) * 1.6) + (Math.abs(Math.sin(tickCount * 0.7)) * 0.4)
    : 0.1;
  vibration = Math.round(vibration * 100) / 100;
  let vibrationPeak = Math.round((vibration * 1.414 + 0.2) * 100) / 100;

  // Electrical: Alternator 28.2V nominal, load increases current
  let batteryVoltage = rpm > 1500 ? 28.2 + (Math.sin(tickCount * 0.3) * 0.2) : 24.6;
  batteryVoltage = Math.round(batteryVoltage * 10) / 10;
  
  let alternatorCurrent = rpm > 1500 ? 24 + (engineLoad * 0.18) : 4.5;
  alternatorCurrent = Math.round(alternatorCurrent * 10) / 10;

  // Fuel remaining calculation
  const prevFuel = previous ? previous.fuel_level : 120.0;
  const fuelBurnPerSec = (fuelFlow / 3600);
  const fuelLevel = Math.max(0, Math.round((prevFuel - fuelBurnPerSec) * 100) / 100);

  // Operating Hours
  const prevHours = previous ? previous.engine_hours : 142.5;
  const engineHours = Math.round((prevHours + (rpm > 200 ? 1 / 3600 : 0)) * 1000) / 1000;

  // Injection timing: 24 degrees BTDC nominal
  const injectionTiming = rpm > 200 ? Math.round((22 + (rpm / 5800) * 4) * 10) / 10 : 0;

  // Efficiency: power delivered vs fuel energy
  let efficiency = rpm > 200 
    ? Math.min(38.5, Math.max(22.0, 34.0 - ((engineLoad - 70) * 0.08) - (coeffs.frictionFactor * 30)))
    : 0;
  efficiency = Math.round(efficiency * 10) / 10;

  // ==========================================
  // APPLY FAULT INJECTIONS (PHYSICS MODIFICATIONS)
  // ==========================================
  if (activeFault.type === 'GRADUAL_INJECTOR_DEGRADATION') {
    // Primary Demo Scenario: Cylinder 3 injector nozzle restriction / partial clogging
    // Progression ramp:
    // - Fuel flow increases gradually (+8% due to FADEC rich compensation)
    // - Cylinder 3 EGT gradually deviates (+46°C above peer average)
    // - Cylinder 3 CHT increases (+12°C)
    // - Vibration RMS increases (+14% due to single-cylinder torque imbalance)
    // - Engine efficiency drops by ~7 points
    const ramp = Math.min(1.0, (activeFault.severity || 0.85));
    egt_3 += Math.round(46 * ramp);
    cht_3 += Math.round(12 * ramp);
    fuelFlow = Math.round((fuelFlow * (1 + 0.08 * ramp)) * 10) / 10;
    vibration = Math.round((vibration * (1 + 0.14 * ramp)) * 100) / 100;
    vibrationPeak = Math.round((vibration * 1.5) * 100) / 100;
    efficiency = Math.max(16, Math.round((efficiency - 7.0 * ramp) * 10) / 10);
  } else if (activeFault.type === 'MISFIRE') {
    // Single cylinder misfire (Cyl 3 drops EGT, severe vibration harmonic)
    egt_3 = Math.max(250, egt_3 - 220);
    vibration += 4.2;
    vibrationPeak += 6.5;
    efficiency = Math.max(14, efficiency - 9);
    engineLoad = Math.max(10, engineLoad - 8);
  } else if (activeFault.type === 'INJECTOR_ABNORMALITY') {
    // Lean mixture in Cyl 1 causes elevated EGT and rough combustion
    egt_1 += 78;
    fuelFlow = Math.max(0, fuelFlow - 3.2);
    vibration += 1.8;
  } else if (activeFault.type === 'COMBUSTION_DEGRADATION') {
    // Generalized thermal loss
    egt_1 += 45;
    egt_2 += 48;
    egt_3 += 52;
    egt_4 += 44;
    efficiency -= 6.5;
  } else if (activeFault.type === 'LUBRICATION_ISSUE') {
    // Loss of oil pressure and high bearing friction
    oilPressure = Math.max(0.8, oilPressure - 2.4);
    oilTemp += 34;
    vibration += 1.9;
  } else if (activeFault.type === 'SENSOR_DRIFT') {
    // Gradual +1°C/min on CHT 2 and EGT 2
    const driftOffset = Math.min(60, tickCount * 0.8);
    cht_2 += driftOffset;
    egt_2 += driftOffset * 1.5;
  } else if (activeFault.type === 'SENSOR_FAILURE') {
    // Oil pressure sensor dropout / pegged to zero
    oilPressure = 0.0;
  } else if (activeFault.type === 'FROZEN_SENSOR') {
    // Sensor output stuck
    oilPressure = 3.8;
  } else if (activeFault.type === 'COMBUSTION_INSTABILITY') {
    // Cyclic hunting / surging
    const oscillation = Math.sin(tickCount * 1.8) * 65;
    egt_1 += oscillation;
    egt_3 -= oscillation;
    vibration += 2.4;
  } else if (activeFault.type === 'OVERHEATING') {
    // Cooling breakdown: CHT & EGT spike
    cht_1 += 38;
    cht_2 += 42;
    cht_3 += 39;
    cht_4 += 41;
    oilTemp += 26;
    egt_1 += 65;
    egt_2 += 70;
  } else if (activeFault.type === 'ABNORMAL_VIBRATION') {
    // Mechanical rotor/bearing defect
    vibration = 7.8 + Math.sin(tickCount * 2.2) * 1.1;
    vibrationPeak = 11.2;
  } else if (activeFault.type === 'ELECTRICAL_FAULT') {
    // Alternator failure / battery draining
    batteryVoltage = 21.8;
    alternatorCurrent = 2.0;
  } else if (activeFault.type === 'IGNITION_TIMING') {
    // Advanced/retarded timing causing combustion knock
    vibration += 2.8;
    egt_1 += 35;
    egt_2 += 38;
    efficiency -= 4.5;
  }

  // Averages
  const cht_avg = Math.round(((cht_1 + cht_2 + cht_3 + cht_4) / 4) * 10) / 10;
  const egt_avg = Math.round(((egt_1 + egt_2 + egt_3 + egt_4) / 4) * 10) / 10;

  return {
    timestamp: new Date().toISOString(),
    engine_id: previous?.engine_id || 'AEGIS-ENG-001',
    mission_id: previous?.mission_id || 'MSN-2026-09',
    flight_state: state,
    rpm,
    throttle,
    engine_load: engineLoad,
    engine_hours: engineHours,
    manifold_pressure: manifoldPressure,
    load_estimate: Math.round(engineLoad * 0.95),
    cht_1,
    cht_2,
    cht_3,
    cht_4,
    cht_avg,
    egt_1,
    egt_2,
    egt_3,
    egt_4,
    egt_avg,
    oil_pressure: Math.round(oilPressure * 100) / 100,
    oil_temperature: Math.round(oilTemp * 10) / 10,
    fuel_flow: Math.round(fuelFlow * 10) / 10,
    fuel_level: Math.round(fuelLevel * 10) / 10,
    vibration_rms: Math.round(vibration * 100) / 100,
    vibration_peak: Math.round(vibrationPeak * 100) / 100,
    injection_timing: injectionTiming,
    battery_voltage: batteryVoltage,
    alternator_current: alternatorCurrent,
    altitude: Math.round(coeffs.altitudeFt),
    ambient_temperature: Math.round(effectiveAmbientTemp * 10) / 10,
    ambient_pressure: Math.round(effectiveAmbientPressure),
    efficiency: Math.max(0, efficiency),
    can_frame_id: '0x18FEE400',
    signal_quality: 98,
    missing_data_flag: activeFault.type === 'CAN_DROPOUT',
    validation_status: 'VALID',
    source_type: 'SIMULATED',
    dataset_version: 'v2.4-aero-piston',
    model_version: 'v1.2-greybox-hybrid',
  };
}
