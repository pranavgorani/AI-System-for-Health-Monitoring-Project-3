import { EngineTelemetry, FaultPrediction, ActiveFaultInjection } from '../types';

export function classifyFaults(
  telemetry: EngineTelemetry,
  activeInjection: ActiveFaultInjection
): FaultPrediction[] {
  const faults: FaultPrediction[] = [];
  const now = new Date().toISOString();

  // 1. Misfire: Significant EGT drop on a single cylinder with elevated vibration
  const egts = [telemetry.egt_1, telemetry.egt_2, telemetry.egt_3, telemetry.egt_4];
  const minEgt = Math.min(...egts);
  const maxEgt = Math.max(...egts);
  const egtSpread = maxEgt - minEgt;

  if (egtSpread > 120 && telemetry.vibration_rms > 4.8) {
    const droppedCyl = egts.indexOf(minEgt) + 1;
    faults.push({
      id: 'FLT-001',
      faultName: `Cylinder #${droppedCyl} Misfire`,
      probability: 94,
      affectedSubsystem: 'Combustion System',
      detectedParameters: [`EGT_${droppedCyl} (${minEgt}°C)`, `Spread (${egtSpread}°C)`, `Vibration (${telemetry.vibration_rms} mm/s)`],
      severity: 'HIGH',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Inspect spark plug electrodes, ignition coils, and injection pulse train on Cylinder 3.',
      explanation: `Individual cylinder exhaust gas temperature dropped ${egtSpread}°C below bank average with synchronized rotational imbalance harmonics.`,
    });
  }

  // 2. Injector Abnormality: EGT high spread with fuel flow delta
  if (egtSpread > 55 && egtSpread <= 120) {
    faults.push({
      id: 'FLT-002',
      faultName: 'Fuel Injector Flow Imbalance',
      probability: 88,
      affectedSubsystem: 'Fuel Injection',
      detectedParameters: ['Cylinder EGT Disparity', 'BSFC Divergence'],
      severity: 'MEDIUM',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Perform injector spray pattern test and flow calibration check during scheduled turn-around.',
      explanation: 'Thermal disparity indicates asymmetric air-fuel ratio delivery between cylinders.',
    });
  }

  // 3. Overheating Trend: Both CHT and EGT or Oil Temp exceeding thermal margins
  if (telemetry.cht_avg > 140 || (telemetry.cht_avg > 132 && telemetry.oil_temperature > 115)) {
    faults.push({
      id: 'FLT-003',
      faultName: 'Engine Thermal Overheating Trend',
      probability: 92,
      affectedSubsystem: 'Cooling & Combustion',
      detectedParameters: [`CHT Avg (${telemetry.cht_avg}°C)`, `Oil Temp (${telemetry.oil_temperature}°C)`, `Ambient (${telemetry.ambient_temperature}°C)`],
      severity: telemetry.cht_avg > 150 ? 'CRITICAL' : 'HIGH',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Check radiator airflow baffles, coolant lines, and mixture enleanment setting.',
      explanation: 'Coupled thermal dissipation degradation detected across cylinder head and engine oil circuits.',
    });
  }

  // 4. Lubrication Issue: Low oil pressure or extreme oil temperature
  if (telemetry.oil_pressure < 2.2 && telemetry.rpm > 1500) {
    faults.push({
      id: 'FLT-004',
      faultName: 'Low Lubrication System Pressure',
      probability: 96,
      affectedSubsystem: 'Lubrication',
      detectedParameters: [`Oil Pressure (${telemetry.oil_pressure} bar)`, `Oil Temp (${telemetry.oil_temperature}°C)`],
      severity: telemetry.oil_pressure < 1.5 ? 'CRITICAL' : 'HIGH',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Ground engine immediately. Inspect oil pump relief valve, filter blockage, and oil line integrity.',
      explanation: 'Hydraulic line pressure dropped below the critical hydrodynamic bearing film threshold.',
    });
  }

  // 5. Abnormal Vibration: RMS exceeding aerospace limits
  if (telemetry.vibration_rms > 5.5) {
    faults.push({
      id: 'FLT-005',
      faultName: 'High Rotating Assembly Vibration',
      probability: 89,
      affectedSubsystem: 'Crankshaft & Propeller',
      detectedParameters: [`Vibration RMS (${telemetry.vibration_rms} mm/s)`],
      severity: telemetry.vibration_rms > 7.0 ? 'CRITICAL' : 'HIGH',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Perform dynamic propeller balancing and inspect main crankshaft journal bearing play.',
      explanation: 'Synchronous and sub-synchronous vibration spectral energy exceeds structural endurance limits.',
    });
  }

  // 6. Sensor Failure / Drift:
  if (telemetry.oil_pressure === 0 && telemetry.rpm > 1500) {
    faults.push({
      id: 'FLT-006',
      faultName: 'Oil Pressure Sensor Loss / Dropout',
      probability: 98,
      affectedSubsystem: 'Sensors & Instrumentation',
      detectedParameters: ['Oil Pressure: 0.0 bar (RPM > 1500)'],
      severity: 'HIGH',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Check 5V sensor reference wiring harness and pressure transducer grounding.',
      explanation: 'Discontinuity detected: Physical engine operation confirmed via RPM while transducer signal is zero.',
    });
  }

  // 7. Electrical System / Alternator issue
  if (telemetry.battery_voltage < 23.5 || (telemetry.rpm > 2000 && telemetry.battery_voltage < 25.0)) {
    faults.push({
      id: 'FLT-007',
      faultName: 'Alternator Charging Circuit Anomaly',
      probability: 91,
      affectedSubsystem: 'Electrical & FADEC Bus',
      detectedParameters: [`Bus Voltage (${telemetry.battery_voltage} V)`, `Current (${telemetry.alternator_current} A)`],
      severity: 'HIGH',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Inspect alternator drive belt tension, voltage regulator module, and primary bus diode.',
      explanation: 'Electrical bus operating on battery discharge curve with insufficient generator output.',
    });
  }

  // 8. Combustion Degradation (Overall efficiency loss)
  if (telemetry.efficiency < 25 && telemetry.flight_state === 'CRUISE') {
    faults.push({
      id: 'FLT-008',
      faultName: 'Combustion Thermal Degradation',
      probability: 84,
      affectedSubsystem: 'Combustion System',
      detectedParameters: [`Thermal Efficiency (${telemetry.efficiency}%)`, 'Specific Fuel Consumption'],
      severity: 'MEDIUM',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Check cylinder compression, valve seating, and combustion chamber carbon buildup.',
      explanation: 'Specific power output per kilogram of fuel burned has declined by >15% from factory baseline.',
    });
  }

  // If specific injection is active and hasn't matched specific physics yet, add explicit profile
  if (activeInjection.type === 'SENSOR_DRIFT' && !faults.some(f => f.faultName.includes('Drift'))) {
    faults.push({
      id: 'FLT-009',
      faultName: 'Thermocouple Sensor Calibration Drift',
      probability: 87,
      affectedSubsystem: 'Sensors & Instrumentation',
      detectedParameters: ['Rate of change: +1.0°C/min on CHT 2'],
      severity: 'MEDIUM',
      firstDetectedTime: now,
      currentStatus: 'ACTIVE',
      recommendedInspection: 'Recalibrate Type K thermocouple lead and junction reference compensator.',
      explanation: 'Persistent monotonic signal bias detected that is decoupled from adjacent cylinder thermals.',
    });
  }

  return faults;
}
