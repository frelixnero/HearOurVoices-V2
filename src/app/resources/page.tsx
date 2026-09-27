import type { Metadata } from 'next';
import { Phone, HeartPulse, Scale, Users } from 'lucide-react';
import { HovShell } from '@/components/HovShell';
import { listResources } from '@/lib/stories/service';

export const metadata: Metadata = {
  title: 'Community Support',
  description: 'You are not alone. Crisis, mental health, legal, and community support — always available.',
};
export const dynamic = 'force-dynamic';

const CATS: [string, string, React.ReactNode][] = [
  ['crisis', 'Crisis Hotlines', <Phone key="p" size={18} />],
  ['mental_health', 'Mental Health Support', <HeartPulse key="h" size={18} />],
  ['legal', 'Legal Help', <Scale key="s" size={18} />],
  ['community', 'Community Groups', <Users key="u" size={18} />],
];

// Safe generic fallbacks (not tied to any specific org) if the DB is empty.
const FALLBACK = [
  { id: 'f1', category: 'crisis', name: 'Emergency services', description: 'If you are in immediate danger, call your local emergency number now.', phone: '911', url: null },
  { id: 'f2', category: 'crisis', name: '24/7 crisis line', description: 'Free, confidential support any time, day or night.', phone: null, url: null },
  { id: 'f3', category: 'mental_health', name: 'Find help near you', description: 'Search local mental-health services and counselors.', phone: null, url: null },
  { id: 'f4', category: 'legal', name: 'Know your rights', description: 'Free legal-aid information and referrals.', phone: null, url: null },
  { id: 'f5', category: 'community', name: 'Support groups', description: 'Connect and heal together with people who understand.', phone: null, url: null },
];

export default async function ResourcesPage() {
  let rows = FALLBACK as { id: string; category: string; name: string; description: string; phone: string | null; url: string | null }[];
  try {
    const db = await listResources();
    if (db.length) rows = db;
  } catch { /* fallback */ }

  return (
    <HovShell active="resources">
      <div className="hov-page">
        <div className="hov-wrap">
          <p className="pg-eyebrow">COMMUNITY SUPPORT</p>
          <h1>You are not alone</h1>
          <p className="lead">Help is always available. Reach out — you deserve support.</p>

          {CATS.map(([cat, label, icon]) => {
            const list = rows.filter((r) => r.category === cat);
            if (!list.length) return null;
            return (
              <div key={cat} className="rs-group">
                <div className="rs-head"><span className="rs-ic">{icon}</span>{label}</div>
                {list.map((r) => (
                  <div key={r.id} className="rs-item">
                    <div>
                      <b>{r.name}</b>
                      <span>{r.description}</span>
                    </div>
                    {r.phone && <a className="hb hb-red" href={`tel:${r.phone}`}>Call {r.phone}</a>}
                    {!r.phone && r.url && <a className="hb hb-dark" href={r.url} target="_blank" rel="noreferrer">Visit</a>}
                  </div>
                ))}
              </div>
            );
          })}
          <p className="sh-note" style={{ marginTop: 20 }}>
            hearOURvoices is a community, not a medical or emergency service. In an emergency, contact local emergency services.
          </p>
        </div>
      </div>
    </HovShell>
  );
}
