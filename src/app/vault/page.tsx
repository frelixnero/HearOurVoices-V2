import type { Metadata } from 'next';
import Link from 'next/link';
import { HovShell } from '@/components/HovShell';
import { listCases } from '@/lib/vault/service';
import { CASE_STATUS_META, GAP_META, type CaseStatus } from '@/lib/vault/labels';

export const metadata: Metadata = {
  title: 'The Justice Vault',
  description: 'Spotlight cases kept in memory — the facts, the timeline, the authority actions, and the questions that remain unanswered.',
};
export const dynamic = 'force-dynamic';

export default async function VaultPage() {
  let cases: Awaited<ReturnType<typeof listCases>> = [];
  try { cases = await listCases(); } catch { cases = []; }

  return (
    <HovShell active="vault">
      <div className="hov-page">
        <div className="hov-wrap">
          <div className="jv-hero">
            <p className="pg-eyebrow" style={{ color: '#f3a29c' }}>THE JUSTICE VAULT</p>
            <h1>Some cases must not be forgotten.</h1>
            <p>
              The Vault keeps spotlight cases in memory — with a facts-only spine, a clear timeline,
              the actions authorities took, and the questions that remain unanswered. We state charges
              and verdicts exactly as recorded, and we judge <b>actions</b>, never label a person.
            </p>
          </div>

          {cases.length === 0 ? (
            <div className="sh-card" style={{ textAlign: 'center', color: '#9aa6bd' }}>No cases in the Vault yet.</div>
          ) : (
            cases.map((c) => {
              const gap = GAP_META(c.justiceGapScore);
              return (
                <Link key={c.id} href={`/vault/${c.id}`} className={`jv-card${c.spotlightLevel >= 3 ? ' lvl3' : ''}`}>
                  {c.spotlightLevel >= 2 && <span className="jv-spot">{c.spotlightLevel >= 3 ? '★ Never forget' : 'Spotlight'}</span>}
                  <h2 className="jv-name">{c.victimName}{c.victimAge ? `, ${c.victimAge}` : ''}</h2>
                  <div className="jv-meta">
                    {c.caseType}{c.location ? ` · ${c.location}` : ''} ·{' '}
                    <span style={{ color: CASE_STATUS_META[c.status as CaseStatus].color }}>{CASE_STATUS_META[c.status as CaseStatus].text}</span>
                  </div>
                  <div className="jv-lock"><b>What happened</b><span>{c.memoryLockPrimary}</span></div>
                  <div className="jv-lock"><b>What failed</b><span>{c.memoryLockFailure}</span></div>
                  <div className="jv-gap">
                    <div className="jv-gapbar"><i style={{ width: `${c.justiceGapScore}%`, background: gap.color }} /></div>
                    <span className="jv-gaptext" style={{ color: gap.color }}>Justice gap {c.justiceGapScore}/100</span>
                  </div>
                </Link>
              );
            })
          )}
          <p className="jv-disc">
            Demonstration cases here are fictional. Real cases are added only with verified public records
            and legal review. Always confirm information with trusted primary sources.
          </p>
        </div>
      </div>
    </HovShell>
  );
}
