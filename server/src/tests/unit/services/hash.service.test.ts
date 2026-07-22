import { hashService } from "@/services/hash.service";

describe("HashService", () => {
  describe("hash", () => {
    it("should hash a password", async () => {
      const hash = await hashService.hash("password123");
      expect(hash).toBeDefined();
      expect(hash).not.toBe("password123");
      expect(hash.startsWith("$2b$")).toBe(true);
    });

    it("should produce different hashes for same input (due to salt)", async () => {
      const hash1 = await hashService.hash("password123");
      const hash2 = await hashService.hash("password123");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("compare", () => {
    it("should return true for matching password", async () => {
      const hash = await hashService.hash("password123");
      const result = await hashService.compare("password123", hash);
      expect(result).toBe(true);
    });

    it("should return false for non-matching password", async () => {
      const hash = await hashService.hash("password123");
      const result = await hashService.compare("wrongpassword", hash);
      expect(result).toBe(false);
    });

    it("should return false for empty string against hash", async () => {
      const hash = await hashService.hash("password123");
      const result = await hashService.compare("", hash);
      expect(result).toBe(false);
    });
  });
});
