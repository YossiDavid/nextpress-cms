import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nextpress/db';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PROCESSING',
            paymentProvider: 'stripe',
            paymentRef: session.payment_intent as string ?? session.id,
          },
        });
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' },
        });
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object;
      const paymentIntentId = charge.payment_intent as string;
      if (paymentIntentId) {
        await prisma.order.updateMany({
          where: { paymentRef: paymentIntentId },
          data: { status: 'REFUNDED' },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

// Stripe needs the raw body — disable body parsing
export const config = { api: { bodyParser: false } };
