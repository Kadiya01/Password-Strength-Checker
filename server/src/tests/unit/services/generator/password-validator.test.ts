import { validateGeneratedPassword, MIN_ACCEPTABLE_SCORE } from "@/services/generator/password-validator.service";

describe("PasswordValidator", () => {
  describe("quality validation", () => {
    it("should validate a strong password with all character sets", () => {
      const result = validateGeneratedPassword("Xk9#mP2$vL7nQ!4wR");
      expect(result.valid).toBe(true);
      expect(result.analysis.score).toBeGreaterThanOrEqual(MIN_ACCEPTABLE_SCORE);
      expect(result.strengthResult).toBeDefined();
    });

    it("should reject a weak password", () => {
      const result = validateGeneratedPassword("abc");
      expect(result.valid).toBe(false);
      expect(result.analysis.score).toBeLessThan(MIN_ACCEPTABLE_SCORE);
    });

    it("should reject a dictionary password", () => {
      const result = validateGeneratedPassword("password");
      expect(result.valid).toBe(false);
    });

    it("should always return analysis and strengthResult", () => {
      const result = validateGeneratedPassword("test");
      expect(result.analysis).toBeDefined();
      expect(result.analysis).toHaveProperty("score");
      expect(result.analysis).toHaveProperty("strength");
      expect(result.analysis).toHaveProperty("entropy");
      expect(result.analysis).toHaveProperty("crackTime");
      expect(result.analysis).toHaveProperty("checks");
      expect(result.analysis).toHaveProperty("suggestions");
      expect(result.strengthResult).toBeDefined();
      expect(result.strengthResult).toHaveProperty("score");
      expect(result.strengthResult).toHaveProperty("label");
      expect(result.strengthResult).toHaveProperty("details");
      expect(result.strengthResult).toHaveProperty("recommendations");
    });

    it("should validate a long random-looking password", () => {
      const result = validateGeneratedPassword("aB3$kL9#mN2@pQ5!rS8&wX1");
      expect(result.valid).toBe(true);
    });
  });

  describe("MIN_ACCEPTABLE_SCORE", () => {
    it("should be 75 (Strong threshold)", () => {
      expect(MIN_ACCEPTABLE_SCORE).toBe(75);
    });
  });
});
