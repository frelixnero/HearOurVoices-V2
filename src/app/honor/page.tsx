import type { Metadata } from 'next';
import Link from 'next/link';
import { HovShell } from '@/components/HovShell';
import { listHeroes } from '@/lib/honor/service';
import { CATEGORY_META, nationalDayToday, rememberedToday, type HonorCategory, type KeyDate } from '@/lib/honor/labels';

export const metadata: Metadata = {
  title: 'The Honor Vault',
  description: 'A permanent record of military service and sacrifice — so no hero is ever forgotten.',
};
export const dynamic = 'force-dynamic';

export default async function HonorPage() {
  let heroes: Awaited<ReturnType<typeof listHeroes>> = [];
  try { heroes = await listHeroes(); } catch { heroes = []; }
  const today = new Date();
  const national = nationalDayToday(today);
  const remembered = heroes.filter((h) => rememberedToday((h.keyDates as unknown as KeyDate[]) ?? [], today));

  return (
    <HovShell active="honor">
      <div className="hov-page">
        <div className="hov-wrap">
          <div className="hn-hero">
            <p className="pg-eyebrow" style={{ color: '#c9a227' }}>THE HONOR VAULT</p>
            <h1>So no hero is ever forgotten.</h1>
            <p>
              A permanent, factual record of military service and sacrifice — the fallen, the decorated, the
              life-savers, and the veterans who kept serving at home. Every entry is respectful and sourced.
            </p>
          </div>

          {(national || remembered.length > 0) && (
            <div className="hn-remember">
              <h3>🇺🇸 Remembered today{national ? ` — ${national}` : ''}</h3>
              {national && <p style={{ color: '#e7d9a8', margin: '0 0 8px' }}>On {national}, we resurface every hero in the Vault.</p>}
              {remembered.map((h) => (
                <Link key={h.id} href={`/honor/${h.id}`} className="hn-remember-item">
                  <b>{h.rank ? `${h.rank} ` : ''}{h.heroName}</b> — {h.memoryLockPrimary}
                </Link>
              ))}
            </div>
          )}

          {heroes.length === 0 ? (
            <div className="sh-card" style={{ textAlign: 'center', color: '#9aa6bd' }}>No heroes in the Vault yet.</div>
          ) : (
            heroes.map((h) => {
              const cat = CATEGORY_META[h.category as HonorCategory];
              return (
                <Link key={h.id} href={`/honor/${h.id}`} className={`hn-card${h.spotlightLevel >= 3 ? ' lvl3' : ''}`}>
                  {h.spotlightLevel >= 2 && <span className="hn-spot">{h.spotlightLevel >= 3 ? '★ Never forget' : 'Spotlight'}</span>}
                  <span className="hn-cat" style={{ background: cat.color }}>{cat.text}</span>
                  <h2 className="hn-name">{h.rank ? `${h.rank} ` : ''}{h.heroName}</h2>
                  <div className="hn-meta">{[h.branch, h.conflictOrEra, h.homeState].filter(Boolean).join(' · ')}</div>
                  <div className="hn-lock"><span>{h.memoryLockPrimary}</span></div>
                  <div className="hn-lock"><span>{h.memoryLockSacrifice}</span></div>
                  {h.medals.length > 0 && <div className="hn-medals">{h.medals.slice(0, 5).map((m) => <span key={m}>🎖 {m}</span>)}</div>}
                  <div className="hn-score" style={{ color: '#c9a227' }}>{(() => { const n = h.candles + h.coins + h.flags + h.stones + h.flowers; return `🕯️ ${n.toLocaleString()} left in remembrance`; })()}</div>
                </Link>
              );
            })
          )}
          <p className="nw-disc">Honor entries are factual and respectful. Real records are added with verified citations. To honor someone, contact the platform team.</p>
        </div>
      </div>
    </HovShell>
  );
}
