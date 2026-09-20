import { NextResponse } from 'next/server';

export async function GET() {
  const missions = [
    { id: 'MSN-2026-06', name: 'Border Surveillance Recon', status: 'COMPLETED', date: '2026-09-12', hours: 6.2 },
    { id: 'MSN-2026-07', name: 'High Altitude Test Envelope', status: 'COMPLETED', date: '2026-09-15', hours: 4.8 },
    { id: 'MSN-2026-08', name: 'Desert Endurance Patrol', status: 'COMPLETED', date: '2026-09-18', hours: 5.5 },
    { id: 'MSN-2026-09', name: 'Tactical Reconnaissance Loiter', status: 'ACTIVE', date: '2026-09-20', hours: 3.4 },
  ];
  return NextResponse.json({ missions });
}
