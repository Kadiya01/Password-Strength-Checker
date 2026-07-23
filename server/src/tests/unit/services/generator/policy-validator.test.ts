import { validateGenerationPolicy, validatePassphrasePolicy, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, MIN_WORDS, MAX_WORDS } from "@/services/generator/policy-validator.service";
import { ValidationError } from "@/utils/ApiError";

describe("PolicyValidator", () => {
  describe("validateGenerationPolicy", () => {
    it("should accept valid policy with all defaults", () => {
      expect(() => validateGenerationPolicy({})).not.toThrow();
    });

    it("should accept valid policy with explicit options", () => {
      expect(() =>
        validateGenerationPolicy({
          length: 24,
          uppercase: true,
          lowercase: true,
          numbers: true,
          symbols: true,
          excludeAmbiguous: true,
        })
      ).not.toThrow();
    });

    it("should accept minimum length", () => {
      expect(() => validateGenerationPolicy({ length: MIN_PASSWORD_LENGTH })).not.toThrow();
    });

    it("should accept maximum length", () => {
      expect(() => validateGenerationPolicy({ length: MAX_PASSWORD_LENGTH })).not.toThrow();
    });

    it("should reject length below minimum", () => {
      expect(() => validateGenerationPolicy({ length: 7 })).toThrow(ValidationError);
    });

    it("should reject length above maximum", () => {
      expect(() => validateGenerationPolicy({ length: 65 })).toThrow(ValidationError);
    });

    it("should reject when no character sets are enabled", () => {
      expect(() =>
        validateGenerationPolicy({
          uppercase: false,
          lowercase: false,
          numbers: false,
          symbols: false,
        })
      ).toThrow(ValidationError);
    });

    it("should accept when only uppercase is enabled", () => {
      expect(() =>
        validateGenerationPolicy({
          uppercase: true,
          lowercase: false,
          numbers: false,
          symbols: false,
        })
      ).not.toThrow();
    });

    it("should accept when only symbols are enabled", () => {
      expect(() =>
        validateGenerationPolicy({
          uppercase: false,
          lowercase: false,
          numbers: false,
          symbols: true,
        })
      ).not.toThrow();
    });
  });

  describe("validatePassphrasePolicy", () => {
    it("should accept valid passphrase policy with defaults", () => {
      expect(() => validatePassphrasePolicy({})).not.toThrow();
    });

    it("should accept word count of 4", () => {
      expect(() => validatePassphrasePolicy({ words: 4 })).not.toThrow();
    });

    it("should accept word count of 8", () => {
      expect(() => validatePassphrasePolicy({ words: 8 })).not.toThrow();
    });

    it("should reject word count below 4", () => {
      expect(() => validatePassphrasePolicy({ words: 3 })).toThrow(ValidationError);
    });

    it("should reject word count above 8", () => {
      expect(() => validatePassphrasePolicy({ words: 9 })).toThrow(ValidationError);
    });

    it("should accept hyphen separator", () => {
      expect(() => validatePassphrasePolicy({ separator: "-" })).not.toThrow();
    });

    it("should accept space separator", () => {
      expect(() => validatePassphrasePolicy({ separator: " " })).not.toThrow();
    });

    it("should accept underscore separator", () => {
      expect(() => validatePassphrasePolicy({ separator: "_" })).not.toThrow();
    });

    it("should accept number separator", () => {
      expect(() => validatePassphrasePolicy({ separator: "number" })).not.toThrow();
    });

    it("should accept symbol separator", () => {
      expect(() => validatePassphrasePolicy({ separator: "symbol" })).not.toThrow();
    });

    it("should reject invalid separator", () => {
      expect(() => validatePassphrasePolicy({ separator: "invalid" })).toThrow(ValidationError);
    });
  });

  describe("constants", () => {
    it("should have MIN_PASSWORD_LENGTH of 8", () => {
      expect(MIN_PASSWORD_LENGTH).toBe(8);
    });

    it("should have MAX_PASSWORD_LENGTH of 64", () => {
      expect(MAX_PASSWORD_LENGTH).toBe(64);
    });

    it("should have MIN_WORDS of 4", () => {
      expect(MIN_WORDS).toBe(4);
    });

    it("should have MAX_WORDS of 8", () => {
      expect(MAX_WORDS).toBe(8);
    });
  });
});
