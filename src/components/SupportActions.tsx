'use client';

import { useState } from 'react';

// Kicks off checkout. Until a Stripe account is connected (STRIPE_SECRET_KEY),
// the endpoint returns a friendly "not connected yet" message — no fake flow.
export function SupportActions(props:
  | { kind: 'donation'; options: { label: string; amount: number }[] }
  | { kind: 'membership'; plan: string; planName: string; enabled?: boolean }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function go(payload: Record<string, unknown>, key: string) {
    setBusy(key); setMsg(null);
    try {
      const r = await fetch('/api/support/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await r.json();
      if (r.ok && d.ok && d.data?.url) { window.location.href = d.data.url; return; }
      setMsg(d?.error?.message ?? 'Payments aren’t connected yet — check back soon.');
    } catch { setMsg('Something went wrong. Please try again later.'); }
    setBusy(null);
  }

  if (props.kind === 'donation') {
    return (
      <div>
        <div className="sp-donate-row">
          {props.options.map((o) => (
            <button key={o.amount} className="hb hb-ghost" disabled={busy !== null} onClick={() => go({ kind: 'donation', amount: o.amount }, `d${o.amount}`)}>
              {busy === `d${o.amount}` ? '…' : o.label}
            </button>
          ))}
        </div>
        {msg && <p className="sp-msg">{msg}</p>}
      </div>
    );
  }

  if (props.enabled === false) {
    return <button className="hb hb-ghost" style={{ width: '100%' }} disabled>Coming soon</button>;
  }
  return (
    <div>
      <button className="hb hb-red" style={{ width: '100%' }} disabled={busy !== null} onClick={() => go({ kind: 'membership', plan: props.plan }, props.plan)}>
        {busy === props.plan ? '…' : `Support as ${props.planName}`}
      </button>
      {msg && <p className="sp-msg">{msg}</p>}
    </div>
  );
}
