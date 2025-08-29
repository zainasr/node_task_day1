import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { getStripeClient } from '../config/stripe';
import { env } from '../config/env';
import logger from '../utils/logger';
import { db } from '../db';
import { orders, payments } from '../db/schema/orders';
import { eq } from 'drizzle-orm';

const router = express.Router();

// TODO: Add a table to track processed events
async function isEventProcessed(eventId: string): Promise<boolean> {
  const rows = await db
    .select()
    .from(payments)
    .where(eq(payments.rawEventId, eventId))
    .limit(1);
  return rows.length > 0;
}

// Stripe requires the raw body to construct the event
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const stripe = getStripeClient();

    const sig = req.headers['stripe-signature'];
    if (!sig || typeof sig !== 'string') {
      logger.warn('Missing Stripe signature header');
      return res.status(400).send('Missing signature');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        (req as any).rawBody ?? (req.body as any),
        sig,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid signature';
      logger.error('Stripe webhook signature verification failed', { message });
      return res.status(400).send(`Webhook Error: ${message}`);
    }

    try {
      // Idempotency guard at event level
      if (await isEventProcessed(event.id)) {
        logger.info('Skipping already processed event', { eventId: event.id });
        return res.status(200).json({ received: true, duplicate: true });
      }

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          logger.info('checkout.session.completed', {
            sessionId: session.id,
            mode: session.mode,
            customer: session.customer,
            paymentIntent: session.payment_intent,
            subscription: session.subscription,
          });

          const orderId =
            (session.metadata && (session.metadata as any).orderId) || null;
          const piId =
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : (session.payment_intent as Stripe.PaymentIntent | null)?.id;

          if (orderId) {
            // Update order to paid
            await db
              .update(orders)
              .set({
                status: 'paid',
                stripePaymentIntentId: piId ?? null,
                stripeSubscriptionId:
                  typeof session.subscription === 'string'
                    ? session.subscription
                    : (session.subscription as Stripe.Subscription | null)?.id,
              })
              .where(eq(orders.id, orderId));

            // Insert payment record
            await db.insert(payments).values({
              orderId,
              stripePaymentIntentId: piId ?? 'unknown',
              status: 'succeeded',
              amount: session.amount_total ?? 0,
              currency: session.currency ?? 'usd',
              rawEventId: event.id,
            });

            logger.info(
              'Order marked as paid from checkout.session.completed',
              { orderId }
            );
          }
          break;
        }
        case 'payment_intent.succeeded': {
          const pi = event.data.object as Stripe.PaymentIntent;
          logger.info('payment_intent.succeeded', {
            paymentIntentId: pi.id,
            status: pi.status,
            amount: pi.amount,
            currency: pi.currency,
            customer: pi.customer,
            orderId: pi.metadata['orderId'],
          });
          break;
        }
        case 'payment_intent.created': {
          const pi = event.data.object as Stripe.PaymentIntent;
          logger.info('payment_intent.created', {
            paymentIntentId: pi.id,
            status: pi.status,
            orderId: pi.metadata['orderId'],
          });
          break;
        }
        case 'payment_intent.payment_failed': {
          const pi = event.data.object as Stripe.PaymentIntent;
          logger.info('payment_intent.payment_failed', {
            paymentIntentId: pi.id,
            status: pi.status,
          });
          break;
        }
        case 'invoice.paid': {
          const basic = event.data.object as Stripe.Invoice;
          logger.info('invoice.paid', {
            invoiceId: basic.id,
            receiptNumber: basic.receipt_number,
            customer: basic.customer,
            amountPaid: basic.amount_paid,
            status: basic.status,
          });

          // Re-retrieve invoice with expands to reliably access subscription and payment_intent
          const invResp = await stripe.invoices.retrieve(basic.id as string, {
            expand: ['subscription', 'payment_intent'],
          });
          // Cast defensively to Stripe.Invoice (Stripe SDK returns Stripe.Response<T>)
          const inv = invResp as unknown as Stripe.Invoice;
          const invSubscription = inv.parent?.subscription_details
            ?.subscription as Stripe.Subscription | null;
          const subscriptionId = invSubscription?.id;

          const invPayment = inv.payments
            ?.data[0] as Stripe.InvoicePayment | null;

          const paymentIntentId = invPayment?.id;
          if (subscriptionId) {
            const [order] = await db
              .select()
              .from(orders)
              .where(eq(orders.stripeSubscriptionId, subscriptionId))
              .limit(1);

            if (order) {
              await db.insert(payments).values({
                orderId: order.id,
                stripePaymentIntentId: paymentIntentId ?? 'unknown',
                status: 'succeeded',
                amount: inv.amount_paid ?? 0,
                currency: inv.currency ?? 'usd',
                rawEventId: event.id,
              });
            } else {
              logger.warn('No order found for subscription renewal', {
                subscriptionId,
                invoiceId: inv.id,
              });
            }
          } else {
            logger.warn('Invoice has no subscription id; skipping order link', {
              invoiceId: inv.id,
            });
          }
          break;
        }
        case 'payment_intent.succeeded':
        case 'payment_intent.payment_failed': {
          const pi = event.data.object as Stripe.PaymentIntent;
          logger.info(event.type, {
            paymentIntentId: pi.id,
            status: pi.status,
            amount: pi.amount,
            currency: pi.currency,
            customer: pi.customer,
          });
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          logger.info('invoice.payment_failed', {
            invoiceId: invoice.id,
            receiptNumber: invoice.receipt_number,
            customer: invoice.customer,
            amountPaid: invoice.amount_paid,
            status: invoice.status,
          });
          break;
        }
        default:
          logger.debug('Unhandled Stripe event', { type: event.type });
      }

      // Acknowledge receipt of the event
      res.status(200).json({ received: true });
    } catch (error) {
      logger.error('Error processing Stripe webhook', {
        error: error instanceof Error ? error.message : 'Unknown error',
        type: event.type,
      });
      res.status(500).send('Webhook handler error');
    }

    return; // Ensure all code paths return a value
  }
);

export default router;
