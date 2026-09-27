import { describe, it, expect } from 'vitest';
import { gradeRumor } from '@/lib/rumors/grading';

describe('Rumor accuracy grading', () => {
  it('is UNVERIFIED until there are enough votes (missing data is not a verdict)', () => {
    const r = gradeRumor({ accurateVotes: 2, inaccurateVotes: 1 });
    expect(r.grade).toBe('UNVERIFIED');
    expect(r.score).toBeNull();
    expect(r.confidence).toBe('insufficient');
  });

  it('grades a well-supported rumor as accurate', () => {
    const r = gradeRumor({ accurateVotes: 34, inaccurateVotes: 6 }); // 85%
    expect(r.grade).toBe('TRUE');
    expect(r.score).toBe(85);
    expect(r.source).toBe('community');
  });

  it('grades a mostly-refuted rumor as inaccurate', () => {
    const r = gradeRumor({ accurateVotes: 3, inaccurateVotes: 22 }); // 12%
    expect(r.grade).toBe('FALSE');
    expect(r.score).toBeLessThan(20);
  });

  it('grades an evenly split rumor as mixed', () => {
    const r = gradeRumor({ accurateVotes: 12, inaccurateVotes: 11 }); // ~52%
    expect(r.grade).toBe('MIXED');
  });

  it('a reviewer verdict overrides the crowd', () => {
    const r = gradeRumor({ accurateVotes: 40, inaccurateVotes: 0, officialGrade: 'FALSE' });
    expect(r.grade).toBe('FALSE');
    expect(r.source).toBe('reviewer');
    expect(r.confidence).toBe('reviewed');
  });

  it('confidence rises with vote volume', () => {
    expect(gradeRumor({ accurateVotes: 5, inaccurateVotes: 2 }).confidence).toBe('low');
    expect(gradeRumor({ accurateVotes: 12, inaccurateVotes: 6 }).confidence).toBe('medium');
    expect(gradeRumor({ accurateVotes: 30, inaccurateVotes: 15 }).confidence).toBe('high');
  });
});
