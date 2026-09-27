import { describe, it, expect } from 'vitest';
import { computeLedger, canApproveExpense } from '@/lib/civicfund/ledger';

describe('CivicFund ledger math (spec §16.5, §16.7)', () => {
  it('nets fees out of gross and tracks spent/committed/available', () => {
    const l = computeLedger(
      [
        { amountCents: 20000, processorFeeCents: 600, platformFeeCents: 1000, status: 'succeeded' },
        { amountCents: 5000, processorFeeCents: 0, platformFeeCents: 0, status: 'pending' }, // ignored
      ],
      [
        { amountCents: 5000, status: 'paid' },
        { amountCents: 3000, status: 'approved' },
      ],
    );
    expect(l.grossContributionsCents).toBe(20000);
    expect(l.netRaisedCents).toBe(18400);
    expect(l.spentCents).toBe(5000);
    expect(l.committedCents).toBe(3000);
    expect(l.availableCents).toBe(10400);
  });

  it('excludes refunded contributions from gross and subtracts them', () => {
    const l = computeLedger(
      [
        { amountCents: 10000, processorFeeCents: 0, platformFeeCents: 0, status: 'succeeded' },
        { amountCents: 4000, processorFeeCents: 0, platformFeeCents: 0, status: 'refunded' },
      ],
      [],
    );
    expect(l.grossContributionsCents).toBe(10000);
    expect(l.refundedCents).toBe(4000);
    expect(l.availableCents).toBe(6000);
  });

  it('never lets an expense exceed available funds', () => {
    const l = computeLedger(
      [{ amountCents: 10000, processorFeeCents: 0, platformFeeCents: 0, status: 'succeeded' }],
      [],
    );
    expect(canApproveExpense(l, 10000)).toBe(true);
    expect(canApproveExpense(l, 10001)).toBe(false);
    expect(canApproveExpense(l, 0)).toBe(false);
  });
});
