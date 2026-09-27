import { NextResponse } from 'next/server';
import { openStatesEnabled } from '@/lib/legislation/openstates';
import { syncStale } from '@/lib/legislation/service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Rolling refresh: each run syncs the few stalest jurisdictions, cycling through
// all 50 states + D.C. over time. Called by Vercel Cron. Protected by CRON_SECRET
// (Vercel sends it as `Authorization: Bearer <CRON_SECRET>`).
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  if (!openStatesEnabled()) return NextResponse.json({ ok: false, error: 'OpenStates not configured' }, { status: 200 });
  try {
    const result = await syncStale(6);
    return NextResponse.json({ ok: true, data: result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'sync failed' }, { status: 500 });
  }
}
