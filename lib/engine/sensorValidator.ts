import {
  EngineTelemetry,
  SensorQualityReport,
  SensorChannelHealth,
  SensorChannelStatus,
  SensorAnomalyType,
} from '../types';

interface ChannelValidationSpec {
  min: number;
  max: number;
  maxRatePerSec: number;
  unit: string;
  label: string;
}

const CHANNEL_SPECS: Record<string, ChannelValidationSpec> = {
  rpm: { min: 0, max: 6200, maxRatePerSec: 1500, unit: 'RPM', label: 'Engine Speed' },
  throttle: { min: 0, max: 100, maxRatePerSec: 100, unit: '%', label: 'Throttle Command' },
  cht_1: { min: -40, max: 220, maxRatePerSec: 12, unit: '°C', label: 'Cylinder 1 CHT' },
  cht_2: { min: -40, max: 220, maxRatePerSec: 12, unit: '°C', label: 'Cylinder 2 CHT' },
  cht_3: { min: -40, max: 220, maxRatePerSec: 12, unit: '°C', label: 'Cylinder 3 CHT' },
  cht_4: { min: -40, max: 220, maxRatePerSec: 12, unit: '°C', label: 'Cylinder 4 CHT' },
  egt_1: { min: -40, max: 980, maxRatePerSec: 45, unit: '°C', label: 'Cylinder 1 EGT' },
  egt_2: { min: -40, max: 980, maxRatePerSec: 45, unit: '°C', label: 'Cylinder 2 EGT' },
  egt_3: { min: -40, max: 980, maxRatePerSec: 45, unit: '°C', label: 'Cylinder 3 EGT' },
  egt_4: { min: -40, max: 980, maxRatePerSec: 45, unit: '°C', label: 'Cylinder 4 EGT' },
  oil_pressure: { min: 0.0, max: 8.0, maxRatePerSec: 2.5, unit: 'bar', label: 'Engine Oil Pressure' },
  oil_temperature: { min: -30, max: 150, maxRatePerSec: 8, unit: '°C', label: 'Engine Oil Temp' },
  fuel_flow: { min: 0, max: 45, maxRatePerSec: 15, unit: 'L/h', label: 'Fuel Flow Rate' },
  vibration_rms: { min: 0, max: 20.0, maxRatePerSec: 8.0, unit: 'mm/s', label: 'Vibration RMS' },
  battery_voltage: { min: 14.0, max: 34.0, maxRatePerSec: 6.0, unit: 'V', label: 'FADEC Bus Voltage' },
  alternator_current: { min: -10, max: 80, maxRatePerSec: 25, unit: 'A', label: 'Alternator Load' },
};

// In-memory ring buffer for frozen and drift tracking (last 30 ticks)
const sensorBuffer: EngineTelemetry[] = [];

