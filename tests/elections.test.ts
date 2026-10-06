import { describe, it, expect } from 'vitest';
import { checkNeutrality } from '@/lib/reports/neutrality';

describe('Voter Education & Election neutrality', () => {
  it('flags partisan framing and campaign advocacy', () => {
    const partisanCopy = 'Vote Blue and defeat the corrupt candidates running this November.';
    const result = checkNeutrality(partisanCopy);
    expect(result.flags.length).toBeGreaterThan(0);
    expect(result.neutralityScore).toBeLessThan(100);
  });

  it('validates that production voter-utility copy is completely nonpartisan and fact-based', () => {
    const voterCopy =
      'Your vote shapes your community. Below are your key deadlines, tools to check your registration, and unbiased information about who is running. Make sure that your address matches where you currently reside.';
    const result = checkNeutrality(voterCopy);
    expect(result.flags).toEqual([]);
    expect(result.neutralityScore).toBe(100);
  });
});
