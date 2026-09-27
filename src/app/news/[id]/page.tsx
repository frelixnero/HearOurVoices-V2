import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { HovShell } from '@/components/HovShell';
import { NewsVote } from '@/components/NewsVote';
import { getNews } from '@/lib/civic/service';
import { getCurrentUser } from '@/lib/auth/session';
import { SCOPE_META, EVIDENCE_META, PROCESS_CHECKS, IMPACT_META, ACTION_META, detectRedFlags, type CivicScope, type EvidenceLabel, type ActionType } from '@/lib/civic/labels';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try { const n = await getNews(params.id); if (n) return { title: n.title, description: n.whyItMatters.slice(0, 150) }; }
  catch { /* ignore */ }
  return { title: 'Civic News' };
}

export default async function NewsDetail({ params }: { params: { id: string } }) {
  const user = await getCurrentUser().catch(() => null);
  let n;
  try { n = await getNews(params.id, user?.id); } catch { n = null; }
  if (!n) notFound();
  const proc = n as unknown as Record<string, boolean | null>;
  const redFlags = detectRedFlags(proc);
  const mod = n.actionType ? ACTION_META[n.actionType as ActionType] : null;
  const nextStep = n.nextStep || mod?.nextHint || null;

  return (
    <HovShell active="news">
      <div className="hov-page">
        <div className="hov-wrap" style={{ maxWidth: 760 }}>
          <Link href="/news" style={{ color: '#8b96ab', fontWeight: 600 }}>← All civic news</Link>
          <div className="nw-top" style={{ marginTop: 14 }}>
            <span className="nw-scope" style={{ background: SCOPE_META[n.scope as CivicScope].color }}>{SCOPE_META[n.scope as CivicScope].text}</span>
            <span className="nw-actor">{n.actorType}{n.actorName ? ` — ${n.actorName}` : ''}{n.jurisdiction ? ` · ${n.jurisdiction}` : ''}</span>
          </div>
          <h1 style={{ font: "900 30px/1.18 'Inter'", color: '#fff', margin: '4px 0 10px' }}>{n.title}</h1>

          {mod && (
            <div className="nw-module">
              <span className="nw-modchip">{mod.icon} {mod.label}</span>
              <span className="nw-modblurb">{mod.blurb}</span>
            </div>
          )}

          <div className="nw-sec"><h3>What happened</h3><p>{n.whatHappened}</p></div>
          <div className="nw-sec"><h3>What it means</h3><p>{n.whyItMatters}</p></div>

          {(n.pros.length > 0 || n.cons.length > 0) && (
            <div className="nw-sec">
              <h3>Pros &amp; cons (neutral tradeoffs)</h3>
              <div className="nw-pc">
                <div className="col pros"><h4>👍 In favor</h4><ul>{n.pros.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
                <div className="col cons"><h4>👎 Against</h4><ul>{n.cons.map((c, i) => <li key={i}>{c}</li>)}</ul></div>
              </div>
            </div>
          )}

          {nextStep && (
            <div className="nw-sec">
              <h3>What happens next</h3>
              <div className="nw-next"><span>➡️</span><p>{nextStep}</p></div>
            </div>
          )}

          {n.alternatives.length > 0 && (
            <div className="nw-sec">
              <h3>Better options that could have been taken</h3>
              <ul className="nw-toplist">{n.alternatives.map((a, i) => <li key={i}>{a}</li>)}</ul>
            </div>
          )}

          {n.powerMap.length > 0 && (
            <div className="nw-sec">
              <h3>Who could have stopped or changed this</h3>
              <ul className="nw-toplist">{n.powerMap.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </div>
          )}

          {redFlags.length > 0 && (
            <div className="nw-redflags">
              <h3>🚩 Red flags in the record ({redFlags.length})</h3>
              <p className="rf-sub">These flags come straight from the documented process below — each one maps to a “no” in the record, not to anyone’s opinion. <Link href="/red-flags">What do these mean?</Link></p>
              {redFlags.map((f) => (
                <div key={f.key} className="rf-item"><b>{f.icon} {f.title}</b><span>{f.why}</span></div>
              ))}
            </div>
          )}

          <div className="nw-sec">
            <h3>Process check</h3>
            <div className="nw-checks">
              {PROCESS_CHECKS.map((c) => {
                const v = proc[c.key];
                const cls = v === true ? 'yes' : v === false ? 'no' : 'unk';
                const mk = v === true ? '✓' : v === false ? '✕' : '?';
                return <div key={c.key} className="nw-check"><span className={`mk ${cls}`}>{mk}</span>{c.label}</div>;
              })}
            </div>
          </div>

          <div className="nw-sec">
            <h3>Impact</h3>
            <div className="nw-impact" style={{ marginBottom: 0 }}>
              {[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= n.impactLevel ? 'on' : ''} />)}
              <span>{n.impactLevel}/5 — {IMPACT_META[n.impactLevel]}</span>
            </div>
          </div>

          <div className="nw-sec">
            <h3>Evidence</h3>
            {n.sources.length === 0 ? <p style={{ fontSize: 14, color: '#8b96ab' }}>No sources attached yet.</p> : n.sources.map((s) => (
              <div key={s.id} className="nw-src">
                <span className="lb" style={{ background: EVIDENCE_META[s.label as EvidenceLabel].color }}>{EVIDENCE_META[s.label as EvidenceLabel].text}</span>
                <b>{s.title}</b>
                {s.url && <a href={s.url} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto' }}><ExternalLink size={14} /> source</a>}
              </div>
            ))}
          </div>

          <h2 style={{ color: '#fff', fontSize: 20, margin: '24px 0 6px' }}>Public judgment</h2>
          <NewsVote newsId={n.id} initial={n.judgment} initialVerdict={n.myVote?.verdict} initialReason={n.myVote?.reason} />

          {n.topReasons.length > 0 && (
            <div className="nw-sec" style={{ marginTop: 18 }}>
              <h3>Top reasons people gave</h3>
              <ul className="nw-toplist">{n.topReasons.map((r, i) => <li key={i}>&ldquo;{r.reason}&rdquo; <span style={{ color: '#8b96ab' }}>· {r.count}</span></li>)}</ul>
            </div>
          )}

          {n.history.length > 0 && (
            <div className="nw-sec">
              <h3>History — past actions involving {n.actorName ?? n.actorType}</h3>
              {n.history.map((h) => (
                <Link key={h.id} href={`/news/${h.id}`} style={{ display: 'block', padding: '8px 0', borderBottom: '1px solid #26314a', color: '#cfd6e4' }}>
                  {h.title} <span style={{ color: '#8b96ab', fontSize: 13 }}>· {h.judgment.total > 0 ? `${h.judgment.badPct}% Bad / ${h.judgment.goodPct}% Good` : 'no votes yet'}</span>
                </Link>
              ))}
            </div>
          )}

          <p className="nw-disc">Always confirm political information with trusted primary sources. Verdicts are public opinion, not statements of fact by hearOURvoices.</p>
        </div>
      </div>
    </HovShell>
  );
}
