'use client';

// Community Brief dashboard (spec §8, §37). Ported from the MVP front-end into the
// Next.js foundation. Interactive, so it's a client component. Presentation data
// comes from src/lib/demo/community.ts for now and will be replaced by API calls
// (GET /api/jurisdictions/:id/brief) in a later phase. Any privileged action the
// buttons eventually trigger is enforced server-side (spec §45 rules 6-7).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell, BookOpen, ChevronDown, FileCheck2, FolderSearch, Home, Landmark,
  MapPin, Menu, Search, ShieldCheck, Users, Vote, X,
} from 'lucide-react';
import { stories, timeline, type Story } from '@/lib/demo/community';

// Accessible dialog behavior (spec §35): Escape to close, focus trapped inside,
// focus returned to the trigger, and background scroll locked while open.
function useDialogA11y(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const node = ref.current;
    const focusables = node?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusables?.[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && focusables && focusables.length > 0) {
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      returnFocusRef.current?.focus();
    };
  }, [open, onClose]);

  return ref;
}

function Badge({ status }: { status: string }) {
  return (
    <span className={`badge ${status.toLowerCase().replaceAll(' ', '-')}`}>
      <ShieldCheck size={13} />
      {status}
    </span>
  );
}

function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <>
      <header>
        <button className="icon mobile" onClick={onMenu} aria-label="Open menu">
          <Menu />
        </button>
        <a className="brand" href="#">
          <span className="mark">H</span>
          <span>
            Hear<span>OUR</span>VOICES
          </span>
        </a>
        <nav aria-label="Primary">
          <a className="active">My Community</a>
          <a>Explore</a>
          <a>Records</a>
          <a>About</a>
        </nav>
        <div className="actions">
          <button className="icon" aria-label="Search">
            <Search />
          </button>
          <button className="icon" aria-label="Notifications">
            <Bell />
            <i />
          </button>
          <button className="avatar" aria-label="Your profile">
            ET
          </button>
        </div>
      </header>
      <div className="trust">
        <ShieldCheck /> Evidence-first civic accountability <span /> Every claim shows
        its status and sources
      </div>
    </>
  );
}

function Side({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <aside className={open ? 'open' : ''} aria-label="Community navigation">
      <button className="close mobile" onClick={onClose} aria-label="Close menu">
        <X />
      </button>
      <p className="side-label">YOUR COMMUNITY</p>
      <button className="place">
        <span>
          <MapPin />
          Clearwater County
        </span>
        <ChevronDown />
      </button>
      {/* Plain-language links so anyone can find their way (spec §35). */}
      <div className="navgroup">
        <a className="selected" href="/community">
          <Home />
          What&apos;s new near me
        </a>
        <a href="/elections">
          <Vote />
          See who&apos;s running
        </a>
        <a href="#">
          <Landmark />
          Look up a leader
        </a>
        <a href="#">
          <FileCheck2 />
          Proof &amp; claims
        </a>
        <a href="#">
          <FolderSearch />
          Ask for records
        </a>
        <a href="/methodology">
          <Users />
          How we check facts
        </a>
      </div>
      <div className="records-card">
        <BookOpen />
        <b>Request public records</b>
        <p>Build, send, and track a request using plain-language templates.</p>
        <button>Start a request</button>
      </div>
      <div className="method">
        <ShieldCheck />
        <div>
          <b>How trust works</b>
          <p>Statuses, sources, corrections, and public audit trails are visible.</p>
          <a href="/methodology">Read our methodology →</a>
        </div>
      </div>
    </aside>
  );
}

