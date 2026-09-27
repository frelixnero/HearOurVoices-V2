import { GRADE_COLOR, type GradeResult } from '@/lib/rumors/grading';

// Accuracy badge + meter. Works in server or client components.
export function RumorGrade({ grading, showMeter = true }: { grading: GradeResult; showMeter?: boolean }) {
  const color = GRADE_COLOR[grading.grade];
  const conf =
    grading.source === 'reviewer' ? 'Reviewed by our team'
    : grading.confidence === 'insufficient' ? `Not enough votes yet (${grading.totalVotes})`
    : `${grading.totalVotes} votes · ${grading.confidence} confidence`;
  return (
    <div className="rm-grade">
      <span className="rm-badge" style={{ background: color }}>
        <span className="dot" />{grading.label}
        {grading.score !== null && <span style={{ opacity: 0.85 }}>· {grading.score}%</span>}
      </span>
      {showMeter && grading.score !== null && (
        <span className="rm-meter"><i style={{ width: `${grading.score}%`, background: color }} /></span>
      )}
      <span className="rm-meta">{conf}</span>
    </div>
  );
}
