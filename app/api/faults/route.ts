import { NextResponse } from 'next/server';
import { getState, injectFault, clearFault } from '@/lib/store';

export async function GET() {
  const state = getState();
  return NextResponse.json({
    active_faults: state.faults,
    active_injection: state.activeFault,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === 'CLEAR') {
      clearFault();
      return NextResponse.json({ status: 'CLEARED' });
    }
    injectFault(body.type || 'OVERHEATING', body.notes || 'API Injected Fault');
    return NextResponse.json({ status: 'INJECTED', type: body.type });
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}
