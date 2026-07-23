import { detectKeyboardPattern } from "@/services/password/keyboard-pattern-detector.service";

describe("KeyboardPatternDetector", () => {
  it("should detect 'qwerty'", () => {
    const result = detectKeyboardPattern("qwerty");
    expect(result.found).toBe(true);
    expect(result.patterns.length).toBeGreaterThan(0);
  });

  it("should detect 'asdfgh'", () => {
    const result = detectKeyboardPattern("asdfgh");
    expect(result.found).toBe(true);
  });

  it("should detect 'zxcvbn'", () => {
    const result = detectKeyboardPattern("zxcvbn");
    expect(result.found).toBe(true);
  });

  it("should detect reversed patterns", () => {
    const result = detectKeyboardPattern("ytrewq");
    expect(result.found).toBe(true);
  });

  it("should be case insensitive", () => {
    const result = detectKeyboardPattern("QWERTY");
    expect(result.found).toBe(true);
  });

  it("should detect patterns within longer passwords", () => {
    const result = detectKeyboardPattern("xxqwertyxx");
    expect(result.found).toBe(true);
  });

  it("should not flag a normal password", () => {
    const result = detectKeyboardPattern("Tr0ub4dor&3");
    expect(result.found).toBe(false);
  });

  it("should not flag short strings", () => {
    const result = detectKeyboardPattern("abc");
    expect(result.found).toBe(false);
  });
});
