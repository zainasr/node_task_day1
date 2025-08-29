import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  createOneTimeCheckout = asyncHandler(async (req: Request, res: Response) => {
    const { productId, quantity, email, userId } = req.body as {
      productId: string;
      quantity: number;
      email?: string;
      userId?: string;
    };

    await this.paymentService.createOneTimeCheckout(res, {
      productId,
      quantity: quantity,
      customerEmail: email ?? undefined,
      userId: userId ?? undefined,
    });
  });

  createSubscriptionCheckout = asyncHandler(
    async (req: Request, res: Response) => {
      const { priceId, email, userId } = req.body as {
        priceId: string;
        email?: string;
        userId?: string;
      };

      await this.paymentService.createSubscriptionCheckout(res, {
        priceId,
        customerEmail: email ?? undefined,
        userId: userId ?? undefined,
      });
    }
  );

  refundOrder = asyncHandler(async (req: Request, res: Response) => {
    const { orderId, amount } = req.body as { orderId: string; amount: number };
    await this.paymentService.refundOrder(res, { orderId, amount });
  });

  getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await this.paymentService.getOrderById(res, { orderId: id });
  });
}
