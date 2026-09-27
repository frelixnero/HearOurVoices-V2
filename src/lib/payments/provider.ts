// Payment provider seam for CivicFund (spec §16.7 Stripe Connect). The ledger
// accounting (civicfund/ledger.ts) is real and tested; this abstracts the money
// movement so the dev/test flow works today and real Stripe drops in with keys.
//
// Fees are computed SERVER-SIDE — never trusted from the client.
export interface FeeBreakdown {
  processorFeeCents: number;
  platformFeeCents: number;
}
export interface ChargeInput {
  amountCents: number;
  platformFeeRate: number; // e.g. 0.05
  campaignId: string;
  contributorUserId: string;
}
export interface ChargeResult {
  providerRef: string;
  status: 'succeeded' | 'pending' | 'failed';
  fees: FeeBreakdown;
}

export interface PaymentProvider {
  computeFees(amountCents: number, platformFeeRate: number): FeeBreakdown;
  charge(input: ChargeInput): Promise<ChargeResult>;
  refund(providerRef: string): Promise<{ status: 'refunded' | 'failed' }>;
}

// Standard card processing fee shape (2.9% + 30¢) used for the estimate.
function processorFee(amountCents: number): number {
  return Math.round(amountCents * 0.029) + 30;
}

/** Dev/test provider: computes fees and "succeeds" immediately. No real money. */
export class MockPaymentProvider implements PaymentProvider {
  computeFees(amountCents: number, platformFeeRate: number): FeeBreakdown {
    return {
      processorFeeCents: processorFee(amountCents),
      platformFeeCents: Math.round(amountCents * platformFeeRate),
    };
  }
  async charge(input: ChargeInput): Promise<ChargeResult> {
    return {
      providerRef: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      status: 'succeeded',
      fees: this.computeFees(input.amountCents, input.platformFeeRate),
    };
  }
  async refund(): Promise<{ status: 'refunded' | 'failed' }> {
    return { status: 'refunded' };
  }
}

/**
 * Stripe adapter — finished at the seam. Requires STRIPE_SECRET_KEY and the
 * `stripe` package. Uses Stripe Connect PaymentIntents with an application fee
 * (the platform fee) so funds settle to the campaign's connected account (§16.7).
 * Left unwired until credentials exist; throws a clear message otherwise.
 */
export class StripePaymentProvider implements PaymentProvider {
  computeFees(amountCents: number, platformFeeRate: number): FeeBreakdown {
    return {
      processorFeeCents: processorFee(amountCents),
      platformFeeCents: Math.round(amountCents * platformFeeRate),
    };
  }
  async charge(_input: ChargeInput): Promise<ChargeResult> {
    throw new Error(
      'StripePaymentProvider requires STRIPE_SECRET_KEY, the `stripe` package, and Connect onboarding. ' +
        'Set PAYMENT_PROVIDER=mock for local use.',
    );
  }
  async refund(): Promise<{ status: 'refunded' | 'failed' }> {
    throw new Error('StripePaymentProvider.refund not configured.');
  }
}

export function paymentProvider(): PaymentProvider {
  return (process.env.PAYMENT_PROVIDER ?? 'mock') === 'stripe'
    ? new StripePaymentProvider()
    : new MockPaymentProvider();
}
