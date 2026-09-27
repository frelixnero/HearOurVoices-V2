import type { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase, GraduationCap, HeartPulse, Scale, Shield, MessageSquare } from 'lucide-react';
import { HovShell } from '@/components/HovShell';
import { listTopics } from '@/lib/stories/service';

export const metadata: Metadata = { title: 'Topics', description: 'Browse stories by the experiences that matter to you.' };
export const dynamic = 'force-dynamic';

const ICONS: Record<string, React.ReactNode> = {
  workplace: <Briefcase size={22} />, school: <GraduationCap size={22} />,
  healthcare: <HeartPulse size={22} />, justice: <Scale size={22} />,
  military: <Shield size={22} />, other: <MessageSquare size={22} />,
};

const FALLBACK = [
  { slug: 'workplace', name: 'Workplace', description: 'Jobs, bosses, pay, and fairness at work.' },
  { slug: 'school', name: 'School', description: 'Classrooms, bullying, and being heard.' },
  { slug: 'healthcare', name: 'Healthcare', description: 'Care, treatment, and your rights.' },
  { slug: 'justice', name: 'Justice', description: 'Courts, police, and fairness under the law.' },
  { slug: 'military', name: 'Military', description: 'Service, coming home, and support.' },
  { slug: 'other', name: 'Other', description: 'Everything else that matters to you.' },
];

export default async function TopicsPage() {
  let topics: { slug: string; name: string; description: string | null }[] = FALLBACK;
  try {
    const rows = await listTopics();
    if (rows.length) topics = rows;
  } catch { /* use fallback */ }

  return (
    <HovShell active="topics">
      <div className="hov-page">
        <div className="hov-wrap">
          <p className="pg-eyebrow">TOPICS</p>
          <h1>Find stories that speak to you</h1>
          <p className="lead">Pick a topic to read what others have shared.</p>
          <div className="tp-grid">
            {topics.map((t) => (
              <Link key={t.slug} href={`/stories?topic=${t.slug}`} className="tp-card">
                <span className="tp-ic">{ICONS[t.slug] ?? <MessageSquare size={22} />}</span>
                <h3>{t.name}</h3>
                <p>{t.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </HovShell>
  );
}
