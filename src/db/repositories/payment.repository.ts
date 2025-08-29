import { Response } from 'express';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../schema';
import { products } from '../schema/products';
import { Product } from '../schema/products';
import { orders, Order, payments } from '../schema/orders';
import { getStripeClient } from '../../config/stripe';
import { env } from '../../config/env';
import { sendSuccess } from '../../utils/response';
import logger from '../../utils/logger';
import { DatabaseError, BadRequestError } from '../../common/errors';

export class PaymentRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async createOneTimeCheckout(
    res: Response,
    params: {
      productId: string;
      quantity: number;
      customerEmail: string | undefined;
      userId: string | undefined;
    }
  ): Promise<void> {
    const { productId, quantity, customerEmail, userId } = params;

    try {
      logger.debug('Creating one-time checkout session', {
        productId,
        quantity,
        customerEmail: !!customerEmail,
        userId: !!userId,
      });

      const rows = await this.db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      const product = rows[0] as Product | undefined;
      if (!product) {
        throw new BadRequestError('Product not found');
      }

      console.log('product', product);

      const actual_amount = product.price * quantity;

      if (actual_amount < 0.5) {
        throw new BadRequestError('Amount is less than or equal to 0');
      }

      const [orderRow] = await this.db
        .insert(orders)
        .values({
          type: 'one_time',
          status: 'created',
          currency: 'usd',
          actual_amount,
          userId: userId !== undefined ? userId : null,
        })
        .returning();

      const order = orderRow as Order;

      const lineItems = [
        {
          price_data: {
            currency: 'usd',
            unit_amount: product.price,
            product_data: {
              name: product.name,
              description: product.description,
            },
          },
          quantity,
        },
      ];

      const stripe = getStripeClient();

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: lineItems,
        success_url: `${env.CHECKOUT_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: env.CHECKOUT_CANCEL_URL,
        customer_email: customerEmail ?? 'guest@gmail.com',
        payment_intent_data: {
          setup_future_usage: 'off_session',
        },
        allow_promotion_codes: false,
        metadata: {
          orderId: order.id,
          type: 'one_time',
        },
      });

      await this.db
        .update(orders)
        .set({
          stripeCheckoutSessionId: session.id,
          amount_in_cents: session.amount_total ?? 0,
        })
        .where(eq(orders.id, order.id));

      logger.info('Stripe Checkout Session created', {
        sessionId: session.id,
        orderId: order.id,
      });

      sendSuccess(res, {
        data: { url: session.url, sessionId: session.id, orderId: order.id },
        message: 'Checkout session created',
        statusCode: 200,
      });
    } catch (error) {
      logger.error('Failed to create checkout session', {
        productId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new DatabaseError(
        'Failed to create checkout session',
        error,
        'CHECKOUT_ERROR',
        'createOneTimeCheckout'
      );
    }
  }

  async createSubscriptionCheckout(
    res: Response,
    params: {
      priceId: string;
      customerEmail: string | undefined;
      userId: string | undefined;
    }
  ): Promise<void> {
    const { priceId, customerEmail, userId } = params;

    try {
      logger.debug('Creating subscription checkout session', {
        priceId,
        customerEmail: !!customerEmail,
        userId: !!userId,
      });

      const [orderRow] = await this.db
        .insert(orders)
        .values({
          type: 'subscription',
          status: 'created',
          currency: 'usd',
          actual_amount: 0,
          amount_in_cents: 0,
          userId: userId !== undefined ? userId : null,
        })
        .returning();

      const order = orderRow as Order;

      const stripe = getStripeClient();

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${env.CHECKOUT_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: env.CHECKOUT_CANCEL_URL,
        customer_email: customerEmail ?? 'guest@gmail.com',
        allow_promotion_codes: false,
        metadata: {
          type: 'subscription',
          orderId: order.id,
        },
      });

      await this.db
        .update(orders)
        .set({
          stripeCheckoutSessionId: session.id,
          userId: userId !== undefined ? userId : null,
          amount_in_cents: session.amount_total ?? 0,
          actual_amount: session.amount_total ? session.amount_total / 100 : 0,
        })
        .where(eq(orders.id, order.id));

      logger.info('Stripe Subscription Checkout Session created', {
        sessionId: session.id,
        orderId: order.id,
      });

      sendSuccess(res, {
        data: { url: session.url, sessionId: session.id, orderId: order.id },
        message: 'Subscription checkout session created',
        statusCode: 200,
      });
    } catch (error) {
      logger.error('Failed to create subscription checkout session', {
        priceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new DatabaseError(
        'Failed to create subscription checkout session',
        error,
        'SUB_CHECKOUT_ERROR',
        'createSubscriptionCheckout'
      );
    }
  }

  async refundOrder(
    res: Response,
    params: { orderId: string; amount: number }
  ): Promise<void> {
    const { orderId, amount } = params;

    try {
      const [order] = await this.db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!order) {
        throw new BadRequestError('Order not found');
      }

      if (!order.stripePaymentIntentId) {
        throw new BadRequestError('No payment intent found on order');
      }

      const stripe = getStripeClient();

      const refund = await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
        amount: amount,
      });

      await this.db
        .update(orders)
        .set({ status: 'refunded' })
        .where(eq(orders.id, orderId));

      logger.info('Order refunded', { orderId, refundId: refund.id });

      sendSuccess(res, {
        data: { refundId: refund.id, status: refund.status },
        message: 'Order refunded successfully',
        statusCode: 200,
      });
    } catch (error) {
      logger.error('Failed to refund order', {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new DatabaseError(
        'Failed to refund order',
        error,
        'REFUND_ERROR',
        'refundOrder'
      );
    }
  }

  async getOrderById(
    res: Response,
    params: { orderId: string }
  ): Promise<void> {
    const { orderId } = params;

    try {
      const [order] = await this.db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!order) {
        throw new BadRequestError('Order not found');
      }

      const paymentRows = await this.db
        .select()
        .from(payments)
        .where(eq(payments.orderId, orderId));

      sendSuccess(res, {
        data: { order, payments: paymentRows },
        message: 'Order retrieved',
        statusCode: 200,
      });
    } catch (error) {
      throw new DatabaseError(
        'Failed to fetch order',
        error,
        'FETCH_ERROR',
        'getOrderById'
      );
    }
  }
}
