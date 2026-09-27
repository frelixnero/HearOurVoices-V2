import { describe, it, expect } from 'vitest';
import { judge } from '@/lib/civic/labels';

describe('Public judgment tally', () => {
  it('is empty with no votes (no leader)', () => {
    const j = judge(0, 0, 0);
    expect(j.total).toBe(0);
    expect(j.leader).toBeNull();
    expect(j.goodPct).toBe(0);
  });

  it('computes percentages and the leading verdict', () => {
    const j = judge(6, 22, 7); // bad leads
    expect(j.total).toBe(35);
    expect(j.leader).toBe('BAD_MOVE');
    expect(j.badPct).toBe(63);
  });

  it('good-move majority leads', () => {
    expect(judge(20, 5, 5).leader).toBe('GOOD_MOVE');
  });
});
