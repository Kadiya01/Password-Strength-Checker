import { UserProfile, UpdateProfileInput } from "@/interfaces";
import { userRepository } from "@/repositories/user.repository";
import { NotFoundError, ConflictError } from "@/utils/ApiError";

export class UserService {
  async getProfile(userId: string): Promise<UserProfile> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
    if (input.email) {
      const existing = await userRepository.findById(userId);
      if (existing && existing.email !== input.email) {
        const emailTaken = await userRepository.findByEmail(input.email);
        if (emailTaken && emailTaken.id !== userId) {
          throw new ConflictError("Email is already in use");
        }
      }
    }

    if (input.username) {
      const existing = await userRepository.findById(userId);
      if (existing && existing.username !== input.username) {
        const usernameTaken = await userRepository.findByUsername(input.username);
        if (usernameTaken && usernameTaken.id !== userId) {
          throw new ConflictError("Username is already taken");
        }
      }
    }

    const updated = await userRepository.updateProfile(userId, input);
    if (!updated) {
      throw new NotFoundError("User not found");
    }

    return {
      id: updated.id,
      email: updated.email,
      username: updated.username,
      firstName: updated.firstName,
      lastName: updated.lastName,
      role: updated.role.name,
      createdAt: updated.createdAt,
    };
  }
}

export const userService = new UserService();
