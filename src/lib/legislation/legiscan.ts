// Thin client for the LegiScan API (https://api.legiscan.com). Adds federal
// (Congress) coverage and deeper per-bill data. Server-only; key from
// LEGISCAN_API_KEY. All data is public record.

const BASE = 'https://api.legiscan.com/';

export const legiScanEnabled = (): boolean => !!process.env.LEGISCAN_API_KEY;

export interface LsSponsor { name?: string; sponsor_type_id?: number; role?: string }
export interface LsVote { roll_call_id?: number; date?: string; desc?: string; yea?: number; nay?: number; nv?: number; absent?: number; passed?: number }
export interface LsHistory { date?: string; action?: string }
export interface LsSubject { subject_name?: string }
export interface LsBill {
  bill_id: number; bill_number?: string; title?: string; description?: string;
  state?: string; bill_type?: string; status?: number | string;
  session?: { session_name?: string };
  status_date?: string; last_action?: string; last_action_date?: string;
  sponsors?: LsSponsor[]; votes?: LsVote[]; history?: LsHistory[]; subjects?: LsSubject[];
  url?: string; state_link?: string;
}

class LegiScanError extends Error {}

async function call<T>(op: string, params: Record<string, string | number>): Promise<T> {
  const key = process.env.LEGISCAN_API_KEY;
  if (!key) throw new LegiScanError('LEGISCAN_API_KEY is not set.');
  const url = new URL(BASE);
  url.searchParams.set('key', key);
  url.searchParams.set('op', op);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url.toString(), { headers: { accept: 'application/json' }, cache: 'no-store' });
  if (!res.ok) throw new LegiScanError(`LegiScan ${op} HTTP ${res.status}`);
  const json = (await res.json()) as { status?: string; alert?: { message?: string } } & Record<string, unknown>;
  if (json.status && json.status !== 'OK') throw new LegiScanError(`LegiScan ${op}: ${json.alert?.message ?? json.status}`);
  return json as T;
}

/** Returns bill ids from the current-session master list for a state code ("TX", "US"). */
export async function legiScanMasterListIds(state: string): Promise<number[]> {
  const data = await call<{ masterlist: Record<string, unknown> }>('getMasterList', { state });
  const ids: number[] = [];
  for (const [k, v] of Object.entries(data.masterlist ?? {})) {
    if (k === 'session') continue;
    const bill = v as { bill_id?: number };
    if (typeof bill?.bill_id === 'number') ids.push(bill.bill_id);
  }
  return ids;
}

export async function legiScanGetBill(billId: number): Promise<LsBill> {
  const data = await call<{ bill: LsBill }>('getBill', { id: billId });
  return data.bill;
}
