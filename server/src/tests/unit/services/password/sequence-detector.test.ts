import { detectSequence } from "@/services/password/sequence-detector.service";

describe("SequenceDetector", () => {
  it("should detect 'abcdef'", () => {
    const result = detectSequence("abcdef");
    expect(result.found).toBe(true);
    expect(result.types).toContain("sequential");
  });

  it("should detect '123456'", () => {
    const result = detectSequence("123456");
    expect(result.found).toBe(true);
    expect(result.types).toContain("sequential");
  });

  it("should detect '654321'", () => {
    const result = detectSequence("654321");
    expect(result.found).toBe(true);
    expect(result.types).toContain("sequential");
  });

  it("should detect repeated chars 'aaaaaa'", () => {
    const result = detectSequence("aaaaaa");
    expect(result.found).toBe(true);
    expect(result.types).toContain("repeated");
  });

  it("should detect repeated chars '111111'", () => {
    const result = detectSequence("111111");
    expect(result.found).toBe(true);
  });

  it("should detect repeated substring 'ababab'", () => {
    const result = detectSequence("ababab");
    expect(result.found).toBe(true);
    expect(result.types).toContain("repeatedSubstring");
  });

  it("should detect date pattern '20230101'", () => {
    const result = detectSequence("20230101");
    expect(result.found).toBe(true);
    expect(result.types).toContain("date");
  });

  it("should not flag 'Tr0ub4dor&3'", () => {
    const result = detectSequence("Tr0ub4dor&3");
    expect(result.found).toBe(false);
  });

  it("should not flag 'correct-horse-battery-staple'", () => {
    const result = detectSequence("correct-horse-battery-staple");
    expect(result.found).toBe(false);
  });

  it("should handle short strings", () => {
    const result = detectSequence("ab");
    expect(result.found).toBe(false);
  });
});
