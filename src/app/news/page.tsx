import type { Metadata } from 'next';
import Link from 'next/link';
import { HovShell } from '@/components/HovShell';
import { NewsJudgment } from '@/components/NewsJudgment';
import { listNews } from '@/lib/civic/service';
import { SCOPE_META, IMPACT_META, type CivicScope } from '@/lib/civic/labels';

export const metadata: Metadata = {
  title: 'Civic News — Public Judgment',
  description: 'Local, state, and national actions by people in power — with evidence, pros and cons, and a public judgment. Neutral and non-partisan.',
};
export const dynamic = 'force-dynamic';

const TABS: [string, string][] = [['all', 'All'], ['LOCAL', 'Local'], ['STATE', 'State'], ['NATION', 'Nation']];

function timeAgo(d: Date) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default async function NewsPage({ searchParams }: { searchParams: { scope?: string } }) {
  const scopeParam = (searchParams.scope ?? 'all').toUpperCase();
  const scope = ['LOCAL', 'STATE', 'NATION'].includes(scopeParam) ? (scopeParam as CivicScope) : undefined;
  let items: Awaited<ReturnType<typeof listNews>>['items'] = [];
  try { ({ items } = await listNews({ scope })); } catch { items = []; }

  return (
    <HovShell active="news">
      <div className="hov-page">
        <div className="hov-wrap">
          <p className="pg-eyebrow">CIVIC NEWS · PUBLIC JUDGMENT</p>
          <h1>What people in power are doing</h1>
          <p className="lead">
            Local, state, and national actions — a bill passed without a recorded vote, an amendment slipped in
            last minute, a decision by police, a city council, Congress, or the President. Each item shows{' '}
            <b>what happened</b>, <b>why it matters</b>, the <b>pros and cons</b>, and the <b>evidence</b>. Then{' '}
            <b>you</b> judge it. We stay neutral — the verdict is the public&apos;s.
          </p>

          <div className="nw-tabs">
            {TABS.map(([slug, label]) => (
              <Link key={slug} href={slug === 'all' ? '/news' : `/news?scope=${slug.toLowerCase()}`}
                className={`nw-tab${(scope ?? 'ALL') === slug || (!scope && slug === 'all') ? ' on' : ''}`}>{label}</Link>
            ))}
          </div>

          {items.length === 0 ? (
            <div className="sh-card" style={{ textAlign: 'center', color: '#9aa6bd' }}>No civic news here yet.</div>
          ) : (
            items.map((n) => (
              <Link key={n.id} href={`/news/${n.id}`} className="nw-card">
                <div className="nw-top">
                  <span className="nw-scope" style={{ background: SCOPE_META[n.scope as CivicScope].color }}>{SCOPE_META[n.scope as CivicScope].text}</span>
                  <span className="nw-actor">{n.actorType}{n.jurisdiction ? ` · ${n.jurisdiction}` : ''} · {timeAgo(n.createdAt)}</span>
                </div>
                <h2 className="nw-title">{n.title}</h2>
                <p className="nw-why"><b>Why it matters:</b> {n.whyItMatters.slice(0, 180)}{n.whyItMatters.length > 180 ? '…' : ''}</p>
                <div className="nw-impact">
                  {[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= n.impactLevel ? 'on' : ''} />)}
                  <span>Impact: {IMPACT_META[n.impactLevel]}</span>
                </div>
                <NewsJudgment judgment={n.judgment} />
              </Link>
            ))
          )}
          <p className="nw-disc">Always confirm political information with trusted primary sources. Verdicts shown here are public opinion, not statements of fact by hearOURvoices.</p>
        </div>
      </div>
    </HovShell>
  );
}
