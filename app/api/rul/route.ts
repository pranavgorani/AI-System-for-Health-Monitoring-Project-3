import { NextResponse } from 'next/server';
import { getState } from '@/lib/store';

export async function GET() {
  const state = getState();
  return NextResponse.json({
    rul: state.rul,
    degradation_level: state.degradationLevel,
    timestamp: new Date().toISOString(),
  });
}
