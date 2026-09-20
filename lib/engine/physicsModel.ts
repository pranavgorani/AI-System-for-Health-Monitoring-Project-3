import { FlightState, EngineTelemetry, ActiveFaultInjection } from '../types';

export interface EngineCoefficients {
  bsfc: number;                 // Brake Specific Fuel Consumption (L / kW-h approx)
  coolingEfficiency: number;    // Heat transfer multiplier
  frictionFactor: number;       // Mechanical friction coefficient
  baselineVibration: number;    // Nominal baseline vibration RMS (mm/s)
  ambientTempC: number;         // Ambient air temp
  ambientPressureHpa: number;   // Ambient barometric pressure
  altitudeFt: number;           // Flight altitude in feet
}

export const DEFAULT_COEFFICIENTS: EngineCoefficients = {
  bsfc: 0.285,
  coolingEfficiency: 1.0,
  frictionFactor: 0.08,
  baselineVibration: 2.1,
  ambientTempC: 22,
  ambientPressureHpa: 1013,
  altitudeFt: 6500,
};

// Target parameters per flight state
interface StateTarget {
  rpm: number;
  throttle: number;
  baseFuelFlow: number;
}

const STATE_TARGETS: Record<FlightState, StateTarget> = {
  IDLE: { rpm: 1650, throttle: 12, baseFuelFlow: 7.2 },
  TAXI: { rpm: 2150, throttle: 22, baseFuelFlow: 9.8 },
  TAKEOFF: { rpm: 5650, throttle: 100, baseFuelFlow: 30.5 },
  CLIMB: { rpm: 5150, throttle: 85, baseFuelFlow: 25.8 },
  CRUISE: { rpm: 4650, throttle: 65, baseFuelFlow: 19.2 },
  HIGH_LOAD: { rpm: 5500, throttle: 95, baseFuelFlow: 29.0 },
  DESCENT: { rpm: 3200, throttle: 35, baseFuelFlow: 12.0 },
  LANDING: { rpm: 2450, throttle: 25, baseFuelFlow: 10.2 },
  SHUTDOWN: { rpm: 0, throttle: 0, baseFuelFlow: 0.0 },
};

/**
 * Deterministic physics-inspired aero piston engine simulator
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

  // Electrical: Alternator 28.2V nominal, load increases current
  let batteryVoltage = rpm > 1500 ? 28.2 + (Math.sin(tickCount * 0.3) * 0.2) : 24.6;
  batteryVoltage = Math.round(batteryVoltage * 10) / 10;
  
  let alternatorCurrent = rpm > 1500 ? 24 + (engineLoad * 0.18) : 4.5;
  alternatorCurrent = Math.round(alternatorCurrent * 10) / 10;

  // Fuel remaining calculation
  const prevFuel = previous ? previous.fuel_level : 120.0; // 120 Liters full tank
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
  if (activeFault.type === 'MISFIRE') {
    // Single cylinder misfire (Cyl 3 drops EGT, severe vibration harmonic)
    egt_3 = Math.max(250, egt_3 - 220);
    vibration += 4.2;
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
  } else if (activeFault.type === 'ELECTRICAL_FAULT') {
    // Alternator failure / battery draining
    batteryVoltage = 21.8;
    alternatorCurrent = 2.0;
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
    injection_timing: injectionTiming,
    battery_voltage: batteryVoltage,
    alternator_current: alternatorCurrent,
    altitude: Math.round(coeffs.altitudeFt),
    ambient_temperature: Math.round(effectiveAmbientTemp * 10) / 10,
    ambient_pressure: Math.round(effectiveAmbientPressure),
    efficiency: Math.max(0, efficiency),
  };
}
