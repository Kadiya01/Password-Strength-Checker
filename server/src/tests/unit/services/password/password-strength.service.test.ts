import { checkPasswordStrength, toStrengthResult } from "@/services/password/password-strength.service";

describe("PasswordStrengthService", () => {
  describe("Weak password detection", () => {
    it("should rate 'password' as Very Weak", () => {
      const result = checkPasswordStrength("password");
      expect(result.strength).toBe("Very Weak");
      expect(result.score).toBeLessThan(20);
      expect(result.checks.dictionary).toBe(true);
    });

    it("should rate '123456' as Very Weak", () => {
      const result = checkPasswordStrength("123456");
      expect(result.strength).toBe("Very Weak");
      expect(result.checks.dictionary).toBe(true);
    });

    it("should rate 'qwerty' as Very Weak", () => {
      const result = checkPasswordStrength("qwerty");
      expect(result.checks.keyboardPattern).toBe(true);
    });

    it("should rate 'aaaaaa' as Very Weak", () => {
      const result = checkPasswordStrength("aaaaaa");
      expect(result.checks.repeated).toBe(true);
    });
  });

  describe("Strong password detection", () => {
    it("should rate a strong random password highly", () => {
      const result = checkPasswordStrength("Xk9#mP2$vL7nQ!4w");
      expect(result.score).toBeGreaterThanOrEqual(75);
      expect(result.strength).toMatch(/Strong|Excellent/);
      expect(result.checks.uppercase).toBe(true);
      expect(result.checks.lowercase).toBe(true);
      expect(result.checks.numbers).toBe(true);
      expect(result.checks.symbols).toBe(true);
      expect(result.checks.dictionary).toBe(false);
    });

    it("should rate a long password with high entropy", () => {
      const result = checkPasswordStrength("jK8#nM2$pL5@qR9!");
      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(result.entropy).toBeGreaterThan(60);
    });
  });

  describe("Passphrase detection", () => {
    it("should detect space-separated passphrase", () => {
      const result = checkPasswordStrength("correct horse battery staple");
      expect(result.passphrase).toBe(true);
    });

    it("should detect camelCase passphrase", () => {
      const result = checkPasswordStrength("CorrectHorseBatteryStaple");
      expect(result.passphrase).toBe(true);
    });
  });

  describe("Leetspeak detection", () => {
    it("should detect leetspeak in dictionary", () => {
      const result = checkPasswordStrength("P@ssw0rd");
      expect(result.checks.dictionary).toBe(true);
    });
  });

  describe("Entropy", () => {
    it("should return positive entropy", () => {
      const result = checkPasswordStrength("anything");
      expect(result.entropy).toBeGreaterThan(0);
    });

    it("should have higher entropy for longer passwords", () => {
      const short = checkPasswordStrength("abc");
      const long = checkPasswordStrength("abcdefghij");
      expect(long.entropy).toBeGreaterThan(short.entropy);
    });
  });

  describe("Crack time", () => {
    it("should return crack time string", () => {
      const result = checkPasswordStrength("TestPassword123!");
      expect(result.crackTime).toBeDefined();
      expect(result.crackTime).toContain("Estimated");
    });
  });

  describe("Suggestions", () => {
    it("should provide suggestions for weak passwords", () => {
      const result = checkPasswordStrength("abc");
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it("should provide fewer suggestions for strong passwords", () => {
      const result = checkPasswordStrength("Xk9#mP2$vL7nQ!4wZt");
      expect(result.suggestions.length).toBeLessThanOrEqual(1);
    });
  });

  describe("toStrengthResult mapping", () => {
    it("should map PasswordAnalysisResult to StrengthResult", () => {
      const analysis = checkPasswordStrength("TestPassword123!");
      const legacy = toStrengthResult(analysis, "TestPassword123!");
      expect(legacy.score).toBe(analysis.score);
      expect(legacy.label).toBe(analysis.strength);
      expect(legacy.details.length).toBe(16);
      expect(legacy.details.entropy).toBe(analysis.entropy);
      expect(legacy.recommendations).toEqual(analysis.suggestions);
    });
  });
});