function StoryCard({ story, onOpen }: { story: Story; onOpen: (s: Story) => void }) {
  return (
    <article
      className="story"
      onClick={() => onOpen(story)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(story);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Open timeline for: ${story.title}`}
    >
      <div className="story-art" style={{ background: story.image }}>
        <Landmark />
      </div>
      <div className="story-body">
        <div className="meta">
          <span>{story.eyebrow}</span>
          <span>{story.time}</span>
        </div>
        <h3>{story.title}</h3>
        <p>{story.summary}</p>
        <div className="story-foot">
          <Badge status={story.status} />
          <span>{story.sources} sources</span>
          <button>View timeline →</button>
        </div>
      </div>
    </article>
  );
}

export interface TimelyElection {
  id: string;
  name: string;
  daysAway: number;
  candidateCount: number;
}

export default function CommunityDashboard({ timely }: { timely?: TimelyElection | null }) {
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Story | null>(null);

  const closeModal = useCallback(() => setSelected(null), []);
  const modalRef = useDialogA11y(!!selected, closeModal);

  // Escape also closes the mobile navigation drawer.
  useEffect(() => {
    if (!menu) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenu(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menu]);

  const filtered = useMemo(
    () =>
      stories.filter((s) =>
        (s.title + s.summary).toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <div>
      <Header onMenu={() => setMenu(true)} />
      {menu && <div className="scrim mobile" onClick={() => setMenu(false)} aria-hidden="true" />}
      <Side open={menu} onClose={() => setMenu(false)} />
      <main>
        {timely && (
          <div className="timely">
            <div className="t-left">
              <span className="t-emoji" aria-hidden="true">🗳️</span>
              <div>
                <b>Voting is coming up: {timely.name}</b>
                <p>
                  {timely.daysAway === 0
                    ? 'Voting day is today.'
                    : `${timely.daysAway} day${timely.daysAway === 1 ? '' : 's'} away`}
                  {' · '}
                  {timely.candidateCount} {timely.candidateCount === 1 ? 'person is' : 'people are'} running
                </p>
              </div>
            </div>
            <a href="/elections">See who&apos;s running →</a>
          </div>
        )}
        <section className="welcome">
          <div>
            <p className="kicker">SATURDAY, JULY 11</p>
            <h1>Good evening, Elliot.</h1>
            <p>Here’s what changed in your community — with the records behind it.</p>
          </div>
          <button className="outline">
            <MapPin />
            Change location
          </button>
        </section>

        <section className="stats" aria-label="Community summary">
          <div>
            <span>NEW THIS WEEK</span>
            <b>12</b>
            <small>official actions</small>
          </div>
          <div>
            <span>RECORDS TRACKED</span>
            <b>38</b>
            <small>6 updated</small>
          </div>
          <div>
            <span>OPEN CLAIMS</span>
            <b>7</b>
            <small>2 need sources</small>
          </div>
          <div>
            <span>OFFICIAL RESPONSES</span>
            <b>4</b>
            <small>this month</small>
          </div>
        </section>

        <section className="section-head">
          <div>
            <p className="kicker">YOUR COMMUNITY BRIEF</p>
            <h2>What’s happening now</h2>
          </div>
          <label className="search">
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search this brief"
              aria-label="Search this brief"
            />
          </label>
        </section>

        <div className="content">
          <section className="feed" aria-label="Community brief items">
            {filtered.map((s) => (
              <StoryCard key={s.id} story={s} onOpen={setSelected} />
            ))}
            {!filtered.length && (
              <div className="empty">
                <Search />
                <h3>No matching updates</h3>
                <p>Try another word or clear your search.</p>
              </div>
            )}
          </section>

          <section className="right">
            <div className="panel">
              <div className="panel-title">
                <span>
                  <ShieldCheck />
                  Trust snapshot
                </span>
                <small>Last 30 days</small>
              </div>
              <div className="donut">
                <div>
                  <b>84%</b>
                  <small>well sourced</small>
                </div>
              </div>
              <ul>
                <li>
                  <i className="green" />
                  Verified or official <b>21</b>
                </li>
                <li>
                  <i className="amber" />
                  Under review <b>4</b>
                </li>
                <li>
                  <i className="gray" />
                  Missing sources <b>2</b>
                </li>
              </ul>
              <a>See all claims →</a>
            </div>

            <div className="panel action">
              <p className="kicker">MAKE A DIFFERENCE</p>
              <h3>What would you like to do?</h3>
              <button>
                <FileCheck2 />
                <span>
                  <b>Share a documented concern</b>
                  <small>Add sources or submit for review</small>
                </span>
              </button>
              <button>
                <FolderSearch />
                <span>
                  <b>Request public records</b>
                  <small>Use a guided request builder</small>
                </span>
              </button>
              <button>
                <Vote />
                <span>
                  <b>Start a lawful petition</b>
                  <small>Build an evidence-backed action</small>
                </span>
              </button>
            </div>
          </section>
        </div>
      </main>

      {selected && (
        <div className="modal-wrap" onClick={closeModal}>
          <section
            className="modal"
            ref={modalRef as React.RefObject<HTMLElement>}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
          >
            <button
              className="close-modal"
              onClick={closeModal}
              aria-label="Close timeline"
            >
              <X />
            </button>
            <p className="kicker">PUBLIC TIMELINE</p>
            <h2>{selected.title}</h2>
            <Badge status={selected.status} />
            <p className="modal-summary">{selected.summary}</p>
            <h3>What happened</h3>
            <div className="timeline">
              {timeline.map(([d, t, s]) => (
                <div key={d}>
                  <time>{d}</time>
                  <i />
                  <span>
                    <b>{t}</b>
                    <small>{s}</small>
                  </span>
                </div>
              ))}
            </div>
            <div className="notice">
              <ShieldCheck />
              <p>
                <b>Why this is labeled {selected.status.toLowerCase()}</b>
                <br />
                This status reflects the available primary records. It does not imply
                misconduct or guilt.
              </p>
            </div>
            <button className="primary">View sources and audit trail</button>
          </section>
        </div>
      )}
    </div>
  );
}
