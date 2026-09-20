import { NextResponse } from 'next/server';
import { getState } from '@/lib/store';

export async function GET() {
  const state = getState();
  return NextResponse.json({
    engine_id: state.engineId,
    uav_id: state.uavId,
    mission_id: state.missionId,
    flight_state: state.flightState,
    is_simulating: state.isSimulating,
    rpm: state.currentTelemetry.rpm,
    overall_health: state.health.overall,
    health_status: state.health.status,
    anomaly_score: state.anomalies.score,
    anomaly_classification: state.anomalies.classification,
    active_faults_count: state.faults.length,
    timestamp: new Date().toISOString(),
    system_status: 'ONLINE (SIMULATED)',
  });
}
