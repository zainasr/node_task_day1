// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendError } from '../utils/response';



// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export class AuthMiddleware {
  constructor(private readonly authService: AuthService) {}

  // Middleware to authenticate JWT token
  authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendError(res, 'No token provided', 401);
        return;
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        sendError(res, 'Invalid token format', 401);
        return;
      }

      try {
        // Verify token and get user
        const user = await this.authService.getUserFromToken(token);

        // Attach user to request
        req.user = user ;
        next();
      } catch (error) {
        sendError(res, 'Invalid or expired token', 401);
      }
    } catch (error) {
      sendError(
        res,
        error instanceof Error ? error.message : 'Authentication error',
        500
      );
    }
  };

  // Middleware to check if user has admin role
  requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    if (user.role !== 'admin') {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }

    next();
  };

  // Middleware to check if user has specific role
  requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = req.user;

      if (!user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      if (!roles.includes(user.role)) {
        sendError(res, 'Insufficient permissions', 403);
        return;
      }

      next();
    };
  };
}
