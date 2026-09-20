import { NextResponse } from 'next/server';
import { getState } from '@/lib/store';

export async function GET() {
  const state = getState();
  return NextResponse.json({
    rul: state.rul,
    degradation_level: state.degradationLevel,
    confidence_interval: state.rul.confidenceInterval,
    confidence_level: state.rul.confidenceLevel,
    failure_criteria: state.rul.endOfLifeCriterion,
    timestamp: new Date().toISOString(),
    modelVersion: 'v2.4-hybrid-phm',
    datasetVersion: 'v2.4-synthetic-multiphysics',
    limitations: 'Prognostic projection based on component-specific degradation rates. Subject to operational mission profile variations.',
  });
}
