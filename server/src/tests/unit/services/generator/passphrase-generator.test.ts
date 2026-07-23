import { generateSecurePassphrase } from "@/services/generator/passphrase-generator.service";
import { PASSPHRASE_WORD_LIST } from "@/data/word-list";

describe("PassphraseGenerator", () => {
  describe("basic generation", () => {
    it("should generate a passphrase with default 5 words", () => {
      const passphrase = generateSecurePassphrase({ words: 5, separator: "-" });
      const words = passphrase.split("-");
      expect(words.length).toBe(5);
    });

    it("should generate a passphrase with 4 words", () => {
      const passphrase = generateSecurePassphrase({ words: 4, separator: "-" });
      const words = passphrase.split("-");
      expect(words.length).toBe(4);
    });

    it("should generate a passphrase with 8 words", () => {
      const passphrase = generateSecurePassphrase({ words: 8, separator: "-" });
      const words = passphrase.split("-");
      expect(words.length).toBe(8);
    });

    it("should throw on word count less than 4", () => {
      expect(() => generateSecurePassphrase({ words: 3, separator: "-" })).toThrow();
    });

    it("should throw on word count greater than 8", () => {
      expect(() => generateSecurePassphrase({ words: 9, separator: "-" })).toThrow();
    });
  });

  describe("separator handling", () => {
    it("should use hyphen separator", () => {
      const passphrase = generateSecurePassphrase({ words: 5, separator: "-" });
      expect(passphrase).toContain("-");
      const words = passphrase.split("-");
      expect(words.length).toBe(5);
    });

    it("should use space separator", () => {
      const passphrase = generateSecurePassphrase({ words: 5, separator: " " });
      const words = passphrase.split(" ");
      expect(words.length).toBe(5);
    });

    it("should use underscore separator", () => {
      const passphrase = generateSecurePassphrase({ words: 5, separator: "_" });
      const words = passphrase.split("_");
      expect(words.length).toBe(5);
    });

    it("should use random number separator", () => {
      const passphrase = generateSecurePassphrase({ words: 5, separator: "number" });
      const parts = passphrase.split(/[0-9]/);
      expect(parts.length).toBeGreaterThanOrEqual(5);
    });

    it("should use random symbol separator", () => {
      const passphrase = generateSecurePassphrase({ words: 5, separator: "symbol" });
      const parts = passphrase.split(/[^a-zA-Z]+/);
      expect(parts.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("word validity", () => {
    it("should only use words from the word list", () => {
      const wordSet = new Set(PASSPHRASE_WORD_LIST);
      for (let i = 0; i < 100; i++) {
        const passphrase = generateSecurePassphrase({ words: 5, separator: "-" });
        const words = passphrase.split("-");
        for (const word of words) {
          expect(wordSet.has(word)).toBe(true);
        }
      }
    });

    it("should not use predictable dictionary words", () => {
      const badWords = ["password", "123456", "qwerty", "admin", "letmein"];
      for (let i = 0; i < 100; i++) {
        const passphrase = generateSecurePassphrase({ words: 5, separator: "-" });
        for (const bad of badWords) {
          expect(passphrase).not.toContain(bad);
        }
      }
    });
  });

  describe("uniqueness", () => {
    it("should generate different passphrases on consecutive calls", () => {
      const passphrases = new Set<string>();
      for (let i = 0; i < 50; i++) {
        passphrases.add(generateSecurePassphrase({ words: 5, separator: "-" }));
      }
      expect(passphrases.size).toBeGreaterThan(40);
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
      for (let i = 0; i < 50; i++) {
        generateSecurePassphrase({ words: 5, separator: "-" });
      }
      expect(mathRandomCalled).toBe(false);
    });
  });

  describe("word list integrity", () => {
    it("should have at least 1500 words in the word list", () => {
      expect(PASSPHRASE_WORD_LIST.length).toBeGreaterThanOrEqual(1500);
    });

    it("should have only lowercase words", () => {
      for (const word of PASSPHRASE_WORD_LIST) {
        expect(word).toMatch(/^[a-z]+$/);
      }
    });

    it("should have only words between 2-12 characters", () => {
      for (const word of PASSPHRASE_WORD_LIST) {
        expect(word.length).toBeGreaterThanOrEqual(2);
        expect(word.length).toBeLessThanOrEqual(12);
      }
    });

    it("should have no duplicate words", () => {
      const unique = new Set(PASSPHRASE_WORD_LIST);
      expect(unique.size).toBe(PASSPHRASE_WORD_LIST.length);
    });
  });
});
