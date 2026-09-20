import { NextResponse } from 'next/server';
import { getState } from '@/lib/store';

export async function GET() {
  const state = getState();
  return NextResponse.json({
    anomalies: state.anomalies,
    physicsModel: state.physicsOutput,
    confidence: state.anomalies.confidence,
    persistenceDurationSec: state.anomalies.persistenceDurationSec,
    detectionLeadTimeSec: state.anomalies.detectionLeadTimeSec,
    timestamp: new Date().toISOString(),
    modelVersion: 'v2.4-hybrid-phm',
    datasetVersion: 'v2.4-synthetic-multiphysics',
    limitations: 'Temporal persistence threshold N=3 frames applied. Research demonstrator output.',
  });
}

