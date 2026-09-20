import { NextResponse } from 'next/server';
import { getState } from '@/lib/store';

export async function GET() {
  const state = getState();
  return NextResponse.json({
    anomalies: state.anomalies,
    timestamp: new Date().toISOString(),
  });
}
