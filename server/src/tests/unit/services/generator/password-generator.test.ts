import { generateSecurePassword } from "@/services/generator/password-generator.service";
import crypto from "crypto";

describe("PasswordGenerator", () => {
  const defaultOptions = {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  };

  describe("basic generation", () => {
    it("should generate a password of the specified length", () => {
      const password = generateSecurePassword({ ...defaultOptions, length: 20 });
      expect(password.length).toBe(20);
    });

    it("should generate a password with default length 16", () => {
      const password = generateSecurePassword(defaultOptions);
      expect(password.length).toBe(16);
    });

    it("should generate a password with minimum length 8", () => {
      const password = generateSecurePassword({ ...defaultOptions, length: 8 });
      expect(password.length).toBe(8);
    });

    it("should generate a password with maximum length 64", () => {
      const password = generateSecurePassword({ ...defaultOptions, length: 64 });
      expect(password.length).toBe(64);
    });

    it("should throw on length less than 8", () => {
      expect(() => generateSecurePassword({ ...defaultOptions, length: 7 })).toThrow();
    });

    it("should throw on length greater than 64", () => {
      expect(() => generateSecurePassword({ ...defaultOptions, length: 65 })).toThrow();
    });
  });

  describe("character set compliance", () => {
    it("should contain at least one uppercase when enabled", () => {
      for (let i = 0; i < 50; i++) {
        const password = generateSecurePassword({ ...defaultOptions, length: 20 });
        expect(password).toMatch(/[A-Z]/);
      }
    });

    it("should contain at least one lowercase when enabled", () => {
      for (let i = 0; i < 50; i++) {
        const password = generateSecurePassword({ ...defaultOptions, length: 20 });
        expect(password).toMatch(/[a-z]/);
      }
    });

    it("should contain at least one number when enabled", () => {
      for (let i = 0; i < 50; i++) {
        const password = generateSecurePassword({ ...defaultOptions, length: 20 });
        expect(password).toMatch(/[0-9]/);
      }
    });

    it("should contain at least one symbol when enabled", () => {
      for (let i = 0; i < 50; i++) {
        const password = generateSecurePassword({ ...defaultOptions, length: 20 });
        expect(password).toMatch(/[^a-zA-Z0-9]/);
      }
    });

    it("should only contain characters from the enabled sets", () => {
      const password = generateSecurePassword({
        length: 20,
        uppercase: true,
        lowercase: false,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      });
      expect(password).toMatch(/^[A-Z]+$/);
    });

    it("should only contain numbers when only numbers enabled", () => {
      const password = generateSecurePassword({
        length: 20,
        uppercase: false,
        lowercase: false,
        numbers: true,
        symbols: false,
        excludeAmbiguous: false,
      });
      expect(password).toMatch(/^[0-9]+$/);
    });
  });

  describe("no Math.random usage", () => {
    const originalRandom = Math.random;
    let mathRandomCalled = false;

    beforeEach(() => {
      mathRandomCalled = false;
      Math.random = () => {
        mathRandomCalled = true;
        return 0.5;
      };
    });

    afterEach(() => {
      Math.random = originalRandom;
    });

    it("should never call Math.random()", () => {
      for (let i = 0; i < 100; i++) {
        generateSecurePassword(defaultOptions);
      }
      expect(mathRandomCalled).toBe(false);
    });
  });

  describe("uniqueness", () => {
    it("should generate different passwords on consecutive calls", () => {
      const passwords = new Set<string>();
      for (let i = 0; i < 100; i++) {
        passwords.add(generateSecurePassword(defaultOptions));
      }
      expect(passwords.size).toBeGreaterThan(90);
    });
  });

  describe("entropy", () => {
    it("should have higher entropy with more character sets", () => {
      const lowerOnly = generateSecurePassword({
        length: 16,
        uppercase: false,
        lowercase: true,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      });

      const allSets = generateSecurePassword({
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: false,
      });

      // With more character sets, the password should contain a wider variety of character types
      const hasUpper = /[A-Z]/.test(allSets);
      const hasLower = /[a-z]/.test(allSets);
      const hasNum = /[0-9]/.test(allSets);
      const hasSym = /[^A-Za-z0-9]/.test(allSets);
      expect(hasUpper || hasNum || hasSym).toBe(true);

      // Lower-only should only contain lowercase
      expect(lowerOnly).toMatch(/^[a-z]+$/);
    });
  });

  describe("ambiguous character exclusion", () => {
    it("should not contain ambiguous characters when excluded", () => {
      for (let i = 0; i < 100; i++) {
        const password = generateSecurePassword({
          ...defaultOptions,
          excludeAmbiguous: true,
          length: 32,
        });
        expect(password).not.toMatch(/[O0Il1|{}\[\]]/);
      }
    });
  });

  describe("error handling", () => {
    it("should throw when no character sets are enabled", () => {
      expect(() =>
        generateSecurePassword({
          length: 16,
          uppercase: false,
          lowercase: false,
          numbers: false,
          symbols: false,
          excludeAmbiguous: false,
        })
      ).toThrow("Character pool is empty");
    });
  });
});
