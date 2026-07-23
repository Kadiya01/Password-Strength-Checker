import { calculateGeneratorEntropy } from "@/services/generator/generator-entropy.service";

describe("GeneratorEntropy", () => {
  describe("basic entropy calculation", () => {
    it("should calculate entropy for standard password parameters", () => {
      const result = calculateGeneratorEntropy(94, 16);
      expect(result.entropy).toBe(parseFloat((Math.log2(94) * 16).toFixed(1)));
      expect(result.poolSize).toBe(94);
    });

    it("should calculate entropy for lowercase only pool", () => {
      const result = calculateGeneratorEntropy(26, 16);
      expect(result.poolSize).toBe(26);
      expect(result.entropy).toBe(parseFloat((Math.log2(26) * 16).toFixed(1)));
    });

    it("should calculate entropy for large pool", () => {
      const result = calculateGeneratorEntropy(94, 64);
      expect(result.entropy).toBeGreaterThan(300);
    });

    it("should calculate search space correctly", () => {
      const result = calculateGeneratorEntropy(10, 4);
      expect(result.searchSpace).toBe(Math.pow(10, 4));
    });
  });

  describe("zero/empty inputs", () => {
    it("should return 0 entropy for zero pool size", () => {
      const result = calculateGeneratorEntropy(0, 16);
      expect(result.entropy).toBe(0);
      expect(result.poolSize).toBe(0);
      expect(result.searchSpace).toBe(0);
    });

    it("should return 0 entropy for zero length", () => {
      const result = calculateGeneratorEntropy(94, 0);
      expect(result.entropy).toBe(0);
    });
  });

  describe("crack time estimation", () => {
    it("should return Instantly for very low entropy", () => {
      const result = calculateGeneratorEntropy(2, 4);
      expect(result.estimatedCrackTime).toBeDefined();
      expect(typeof result.estimatedCrackTime).toBe("string");
    });

    it("should return longer times for higher entropy", () => {
      const low = calculateGeneratorEntropy(26, 8);
      const high = calculateGeneratorEntropy(94, 32);
      expect(high.entropy).toBeGreaterThan(low.entropy);
    });

    it("should return meaningful crack time for strong passwords", () => {
      const result = calculateGeneratorEntropy(94, 20);
      expect(result.estimatedCrackTime).not.toBe("Instantly");
    });
  });

  describe("entropy properties", () => {
    it("should produce higher entropy with larger pool sizes", () => {
      const small = calculateGeneratorEntropy(26, 16);
      const large = calculateGeneratorEntropy(94, 16);
      expect(large.entropy).toBeGreaterThan(small.entropy);
    });

    it("should produce higher entropy with longer passwords", () => {
      const short = calculateGeneratorEntropy(94, 8);
      const long = calculateGeneratorEntropy(94, 32);
      expect(long.entropy).toBeGreaterThan(short.entropy);
    });

    it("should have entropy as a rounded decimal", () => {
      const result = calculateGeneratorEntropy(94, 16);
      expect(result.entropy).toBe(Math.round(result.entropy * 10) / 10);
    });
  });
});
