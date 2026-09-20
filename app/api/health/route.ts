import { NextResponse } from 'next/server';
import { getState } from '@/lib/store';

export async function GET() {
  const state = getState();
  return NextResponse.json({
    health: state.health,
    mission_assessment: state.missionAssessment,
    timestamp: new Date().toISOString(),
    modelVersion: 'v2.4-hybrid-phm',
    datasetVersion: 'v2.4-synthetic-multiphysics',
    limitations: 'Weighted penalty formula applied across 7 engine subsystems. Decision-support advisory only.',
  });
}
