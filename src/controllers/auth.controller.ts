// src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { User } from '../db/schema/users';
import { env } from '../config/env';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  handleOAuthSuccess = asyncHandler(async (req: Request, res: Response) => {
    // ✅ User is already created/found by passport strategy
    const user = req.user as User;

    if (!user) {
      throw new Error('User not found in OAuth callback');
    }

    // ✅ ONLY generate token and respond (no user creation here)
    if (env.NODE_ENV === 'development') {
      // Generate token and send response directly
      await this.authService.generateTokenAndRespond(user, res);
    } else {
      // For production, redirect to frontend with token
      const token = this.authService.generateToken(user);
      res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as User;
    await this.authService.getProfile(user, res);
  });

  logout = asyncHandler(async (_req: Request, res: Response) => {
    await this.authService.logout(res);
  });

  // User management methods...
  getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
    await this.authService.getAllUsers(res);
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await this.authService.getUserById(id, res);
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const data = req.body;
    await this.authService.updateUser(id, data, res);
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await this.authService.deleteUser(id, res);
  });
}
