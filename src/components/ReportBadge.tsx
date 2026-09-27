import { LABEL_META, STATUS_META, type PostLabel, type ClaimStatus } from '@/lib/reports/labels';

// The visible post label (Opinion, Unverified tip, …).
export function LabelBadge({ label }: { label: string }) {
  const m = LABEL_META[label as PostLabel] ?? LABEL_META.UNVERIFIED_TIP;
  return <span className="rp-badge" style={{ background: m.color }}>{m.text}</span>;
}

// The claim status (Unreviewed … Verified … Disproven) — not a star rating.
export function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status as ClaimStatus] ?? STATUS_META.UNREVIEWED;
  return (
    <span className="rp-badge" style={{ background: 'transparent', color: m.color, border: `1.5px solid ${m.color}` }}>
      {m.text}
    </span>
  );
}
