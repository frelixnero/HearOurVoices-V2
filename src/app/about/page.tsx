import type { Metadata } from 'next';
import '../dashboard.css';
import '../marketing.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'About',
  description: 'HearOURVOICES is a nonpartisan, evidence-first civic accountability platform.',
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="simple">
        <h1 className="big-title">About HearOURVOICES</h1>
        <p className="explain">
          HearOURVOICES helps ordinary people understand what their government is doing — and gives
          them the records, evidence, and lawful tools to do something about it.
        </p>
        <h2 style={{ font: "800 22px 'Libre Franklin'", color: 'var(--navy)', marginTop: 28 }}>What we believe</h2>
        <ul style={{ fontSize: 17, lineHeight: 1.7, color: '#3e4c52' }}>
          <li><b>Evidence over rumors.</b> Claims are linked to sources and clearly labeled.</li>
          <li><b>Transparency over secrecy.</b> You can see why a score changed or content was moderated.</li>
          <li><b>Accountability over popularity.</b> Scores measure documented performance, not likes.</li>
          <li><b>Free expression with safety.</b> We protect lawful criticism and prohibit threats, harassment, and doxxing.</li>
          <li><b>Neutral infrastructure.</b> The rules apply the same to everyone, regardless of party.</li>
        </ul>
        <h2 style={{ font: "800 22px 'Libre Franklin'", color: 'var(--navy)', marginTop: 24 }}>What we are not</h2>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: '#3e4c52' }}>
          We are not a rumor board, an anonymous accusation site, or a replacement for a lawyer, court,
          or election authority. Serious allegations are never published automatically — a person reviews
          them first.
        </p>
        <p style={{ marginTop: 26, fontSize: 15, color: '#7a878c' }}>
          This platform provides information, not legal advice. Demonstration data is fictional.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
