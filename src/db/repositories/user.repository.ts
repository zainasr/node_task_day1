// src/db/repositories/user.repository.ts
import { eq, and } from 'drizzle-orm';
import { Response } from 'express';
import jwt from 'jsonwebtoken';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users, User } from '../schema/users';
import * as schema from '../schema';
import { CreateUserInput, UpdateUserInput } from '../../schemas/user.schema';
import { OAuthProfileInput, JwtPayload } from '../../schemas/auth.schema';
import { env } from '../../config/env';

import {
  UserNotFoundError,
  DuplicateUserError,
  InvalidUserDataError,
  AuthenticationError,
  InvalidTokenError,
  TokenGenerationError,
  DatabaseError,
} from '../../common/errors';

import {
  sendSuccess,
  AuthResponses,
  UserResponses,
} from '../../utils/response';

export class UserRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  // ===== AUTH OPERATIONS (with response handling) =====

  /**
   * Handle OAuth login with already authenticated user
   * This method receives a user that was already found/created by passport strategy
   */
  async handleOAuthLogin(user: User, res: Response): Promise<void> {
    try {
      // ✅ FIX: User is already created by passport, just generate token and respond
      const token = this.generateToken(user);

      const authData = {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          role: user.role,
        },
      };

      const responseData = AuthResponses.login(authData);
      sendSuccess(res, responseData);
    } catch (error) {
      if (error instanceof TokenGenerationError) {
        throw error;
      }
      throw new AuthenticationError('OAuth authentication failed');
    }
  }

  /**
   * Get user profile - handles everything including response
   */
  async getProfile(user: User, res: Response): Promise<void> {
    try {
      if (!user) {
        throw new AuthenticationError('User not authenticated');
      }

      const profileData = {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      const responseData = AuthResponses.profile(profileData);
      sendSuccess(res, responseData);
    } catch (error) {
      throw new AuthenticationError('Failed to retrieve profile');
    }
  }

  /**
   * Handle logout - handles everything including response
   */
  async logout(res: Response): Promise<void> {
    try {
      const responseData = AuthResponses.logout();
      sendSuccess(res, responseData);
    } catch (error) {
      throw new AuthenticationError('Logout failed');
    }
  }

  // ===== USER CRUD OPERATIONS (with response handling) =====

  /**
   * Get all users - handles everything including response
   */
  async findAllWithResponse(res: Response): Promise<void> {
    try {
      const allUsers = await this.db.select().from(users);
      const responseData = UserResponses.getAll(allUsers);
      sendSuccess(res, responseData);
    } catch (error) {
      throw new DatabaseError(
        'Failed to fetch users from database',
        error,
        'FETCH_ERROR',
        'findAllWithResponse'
      );
    }
  }

  /**
   * Get user by ID - handles everything including response
   */
  async findByIdWithResponse(id: string, res: Response): Promise<void> {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new UserNotFoundError(id);
      }

      const responseData = UserResponses.getById(user);
      sendSuccess(res, responseData);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        'Failed to fetch user from database',
        error,
        'FETCH_ERROR',
        'findByIdWithResponse'
      );
    }
  }

  /**
   * Update user - handles everything including response
   */
  async updateWithResponse(
    id: string,
    data: UpdateUserInput,
    res: Response
  ): Promise<void> {
    try {
      // Check if user exists
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new UserNotFoundError(id);
      }

      // Check for duplicate email if email is being updated
      if (data['email'] && data['email'] !== existingUser.email) {
        const emailExists = await this.findByEmail(data['email'] as string);
        if (emailExists) {
          throw new DuplicateUserError(data['email'] as string);
        }
      }

      // Validate role if being updated
      if (data['role'] && !['user', 'admin'].includes(data['role'] as string)) {
        throw new InvalidUserDataError('Role must be either "user" or "admin"');
      }

      const [result] = await this.db
        .update(users)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      const responseData = UserResponses.update(result as User);
      sendSuccess(res, responseData);
    } catch (error) {
      if (
        error instanceof UserNotFoundError ||
        error instanceof DuplicateUserError ||
        error instanceof InvalidUserDataError
      ) {
        throw error;
      }
      throw new DatabaseError(
        'Failed to update user in database',
        error,
        'UPDATE_ERROR',
        'updateWithResponse'
      );
    }
  }

  /**
   * Delete user - handles everything including response
   */
  async deleteWithResponse(id: string, res: Response): Promise<void> {
    try {
      const result = await this.db
        .delete(users)
        .where(eq(users.id, id))
        .returning({ id: users.id });

      if (result.length === 0) {
        throw new UserNotFoundError(id);
      }

      const responseData = UserResponses.delete();
      sendSuccess(res, responseData);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        'Failed to delete user from database',
        error,
        'DELETE_ERROR',
        'deleteWithResponse'
      );
    }
  }

  // ===== HELPER METHODS (no response handling) =====

  async findById(id: string): Promise<User | null> {
    try {
      const result = await this.db.query.users.findFirst({
        where: eq(users.id, id),
      });
      return result || null;
    } catch (error) {
      throw new DatabaseError(
        'Failed to find user by ID',
        error,
        'FETCH_ERROR',
        'findById'
      );
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.db.query.users.findFirst({
        where: eq(users.email, email),
      });
      return result || null;
    } catch (error) {
      throw new DatabaseError(
        'Failed to find user by email',
        error,
        'FETCH_ERROR',
        'findByEmail'
      );
    }
  }

  async findByProviderId(
    provider: string,
    providerId: string
  ): Promise<User | null> {
    try {
      const result = await this.db.query.users.findFirst({
        where: and(
          eq(users.provider, provider),
          eq(users.providerId, providerId)
        ),
      });
      return result || null;
    } catch (error) {
      throw new DatabaseError(
        'Failed to find user by provider ID',
        error,
        'FETCH_ERROR',
        'findByProviderId'
      );
    }
  }

  async findOrCreateUser(profile: OAuthProfileInput): Promise<User> {
    try {
      let user = await this.findByProviderId(
        profile['provider'] as string,
        profile['providerId'] as string
      );

      if (!user) {
        user = await this.findByEmail(profile['email'] as string);

        if (user) {
          // Update provider details
          user = await this.update(user.id, {
            provider: profile['provider'],
            providerId: profile['providerId'],
            picture: profile['picture'] || user.picture || undefined,
          });
        } else {
          // Create new user
          const newUser: CreateUserInput = {
            email: profile['email'],
            name: profile['name'],
            picture: profile['picture'],
            provider: profile['provider'],
            providerId: profile['providerId'],
            role: 'user',
          };
          user = await this.create(newUser);
        }
      } else {
        // Update user info if needed
        if (
          user.picture !== profile['picture'] ||
          user.name !== profile['name']
        ) {
          user = await this.update(user.id, {
            name: profile['name'],
            picture: profile['picture'],
          });
        }
      }

      return user;
    } catch (error) {
      throw new AuthenticationError('Error finding or creating user');
    }
  }

  private async create(data: CreateUserInput): Promise<User> {
    try {
      const existingUser = await this.findByEmail(data['email'] as string);
      if (existingUser) {
        throw new DuplicateUserError(data['email'] as string);
      }

      const [result] = await this.db.insert(users).values(data).returning();
      return result as User;
    } catch (error) {
      if (error instanceof DuplicateUserError) {
        throw error;
      }
      throw new DatabaseError(
        'Failed to create user in database',
        error,
        'CREATE_ERROR',
        'create'
      );
    }
  }

  private async update(id: string, data: UpdateUserInput): Promise<User> {
    try {
      const [result] = await this.db
        .update(users)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      if (!result) {
        throw new UserNotFoundError(id);
      }

      return result as User;
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        'Failed to update user in database',
        error,
        'UPDATE_ERROR',
        'update'
      );
    }
  }

  // Auth helper methods
  generateToken(user: User): string {
    try {
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role as 'user' | 'admin',
      };

      return jwt.sign(payload, env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: '1hr',
      });
    } catch (error) {
      throw new TokenGenerationError('Failed to generate authentication token');
    }
  }

  verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      return {
        sub: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      throw new InvalidTokenError();
    }
  }

  async getUserFromToken(token: string): Promise<User> {
    try {
      const { sub } = this.verifyToken(token);
      const user = await this.findById(sub);

      if (!user) {
        throw new UserNotFoundError(sub);
      }

      return user;
    } catch (error) {
      if (
        error instanceof InvalidTokenError ||
        error instanceof UserNotFoundError
      ) {
        throw error;
      }
      throw new InvalidTokenError();
    }
  }

  /**
   * Generate token and send response (for OAuth success)
   */
  async generateTokenAndRespond(user: User, res: Response): Promise<void> {
    try {
      const token = this.generateToken(user);

      const authData = {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          role: user.role,
        },
      };

      const responseData = AuthResponses.login(authData);
      sendSuccess(res, responseData);
    } catch (error) {
      throw new TokenGenerationError('Failed to generate token and respond');
    }
  }

  /**
   * Find or create user (for passport strategy only - no response)
   */
  async findOrCreateUserOnly(profile: OAuthProfileInput): Promise<User> {
    try {
      let user = await this.findByProviderId(
        profile['provider'] as string,
        profile['providerId'] as string
      );

      if (!user) {
        user = await this.findByEmail(profile['email'] as string);

        if (user) {
          // Update provider details
          user = await this.update(user.id, {
            provider: profile['provider'],
            providerId: profile['providerId'],
            picture: profile['picture'] || user.picture || undefined,
          });
        } else {
          // Create new user
          const newUser: CreateUserInput = {
            email: profile['email'],
            name: profile['name'],
            picture: profile['picture'],
            provider: profile['provider'],
            providerId: profile['providerId'],
            role: 'user',
          };
          user = await this.create(newUser);
        }
      } else {
        // Update user info if needed
        if (
          user.picture !== profile['picture'] ||
          user.name !== profile['name']
        ) {
          user = await this.update(user.id, {
            name: profile['name'],
            picture: profile['picture'],
          });
        }
      }

      return user;
    } catch (error) {
      throw new AuthenticationError(
        'Error finding or creating user during OAuth'
      );
    }
  }
}
