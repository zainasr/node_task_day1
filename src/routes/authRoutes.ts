// src/routes/authRoutes.ts
import { Router } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

export const createAuthRouter = (
  authController: AuthController,
  authMiddleware: AuthMiddleware
): Router => {
  const router = Router();

  // Google OAuth routes
  router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get(
    '/google/callback',
    passport.authenticate('google', {
      session: false,
      failureRedirect: '/api/auth/failed',
    }),
    authController.handleOAuthSuccess
  );

  // Authentication failure route
  router.get('/failed', (_, res) => {
    res.status(401).json({ success: false, message: 'Authentication failed' });
  });

  // Protected profile route
  router.get(
    '/profile',
    authMiddleware.authenticate,
    authController.getProfile
  );

  // Logout route
  router.post('/logout', authController.logout);

  return router;
};
