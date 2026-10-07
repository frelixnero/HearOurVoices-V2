import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Heart, Users, Flag } from 'lucide-react';
import { HovShell } from '@/components/HovShell';

export const metadata: Metadata = {
  title: 'Community',
  description: 'A safe, supportive, moderated community built on kindness and respect.',
};

const VALUES = [
  { icon: <Heart size={22} />, t: 'Lead with kindness', d: 'Every story took courage. Respond with empathy, not judgment.' },
  { icon: <ShieldCheck size={22} />, t: 'Safety first', d: 'No threats, harassment, or sharing private information. Ever.' },
  { icon: <Users size={22} />, t: 'You belong here', d: 'Share anonymously or openly. This is your space to be heard.' },
  { icon: <Flag size={22} />, t: 'Report, don’t engage', d: 'See something harmful? Report it and our team will act.' },
];

export default function CommunityPage() {
  return (
    <HovShell active="community">
      <div className="hov-page">
        <div className="hov-wrap">
          <p className="pg-eyebrow">OUR COMMUNITY</p>
          <h1>Real people. Real support.</h1>
          <p className="lead">
            hearOURvoices is a moderated community where people share hard experiences and lift each
            other up. Here’s how we keep it safe and kind.
          </p>
          <div className="tp-grid">
            {VALUES.map((v) => (
              <div key={v.t} className="tp-card" style={{ cursor: 'default' }}>
                <span className="tp-ic">{v.icon}</span>
                <h3>{v.t}</h3>
                <p>{v.d}</p>
              </div>
            ))}
          </div>
          <div className="sh-card" style={{ textAlign: 'center', marginTop: 24 }}>
            <h3 style={{ color: '#172632', fontSize: 20, margin: '0 0 8px' }}>Ready to add your voice?</h3>
            <p style={{ color: '#56636a', marginBottom: 16 }}>Your story could be the one that helps someone else.</p>
            <Link href="/share" className="hb hb-red hb-lg">Share your story</Link>{' '}
            <Link href="/stories" className="hb hb-dark hb-lg">Browse stories</Link>
          </div>
        </div>
      </div>
    </HovShell>
  );
}
