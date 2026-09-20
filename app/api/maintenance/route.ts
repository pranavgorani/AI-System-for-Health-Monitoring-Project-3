import { NextResponse } from 'next/server';
import { getState } from '@/lib/store';

export async function GET() {
  const state = getState();
  return NextResponse.json({
    advisories: state.maintenanceAdvisories,
    timestamp: new Date().toISOString(),
  });
}
