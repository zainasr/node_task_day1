import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { sendValidationError } from '../utils/response';

/**
 * Validates request body against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateBody =
  <S extends ZodTypeAny>(schema: S) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse and validate the request body
      const parsed = schema.parse(req.body);

      // Replace req.body with parsed/sanitized data
      req.body = parsed;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationDetails = error.errors.map((err) => ({
          path: err.path.join('.') || 'body',
          message: err.message,
        }));

        sendValidationError(res, validationDetails);
        return;
      }

      // Pass unexpected errors to error handler
      next(error);
    }
  };

/**
 * Validates route parameters against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateParams =
  <S extends ZodTypeAny>(schema: S) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse and validate route parameters
      const parsed = schema.parse(req.params);

      // Replace req.params with parsed/sanitized data
      req.params = parsed;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationDetails = error.errors.map((err) => ({
          path: err.path.join('.') || 'params',
          message: err.message,
        }));

        sendValidationError(res, validationDetails);
        return;
      }

      // Pass unexpected errors to error handler
      next(error);
    }
  };
