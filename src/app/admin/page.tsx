'use client';

import { useCallback, useEffect, useState } from 'react';
import { CLAIM_STATUSES, STATUS_META } from '@/lib/reports/labels';
import { CivicNewsForm } from '@/components/CivicNewsForm';
import { JusticeCaseForm } from '@/components/JusticeCaseForm';
import { HonorHeroForm } from '@/components/HonorHeroForm';

type Overview = { users: number; admins: number; journalists: number; stories: number; storiesHeld: number; reports: number; reportsHeld: number; casesHeld: number; newsHeld: number; tributesHeld: number };
type Staff = { isAdmin: boolean; isModerator: boolean; displayName: string };
type QueueStory = { id: string; title: string | null; body: string; displayName: string };
type QueueReport = { id: string; title: string; body: string; lane: string; displayName: string };
type QueueCase = { id: string; victimName: string; caseType: string; location: string | null; memoryLockPrimary: string; memoryLockFailure: string; justiceGapScore: number; spotlightLevel: number };
type QueueNews = { id: string; title: string; scope: string; authority: string; actorType: string; jurisdiction: string | null; whatHappened: string };
type QueueTribute = { id: string; displayName: string; relationship: string | null; message: string; hero: { heroName: string; rank: string | null } };
type Row = { id: string; email: string; displayName: string; status: string; isJournalist: boolean; isModerator: boolean; isAdmin: boolean };

