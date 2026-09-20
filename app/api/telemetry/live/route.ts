import { NextResponse } from 'next/server';
import { getState } from '@/lib/store';

export async function GET() {
  const state = getState();
  return NextResponse.json({
    telemetry: state.currentTelemetry,
    can_frames: state.canMessages,
    timestamp: new Date().toISOString(),
  });
}
