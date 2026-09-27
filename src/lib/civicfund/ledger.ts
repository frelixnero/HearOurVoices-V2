// CivicFund ledger accounting (spec §16.5, §16.7). Pure, exact-money math using
// integer minor units (cents) to avoid floating-point drift. The spec requires
// tests for this accounting (§45 rule 10).
export interface Contribution {
  amountCents: number;
  processorFeeCents: number;
  platformFeeCents: number;
  status: 'pending' | 'succeeded' | 'refunded' | 'failed';
}
export interface Expense {
  amountCents: number;
  status: 'proposed' | 'approved' | 'paid' | 'rejected';
}

export interface Ledger {
  grossContributionsCents: number; // sum of succeeded contributions
  processorFeesCents: number;
  platformFeesCents: number;
  netRaisedCents: number; // gross - processor - platform
  refundedCents: number;
  spentCents: number; // paid expenses
  committedCents: number; // approved but not yet paid
  availableCents: number; // netRaised - refunded - spent - committed
}

export function computeLedger(contributions: Contribution[], expenses: Expense[]): Ledger {
  let gross = 0, processor = 0, platform = 0, refunded = 0;
  for (const c of contributions) {
    if (c.status === 'succeeded') {
      gross += c.amountCents;
      processor += c.processorFeeCents;
      platform += c.platformFeeCents;
    } else if (c.status === 'refunded') {
      // A refunded contribution returns the full contributed amount to the donor.
      refunded += c.amountCents;
    }
  }
  let spent = 0, committed = 0;
  for (const e of expenses) {
    if (e.status === 'paid') spent += e.amountCents;
    else if (e.status === 'approved') committed += e.amountCents;
  }
  const netRaised = gross - processor - platform;
  const available = netRaised - refunded - spent - committed;
  return {
    grossContributionsCents: gross,
    processorFeesCents: processor,
    platformFeesCents: platform,
    netRaisedCents: netRaised,
    refundedCents: refunded,
    spentCents: spent,
    committedCents: committed,
    availableCents: available,
  };
}

/** Guard: an expense may only be approved/paid if funds are available (§16.7). */
export function canApproveExpense(ledger: Ledger, expenseCents: number): boolean {
  return expenseCents > 0 && expenseCents <= ledger.availableCents;
}