export default function AdminPage() {
  const [view, setView] = useState<'loading' | 'login' | 'dash'>('loading');
  const [staff, setStaff] = useState<Staff | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [tab, setTab] = useState<'queue' | 'users' | 'news' | 'vault' | 'honor' | 'bills' | 'leads' | 'tips' | 'account'>('queue');
  const [tips, setTips] = useState<{ id: string; category: string | null; message: string; createdAt: string }[]>([]);
  const [billJur, setBillJur] = useState('');
  const [billMsg, setBillMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [billBusy, setBillBusy] = useState(false);
  const [leadQ, setLeadQ] = useState({ query: '', jurisdiction: '' });
  const [leadMsg, setLeadMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [leadBusy, setLeadBusy] = useState(false);
  const [leads, setLeads] = useState<{ id: string; title: string; summary: string; jurisdiction: string | null; citations: { url: string }[] }[]>([]);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [queue, setQueue] = useState<{ stories: QueueStory[]; reports: QueueReport[]; cases: QueueCase[]; news: QueueNews[]; tributes: QueueTribute[] }>({ stories: [], reports: [], cases: [], news: [], tributes: [] });
  const [users, setUsers] = useState<Row[]>([]);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/overview');
    if (r.status === 401 || r.status === 403) { setView('login'); return; }
    const d = await r.json();
    if (d.ok) { setStaff(d.data.staff); setOverview(d.data.overview); setView('dash'); loadQueue(); if (d.data.staff.isAdmin) loadUsers(); }
  }, []);
  async function loadQueue() { const d = await (await fetch('/api/admin/queue')).json(); if (d.ok) setQueue(d.data); }
  async function loadUsers() { const d = await (await fetch('/api/admin/users')).json(); if (d.ok) setUsers(d.data); }

  useEffect(() => { load(); }, [load]);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault(); setErr(null);
    const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(login) });
    const d = await r.json();
    if (!r.ok || !d.ok) { setErr(d?.error?.message ?? 'Login failed.'); return; }
    setView('loading'); load();
  }

  async function moderate(kind: 'stories' | 'reports' | 'vault' | 'news', id: string, action: 'approve' | 'remove') {
    await fetch(`/api/admin/${kind}/${id}/moderate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    loadQueue(); load();
  }
  async function moderateTribute(id: string, action: 'approve' | 'remove') {
    await fetch(`/api/admin/honor/tributes/${id}/moderate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    loadQueue(); load();
  }
  async function setStatus(id: string, toStatus: string) {
    await fetch(`/api/admin/reports/${id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toStatus, rationale: `Set to ${toStatus} by staff.` }) });
    loadQueue();
  }
  async function grant(userId: string, capability: string, value: boolean) {
    await fetch(`/api/admin/users/${userId}/capability`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ capability, value }) });
    loadUsers();
  }
  async function syncBills(e: React.FormEvent) {
    e.preventDefault(); setBillMsg(null); setBillBusy(true);
    const r = await fetch('/api/admin/legislation/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jurisdiction: billJur.trim() }) });
    const d = await r.json(); setBillBusy(false);
    if (r.ok && d.ok) setBillMsg({ ok: true, text: `Synced ${d.data.synced} bills for ${d.data.jurisdiction}.` });
    else setBillMsg({ ok: false, text: d?.error?.message ?? 'Sync failed.' });
  }
  async function syncAll() {
    setBillMsg(null); setBillBusy(true);
    const r = await fetch('/api/admin/legislation/sync-all', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    const d = await r.json(); setBillBusy(false);
    if (r.ok && d.ok) {
      const done = d.data.results.map((x: { jurisdiction: string; synced?: number; error?: string }) => x.error ? `${x.jurisdiction} ✗` : `${x.jurisdiction} (${x.synced})`).join(', ');
      setBillMsg({ ok: true, text: `Synced ${d.data.totalSynced} bills from this batch: ${done}. Click again to continue through all ${d.data.totalJurisdictions}.` });
    } else setBillMsg({ ok: false, text: d?.error?.message ?? 'Batch sync failed.' });
  }
  async function syncFederal() {
    setBillMsg(null); setBillBusy(true);
    const r = await fetch('/api/admin/legislation/sync-federal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    const d = await r.json(); setBillBusy(false);
    if (r.ok && d.ok) setBillMsg({ ok: true, text: `Synced ${d.data.synced} U.S. Congress bills (LegiScan).` });
    else setBillMsg({ ok: false, text: d?.error?.message ?? 'Federal sync failed.' });
  }
  async function loadLeads() { const d = await (await fetch('/api/admin/leads')).json(); if (d.ok) setLeads(d.data); }
  async function loadTips() { const d = await (await fetch('/api/admin/whistleblower')).json(); if (d.ok) setTips(d.data); }
  async function setTipStatus(id: string, status: 'REVIEWED' | 'ARCHIVED') {
    await fetch(`/api/admin/whistleblower/${id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setTips((ts) => ts.filter((t) => t.id !== id));
  }
  async function discoverLeads(e: React.FormEvent) {
    e.preventDefault(); setLeadMsg(null); setLeadBusy(true);
    const r = await fetch('/api/admin/leads/discover', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: leadQ.query.trim(), jurisdiction: leadQ.jurisdiction.trim() || undefined }) });
    const d = await r.json(); setLeadBusy(false);
    if (r.ok && d.ok) { setLeadMsg({ ok: true, text: `Found ${d.data.created} lead(s) for “${d.data.query}”. Verify each before creating content.` }); loadLeads(); }
    else setLeadMsg({ ok: false, text: d?.error?.message ?? 'Discovery failed.' });
  }
  async function dismissLead(id: string) {
    await fetch(`/api/admin/leads/${id}/dismiss`, { method: 'POST' });
    setLeads((ls) => ls.filter((l) => l.id !== id));
  }
  async function promoteLead(id: string) {
    const r = await fetch(`/api/admin/leads/${id}/promote`, { method: 'POST' });
    const d = await r.json();
    if (r.ok && d.ok) { setLeads((ls) => ls.filter((l) => l.id !== id)); setLeadMsg({ ok: true, text: 'Draft created in the Review queue (held, unverified). Verify the sources, then approve or remove it there.' }); }
    else setLeadMsg({ ok: false, text: d?.error?.message ?? 'Could not create draft.' });
  }
  async function changePassword(e: React.FormEvent) {
    e.preventDefault(); setPwMsg(null);
    const r = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pw) });
    const d = await r.json();
    if (r.ok && d.ok) { setPw({ currentPassword: '', newPassword: '' }); setPwMsg({ ok: true, text: d.data.message }); }
    else {
      const errs = Array.isArray(d?.error?.details) ? d.error.details.join(' ') : '';
      setPwMsg({ ok: false, text: `${d?.error?.message ?? 'Could not change password.'} ${errs}`.trim() });
    }
  }

  if (view === 'loading') return <div className="hov-root"><div className="adm"><div className="hov-wrap" style={{ color: '#8b96ab' }}>Loading…</div></div></div>;

  if (view === 'login') return (
    <div className="hov-root"><div className="auth-wrap">
      <form className="auth-card" onSubmit={doLogin}>
        <span className="adm-flag a" style={{ marginBottom: 10, display: 'inline-block' }}>ADMIN</span>
        <h1>Staff sign-in</h1>
        <p className="sub">This area is for moderators and administrators.</p>
        {err && <div className="auth-err">{err}</div>}
        <input className="auth-field" type="email" placeholder="Email" required value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
        <input className="auth-field" type="password" placeholder="Password" required value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
        <button className="hb hb-red hb-lg" type="submit">Sign in</button>
        <p className="auth-alt"><a href="/">← Back to site</a></p>
      </form>
    </div></div>
  );

  return (
    <div className="hov-root"><div className="adm"><div className="hov-wrap">
      <div className="adm-bar">
        <span className="pill">{staff?.isAdmin ? 'ADMIN' : 'MODERATOR'}</span>
        <b style={{ color: '#fff', fontSize: 20 }}>hearOURvoices staff</b>
        <span style={{ marginLeft: 'auto', color: '#8b96ab', fontSize: 14 }}>{staff?.displayName}</span>
        <a href="/api/auth/logout" onClick={async (e) => { e.preventDefault(); await fetch('/api/auth/logout', { method: 'POST' }); location.reload(); }} className="adm-btn small">Sign out</a>
      </div>

      {overview && (
        <div className="adm-grid">
          <div className="adm-stat"><b>{overview.users}</b><span>Users</span></div>
          <div className="adm-stat"><b>{overview.stories}</b><span>Stories live</span></div>
          <div className={`adm-stat${overview.storiesHeld ? ' warn' : ''}`}><b>{overview.storiesHeld}</b><span>Stories held</span></div>
          <div className="adm-stat"><b>{overview.reports}</b><span>Reports live</span></div>
          <div className={`adm-stat${overview.reportsHeld ? ' warn' : ''}`}><b>{overview.reportsHeld}</b><span>Reports held</span></div>
          <div className={`adm-stat${overview.casesHeld ? ' warn' : ''}`}><b>{overview.casesHeld}</b><span>Vault cases held</span></div>
          <div className={`adm-stat${overview.newsHeld ? ' warn' : ''}`}><b>{overview.newsHeld}</b><span>Civic news held</span></div>
          <div className={`adm-stat${overview.tributesHeld ? ' warn' : ''}`}><b>{overview.tributesHeld}</b><span>Tributes held</span></div>
        </div>
      )}

      <div className="adm-tabs">
        <button className={`adm-tab${tab === 'queue' ? ' on' : ''}`} onClick={() => setTab('queue')}>Review queue</button>
        <button className={`adm-tab${tab === 'news' ? ' on' : ''}`} onClick={() => setTab('news')}>Add Civic News</button>
        <button className={`adm-tab${tab === 'vault' ? ' on' : ''}`} onClick={() => setTab('vault')}>Add Vault Case</button>
        <button className={`adm-tab${tab === 'honor' ? ' on' : ''}`} onClick={() => setTab('honor')}>Add Hero</button>
        {staff?.isAdmin && <button className={`adm-tab${tab === 'bills' ? ' on' : ''}`} onClick={() => setTab('bills')}>Legislation</button>}
        {staff?.isAdmin && <button className={`adm-tab${tab === 'leads' ? ' on' : ''}`} onClick={() => { setTab('leads'); loadLeads(); }}>Leads (AI)</button>}
        <button className={`adm-tab${tab === 'tips' ? ' on' : ''}`} onClick={() => { setTab('tips'); loadTips(); }}>Secure Tips</button>
        {staff?.isAdmin && <button className={`adm-tab${tab === 'users' ? ' on' : ''}`} onClick={() => setTab('users')}>Users</button>}
        <button className={`adm-tab${tab === 'account' ? ' on' : ''}`} onClick={() => setTab('account')}>Account</button>
      </div>

      {tab === 'news' && <CivicNewsForm />}

      {tab === 'vault' && <JusticeCaseForm />}

      {tab === 'honor' && <HonorHeroForm />}

      {tab === 'bills' && staff?.isAdmin && (
        <div className="adm-item" style={{ maxWidth: 520 }}>
          <h4>Sync legislation (OpenStates)</h4>
          <p style={{ color: '#8b96ab', fontSize: 13 }}>
            Pulls the latest bills, sponsors, and votes for a jurisdiction from the public OpenStates API and caches them for <a href="/bills" style={{ color: '#7fb0e8' }}>/bills</a>.
            Requires <code style={{ color: '#7fb0e8' }}>OPENSTATES_API_KEY</code> to be set. Use a state name (e.g. <b>Texas</b>) or <b>United States</b> for Congress.
          </p>
          <form onSubmit={syncBills}>
            <input className="auth-field" placeholder="Jurisdiction (e.g. Texas)" value={billJur} onChange={(e) => setBillJur(e.target.value)} />
            {billMsg && <div className={billMsg.ok ? 'auth-ok' : 'auth-err'} style={{ marginBottom: 12 }}>{billMsg.text}</div>}
            <button className="hb hb-red" type="submit" disabled={billBusy || billJur.trim().length < 2}>{billBusy ? 'Syncing…' : 'Sync this state'}</button>
          </form>
          <div className="sh-actions" style={{ gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <button className="hb hb-ghost" onClick={syncAll} disabled={billBusy}>{billBusy ? 'Working…' : 'Sync all (50 states + DC) — batch'}</button>
            <button className="hb hb-ghost" onClick={syncFederal} disabled={billBusy}>{billBusy ? 'Working…' : 'Sync U.S. Congress (LegiScan)'}</button>
          </div>
          <p style={{ color: '#8b96ab', fontSize: 12.5, marginTop: 10 }}>
            “Sync all” pulls the stalest handful per click (rate-limited) — click a few times to cover all 51. A daily
            cron keeps them fresh automatically. For a full one-shot, run <code style={{ color: '#7fb0e8' }}>prisma/sync-all-legislation.ts</code>.
          </p>
        </div>
      )}

      {tab === 'leads' && staff?.isAdmin && (
        <div>
          <div className="adm-item" style={{ maxWidth: 560 }}>
            <h4>Discover leads (Grok Live Search)</h4>
            <p style={{ color: '#8b96ab', fontSize: 13 }}>
              Surfaces what’s being reported/discussed on X, news, and the web about a civic topic. These are
              <b style={{ color: '#f3a29c' }}> UNVERIFIED research tips</b> — nothing here is public. Open the source links,
              confirm against a primary source, then create real content via <b>Add Civic News</b>. Requires <code style={{ color: '#7fb0e8' }}>XAI_API_KEY</code>.
            </p>
            <form onSubmit={discoverLeads}>
              <input className="auth-field" placeholder="Topic (e.g. Texas voting bill, Amite County police)" value={leadQ.query} onChange={(e) => setLeadQ({ ...leadQ, query: e.target.value })} required minLength={3} />
              <input className="auth-field" placeholder="Jurisdiction (optional, e.g. Texas)" value={leadQ.jurisdiction} onChange={(e) => setLeadQ({ ...leadQ, jurisdiction: e.target.value })} />
              {leadMsg && <div className={leadMsg.ok ? 'auth-ok' : 'auth-err'} style={{ marginBottom: 12 }}>{leadMsg.text}</div>}
              <button className="hb hb-red" type="submit" disabled={leadBusy || leadQ.query.trim().length < 3}>{leadBusy ? 'Searching…' : 'Discover leads'}</button>
            </form>
            <div style={{ marginTop: 14, borderTop: '1px solid #26314a', paddingTop: 12 }}>
              <b style={{ color: '#c3ccdb', fontSize: 13 }}>Before turning any lead into content, verify it:</b>
              <ul style={{ color: '#8b96ab', fontSize: 13, lineHeight: 1.7, margin: '6px 0 0', paddingLeft: 18 }}>
                <li>Open each source link — does a <b>primary source</b> (official record, named outlet) back the claim?</li>
                <li>Is it about a <b>public action</b> (a vote, bill, ruling, meeting) — not a private individual?</li>
                <li>State only what the record shows. If it’s contested, frame it as a <b>question</b>, not a fact.</li>
                <li>No primary source? <b>Dismiss it.</b> A lead is a tip, never proof.</li>
              </ul>
            </div>
          </div>
          {leads.length === 0 ? (
            <p style={{ color: '#8b96ab' }}>No leads waiting. Run a search above.</p>
          ) : leads.map((l) => (
            <div key={l.id} className="adm-item">
              <div className="meta">🔎 AI lead · UNVERIFIED{l.jurisdiction ? ` · ${l.jurisdiction}` : ''}</div>
              <h4>{l.title}</h4>
              <p>{l.summary}</p>
              {l.citations?.length > 0 && (
                <p style={{ fontSize: 13 }}>Sources to verify: {l.citations.slice(0, 6).map((c, i) => (
                  <a key={i} href={c.url} target="_blank" rel="noreferrer" style={{ color: '#7fb0e8', marginRight: 10 }}>[{i + 1}]</a>
                ))}</p>
              )}
              <div className="adm-actions">
                <button className="adm-btn small green" onClick={() => promoteLead(l.id)}>Start a draft (held for review)</button>
                <button className="adm-btn small" onClick={() => dismissLead(l.id)}>Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'tips' && (
        <div>
          <p style={{ color: '#8b96ab', fontSize: 13, marginBottom: 12 }}>
            Anonymous whistleblower tips, decrypted for review. There is no sender identity to see — by design.
            Verify independently before acting; treat every tip as unconfirmed.
          </p>
          {tips.length === 0 ? (
            <p style={{ color: '#8b96ab' }}>No new tips.</p>
          ) : tips.map((t) => (
            <div key={t.id} className="adm-item">
              <div className="meta">🔒 Secure tip{t.category ? ` · ${t.category}` : ''} · {new Date(t.createdAt).toLocaleString()}</div>
              <p style={{ whiteSpace: 'pre-wrap' }}>{t.message}</p>
              <div className="adm-actions">
                <button className="adm-btn small green" onClick={() => setTipStatus(t.id, 'REVIEWED')}>Mark reviewed</button>
                <button className="adm-btn small" onClick={() => setTipStatus(t.id, 'ARCHIVED')}>Archive</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'account' && (
        <div className="adm-item" style={{ maxWidth: 460 }}>
          <h4>Change your password</h4>
          <p>Use a strong password (12+ characters, upper &amp; lower case, a number, and a symbol). Changing it signs you out of all other devices.</p>
          <form onSubmit={changePassword}>
            <input className="auth-field" type="password" placeholder="Current password" required
              value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
            <input className="auth-field" type="password" placeholder="New password" required minLength={12}
              value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
            {pwMsg && <div className={pwMsg.ok ? 'auth-ok' : 'auth-err'} style={{ marginBottom: 12 }}>{pwMsg.text}</div>}
            <button className="hb hb-red" type="submit">Update password</button>
          </form>
        </div>
      )}

      {tab === 'queue' && (
        <div>
          {queue.stories.length === 0 && queue.reports.length === 0 && queue.cases.length === 0 && queue.news.length === 0 && queue.tributes.length === 0 && <p style={{ color: '#8b96ab' }}>Nothing waiting for review. 🎉</p>}
          {queue.tributes.map((t) => (
            <div key={t.id} className="adm-item">
              <div className="meta">🕯️ Honor tribute · for {t.hero.rank ? `${t.hero.rank} ` : ''}{t.hero.heroName}</div>
              <h4>{t.displayName}{t.relationship ? ` · ${t.relationship}` : ''}</h4>
              <p>{t.message}</p>
              <div className="adm-actions">
                <button className="adm-btn green" onClick={() => moderateTribute(t.id, 'approve')}>Approve &amp; post</button>
                <button className="adm-btn red" onClick={() => moderateTribute(t.id, 'remove')}>Remove</button>
              </div>
            </div>
          ))}
          {queue.cases.map((c) => (
            <div key={c.id} className="adm-item">
              <div className="meta">Staged Justice Vault case · {c.caseType}{c.location ? ` · ${c.location}` : ''} · justice gap {c.justiceGapScore}/100{c.spotlightLevel >= 3 ? ' · ★ Never forget' : c.spotlightLevel >= 2 ? ' · Spotlight' : ''}</div>
              <h4>{c.victimName}</h4>
              <p><b style={{ color: '#c3ccdb' }}>What happened:</b> {c.memoryLockPrimary}</p>
              <p><b style={{ color: '#c3ccdb' }}>What failed:</b> {c.memoryLockFailure}</p>
              <div className="adm-actions">
                <a className="adm-btn small" href={`/vault/${c.id}`} target="_blank" rel="noreferrer">Preview full case ↗</a>
                <button className="adm-btn green" onClick={() => moderate('vault', c.id, 'approve')}>Approve &amp; publish</button>
                <button className="adm-btn red" onClick={() => moderate('vault', c.id, 'remove')}>Remove</button>
              </div>
            </div>
          ))}
          {queue.news.map((n) => (
            <div key={n.id} className="adm-item">
              <div className="meta">Staged Civic News · {n.scope} · {n.authority}{n.jurisdiction ? ` · ${n.jurisdiction}` : ''}</div>
              <h4>{n.title}</h4>
              <p>{n.whatHappened.slice(0, 280)}</p>
              <div className="adm-actions">
                <button className="adm-btn green" onClick={() => moderate('news', n.id, 'approve')}>Approve &amp; publish</button>
                <button className="adm-btn red" onClick={() => moderate('news', n.id, 'remove')}>Remove</button>
              </div>
            </div>
          ))}
          {queue.stories.map((s) => (
            <div key={s.id} className="adm-item">
              <div className="meta">Held story · {s.displayName}</div>
              <h4>{s.title ?? 'Untitled'}</h4>
              <p>{s.body.slice(0, 240)}</p>
              <div className="adm-actions">
                <button className="adm-btn green" onClick={() => moderate('stories', s.id, 'approve')}>Approve &amp; publish</button>
                <button className="adm-btn red" onClick={() => moderate('stories', s.id, 'remove')}>Remove</button>
              </div>
            </div>
          ))}
          {queue.reports.map((r) => (
            <div key={r.id} className="adm-item">
              <div className="meta">Held report · {r.lane === 'JOURNALIST' ? 'Journalist' : 'Citizen'} · {r.displayName}</div>
              <h4>{r.title}</h4>
              <p>{r.body.slice(0, 240)}</p>
              <div className="adm-actions">
                <button className="adm-btn green" onClick={() => moderate('reports', r.id, 'approve')}>Approve &amp; publish</button>
                <button className="adm-btn red" onClick={() => moderate('reports', r.id, 'remove')}>Remove</button>
                <select className="adm-sel" defaultValue="" onChange={(e) => e.target.value && setStatus(r.id, e.target.value)}>
                  <option value="">Set claim status…</option>
                  {CLAIM_STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].text}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && staff?.isAdmin && (
        <table className="adm-utable">
          <thead><tr><th>User</th><th>Status</th><th>Roles</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><b style={{ color: '#fff' }}>{u.displayName}</b><br /><span style={{ color: '#8b96ab' }}>{u.email}</span></td>
                <td>{u.status}</td>
                <td>
                  {u.isAdmin && <span className="adm-flag a">Admin</span>}
                  {u.isModerator && <span className="adm-flag m">Mod</span>}
                  {u.isJournalist && <span className="adm-flag j">Journalist</span>}
                </td>
                <td>
                  <div className="adm-actions">
                    <button className="adm-btn small" onClick={() => grant(u.id, 'isModerator', !u.isModerator)}>{u.isModerator ? 'Revoke mod' : 'Make mod'}</button>
                    <button className="adm-btn small" onClick={() => grant(u.id, 'isJournalist', !u.isJournalist)}>{u.isJournalist ? 'Revoke journ.' : 'Make journ.'}</button>
                    <button className="adm-btn small" onClick={() => grant(u.id, 'isAdmin', !u.isAdmin)}>{u.isAdmin ? 'Revoke admin' : 'Make admin'}</button>
                    <button className="adm-btn small red" onClick={() => grant(u.id, 'suspended', u.status !== 'SUSPENDED')}>{u.status === 'SUSPENDED' ? 'Unsuspend' : 'Suspend'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div></div></div>
  );
}
