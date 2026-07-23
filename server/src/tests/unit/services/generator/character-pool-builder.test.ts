import { buildCharacterPool, getCharacterSetLabels, AMBIGUOUS_CHARS, CHARSETS } from "@/services/generator/character-pool-builder.service";

describe("CharacterPoolBuilder", () => {
  describe("buildCharacterPool", () => {
    it("should build pool with all character sets", () => {
      const pool = buildCharacterPool({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: false,
      });

      expect(pool).toContain("A");
      expect(pool).toContain("z");
      expect(pool).toContain("0");
      expect(pool).toContain("!");
      expect(pool.length).toBe(26 + 26 + 10 + 26);
    });

    it("should build pool with only uppercase", () => {
      const pool = buildCharacterPool({
        uppercase: true,
        lowercase: false,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      });

      expect(pool).toBe(CHARSETS.uppercase);
      expect(pool.length).toBe(26);
    });

    it("should build pool with only lowercase", () => {
      const pool = buildCharacterPool({
        uppercase: false,
        lowercase: true,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      });

      expect(pool).toBe(CHARSETS.lowercase);
      expect(pool.length).toBe(26);
    });

    it("should build pool with only numbers", () => {
      const pool = buildCharacterPool({
        uppercase: false,
        lowercase: false,
        numbers: true,
        symbols: false,
        excludeAmbiguous: false,
      });

      expect(pool).toBe(CHARSETS.numbers);
      expect(pool.length).toBe(10);
    });

    it("should build pool with only symbols", () => {
      const pool = buildCharacterPool({
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: true,
        excludeAmbiguous: false,
      });

      expect(pool).toBe(CHARSETS.symbols);
      expect(pool.length).toBe(26);
    });

    it("should return empty string when no sets enabled", () => {
      const pool = buildCharacterPool({
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      });

      expect(pool).toBe("");
    });

    it("should exclude ambiguous characters when enabled", () => {
      const pool = buildCharacterPool({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: true,
      });

      for (const ch of AMBIGUOUS_CHARS) {
        expect(pool).not.toContain(ch);
      }
    });

    it("should include ambiguous characters when exclusion is disabled", () => {
      const pool = buildCharacterPool({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: false,
      });

      expect(pool).toContain("O");
      expect(pool).toContain("I");
      expect(pool).toContain("l");
      expect(pool).toContain("0");
      expect(pool).toContain("1");
    });

    it("should have correct ambiguous characters removed", () => {
      const pool = buildCharacterPool({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: true,
      });

      expect(pool).not.toContain("O");
      expect(pool).not.toContain("0");
      expect(pool).not.toContain("I");
      expect(pool).not.toContain("l");
      expect(pool).not.toContain("1");
      expect(pool).not.toContain("|");
      expect(pool).not.toContain("{");
      expect(pool).not.toContain("}");
      expect(pool).not.toContain("[");
      expect(pool).not.toContain("]");
    });

    it("should reduce pool size when excluding ambiguous characters", () => {
      const fullPool = buildCharacterPool({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: false,
      });

      const reducedPool = buildCharacterPool({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: true,
      });

      expect(reducedPool.length).toBeLessThan(fullPool.length);
    });
  });

  describe("getCharacterSetLabels", () => {
    it("should return all labels when all sets enabled", () => {
      const labels = getCharacterSetLabels({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: false,
      });

      expect(labels).toEqual(["uppercase", "lowercase", "numbers", "symbols"]);
    });

    it("should return only enabled labels", () => {
      const labels = getCharacterSetLabels({
        uppercase: true,
        lowercase: false,
        numbers: true,
        symbols: false,
        excludeAmbiguous: false,
      });

      expect(labels).toEqual(["uppercase", "numbers"]);
    });

    it("should return empty array when none enabled", () => {
      const labels = getCharacterSetLabels({
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      });

      expect(labels).toEqual([]);
    });
  });
});
