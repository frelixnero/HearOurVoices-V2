import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HovShell } from '@/components/HovShell';
import { getHero } from '@/lib/honor/service';
import { HonorRemembrance } from '@/components/HonorRemembrance';
import { CATEGORY_META, type HonorCategory, type HonorQuote, type KeyDate } from '@/lib/honor/labels';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try { const h = await getHero(params.id); if (h) return { title: `${h.rank ? h.rank + ' ' : ''}${h.heroName} — Honor Vault`, description: h.memoryLockPrimary }; }
  catch { /* ignore */ }
  return { title: 'Honor Vault' };
}

export default async function HeroPage({ params }: { params: { id: string } }) {
  let h;
  try { h = await getHero(params.id); } catch { h = null; }
  if (!h) notFound();
  const cat = CATEGORY_META[h.category as HonorCategory];
  const quotes = (h.quotes as unknown as HonorQuote[]) ?? [];
  const keyDates = (h.keyDates as unknown as KeyDate[]) ?? [];
  const tributes = h.tributes.map((t) => ({ ...t, publishedAt: t.publishedAt ? t.publishedAt.toISOString() : null }));

  return (
    <HovShell active="honor">
      <div className="hov-page">
        <div className="hov-wrap" style={{ maxWidth: 760 }}>
          <Link href="/honor" style={{ color: '#56636a', fontWeight: 600 }}>← The Honor Vault</Link>

          <div style={{ marginTop: 14 }}>
            {h.spotlightLevel >= 2 && <span className="hn-spot" style={{ position: 'static', display: 'inline-block', marginBottom: 8 }}>{h.spotlightLevel >= 3 ? '★ Never forget' : 'Spotlight'}</span>}
            <span className="hn-cat" style={{ background: cat.color, marginLeft: h.spotlightLevel >= 2 ? 8 : 0 }}>{cat.text}</span>
            <h1 style={{ font: "900 32px/1.15 'Inter'", color: '#172632', margin: '8px 0 4px' }}>{h.rank ? `${h.rank} ` : ''}{h.heroName}</h1>
            <div className="hn-meta">{[h.branch, h.conflictOrEra, h.homeState].filter(Boolean).join(' · ')}</div>
          </div>

          <div className="hn-lock big"><span>{h.memoryLockPrimary}</span></div>
          <div className="hn-lock big"><span>{h.memoryLockSacrifice}</span></div>

          <HonorRemembrance heroId={h.id} heroName={h.heroName} initial={{ candle: h.candles, coin: h.coins, flag: h.flags, stone: h.stones, flower: h.flowers }} tributes={tributes} />

          {h.medals.length > 0 && (
            <div className="hn-sec"><h3>Medals &amp; honors</h3><div className="hn-medals big">{h.medals.map((m) => <span key={m}>🎖 {m}</span>)}</div></div>
          )}

          {h.memoryPhrases.length > 0 && (
            <div style={{ margin: '16px 0' }}>{h.memoryPhrases.map((p, i) => <p key={i} className="hn-phrase">&ldquo;{p}&rdquo;</p>)}</div>
          )}

          {h.serviceSummary && <div className="hn-sec"><h3>Service</h3><p>{h.serviceSummary}</p></div>}
          {h.momentOfCourage && <div className="hn-sec"><h3>The moment of courage</h3><p>{h.momentOfCourage}</p></div>}
          {h.legacyImpact && <div className="hn-sec"><h3>Legacy &amp; impact</h3><p>{h.legacyImpact}</p></div>}

          {h.chainOfInfluence.length > 0 && (
            <div className="hn-sec"><h3>Chain of influence</h3><ul className="nw-toplist">{h.chainOfInfluence.map((c, i) => <li key={i}>{c}</li>)}</ul></div>
          )}

          {quotes.length > 0 && (
            <div className="hn-sec"><h3>In their own words &amp; those who knew them</h3>
              {quotes.map((q, i) => <blockquote key={i} className="hn-quote">&ldquo;{q.quote}&rdquo;{q.attribution && <cite>— {q.attribution}</cite>}</blockquote>)}
            </div>
          )}

          {keyDates.length > 0 && (
            <div className="hn-sec"><h3>Remembered on</h3>
              <div className="jv-words">{keyDates.map((k, i) => <span key={i}>{k.label}: {k.date}</span>)}</div>
              <p style={{ fontSize: 13, color: '#56636a', margin: '8px 0 0' }}>Plus Memorial Day, Veterans Day, and Independence Day — when the Vault resurfaces every hero.</p>
            </div>
          )}

          <p className="nw-disc">A factual record of honor and service. Confirm details with official citations and family where possible.</p>
        </div>
      </div>
    </HovShell>
  );
}
