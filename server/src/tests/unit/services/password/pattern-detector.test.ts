import { detectPatterns } from "@/services/password/pattern-detector.service";

describe("PatternDetector", () => {
  it("should detect keyboard patterns", () => {
    const result = detectPatterns("qwerty123");
    expect(result.keyboardPattern).toBe(true);
  });

  it("should detect sequential patterns", () => {
    const result = detectPatterns("abcdef");
    expect(result.sequence).toBe(true);
  });

  it("should detect repeated words", () => {
    const result = detectPatterns("hello-hello");
    expect(result.repeated).toBe(true);
  });

  it("should not flag strong unique password", () => {
    const result = detectPatterns("Xk9#mP2$vL7nQ!4w");
    expect(result.keyboardPattern).toBe(false);
    expect(result.sequence).toBe(false);
    expect(result.repeated).toBe(false);
  });

  it("should detect multiple pattern types", () => {
    const result = detectPatterns("qwerty123456");
    expect(result.keyboardPattern).toBe(true);
    expect(result.sequence).toBe(true);
  });

  it("should handle empty string", () => {
    const result = detectPatterns("");
    expect(result.keyboardPattern).toBe(false);
    expect(result.sequence).toBe(false);
    expect(result.repeated).toBe(false);
  });
});