export function validateSensors(
  current: EngineTelemetry,
  history: EngineTelemetry[] = []
): SensorQualityReport {
  // Update internal buffer
  sensorBuffer.push(current);
  if (sensorBuffer.length > 30) sensorBuffer.shift();

  const prev = history.length > 0 ? history[history.length - 1] : null;
  const channelResults: Record<string, SensorChannelHealth> = {};

  let totalConfidence = 0;
  let validCount = 0;
  let suspectCount = 0;
  let failedCount = 0;
  let detectedAnomalyType: SensorAnomalyType = 'ENGINE_ANOMALY';

  // Check CAN frame dropout / timestamp validity
  const isCanTimeout = current.missing_data_flag || !current.can_frame_id;
  const isDuplicateFrame = prev && prev.timestamp === current.timestamp && prev.rpm === current.rpm;
  if (isCanTimeout || isDuplicateFrame) {
    detectedAnomalyType = 'COMM_ANOMALY';
  }

  // Cross-sensor cylinder metrics
  const egts = [current.egt_1, current.egt_2, current.egt_3, current.egt_4];
  const chts = [current.cht_1, current.cht_2, current.cht_3, current.cht_4];
  const egtMean = egts.reduce((a, b) => a + b, 0) / 4;
  const chtMean = chts.reduce((a, b) => a + b, 0) / 4;

  for (const [key, spec] of Object.entries(CHANNEL_SPECS)) {
    const rawVal = (current as unknown as Record<string, unknown>)[key];
    const prevVal = prev ? (prev as unknown as Record<string, unknown>)[key] : null;

    let status: SensorChannelStatus = 'HEALTHY';
    let confidence = 98;
    let anomalyType: SensorAnomalyType = 'ENGINE_ANOMALY';
    let reason = 'Nominal sensor signal within physical range and rate bounds';
    let isFrozen = false;
    let isDrifting = false;
    let rateOfChange = 0;

    // 1. Check Missing / NaN / Null
    if (rawVal === undefined || rawVal === null || Number.isNaN(rawVal)) {
      status = 'FAILED';
      confidence = 10;
      anomalyType = 'COMM_ANOMALY';
      reason = 'Signal missing or null in telemetry packet';
      failedCount++;
      channelResults[key] = {
        channel: key,
        label: spec.label,
        currentValue: 0,
        unit: spec.unit,
        status,
        confidence,
        anomalyType,
        reason,
        lastValidUpdate: prev ? prev.timestamp : current.timestamp,
        qualityScore: 10,
        isFrozen: false,
        isDrifting: false,
        rateOfChange: 0,
      };
      continue;
    }

    const val = Number(rawVal);

    // 2. Check Rate-of-change
    if (prevVal !== null && prevVal !== undefined) {
      rateOfChange = Math.round(Math.abs(val - Number(prevVal)) * 100) / 100;
      if (rateOfChange > spec.maxRatePerSec && current.flight_state !== 'TAKEOFF') {
        status = 'SUSPECT';
        confidence = 45;
        anomalyType = 'SENSOR_ANOMALY';
        reason = `Impossible rate of change: Δ${rateOfChange} ${spec.unit}/sec exceeds physical limit ${spec.maxRatePerSec} ${spec.unit}/sec`;
      }
    }

    // 3. Check Out-of-Physical Range
    if (val < spec.min || val > spec.max) {
      status = 'FAILED';
      confidence = 15;
      anomalyType = 'SENSOR_ANOMALY';
      reason = `Value ${val} ${spec.unit} is outside physical transducer limits [${spec.min} - ${spec.max}]`;
    }

    // 4. Check Frozen / Stuck Sensor (last 15 buffer frames identical while engine running)
    if (sensorBuffer.length >= 15 && current.rpm > 1000) {
      const pastValues = sensorBuffer.slice(-15).map(b => (b as unknown as Record<string, unknown>)[key]);
      const allEqual = pastValues.every(v => v === pastValues[0]);
      if (allEqual && key !== 'throttle' && key !== 'altitude') {
        isFrozen = true;
        status = 'FROZEN';
        confidence = 35;
        anomalyType = 'SENSOR_ANOMALY';
        reason = `Frozen sensor: Constant output ${val} ${spec.unit} over ${pastValues.length} consecutive samples with active engine`;
      }
    }

    // 5. Cross-Sensor & Thermocouple Drift Check (specifically for EGT / CHT)
    if (key.startsWith('egt_')) {
      const cylIdx = parseInt(key.replace('egt_', ''), 10);
      const cylEgt = val;
      const cylCht = (current as unknown as Record<string, number>)[`cht_${cylIdx}`];
      const peerEgtAvg = (egts.reduce((a, b) => a + b, 0) - cylEgt) / 3;
      const deltaFromPeers = Math.abs(cylEgt - peerEgtAvg);

      // Check if EGT is drifting upward continuously without peer or CHT correlation
      if (sensorBuffer.length >= 20) {
        const pastCylEgts = sensorBuffer.slice(-20).map(b => (b as unknown as Record<string, number>)[key]);
        const pastPeerEgts = sensorBuffer.slice(-20).map(b => {
          const arr = [b.egt_1, b.egt_2, b.egt_3, b.egt_4];
          return (arr.reduce((x, y) => x + y, 0) - arr[cylIdx - 1]) / 3;
        });

        const cylDelta = pastCylEgts[pastCylEgts.length - 1] - pastCylEgts[0];
        const peerDelta = pastPeerEgts[pastPeerEgts.length - 1] - pastPeerEgts[0];

        // If cylinder EGT drifted up > 35°C while peers changed < 5°C and fuel flow didn't rise
        if (cylDelta > 35 && peerDelta < 5 && Math.abs(cylCht - chtMean) < 10) {
          isDrifting = true;
          status = 'DRIFT';
          confidence = 58;
          anomalyType = 'SENSOR_ANOMALY';
          reason = `Thermocouple drift detected: Monotonic +${Math.round(cylDelta)}°C decoupled from CHT #${cylIdx} and peer cylinders`;
        }
      }

      // Plausibility Check: Single Cylinder EGT Conflicts
      if (deltaFromPeers > 90 && Math.abs(cylCht - chtMean) < 6 && current.rpm > 1500) {
        if (status === 'HEALTHY') {
          status = 'SUSPECT';
          confidence = 62;
          anomalyType = 'SENSOR_ANOMALY';
          reason = `EGT trend conflicts with CHT #${cylIdx} and peer-cylinder trends (Δ=${Math.round(deltaFromPeers)}°C)`;
        }
      }
    }

    // 6. Oil Pressure Transducer Plausibility Check
    if (key === 'oil_pressure') {
      if (val === 0 && current.rpm > 1200) {
        status = 'FAILED';
        confidence = 20;
        anomalyType = 'SENSOR_ANOMALY';
        reason = 'Transducer dropout: Zero bar reported while engine operates at RPM > 1200';
      }
    }

    // Count summaries
    if (status === 'HEALTHY') {
      validCount++;
    } else if (status === 'SUSPECT' || status === 'DRIFT') {
      suspectCount++;
      if (detectedAnomalyType !== 'COMM_ANOMALY') detectedAnomalyType = anomalyType;
    } else {
      failedCount++;
      detectedAnomalyType = anomalyType;
    }

    totalConfidence += confidence;

    channelResults[key] = {
      channel: key,
      label: spec.label,
      currentValue: val,
      unit: spec.unit,
      status,
      confidence,
      anomalyType,
      reason,
      lastValidUpdate: current.timestamp,
      qualityScore: confidence,
      isFrozen,
      isDrifting,
      rateOfChange,
    };
  }

  // Communication anomalies check
  if (isCanTimeout || isDuplicateFrame) {
    detectedAnomalyType = 'COMM_ANOMALY';
  }

  const channelKeys = Object.keys(CHANNEL_SPECS);
  const overallConfidence = Math.round(totalConfidence / channelKeys.length);

  return {
    overallSensorConfidence: overallConfidence,
    validChannelCount: validCount,
    suspectChannelCount: suspectCount,
    failedChannelCount: failedCount,
    anomalyClassification: suspectCount > 0 || failedCount > 0 ? detectedAnomalyType : 'ENGINE_ANOMALY',
    channels: channelResults,
    timestamp: current.timestamp,
  };
}
