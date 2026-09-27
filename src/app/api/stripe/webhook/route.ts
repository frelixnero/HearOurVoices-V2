import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

// Stripe webhook. Verifies the signature, then records completed checkouts in the
// Donation ledger. Inert until STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET are set.
export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !whSecret) return NextResponse.json({ ok: false, error: 'stripe not configured' }, { status: 200 });

  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ ok: false, error: 'missing signature' }, { status: 400 });

  const stripe = new Stripe(key);
  const raw = await req.text(); // raw body required for signature verification
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, whSecret);
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object as Stripe.Checkout.Session;
    try {
      await prisma.donation.upsert({
        where: { stripeSession: s.id },
        create: {
          kind: s.mode === 'subscription' ? 'membership' : 'donation',
          amountCents: s.amount_total ?? 0,
          currency: s.currency ?? 'usd',
          stripeSession: s.id,
          email: s.customer_details?.email ?? null,
        },
        update: {},
      });
    } catch { /* idempotent — ignore duplicate */ }
  }

  return NextResponse.json({ received: true });
}
