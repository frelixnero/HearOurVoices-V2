'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Record {
  totalPosts: number; verified: number; disproven: number; corrections: number;
  evidenceQuality: number; sourceTransparency: number; factOpinionSeparation: number;
  eligibleForJournalist: boolean; reasons: string[];
}

// Shows a would-be journalist their track record and lets them apply.
export function JournalistApply() {
  const [record, setRecord] = useState<Record | null>(null);
  const [auth, setAuth] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    fetch('/api/journalist/apply').then(async (r) => {
      if (r.status === 401) { setAuth(false); return; }
      const d = await r.json();
      if (d.ok) setRecord(d.data.record);
    });
  }, []);

  async function apply() {
    const r = await fetch('/api/journalist/apply', { method: 'POST' });
    const d = await r.json();
    if (d.ok && d.data.granted) { setGranted(true); setMsg('You qualified! Reload to open the journalist lane.'); }
    else setMsg('Not eligible yet — keep building your record below.');
    if (d.ok) setRecord(d.data.record);
  }

  if (!auth) return (
    <div className="sh-card">
      <p style={{ color: '#cfd6e4' }}>The Independent Civic Journalist lane is for qualified contributors.</p>
      <Link href="/signup" className="hb hb-red">Create an account</Link>{' '}<Link href="/login" className="hb hb-dark">Log in</Link>
    </div>
  );

  return (
    <div className="sh-card">
      <h3 style={{ color: '#fff', fontSize: 18, margin: '0 0 6px' }}>Become an Independent Civic Journalist</h3>
      <p style={{ color: '#9aa6bd', fontSize: 14, margin: '0 0 14px' }}>
        This higher-trust lane is earned, not claimed. Build a record in Citizen Reports first — then apply.
      </p>
      {record && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
          {[
            ['Posts', record.totalPosts], ['Verified', record.verified], ['Disproven', record.disproven],
            ['Corrections', record.corrections], ['Evidence quality', record.evidenceQuality + '%'],
            ['Source transparency', record.sourceTransparency + '%'],
          ].map(([k, v]) => (
            <div key={k} style={{ background: '#0f1523', border: '1px solid #26314a', borderRadius: 10, padding: 12 }}>
              <b style={{ color: '#fff', fontSize: 20, display: 'block' }}>{v}</b>
              <span style={{ color: '#8b96ab', fontSize: 12 }}>{k}</span>
            </div>
          ))}
        </div>
      )}
      {record?.reasons?.map((r, i) => (
        <div key={i} style={{ color: record.eligibleForJournalist ? '#7fe3a6' : '#e8c86a', fontSize: 14, marginBottom: 4 }}>• {r}</div>
      ))}
      {msg && <div className={granted ? 'auth-ok' : 'auth-err'} style={{ marginTop: 12 }}>{msg}</div>}
      <div className="sh-actions">
        <button className="hb hb-red" onClick={apply} disabled={!record?.eligibleForJournalist}>
          {record?.eligibleForJournalist ? 'Apply now' : 'Not eligible yet'}
        </button>
      </div>
    </div>
  );
}
