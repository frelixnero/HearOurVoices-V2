import type { Metadata } from 'next';
import Link from 'next/link';
import '../dashboard.css';
import '../marketing.css';
import { listElections, getElectionGuide } from '@/lib/elections/service';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'See who is running — HearOURVOICES',
  description: 'A plain and simple guide to the people running for office: what they want, and what they are for and against.',
};
export const dynamic = 'force-dynamic';

function dateLabel(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function ElectionsPage() {
  const elections = await listElections();
  const featured = elections[0];
  const guide = featured ? await getElectionGuide(featured.id) : null;

  if (!guide) {
    return (
      <>
        <SiteHeader />
        <main className="simple">
          <h1 className="big-title">See who is running</h1>
          <div className="empty-simple">
            <p>There is no election coming up right now.</p>
            <p>When one is close, this page will show you every person running and what they want to do.</p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const today = new Date();
  const days = Math.max(0, Math.ceil((guide.electionDate.getTime() - today.getTime()) / 86400000));

  return (
    <>
    <SiteHeader />
    <main className="simple">
      <div className="vote-banner">
        <span className="vote-emoji" aria-hidden="true">🗳️</span>
        <div>
          <h1 className="big-title" style={{ margin: 0 }}>{guide.name}</h1>
          <p className="big-sub">Voting day is {dateLabel(guide.electionDate)} — that is {days} day{days === 1 ? '' : 's'} away.</p>
        </div>
      </div>

      <p className="explain">
        Below is every person running. We show what each one wants to do, and what they are
        <b> for</b> and <b> against</b>. This is not an ad. We do not tell you who to pick.
      </p>

      {guide.races.map((race) => (
        <section key={race.id} className="race">
          <h2 className="race-title">{race.title}</h2>
          {race.description && <p className="race-desc">{race.description}</p>}

          <div className="candidates">
            {race.candidates.map((c) => {
              const fors = c.positions.filter((p) => p.stance === 'for');
              const againsts = c.positions.filter((p) => p.stance === 'against');
              const pros = c.prosCons.filter((p) => p.kind === 'pro');
              const cons = c.prosCons.filter((p) => p.kind === 'con');
              return (
                <article key={c.id} className="cand">
                  <div className="cand-photo" style={{ background: c.photoGradient }} aria-hidden="true">
                    {c.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </div>
                  <h3 className="cand-name">
                    {c.name}
                    {c.incumbent && <span className="chip">In office now</span>}
                  </h3>
                  {c.party && <p className="cand-party">{c.party}</p>}
                  {c.bio && <p className="cand-bio">{c.bio}</p>}

                  {fors.length > 0 && (
                    <div className="stance for">
                      <p className="stance-head">✅ What they want (FOR)</p>
                      <ul>{fors.map((p) => <li key={p.id}><b>{p.topic}:</b> {p.summary}</li>)}</ul>
                    </div>
                  )}
                  {againsts.length > 0 && (
                    <div className="stance against">
                      <p className="stance-head">🚫 What they are AGAINST</p>
                      <ul>{againsts.map((p) => <li key={p.id}><b>{p.topic}:</b> {p.summary}</li>)}</ul>
                    </div>
                  )}

                  {(pros.length > 0 || cons.length > 0) && (
                    <div className="proscon">
                      <div>
                        <p className="pc-head good">👍 Good points</p>
                        <ul>{pros.map((p) => <li key={p.id}>{p.text}</li>)}</ul>
                      </div>
                      <div>
                        <p className="pc-head bad">👎 Worries</p>
                        <ul>{cons.map((p) => <li key={p.id}>{p.text}</li>)}</ul>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <p className="explain small">
        We check these facts against public records. If something is wrong, anyone can ask us to fix it.
        {' '}<Link href="/methodology">See how we check facts →</Link>
      </p>
    </main>
    <SiteFooter />
    </>
  );
}
