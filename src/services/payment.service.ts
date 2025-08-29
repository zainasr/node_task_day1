import { Response } from 'express';
import { PaymentRepository } from '../db/repositories/payment.repository';

export class PaymentService {
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async createOneTimeCheckout(
    res: Response,
    params: {
      productId: string;
      quantity: number;
      customerEmail: string | undefined;
      userId: string | undefined;
    }
  ): Promise<void> {
    return this.paymentRepo.createOneTimeCheckout(res, params);
  }

  async createSubscriptionCheckout(
    res: Response,
    params: { priceId: string; customerEmail: string | undefined; userId: string | undefined }
  ): Promise<void> {
    return this.paymentRepo.createSubscriptionCheckout(res, params);
  }

  async refundOrder(
    res: Response,
    params: { orderId: string; amount: number }
  ): Promise<void> {
    return this.paymentRepo.refundOrder(res, params);
  }

  async getOrderById(
    res: Response,
    params: { orderId: string }
  ): Promise<void> {
    return this.paymentRepo.getOrderById(res, params);
  }
}
