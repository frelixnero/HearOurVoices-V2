import { VERDICT_META, type Judgment } from '@/lib/civic/labels';

// The public-judgment bar (percentages). Neutral — it's the crowd's verdict.
export function NewsJudgment({ judgment }: { judgment: Judgment }) {
  if (judgment.total === 0) return <p className="nw-none">No public judgment yet — be the first to weigh in.</p>;
  const g = VERDICT_META.GOOD_MOVE, b = VERDICT_META.BAD_MOVE, i = VERDICT_META.NEEDS_INFO;
  return (
    <div>
      <div className="nw-judge">
        <i style={{ width: `${judgment.goodPct}%`, background: g.color }} />
        <i style={{ width: `${judgment.badPct}%`, background: b.color }} />
        <i style={{ width: `${judgment.infoPct}%`, background: i.color }} />
      </div>
      <div className="nw-jrow">
        <span>{g.emoji} Good Move <b>{judgment.goodPct}%</b></span>
        <span>{b.emoji} Bad Move <b>{judgment.badPct}%</b></span>
        <span>{i.emoji} Needs Info <b>{judgment.infoPct}%</b></span>
        <span style={{ marginLeft: 'auto' }}>{judgment.total} judgment{judgment.total === 1 ? '' : 's'}</span>
      </div>
    </div>
  );
}
