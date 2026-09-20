import { NextResponse } from 'next/server';
import { getState } from '@/lib/store';

export async function GET() {
  const state = getState();
  return NextResponse.json({
    telemetry: state.currentTelemetry,
    sensor_quality: state.sensorReport,
    can_frames: state.canMessages,
    timestamp: new Date().toISOString(),
    modelVersion: 'v2.4-hybrid-phm',
    datasetVersion: 'v2.4-synthetic-multiphysics',
    limitations: 'Demonstration Mode: Synthetic aero-piston telemetry. Research and evaluation only.',
  });
}

