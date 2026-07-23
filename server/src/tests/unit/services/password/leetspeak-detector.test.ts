import { detectLeetspeak } from "@/services/password/leetspeak-detector.service";

describe("LeetspeakDetector", () => {
  it("should normalize 'P@ssw0rd' to 'password'", () => {
    const result = detectLeetspeak("P@ssw0rd");
    expect(result.normalized).toBe("password");
    expect(result.isLeet).toBe(true);
  });

  it("should normalize 'Adm1n' to 'admin'", () => {
    const result = detectLeetspeak("Adm1n");
    expect(result.normalized).toBe("admin");
    expect(result.isLeet).toBe(true);
  });

  it("should normalize 'h3ll0' to 'hello'", () => {
    const result = detectLeetspeak("h3ll0");
    expect(result.normalized).toBe("hello");
    expect(result.isLeet).toBe(true);
  });

  it("should normalize 'p@$$w0rd' to 'password'", () => {
    const result = detectLeetspeak("p@$$w0rd");
    expect(result.normalized).toBe("password");
    expect(result.isLeet).toBe(true);
  });

  it("should not flag a normal password", () => {
    const result = detectLeetspeak("hello");
    expect(result.isLeet).toBe(false);
    expect(result.normalized).toBe("hello");
  });

  it("should handle empty string", () => {
    const result = detectLeetspeak("");
    expect(result.normalized).toBe("");
    expect(result.isLeet).toBe(false);
  });

  it("should normalize mixed case with leet", () => {
    const result = detectLeetspeak("L33tSp34k");
    expect(result.isLeet).toBe(true);
    expect(result.normalized).toBe("leetspeak");
  });
});
