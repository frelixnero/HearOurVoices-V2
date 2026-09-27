import Stripe from 'stripe';
import { z } from 'zod';
import { handle } from '@/lib/http/route';
import { ok, ApiError } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

const schema = z.object({
  kind: z.enum(['donation', 'membership']),
  amount: z.number().int().min(1).max(100000).optional(), // dollars, for donations
  plan: z.string().max(40).optional(),
});

// Monthly membership prices in cents (must match /support display).
const PLAN_PRICES: Record<string, { cents: number; name: string }> = {
  citizen: { cents: 500, name: 'Citizen membership' },
  supporter: { cents: 1500, name: 'Supporter membership' },
  org: { cents: 4900, name: 'Newsroom / Org membership' },
};

const subscriptionsEnabled = () => process.env.SUBSCRIPTIONS_ENABLED === 'true';

// Real Stripe Checkout. Inert until STRIPE_SECRET_KEY is set — no key, no charge,
// clear message. Donations are live; memberships stay gated behind
// SUBSCRIPTIONS_ENABLED until a cancellation/portal flow is in place.
export const POST = handle(async (req: Request) => {
  const input = schema.parse(await req.json());
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new ApiError('conflict', 'Payments aren’t connected yet. Once a Stripe account is added, this button will open secure checkout.');
  }

  const stripe = new Stripe(key);
  const base = req.headers.get('origin') || process.env.APP_BASE_URL || 'https://hearourvoices.app';
  const success_url = `${base}/thank-you`;
  const cancel_url = `${base}/support`;

  let session: Stripe.Checkout.Session;
  if (input.kind === 'donation') {
    const cents = Math.round((input.amount ?? 0) * 100);
    if (cents < 100) throw new ApiError('validation_error', 'Minimum donation is $1.');
    session = await stripe.checkout.sessions.create({
      mode: 'payment', success_url, cancel_url,
      line_items: [{
        quantity: 1,
        price_data: { currency: 'usd', unit_amount: cents, product_data: { name: 'HearOURvoices donation' } },
      }],
      submit_type: 'donate',
    });
  } else {
    if (!subscriptionsEnabled()) {
      throw new ApiError('conflict', 'Memberships are coming soon. You can support the mission with a one-time gift today.');
    }
    const plan = PLAN_PRICES[input.plan ?? ''];
    if (!plan) throw new ApiError('validation_error', 'Unknown plan.');
    session = await stripe.checkout.sessions.create({
      mode: 'subscription', success_url, cancel_url,
      line_items: [{
        quantity: 1,
        price_data: { currency: 'usd', unit_amount: plan.cents, recurring: { interval: 'month' }, product_data: { name: plan.name } },
      }],
    });
  }

  return ok({ url: session.url });
});
