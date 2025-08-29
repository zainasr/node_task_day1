import { Router } from 'express';
import { paymentController as controller } from '../container';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

const oneTimeCheckoutSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1).max(20),
  email: z.string().email().optional(),
  userId: z.string().uuid().optional(),
});

const subscriptionCheckoutSchema = z.object({
  priceId: z.string().min(1, 'Stripe priceId is required'),
  email: z.string().email().optional(),
});

const refundSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  amount: z.number().int().positive(),
});

router.post(
  '/checkout/one-time',
  validateBody(oneTimeCheckoutSchema),
  controller.createOneTimeCheckout
);

router.post(
  '/checkout/subscription',
  validateBody(subscriptionCheckoutSchema),
  controller.createSubscriptionCheckout
);

router.post('/refund', validateBody(refundSchema), controller.refundOrder);

router.get('/orders/:id', controller.getOrderById);

export default router;
