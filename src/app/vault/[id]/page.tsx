import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { HovShell } from '@/components/HovShell';
import { getCase } from '@/lib/vault/service';
import { getStaffUser } from '@/lib/auth/admin';
import {
  CASE_STATUS_META, GAP_META, SCORE_META,
  type CaseStatus, type TimelineEvent, type AuthorityAction, type OpenQuestion, type ContradictionFlag, type CaseSource, type ScoreTag,
} from '@/lib/vault/labels';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try { const c = await getCase(params.id); if (c) return { title: `${c.victimName} — Justice Vault`, description: c.memoryLockPrimary }; }
  catch { /* ignore */ }
  return { title: 'Justice Vault' };
}

const EV: Record<string, { text: string; color: string }> = {
  DOCUMENTED: { text: 'Documented', color: '#1c9d5b' }, RECORDED: { text: 'Recorded', color: '#3a8fd6' },
  MISSING: { text: 'Missing', color: '#e0752f' }, UNVERIFIED: { text: 'Unverified', color: '#d9a334' },
};

export default async function CasePage({ params }: { params: { id: string } }) {
  // Staff may preview cases that are still pending review (not yet public).
  const staff = await getStaffUser().catch(() => null);
  const isStaff = !!(staff?.isModerator || staff?.isAdmin);
  let c;
  try { c = await getCase(params.id, { includeUnpublished: isStaff }); } catch { c = null; }
  if (!c) notFound();
  const pending = c.publishState !== 'PUBLISHED';
  const gap = GAP_META(c.justiceGapScore);
  const timeline = (c.timeline as unknown as TimelineEvent[]) ?? [];
  const actions = (c.actions as unknown as AuthorityAction[]) ?? [];
  const questions = (c.questions as unknown as OpenQuestion[]) ?? [];
  const flags = (c.flags as unknown as ContradictionFlag[]) ?? [];
  const sources = (c.sources as unknown as CaseSource[]) ?? [];

  return (
    <HovShell active="vault">
      <div className="hov-page">
        <div className="hov-wrap" style={{ maxWidth: 760 }}>
          <Link href="/vault" style={{ color: '#8b96ab', fontWeight: 600 }}>← The Justice Vault</Link>

          {pending && (
            <div className="jv-flag" style={{ marginTop: 12 }}>
              <b>⏳ Staff preview — not public</b>
              <span>This case is staged for review and is only visible to staff. Approve it from the admin review queue to publish.</span>
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            {c.spotlightLevel >= 2 && <span className="jv-spot" style={{ position: 'static', display: 'inline-block', marginBottom: 8 }}>{c.spotlightLevel >= 3 ? '★ Never forget' : 'Spotlight'}</span>}
            <h1 style={{ font: "900 32px 'Inter'", color: '#fff', margin: '4px 0 4px' }}>{c.victimName}{c.victimAge ? `, ${c.victimAge}` : ''}</h1>
            <div className="jv-meta">{c.caseType}{c.location ? ` · ${c.location}` : ''}{c.dateOfIncident ? ` · ${new Date(c.dateOfIncident).toLocaleDateString('en-US')}` : ''} · <span style={{ color: CASE_STATUS_META[c.status as CaseStatus].color }}>{CASE_STATUS_META[c.status as CaseStatus].text}</span></div>
          </div>

          {/* Two-sentence memory lock */}
          <div className="jv-lock"><b>What happened</b><span>{c.memoryLockPrimary}</span></div>
          <div className="jv-lock"><b>What failed</b><span>{c.memoryLockFailure}</span></div>

          <div className="jv-gap">
            <div className="jv-gapbar"><i style={{ width: `${c.justiceGapScore}%`, background: gap.color }} /></div>
            <span className="jv-gaptext" style={{ color: gap.color }}>{gap.text} — {c.justiceGapScore}/100</span>
          </div>

          {c.anchorPhrases.length > 0 && (
            <div style={{ margin: '16px 0' }}>{c.anchorPhrases.map((p, i) => <p key={i} className="jv-anchor">&ldquo;{p}&rdquo;</p>)}</div>
          )}

          {(c.whatWasLost || c.favoriteActivities || c.personalityWords.length > 0) && (
            <div className="jv-sec">
              <h3>Who they were</h3>
              {c.whatWasLost && <p style={{ color: '#e7ecf5', fontSize: 16, margin: '0 0 10px', lineHeight: 1.6 }}>{c.whatWasLost}</p>}
              {c.favoriteActivities && <p style={{ color: '#c3ccdb', fontSize: 14.5, margin: '0 0 10px' }}>Loved: {c.favoriteActivities}</p>}
              {c.personalityWords.length > 0 && <div className="jv-words">{c.personalityWords.map((w, i) => <span key={i}>{w}</span>)}</div>}
            </div>
          )}

          {timeline.length > 0 && (
            <div className="jv-sec">
              <h3>Timeline</h3>
              {timeline.map((e, i) => (
                <div key={i} className="jv-tl">
                  <div className="dot" />
                  <div className="ev">
                    {e.date && <time>{e.date}</time>}
                    <h4>{e.label}{e.scoreTag && <span className="jv-tag" style={{ background: SCORE_META[e.scoreTag as ScoreTag].color }}>{SCORE_META[e.scoreTag as ScoreTag].text}</span>}</h4>
                    <p>{e.description}{e.sourceUrl && <> · <a href={e.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#7fb0e8' }}>source</a></>}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {actions.length > 0 && (
            <div className="jv-sec">
              <h3>Authority actions (judged neutrally)</h3>
              {actions.map((a, i) => {
                const m = SCORE_META[a.scoreTag as ScoreTag];
                return (
                  <div key={i} className="jv-act">
                    <div className="who">{m.emoji} <b style={{ color: m.color }}>{m.text}</b> · {a.actorType}{a.actorName ? ` — ${a.actorName}` : ''}{a.impactWeight ? ` · impact ${a.impactWeight}/10` : ''}</div>
                    <p>{a.description}</p>
                  </div>
                );
              })}
            </div>
          )}

          {flags.length > 0 && (
            <div className="jv-sec">
              <h3>Contradiction markers (tension, not accusation)</h3>
              {flags.map((f, i) => <div key={i} className="jv-flag"><b>⚠ {f.flag}</b><span>{f.reason}</span></div>)}
            </div>
          )}

          {questions.length > 0 && (
            <div className="jv-sec">
              <h3>Open questions</h3>
              {questions.map((q, i) => <div key={i} className="jv-q"><p>{q.questionText}</p><span className="qm">To: {q.targetAuthority} · {q.status}</span></div>)}
            </div>
          )}

          {sources.length > 0 && (
            <div className="jv-sec">
              <h3>Sources</h3>
              {sources.map((s, i) => {
                const e = EV[s.label] ?? { text: s.label, color: '#8b96ab' };
                return (
                  <div key={i} className="nw-src">
                    <span className="lb" style={{ background: e.color }}>{e.text}</span>
                    <b>{s.title}</b>
                    {s.url && <a href={s.url} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto' }}><ExternalLink size={14} /> source</a>}
                  </div>
                );
              })}
            </div>
          )}

          <p className="jv-disc">
            Charges and verdicts are stated exactly as recorded. This page judges actions and highlights
            unanswered questions — it does not accuse any individual. Confirm with trusted primary sources.
          </p>
        </div>
      </div>
    </HovShell>
  );
}
