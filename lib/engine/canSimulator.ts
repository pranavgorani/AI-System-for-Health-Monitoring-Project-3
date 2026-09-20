import { CanMessage, EngineTelemetry } from '../types';

export function telemetryToCanFrames(t: EngineTelemetry): CanMessage[] {
  const ts = t.timestamp;
  if (t.missing_data_flag) {
    return [
      {
        id: 'CAN-TIMEOUT',
        canId: '0x18FFFFFF',
        signal: 'BUS_LINK_TIMEOUT',
        value: 'TIMEOUT',
        unit: 'STATUS',
        timestamp: ts,
        status: 'ERROR',
      },
    ];
  }

  return [
    {
      id: 'CAN-1',
      canId: '0x18FEE400',
      signal: 'ENGINE_SPEED_RPM',
      value: t.rpm,
      unit: 'RPM',
      timestamp: ts,
      status: t.rpm > 5700 ? 'WARNING' : 'OK',
    },
    {
      id: 'CAN-2',
      canId: '0x18FEE500',
      signal: 'CYL_HEAD_TEMP_AVG',
      value: t.cht_avg,
      unit: '°C',
      timestamp: ts,
      status: t.cht_avg > 140 ? 'WARNING' : 'OK',
    },
    {
      id: 'CAN-3',
      canId: '0x18FEEF00',
      signal: 'ENGINE_OIL_PRESSURE',
      value: t.oil_pressure,
      unit: 'bar',
      timestamp: ts,
      status: t.oil_pressure < 2.0 || t.oil_pressure > 5.5 ? 'WARNING' : 'OK',
    },
    {
      id: 'CAN-4',
      canId: '0x18FEEE00',
      signal: 'ENGINE_OIL_TEMP',
      value: t.oil_temperature,
      unit: '°C',
      timestamp: ts,
      status: t.oil_temperature > 120 ? 'WARNING' : 'OK',
    },
    {
      id: 'CAN-5',
      canId: '0x18FE0100',
      signal: 'EXHAUST_GAS_TEMP_AVG',
      value: t.egt_avg,
      unit: '°C',
      timestamp: ts,
      status: t.egt_avg > 820 ? 'WARNING' : 'OK',
    },
    {
      id: 'CAN-6',
      canId: '0x18FE0200',
      signal: 'CYL3_EGT_INDIVIDUAL',
      value: t.egt_3,
      unit: '°C',
      timestamp: ts,
      status: Math.abs(t.egt_3 - t.egt_avg) > 40 ? 'WARNING' : 'OK',
    },
    {
      id: 'CAN-7',
      canId: '0x18FEF200',
      signal: 'FUEL_FLOW_RATE',
      value: t.fuel_flow,
      unit: 'L/h',
      timestamp: ts,
      status: 'OK',
    },
    {
      id: 'CAN-8',
      canId: '0x18FF3000',
      signal: 'BEARING_VIBRATION_RMS',
      value: t.vibration_rms,
      unit: 'mm/s',
      timestamp: ts,
      status: t.vibration_rms > 5.0 ? 'ERROR' : t.vibration_rms > 4.2 ? 'WARNING' : 'OK',
    },
    {
      id: 'CAN-9',
      canId: '0x18FEE600',
      signal: 'MANIFOLD_AIR_PRESSURE',
      value: t.manifold_pressure,
      unit: 'hPa',
      timestamp: ts,
      status: 'OK',
    },
    {
      id: 'CAN-10',
      canId: '0x18FEF700',
      signal: 'FADEC_BUS_VOLTAGE',
      value: t.battery_voltage,
      unit: 'V',
      timestamp: ts,
      status: t.battery_voltage < 24.0 ? 'WARNING' : 'OK',
    },
    {
      id: 'CAN-11',
      canId: '0x18FEF800',
      signal: 'ALTERNATOR_LOAD_CURRENT',
      value: t.alternator_current,
      unit: 'A',
      timestamp: ts,
      status: 'OK',
    },
    {
      id: 'CAN-12',
      canId: '0x18F00400',
      signal: 'THROTTLE_COMMAND_PCT',
      value: t.throttle,
      unit: '%',
      timestamp: ts,
      status: 'OK',
    },
  ];
}
