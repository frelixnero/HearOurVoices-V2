/**
 * One-shot: sync real bills for all 50 states + D.C. (OpenStates) and, if a
 * LegiScan key is set, U.S. Congress too. Rate-limit friendly (runs slowly).
 *
 * Run:  DATABASE_URL=... OPENSTATES_API_KEY=... [LEGISCAN_API_KEY=...] \
 *         npx tsx prisma/sync-all-legislation.ts
 *
 * This is the reliable "refresh everything" path (no serverless timeout). The
 * Vercel cron does the same in small rolling batches for ongoing freshness.
 */
import { JURISDICTIONS, syncMany, syncLegiScan } from '../src/lib/legislation/service';
import { openStatesEnabled } from '../src/lib/legislation/openstates';
import { legiScanEnabled } from '../src/lib/legislation/legiscan';

async function main() {
  if (!openStatesEnabled()) {
    console.error('OPENSTATES_API_KEY is not set. Get a free key at https://openstates.org/accounts/profile/');
    process.exit(1);
  }
  console.log(`Syncing ${JURISDICTIONS.length} jurisdictions from OpenStates (this takes several minutes)…`);
  const res = await syncMany(JURISDICTIONS, {
    perPage: 20,
    onProgress: (j, r) => console.log('error' in r ? `  ✗ ${j}: ${r.error}` : `  ✓ ${j}: ${r.synced} bills`),
  });
  console.log(`\nOpenStates done — ${res.totalSynced} bills across ${res.jurisdictions} jurisdictions.`);

  if (legiScanEnabled()) {
    console.log('\nSyncing U.S. Congress from LegiScan…');
    const fed = await syncLegiScan('US', 'United States', { limit: 20 });
    console.log(`LegiScan done — ${fed.synced} federal bills.`);
  } else {
    console.log('\n(LEGISCAN_API_KEY not set — skipping federal. Add it to include Congress.)');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
