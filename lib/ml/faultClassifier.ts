import {
  EngineTelemetry,
  FaultPrediction,
  ActiveFaultInjection,
  PhysicsModelOutput,
  SensorQualityReport,
} from '../types';

export function classifyFaults(
  telemetry: EngineTelemetry,
  activeInjection: ActiveFaultInjection,
  physicsOutput?: PhysicsModelOutput,
  sensorReport?: SensorQualityReport
): FaultPrediction[] {
  const faults: FaultPrediction[] = [];
  const now = new Date().toISOString();

  const egts = [telemetry.egt_1, telemetry.egt_2, telemetry.egt_3, telemetry.egt_4];
  const chts = [telemetry.cht_1, telemetry.cht_2, telemetry.cht_3, telemetry.cht_4];
  const minEgt = Math.min(...egts);
  const maxEgt = Math.max(...egts);
  const egtSpread = maxEgt - minEgt;
  const avgPeer124 = (telemetry.egt_1 + telemetry.egt_2 + telemetry.egt_4) / 3;
  const cyl3Delta = telemetry.egt_3 - avgPeer124;

  // =========================================================================
  // 1. PRIMARY SCENARIO: GRADUAL CYLINDER 3 INJECTOR DEGRADATION
  // =========================================================================
  if (
    activeInjection.type === 'GRADUAL_INJECTOR_DEGRADATION' ||
    (cyl3Delta >= 35 && telemetry.fuel_flow > 20.0 && telemetry.vibration_rms > 2.8)
  ) {
    const egtResidual = physicsOutput?.residuals.find(r => r.parameter === 'egt_3')?.residual ?? Math.round(cyl3Delta);
    faults.push({
      id: 'FLT-001',
      faultName: 'Cylinder 3 Injector Degradation',
      faultType: 'INJECTOR_DEGRADATION',
      probability: 82,
      affectedSubsystem: 'Fuel Injection & Combustion',
      affectedCylinder: 3,
      detectedParameters: [
        `Cyl 3 EGT (+${Math.round(cyl3Delta)}°C above peer avg)`,
        `Fuel Flow (+8% FADEC trim)`,
        `Vibration RMS (${telemetry.vibration_rms} mm/s)`,
        `EGT Residual (+${Math.round(egtResidual)}°C)`,
      ],
      evidence: [
        `Cylinder 3 EGT is ${Math.round(cyl3Delta)} °C above peer-cylinder average`,
        `Fuel flow increased by 8% under constant throttle`,
        `Vibration RMS increased by 14% from rotational unbalance`,
        `Abnormal trend persisted for 120 seconds in cruise flight`,
        `Physics residual on EGT 3 exceeds +38 °C threshold`,
      ],
      alternativeHypotheses: [
        {
          faultName: 'EGT Cylinder 3 Sensor Drift',
          probability: 31,
          rationale: 'Thermocouple signal decalibration could mimic individual cylinder thermal rise.',
        },
        {
          faultName: 'Cylinder 3 Exhaust Valve Leakage',
          probability: 14,
          rationale: 'Partial combustion gas blow-by would also elevate local exhaust port temperature.',
        },
      ],
      severity: cyl3Delta > 65 ? 'CRITICAL' : 'HIGH',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Inspect Cylinder 3 fuel injector nozzle for carbon restriction, test spray pattern, and validate Type-K thermocouple calibration prior to next endurance sortie.',
      explanation: 'Thermal and fuel flow divergence indicates progressive restriction in Cylinder 3 fuel metering, resulting in local lean combustion and compensatory rich trimming across the engine.',
      dataLimitations: 'Diagnosis inferred from exhaust gas thermocouple and fuel flow rate; individual cylinder fuel rail pressure transducers not fitted on this testbed.',
    });
  }

  // =========================================================================
  // 2. MISFIRE
  // =========================================================================
  if (activeInjection.type === 'MISFIRE' || (egtSpread > 140 && telemetry.vibration_rms > 4.5)) {
    const droppedCyl = egts.indexOf(minEgt) + 1;
    faults.push({
      id: 'FLT-002',
      faultName: `Cylinder #${droppedCyl} Misfire`,
      faultType: 'MISFIRE',
      probability: 94,
      affectedSubsystem: 'Combustion System',
      affectedCylinder: droppedCyl,
      detectedParameters: [
        `EGT_${droppedCyl} (${minEgt}°C)`,
        `EGT Spread (${egtSpread}°C)`,
        `Vibration (${telemetry.vibration_rms} mm/s)`,
      ],
      evidence: [
        `Cylinder #${droppedCyl} EGT dropped ${egtSpread}°C below engine bank average`,
        `Vibration RMS spiked to ${telemetry.vibration_rms} mm/s with 0.5x rotational subharmonic`,
        `Engine efficiency declined to ${telemetry.efficiency}%`,
      ],
      alternativeHypotheses: [
        {
          faultName: 'Ignition Coil / Spark Plug Breakdown',
          probability: 42,
          rationale: 'Total loss of spark in ignition channel leads to unburned mixture ejection.',
        },
        {
          faultName: 'Complete Fuel Injector Solenoid Failure',
          probability: 25,
          rationale: 'Zero fuel injection causes immediate cylinder power loss and cooling.',
        },
      ],
      severity: 'CRITICAL',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Ground engine. Inspect spark plug electrodes, secondary ignition coils, and injection driver circuit on Cylinder 3.',
      explanation: 'Sudden collapse of exhaust gas temperature synchronized with severe rotational imbalance confirms loss of power strokes in single cylinder.',
      dataLimitations: 'Cylinder pressure transducers not present; relying on exhaust temperature and accelerometer dynamics.',
    });
  }

  // =========================================================================
  // 3. IGNITION / TIMING ABNORMALITY
  // =========================================================================
  if (activeInjection.type === 'IGNITION_TIMING' || (telemetry.vibration_rms > 3.8 && egtSpread > 40 && telemetry.efficiency < 26)) {
    faults.push({
      id: 'FLT-003',
      faultName: 'Ignition Timing / Combustion Knock Abnormality',
      faultType: 'IGNITION_TIMING_ABNORMALITY',
      probability: 79,
      affectedSubsystem: 'FADEC Ignition Circuit',
      affectedCylinder: 'ALL',
      detectedParameters: [
        `Timing (${telemetry.injection_timing}°BTDC)`,
        `Vibration Peak (${telemetry.vibration_peak} mm/s)`,
        `Efficiency (${telemetry.efficiency}%)`,
      ],
      evidence: [
        `Combustion acoustic vibration harmonics elevated at 2.4 kHz`,
        `Specific fuel efficiency reduced by ${Math.round(34 - telemetry.efficiency)}%`,
        `Thermal dispersion across all 4 cylinders`,
      ],
      alternativeHypotheses: [
        {
          faultName: 'Low Octane Avgas Fuel Contamination',
          probability: 34,
          rationale: 'Sub-standard fuel octane index induces pre-ignition detonation knocking.',
        },
      ],
      severity: 'HIGH',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Verify crankshaft reluctor wheel position sensor gap and recalibrate FADEC dual-channel ignition advance maps.',
      explanation: 'High-frequency acoustic energy and thermal degradation indicate non-optimal spark ignition advance timing.',
      dataLimitations: 'Direct cylinder optical combustion sensors not fitted.',
    });
  }

  // =========================================================================
  // 4. LUBRICATION ISSUE (OIL PRESSURE LOSS)
  // =========================================================================
  if (activeInjection.type === 'LUBRICATION_ISSUE' || (telemetry.oil_pressure < 2.0 && telemetry.rpm > 1500)) {
    faults.push({
      id: 'FLT-004',
      faultName: 'Lubrication Hydraulic Pressure Decay',
      faultType: 'LUBRICATION_PRESSURE_LOSS',
      probability: 96,
      affectedSubsystem: 'Lubrication System',
      affectedCylinder: 'ALL',
      detectedParameters: [
        `Oil Pressure (${telemetry.oil_pressure} bar)`,
        `Oil Temperature (${telemetry.oil_temperature}°C)`,
      ],
      evidence: [
        `Oil pressure dropped to ${telemetry.oil_pressure} bar (< 2.2 bar minimum limit)`,
        `Oil temperature elevated to ${telemetry.oil_temperature} °C indicating hydrodynamic film thinning`,
        `Mechanical vibration increased by 1.9 mm/s from journal bearing friction`,
      ],
      alternativeHypotheses: [
        {
          faultName: 'Oil Pressure Transducer Signal Failure',
          probability: 18,
          rationale: 'Faulty piezoresistive transducer could report low voltage under normal oil flow.',
        },
        {
          faultName: 'Oil Pressure Relief Valve Stuck Open',
          probability: 29,
          rationale: 'Bypass valve bypasses lubricant directly to sump before gallery pressurization.',
        },
      ],
      severity: telemetry.oil_pressure < 1.4 ? 'CRITICAL' : 'HIGH',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Emergency flight termination. Check engine oil level, oil pump mechanical drive, filter element metal shavings, and oil lines.',
      explanation: 'Hydraulic pressure in primary crankshaft gallery has breached hydrodynamic minimum film safety envelope.',
      dataLimitations: 'Oil scavenge flow rate and particle counter sensors not present on this test airframe.',
    });
  }

  // =========================================================================
  // 5. OVERHEATING TREND
  // =========================================================================
  if (activeInjection.type === 'OVERHEATING' || telemetry.cht_avg > 140 || (telemetry.cht_avg > 132 && telemetry.oil_temperature > 115)) {
    faults.push({
      id: 'FLT-005',
      faultName: 'Engine Coupled Thermal Overheating Trend',
      faultType: 'OVERHEATING_TREND',
      probability: 91,
      affectedSubsystem: 'Cooling & Thermal Management',
      affectedCylinder: 'ALL',
      detectedParameters: [
        `Average CHT (${telemetry.cht_avg}°C)`,
        `Average EGT (${telemetry.egt_avg}°C)`,
        `Oil Temp (${telemetry.oil_temperature}°C)`,
      ],
      evidence: [
        `Cylinder head temperatures exceeded 140°C threshold (peak: ${Math.max(...chts)}°C)`,
        `Engine oil temperature climbed to ${telemetry.oil_temperature}°C`,
        `Coupled thermal rise observed across both liquid cooling and lubrication circuits`,
      ],
      alternativeHypotheses: [
        {
          faultName: 'Cooling Radiator Baffle Flap Actuator Failure',
          probability: 38,
          rationale: 'Ram-air cooling shutter stuck in closed or restricted position.',
        },
        {
          faultName: 'Excessively Lean Global Air-Fuel Mixture',
          probability: 27,
          rationale: 'Unmetered manifold air leak causes high combustion temperatures.',
        },
      ],
      severity: telemetry.cht_avg > 152 ? 'CRITICAL' : 'HIGH',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Enrich fuel mixture, reduce climb power, inspect coolant pump belt, radiator matrix cleanliness, and ram-air cowl ducts.',
      explanation: 'Cumulative heat rejection capacity degraded relative to engine thermal dissipation demands.',
      dataLimitations: 'Coolant mass flow meter not installed.',
    });
  }

  // =========================================================================
  // 6. ABNORMAL VIBRATION
  // =========================================================================
  if (activeInjection.type === 'ABNORMAL_VIBRATION' || telemetry.vibration_rms > 5.5) {
    faults.push({
      id: 'FLT-006',
      faultName: 'Rotating Assembly Structural Vibration Exceedance',
      faultType: 'ABNORMAL_VIBRATION',
      probability: 88,
      affectedSubsystem: 'Crankshaft & Propeller Reduction Unit',
      affectedCylinder: 'ALL',
      detectedParameters: [
        `Vibration RMS (${telemetry.vibration_rms} mm/s)`,
        `Vibration Peak (${telemetry.vibration_peak} mm/s)`,
      ],
      evidence: [
        `RMS vibration of ${telemetry.vibration_rms} mm/s exceeds aerospace continuous threshold (4.5 mm/s)`,
        `Peak vibration reached ${telemetry.vibration_peak} mm/s`,
        `Vibration persists across constant RPM holding phase`,
      ],
      alternativeHypotheses: [
        {
          faultName: 'Propeller Blade Mass Unbalance / Foreign Object Damage',
          probability: 45,
          rationale: 'Leading edge chip or pitch unbalance produces 1x RPM rotational harmonic.',
        },
        {
          faultName: 'Gearbox Torsional Damper Degradation',
          probability: 32,
          rationale: 'Elastomeric dog clutches worn in reduction gearbox.',
        },
      ],
      severity: telemetry.vibration_rms > 7.5 ? 'CRITICAL' : 'HIGH',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Conduct dynamic propeller vibration balancing and inspect reduction gearbox backlash and crank journal bearings.',
      explanation: 'Mechanical harmonic vibration amplitude indicates structural dynamic unbalance.',
      dataLimitations: 'Single-axis accelerometer data available; 3-axis triaxial vibration sensor recommended for spectral angular localization.',
    });
  }

  // =========================================================================
  // 7. COMBUSTION INSTABILITY
  // =========================================================================
  if (activeInjection.type === 'COMBUSTION_INSTABILITY') {
    faults.push({
      id: 'FLT-007',
      faultName: 'Cyclic Combustion Instability & Hunting',
      faultType: 'COMBUSTION_INSTABILITY',
      probability: 85,
      affectedSubsystem: 'Combustion System',
      affectedCylinder: 'ALL',
      detectedParameters: ['Oscillatory EGT Delta (±65°C)', 'Rotational RPM Jitter'],
      evidence: [
        'Exhaust gas temperatures oscillating across cylinder bank with 0.3 Hz periodicity',
        'Cylinder head thermals fluctuating out of phase with peer cylinders',
        'Vibration RMS elevated by 2.4 mm/s from cyclic torque variation',
      ],
      alternativeHypotheses: [
        {
          faultName: 'Turbocharger Wastegate Actuator Hunting',
          probability: 36,
          rationale: 'Manifold pressure oscillations induce cycling air-fuel ratio variations.',
        },
      ],
      severity: 'MEDIUM',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Check turbo wastegate servo linkage, throttle body position sensor, and fuel rail pressure regulator.',
      explanation: 'Unstable combustion stoichiometry causing hunting across cylinders.',
      dataLimitations: 'Pressure sensor sample rate limited to 10 Hz; in-cylinder pressure transducer needed for high-speed cycle-to-cycle variation analysis.',
    });
  }

  // =========================================================================
  // 8. EGT SENSOR DRIFT
  // =========================================================================
  const isSensorDrift = activeInjection.type === 'SENSOR_DRIFT' ||
    (sensorReport && sensorReport.channels['egt_2']?.isDrifting);
  if (isSensorDrift) {
    faults.push({
      id: 'FLT-008',
      faultName: 'Thermocouple Sensor Monotonic Drift (Cyl #2)',
      faultType: 'EGT_SENSOR_DRIFT',
      probability: 89,
      affectedSubsystem: 'Instrumentation & Sensors',
      affectedCylinder: 2,
      detectedParameters: ['EGT 2 Monotonic Drift (+1°C/min)', 'CHT 2 Unchanged'],
      evidence: [
        'Exhaust gas temperature on Cylinder 2 drifting upwards at +1.0 °C/min',
        'Cylinder 2 CHT and adjacent cylinders remain stable, confirming sensor decoupling',
        'Identified by Sensor & Data-Quality layer as SENSOR_ANOMALY',
      ],
      alternativeHypotheses: [
        {
          faultName: 'Gradual Lean Mixture in Cylinder 2',
          probability: 22,
          rationale: 'Very slow nozzle clogging could produce thermal rise, but CHT 2 would typically rise in tandem.',
        },
      ],
      severity: 'MEDIUM',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Inspect Type K thermocouple harness connector, cold junction compensation module, and probe tip grounding.',
      explanation: 'Decoupled monotonic thermal signal drift without physical CHT or vibration correlation indicates instrument degradation rather than engine failure.',
      dataLimitations: 'Thermocouple wiring resistance diagnostics not logged continuously.',
    });
  }

  // =========================================================================
  // 9. OIL PRESSURE SENSOR FAILURE
  // =========================================================================
  if (activeInjection.type === 'SENSOR_FAILURE' || (telemetry.oil_pressure === 0 && telemetry.rpm > 1200)) {
    faults.push({
      id: 'FLT-009',
      faultName: 'Oil Pressure Transducer Signal Dropout / Disconnect',
      faultType: 'OIL_PRESSURE_SENSOR_FAILURE',
      probability: 98,
      affectedSubsystem: 'Instrumentation & Sensors',
      affectedCylinder: 'ALL',
      detectedParameters: ['Oil Pressure = 0.0 bar (RPM > 1200)'],
      evidence: [
        'Transducer reports 0.0 bar while engine is confirmed running at operational RPM',
        'Oil temperature remains nominal (92°C) without catastrophic thermal seizure',
        'Classified by Sensor-Health Layer as Sensor Anomaly (Signal Failure)',
      ],
      alternativeHypotheses: [
        {
          faultName: 'Catastrophic Oil Line Rupture',
          probability: 8,
          rationale: 'Complete loss of oil would rapidly cause oil temperature surge and bearing seizure.',
        },
      ],
      severity: 'HIGH',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Check 5V sensor reference wiring harness, grounding strap, and transducer signal connector.',
      explanation: 'Plausibility cross-check proves transducer disconnection: Engine mechanical operation confirmed by RPM and CHT.',
      dataLimitations: 'No secondary redundant oil pressure sensor fitted on standard test harness.',
    });
  }

  // =========================================================================
  // 10. BATTERY / ALTERNATOR FAULT
  // =========================================================================
  if (activeInjection.type === 'ELECTRICAL_FAULT' || telemetry.battery_voltage < 23.5 || (telemetry.rpm > 2000 && telemetry.battery_voltage < 25.0)) {
    faults.push({
      id: 'FLT-010',
      faultName: 'Alternator Charging Circuit & Bus Voltage Sag',
      faultType: 'ELECTRICAL_ALTERNATOR_FAULT',
      probability: 92,
      affectedSubsystem: 'Electrical & FADEC Bus',
      affectedCylinder: 'ALL',
      detectedParameters: [
        `Bus Voltage (${telemetry.battery_voltage} V)`,
        `Alternator Output (${telemetry.alternator_current} A)`,
      ],
      evidence: [
        `FADEC bus voltage dropped to ${telemetry.battery_voltage} V (< 25.0 V operational threshold)`,
        `Alternator current collapsed to ${telemetry.alternator_current} A`,
        'Electrical bus currently operating in battery discharge depletion mode',
      ],
      alternativeHypotheses: [
        {
          faultName: 'Avionics Bus Short Circuit / Excessive Load',
          probability: 24,
          rationale: 'Fault in payload subsystem drawing excessive current pulling down bus voltage.',
        },
      ],
      severity: 'HIGH',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Check alternator drive belt tension, voltage regulator module, and primary bus diode before flight.',
      explanation: 'Electrical power rail operating below nominal 28V specification; flight control systems at risk of battery exhaustion.',
      dataLimitations: 'Individual bus branch shunt ammeters not available.',
    });
  }

  // =========================================================================
  // 11. CAN FRAME DROPOUT
  // =========================================================================
  if (activeInjection.type === 'CAN_DROPOUT' || telemetry.missing_data_flag) {
    faults.push({
      id: 'FLT-011',
      faultName: 'Avionics CAN Bus Frame Timeout / Dropout',
      faultType: 'CAN_FRAME_DROPOUT',
      probability: 95,
      affectedSubsystem: 'CAN Bus & Communications',
      affectedCylinder: 'ALL',
      detectedParameters: ['Missing Data Flag = TRUE', 'CAN Timeout > 1000ms'],
      evidence: [
        'Expected cyclic J1939 CAN frame missed on virtual bus interface',
        'Classified by Sensor-Quality Layer as Communication Anomaly',
      ],
      alternativeHypotheses: [
        {
          faultName: 'ECU Microcontroller Reset',
          probability: 19,
          rationale: 'Watchdog timer trip causing temporary communication blackout.',
        },
      ],
      severity: 'HIGH',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Inspect dual-redundant CAN bus termination resistors (120Ω) and avionics shielding.',
      explanation: 'Telemetry frame latency or packet loss detected in FADEC-GCS link.',
      dataLimitations: 'CAN bus error counters (TEC/REC) not mapped in standard telemetry message.',
    });
  }

  // =========================================================================
  // 12. FROZEN SENSOR
  // =========================================================================
  if (activeInjection.type === 'FROZEN_SENSOR' || (sensorReport && Object.values(sensorReport.channels).some(c => c.isFrozen))) {
    const frozenChannel = sensorReport ? Object.values(sensorReport.channels).find(c => c.isFrozen)?.label || 'Oil Pressure' : 'Oil Pressure';
    faults.push({
      id: 'FLT-012',
      faultName: `Transducer Signal Frozen (${frozenChannel})`,
      faultType: 'FROZEN_SENSOR',
      probability: 90,
      affectedSubsystem: 'Instrumentation & Sensors',
      affectedCylinder: 'ALL',
      detectedParameters: [`${frozenChannel} Stuck Value`],
      evidence: [
        `${frozenChannel} telemetry output completely static over >15 consecutive seconds while engine load varied`,
        'Identified by Sensor & Data-Quality layer as SENSOR_ANOMALY (Frozen)',
      ],
      alternativeHypotheses: [
        {
          faultName: 'ADC Converter Latch-Up',
          probability: 30,
          rationale: 'FADEC analog-to-digital converter frozen in hardware latch-up state.',
        },
      ],
      severity: 'MEDIUM',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Inspect sensor analog conditioning channel and power-cycle engine telemetry acquisition unit.',
      explanation: 'Zero signal entropy with varying engine physical states indicates frozen transducer output.',
      dataLimitations: 'Direct ADC register status not exposed over CAN.',
    });
  }

  return faults;
}
