jest.mock("@/repositories/user.repository", () => ({
  userRepository: {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    updateProfile: jest.fn(),
  },
}));

import { UserService } from "@/services/user.service";
import { userRepository } from "@/repositories/user.repository";

const mockUserRepo = jest.mocked(userRepository);

const mockUser = {
  id: "user-123",
  email: "test@example.com",
  username: "testuser",
  firstName: "Test",
  lastName: "User",
  role: { name: "USER" },
  createdAt: new Date("2024-01-01"),
};

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should return user profile data", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser as any);

      const result = await userService.getProfile("user-123");

      expect(result).toEqual({
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        role: "USER",
        createdAt: new Date("2024-01-01"),
      });
      expect(mockUserRepo.findById).toHaveBeenCalledWith("user-123");
    });

    it("should throw NotFoundError for non-existent user", async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(userService.getProfile("nonexistent")).rejects.toThrow("User not found");
    });
  });

  describe("updateProfile", () => {
    it("should update user fields", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser as any);
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.updateProfile.mockResolvedValue({
        ...mockUser,
        firstName: "Updated",
      } as any);

      const result = await userService.updateProfile("user-123", { firstName: "Updated" });

      expect(result.firstName).toBe("Updated");
      expect(mockUserRepo.updateProfile).toHaveBeenCalledWith("user-123", { firstName: "Updated" });
    });

    it("should throw ConflictError when email is already in use by another user", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser as any);
      mockUserRepo.findByEmail.mockResolvedValue({
        id: "other-user",
        email: "taken@example.com",
      } as any);

      await expect(
        userService.updateProfile("user-123", { email: "taken@example.com" }),
      ).rejects.toThrow("Email is already in use");
    });

    it("should allow same email (no change)", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser as any);
      mockUserRepo.updateProfile.mockResolvedValue(mockUser as any);

      const result = await userService.updateProfile("user-123", { email: "test@example.com" });

      expect(result.email).toBe("test@example.com");
      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
    });

    it("should throw ConflictError when username is already taken by another user", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser as any);
      mockUserRepo.findByUsername.mockResolvedValue({
        id: "other-user",
        username: "takenuser",
      } as any);

      await expect(
        userService.updateProfile("user-123", { username: "takenuser" }),
      ).rejects.toThrow("Username is already taken");
    });

    it("should allow same username (no change)", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser as any);
      mockUserRepo.updateProfile.mockResolvedValue(mockUser as any);

      const result = await userService.updateProfile("user-123", { username: "testuser" });

      expect(result.username).toBe("testuser");
      expect(mockUserRepo.findByUsername).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError when user not found after update", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser as any);
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.updateProfile.mockResolvedValue(null);

      await expect(
        userService.updateProfile("user-123", { firstName: "Updated" }),
      ).rejects.toThrow("User not found");
    });
  });
});
