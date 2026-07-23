import { calculateEntropy } from "@/services/password/entropy-calculator.service";

describe("EntropyCalculator", () => {
  it("should return 0 bits for empty string", () => {
    const result = calculateEntropy("");
    expect(result.bits).toBe(0);
    expect(result.poolSize).toBe(0);
  });

  it("should calculate entropy for lowercase only", () => {
    const result = calculateEntropy("abcdef");
    expect(result.poolSize).toBe(26);
    expect(result.bits).toBe(parseFloat((Math.log2(26) * 6).toFixed(1)));
  });

  it("should calculate entropy for mixed case", () => {
    const result = calculateEntropy("AbCdEf");
    expect(result.poolSize).toBe(52);
    expect(result.bits).toBe(parseFloat((Math.log2(52) * 6).toFixed(1)));
  });

  it("should calculate entropy for alphanumeric", () => {
    const result = calculateEntropy("AbCd12");
    expect(result.poolSize).toBe(62);
  });

  it("should calculate entropy for full charset", () => {
    const result = calculateEntropy("Ab1!");
    expect(result.poolSize).toBe(94);
  });

  it("should produce higher entropy for longer passwords", () => {
    const short = calculateEntropy("abc");
    const long = calculateEntropy("abcdef");
    expect(long.bits).toBeGreaterThan(short.bits);
  });

  it("should produce higher entropy for larger pool sizes", () => {
    const lower = calculateEntropy("aaa");
    const mixed = calculateEntropy("Aa!");
    expect(mixed.bits).toBeGreaterThan(lower.bits);
  });

  it("should return valid algorithm description", () => {
    const result = calculateEntropy("test");
    expect(result.algorithm).toContain("Shannon entropy");
    expect(result.searchSpace).toContain("2^");
  });
});
