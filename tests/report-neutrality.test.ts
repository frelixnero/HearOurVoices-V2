import { describe, it, expect } from 'vitest';
import { checkNeutrality } from '@/lib/reports/neutrality';
import { LABEL_META, STATUS_META } from '@/lib/reports/labels';

describe('Report neutrality check', () => {
  it('flags loaded/editorializing language', () => {
    const r = checkNeutrality('This disgraceful, corrupt official obviously lied.');
    expect(r.flags.length).toBeGreaterThan(0);
    expect(r.flags).toContain('disgraceful');
    expect(r.neutralityScore).toBeLessThan(100);
  });

  it('passes neutral, factual wording', () => {
    const r = checkNeutrality('The director said routes 4 and 12 will be combined on September 1.');
    expect(r.flags).toEqual([]);
    expect(r.neutralityScore).toBe(100);
    expect(r.note).toMatch(/no loaded language/i);
  });

  it('exposes human labels for every post label and claim status', () => {
    expect(LABEL_META.UNVERIFIED_TIP.text).toBe('Unverified tip');
    expect(STATUS_META.VERIFIED.text).toBe('Verified');
    expect(STATUS_META.DISPROVEN.text).toBe('Disproven');
  });
});
