// src/services/auth.service.ts

import { Response } from 'express';
import { UserRepository } from '../db/repositories/user.repository';
import { User } from '../db/schema/users';
import { OAuthProfileInput, JwtPayload } from '../schemas/auth.schema';
import { UpdateUserInput } from '../schemas/user.schema';

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  // Auth operations
  async handleOAuthLogin(user: User, res: Response): Promise<void> {
    return this.userRepository.handleOAuthLogin(user, res);
  }

  async getProfile(user: User, res: Response): Promise<void> {
    return this.userRepository.getProfile(user, res);
  }

  async logout(res: Response): Promise<void> {
    return this.userRepository.logout(res);
  }

  // User CRUD operations
  async getAllUsers(res: Response): Promise<void> {
    return this.userRepository.findAllWithResponse(res);
  }

  async getUserById(id: string, res: Response): Promise<void> {
    return this.userRepository.findByIdWithResponse(id, res);
  }

  async updateUser(
    id: string,
    data: UpdateUserInput,
    res: Response
  ): Promise<void> {
    return this.userRepository.updateWithResponse(id, data, res);
  }

  async deleteUser(id: string, res: Response): Promise<void> {
    return this.userRepository.deleteWithResponse(id, res);
  }

  // Helper methods for middleware (no response handling)
  generateToken(user: User): string {
    return this.userRepository.generateToken(user);
  }

  verifyToken(token: string): JwtPayload {
    return this.userRepository.verifyToken(token);
  }

  async getUserFromToken(token: string): Promise<User> {
    return this.userRepository.getUserFromToken(token);
  }

  async findOrCreateUser(profile: OAuthProfileInput): Promise<User> {
    return this.userRepository.findOrCreateUserOnly(profile);
  }

  async generateTokenAndRespond(user: User, res: Response): Promise<void> {
    return this.userRepository.generateTokenAndRespond(user, res);
  }
}
