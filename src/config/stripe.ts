import Stripe from 'stripe';
import { env } from './env';

let stripeClient: Stripe | null = null;

export const getStripeClient = (): Stripe => {
  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  return stripeClient;
};

export type StripeClient = Stripe;
